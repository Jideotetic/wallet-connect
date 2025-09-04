import { lazy, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { getAssetsList } from "api/amm";

import { D_ICE_CODE, ICE_ISSUER } from "constants/assets";
import { MainRoutes } from "constants/routes";

import { getAquaAssetData, getAssetString } from "helpers/assets";
import { cacheTokens } from "helpers/swap";
import { getEnv, setProductionEnv } from "helpers/env";

import { ModalService, StellarService } from "services/globalServices";
import { StellarEvents } from "services/stellar.service";

import useAssetsStore from "store/assetsStore/useAssetsStore";
import useAuthStore from "store/authStore/useAuthStore";
import { LoginTypes } from "store/authStore/types";

import PageLoader from "components/loaders/PageLoader";
import ModalContainer from "components/ModalContainer";
import ToastContainer from "components/ToastContainer";
import DIceTrustlineModal from "components/DIceTrustlineModal";

import useGlobalSubscriptions from "hooks/useGlobalSubscriptions";

// Lazy load SwapPage
const SwapPageLazy = lazy(() => import("pages/SwapPage"));

const UPDATE_ASSETS_DATE = "update assets timestamp";
const UPDATE_PERIOD = 24 * 60 * 60 * 1000;

const Swap = () => {
	useGlobalSubscriptions();

	const { getAssets, assets, processNewAssets, assetsInfo, clearAssets } =
		useAssetsStore();
	const [isAssetsUpdated, setIsAssetsUpdated] = useState(false);

	const {
		isLogged,
		account,
		redirectURL,
		disableRedirect,
		callback,
		removeAuthCallback,
	} = useAuthStore();

	useEffect(() => {
		if (!getEnv()) {
			setProductionEnv();
		}

		const assetUpdateTimestamp = localStorage.getItem(UPDATE_ASSETS_DATE);

		if (
			!assetUpdateTimestamp ||
			Date.now() - Number(assetUpdateTimestamp) > UPDATE_PERIOD ||
			!assetsInfo.size
		) {
			clearAssets();
			localStorage.setItem(UPDATE_ASSETS_DATE, Date.now().toString());
			setIsAssetsUpdated(true);
		} else {
			setIsAssetsUpdated(true);
		}

		getAssets();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		getAssetsList().then((res) => {
			processNewAssets(res);
			cacheTokens(res);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const reloadIfNotLoaded = () => {
		if (!isAssetsUpdated) {
			window.location.reload();
		}
	};

	useEffect(() => {
		window.addEventListener("online", reloadIfNotLoaded);

		return () => window.removeEventListener("online", reloadIfNotLoaded);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAssetsUpdated]);

	useEffect(() => {
		const handler = (event) => {
			if (account && account.authType === LoginTypes.secret) {
				event.preventDefault();
			}
		};

		window.addEventListener("beforeunload", handler);
		return () => {
			window.removeEventListener("beforeunload", handler);
		};
	}, [account]);

	useEffect(() => {
		if (assets.length) {
			processNewAssets(assets);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [assets]);

	useEffect(() => {
		if (isLogged) {
			StellarService.startEffectsStream(account.accountId());
		} else {
			StellarService.stopEffectsStream();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLogged]);

	useEffect(() => {
		if (!account) {
			return;
		}
		const unsub = StellarService.event.sub(({ type }) => {
			if (type === StellarEvents.claimableUpdate) {
				const delegators = StellarService.getDelegatorLocks(
					account.accountId()
				);

				if (
					delegators.length &&
					account.getAssetBalance(
						StellarService.createAsset(D_ICE_CODE, ICE_ISSUER)
					) === null
				) {
					ModalService.openModal(DIceTrustlineModal, {});
				}
			}
		});

		return () => unsub();
	}, [account]);

	useEffect(() => {
		if (isLogged && Boolean(redirectURL)) {
			disableRedirect();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLogged, redirectURL]);

	useEffect(() => {
		if (isLogged && Boolean(callback)) {
			callback();
			removeAuthCallback();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLogged, callback]);

	useEffect(() => {
		const userAgent = window.navigator.userAgent;

		// Fix iOS functionality: tap on both sides of the dynamic island, and the phone will instantly scroll up
		if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)) {
			document.documentElement.style.overflowX = "unset";
			document.body.style.overflowX = "unset";
		}
	}, []);

	const { aquaAssetString } = getAquaAssetData();

	if (!isAssetsUpdated) {
		return <PageLoader />;
	}

	return (
		<>
			<Routes>
				<Route
					path={`${MainRoutes.swap}/:source/:destination/`}
					element={<SwapPageLazy />}
				/>
				<Route
					path="*"
					element={
						<Navigate
							to={`${MainRoutes.swap}/${getAssetString(
								StellarService.createLumen()
							)}/${aquaAssetString}`}
							replace
						/>
					}
				/>
			</Routes>

			<ModalContainer />
			<ToastContainer />
		</>
	);
};

export default Swap;
