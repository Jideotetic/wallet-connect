import axios from "axios";

import { API_URL_STELLAR_EXPERT } from "constants/api";

import { getIsTestnetEnv } from "helpers/env";

export const getAssetDetails = (asset) =>
	axios
		.get(
			`${API_URL_STELLAR_EXPERT}explorer/${
				getIsTestnetEnv() ? "testnet" : "public"
			}/asset?search=${asset.issuer ?? "XLM"}`
		)
		.then(({ data }) =>
			data._embedded.records.find((details) => {
				const [code, issuer] = details.asset.split("-");
				return code === asset.code && issuer === asset.issuer;
			})
		);
