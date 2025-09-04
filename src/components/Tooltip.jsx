// import { TOOLTIP_POSITION } from "constants/tool-tip";
// import * as React from "react";
// import { useEffect, useRef, useState } from "react";
// import styled, { css } from "styled-components";

// import { COLORS, Z_INDEX } from "web/styles";

// const TooltipTop = (background) => css`
// 	bottom: calc(100% + 0.8rem);
// 	left: 50%;
// 	transform: translateX(-50%);

// 	&::after {
// 		top: 100%;
// 		border-top: 0.6rem solid ${background};
// 		border-left: 0.6rem solid ${COLORS.transparent};
// 		border-right: 0.6rem solid ${COLORS.transparent};
// 	}

// 	&::before {
// 		height: 1rem;
// 		top: 100%;
// 		width: 100%;
// 	}
// `;

// const TooltipBottom = (background) => css`
// 	top: calc(100% + 0.8rem);
// 	left: 50%;
// 	transform: translateX(-50%);

// 	&::after {
// 		bottom: 100%;
// 		border-bottom: 0.6rem solid ${background};
// 		border-left: 0.6rem solid ${COLORS.transparent};
// 		border-right: 0.6rem solid ${COLORS.transparent};
// 	}

// 	&::before {
// 		height: 1rem;
// 		bottom: 100%;
// 		width: 100%;
// 	}
// `;

// const TooltipLeft = (background) => css`
// 	top: 50%;
// 	right: calc(100% + 0.8rem);
// 	transform: translateY(-50%);

// 	&::after {
// 		left: 100%;
// 		border-left: 0.6rem solid ${background};
// 		border-top: 0.6rem solid ${COLORS.transparent};
// 		border-bottom: 0.6rem solid ${COLORS.transparent};
// 	}

// 	&::before {
// 		width: 1.5rem;
// 		left: 100%;
// 		height: 100%;
// 	}
// `;

// const TooltipRight = (background) => css`
// 	top: 50%;
// 	left: calc(100% + 0.8rem);
// 	transform: translateY(-50%);

// 	&::after {
// 		right: 100%;
// 		border-right: 0.6rem solid ${background};
// 		border-top: 0.6rem solid ${COLORS.transparent};
// 		border-bottom: 0.6rem solid ${COLORS.transparent};
// 	}
// 	&::before {
// 		width: 1.5rem;
// 		right: 100%;
// 		height: 100%;
// 	}
// `;

// const TooltipBody = styled.div`
// 	position: absolute;
// 	display: flex;
// 	flex-direction: row;
// 	align-items: center;
// 	justify-content: center;
// 	padding: ${({ $withoutPadding }) =>
// 		$withoutPadding ? "0" : "0.9rem 1.2rem"};
// 	color: ${({ $color }) => $color};
// 	background-color: ${({ $background }) => $background};
// 	box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
// 	border-radius: 0.5rem;
// 	white-space: nowrap;
// 	z-index: ${Z_INDEX.tooltip};
// 	visibility: ${({ $isHidden }) => ($isHidden ? "hidden" : "visible")};

// 	// triangle
// 	&::after {
// 		content: "";
// 		display: block;
// 		position: absolute;
// 	}

// 	// hover layout
// 	&::before {
// 		position: absolute;
// 		content: "";
// 		background: ${COLORS.transparent};
// 	}

// 	${({ $position, $background }) =>
// 		($position === TOOLTIP_POSITION.top && TooltipTop($background)) ||
// 		($position === TOOLTIP_POSITION.bottom && TooltipBottom($background)) ||
// 		($position === TOOLTIP_POSITION.left && TooltipLeft($background)) ||
// 		($position === TOOLTIP_POSITION.right && TooltipRight($background))}
// `;

// const Tooltip = ({
// 	children,
// 	content,
// 	position,
// 	isShow,
// 	showOnHover,
// 	background = COLORS.tooltip,
// 	color = COLORS.white,
// 	withoutPadding = false,
// 	...props
// }) => {
// 	const [isTooltipVisible, setIsTooltipVisible] = useState(isShow);
// 	const [isFirstClick, setIsFirstClick] = useState(true);
// 	const [currentPosition, setCurrentPosition] = useState(
// 		position ?? TOOLTIP_POSITION.top
// 	);
// 	const [positionInProgress, setPositionInProgress] = useState(true);
// 	const [replaceCount, setReplacementCount] = useState(0);

// 	const handleClick = (e) => {
// 		e.stopPropagation();

// 		if (isFirstClick) {
// 			setIsTooltipVisible(true);
// 			setIsFirstClick(false);
// 		} else {
// 			setIsTooltipVisible((prev) => !prev);
// 		}
// 	};

// 	const handleMouseEnter = (e) => {
// 		e.stopPropagation();

// 		if (showOnHover) {
// 			setIsTooltipVisible(true);
// 		}
// 	};

// 	const handleMouseLeave = (e) => {
// 		e.stopPropagation();

// 		if (showOnHover) {
// 			setIsTooltipVisible(false);
// 		}
// 	};

// 	const tooltipRef = useRef(null);

// 	const validateAllDimensions = () => {
// 		if (!tooltipRef.current) {
// 			return false;
// 		}
// 		const OFFSET = 5; // 0.5rem
// 		const { top, left, right, bottom } =
// 			tooltipRef.current.getBoundingClientRect();

// 		const spaceAbove = top > OFFSET;
// 		const spaceBelow = bottom < window.innerHeight - OFFSET;
// 		const spaceLeft = left > OFFSET;
// 		const spaceRight = right < window.innerWidth - OFFSET;

// 		return spaceAbove && spaceBelow && spaceLeft && spaceRight;
// 	};

// 	useEffect(() => {
// 		if (!isTooltipVisible || !tooltipRef.current) {
// 			return;
// 		}

// 		if (replaceCount === 4) {
// 			setCurrentPosition(position || TOOLTIP_POSITION.top);
// 			setPositionInProgress(false);
// 			return;
// 		}
// 		const validPosition = validateAllDimensions();

// 		if (validPosition) {
// 			setPositionInProgress(false);
// 		} else {
// 			setReplacementCount((prev) => prev + 1);

// 			switch (currentPosition) {
// 				case TOOLTIP_POSITION.top:
// 					setCurrentPosition(TOOLTIP_POSITION.bottom);
// 					break;
// 				case TOOLTIP_POSITION.bottom:
// 					setCurrentPosition(TOOLTIP_POSITION.left);
// 					break;
// 				case TOOLTIP_POSITION.left:
// 					setCurrentPosition(TOOLTIP_POSITION.right);
// 					break;
// 				case TOOLTIP_POSITION.right:
// 					setCurrentPosition(TOOLTIP_POSITION.top);
// 					break;
// 			}
// 		}
// 	}, [currentPosition, isTooltipVisible, isShow, position, replaceCount]);

// 	return (
// 		<div
// 			className="relative flex w-fit h-fit"
// 			{...props}
// 			onClick={handleClick}
// 			onMouseEnter={handleMouseEnter}
// 			onMouseLeave={handleMouseLeave}
// 		>
// 			{children}
// 			{(showOnHover ? isTooltipVisible && isShow !== false : isShow) && (
// 				<div
// 					$position={currentPosition}
// 					$background={background}
// 					$color={color}
// 					$isHidden={positionInProgress}
// 					$withoutPadding={withoutPadding}
// 					ref={tooltipRef}
// 				>
// 					{content}
// 				</div>
// 			)}
// 		</div>
// 	);
// };

// export default Tooltip;

import { TOOLTIP_POSITION } from "constants/tool-tip";
import * as React from "react";
import { useEffect, useRef, useState } from "react";

const Tooltip = ({
	children,
	content,
	position,
	isShow,
	showOnHover,
	background = "bg-gray-800",
	color = "text-white",
	withoutPadding = false,
	...props
}) => {
	const [isTooltipVisible, setIsTooltipVisible] = useState(isShow);
	const [isFirstClick, setIsFirstClick] = useState(true);
	const [currentPosition, setCurrentPosition] = useState(
		position ?? TOOLTIP_POSITION.top
	);
	const [positionInProgress, setPositionInProgress] = useState(true);
	const [replaceCount, setReplacementCount] = useState(0);

	const handleClick = (e) => {
		e.stopPropagation();

		if (isFirstClick) {
			setIsTooltipVisible(true);
			setIsFirstClick(false);
		} else {
			setIsTooltipVisible((prev) => !prev);
		}
	};

	const handleMouseEnter = (e) => {
		e.stopPropagation();

		if (showOnHover) {
			setIsTooltipVisible(true);
		}
	};

	const handleMouseLeave = (e) => {
		e.stopPropagation();

		if (showOnHover) {
			setIsTooltipVisible(false);
		}
	};

	const tooltipRef = useRef(null);

	const validateAllDimensions = () => {
		if (!tooltipRef.current) {
			return false;
		}
		const OFFSET = 5;
		const { top, left, right, bottom } =
			tooltipRef.current.getBoundingClientRect();

		const spaceAbove = top > OFFSET;
		const spaceBelow = bottom < window.innerHeight - OFFSET;
		const spaceLeft = left > OFFSET;
		const spaceRight = right < window.innerWidth - OFFSET;

		return spaceAbove && spaceBelow && spaceLeft && spaceRight;
	};

	useEffect(() => {
		if (!isTooltipVisible || !tooltipRef.current) {
			return;
		}

		if (replaceCount === 4) {
			setCurrentPosition(position || TOOLTIP_POSITION.top);
			setPositionInProgress(false);
			return;
		}
		const validPosition = validateAllDimensions();

		if (validPosition) {
			setPositionInProgress(false);
		} else {
			setReplacementCount((prev) => prev + 1);

			switch (currentPosition) {
				case TOOLTIP_POSITION.top:
					setCurrentPosition(TOOLTIP_POSITION.bottom);
					break;
				case TOOLTIP_POSITION.bottom:
					setCurrentPosition(TOOLTIP_POSITION.left);
					break;
				case TOOLTIP_POSITION.left:
					setCurrentPosition(TOOLTIP_POSITION.right);
					break;
				case TOOLTIP_POSITION.right:
					setCurrentPosition(TOOLTIP_POSITION.top);
					break;
			}
		}
	}, [currentPosition, isTooltipVisible, isShow, position, replaceCount]);

	const getPositionClasses = () => {
		const baseClasses =
			"absolute bg-gray-300 flex flex-row items-center justify-center shadow-xl rounded whitespace-nowrap";
		const paddingClass = withoutPadding ? "p-0" : "py-2 px-3";
		const visibilityClass = positionInProgress ? "invisible" : "visible";

		switch (currentPosition) {
			case TOOLTIP_POSITION.top:
				return `${baseClasses} ${paddingClass} ${visibilityClass} ${background} ${color} z-40 bottom-full left-1/2 -translate-x-1/2 mb-2 after:content-[''] after:block after:absolute after:top-full after:border-t-[0.6rem] after:border-l-[0.6rem] after:border-r-[0.6rem] after:border-t-[color:inherit] after:border-l-transparent after:border-r-transparent before:content-[''] before:absolute before:h-2.5 before:top-full before:w-full before:bg-transparent`;

			case TOOLTIP_POSITION.bottom:
				return `${baseClasses} ${paddingClass} ${visibilityClass} ${background} ${color} z-40 top-full left-1/2 -translate-x-1/2 mt-2 after:content-[''] after:block after:absolute after:bottom-full after:border-b-[0.6rem] after:border-l-[0.6rem] after:border-r-[0.6rem] after:border-b-[color:inherit] after:border-l-transparent after:border-r-transparent before:content-[''] before:absolute before:h-2.5 before:bottom-full before:w-full before:bg-transparent`;

			case TOOLTIP_POSITION.left:
				return `${baseClasses} ${paddingClass} ${visibilityClass} ${background} ${color} z-40 top-1/2 right-full -translate-y-1/2 mr-2 after:content-[''] after:block after:absolute after:left-full after:border-l-[0.6rem] after:border-t-[0.6rem] after:border-b-[0.6rem] after:border-l-[color:inherit] after:border-t-transparent after:border-b-transparent before:content-[''] before:absolute before:w-3 before:left-full before:h-full before:bg-transparent`;

			case TOOLTIP_POSITION.right:
				return `${baseClasses} ${paddingClass} ${visibilityClass} ${background} ${color} z-40 top-1/2 left-full -translate-y-1/2 ml-2 after:content-[''] after:block after:absolute after:right-full after:border-r-[0.6rem] after:border-t-[0.6rem] after:border-b-[0.6rem] after:border-r-[color:inherit] after:border-t-transparent after:border-b-transparent before:content-[''] before:absolute before:w-3 before:right-full before:h-full before:bg-transparent`;

			default:
				return `${baseClasses} ${paddingClass} ${visibilityClass} ${background} ${color} z-40`;
		}
	};

	return (
		<div
			className="relative flex w-fit h-fit"
			{...props}
			onClick={handleClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{children}
			{(showOnHover ? isTooltipVisible && isShow !== false : isShow) && (
				<div ref={tooltipRef} className={getPositionClasses()}>
					{content}
				</div>
			)}
		</div>
	);
};

export default Tooltip;
