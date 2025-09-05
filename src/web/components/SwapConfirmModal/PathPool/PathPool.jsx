import * as React from "react";
import { AmmRoutes } from "constants/routes";
import { FaLongArrowAltRight } from "react-icons/fa";

const PathPool = ({ baseIcon, counterIcon, fee, address, isLastPool }) => (
	<div className="flex items-center flex-col justify-center mt-1">
		<div
			className="flex flex-col items-center justify-center cursor-pointer"
			onClick={() => window.open(`${AmmRoutes.analytics}${address}`)}
		>
			<div className="flex p-1 rounded-full border shadow gap-2 border-gray-200">
				{baseIcon}
				{counterIcon}
			</div>
			<span className="text-xs text-center">
				{(Number(fee) * 100).toFixed(2)}%
			</span>
		</div>
		{!isLastPool && <FaLongArrowAltRight />}
	</div>
);

export default PathPool;
