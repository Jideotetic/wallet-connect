import { getIsTestnetEnv } from "helpers/env";

export const goToStellarExpert = ({ transactions }) => {
	const tab = window.open("", "_blank");
	transactions().then((res) => {
		const hash = res?.records?.[0]?.hash;
		if (hash) {
			tab.location.href = `https://stellar.expert/explorer/${
				getIsTestnetEnv() ? "testnet" : "public"
			}/tx/${hash}`;
		}
	});
};
