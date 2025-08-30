import { AMM_TOKENS_LIST } from "constants/local-storage";

import { StellarService } from "services/globalServices";

import { TokenType } from "types/token";

export const cacheTokens = (tokens) => {
	localStorage.setItem(AMM_TOKENS_LIST, JSON.stringify(tokens));
};

export const getTokensFromCache = () => {
	const tokens = JSON.parse(localStorage.getItem(AMM_TOKENS_LIST));

	if (!tokens) return null;

	return tokens.map((token) => {
		if (token.type === TokenType.soroban) {
			return token;
		}

		const lumen = StellarService.createLumen();

		return lumen.contract === token.contract
			? { lumen }
			: StellarService.createAsset(token.code, token.issuer);
	});
};
