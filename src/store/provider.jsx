import { useReducer, useCallback } from "react";

import { actionHandler } from "./middlewares";
import mainReducer, { initialState } from "./reducers";
import { GlobalStore } from "store";

export default function Provider({ children }) {
	const [state, dispatchBase] = useReducer(mainReducer, initialState);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const dispatch = useCallback(actionHandler(dispatchBase, state), []);

	return (
		<GlobalStore.Provider value={{ state, dispatch }}>
			{children}
		</GlobalStore.Provider>
	);
}
