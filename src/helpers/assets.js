import { ASSETS_ENV_DATA } from "constants/assets";

import { SorobanService, StellarService } from "services/globalServices";

import { TokenType } from "types/token";

import { getEnv, getNetworkPassphrase } from "./env";

export const getAssetString = (asset) => {
	if (asset.type === TokenType.soroban) {
		return asset.contract;
	}
	if (asset?.isNative?.()) {
		return "native";
	}
	return `${asset.code}:${asset.issuer}`;
};

export const getStellarAsset = (code, issuer) => {
	if (!issuer) {
		return StellarService.createLumen();
	}

	return StellarService.createAsset(code, issuer);
};

export const getAssetFromString = (str, onUpdateCB) => {
	if (StellarService.isValidContract(str)) {
		const result = { contract: str, type: TokenType.soroban };

		SorobanService.token.parseTokenContractId(str).then((res) => {
			Object.assign(result, res);
			if (onUpdateCB) {
				onUpdateCB(result);
			}
		});
		return result;
	}
	if (str === "native") {
		const asset = StellarService.createLumen();

		asset.type = TokenType.classic;
		asset.contract = asset.contractId(getNetworkPassphrase());
		asset.decimal = 7;
		if (onUpdateCB) {
			onUpdateCB(asset);
		}
		return asset;
	}

	const [code, issuer] = str.split(":");

	const asset = StellarService.createAsset(code, issuer);
	asset.type = TokenType.classic;
	asset.contract = asset.contractId(getNetworkPassphrase());
	asset.decimal = 7;
	if (onUpdateCB) {
		onUpdateCB(asset);
	}
	return asset;
};

export const getAquaAssetData = () => {
	const env = getEnv();

	const data = ASSETS_ENV_DATA[env].aqua;
	const asset = StellarService.createAsset(data.aquaCode, data.aquaIssuer);

	return {
		...data,
		aquaStellarAsset: asset,
		aquaContract: asset.contractId(getNetworkPassphrase()),
	};
};

export const getUsdcAssetData = () => {
	const env = getEnv();
	const data = ASSETS_ENV_DATA[env].usdc;
	const asset = StellarService.createAsset(data.usdcCode, data.usdcIssuer);

	return {
		...data,
		usdcStellarAsset: asset,
		usdcContract: asset.contractId(getNetworkPassphrase()),
	};
};
