import { clearSavedAuthData, saveToLS } from "store/authStore/auth-helpers";

import AccountService from "services/account.service";
import { StellarService } from "services/globalServices";

import { AUTH_ACTIONS } from "./types";

export function login({
	pubKey,
	loginType,
	metadata,
	topic,
	walletKitId,
	bipPath,
}) {
	return (dispatch) => {
		dispatch({ type: AUTH_ACTIONS.LOGIN_START, payload: { topic } });

		StellarService.loadAccount(pubKey)
			.then((account) => {
				const wrappedAccount = new AccountService(account, loginType);
				saveToLS(pubKey, loginType, walletKitId, bipPath);
				dispatch({
					type: AUTH_ACTIONS.LOGIN_SUCCESS,
					payload: {
						account: wrappedAccount,
						loginType,
						metadata,
						topic,
					},
				});
			})
			.catch((e) => {
				dispatch({
					type: AUTH_ACTIONS.LOGIN_FAIL,
					payload: { errorText: e.message },
				});
			});
	};
}

export function clearLoginError() {
	return { type: AUTH_ACTIONS.CLEAR_LOGIN_ERROR };
}

export function logout() {
	clearSavedAuthData();
	return { type: AUTH_ACTIONS.LOGOUT };
}

export function resolveFederation(homeDomain, accountId) {
	return (dispatch) => {
		dispatch({ type: AUTH_ACTIONS.FEDERATION_RESOLVE_START });

		StellarService.resolveFederation(homeDomain, accountId)
			.then((federation) => {
				dispatch({
					type: AUTH_ACTIONS.FEDERATION_RESOLVE_SUCCESS,
					payload: { federation },
				});
			})
			.catch(() => {
				dispatch({ type: AUTH_ACTIONS.FEDERATION_RESOLVE_FAIL });
			});
	};
}

export function updateAccount(account, authType) {
	const wrappedAccount = new AccountService(account, authType);
	return {
		type: AUTH_ACTIONS.UPDATE_ACCOUNT,
		payload: { account: wrappedAccount },
	};
}

export function enableRedirect(redirectURL) {
	return { type: AUTH_ACTIONS.ENABLE_REDIRECT, payload: { redirectURL } };
}

export function disableRedirect() {
	return { type: AUTH_ACTIONS.DISABLE_REDIRECT };
}

export function addAuthCallback(callback) {
	return { type: AUTH_ACTIONS.ADD_AUTH_CALLBACK, payload: { callback } };
}

export function removeAuthCallback() {
	return { type: AUTH_ACTIONS.REMOVE_AUTH_CALLBACK };
}
