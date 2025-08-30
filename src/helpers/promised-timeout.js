export default function PromisedTimeout(timeout) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(void 0), timeout);
	});
}
