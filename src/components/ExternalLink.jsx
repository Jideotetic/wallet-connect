import * as React from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import { COLORS } from "web/styles";

import { FaLongArrowAltRight } from "react-icons/fa";

const styles = css`
	display: flex;
	flex-direction: row;
	align-items: center;
	color: ${COLORS.purple};
	font-size: 1.6rem;
	line-height: 2.8rem;
	cursor: pointer;
	text-decoration: none;
	white-space: nowrap;
`;

const LinkBody = styled.a`
	${styles};
`;

const LinkStyled = styled(Link)`
	${styles};
`;

const LinkBodyDiv = styled.div`
	${styles};

	a {
		text-decoration: none;
	}
`;

const ExternalLink = ({ children, asDiv, to, ...props }) => {
	if (asDiv) {
		return (
			<LinkBodyDiv {...props}>
				{children}
				<FaLongArrowAltRight />
			</LinkBodyDiv>
		);
	}

	if (to) {
		return (
			<LinkStyled to={to} {...props}>
				{children}
				<FaLongArrowAltRight />
			</LinkStyled>
		);
	}
	return (
		<LinkBody {...props} target="_blank" rel="noreferrer noopener">
			{children}
			<FaLongArrowAltRight />
		</LinkBody>
	);
};

export default ExternalLink;
