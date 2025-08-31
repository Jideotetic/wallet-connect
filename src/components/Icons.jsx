import * as React from "react";
import styled from "styled-components";

import { flexAllCenter } from "web/mixins";
import { COLORS } from "web/styles";

import { MdSmsFailed } from "react-icons/md";
import { MdOutlinePending } from "react-icons/md";
import { FaCheck } from "react-icons/fa";

const IconBlock = styled.div`
	height: ${({ $isBig }) => ($isBig ? "5.6rem" : "4rem")};
	width: ${({ $isBig }) => ($isBig ? "5.6rem" : "4rem")};
	min-height: ${({ $isBig }) => ($isBig ? "5.6rem" : "4rem")};
	min-width: ${({ $isBig }) => ($isBig ? "5.6rem" : "4rem")};
	border-radius: 50%;
	background-color: #${COLORS.white};
	box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
	${flexAllCenter};

	svg {
		height: ${({ $isBig }) => ($isBig ? "3.4rem" : "2.4rem")};
		width: ${({ $isBig }) => ($isBig ? "3.4rem" : "2.4rem")};
	}
`;

export const IconSuccess = ({ isBig }) => (
	<IconBlock $isBig={isBig}>
		<FaCheck />
	</IconBlock>
);

export const IconFail = ({ isBig }) => (
	<IconBlock $isBig={isBig}>
		<MdSmsFailed />
	</IconBlock>
);

export const IconPending = ({ isBig }) => (
	<IconBlock $isBig={isBig}>
		<MdOutlinePending />
	</IconBlock>
);

export const IconSort = ({ isEnabled, isReversed }) => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M5 7L8 4L11 7"
			stroke={!isEnabled || isReversed ? COLORS.grayText : COLORS.transparent}
		/>
		<path
			d="M11 9L8 12L5 9"
			stroke={!isEnabled || !isReversed ? COLORS.grayText : COLORS.transparent}
		/>
	</svg>
);
