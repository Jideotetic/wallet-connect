import axios from "axios";

import { API_ASSETS_INFO, API_ASSETS_LIST_URL } from "constants/api";

export const getAssetsRequest = () =>
	axios.get(API_ASSETS_LIST_URL).then(({ data }) => {
		const issuerOrgs = data.issuer_orgs;

		return issuerOrgs.reduce((acc, anchor) => {
			anchor.assets.forEach((asset) => {
				if (!asset.disabled && !anchor.disabled && !asset.unlisted) {
					acc.push(asset);
				}
			});

			return acc;
		}, []);
	});

export const getAssetsInfo = async (assets, batchSize = 100) => {
	// Function to fetch a batch of assets
	const fetchBatch = async (batch) => {
		const params = new URLSearchParams();
		batch.forEach((asset) =>
			params.append("asset", `${asset.code}:${asset.issuer}`)
		);

		const { data } = await axios.get(API_ASSETS_INFO, { params });
		return data.results;
	};

	// Split assets into batches and fetch all batches concurrently
	const results = await Promise.all(
		assets
			.reduce((batches, _, i) => {
				if (i % batchSize === 0) batches.push([]);
				batches[batches.length - 1].push(assets[i]);
				return batches;
			}, [])
			.map(fetchBatch)
	);

	// Combine the results into a single array
	return results.flat();
};
