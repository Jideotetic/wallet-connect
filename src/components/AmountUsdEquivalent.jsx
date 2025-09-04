import * as React from "react";
import { useEffect, useMemo, useState } from "react";

import { getNativePrices } from "api/amm";

import { formatBalance } from "helpers/format-number";

import { StellarService } from "services/globalServices";

import { CiWarning } from "react-icons/ci";

import Tooltip from "./Tooltip";
import { TOOLTIP_POSITION } from "constants/tool-tip";

const AmountUsdEquivalent = ({ amount, asset, sourceAmount, sourceAsset }) => {
	const [price, setPrice] = useState(null);
	const [priceSource, setPriceSource] = useState(null);

	useEffect(() => {
		setPrice(null);

		if (!amount || !asset) {
			return;
		}

		getNativePrices().then((res) => {
			setPrice(res.has(asset.contract) ? res.get(asset.contract).price : null);
			if (sourceAsset) {
				setPriceSource(
					res.has(sourceAsset.contract)
						? res.get(sourceAsset.contract).price
						: null
				);
			}
		});
	}, [amount, asset, sourceAsset]);

	const percent = useMemo(() => {
		if (!price || !priceSource) {
			return null;
		}

		const result = (
			((Number(amount) * price) / (Number(sourceAmount) * priceSource) - 1) *
			100
		).toFixed(1);

		return result === "-0.0" ? "0.0" : result;
	}, [price, priceSource, amount, sourceAmount]);

	if (!amount || !price || (sourceAsset && !priceSource)) {
		return (
			<div className="flex items-center text-[#6B6C83] max-w-2xs h-7">
				<span className="text-2xl">$0</span>
			</div>
		);
	}

	return (
		<div className="flex items-center text-[#6B6C83] max-w-2xs h-7">
			<span className="text-2xl">
				$
				{formatBalance(
					+(
						Number(amount) *
						Number(price) *
						StellarService.priceLumenUsd
					).toFixed(2),
					true
				)}
			</span>

			{percent && Number.isFinite(+percent) ? (
				<div
					className={`flex items-center ml-1 ${
						Number(percent) > 0
							? "text-green-300"
							: Number(percent) <= -10
							? "text-red-400"
							: "text-gray-400"
					}`}
				>
					({Number(percent) > 0 ? "+" : ""}
					{percent}%)
					{Number(percent) <= -10 ? (
						<Tooltip
							showOnHover
							content={
								<p className="text-sm">
									Swapping these tokens in the submitted amount will create a
									significant price impact misbalancing one or more pool ratios
									and thus reducing your outcome.
								</p>
							}
							position={TOOLTIP_POSITION.bottom}
						>
							<CiWarning />
						</Tooltip>
					) : null}
				</div>
			) : null}
		</div>
	);
};

export default AmountUsdEquivalent;
