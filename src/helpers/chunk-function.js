export default async function chunkFunction(
	args,
	promiseFunction,
	chunkSize = 10
) {
	const result = [];
	for (let i = 0; i < args.length; i += chunkSize) {
		const chunk = args.slice(i, i + chunkSize);
		const chunkResult = await Promise.all(
			chunk.map((item) => promiseFunction(item))
		);
		result.push(...chunkResult);
	}
	return result;
}
