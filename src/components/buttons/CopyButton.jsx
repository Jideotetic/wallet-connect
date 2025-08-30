import * as React from "react";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { COLORS } from "web/styles";

import CopyIcon from "assets/icon-copy.svg";

import Tooltip from "../Tooltip";
import { TOOLTIP_POSITION } from "constants/tool-tip";

const CopyButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	font-size: 1.6rem;
	line-height: 2.8rem;
	color: ${({ isBlackText }) =>
		isBlackText ? COLORS.paragraphText : COLORS.purple};
	cursor: pointer;
`;

const CopyIconStyled = styled(CopyIcon)`
	margin-left: 0.8rem;
`;

const Inner = styled.div`
	color: ${COLORS.white};
`;

const CopyButton = ({ text, children, withoutLogo, isBlackText, ...props }) => {
	const [isShowTooltip, setIsShowTooltip] = useState(false);
	const timerRef = useRef(null);

	const copyText = async () => {
		clearTimeout(timerRef.current);
		if (!navigator.clipboard) {
			const el = document.createElement("textarea");
			el.value = text;
			document.body.appendChild(el);
			el.select();
			document.execCommand("copy");
			document.body.removeChild(el);
		} else {
			await navigator.clipboard.writeText(text);
		}

		setIsShowTooltip(true);
		timerRef.current = setTimeout(() => {
			setIsShowTooltip(false);
		}, 2000);
	};

	// unmount effect
	useEffect(() => () => clearTimeout(timerRef.current), []);

	return (
		<Tooltip
			content={<Inner>Copied!</Inner>}
			position={TOOLTIP_POSITION.top}
			isShow={isShowTooltip}
			color={COLORS.white}
		>
			<CopyButtonContainer
				onClick={() => copyText()}
				{...props}
				isBlackText={isBlackText}
			>
				{children}
				{!withoutLogo && <CopyIconStyled />}
			</CopyButtonContainer>
		</Tooltip>
	);
};

export default CopyButton;
