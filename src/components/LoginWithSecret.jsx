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
		<div className="overflow-y-auto h-full">
			<h1 className="mb-4 text-2xl">Secret key</h1>
			<p className="text-lg text-gray-500 mb-8">
				We recommend using WalletConnect login as it provides better security.
				Secret key login is not recommended and will be deprecated shortly.
				Check the URL and make sure you are on the correct website.
			</p>
			<div>
				<input
					className="w-full p-4 border border-gray-300 rounded-md"
					placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
					maxLength={56}
					value={secretKey}
					type="password"
					onChange={({ target }) => setSecretKey(target.value)}
				/>
				<button
					className="bg-[#0F172A] my-6 font-semibold w-full p-4 text-white rounded-full cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
					type="submit"
					disabled={!secretKey || (isLoginPending ?? undefined)}
					onClick={(e) => onSubmit(e)}
				>
					connect
				</button>
			</div>
		</div>
	);
};

export default LoginWithSecret;
