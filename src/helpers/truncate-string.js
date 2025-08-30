export const truncateString = (str, length = 5) =>
	`${str.slice(0, length)}...${str.slice(-length)}`;
