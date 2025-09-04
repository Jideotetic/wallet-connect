import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";

import useAnimationEnd from "hooks/useAnimationEnd";
import useOnClickOutside from "hooks/useOutsideClick";

import { IoMdClose } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa";

import { flexAllCenter, respondDown } from "web/mixins";
import { Breakpoints, COLORS, Z_INDEX } from "web/styles";

const ModalWrapper = styled.div`
	position: fixed;
	z-index: ${Z_INDEX.modal};
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	${flexAllCenter};
	border: 2px solid red;

	&:last-child {
		background: rgba(15, 0, 35, 0.8);
	}

	${respondDown(Breakpoints.md)`
          &:last-child {
              background: transparent;
          }
    `};
`;

const ModalInner = styled.div`
	border-radius: 1rem;
	background: ${COLORS.white};
	box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
	padding: ${({ $withBackground }) =>
		$withBackground ? "0 0 1rem" : "6.4rem 0 0"};
	animation: ${({ $isShow }) => ($isShow ? "opening 300ms" : "closing 300ms")};
	position: relative;
	border: 2px solid green;

	${respondDown(Breakpoints.md)`
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        border-radius: 0;
        padding: ${({ $withBackground }) =>
					$withBackground ? "0 0 1rem" : "3.2rem 0 1rem"};
        overflow-y: auto;
    `};

	@keyframes opening {
		0% {
			transform: translateY(-100vh);
			opacity: 0;
		}
		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes closing {
		0% {
			transform: translateY(0);
			opacity: 1;
		}
		100% {
			transform: translateY(-100vh);
			opacity: 0;
		}
	}
`;

const ModalContent = styled.div`
	margin: 0 3.8rem 4.8rem;

	${respondDown(Breakpoints.md)`
        margin: 0 1.6rem 2rem;
    `};
`;

const CloseButton = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	cursor: pointer;
	padding: 2.5rem;
	box-sizing: border-box;
	background-color: ${({ $withBackground }) =>
		$withBackground ? COLORS.white : COLORS.lightGray};
	border-radius: 1rem;

	${respondDown(Breakpoints.md)`
        padding: 2rem;
    `};
`;

const BackButton = styled(CloseButton)`
	right: 7rem;
`;

const BackgroundBlock = styled.div`
	background-color: ${COLORS.lightGray};
	max-height: 28.2rem;
	overflow: hidden;
	margin-bottom: 4rem;
	border-radius: 1rem 1rem 0 0;
`;

export const ModalBody = ({
	resolver,
	children,
	params,
	hideClose,
	triggerClosePromise,
	backgroundImage,
	disableClickOutside,
	backButtonCb,
	state,
}) => {
	const [isShow, setIsShow] = useState(true);
	const [resolvedData, setResolvedData] = useState(null);
	const ref = useRef(null);

	const close = () => {
		setIsShow(false);
		setResolvedData({ isConfirmed: false });
	};

	const transitionHandler = () => {
		if (!isShow) {
			resolver(resolvedData);
		}
	};

	useAnimationEnd(ref, transitionHandler);

	const clickHandler = ({ key }) => {
		if (!hideClose && key === "Escape") {
			close();
		}
	};

	useLayoutEffect(() => {
		document.addEventListener("keydown", clickHandler, false);

		return () => {
			document.removeEventListener("keydown", clickHandler, false);
		};
	});

	const confirm = (data) => {
		setIsShow(false);
		setResolvedData({ ...data, isConfirmed: true });
	};

	useOnClickOutside(ref, () => {
		if (!hideClose && !disableClickOutside && state.isActive) {
			close();
		}
	});

	useEffect(() => {
		triggerClosePromise.then((res) => {
			setIsShow(false);
			setResolvedData(res);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="fixed z-50 top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-black/80 border-3 border-red-600">
			<ModalInner
				ref={ref}
				$isShow={isShow}
				$withBackground={Boolean(backgroundImage)}
			>
				{backgroundImage && (
					<BackgroundBlock>{backgroundImage}</BackgroundBlock>
				)}
				{Boolean(backButtonCb) && (
					<BackButton
						onClick={() => {
							close();
							backButtonCb();
						}}
						$withBackground={Boolean(backgroundImage)}
					>
						<FaArrowLeft />
					</BackButton>
				)}
				{!hideClose && (
					<CloseButton
						onClick={() => close()}
						$withBackground={Boolean(backgroundImage)}
					>
						<IoMdClose />
					</CloseButton>
				)}
				<ModalContent>
					{React.cloneElement(children, { confirm, close, params })}
				</ModalContent>
			</ModalInner>
		</div>
	);
};
