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
		<div className="overflow-y-auto h-full">
			<h1 className="mb-4 text-2xl">Log in with Ledger</h1>
			<p className="text-lg text-gray-500 mb-8">
				Make sure your Ledger Wallet is connected with the Stellar application
				open on it.
				<br />
				Enter the Ledger account number you want to log in to. Or use the
				default account 44'/148'/0'.
			</p>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					onSubmit();
				}}
			>
				<div className="border border-gray-300 p-4 flex gap-2 rounded-md">
					<p className="shrink-0">Path: 44'/148'/</p>
					<input
						className="w-full border-none outline-none"
						value={path}
						onChange={(e) => setPath(e.target.value)}
						placeholder="0"
						type="number"
						min="0"
						max="2147483647"
						onInvalid={(e) =>
							e.target.setCustomValidity(
								"Only integer less or equal 2147483647"
							)
						}
						onInput={(e) => e.target.setCustomValidity("")}
						inputMode="decimal"
					/>
				</div>

				<button
					className="bg-[#0F172A] my-6 font-semibold w-full p-4 text-white rounded-full cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
					type="submit"
					disabled={pending}
				>
					connect
				</button>
			</form>
		</div>
	);
};

export default LedgerLogin;
