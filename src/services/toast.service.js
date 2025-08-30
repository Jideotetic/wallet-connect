import EventService from "./event.service";

export const TOAST_TYPE = {
	success: "success",
	error: "error",
};

const ToastEvents = {
	update: "update",
};

export default class ToastServiceClass {
	id = 1;
	toasts = [];
	event = new EventService();

	showSuccessToast(text, delay) {
		this.showToast(TOAST_TYPE.success, text, delay);
	}

	showErrorToast(text, delay) {
		this.showToast(TOAST_TYPE.error, text, delay);
	}

	showToast(type, text, delay = 5000) {
		this.id += 1;
		let resolver = undefined;

		const promise = new Promise((resolve) => {
			const id = this.id;
			resolver = () => {
				resolve({ id });
			};
		});

		this.toasts = [
			...this.toasts,
			{
				text,
				type,
				id: this.id,
				resolver,
				delay,
			},
		];

		if (window?.navigator?.vibrate) {
			window?.navigator?.vibrate(200);
		}
		this.event.trigger({ type: ToastEvents.update, toasts: this.toasts });

		promise.then(({ id }) => {
			this.toasts = this.toasts.filter((toast) => toast.id !== id);
			this.event.trigger({ type: ToastEvents.update, toasts: this.toasts });
		});
	}
}
