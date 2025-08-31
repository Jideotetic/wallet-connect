export default class Timer {
	callback;
	remainingTime;
	startTime;
	timerId;

	constructor(callback, delay) {
		this.callback = callback;
		this.remainingTime = delay;
	}

	start() {
		this.startTime = Date.now();
		this.timerId = setTimeout(() => this.callback(), this.remainingTime);
	}

	pause() {
		clearTimeout(this.timerId);
		this.remainingTime -= Date.now() - this.startTime;
	}

	resume() {
		this.startTime = Date.now();
		this.timerId = setTimeout(() => this.callback(), this.remainingTime);
	}

	clear() {
		if (this.timerId) {
			clearTimeout(this.timerId);
		}
	}
}
