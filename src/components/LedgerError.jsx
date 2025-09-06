import * as React from "react";

const LedgerError = ({ close }) => (
	<div className="overflow-y-auto h-full">
		<h1 className="mb-4 text-2xl">Ledger app is unavailable</h1>
		<p className="text-lg text-gray-500 mb-8">
			Could not access your Ledger account. Ensure your Ledger is not locked
			after the idle timeout, the Stellar app is opened, and the firmware
			version is updated. If it still does not work, make sure that your Ledger
			device is not used on another site.
		</p>
		<button
			className="bg-[#0F172A] my-6 font-semibold w-full p-4 text-white rounded-full cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
			onClick={() => close()}
		>
			Close
		</button>
	</div>
);

export default LedgerError;
