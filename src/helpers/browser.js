import { detect, browserName } from "detect-browser";

export function detectEnv(userAgent) {
	return detect(userAgent);
}

export function detectOS() {
	const env = detectEnv();
	return env && env.os ? env.os : undefined;
}

export function isAndroid() {
	const os = detectOS();
	return os ? os.toLowerCase().includes("android") : false;
}

export function isIOS() {
	const os = detectOS();
	return os
		? os.toLowerCase().includes("ios") ||
				(os.toLowerCase().includes("mac") && navigator.maxTouchPoints > 1)
		: false;
}

export function isMobile() {
	const os = detectOS();
	return os ? isAndroid() || isIOS() : false;
}

export function isChrome() {
	const browser = browserName(window?.navigator?.userAgent);

	return browser === "chrome";
}
