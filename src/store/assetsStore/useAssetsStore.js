import * as actions from "./actions";

import bindActions from "../bindActions";
import { useGlobalStore } from "store";

const useAssetsStore = () => {
	const { state, dispatch } = useGlobalStore();

	// List props
	const { assetsStore } = state;

	// List Actions
	const { getAssets, processNewAssets, clearAssets } = actions;

	const assetsActions = bindActions(
		{
			getAssets,
			processNewAssets,
			clearAssets,
		},
		dispatch
	);

	return { ...assetsStore, ...assetsActions };
};

export default useAssetsStore;
