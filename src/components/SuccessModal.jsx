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

const SuccessModal = ({ params, close }) => {
	const { assets, amounts, title, isSwap, hash } = params;

	return (
		<div className="overflow-y-auto h-full">
			<h1 className="mb-4 text-2xl">{title ?? "Success"}</h1>
			<div className="flex flex-col gap-4 items-center justify-center rounded-md py-10 px-2 bg-gray-100">
				<Market
					assets={assets}
					verticalDirections
					withoutLink
					amounts={amounts}
					isSwapResult={isSwap}
				/>
				<a
					href={`https://stellar.expert/explorer/${
						getIsTestnetEnv() ? "testnet" : "public"
					}/tx/${hash}`}
				>
					View on Explorer
				</a>
			</div>

			<button
				className="bg-[#0F172A] my-6 font-semibold w-full p-4 text-white rounded-full cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
				onClick={() => close()}
			>
				Done
			</button>
		</div>
	);
};

export default SuccessModal;
