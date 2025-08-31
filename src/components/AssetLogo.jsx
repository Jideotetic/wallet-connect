import * as React from "react";
import { useState } from "react";

import { getAssetString } from "helpers/assets";

import { LumenInfo } from "store/assetsStore/reducer";
import useAssetsStore from "store/assetsStore/useAssetsStore";

import { StellarService } from "services/globalServices";

import { TokenType } from "types/token";

const AssetLogo = ({ asset }) => {
	const [isErrorLoad, setIsErrorLoad] = useState(false);

	const { assetsInfo } = useAssetsStore();

	// Handle cases where asset is undefined or missing required properties
	if (!asset.type && !asset.issuer) {
		return (
			<>
				<div className="bg-black w-8 h-8 rounded-full" />
			</>
		);
	}

	if (asset.type === TokenType.soroban) {
		return (
			<>
				<div className="bg-black w-8 h-8 rounded-full" />
			</>
		);
	}

	const assetInstance = StellarService.createAsset(asset.code, asset.issuer);
	const isNative = assetInstance.isNative();

	// Safely access assetsInfo with proper null/undefined checking
	const assetInfo = isNative
		? LumenInfo
		: assetsInfo.get(getAssetString(assetInstance));

	const logoUrl = assetInfo?.image;

	// Show loader while assetsInfo is being populated
	if (logoUrl === undefined && !isNative) {
		return (
			<>
				<div className="bg-black w-8 h-8 rounded-full" />
			</>
		);
	}

	if (logoUrl === null || isErrorLoad || !logoUrl) {
		return (
			<>
				<div className="bg-black w-8 h-8 rounded-full" />
			</>
		);
	}

	return (
		<img
			className="w-8 h-8 rounded-full"
			src={logoUrl}
			alt=""
			onError={() => {
				setIsErrorLoad(true);
			}}
		/>
	);
};

export default AssetLogo;
