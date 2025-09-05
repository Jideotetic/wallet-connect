import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import useAnimationEnd from "hooks/useAnimationEnd";
import useOnClickOutside from "hooks/useOutsideClick";

import { IoMdClose } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa";

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
		<div className="fixed z-50 top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-black/80 p-4">
			<div
				className="bg-white rounded-md w-full md:max-w-[600px] p-8 h-[calc(100vh-100px)] border-3 overflow-hidden"
				ref={ref}
			>
				{backgroundImage && (
					<div className="bg-[#FAFAFB]">{backgroundImage}</div>
				)}
				{Boolean(backButtonCb) && (
					<button
						className=""
						onClick={() => {
							close();
							backButtonCb();
						}}
					>
						<FaArrowLeft />
					</button>
				)}
				{!hideClose && (
					<button
						className="ml-auto block cursor-pointer p-4 border border-gray-300 rounded-md"
						onClick={() => close()}
					>
						<IoMdClose />
					</button>
				)}
				<div className="h-full">
					{React.cloneElement(children, { confirm, close, params })}
				</div>
			</div>
		</div>
	);
};
