import * as React from "react";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import styled from "styled-components";

import { getWalletsList } from "api/wallet-connect";

import { isAndroid, isIOS, isMobile } from "helpers/browser";
import {
	clearCurrentWallet,
	saveCurrentWallet,
} from "helpers/wallet-connect-helpers";

import { flexAllCenter } from "web/mixins";
import { COLORS } from "web/styles";

import ArrowRight from "assets/icon-arrow-right.svg";

import Button from "./buttons/Button";
import CopyButton from "./buttons/CopyButton";
import ExternalLink from "./ExternalLink";
import ToggleGroup from "basics/inputs/ToggleGroup";
import { ModalDescription, ModalTitle, ModalWrapper } from "./ModalAtoms";
import { FaLongArrowAltRight } from "react-icons/fa";

const QRContainer = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 7.2rem;
`;

const CopyButtonContainer = styled.div`
	margin-top: 3.2rem;
	margin-bottom: 3.2rem;
`;

const MobileTitle = styled.span`
	display: inline;
	font-size: 2rem;
`;

const ToggleGroupStyled = styled(ToggleGroup)`
	display: flex;
	width: 100%;
	justify-content: space-evenly;
	margin-bottom: 4rem;
	margin-top: 2.4rem;

	label {
		padding: 0.8rem 0;
		width: 100%;
	}
`;

const AndroidButtonBlock = styled.div`
	${flexAllCenter};
	border-radius: 0.5rem;
	background: ${COLORS.lightGray};
	padding: 6rem 0;
	margin-top: 2.2rem;
`;

const IosBlock = styled.div`
	margin-top: 2.4rem;
`;

const AppBlock = styled.div`
	display: flex;
	align-items: center;
	border-radius: 0.5rem;
	background: ${COLORS.lightGray};
	padding: 1.9rem 2.4rem 1.9rem 1.9rem;

	&:not(:last-child) {
		margin-bottom: 0.8rem;
	}
`;

const AppName = styled.span`
	font-size: 1.6rem;
	color: ${COLORS.paragraphText};
`;

const AppLogo = styled.img`
	height: 5.2rem;
	width: 5.2rem;
	margin-right: 1.2rem;
	border-radius: 0.8rem;
`;

const ArrowRightIcon = styled(ArrowRight)`
	margin-left: auto;
`;

const ModalStates = {
	mobile: "mobile",
	qr: "qr",
};

function formatIOSMobile(uri, wallet) {
	const encodedUri = encodeURIComponent(uri);
	return wallet.mobile.universal
		? `${wallet.mobile.universal}/wc?uri=${encodedUri}`
		: wallet.mobile.native
		? `${wallet.mobile.native}${
				wallet.mobile.native.endsWith(":") ? "//" : "/"
		  }wc?uri=${encodedUri}`
		: "";
}

const QRModal = ({ params }) => {
	const { uri } = params;

	const [wallets, setWallets] = useState(null);
	const [modalState, setModalState] = useState(
		isMobile() ? ModalStates.mobile : ModalStates.qr
	);

	useEffect(() => {
		if (modalState === ModalStates.qr) {
			clearCurrentWallet();
		}
	}, [modalState]);

	useEffect(() => {
		if (isIOS()) {
			getWalletsList().then((res) => {
				setWallets(res);
			});
		}
	}, []);

	return (
		<div className="overflow-y-auto h-full">
			{isMobile() && (
				<>
					<h1 className="mb-4 text-2xl">WalletConnect</h1>
					<div
						className="flex w-full justify-evenly mb-4 mt-2"
						options={[
							{ label: "Mobile", value: ModalStates.mobile },
							{ label: "QR code", value: ModalStates.qr },
						]}
						value={modalState}
						onChange={setModalState}
					/>
				</>
			)}
			<h1 className="mb-4 text-2xl">
				{modalState === ModalStates.qr ? "Scan QR code" : ""}
				{isAndroid() && modalState === ModalStates.mobile
					? "Connect to Mobile Wallet"
					: ""}
				{isIOS() && modalState === ModalStates.mobile
					? "Choose your preferred wallet"
					: ""}
			</h1>

			{modalState === ModalStates.qr && (
				<>
					<p className="text-lg text-gray-500 mb-8">
						Open your WalletConnect-compatible app with Stellar support, like
						LOBSTR wallet, and scan the QR code to connect.
					</p>
					<a
						className="flex gap-2 items-center"
						href="https://lobstr.freshdesk.com/support/solutions/articles/151000001589-walletconnect-how-[…]nd-use-your-stellar-wallet-from-lobstr-with-other-services"
					>
						How to connect LOBSTR wallet?
						<FaLongArrowAltRight />
					</a>

					<div className="w-full flex flex-col items-center mt-10">
						<QRCode value={uri} size={170} />

						<div className="mt-10">
							<CopyButton text={uri}>
								<span>Copy to clipboard</span>
							</CopyButton>
						</div>
					</div>
				</>
			)}
			{modalState === ModalStates.mobile &&
				(isAndroid() ? (
					<AndroidButtonBlock
						onClick={() => {
							saveCurrentWallet("Unknown", uri);
							window.open(uri, "_blank");
						}}
					>
						<Button>connect</Button>
					</AndroidButtonBlock>
				) : (
					<>
						{wallets && (
							<IosBlock>
								{wallets.map((wallet) => (
									<AppBlock
										key={wallet.id}
										onClick={() => {
											const link = formatIOSMobile(uri, wallet);
											saveCurrentWallet(wallet.name, link);
											window.open(link, "_blank");
										}}
									>
										<AppLogo src={wallet.image_url.md} alt="" />
										<AppName>{wallet.name}</AppName>
										<ArrowRightIcon />
									</AppBlock>
								))}
							</IosBlock>
						)}
					</>
				))}
		</div>
	);
};

export default QRModal;
