import * as StellarSdk from "@stellar/stellar-sdk";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

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

import { customScroll, respondDown, textEllipsis } from "web/mixins";
import { Breakpoints, COLORS } from "web/styles";

import Asset from "./Asset";
import Input from "./inputs/Input";
import CircleLoader from "./loaders/CircleLoader";
import PageLoader from "./loaders/PageLoader";

const StyledInput = styled(Input)`
	margin-top: 2.4rem;
`;

const DefaultAssets = styled.div`
	display: flex;
	justify-content: space-between;
	margin-top: 1.6rem;

	${respondDown(Breakpoints.md)`
        flex-wrap: wrap;
        gap: 0;
    `}
`;

const DefaultAsset = styled.div`
	height: 4.8rem;
	border-radius: 3.8rem;
	border: 0.1rem solid ${COLORS.gray};
	padding: 0.8rem;
	background-color: ${COLORS.white};
	align-items: center;
	cursor: pointer;

	&:hover {
		border-color: ${COLORS.grayText};
	}

	${respondDown(Breakpoints.md)`
        margin-bottom: 1rem;
    `};
`;

const AssetsList = styled.div`
	display: flex;
	flex-direction: column;
	max-height: 45vh;
	${customScroll};
	overflow-y: auto;
	margin-top: 2.5rem;

	${respondDown(Breakpoints.md)`
        margin-bottom: 1rem;
        height: calc(100vh - 35rem);
        max-height: unset;
        width: 100%;
    `};
`;

const AssetStyled = styled(Asset)`
	${respondDown(Breakpoints.md)`
        width: ${({ $isLogged }) => ($isLogged ? "40%" : "80%")};
    `}
`;

const AssetItem = styled.div`
	display: flex;
	align-items: center;
	padding: 0.8rem;
	cursor: pointer;
	justify-content: space-between;

	&:hover {
		background-color: ${COLORS.lightGray};
	}

	${respondDown(Breakpoints.md)`
        width: 100%;
    `};
`;

const Balances = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	color: ${COLORS.grayText};
	font-size: 1.4rem;
	line-height: 2rem;

	span:first-child {
		font-size: 1.6rem;
		line-height: 2.8rem;
		color: ${COLORS.paragraphText};
		text-align: right;
	}

	${respondDown(Breakpoints.md)`
        width: 40%;
        font-size: 1.2rem;
        
        span {
            width: 100%;
            ${textEllipsis};
            text-align: right;
        }
        
        span:first-child {
            font-size: 1.2rem;
            line-height: 2rem;
            white-space: nowrap;
        }
    `}
`;

const LoaderWrapper = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 45vh;
	margin-top: 2.5rem;
`;

const EmptyState = styled.span`
	display: flex;
	justify-content: center;
	align-items: center;
	color: ${COLORS.grayText};
	line-height: 6.4rem;
`;

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
		<div className="max-h-[calc(100vh-300px)]">
			<h1 className="mb-4">Choose asset</h1>

			<input
				className="w-full border border-gray-200 p-4 rounded-lg"
				type="text"
				placeholder="Search asset or enter home domain"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			{/* <StyledInput
				placeholder="Search asset or enter home domain"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				postfix={searchPending ? <CircleLoader size="small" /> : null}
			/> */}
			<div className="flex mt-4 justify-evenly flex-wrap">
				{DEFAULT_ASSETS.map((asset) => (
					<div
						className=" flex bg-white items-center border rounded-4xl gap-2 cursor-pointer p-1"
						key={getAssetString(asset)}
						onClick={() => chooseAsset(asset)}
					>
						<Asset asset={asset} logoAndCode />
					</div>
				))}
			</div>
			{account && !balances.length ? (
				<LoaderWrapper>
					<PageLoader />
				</LoaderWrapper>
			) : (
				<AssetsList>
					{filteredAssets.map(({ token, balance, nativeBalance }) => (
						<AssetItem key={token.contract} onClick={() => chooseAsset(token)}>
							<AssetStyled asset={token} $isLogged={isLogged} />
							{Number(balance) ? (
								<Balances>
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
								</Balances>
							) : null}
						</AssetItem>
					))}
					{filteredAssets.length === 0 && (
						<EmptyState>No assets found</EmptyState>
					)}
				</AssetsList>
			)}
		</div>
	);
};

export default AssetPickerModal;
