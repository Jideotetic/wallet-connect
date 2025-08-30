import {
	D_ICE_CODE,
	DOWN_ICE_CODE,
	ICE_ISSUER,
	UP_ICE_CODE,
} from "constants/assets";

import { StellarService } from "services/globalServices";

export const SELECTED_PAIRS_ALIAS = "selected pairs";

export const getCachedChosenPairs = () =>
	JSON.parse(localStorage.getItem(SELECTED_PAIRS_ALIAS) || "[]");

export const UP_ICE = StellarService?.createAsset(UP_ICE_CODE, ICE_ISSUER);
export const DOWN_ICE = StellarService?.createAsset(DOWN_ICE_CODE, ICE_ISSUER);
export const DELEGATE_ICE = StellarService?.createAsset(D_ICE_CODE, ICE_ISSUER);

export const getAssetsFromPairs = (pairs) =>
	pairs.reduce((acc, item) => {
		const bribeAssets =
			item.aggregated_bribes?.reduce(
				(accum, bribe) => [
					...accum,
					{ code: bribe.asset_code, issuer: bribe.asset_issuer },
				],
				[]
			) ?? [];

		return [
			...acc,
			...bribeAssets,
			{ code: item.asset1_code, issuer: item.asset1_issuer },
			{ code: item.asset2_code, issuer: item.asset2_issuer },
		];
	}, []);
