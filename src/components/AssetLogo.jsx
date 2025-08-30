// import * as React from "react";
// import { useState } from "react";
// import styled from "styled-components";

// import { getAssetString } from "helpers/assets";

// import { LumenInfo } from "store/assetsStore/reducer";
// import useAssetsStore from "store/assetsStore/useAssetsStore";

// import { StellarService } from "services/globalServices";

// import { TokenType } from "types/token";

// import { flexAllCenter } from "web/mixins";
// import { COLORS } from "web/styles";

// import UnknownLogo from "assets/asset-unknown-logo.svg";
// import SorobanLogo from "assets/soroban-token-logo.svg";

// import CircleLoader from "./loaders/CircleLoader";
// import { bigLogoStyles, logoStyles, smallLogoStyles } from "constants/logo";

// const Logo = styled.img`
// 	${({ $isSmall, $isBig, $isCircle }) => {
// 		if ($isSmall) {
// 			return smallLogoStyles($isCircle);
// 		}
// 		if ($isBig) {
// 			return bigLogoStyles($isCircle);
// 		}
// 		return logoStyles($isCircle);
// 	}}
// `;

// const Unknown = styled(UnknownLogo)`
// 	${({ $isSmall, $isBig, $isCircle }) => {
// 		if ($isSmall) {
// 			return smallLogoStyles($isCircle);
// 		}
// 		if ($isBig) {
// 			return bigLogoStyles($isCircle);
// 		}
// 		return logoStyles($isCircle);
// 	}}
// `;

// const Soroban = styled(SorobanLogo)`
// 	${({ $isSmall, $isBig, $isCircle }) => {
// 		if ($isSmall) {
// 			return smallLogoStyles($isCircle);
// 		}
// 		if ($isBig) {
// 			return bigLogoStyles($isCircle);
// 		}
// 		return logoStyles($isCircle);
// 	}}
// `;

// const LogoLoaderContainer = styled.div`
// 	${({ $isSmall, $isBig, $isCircle }) => {
// 		if ($isSmall) {
// 			return smallLogoStyles($isCircle);
// 		}
// 		if ($isBig) {
// 			return bigLogoStyles($isCircle);
// 		}
// 		return logoStyles($isCircle);
// 	}}
// 	${flexAllCenter};
// 	background-color: ${COLORS.descriptionText};
// `;

// const LogoLoader = styled(CircleLoader)`
// 	color: ${COLORS.white};
// `;

// const AssetLogo = ({ asset, isSmall, isBig, isCircle, ...props }) => {
// 	const [isErrorLoad, setIsErrorLoad] = useState(false);

// 	const { assetsInfo } = useAssetsStore();

// 	if (!asset.type && !asset.issuer) {
// 		return (
// 			<Unknown
// 				$isSmall={isSmall}
// 				$isBig={isBig}
// 				$isCircle={isCircle}
// 				{...props}
// 			/>
// 		);
// 	}

// 	if (asset.type === TokenType.soroban) {
// 		return (
// 			<Soroban
// 				$isSmall={isSmall}
// 				$isBig={isBig}
// 				$isCircle={isCircle}
// 				{...props}
// 			/>
// 		);
// 	}

// 	const assetInstance = StellarService.createAsset(asset.code, asset.issuer);
// 	const isNative = assetInstance.isNative();
// 	const assetInfo = isNative
// 		? LumenInfo
// 		: assetsInfo.get(getAssetString(assetInstance));
// 	const logoUrl = assetInfo?.image;

// 	if (logoUrl === undefined) {
// 		return (
// 			<LogoLoaderContainer
// 				$isSmall={isSmall}
// 				$isBig={isBig}
// 				$isCircle={isCircle}
// 				{...props}
// 			>
// 				<LogoLoader size="small" />
// 			</LogoLoaderContainer>
// 		);
// 	}

// 	if (logoUrl === null || isErrorLoad) {
// 		return (
// 			<Unknown
// 				$isSmall={isSmall}
// 				$isBig={isBig}
// 				$isCircle={isCircle}
// 				{...props}
// 			/>
// 		);
// 	}

// 	return (
// 		<Logo
// 			src={logoUrl}
// 			alt=""
// 			$isSmall={isSmall}
// 			$isBig={isBig}
// 			$isCircle={isCircle}
// 			onError={() => {
// 				setIsErrorLoad(true);
// 			}}
// 			{...props}
// 		/>
// 	);
// };

// export default AssetLogo;

import * as React from "react";
import { useState } from "react";
import styled from "styled-components";

import { getAssetString } from "helpers/assets";

import { LumenInfo } from "store/assetsStore/reducer";
import useAssetsStore from "store/assetsStore/useAssetsStore";

import { StellarService } from "services/globalServices";

import { TokenType } from "types/token";

import { flexAllCenter } from "web/mixins";
import { COLORS } from "web/styles";

import UnknownLogo from "assets/asset-unknown-logo.svg";
import SorobanLogo from "assets/soroban-token-logo.svg";

import CircleLoader from "./loaders/CircleLoader";
import { bigLogoStyles, logoStyles, smallLogoStyles } from "constants/logo";

const Logo = styled.img`
	${({ $isSmall, $isBig, $isCircle }) => {
		if ($isSmall) {
			return smallLogoStyles($isCircle);
		}
		if ($isBig) {
			return bigLogoStyles($isCircle);
		}
		return logoStyles($isCircle);
	}}
`;

const Unknown = styled(UnknownLogo)`
	${({ $isSmall, $isBig, $isCircle }) => {
		if ($isSmall) {
			return smallLogoStyles($isCircle);
		}
		if ($isBig) {
			return bigLogoStyles($isCircle);
		}
		return logoStyles($isCircle);
	}}
`;

const Soroban = styled(SorobanLogo)`
	${({ $isSmall, $isBig, $isCircle }) => {
		if ($isSmall) {
			return smallLogoStyles($isCircle);
		}
		if ($isBig) {
			return bigLogoStyles($isCircle);
		}
		return logoStyles($isCircle);
	}}
`;

const LogoLoaderContainer = styled.div`
	${({ $isSmall, $isBig, $isCircle }) => {
		if ($isSmall) {
			return smallLogoStyles($isCircle);
		}
		if ($isBig) {
			return bigLogoStyles($isCircle);
		}
		return logoStyles($isCircle);
	}}
	${flexAllCenter};
	background-color: ${COLORS.descriptionText};
`;

const LogoLoader = styled(CircleLoader)`
	color: ${COLORS.white};
`;

const AssetLogo = ({ asset, isSmall, isBig, isCircle, ...props }) => {
	const [isErrorLoad, setIsErrorLoad] = useState(false);

	const { assetsInfo } = useAssetsStore();

	// Handle cases where asset is undefined or missing required properties
	if (!asset.type && !asset.issuer) {
		return (
			<Unknown
				$isSmall={isSmall}
				$isBig={isBig}
				$isCircle={isCircle}
				{...props}
			/>
		);
	}

	if (asset.type === TokenType.soroban) {
		return (
			<Soroban
				$isSmall={isSmall}
				$isBig={isBig}
				$isCircle={isCircle}
				{...props}
			/>
		);
	}

	const assetInstance = StellarService.createAsset(asset.code, asset.issuer);
	const isNative = assetInstance.isNative();

	// Safely access assetsInfo with proper null/undefined checking
	const assetInfo = isNative
		? LumenInfo
		: assetsInfo && typeof assetsInfo.get === "function"
		? assetsInfo.get(getAssetString(assetInstance))
		: null;

	const logoUrl = assetInfo?.image;

	// Show loader while assetsInfo is being populated
	if (logoUrl === undefined && !isNative) {
		return (
			<LogoLoaderContainer
				$isSmall={isSmall}
				$isBig={isBig}
				$isCircle={isCircle}
				{...props}
			>
				<LogoLoader size="small" />
			</LogoLoaderContainer>
		);
	}

	if (logoUrl === null || isErrorLoad || !logoUrl) {
		return (
			<Unknown
				$isSmall={isSmall}
				$isBig={isBig}
				$isCircle={isCircle}
				{...props}
			/>
		);
	}

	return (
		<Logo
			src={logoUrl}
			alt=""
			$isSmall={isSmall}
			$isBig={isBig}
			$isCircle={isCircle}
			onError={() => {
				setIsErrorLoad(true);
			}}
			{...props}
		/>
	);
};

export default AssetLogo;
