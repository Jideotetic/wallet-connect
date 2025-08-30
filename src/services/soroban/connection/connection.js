import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";

import { BASE_FEE } from "constants/stellar";

import { getNetworkPassphrase } from "helpers/env";
import {
	SorobanErrorHandler,
	SorobanPrepareTxErrorHandler,
} from "helpers/error-handler";
import { getSorobanUrl } from "helpers/url";

import { ModalService } from "services/globalServices";

import RestoreContractModal from "components/RestoreContractModal";

let server = null;
let keypair = null;

export function startServer() {
	server = new rpc.Server(getSorobanUrl());
}

export function loginWithSecret(secretKey) {
	return new Promise((resolve, reject) => {
		try {
			keypair = StellarSdk.Keypair.fromSecret(secretKey);

			resolve(keypair.publicKey());
		} catch (e) {
			reject(e);
		}
	});
}

export function logoutWithSecret() {
	if (keypair) {
		keypair = null;
	}
}

export function pollTx(hash) {
	return server
		.pollTransaction(hash, {
			attempts: 30,
			sleepStrategy: () => 2000,
		})
		.then((res) => {
			if (res.status === "SUCCESS") {
				return res.returnValue;
			}
			throw new Error(
				"Transaction failed because of timeout. Please make another attempt."
			);
		});
}

export function processResponse(response) {
	if (response.status === "TRY_AGAIN_LATER") {
		throw new Error("Try again later");
	}
	if (response.status === "DUPLICATE") {
		return pollTx(response.hash);
	}
	if (response.status !== "PENDING") {
		throw new Error(
			SorobanErrorHandler(response.errorResult.result().switch().name)
		);
	}
	return pollTx(response.hash);
}

export async function tryRestore(tx) {
	const sim = await server.simulateTransaction(tx);

	if (!sim.restorePreamble) {
		return Promise.resolve();
	}

	const account = await server.getAccount(tx.source);
	let fee = parseInt(BASE_FEE);

	fee += parseInt(sim.restorePreamble.minResourceFee);

	const restoreTx = new StellarSdk.TransactionBuilder(account, {
		fee: fee.toString(),
	})
		.setNetworkPassphrase(getNetworkPassphrase())
		.setSorobanData(sim.restorePreamble.transactionData.build())
		.addOperation(StellarSdk.Operation.restoreFootprint({}))
		.setTimeout(StellarSdk.TimeoutInfinite)
		.build();

	ModalService.openModal(RestoreContractModal, { tx: restoreTx });

	return Promise.reject({ message: "Something expired" });
}

export async function buildSmartContractTx(
	publicKey,
	contractId,
	method,
	...args
) {
	const acc = await server.getAccount(publicKey);
	const contract = new StellarSdk.Contract(contractId);
	const builtTx = new StellarSdk.TransactionBuilder(acc, {
		fee: BASE_FEE,
		networkPassphrase: getNetworkPassphrase(),
	});
	if (args) {
		builtTx.addOperation(contract.call(method, ...args));
	} else {
		builtTx.addOperation(contract.call(method));
	}
	return builtTx.setTimeout(StellarSdk.TimeoutInfinite).build();
}

export function buildSmartContractTxFromOp(publicKey, operation) {
	return server.getAccount(publicKey).then((acc) => {
		const builtTx = new StellarSdk.TransactionBuilder(acc, {
			fee: BASE_FEE,
			networkPassphrase: getNetworkPassphrase(),
		});

		builtTx.addOperation(operation);

		return builtTx.setTimeout(StellarSdk.TimeoutInfinite).build();
	});
}

export function signWithSecret(tx) {
	tx.sign(keypair);
	return tx;
}

export function getAccount(publicKey) {
	return server.getAccount(publicKey);
}

export async function submitTx(tx) {
	const res = await server.sendTransaction(tx);
	return await processResponse(res);
}

export function simulateTx(tx) {
	return server.simulateTransaction(tx);
}

export function prepareTransaction(tx) {
	return tryRestore(tx).then(() =>
		server.prepareTransaction(tx).catch((err) => {
			throw SorobanPrepareTxErrorHandler(err);
		})
	);
}

export function getLedgerEntries(...args) {
	return server.getLedgerEntries(...args);
}
