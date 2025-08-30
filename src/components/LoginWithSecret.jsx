import * as React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { LoginTypes } from "store/authStore/types";
import useAuthStore from "store/authStore/useAuthStore";

import { SorobanService, ToastService } from "services/globalServices";

import Button from "./buttons/Button";
import Input from "./inputs/Input";
import { ModalDescription, ModalTitle, ModalWrapper } from "./ModalAtoms";

import { respondDown } from "../web/mixins";
import { Breakpoints } from "../web/styles";

const LoginWithSecretBody = styled.form`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
`;

const InputWrapped = styled(Input)`
	margin-bottom: 3.1rem;
`;

const StyledButton = styled(Button)`
	${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const LoginWithSecret = ({ close }) => {
	const [secretKey, setSecretKey] = useState("");

	const { login, isLogged, isLoginPending } = useAuthStore();

	const onSubmit = (e) => {
		e.preventDefault();
		SorobanService.connection
			.loginWithSecret(secretKey)
			.then((pubKey) => {
				login({
					pubKey,
					loginType: LoginTypes.secret,
				});
			})
			.catch(() => {
				ToastService.showErrorToast("Invalid secret key");
			});
	};

	useEffect(() => {
		if (isLogged) {
			close();
		}
	}, [isLogged, close]);

	return (
		<ModalWrapper>
			<ModalTitle>Secret key</ModalTitle>
			<ModalDescription>
				We recommend using WalletConnect login as it provides better security.
				Secret key login is not recommended and will be deprecated shortly.
				Check the URL and make sure you are on the correct website.
			</ModalDescription>
			<LoginWithSecretBody>
				<InputWrapped
					placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
					maxLength={56}
					value={secretKey}
					type="password"
					onChange={({ target }) => setSecretKey(target.value)}
				/>
				<StyledButton
					type="submit"
					isBig
					disabled={!secretKey}
					onClick={(e) => onSubmit(e)}
					pending={isLoginPending ?? undefined}
				>
					connect
				</StyledButton>
			</LoginWithSecretBody>
		</ModalWrapper>
	);
};

export default LoginWithSecret;
