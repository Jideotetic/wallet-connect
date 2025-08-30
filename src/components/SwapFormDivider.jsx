import * as React from "react";

import { IoIosSwap } from "react-icons/io";

const SwapFormDivider = ({ pending, onRevert }) => (
	<div className="border rounded-full w-fit mx-auto border-gray-200">
		{pending ? (
			<div className="p-4">
				<IoIosSwap className="animate-spin" />
			</div>
		) : (
			<div className="p-4 cursor-pointer" onClick={() => onRevert()}>
				<IoIosSwap />
			</div>
		)}
	</div>
);

export default SwapFormDivider;
