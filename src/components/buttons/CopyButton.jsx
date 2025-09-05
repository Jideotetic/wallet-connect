import * as React from "react";
import { useEffect, useRef, useState } from "react";

import { COLORS } from "web/styles";

import { IoCopyOutline } from "react-icons/io5";

import Tooltip from "../Tooltip";
import { TOOLTIP_POSITION } from "constants/tool-tip";

const CopyButton = ({ text, children, withoutLogo, ...props }) => {
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
			content={<div className="text-white">Copied!</div>}
			position={TOOLTIP_POSITION.top}
			isShow={isShowTooltip}
			color={COLORS.white}
		>
			<div
				className="flex flex-row items-center text-lg gap-1 cursor-pointer"
				onClick={() => copyText()}
				{...props}
			>
				{children}
				{!withoutLogo && <IoCopyOutline />}
			</div>
		</Tooltip>
	);
};

export default CopyButton;
