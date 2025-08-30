import BigNumber from "bignumber.js";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { NumericFormat } from "react-number-format";
import styled from "styled-components";

import { formatBalance } from "helpers/format-number";

import useAuthStore from "store/authStore/useAuthStore";

import { TokenType } from "types/token";

import { respondDown, textEllipsis } from "web/mixins";
import { Breakpoints, COLORS } from "web/styles";

import Info from "assets/icon-info.svg";

import AssetPicker from "./AssetPicker";
import BlankInput from "./inputs/BlankInput";
import DotsLoader from "./loaders/DotsLoader";
import Tooltip from "./Tooltip";
import PercentButtons from "./PercentButtons";

import { TOOLTIP_POSITION } from "constants/tool-tip";

const Balance = styled.div`
	font-size: 1.4rem;
	line-height: 1.6rem;
	color: ${COLORS.grayText};
	display: inline-flex;
	align-items: center;
	white-space: nowrap;
	width: 100%;

	svg {
		margin-left: 0.4rem;
	}
`;

const BalanceLabel = styled.span`
	text-align: right;
	${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const BalanceClickable = styled.span`
	cursor: pointer;

	&:hover {
		color: ${COLORS.titleText};
	}
`;

const BalanceValue = styled.span`
	width: 100%;
	${textEllipsis};
	text-align: right;
`;

const TooltipInner = styled.div`
	display: flex;
	flex-direction: column;
	color: ${COLORS.white};
	font-size: 1.2rem;
	line-height: 2rem;
`;

const TooltipRow = styled.div`
	display: flex;
	justify-content: space-between;
	gap: 1.2rem;

	&:last-child:not(:first-child) {
		font-weight: 700;
	}
`;

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
		<div className="flex items-center bg-[#FAFAFB] rounded-2xl p-8">
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

			<div>
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
					<Balance>
						<BalanceValue>
							<BalanceLabel>
								{isBase ? "Available: " : "Balance: "}
							</BalanceLabel>
							{isBase ? (
								<BalanceClickable onClick={() => setPercent(100)}>
									{asset.type === TokenType.soroban
										? Number(balance).toFixed(asset.decimal)
										: formatBalance(account.getAvailableForSwapBalance(asset))}
								</BalanceClickable>
							) : (
								formatBalance(balance, true)
							)}
						</BalanceValue>
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
									<TooltipInner>
										{assetReserves ? (
											assetReserves.map(({ label, value }) => (
												<TooltipRow key={label}>
													<span>{label}</span>
													<span>
														{value} {asset.code}
													</span>
												</TooltipRow>
											))
										) : (
											<DotsLoader />
										)}
									</TooltipInner>
								}
							>
								<Info />
							</Tooltip>
						)}
					</Balance>
				)}
			</div>
		</div>
	);
};

export default SwapFormRow;
