import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getAssetsList } from "api/amm";

import { MainRoutes } from "constants/routes";

import {
	getAquaAssetData,
	getAssetFromString,
	getAssetString,
} from "helpers/assets";
import { getTokensFromCache } from "helpers/swap";

import useAssetsStore from "store/assetsStore/useAssetsStore";

import { StellarService } from "services/globalServices";

import PageLoader from "components/loaders/PageLoader";

import SwapForm from "components/SwapForm";

const SwapPage = () => {
	const [base, setBase] = useState(null);
	const [counter, setCounter] = useState(null);
	const [assetsList, setAssetsList] = useState(getTokensFromCache());

	const params = useParams();
	const navigate = useNavigate();
	const { aquaAssetString } = getAquaAssetData();

	const { processNewAssets } = useAssetsStore();

	useEffect(() => {
		getAssetsList().then((res) => {
			processNewAssets(res);
			setAssetsList(res);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const { source, destination } = params;

		if (source === destination && !base && !counter) {
			navigate(
				`${MainRoutes.swap}/${getAssetString(
					StellarService.createLumen()
				)}/${aquaAssetString}`,
				{ replace: true }
			);
			return;
		}

		if (!base || getAssetString(base) !== source) {
			getAssetFromString(source, (token) => {
				setBase(token);
			});
		}

		if (!counter || getAssetString(counter) !== destination) {
			getAssetFromString(destination, (token) => {
				setCounter(token);
			});
		}

		if (source === destination) {
			navigate(
				`${MainRoutes.swap}/${getAssetString(counter)}/${getAssetString(base)}`,
				{ replace: true }
			);
			return;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params]);

	const setSource = (asset) => {
		navigate(
			`${MainRoutes.swap}/${getAssetString(asset)}/${getAssetString(counter)}`
		);
	};

	const setDestination = (asset) => {
		navigate(
			`${MainRoutes.swap}/${getAssetString(base)}/${getAssetString(asset)}`
		);
	};

	if (!base || !counter || !assetsList) {
		return <PageLoader />;
	}

	return (
		<main className="min-h-screen relative text-base flex items-center justify-center bg-gray-200">
			<SwapForm
				base={base}
				counter={counter}
				setBase={setSource}
				setCounter={setDestination}
				assetsList={assetsList}
			/>
		</main>
	);
};

export default SwapPage;
