import { useState } from "react";
import styled from "styled-components";

import { LedgerService } from "services/globalServices";

import Button from "./buttons/Button";
import Input from "./inputs/Input";
import { ModalDescription, ModalTitle, ModalWrapper } from "./ModalAtoms";

import { respondDown } from "../web/mixins";
import { Breakpoints } from "../web/styles";

const Prefix = styled.div`
	margin-top: 0.1rem;
	font-size: 1.6rem;
	padding-right: 0.2rem;
`;

const StyledButton = styled(Button)`
	margin-top: 3.1rem;
	margin-left: auto;

	${respondDown(Breakpoints.md)`
            width: 100%;
        `}
`;

const LedgerLogin = ({ close }) => {
	const [path, setPath] = useState("");
	const [pending, setPending] = useState(false);
	const onSubmit = () => {
		setPending(true);
		LedgerService.login(Number(path))
			.then(() => {
				setPending(false);
				close();
			})
			.catch(() => {
				setPending(false);
			});
	};

	return (
		<ModalWrapper>
			<ModalTitle>Log in with Ledger</ModalTitle>
			<ModalDescription>
				Make sure your Ledger Wallet is connected with the Stellar application
				open on it.
				<br />
				Enter the Ledger account number you want to log in to. Or use the
				default account 44'/148'/0'.
			</ModalDescription>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					onSubmit();
				}}
			>
				<Input
					value={path}
					onChange={(e) => setPath(e.target.value)}
					prefixCustom={<Prefix>Path: 44'/148'/</Prefix>}
					placeholder="0"
					type="number"
					min="0"
					max="2147483647"
					onInvalid={(e) =>
						e.target.setCustomValidity("Only integer less or equal 2147483647")
					}
					onInput={(e) => e.target.setCustomValidity("")}
					inputMode="decimal"
				/>

				<StyledButton isBig type="submit" pending={pending}>
					connect
				</StyledButton>
			</form>
		</ModalWrapper>
	);
};

export default LedgerLogin;
