import isUaWebview from "is-ua-webview";
import * as React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { isChrome, isMobile } from "helpers/browser";

import { LoginTypes } from "store/authStore/types";
import useAuthStore from "store/authStore/useAuthStore";

import {
	LedgerService,
	LobstrExtensionService,
	ModalService,
	ToastService,
	WalletConnectService,
	WalletKitService,
} from "services/globalServices";

import { IoExtensionPuzzleOutline } from "react-icons/io5";

import { IoIosArrowForward } from "react-icons/io";
import { FaKey } from "react-icons/fa";
import { SiKnowledgebase } from "react-icons/si";
import { CiGlobe } from "react-icons/ci";
import { SiWalletconnect } from "react-icons/si";
import { TbAlignBoxLeftTop } from "react-icons/tb";

import Label from "./Label";
import { ModalTitle, ModalWrapper } from "./ModalAtoms";

import LoginWithPublic from "./LoginWithPublic";
import LoginWithSecret from "./LoginWithSecret";

import { respondDown } from "../web/mixins";
import { Breakpoints, COLORS } from "../web/styles";
import GetLobstrExtensionModal from "./GetLobstrExtensionModal";
import LedgerLogin from "./LedgerLogin";

export const LoginMethod = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	height: 9rem;
	background-color: ${COLORS.lightGray};
	border-radius: 0.5rem;
	padding: 0 2.4rem 0 2.4rem;
	box-sizing: border-box;
	transition: all ease-in 150ms;
	cursor: pointer;

	&:not(:last-child) {
		margin-bottom: 1.6rem;
	}

	&:hover {
		padding-right: 1.9rem;
	}

	${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

export const LoginMethodWithDescription = styled.div`
	display: flex;
	flex-direction: column;
`;

export const LoginMethodName = styled.span`
	font-size: 1.6rem;
	line-height: 2.8rem;
	color: ${COLORS.paragraphText};
	margin-left: 2.4rem;
	display: flex;
	gap: 0.8rem;
	align-items: center;

	div {
		height: fit-content;
	}
`;

export const LoginMethodDescription = styled.div`
	font-size: 1.4rem;
	line-height: 2rem;
	color: ${COLORS.grayText};
	margin-left: 2.4rem;
`;

const ChooseLoginMethodModal = ({ close, params }) => {
	const [pending, setPending] = useState(false);
	const {
		enableRedirect,
		disableRedirect,
		addAuthCallback,
		removeAuthCallback,
	} = useAuthStore();

	useEffect(() => {
		if (params.redirectURL) {
			enableRedirect(params.redirectURL);
		} else {
			disableRedirect();
		}
	}, [disableRedirect, enableRedirect, params.redirectURL]);

	useEffect(() => {
		if (params.callback) {
			addAuthCallback(params.callback);
		} else {
			removeAuthCallback();
		}
	}, [addAuthCallback, params.callback, removeAuthCallback]);

	const chooseMethod = (method) => {
		if (pending) {
			return;
		}
		switch (method) {
			case LoginTypes.walletConnect:
				// We make the assumption that if the application is open via WebView,
				// then wallet knows how to process the custom postMessage
				if (isUaWebview(window?.navigator?.userAgent)) {
					close();
					WalletConnectService.autoLogin();
				} else {
					WalletConnectService.login();
				}
				break;

			case LoginTypes.ledger:
				LedgerService.isSupported.then((res) => {
					if (res) {
						close();
						ModalService.openModal(LedgerLogin, {});
					} else {
						ToastService.showErrorToast(
							"Ledger Wallet is not supported by your browser."
						);
					}
				});
				break;

			case LoginTypes.walletKit:
				WalletKitService.showWalletKitModal();
				break;
			case LoginTypes.public:
				close();
				ModalService.openModal(LoginWithPublic, {});
				break;
			case LoginTypes.secret:
				close();
				ModalService.openModal(LoginWithSecret, {});
				break;
			case LoginTypes.lobstr:
				if (!isChrome()) {
					ToastService.showErrorToast(
						"LOBSTR wallet is not supported by your browser."
					);
					return;
				}
				setPending(true);
				LobstrExtensionService.isConnected.then((res) => {
					if (res) {
						setPending(false);
						LobstrExtensionService.login().then(() => {
							close();
						});
					} else {
						setPending(false);
						close();
						ModalService.openModal(
							GetLobstrExtensionModal,
							{},
							false,
							<IoExtensionPuzzleOutline />
						);
					}
				});
				break;
		}
	};

	console.log("Login...");

	return (
		<div className="max-h-[calc(100vh-300px)]">
			<h1 className="mb-4">Sign in</h1>

			<div
				className="flex items-center justify-between gap-4 p-4 bg-gray-100 rounded-2xl mb-4"
				onClick={() => chooseMethod(LoginTypes.walletKit)}
			>
				<div className="flex items-center gap-4">
					<TbAlignBoxLeftTop className="text-2xl" />

					<div>
						<p>Stellar Wallet Kit</p>
						<span className="text-xs">
							Freighter, HOT Wallet, xBull, Albedo, Hana Wallet, Rabet
						</span>
					</div>
				</div>

				<IoIosArrowForward />
			</div>

			{!isMobile() && (
				<div
					className="flex items-center justify-between p-4 bg-gray-100 rounded-2xl mb-4"
					onClick={() => chooseMethod(LoginTypes.lobstr)}
				>
					<div className="flex items-center gap-4">
						<CiGlobe className="text-2xl" />
						<p>LOBSTR wallet</p>
					</div>
					<IoIosArrowForward />
				</div>
			)}

			<div
				className="flex items-center justify-between gap-4 p-4 bg-gray-100 rounded-2xl mb-4"
				onClick={() => chooseMethod(LoginTypes.walletConnect)}
			>
				<div className="flex items-center gap-4">
					<SiWalletconnect className="text-2xl" />
					<p>WalletConnect</p>
				</div>
				<IoIosArrowForward />
			</div>

			<div
				className="flex items-center justify-between gap-4 p-4 bg-gray-100 rounded-2xl mb-4"
				onClick={() => chooseMethod(LoginTypes.ledger)}
			>
				<div className="flex items-center gap-4">
					<SiKnowledgebase className="text-2xl" />
					<p>Ledger</p>
				</div>

				<IoIosArrowForward />
			</div>

			<div
				className="flex items-center justify-between gap-4 p-4 bg-gray-100 rounded-2xl mb-4"
				onClick={() => chooseMethod(LoginTypes.public)}
			>
				<div className="flex items-center gap-4">
					<TbAlignBoxLeftTop className="text-2xl" />

					<div>
						<p>Stellar Laboratory</p>
						<span className="text-xs">Sign with Stellar Laboratory.</span>
					</div>
				</div>

				<IoIosArrowForward />
			</div>

			<div
				className="flex items-center justify-between gap-4 p-4 bg-gray-100 rounded-2xl"
				onClick={() => chooseMethod(LoginTypes.secret)}
			>
				<div className="flex items-center gap-4">
					<FaKey className="text-2xl" />
					<p>Secret key</p>
				</div>

				<IoIosArrowForward />
			</div>
		</div>
	);
};

export default ChooseLoginMethodModal;
