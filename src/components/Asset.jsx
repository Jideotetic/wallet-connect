import * as React from "react";
import { useMemo } from "react";
import styled from "styled-components";

import { getAssetString } from "helpers/assets";
import getExplorerLink, { ExplorerSection } from "helpers/explorer-links";
import { truncateString } from "helpers/truncate-string";

import { LumenInfo } from "store/assetsStore/reducer";
import useAssetsStore from "store/assetsStore/useAssetsStore";

import { ModalService, StellarService } from "services/globalServices";

import { TokenType } from "types/token";

import AssetInfoModal from "components/AssetInfoModal";
import { COLORS } from "web/styles";

import AssetLogo from "./AssetLogo";
import DotsLoader from "./loaders/DotsLoader";
import { TOOLTIP_POSITION } from "constants/tool-tip";
import Tooltip from "./Tooltip";
import { IoIosInformationCircleOutline } from "react-icons/io";

const DomainDetails = styled.span`
	cursor: pointer;
	&:hover {
		text-decoration: underline;
		text-decoration-style: dashed;
	}
`;

const DomainDetailsLink = styled.a`
	text-decoration: none;
	color: ${COLORS.grayText};

	&:hover {
		text-decoration: underline;
		text-decoration-style: dashed;
	}
`;

const Asset = ({
	asset,
	inRow,
	onlyLogo,
	onlyLogoSmall,
	logoAndCode,
	hasDomainLink,
	hasAssetDetailsLink,
}) => {
	const { assetsInfo } = useAssetsStore();

	const assetInstance =
		asset.type !== TokenType.soroban
			? StellarService.createAsset(asset.code, asset.issuer)
			: null;

	const isNative = assetInstance && assetInstance.isNative();
	const hasAssetInfo =
		isNative ||
		(assetInstance && assetsInfo.has(getAssetString(assetInstance)));
	const assetInfo = isNative
		? LumenInfo
		: assetInstance
		? assetsInfo.get(getAssetString(assetInstance))
		: null;

	const domain = useMemo(() => {
		if (asset.type === TokenType.soroban) {
			return (
				<DomainDetailsLink
					href={getExplorerLink(ExplorerSection.contract, asset.contract)}
					target="_blank"
				>
					soroban token
				</DomainDetailsLink>
			);
		}
		if (!assetInfo) {
			return <DotsLoader />;
		}

		const domainView = assetInfo.home_domain ?? truncateString(asset.issuer, 4);

		if (hasDomainLink && assetInfo.home_domain) {
			return (
				<a
					className="cursor-pointer text-purple-400 no-underline"
					href={`https://${assetInfo.home_domain}`}
					target="_blank"
				>
					{domainView}
				</a>
			);
		}

		if (hasAssetDetailsLink) {
			return (
				<DomainDetails
					onClick={() => ModalService.openModal(AssetInfoModal, { asset })}
				>
					{domainView}
				</DomainDetails>
			);
		}

		return domainView;
	}, [assetInfo, asset, hasAssetDetailsLink, hasDomainLink]);

	if (onlyLogo) {
		return <AssetLogo asset={asset} />;
	}

	if (onlyLogoSmall) {
		return <AssetLogo asset={asset} isSmall />;
	}

	if (logoAndCode) {
		return (
			<div className="flex items-center gap-2">
				<AssetLogo asset={asset} />
				<div>{asset.code}</div>
			</div>
		);
	}

	return (
		<div className="flex items-center w-full gap-2">
			<AssetLogo asset={asset} />
			<div>
				<div>{asset.code}</div>
				<div className="flex items-center gap-1">
					{inRow
						? ""
						: assetInfo?.name ||
						  (asset.type === TokenType.soroban ? asset.name : asset.code)}{" "}
					({domain})
					<Tooltip
						content={
							<span>
								{asset.type === TokenType.soroban ? (
									"Soroban Token"
								) : hasAssetInfo ? (
									assetInfo.home_domain ?? "unknown"
								) : (
									<DotsLoader />
								)}
							</span>
						}
						position={TOOLTIP_POSITION.right}
						showOnHover
					>
						<IoIosInformationCircleOutline />
					</Tooltip>
				</div>
			</div>
		</div>
	);
};

export default Asset;
