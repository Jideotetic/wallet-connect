import axios from "axios";

const registryUrl = `https://explorer-api.walletconnect.com/v3/wallets?projectId=b3caac6f2b5c23a9134c1a14d58509d9`;

const WALLETS_PRIORITY = {
	"lobstr wallet": 1,
	freighter: 2,
};

export const getWalletsList = () =>
	axios.get(registryUrl).then(({ data }) =>
		Object.values(data.listings)
			.filter(
				(wallet) =>
					wallet.versions.includes("2") &&
					wallet.chains.includes("stellar:pubnet")
			)
			.sort((a, b) => {
				const pa = WALLETS_PRIORITY[a.name.toLowerCase()] || 99;
				const pb = WALLETS_PRIORITY[b.name.toLowerCase()] || 99;
				return pa - pb;
			})
	);
