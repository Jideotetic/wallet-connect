import styled from "styled-components";

import { getIsTestnetEnv } from "helpers/env";

import { flexAllCenter } from "web/mixins";
import { COLORS } from "web/styles";

import Button from "./buttons/Button";
import ExternalLink from "./ExternalLink";
import Market from "./Market";
import { ModalTitle, ModalWrapper } from "./ModalAtoms";

const AssetsInfo = styled.div`
	${flexAllCenter};
	flex-direction: column;
	padding: 3.5rem 0;
	background-color: ${COLORS.lightGray};
	border-radius: 0.5rem;
	margin-top: 4rem;
	gap: 2.4rem;
`;

const StyledButton = styled(Button)`
	margin-left: auto;
	margin-top: 4.8rem;
`;

const SuccessModal = ({ params, close }) => {
	const { assets, amounts, title, isSwap, hash } = params;

	return (
		<ModalWrapper>
			<ModalTitle>{title ?? "Success"}</ModalTitle>
			<AssetsInfo>
				<Market
					assets={assets}
					verticalDirections
					withoutLink
					amounts={amounts}
					isSwapResult={isSwap}
				/>
				<ExternalLink
					href={`https://stellar.expert/explorer/${
						getIsTestnetEnv() ? "testnet" : "public"
					}/tx/${hash}`}
				>
					View on Explorer
				</ExternalLink>
			</AssetsInfo>

			<StyledButton onClick={() => close()}>done</StyledButton>
		</ModalWrapper>
	);
};

export default SuccessModal;
