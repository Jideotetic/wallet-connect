import styled, { css } from "styled-components";

export const bigLogoStyles = (isCircle) => css`
	height: 8rem;
	width: 8rem;
	max-height: 8rem;
	max-width: 8rem;
	min-width: 8rem;
	border-radius: ${isCircle ? "50%" : "0.5rem"};
`;

export const Logo = styled.img`
	${({ $isSmall, $isBig, $isCircle }) => {
		if ($isSmall) {
			return smallLogoStyles($isCircle);
		}
		if ($isBig) {
			return bigLogoStyles($isCircle);
		}
		return logoStyles($isCircle);
	}}
`;

export const logoStyles = (isCircle = true) => css`
	height: 3.2rem;
	width: 3.2rem;
	max-height: 3.2rem;
	max-width: 3.2rem;
	min-width: 3.2rem;
	border-radius: ${isCircle ? "50%" : "0.1rem"};
`;

export const smallLogoStyles = (isCircle) => css`
	height: 1.6rem;
	width: 1.6rem;
	max-height: 1.6rem;
	max-width: 1.6rem;
	min-width: 1.6rem;
	border-radius: ${isCircle ? "50%" : "0.1rem"};
`;
