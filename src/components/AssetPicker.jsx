import * as React from "react";

import { ModalService } from "services/globalServices";

import { IoIosArrowDown } from "react-icons/io";

import AssetPickerModal from "./AssetPickerModal";
import AssetLogo from "./AssetLogo";

const AssetPicker = ({ asset, onUpdate, assetsList }) => (
	<div
		className="flex bg-white items-center border rounded-4xl gap-2 cursor-pointer p-1"
		onClick={() =>
			ModalService.openModal(AssetPickerModal, { assetsList, onUpdate })
		}
	>
		<AssetLogo asset={asset} />
		<div>{asset.code}</div>
		<IoIosArrowDown />
	</div>
);

export default AssetPicker;

// import * as React from "react";

// import { ModalService } from "services/globalServices";

// import { IoIosArrowDown } from "react-icons/io";

// import AssetPickerModal from "./AssetPickerModal";
// import AssetLogo from "./AssetLogo";

// const AssetPicker = ({ asset, onUpdate, assetsList }) => {
// 	const handleClick = () => {
// 		console.log("Opening AssetPickerModal");

// 		ModalService.openModal(AssetPickerModal, {
// 			assetsList,
// 			onUpdate: (selectedAsset) => {
// 				console.log("Asset selected in modal:", selectedAsset);
// 				onUpdate(selectedAsset);
// 			},
// 		})
// 			.then((result) => {
// 				console.log("Modal closed with result:", result);
// 			})
// 			.catch((error) => {
// 				console.error("Error in modal:", error);
// 			});
// 	};

// 	return (
// 		<div
// 			className="flex bg-white items-center border rounded-4xl gap-2 cursor-pointer p-2"
// 			onClick={handleClick}
// 		>
// 			<AssetLogo asset={asset} />
// 			<div className="font-medium">{asset.code}</div>
// 			<IoIosArrowDown className="text-gray-500" />
// 		</div>
// 	);
// };

// export default AssetPicker;
