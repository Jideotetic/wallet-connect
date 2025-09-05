import * as StellarSdk from "@stellar/stellar-sdk";

import * as React from "react";
import { useEffect, useState } from "react";

import { getPathPoolsFee } from "api/amm";

import { formatBalance } from "helpers/format-number";
import { openCurrentWalletIfExist } from "helpers/wallet-connect-helpers";

import { LoginTypes } from "store/authStore/types";
import useAuthStore from "store/authStore/useAuthStore";

import {
	ModalService,
	SorobanService,
	ToastService,
} from "services/globalServices";
import { BuildSignAndSubmitStatuses } from "services/wallet-connect.service";

import { TokenType } from "types/token";

import AssetLogo from "./AssetLogo";
import DotsLoader from "./loaders/DotsLoader";
import PageLoader from "./loaders/PageLoader";
import Market from "./Market";

import PathPool from "../web/components/SwapConfirmModal/PathPool/PathPool";

import SuccessModal from "./SuccessModal";
import { SWAP_SLIPPAGE_ALIAS } from "./SwapSettingsModal";

const STROOP = 0.0000001;

const SwapConfirmModal = ({ params, confirm }) => {
	const {
		base,
		counter,
		baseAmount,
		counterAmount,
		bestPathXDR,
		bestPath,
		bestPools,
		isSend,
	} = params;
	const [fees, setFees] = useState(null);
	const [swapPending, setSwapPending] = useState(false);
	const [txFee, setTxFee] = useState(null);
	const [pathTokens, setPathTokens] = useState(null);

	const { account } = useAuthStore();

	useEffect(() => {
		Promise.all(
			bestPath.map((str) => SorobanService.token.parseTokenContractId(str))
		).then((res) => {
			setPathTokens(res);
		});
	}, [bestPath]);

	useEffect(() => {
		getPathPoolsFee(bestPools)
			.then((res) => {
				setFees(res);
			})
			.catch(() => {
				setFees(0);
			});
	}, [bestPools]);

	useEffect(() => {
		const SLIPPAGE = localStorage.getItem(SWAP_SLIPPAGE_ALIAS) || "1"; // 1%
		const minAmount = isSend
			? ((1 - Number(SLIPPAGE) / 100) * Number(counterAmount)).toFixed(
					counter.decimal ?? 7
			  )
			: ((1 + Number(SLIPPAGE) / 100) * Number(baseAmount)).toFixed(
					base.decimal ?? 7
			  );
		SorobanService.amm
			.getSwapChainedTx(
				account?.accountId(),
				base,
				counter,
				bestPathXDR,
				isSend ? baseAmount : counterAmount,
				minAmount,
				isSend
			)
			.then((res) => {
				SorobanService.connection.simulateTx(res).then(({ minResourceFee }) => {
					setTxFee(minResourceFee);
				});
			});
	}, [account, base, baseAmount, bestPathXDR, counter, counterAmount, isSend]);

	const swap = () => {
		if (account.authType === LoginTypes.walletConnect) {
			openCurrentWalletIfExist();
		}
		setSwapPending(true);
		const SLIPPAGE = localStorage.getItem(SWAP_SLIPPAGE_ALIAS) || "1"; // 1%

		const minAmount = isSend
			? ((1 - Number(SLIPPAGE) / 100) * Number(counterAmount)).toFixed(
					counter.decimal ?? 7
			  )
			: ((1 + Number(SLIPPAGE) / 100) * Number(baseAmount)).toFixed(
					base.decimal ?? 7
			  );

		let hash;

		SorobanService.amm
			.getSwapChainedTx(
				account?.accountId(),
				base,
				counter,
				bestPathXDR,
				isSend ? baseAmount : counterAmount,
				minAmount,
				isSend
			)
			.then((tx) => {
				hash = tx.hash().toString("hex");
				return account.signAndSubmitTx(tx, true);
			})
			.then((res) => {
				confirm();

				if (!res) {
					return;
				}

				if (res.status === BuildSignAndSubmitStatuses.pending) {
					ToastService.showSuccessToast("More signatures required to complete");
					return;
				}

				const sentAmount = isSend
					? baseAmount
					: SorobanService.scVal.i128ToInt(res, base.decimal);
				const receivedAmount = isSend
					? SorobanService.scVal.i128ToInt(res, counter.decimal)
					: counterAmount;

				ModalService.openModal(SuccessModal, {
					assets: [base, counter],
					amounts: [sentAmount, receivedAmount],
					title: "Swap Successful",
					isSwap: true,
					hash,
				});

				if (base.type === TokenType.soroban) {
					ToastService.showSuccessToast(
						`Payment sent: ${formatBalance(Number(sentAmount))} ${base.code}`
					);
				}

				if (counter.type === TokenType.soroban) {
					ToastService.showSuccessToast(
						`Payment received: ${formatBalance(Number(receivedAmount))} ${
							counter.code
						}`
					);
				}
				setSwapPending(false);
			})
			.catch((e) => {
				const errorMessage =
					e.message ?? e.toString() ?? "Oops! Something went wrong";

				ToastService.showErrorToast(
					errorMessage === "The amount is too small to deposit to this pool"
						? "Price expired, please submit a swap again"
						: errorMessage
				);
				setSwapPending(false);
			});
	};

	return (
		<div className="overflow-y-auto h-full">
			<h1 className="mb-4 text-2xl">Confirm swap</h1>
			<p className="mb-2">Please check all the details to make a swap</p>
			<div className="flex items-center justify-center rounded-md py-10 px-2 bg-gray-100">
				<Market verticalDirections assets={[base, counter]} />
			</div>
			<div className="flex justify-between mt-2">
				<span className="text-gray-400">You give</span>
				<span>
					{formatBalance(Number(baseAmount))} {base.code}
				</span>
			</div>
			<div className="flex justify-between mt-2">
				<span className="text-gray-400">You get (estimate)</span>
				<span>
					{formatBalance(Number(counterAmount))} {counter.code}
				</span>
			</div>
			<div className="flex justify-between mt-2">
				<span className="text-gray-400">Exchange rate</span>
				<span>
					1 {base.code} ={" "}
					{formatBalance(
						+(+counterAmount / +baseAmount).toFixed(
							counter.type === TokenType.soroban ? counter.decimal : 7
						)
					)}{" "}
					{counter.code}
				</span>
			</div>

			<div className="flex justify-between mt-2">
				<span className="text-gray-400">Maximum transaction fee:</span>
				<span>
					{txFee !== null ? (
						`${formatBalance(
							+(STROOP * (Number(txFee) + Number(StellarSdk.BASE_FEE))).toFixed(
								7
							)
						)} XLM`
					) : (
						<DotsLoader />
					)}
				</span>
			</div>

			<div className="flex justify-between mt-2">
				<span className="text-gray-400">Pools:</span>
				<span />
			</div>

			{!fees || !pathTokens ? (
				<PageLoader />
			) : (
				<div className="flex items-start flex-wrap gap-1 mb-2">
					{bestPools.map((pool, index) => {
						const base = pathTokens[index];
						const counter = pathTokens[index + 1];
						return (
							<PathPool
								key={pool}
								baseIcon={<AssetLogo asset={base} />}
								counterIcon={<AssetLogo asset={counter} />}
								fee={fees.get(pool)}
								address={pool}
								isLastPool={index === bestPools.length - 1}
							/>
						);
					})}
				</div>
			)}

			<button
				className="bg-[#0F172A] my-6 font-semibold w-full p-4 text-white rounded-full cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
				disabled={swapPending}
				onClick={() => swap()}
			>
				Confirm Swap
			</button>
		</div>
	);
};

export default SwapConfirmModal;
