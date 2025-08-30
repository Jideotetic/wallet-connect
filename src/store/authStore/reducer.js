import { AUTH_ACTIONS } from "./types";

export const initialState = {
	isLogged: false,
	isLoginPending: false,
	loginPendingTopic: undefined,
	isUnfundedAccount: false,
	loginErrorText: "",
	loginType: null,
	account: null,
	federationAddress: "",
	isFederationPending: false,
	metadata: null,
	redirectURL: undefined,
	callback: undefined,
};

export default function authStore(state = initialState, action) {
	switch (action.type) {
		case AUTH_ACTIONS.LOGIN_START: {
			const { topic } = action.payload;
			return {
				...state,
				isLoginPending: true,
				loginErrorText: "",
				loginPendingTopic: topic,
			};
		}
		case AUTH_ACTIONS.LOGIN_SUCCESS: {
			const { account, loginType, metadata, topic } = action.payload;
			if (topic && state.loginPendingTopic !== topic) {
				return {
					...state,
				};
			}
			return {
				...state,
				isLoginPending: false,
				isLogged: true,
				account,
				loginType,
				metadata: metadata ?? null,
			};
		}
		case AUTH_ACTIONS.LOGIN_FAIL: {
			const { errorText } = action.payload;
			return {
				...state,
				isLoginPending: false,
				loginErrorText: errorText,
			};
		}
		case AUTH_ACTIONS.CLEAR_LOGIN_ERROR: {
			return { ...state, loginErrorText: "" };
		}
		case AUTH_ACTIONS.FEDERATION_RESOLVE_START: {
			return {
				...state,
				isFederationPending: true,
			};
		}
		case AUTH_ACTIONS.FEDERATION_RESOLVE_SUCCESS: {
			const { federation } = action.payload;
			return {
				...state,
				isFederationPending: false,
				federationAddress: federation,
			};
		}
		case AUTH_ACTIONS.FEDERATION_RESOLVE_FAIL: {
			return {
				...state,
				isFederationPending: false,
			};
		}
		case AUTH_ACTIONS.UPDATE_ACCOUNT: {
			const { account } = action.payload;
			return {
				...state,
				account,
			};
		}
		case AUTH_ACTIONS.LOGOUT: {
			return {
				...initialState,
			};
		}
		case AUTH_ACTIONS.ENABLE_REDIRECT: {
			const { redirectURL } = action.payload;
			return {
				...state,
				redirectURL,
			};
		}
		case AUTH_ACTIONS.DISABLE_REDIRECT: {
			return {
				...state,
				redirectURL: undefined,
			};
		}
		case AUTH_ACTIONS.ADD_AUTH_CALLBACK: {
			const { callback } = action.payload;
			return {
				...state,
				callback,
			};
		}
		case AUTH_ACTIONS.REMOVE_AUTH_CALLBACK: {
			return {
				...state,
				callback: undefined,
			};
		}
		default: {
			return state;
		}
	}
}
