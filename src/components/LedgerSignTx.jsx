import * as React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { useIsMounted } from "hooks/useIsMounted";

import Button from "./buttons/Button";
import { IconFail, IconPending, IconSuccess } from "./Icons";
import DotsLoader from "./loaders/DotsLoader";
import { ModalDescription, ModalTitle, ModalWrapper } from "./ModalAtoms";

import { flexAllCenter, respondDown } from "../web/mixins";
import { Breakpoints, COLORS } from "../web/styles";

const TX_STATUSES = {
	pending: "pending",
	success: "success",
	fail: "fail",
};

const STATUS_DESCRIPTION = {
	[TX_STATUSES.pending]: "Waiting For Confirmation",
	[TX_STATUSES.success]: "Transaction Completed",
	[TX_STATUSES.fail]: "Transaction Rejected",
};

const IconContainer = styled.div`
	padding-top: 8rem;
	padding-bottom: 2.4rem;
	width: 50rem;
	background-color: ${COLORS.lightGray};
	${flexAllCenter};

	${respondDown(Breakpoints.md)`
        width: unset;
    `}
`;

const Status = styled.div`
	padding-top: 2.4rem;
	padding-bottom: 4.5rem;
	margin-bottom: 3.2rem;
	background-color: ${COLORS.lightGray};
	${flexAllCenter};
`;

const RightButton = styled(Button)`
	margin-top: 1.6rem;
	margin-left: auto;

	${respondDown(Breakpoints.md)`
          margin-left: unset;
          width: 100%;
    `}
`;

const LedgerSignTx = ({ params, close }) => {
	const { result } = params;

	const [status, setStatus] = useState(TX_STATUSES.pending);

	const isMounted = useIsMounted();

	useEffect(() => {
		result
			.then(() => {
				if (!result || !isMounted.current) {
					return;
				}
				setStatus(TX_STATUSES.success);
			})
			.catch(() => {
				if (isMounted.current) {
					setStatus(TX_STATUSES.fail);
				}
			});
	}, [isMounted, result]);

	return (
		<ModalWrapper>
			<ModalTitle>Transaction</ModalTitle>
			<ModalDescription>
				View and sign the transaction in Ledger Device
			</ModalDescription>

			<IconContainer>
				{status === TX_STATUSES.pending && <IconPending isBig />}
				{status === TX_STATUSES.fail && <IconFail isBig />}
				{status === TX_STATUSES.success && <IconSuccess isBig />}
			</IconContainer>

			<Status>
				{STATUS_DESCRIPTION[status]}
				{status === TX_STATUSES.pending && <DotsLoader />}
			</Status>

			<RightButton onClick={() => close()}>Close</RightButton>
		</ModalWrapper>
	);
};

export default LedgerSignTx;
