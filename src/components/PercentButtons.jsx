import * as React from "react";

import useAuthStore from "store/authStore/useAuthStore";

const PercentButtons = ({ setPercent }) => {
	const { account } = useAuthStore();

	if (!account) {
		return null;
	}
	return (
		<div className="flex">
			<div className="flex">
				<div
					className="py-0 px-2 cursor-pointer text-gray-400 hover:text-gray-600"
					onClick={() => setPercent(25)}
				>
					25%
				</div>
				<div
					className="py-0 px-2 cursor-pointer text-gray-400 hover:text-gray-600"
					onClick={() => setPercent(50)}
				>
					50%
				</div>
				<div
					className="py-0 px-2 cursor-pointer text-gray-400 hover:text-gray-600"
					onClick={() => setPercent(75)}
				>
					75%
				</div>
				<div
					className="py-0 px-2 cursor-pointer text-gray-400 hover:text-gray-600"
					onClick={() => setPercent(100)}
				>
					100%
				</div>
			</div>
		</div>
	);
};

export default PercentButtons;
