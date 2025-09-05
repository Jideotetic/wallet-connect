import * as React from "react";
import { Link, useNavigate } from "react-router-dom";

import { POOL_TYPE } from "constants/amm";
import { AmmRoutes, MarketRoutes } from "constants/routes";

import { getAssetString } from "helpers/assets";
import { getIsTestnetEnv } from "helpers/env";
import { formatBalance } from "helpers/format-number";

import { LumenInfo } from "store/assetsStore/reducer";
import useAssetsStore from "store/assetsStore/useAssetsStore";

import { ModalService } from "services/globalServices";

import { TokenType } from "types/token";

import AssetInfoModal from "./AssetInfoModal";

import { FaLongArrowAltRight } from "react-icons/fa";

import ApyTier from "./ApyTier";
import AssetLogo from "./AssetLogo";
import {
	AmmBribesLabel,
	AuthRequiredLabel,
	BoostLabel,
	ClassicPoolLabel,
	ConstantPoolLabel,
	FeeLabel,
	MaxRewardsLabel,
	NoLiquidityLabel,
	PrivateBribesLabel,
	RewardLabel,
	StablePoolLabel,
} from "./Labels";

const viewOnStellarX = (event, assets) => {
	const [base, counter] = assets;
	event.preventDefault();
	event.stopPropagation();
	window.open(
		`https://stellarx.com/markets/${getAssetString(counter)}/${getAssetString(
			base
		)}`,
		"_blank"
	);
};

const Market = ({
	assets,
	withoutDomains,
	isRewardsOn,
	authRequired,
	noLiquidity,
	isAmmBribes,
	isPrivateBribes,
	boosted,
	bottomLabels,
	isBigLogo,
	isCircleLogos,
	withoutLink,
	isMaxRewards,
	withMarketLink,
	amounts,
	isSwapResult,
	// poolAddress - click to pool page
	poolAddress,
	poolType,
	fee,
	apyTier,
}) => {
	const { assetsInfo } = useAssetsStore();
	const navigate = useNavigate();

	const getAssetDetails = (asset) => {
		if (asset.type === TokenType.soroban) {
			return [asset.name, "soroban token"];
		}
		if (asset?.isNative?.()) {
			return [LumenInfo.name, LumenInfo.home_domain];
		}

		const { name, home_domain } = assetsInfo.get(getAssetString(asset)) || {};

		return [
			name || asset.code,
			home_domain || `${asset.issuer.slice(0, 4)}...${asset.issuer.slice(-4)}`,
		];
	};

	const labels = (
		<>
			{poolType === POOL_TYPE.classic && <ClassicPoolLabel />}
			{poolType === POOL_TYPE.stable && <StablePoolLabel />}
			{poolType === POOL_TYPE.constant && <ConstantPoolLabel />}
			{boosted && <BoostLabel />}
			{isRewardsOn && <RewardLabel />}
			{isMaxRewards && <MaxRewardsLabel />}
			{authRequired && <AuthRequiredLabel />}
			{noLiquidity && <NoLiquidityLabel />}
			{isAmmBribes && <AmmBribesLabel />}
			{isPrivateBribes && <PrivateBribesLabel />}
			{fee && <FeeLabel fee={fee} />}
			<ApyTier apyTier={apyTier} />
		</>
	);

	const onDomainClick = (e, asset) => {
		e.preventDefault();
		e.stopPropagation();

		if (asset.type === TokenType.soroban) {
			window.open(
				`https://stellar.expert/explorer/${
					getIsTestnetEnv() ? "testnet" : "public"
				}/contract/${asset.contract}`,
				"_blank"
			);
			return;
		}

		ModalService.openModal(AssetInfoModal, { asset });
	};

	return (
		<div
			onClick={() => {
				if (poolAddress) {
					navigate.push(`${AmmRoutes.analytics}${poolAddress}/`);
				}
			}}
		>
			<div className="flex justify-center items-center gap-2">
				{assets.reduce((acc, asset, index) => {
					const assetKey = getAssetString(asset);

					if (index > 0) {
						acc.push(
							<span key={`arrow-${index}`} className="text-gray-500">
								→
							</span>
						);
					}

					acc.push(
						<div key={assetKey}>
							<AssetLogo
								asset={asset}
								isBig={isBigLogo}
								isCircle={isCircleLogos}
							/>
						</div>
					);

					return acc;
				}, [])}
			</div>

			<div className="flex flex-col items-center justify-center mt-2">
				<div className="flex items-center font-bold mb-2">
					<span className="flex items-center gap-1">
						{assets.map((asset, index) => (
							<React.Fragment key={getAssetString(asset)}>
								{index > 0 ? (
									isSwapResult ? (
										<FaLongArrowAltRight />
									) : (
										" / "
									)
								) : (
									""
								)}
								{amounts ? `${formatBalance(Number(amounts[index]))} ` : ""}
								{asset.code}
							</React.Fragment>
						))}
					</span>

					{!bottomLabels && labels}

					{!withoutLink && (
						<div
							className="flex cursor-pointer items-center justify-center"
							onClick={(e) => viewOnStellarX(e, assets)}
						>
							<FaLongArrowAltRight />
						</div>
					)}
					{withMarketLink && (
						<Link
							className="cursor-pointer"
							onClick={(e) => {
								e.stopPropagation();
							}}
							to={`${MarketRoutes.main}/${getAssetString(
								assets[0]
							)}/${getAssetString(assets[1])}`}
						>
							<FaLongArrowAltRight />
						</Link>
					)}
				</div>
				{!withoutDomains && (
					<div className="text-center">
						{assets.map((asset, index) => {
							const [name, domain] = getAssetDetails(asset);
							return (
								<span key={getAssetString(asset)}>
									{index > 0 ? " · " : ""}
									{name} (
									{asset?.isNative?.() ? (
										domain
									) : (
										<span
											className="cursor-pointer"
											onClick={(e) => onDomainClick(e, asset)}
										>
											{domain}
										</span>
									)}
									)
								</span>
							);
						})}
					</div>
				)}
				{bottomLabels && <div className="flex mt-2">{labels}</div>}
			</div>
		</div>
	);
};

export default Market;
