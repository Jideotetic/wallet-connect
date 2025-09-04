import { useEffect, useState } from "react";
import * as React from "react";

const DOTS_COUNT = 3;
const DOT_SYMBOL = ".";
const DOTS = new Array(DOTS_COUNT).fill(DOT_SYMBOL);

const DotsLoader = ({ ...props }) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % DOTS_COUNT);
		}, 300);

		return () => clearInterval(interval);
	}, []);

	return (
		<span {...props}>
			{DOTS.map((dot, index) => {
				const isVisible = index <= currentIndex;

				return (
					<span className={`${isVisible ? "visible" : "hidden"}`} key={index}>
						{dot}
					</span>
				);
			})}
		</span>
	);
};

export default DotsLoader;
