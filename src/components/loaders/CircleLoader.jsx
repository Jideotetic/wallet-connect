import { memo } from "react";
import styled from "styled-components";

import { FiLoader } from "react-icons/fi";

import { COLORS } from "web/styles";

const SizedLoader = styled(FiLoader).withConfig({
	shouldForwardProp: (prop) => prop !== "isWhite",
})`
	height: ${({ size }) => size}rem;
	width: ${({ size }) => size}rem;
	color: ${({ isWhite }) => (isWhite ? COLORS.white : COLORS.titleText)};
`;

const SIZES = {
	small: 1.6,
	medium: 3.2,
	large: 5.2,
};

const CircleLoader = ({ size = "medium", isWhite = false }) => (
	<SizedLoader size={SIZES[size]} isWhite={isWhite} />
);

export default memo(CircleLoader);
