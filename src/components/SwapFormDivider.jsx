import * as React from "react";

import { RxLoop } from "react-icons/rx";

const SwapFormDivider = ({ pending, onRevert }) => (
	<div className="border rounded-full w-fit mx-auto border-gray-200">
		{pending ? (
			<div className="p-4">
				<RxLoop className="animate-spin" />
			</div>
		) : (
			<div className="p-4 cursor-pointer" onClick={() => onRevert()}>
				<RxLoop />
			</div>
		)}
	</div>
);

export default SwapFormDivider;
