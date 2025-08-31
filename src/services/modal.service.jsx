import * as React from "react";

import { ModalBody } from "components/ModalBody";

import EventService from "./event.service";

const ModalEvents = {
	update: "update",
};

export default class ModalServiceClass {
	modals = [];
	id = 0;
	event = new EventService();

	openModal(
		modalTemplate,
		params = {},
		hideClose = false,
		backgroundImage = null,
		disableClickOutside = false,
		backButtonCb = null
	) {
		this.id += 1;
		let resolver = undefined;

		const promise = new Promise((resolve) => {
			const id = this.id;
			resolver = (data) => {
				resolve({ id, result: data });
			};
		});

		const modalTemplateElement = React.createElement(modalTemplate);

		let triggerClose = undefined;

		const triggerClosePromise = new Promise((resolve) => {
			triggerClose = resolve;
		});

		const state = { isActive: true };

		const wrapped = (
			<ModalBody
				state={state}
				resolver={resolver}
				params={params}
				key={this.id}
				hideClose={hideClose}
				triggerClosePromise={triggerClosePromise}
				backgroundImage={backgroundImage}
				disableClickOutside={disableClickOutside}
				backButtonCb={backButtonCb}
			>
				{modalTemplateElement}
			</ModalBody>
		);

		this.modals = [
			...this.modals.map((modal) => {
				modal.state.isActive = false;
				return modal;
			}),
			{
				id: this.id,
				modal: wrapped,
				closeModal: triggerClose,
				name: modalTemplate.name,
				state,
			},
		];

		this.event.trigger({ type: ModalEvents.update, modals: this.modals });

		return promise.then(({ result, id: modalId }) => {
			const newModals = this.modals.filter(({ id }) => id !== modalId);

			this.modals = newModals.map((modal, index) => {
				modal.state.isActive = index === newModals.length - 1;
				return modal;
			});
			this.event.trigger({ type: ModalEvents.update, modals: this.modals });
			return result;
		});
	}

	closeAllModals() {
		if (!this.modals.length) {
			return;
		}

		this.modals.forEach(({ closeModal }) => {
			closeModal({ isConfirmed: false });
		});
	}

	confirmAllModals() {
		if (!this.modals.length) {
			return;
		}

		this.modals.forEach(({ closeModal }) => {
			closeModal({ isConfirmed: true });
		});
	}

	closeModal(modalName) {
		const modal = this.modals.find(({ name }) => name === modalName);

		modal?.closeModal({ isConfirmed: false });
	}

	confirmModal(modalName) {
		const modal = this.modals.find(({ name }) => name === modalName);

		modal?.closeModal({ isConfirmed: true });
	}
}
