import { Asset } from "@stellar/stellar-sdk";
import axios from "axios";
import BigNumber from "bignumber.js";

import { getAquaAssetData, getUsdcAssetData } from "helpers/assets";
import chunkFunction from "helpers/chunk-function";
import { getNetworkPassphrase } from "helpers/env";
import { getAmmAquaUrl } from "helpers/url";

import {
	AssetsService,
	SorobanService,
	StellarService,
} from "services/globalServices";

import { TokenType } from "types/token";

export const FilterOptions = {
	all: "all",
	stable: "stable",
	constant: "volatile",
};

const FilterOptionsMap = {
	[FilterOptions.all]: "",
	[FilterOptions.stable]: "stable",
	[FilterOptions.constant]: "constant_product",
};

export const PoolsSortFields = {
	liquidityUp: "-liquidity",
	liquidityDown: "liquidity",
	volumeUp: "-volume",
	volumeDown: "volume",
	rewardsUp: "-reward",
	rewardsDown: "reward",
	apyUp: "-apy",
	apyDown: "apy",
	rewardsApyUp: "-rewards_apy",
	rewardsApyDown: "rewards_apy",
};

const processPools = async (pools) => {
	const contracts = pools.reduce((acc, item) => {
		item.tokens_addresses.forEach((id) => acc.add(id));
		return acc;
	}, new Set());

	const tokens = await Promise.all(
		[...contracts].map((id) => SorobanService.token.parseTokenContractId(id))
	);

	AssetsService.processAssets(
		tokens.filter(({ type }) => type === TokenType.classic)
	);

	return pools.map((pool) => ({
		...pool,
		tokens: pool.tokens_addresses.map((str) =>
			tokens.find((token) => token.contract === str)
		),
	}));
};

export const getPools = async (filter, page, size, sort, search) => {
	const capitalizedSearch = (search || "").toUpperCase();
	const baseUrl = getAmmAquaUrl();

	const { data } = await axios.get(
		`${baseUrl}/pools/?pool_type=${
			FilterOptionsMap[filter]
		}&sort=${sort}&page=${page}&size=${size}&search=${
			capitalizedSearch === "XLM" ? "native" : capitalizedSearch
		}`
	);
	const processed = await processPools(data.items);
	return { pools: processed, total: data.total };
};

export const getPoolsWithAssets = async (assets) => {
	const baseUrl = getAmmAquaUrl();
	const params = assets
		.map((asset) => SorobanService.token.getAssetContractId(asset))
		.join(",");

	const res = await axios.get(`${baseUrl}/pools/?tokens__in=${params}`);
	return await processPools(res.data.items);
};
export const getPoolInfo = async (id) => {
	const baseUrl = getAmmAquaUrl();

	const { data } = await axios.get(`${baseUrl}/pools/${id}/`);
	const [processed] = await processPools([data]);
	return processed;
};

export const getPoolStats = async (id) => {
	const baseUrl = getAmmAquaUrl();

	try {
		const { data } = await axios.get(
			`${baseUrl}/statistics/pool/${id}/?size=1000`
		);
		return {
			stats: data.items
				.filter(
					({ liquidity, volume }) =>
						Number(liquidity) !== 0 && Number(volume) !== 0
				)
				.reverse(),
		};
	} catch {
		return { stats: [] };
	}
};

export const getPoolMembers = async (id, page, size) => {
	const baseUrl = getAmmAquaUrl();

	try {
		const { data } = await axios.get(
			`${baseUrl}/pools/${id}/balances/?sort=-balance&size=${size}&page=${page} `
		);
		return { members: data.items, total: data.total, page: data.page };
	} catch {
		return { members: [], total: 0, page: 1 };
	}
};

export const getPoolMembersCount = async (id) => {
	const baseUrl = getAmmAquaUrl();

	try {
		const { data } = await axios.get(
			`${baseUrl}/pools/${id}/balances/?size=1 `
		);
		return { membersCount: data.total };
	} catch {
		return { membersCount: 0 };
	}
};

export const getPoolEvents = async (id, page, size) => {
	const baseUrl = getAmmAquaUrl();

	try {
		const { data } = await axios.get(
			`${baseUrl}/events/pool/${id}/?size=${size}&page=${page}`
		);
		return { events: data.items, total: data.total, page: data.page };
	} catch {
		return { events: [], total: 0, page: 1 };
	}
};

export const getPool = async (id) => {
	const [info, stats, membersCount] = await Promise.all([
		getPoolInfo(id),
		getPoolStats(id),
		getPoolMembersCount(id),
	]);
	return Object.assign({}, info, stats, membersCount);
};

export const getUserPools = async (accountId) => {
	const baseUrl = getAmmAquaUrl();

	const { data } = await axios.get(
		`${baseUrl}/pools/user/${accountId}/?size=1000`
	);
	const res = await processPools(data.items);
	return res;
};

export const getAmmAquaBalance = async (accountId) => {
	const baseUrl = getAmmAquaUrl();
	const { aquaContract, aquaAssetString } = getAquaAssetData();

	const { data } = await axios.get(
		`${baseUrl}/pools/user/${accountId}/?size=1000&tokens__in=${aquaContract}`
	);

	const aquaSum = data.items.reduce((acc, item) => {
		const aquaIndex = item.tokens_str.findIndex(
			(str) => str === aquaAssetString
		);
		const aquaAmount = new BigNumber(item.reserves[aquaIndex])
			.div(1e7)
			.times(new BigNumber(item.balance))
			.div(new BigNumber(item.total_share));
		acc = acc.plus(aquaAmount);
		return acc;
	}, new BigNumber(0));

	return aquaSum.toNumber();
};

export const findSwapPath = async (
	baseId,
	counterId,
	amount,
	isSend,
	decimals
) => {
	const headers = { "Content-Type": "application/json" };
	const baseUrl = getAmmAquaUrl();

	const body = JSON.stringify({
		token_in_address: baseId,
		token_out_address: counterId,
		amount: new BigNumber(amount).times(Math.pow(10, decimals)).toFixed(),
	});
	const { data } = await axios.post(
		isSend
			? `${baseUrl}/pools/find-path/`
			: `${baseUrl}/pools/find-path-strict-receive/`,
		body,
		{
			headers,
		}
	);
	return data;
};

export const getTotalStats = async () => {
	const baseUrl = getAmmAquaUrl();

	const { data } = await axios.get(`${baseUrl}/statistics/totals/?size=365`);
	return data.items.reverse();
};

export const getVolume24h = async () => {
	const baseUrl = getAmmAquaUrl();

	const { data } = await axios.get(`${baseUrl}/statistics/24h/`);
	return data;
};

export const getNativePrices = async (opts) => {
	const baseUrl = getAmmAquaUrl();

	const allPrices = new Map();

	const { data } = await axios.get(`${baseUrl}/tokens/?pooled=true&size=500`);
	const prices = data.items.filter((item) => {
		if (opts?.onlySoroban) {
			return !item.is_sac;
		}

		return true;
	});

	prices.forEach((price) => {
		allPrices.set(price.address, {
			price: (+price.price_xlm * Math.pow(10, price.decimals - 7)).toFixed(7),
			token:
				price.name === "native" && price.is_sac
					? StellarService.createLumen()
					: price.is_sac
					? StellarService.createAsset(price.code, price.issuer)
					: {
							contract: price.address,
							type: TokenType.soroban,
							name: price.name,
							code: price.code,
							decimal: price.decimals,
					  },
		});
	});

	return allPrices;
};

export const getPathPoolsFee = async (addresses) => {
	const baseUrl = getAmmAquaUrl();

	const { data } = await axios.get(
		`${baseUrl}/pools/?address__in=${addresses.join(",")}`
	);

	return (await processPools(data.items)).reduce((acc, pool) => {
		acc.set(pool.address, pool.fee);
		return acc;
	}, new Map());
};

export const getPoolsToMigrate = async (base, counter) => {
	const baseUrl = getAmmAquaUrl();

	const { data } = await axios.get(
		`${baseUrl}/pools?tokens__in=${SorobanService.token.getAssetContractId(
			base
		)},${SorobanService.token.getAssetContractId(counter)}`
	);

	const pools = data.items
		.filter((item) => item.tokens_str.length === 2)
		.sort((a, b) => +b.liquidity_usd - +a.liquidity_usd);

	if (!pools.length) {
		return null;
	}
	return processPools(pools);
};

// TODO: remove this method when this data is placed on the backend
export const getAmmRewards = async () => {
	const baseUrl = getAmmAquaUrl();

	const { data } = await axios.get(`${baseUrl}/pool-rewards/`);

	const sumTps = data.items.reduce(
		(acc, item) => acc + Number(item.tps) / 1e7,
		0
	);

	return sumTps * 60 * 60 * 24;
};

// TODO: remove this method when this data is placed on the backend
export const getAquaInPoolsSum = async () => {
	const baseUrl = getAmmAquaUrl();

	const { aquaContract, aquaAssetString } = getAquaAssetData();

	const { data } = await axios.get(
		`${baseUrl}/pools/?&search=${aquaContract}&size=500`
	);

	return data.items.reduce(
		(acc, item) => {
			const aquaIndex = item.tokens_str.findIndex(
				(str) => str === aquaAssetString
			);

			acc.sum = acc.sum + Number(item.reserves[aquaIndex]) / 1e7;
			acc.sum_usd = acc.sum_usd + Number(item.liquidity_usd) / 1e7 / 2;

			return acc;
		},
		{ sum: 0, sum_usd: 0 }
	);
};

// TODO: remove this method when this data is placed on the backend
export const getAquaPoolsMembers = async () => {
	const baseUrl = getAmmAquaUrl();

	const { aquaContract } = getAquaAssetData();

	const { data } = await axios.get(
		`${baseUrl}/pools/?&search=${aquaContract}&size=500`
	);

	const poolsId = data.items.map((item) => item.address);

	const membersCount = await Promise.all(
		poolsId.map((id) => getPoolMembersCount(id))
	);

	return membersCount.reduce((acc, item) => acc + item.membersCount, 0);
};

export const getAquaXlmRate = async () => {
	const baseUrl = getAmmAquaUrl();

	const { aquaContract } = getAquaAssetData();

	const XLM_CONTRACT = Asset.native().contractId(getNetworkPassphrase());

	const { data } = await axios.get(
		`${baseUrl}/pools/?&tokens__in=${aquaContract},${XLM_CONTRACT}`
	);

	const [bestPool] = data.items.sort(
		(a, b) => Number(b.liquidity_usd) - Number(a.liquidity_usd)
	);

	return bestPool.reserves.map((reserve) => +reserve / 1e7);
};

// TODO: remove this method when this data is placed on the backend
export const getAssetsList = async () => {
	const baseUrl = getAmmAquaUrl();

	const { data } = await axios.get(`${baseUrl}/tokens/?pooled=true&size=200`);

	// tokens in the top of the list - AQUA, XLM, USDC
	const { aquaStellarAsset } = getAquaAssetData();
	const { usdcStellarAsset } = getUsdcAssetData();
	const lumen = StellarService.createLumen();

	const otherTokens = data.items
		.filter(
			({ address }) =>
				address !== aquaStellarAsset.contract &&
				address !== usdcStellarAsset.contract &&
				address !== lumen.contract
		)
		.map((price) =>
			price.is_sac
				? StellarService.createAsset(price.code, price.issuer)
				: {
						contract: price.address,
						type: TokenType.soroban,
						name: price.name,
						code: price.code,
						decimal: price.decimals,
				  }
		);

	return [aquaStellarAsset, lumen, usdcStellarAsset, ...otherTokens];
};

function chunkArray(arr, size = 5) {
	const result = [];
	for (let i = 0; i < arr.length; i += size) {
		result.push(arr.slice(i, i + size));
	}
	return result;
}

export const getUserRewardsList = async (accountId) => {
	const baseUrl = getAmmAquaUrl();

	const { data } = await axios.get(`${baseUrl}/pools/?size=500`);

	const results = [];

	const processed = await processPools(data.items);

	const chunked = chunkArray(processed);

	await chunkFunction(chunked, async (chunk) => {
		const result = await SorobanService.amm.getPoolsRewards(
			accountId,
			chunk.map(({ address }) => address)
		);

		result.forEach((item, index) => {
			if (Number(item.to_claim)) {
				results.push({
					id: chunk[index].address,
					amount: Number(item.to_claim),
					tokens: chunk[index].tokens,
					type: chunk[index].pool_type,
				});
			}
		});
	});

	return results.sort((a, b) => b.amount - a.amount);
};
