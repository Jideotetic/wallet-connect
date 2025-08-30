import LedgerStr from "@ledgerhq/hw-app-str";
import LedgerTransport from "@ledgerhq/hw-transport-webusb";
import * as StellarSdk from "@stellar/stellar-sdk";

import LedgerError from "components/LedgerError";

import EventService from "./event.service";
import { ModalService } from "./globalServices";

const LEDGER_DEFAULT_ACCOUNT =
	"GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
export const LEDGER_CANCEL_ERROR = "Transaction approval request was rejected";

export const LedgerEvents = {
	login: "login",
	logout: "logout",
};

export default class LedgerServiceClass {
	api = null;
	bipSlot = null;
	bipPath;
	event = new EventService();
	accountId = "";

	constructor() {}

	get isSupported() {
		return LedgerTransport.isSupported();
	}

	async login(bipPath) {
		try {
			const transport = await LedgerTransport.create();
			this.api = new LedgerStr(transport);

			await this.api.getAppConfiguration();

			const path = `44'/148'/${bipPath}'`;
			const { rawPublicKey } = await this.api.getPublicKey(path);
			const publicKey = StellarSdk.StrKey.encodeEd25519PublicKey(rawPublicKey);

			if (!publicKey || publicKey === LEDGER_DEFAULT_ACCOUNT) {
				throw new Error();
			}

			this.bipSlot = bipPath;
			this.bipPath = path;
			this.accountId = publicKey;
			this.event.trigger({
				type: LedgerEvents.login,
				publicKey,
				bipPath,
			});
		} catch {
			ModalService.openModal(LedgerError, {});
		}
	}

	async reLogin(bipPath, pubKey) {
		try {
			const transport = await LedgerTransport.create();
			this.api = new LedgerStr(transport);

			await this.api.getAppConfiguration();

			const path = `44'/148'/${bipPath}'`;

			this.bipSlot = bipPath;
			this.bipPath = path;
			this.accountId = pubKey;
			this.event.trigger({
				type: LedgerEvents.login,
				publicKey: pubKey,
				bipPath,
			});
		} catch {
			ModalService.openModal(LedgerError, {});
		}
	}

	async signTx(tx) {
		await this.login(this.bipSlot);

		const isSoroban = tx.operations.some(
			(op) =>
				op.type === "invokeHostFunction" ||
				op.type === "restoreFootprint" ||
				op.type === "extendFootprintTtl"
		);

		try {
			const { signature } = isSoroban
				? await this.api.signHash(this.bipPath, tx.hash())
				: await this.api.signTransaction(this.bipPath, tx.signatureBase());

			const keypair = StellarSdk.Keypair.fromPublicKey(this.accountId);
			const hint = keypair.signatureHint();

			const decorated = new StellarSdk.xdr.DecoratedSignature({
				hint,
				signature,
			});

			tx.signatures.push(decorated);

			return tx;
		} catch (e) {
			throw e.message;
		}
	}
}
