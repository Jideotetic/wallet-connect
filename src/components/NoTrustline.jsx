import * as React from "react";
import { useState } from "react";

import ErrorHandler from "helpers/error-handler";
import { openCurrentWalletIfExist } from "helpers/wallet-connect-helpers";

import { LoginTypes } from "store/authStore/types";
import useAuthStore from "store/authStore/useAuthStore";

import {
	ModalService,
	StellarService,
	ToastService,
} from "services/globalServices";
import { BuildSignAndSubmitStatuses } from "services/wallet-connect.service";

import { TokenType } from "types/token";

import { FaPlus } from "react-icons/fa";

import Asset from "./Asset";

const NoTrustline = ({
	asset,
	onlyButton,
	closeModalAfterSubmit,
	...props
}) => {
	const [trustlinePending, setTrustlinePending] = useState(false);

	const { account } = useAuthStore();

	const addTrust = async () => {
		if (account.authType === LoginTypes.walletConnect) {
			openCurrentWalletIfExist();
		}
		setTrustlinePending(true);
		try {
			const op = StellarService.createAddTrustOperation(asset);

			const tx = await StellarService.buildTx(account, op);

			const result = await account.signAndSubmitTx(tx);

			if (result?.status === BuildSignAndSubmitStatuses.pending) {
				ToastService.showSuccessToast("More signatures required to complete");
				return;
			}
			ToastService.showSuccessToast("Trustline added successfully");
			if (closeModalAfterSubmit) {
				ModalService.closeAllModals();
			}
			setTrustlinePending(false);
		} catch (e) {
			const errorText = ErrorHandler(e);
			ToastService.showErrorToast(errorText);
			setTrustlinePending(false);
		}
	};

	if (asset.type === TokenType.soroban) {
		return null;
	}

	if (!account || account.getAssetBalance(asset) !== null) {
		return null;
	}

	if (onlyButton) {
		return (
			<button
				className="bg-[#0F172A] font-semibold w-full p-4 text-white rounded-full cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
				onClick={() => addTrust()}
				disabled={trustlinePending}
				{...props}
			>
				add trustline
			</button>
		);
	}

	return (
		<div
			className="flex flex-col gap-3 p-4 bg-white rounded-md text-[#6B6C83]"
			{...props}
		>
			<div className="flex items-center gap-3.5 font-bold text-xl">
				<Asset asset={asset} onlyLogo />{" "}
				<span>{asset.code} trustline missing</span>
			</div>
			<p>
				You can't receive the {asset.code} asset because you haven't added this
				trustline. Please add the {asset.code} trustline to continue the
				transaction.
			</p>
			<button
				className="bg-[#0F172A] font-semibold w-fit flex items-center gap-2 p-4 text-white rounded-full cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
				onClick={() => addTrust()}
				disabled={trustlinePending}
			>
				add {asset.code} trustline <FaPlus />
			</button>
		</div>
	);
};

export default NoTrustline;
