import { useLayoutEffect } from "react";

export default function useAnimationEnd(animationRef, handler, offset = 50) {
	useLayoutEffect(() => {
		function checkAnimation(ref) {
			const computedStyle = getComputedStyle(ref.current);
			const name = computedStyle.animationName;
			const animationDuration =
				parseFloat(computedStyle.animationDuration) * 1000;
			const animationDelay = parseFloat(computedStyle.animationDelay) * 1000;

			const totalTime = animationDuration + animationDelay;

			setTimeout(() => {
				handler(name);
			}, totalTime - offset);
		}

		// start polling
		requestAnimationFrame(() => checkAnimation(animationRef));
	});
}
