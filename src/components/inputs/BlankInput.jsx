import * as React from "react";
import { forwardRef, useEffect, useRef, useState } from "react";

const BlankInput = forwardRef((props, ref) => {
	const { value = "", ...rest } = props;

	const wrapperRef = useRef(null);
	const textRef = useRef(null);
	const [fontSize, setFontSize] = useState(34);
	const rafId = useRef(null);

	const updateFontSize = React.useCallback(() => {
		if (!textRef.current || !wrapperRef.current) return;

		const wrapperWidth = wrapperRef.current.offsetWidth;
		let size = 36;

		while (size > 12) {
			textRef.current.style.fontSize = `${size}px`;
			const textWidth = textRef.current.offsetWidth;

			if (textWidth <= wrapperWidth) break;
			size -= 1;
		}

		setFontSize(size);
	}, []);

	// Use rAF to throttle updates
	const requestFontSizeUpdate = React.useCallback(() => {
		if (rafId.current !== null) {
			cancelAnimationFrame(rafId.current);
		}
		rafId.current = requestAnimationFrame(updateFontSize);
	}, [updateFontSize]);

	useEffect(() => {
		requestFontSizeUpdate();
	}, [value, requestFontSizeUpdate]);

	useEffect(() => {
		const resizeObserver = new ResizeObserver(() => {
			requestFontSizeUpdate();
		});

		if (wrapperRef.current) {
			resizeObserver.observe(wrapperRef.current);
		}

		return () => {
			resizeObserver.disconnect();
			if (rafId.current !== null) cancelAnimationFrame(rafId.current);
		};
	}, [requestFontSizeUpdate]);

	return (
		<div className="relative w-full" ref={wrapperRef}>
			<div className="hidden" ref={textRef} fontSize={fontSize}>
				{value || " "}
			</div>
			<input
				className="bg-none border-none py-8 w-full outline-none text-2xl focus:border-none disabled:text-[#4B4E67]"
				{...rest}
				value={value}
				ref={ref}
			/>
		</div>
	);
});

BlankInput.displayName = "BlankInput";

export default BlankInput;
