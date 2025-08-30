import {
	StellarWalletsKit,
	FreighterModule,
	FREIGHTER_ID,
	xBullModule,
	AlbedoModule,
	HanaModule,
	RabetModule,
	HotWalletModule,
} from "@creit.tech/stellar-wallets-kit";
import { WatchWalletChanges } from "@stellar/freighter-api";

import { TransactionBuilder } from "@stellar/stellar-sdk";

import { getNetworkPassphrase } from "helpers/env";

import { ModalService, ToastService } from "services/globalServices";

import ChooseLoginMethodModal from "components/ChooseLoginMethodModal";
import WalletKitModal from "components/WalletKitModal";

import EventService from "./event.service";

export const WalletKitEvents = {
	login: "login",
	logout: "logout",
	accountChanged: "accountChanged",
};

export default class WalletKitServiceClass {
	walletKit;
	event = new EventService();
	watcher = null;

	constructor() {
		this.walletKit = new StellarWalletsKit({
			network: getNetworkPassphrase(),
			modules: [
				new FreighterModule(),
				new HotWalletModule(),
				new xBullModule(),
				new AlbedoModule(),
				new HanaModule(),
				new RabetModule(),
			],
			selectedWalletId: FREIGHTER_ID,
		});
	}

	startFreighterWatching(publicKey) {
		if (!this.watcher) {
			this.watcher = new WatchWalletChanges(1000);
		}
		this.watcher.watch(({ address }) => {
			if (publicKey === address || !address) {
				return;
			}
			this.event.trigger({
				type: WalletKitEvents.accountChanged,
				publicKey: address,
			});
		});
	}

	stopFreighterWatching() {
		this.watcher?.stop();
		this.watcher = null;
	}

	showWalletKitModal() {
		ModalService.closeAllModals();
		ModalService.openModal(
			WalletKitModal,
			{ modules: this.walletKit.modules },
			false,
			null,
			false,
			() => ModalService.openModal(ChooseLoginMethodModal)
		);
	}

	async login(id) {
		try {
			this.walletKit.setWallet(id);

			const { address } = await this.walletKit.getAddress();

			if (id === FREIGHTER_ID) {
				this.startFreighterWatching(address);
			}

			this.event.trigger({
				type: WalletKitEvents.login,
				publicKey: address,
				id,
			});
		} catch (e) {
			ToastService.showErrorToast(e.message);
		}
	}

	restoreLogin(id, publicKey) {
		this.walletKit.setWallet(id);

		if (id === FREIGHTER_ID) {
			this.startFreighterWatching(publicKey);
		}
	}

	async signTx(tx) {
		const xdr = tx.toEnvelope().toXDR("base64");
		const { signedTxXdr } = await this.walletKit.signTransaction(xdr);

		return TransactionBuilder.fromXDR(signedTxXdr, getNetworkPassphrase());
	}
}
