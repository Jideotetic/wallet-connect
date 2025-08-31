import * as React from "react";
import { useEffect, useState } from "react";

import { findSwapPath } from "api/amm";

import { contractValueToAmount } from "helpers/amount";

import { useDebounce } from "hooks/useDebounce";

import useAuthStore from "store/authStore/useAuthStore";

import { ModalService } from "services/globalServices";

import { TokenType } from "types/token";

import NoTrustline from "./NoTrustline";
import Price from "./Price";
import SwapSettingsModal, { SWAP_SLIPPAGE_ALIAS } from "./SwapSettingsModal";
import AmountUsdEquivalent from "./AmountUsdEquivalent";
import SwapFormDivider from "./SwapFormDivider";
import SwapFormRow from "./SwapFormRow";
import SwapConfirmModal from "./SwapConfirmModal";
import ChooseLoginMethodModal from "./ChooseLoginMethodModal";

const SwapForm = ({
	base,
	counter,
	setBase,
	setCounter,
	isEmbedded,
	assetsList,
}) => {
	const [hasError, setHasError] = useState(false);

	const [baseAmount, setBaseAmount] = useState("");
	const [counterAmount, setCounterAmount] = useState("");
	const [bestPathXDR, setBestPathXDR] = useState(null);
	const [bestPath, setBestPath] = useState(null);
	const [bestPools, setBestPools] = useState(null);
	const [estimatePending, setEstimatePending] = useState(false);
	const [isSend, setIsSend] = useState(true);

	const [baseBalance, setBaseBalance] = useState(null);
	const [counterBalance, setCounterBalance] = useState(null);

	const [isPriceReverted, setIsPriceReverted] = useState(false);

	const debouncedBaseAmount = useDebounce(baseAmount, 700);
	const debouncedCounterAmount = useDebounce(counterAmount, 700);

	const { account, isLogged } = useAuthStore();

	useEffect(() => {
		if (!account) {
			setBaseBalance(null);
			setCounterBalance(null);
			return;
		}

		if (base.type === TokenType.classic) {
			setBaseBalance(account.getAssetBalance(base));
		} else {
			account.getAssetBalance(base).then((res) => {
				setBaseBalance(res);
			});
		}

		if (counter.type === TokenType.classic) {
			setCounterBalance(account.getAssetBalance(counter));
		} else {
			account.getAssetBalance(counter).then((res) => {
				setCounterBalance(res);
			});
		}
	}, [account, base, counter]);

	useEffect(() => {
		if (debouncedCounterAmount.current) {
			return;
		}
		if (Number(debouncedBaseAmount.current)) {
			setEstimatePending(true);
			setIsSend(true);

			findSwapPath(
				base.contract,
				counter.contract,
				debouncedBaseAmount.current,
				true,
				base.decimal ?? 7
			)
				.then((res) => {
					if (!res.success) {
						setHasError(true);
						setCounterAmount("");
						setEstimatePending(false);
					} else {
						setHasError(false);
						setEstimatePending(false);
						if (!baseAmount) {
							return;
						}
						setCounterAmount(
							contractValueToAmount(res.amount, counter.decimal)
						);
						setBestPathXDR(res.swap_chain_xdr);
						setBestPath(res.tokens_addresses);
						setBestPools(res.pools);
					}
				})
				.catch(() => {
					setHasError(true);
					setEstimatePending(false);
				});
		} else {
			setBestPathXDR(null);
			setBestPath(null);
			setBestPools(null);
			setCounterAmount("");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedBaseAmount]);

	useEffect(() => {
		if (debouncedBaseAmount.current) {
			return;
		}
		if (Number(debouncedCounterAmount.current)) {
			setEstimatePending(true);
			setIsSend(false);

			findSwapPath(
				base.contract,
				counter.contract,
				debouncedCounterAmount.current,
				false,
				counter.decimal ?? 7
			)
				.then((res) => {
					if (!res.success) {
						setHasError(true);
						setBaseAmount("");
						setEstimatePending(false);
					} else {
						setHasError(false);
						setEstimatePending(false);
						if (!counterAmount) {
							return;
						}
						setBaseAmount(contractValueToAmount(res.amount, base.decimal));
						setBestPathXDR(res.swap_chain_xdr);
						setBestPath(res.tokens_addresses);
						setBestPools(res.pools);
					}
				})
				.catch(() => {
					setHasError(true);
					setEstimatePending(false);
				});
		} else {
			setBestPathXDR(null);
			setBestPath(null);
			setBestPools(null);
			setBaseAmount("");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedCounterAmount]);

	useEffect(() => {
		if ((isSend && !baseAmount) || (!isSend && !counterAmount)) {
			return;
		}
		setEstimatePending(true);

		findSwapPath(
			base.contract,
			counter.contract,
			isSend ? baseAmount : counterAmount,
			isSend,
			(isSend ? base.decimal : counter.decimal) ?? 7
		)
			.then((res) => {
				if (!res.success) {
					setHasError(true);
					if (isSend) {
						setCounterAmount("");
					} else {
						setBaseAmount("");
					}
					setEstimatePending(false);
				} else {
					setHasError(false);
					setEstimatePending(false);

					const amount = contractValueToAmount(
						res.amount,
						isSend ? counter.decimal : base.decimal
					);

					if (isSend) {
						setCounterAmount(amount);
					} else {
						setBaseAmount(amount);
					}
					setBestPathXDR(res.swap_chain_xdr);
					setBestPath(res.tokens_addresses);
					setBestPools(res.pools);
				}
			})
			.catch(() => {
				setHasError(true);
				setEstimatePending(false);
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [base, counter]);

	const swapAssets = () => {
		if (!isLogged) {
			return ModalService.openModal(ChooseLoginMethodModal, {});
		}
		if (!counterAmount || !baseAmount) {
			return;
		}
		ModalService.openModal(SwapConfirmModal, {
			base,
			counter,
			baseAmount,
			counterAmount,
			bestPathXDR,
			bestPath,
			bestPools,
			isSend,
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				setBaseAmount("");
				setCounterAmount("");
				setBestPathXDR(null);
				setBestPath(null);
				setBestPools(null);
				setIsPriceReverted(false);
			}
		});
	};

	const onAmountChange = (value, isBase) => {
		if (isBase) {
			setBaseAmount(value);
		} else {
			setCounterAmount(value);
		}
	};

	const resetAmount = (isBase) => {
		if (isBase) {
			setCounterAmount("");
		} else {
			setBaseAmount("");
		}
	};

	const revertAssets = () => {
		const temp = base;
		setBase(counter);
		setCounter(temp);
		setBaseAmount(counterAmount ?? "");
		setCounterAmount("");
		setBestPathXDR(null);
		setBestPath(null);
		setBestPools(null);
		setIsPriceReverted(false);
	};

	const SLIPPAGE = localStorage.getItem(SWAP_SLIPPAGE_ALIAS) || "1"; // 1%

	const isInsufficient = isSend
		? Number(baseAmount) >
		  (base.type === TokenType.soroban
				? baseBalance
				: account?.getAvailableForSwapBalance(base))
		: (1 + Number(SLIPPAGE) / 100) * Number(baseAmount) >
		  (base.type === TokenType.soroban
				? baseBalance
				: account?.getAvailableForSwapBalance(base));

	const getButtonText = () => {
		if (hasError) {
			return "No exchange paths available";
		}
		if (!isLogged) {
			return "Connect wallet";
		}
		if (!baseAmount) {
			return "Enter amount";
		}

		if (account && isInsufficient) {
			return "Insufficient balance";
		}

		return "Swap assets";
	};

	return (
		<div className="bg-white p-6 rounded-4xl space-y-4">
			<div className="flex flex-col gap-2 relative">
				<SwapFormRow
					isBase
					asset={base}
					setAsset={setBase}
					balance={baseBalance}
					amount={baseAmount}
					setAmount={(value) => onAmountChange(value, true)}
					resetAmount={() => resetAmount(true)}
					assetsList={assetsList}
					usdEquivalent={
						<AmountUsdEquivalent
							amount={debouncedBaseAmount.current}
							asset={base}
						/>
					}
					isEmbedded={isEmbedded}
				/>

				<SwapFormDivider pending={estimatePending} onRevert={revertAssets} />

				<SwapFormRow
					asset={counter}
					setAsset={setCounter}
					amount={counterAmount}
					balance={counterBalance}
					assetsList={assetsList}
					setAmount={(value) => onAmountChange(value, false)}
					resetAmount={() => resetAmount(false)}
					usdEquivalent={
						<AmountUsdEquivalent
							amount={counterAmount}
							asset={counter}
							sourceAmount={baseAmount}
							sourceAsset={base}
						/>
					}
					isEmbedded={isEmbedded}
				/>
			</div>

			<Price
				base={base}
				baseAmount={baseAmount}
				counter={counter}
				counterAmount={counterAmount}
				isReverted={isPriceReverted}
				setIsReverted={setIsPriceReverted}
				pending={estimatePending}
				hasError={hasError}
			/>

			<NoTrustline asset={counter} isRounded />

			<button
				className="bg-green-400 w-full p-2 text-white rounded-xl cursor-pointer"
				disabled={
					hasError ||
					(account && isInsufficient) ||
					(isLogged &&
						(estimatePending ||
							!counterAmount ||
							(account && counterBalance === null) ||
							(account && baseBalance === null)))
				}
				onClick={() => swapAssets()}
			>
				{getButtonText()}
			</button>
		</div>
	);
};

export default SwapForm;
