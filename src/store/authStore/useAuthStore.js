import * as actions from "./actions";

import bindActions from "../bindActions";
import { useGlobalStore } from "store";

// TODO: move to hooks
const useAuthStore = () => {
	const { state, dispatch } = useGlobalStore();

	// List props
	const { authStore } = state;

	// List Actions
	const {
		login,
		logout,
		resolveFederation,
		updateAccount,
		clearLoginError,
		enableRedirect,
		disableRedirect,
		addAuthCallback,
		removeAuthCallback,
	} = actions;

	const authActions = bindActions(
		{
			login,
			logout,
			resolveFederation,
			updateAccount,
			clearLoginError,
			enableRedirect,
			disableRedirect,
			addAuthCallback,
			removeAuthCallback,
		},
		dispatch
	);

	return { ...authStore, ...authActions };
};

export default useAuthStore;
