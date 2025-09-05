import * as React from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";

import { LoginTypes } from "store/authStore/types";
import useAuthStore from "store/authStore/useAuthStore";

import { StellarService, ToastService } from "services/globalServices";

import Button from "./buttons/Button";
import Input from "./inputs/Input";
import { ModalDescription, ModalTitle, ModalWrapper } from "./ModalAtoms";

import { respondDown } from "../web/mixins";
import { Breakpoints } from "../web/styles";

const LoginWithSecretBody = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;

	${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Description = styled(ModalDescription)`
	${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const StyledButton = styled(Button)`
	${respondDown(Breakpoints.md)`
            width: 100%;
        `}
`;

const InputWrapped = styled(Input)`
	margin-bottom: 3.1rem;
`;

const LoginWithPublic = ({ close }) => {
	const location = useLocation();
	const path = location.pathname.substring(1);
	const [publicKey, setPublicKey] = useState(
		StellarService.isValidPublicKey(path) ? path : ""
	);

	const { login, isLogged, isLoginPending } = useAuthStore();

	const onSubmit = () => {
		if (!StellarService.isValidPublicKey(publicKey)) {
			ToastService.showErrorToast("Invalid public key");
			return;
		}

		login({
			pubKey: publicKey,
			loginType: LoginTypes.public,
		});
	};

	useEffect(() => {
		if (isLogged) {
			close();
		}
	}, [isLogged, close]);

	return (
		<div className="overflow-y-auto h-full">
			<h1 className="mb-4 text-2xl">Public key</h1>
			<p className="text-lg text-gray-500 mb-8">
				Enter your public key, started from “G”
			</p>
			<div>
				<input
					className="w-full p-4 border border-gray-300 rounded-md"
					placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
					maxLength={56}
					value={publicKey}
					onChange={({ target }) => setPublicKey(target.value)}
				/>
				<button
					className="bg-[#0F172A] my-6 font-semibold w-full p-4 text-white rounded-full cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
					disabled={!publicKey || (isLoginPending ?? undefined)}
					onClick={() => onSubmit()}
				>
					connect
				</button>
			</div>
		</div>
	);
};

export default LoginWithPublic;
