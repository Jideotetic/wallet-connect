import * as StellarSdk from "@stellar/stellar-sdk";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";

import { USDx_CODE, USDx_ISSUER } from "constants/assets";

import {
	getAquaAssetData,
	getAssetString,
	getUsdcAssetData,
} from "helpers/assets";
import { formatBalance } from "helpers/format-number";

import useAssetsSearch from "hooks/useAssetsSearch";

import useAssetsStore from "store/assetsStore/useAssetsStore";
import useAuthStore from "store/authStore/useAuthStore";

import { StellarService } from "services/globalServices";

import { TokenType } from "types/token";

import Asset from "./Asset";

import PageLoader from "./loaders/PageLoader";

const DEFAULT_ASSETS = [
	StellarService.createLumen(),
	getAquaAssetData().aquaStellarAsset,
	getUsdcAssetData().usdcStellarAsset,
	StellarService.createAsset(USDx_CODE, USDx_ISSUER),
];

const AssetPickerModal = ({ params, confirm }) => {
	const [search, setSearch] = useState("");

	const [balances, setBalances] = useState([]);

	const { account, isLogged } = useAuthStore();
	const { assetsInfo } = useAssetsStore();

	const { assetsList, onUpdate } = params;

	useEffect(() => {
		if (!account) {
			setBalances([]);
			return;
		}
		account.getSortedBalances().then((res) => {
			setBalances(res);
		});
	}, [account]);

	// get balances with tokens pooled into AMM
	const filteredBalances =
		balances.filter(({ token }) =>
			assetsList?.find((knownAssets) => knownAssets.contract === token.contract)
		) ?? [];

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const assets = [
		...filteredBalances,
		...(assetsList
			?.filter(
				(knownAsset) =>
					!filteredBalances.find(
						(asset) => asset.token.contract === knownAsset.contract
					)
			)
			.map((token) => ({ token })) || []),
	];

	const { searchResults, searchPending } = useAssetsSearch(search);

	const filteredAssets = useMemo(
		() =>
			[
				...assets,
				...searchResults
					.filter(
						(token) =>
							!assets.find(
								(asset) =>
									asset.token.code === token.code &&
									asset.token.issuer === token.issuer
							)
					)
					.map((token) => ({ token })),
			].filter((item) => {
				const assetString = getAssetString(item.token);

				const assetInfo =
					item.token.type === TokenType.classic
						? assetsInfo.get(assetString)
						: null;

				return (
					assetString === search ||
					item.token.contract === search ||
					item.token.code.toLowerCase().includes(search.toLowerCase()) ||
					(StellarSdk.StrKey.isValidEd25519PublicKey(search) &&
						item.token.issuer?.toLowerCase().includes(search.toLowerCase())) ||
					assetInfo?.home_domain
						?.toLowerCase()
						.includes(search.toLowerCase().replace("www.", ""))
				);
			}),
		[assets, search, assetsInfo, searchResults]
	);

	const chooseAsset = (asset) => {
		const result =
			asset.type === TokenType.soroban
				? asset
				: StellarService.createAsset(asset.code, asset.issuer);
		onUpdate(result);
		confirm();
	};

	return (
		<div className="h-full">
			<h1 className="mb-4 text-2xl">Choose asset</h1>

			<input
				className="w-full border border-gray-200 p-4 rounded-lg"
				type="text"
				placeholder="Search asset or enter home domain"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>

			<div className="flex mt-4 justify-evenly flex-wrap p-2 shadow-2xl">
				{DEFAULT_ASSETS.map((asset) => (
					<div
						className="flex w-fit ml-auto border border-gray-200 items-center rounded-4xl gap-2 cursor-pointer p-1"
						key={getAssetString(asset)}
						onClick={() => chooseAsset(asset)}
					>
						<Asset asset={asset} logoAndCode />
					</div>
				))}
			</div>
			{account && !balances.length ? (
				<div className="h-96 flex flex-col">
					<PageLoader />
				</div>
			) : (
				<div className="h-96 flex overflow-y-auto flex-col">
					{filteredAssets.map(({ token, balance, nativeBalance }) => (
						<div
							className="flex items-center p-2 cursor-pointer justify-between hover:bg-gray-100"
							key={token.contract}
							onClick={() => chooseAsset(token)}
						>
							<Asset asset={token} $isLogged={isLogged} />
							{Number(balance) ? (
								<div>
									<span>
										{formatBalance(balance)} {token.code}
									</span>
									{nativeBalance !== null && (
										<span>
											$
											{formatBalance(
												+(nativeBalance * StellarService.priceLumenUsd).toFixed(
													2
												),
												true
											)}
										</span>
									)}
								</div>
							) : null}
						</div>
					))}
					{filteredAssets.length === 0 && (
						<div className="p-8 text-center">No assets found</div>
					)}
				</div>
			)}
		</div>
	);
};

export default AssetPickerModal;
