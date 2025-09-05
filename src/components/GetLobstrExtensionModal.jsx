import styled from "styled-components";

import Button from "./buttons/Button";
import ExternalLink from "./ExternalLink";
import { ModalDescription, ModalTitle, ModalWrapper } from "./ModalAtoms";
import { FaLongArrowAltRight } from "react-icons/fa";

const StyledButton = styled(Button)`
	margin-top: 5.4rem;
`;

const GetLobstrExtensionModal = () => (
	<div className="overflow-y-auto h-full">
		<h1 className="mb-4 text-2xl">Install LOBSTR signer extension</h1>
		<p className="text-lg text-gray-500 mb-8">
			LOBSTR signer extension is not installed in your browser.
			<br />
			Signer extension allows you to sign in to Aquarius with your Stellar
			wallet from the LOBSTR app. You can install the LOBSTR signer extension
			from the Chrome Web Store.
		</p>

		<a
			className="flex gap-2 items-center"
			href="https://lobstr.freshdesk.com/a/solutions/articles/151000183963?portalId=151000006220"
		>
			How to sign in with LOBSTR signer extension?
			<FaLongArrowAltRight />
		</a>

		<button
			className="bg-[#0F172A] my-6 font-semibold w-full p-4 text-white rounded-full cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
			onClick={() =>
				window.open(
					"https://chromewebstore.google.com/detail/lobstr-signer-extension/ldiagbjmlmjiieclmdkagofdjcgodjle",
					"_blank"
				)
			}
		>
			Install extension
		</button>
	</div>
);

export default GetLobstrExtensionModal;
