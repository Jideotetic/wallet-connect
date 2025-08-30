import { MAX_X_ICE_BOOST } from "constants/ice";

export const getIceMaxApy = ({ apy, inPercent = true }) => {
	return inPercent ? apy * 100 * MAX_X_ICE_BOOST : apy * MAX_X_ICE_BOOST;
};
