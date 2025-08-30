import assetStore from "./assetsStore/reducer";
import authStates from "./authStore/reducer";
import { logger } from "./middlewares";

export const initialState = {
	authStore: authStates(undefined, {}),
	assetsStore: assetStore(undefined, {}),
};

export default function mainReducer(state, action) {
	const { authStore, assetsStore } = state;

	const currentState = {
		authStore: authStates(authStore, action),
		assetsStore: assetStore(assetsStore, action),
	};

	logger(action, state, currentState);

	return currentState;
}
