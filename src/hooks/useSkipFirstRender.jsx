import { useEffect, useRef } from "react";

export const useSkipFirstRender = (fn, args) => {
	const isMounted = useRef(false);

	useEffect(() => {
		if (isMounted.current) {
			return fn();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, args);

	useEffect(() => {
		isMounted.current = true;
	}, []);
};
