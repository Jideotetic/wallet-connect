import * as React from "react";

import { ModalService } from "services/globalServices";

import { IoIosArrowDown } from "react-icons/io";

import AssetPickerModal from "./AssetPickerModal";
import AssetLogo from "./AssetLogo";

const AssetPicker = ({ asset, onUpdate, assetsList }) => (
	<div
		className="flex w-fit ml-auto border border-gray-200 items-center rounded-4xl gap-2 cursor-pointer p-1"
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
