import * as React from "react";

import { formatBalance } from "helpers/format-number";

import { TokenType } from "types/token";

import { IoIosSwap } from "react-icons/io";

import DotsLoader from "./loaders/DotsLoader";

const Price = ({
	baseAmount,
	counterAmount,
	pending,
	base,
	counter,
	isReverted,
	setIsReverted,
	hasError,
	...props
}) => {
	if ((!Number(baseAmount) && !Number(counterAmount)) || hasError) {
		return null;
	}

	if (pending || !baseAmount || !counterAmount) {
		return (
			<div className="text-[#6B6C83] my-4 mx-0 flex items-center justify-end cursor-pointer h-7">
				1 {base.code} = <DotsLoader style={{ margin: "0 0.5rem" }} />{" "}
				{counter.code}
			</div>
		);
	}

	return (
		<div
			className="text-[#6B6C83] my-4 mx-0 flex items-center justify-end cursor-pointer h-7"
			onClick={() => setIsReverted(!isReverted)}
			{...props}
		>
			{isReverted
				? `1 ${counter.code} = ${formatBalance(
						+(+baseAmount / +counterAmount).toFixed(
							base.type === TokenType.soroban ? base.decimal : 7
						)
				  )} ${base.code}`
				: `1 ${base.code} = ${formatBalance(
						+(+counterAmount / +baseAmount).toFixed(
							counter.type === TokenType.soroban ? counter.decimal : 7
						)
				  )} ${counter.code}`}
			<IoIosSwap />
		</div>
	);
};

export default Price;
