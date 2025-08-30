import styled from "styled-components";

import Vault from "assets/vault.svg";

import Button from "./buttons/Button";
import { ModalDescription, ModalTitle, ModalWrapper } from "./ModalAtoms";

import { respondDown } from "../web/mixins";
import { Breakpoints } from "../web/styles";

const Title = styled(ModalTitle)`
	margin-top: 2.4rem;
`;

const StyledButton = styled(Button)`
	margin-top: 3.1rem;
	margin-left: auto;

	${respondDown(Breakpoints.md)`
            width: 100%;
        `}
`;

const SentToVault = ({ close }) => (
	<ModalWrapper>
		<Vault />
		<Title>More signatures required</Title>
		<ModalDescription>
			Transaction has been sent to your Lobstr Vault
		</ModalDescription>
		<StyledButton onClick={() => close()}>Close</StyledButton>
	</ModalWrapper>
);

export default SentToVault;
