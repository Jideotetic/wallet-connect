// import { useEffect, useState } from 'react';

// // In case we want to call the renderer every time the timeout expires,
// // we don't need to pass the parameter skipTriggerWithEqualValues.
// // The returned result will be the same as in useRef = { current - any}.

// // If we want the rendering to not occur at the same values at the end of timeout,
// // we need to pass the parameter skipTriggerWithEqualValues = true;
// // The return value will be in the same form as the value passed to the function call

// export function useDebounce(
//     value,
//     delay,
//     skipTriggerWithEqualValues,
//     cb,
// )
// export function useDebounce(
//     value,
//     delay,
//     skipTriggerWithEqualValues,
//     cb,
// )
// export function useDebounce(
//     value,
//     delay,
//     skipTriggerWithEqualValues,
//     cb,
// ){
//     const [debouncedValue, setDebouncedValue] = useState(
//         skipTriggerWithEqualValues ? value : { current: value },
//     );

//     useEffect(() => {
//         const handler = setTimeout(() => {
//             setDebouncedValue(skipTriggerWithEqualValues ? value : { current: value });
//             if (cb) {
//                 cb();
//             }
//         }, delay);

//         return () => {
//             clearTimeout(handler);
//         };
//     }, [value, delay]);

//     return debouncedValue;
// }

import { useEffect, useState } from "react";

export function useDebounce(value, delay, skipTriggerWithEqualValues, cb) {
	const [debouncedValue, setDebouncedValue] = useState(
		skipTriggerWithEqualValues ? value : { current: value }
	);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(
				skipTriggerWithEqualValues ? value : { current: value }
			);
			if (cb) {
				cb();
			}
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay, skipTriggerWithEqualValues, cb]);

	return debouncedValue;
}
