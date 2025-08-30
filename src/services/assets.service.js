import EventService from "./event.service";

export const AssetsEvent = {
	newAssets: "newAssets",
};
export default class AssetsServiceClass {
	event = new EventService();

	processAssets(assets) {
		this.event.trigger({ type: AssetsEvent.newAssets, payload: assets });
	}
}
