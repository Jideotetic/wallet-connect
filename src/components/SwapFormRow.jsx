import BigNumber from "bignumber.js";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { NumericFormat } from "react-number-format";

import { formatBalance } from "helpers/format-number";

import useAuthStore from "store/authStore/useAuthStore";

import { TokenType } from "types/token";

import { COLORS } from "web/styles";

import AssetPicker from "./AssetPicker";
import BlankInput from "./inputs/BlankInput";
import DotsLoader from "./loaders/DotsLoader";
import Tooltip from "./Tooltip";
import PercentButtons from "./PercentButtons";

import { TOOLTIP_POSITION } from "constants/tool-tip";
import { IoIosInformationCircleOutline } from "react-icons/io";

const SwapFormRow = ({
	isBase,
	asset,
	setAsset,
	balance,
	amount,
	setAmount,
	usdEquivalent,
	assetsList,
	resetAmount,
}) => {
	const { account } = useAuthStore();
	const [assetReserves, setAssetReserves] = useState(null);
	const inputRef = useRef(null);

	useEffect(() => {
		if (isBase && inputRef.current) {
			inputRef.current?.focus();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!account) {
			setAssetReserves(null);
			return;
		}
		account.getReservesForSwap(asset).then((res) => {
			setAssetReserves(res);
		});
	}, [account, asset]);

	const setPercent = (percent) => {
		resetAmount();
		const available =
			asset.type === TokenType.soroban
				? balance
				: account.getAvailableForSwapBalance(asset);

		const result = new BigNumber(available)
			.times(percent)
			.div(100)
			.toFixed(asset.decimal ?? 7);

		setAmount(result);
	};

	return (
		<div className="flex items-center justify-between bg-white rounded-md p-4 border border-gray-200">
			<div className="flex flex-col">
				<span>{isBase ? "Sell" : "Buy"}</span>
				<NumericFormat
					placeholder="0"
					customInput={BlankInput}
					allowedDecimalSeparators={[","]}
					thousandSeparator=","
					decimalScale={asset.decimal ?? 7}
					value={amount}
					onChange={() => resetAmount()}
					onValueChange={(value) => setAmount(value.value)}
					getInputRef={inputRef}
					inputMode="decimal"
					allowNegative={false}
				/>
				{usdEquivalent}
			</div>

			<div className="space-y-1 shrink-0">
				{isBase ? (
					<PercentButtons setPercent={setPercent} />
				) : (
					<div style={{ height: "1.8rem" }} />
				)}
				<AssetPicker
					asset={asset}
					onUpdate={setAsset}
					assetsList={assetsList}
				/>
				{balance !== null && Boolean(account) && (
					<div className="flex items-center w-fit ml-auto">
						<div className="flex items-center text-gray-500">
							<div>{isBase ? "Available: " : "Balance: "}</div>
							{isBase ? (
								<div
									className="cursor-pointer text-gray-500"
									onClick={() => setPercent(100)}
								>
									{asset.type === TokenType.soroban
										? Number(balance).toFixed(asset.decimal)
										: formatBalance(account.getAvailableForSwapBalance(asset))}
								</div>
							) : (
								formatBalance(balance, true)
							)}
						</div>
						{isBase && (
							<Tooltip
								showOnHover
								background={COLORS.titleText}
								position={
									+window.innerWidth < 1200
										? TOOLTIP_POSITION.left
										: TOOLTIP_POSITION.right
								}
								content={
									<div className="flex flex-col text-gray-600 gap-1">
										{assetReserves ? (
											assetReserves.map(({ label, value }) => (
												<div className="flex justify-between gap-4" key={label}>
													<span>{label}</span>
													<span>
														{value} {asset.code}
													</span>
												</div>
											))
										) : (
											<DotsLoader />
										)}
									</div>
								}
							>
								<IoIosInformationCircleOutline />
							</Tooltip>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default SwapFormRow;
