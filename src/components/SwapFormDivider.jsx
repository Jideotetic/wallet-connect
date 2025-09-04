import * as React from "react";

import { RxLoop } from "react-icons/rx";

const SwapFormDivider = ({ pending, onRevert }) => (
	<div className="border border-white -translate-x-1/2 -translate-y-1/2 transform z-10 rounded-full w-fit mx-auto bg-gray-200 absolute top-1/2 left-1/2">
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
