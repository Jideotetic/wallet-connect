import * as StellarSdk from "@stellar/stellar-sdk";
import { xdr } from "@stellar/stellar-sdk";
import BigNumber from "bignumber.js";

import { POOL_TYPE } from "constants/amm";
import {
	AMM_CONTRACT_METHOD,
	ASSET_CONTRACT_METHOD,
	BATCH_CONTRACT_METHOD,
	CONTRACTS,
} from "constants/soroban";
import { ACCOUNT_FOR_SIMULATE } from "constants/stellar";

import { getAssetString } from "helpers/assets";
import { getEnv } from "helpers/env";

import {
	buildSmartContractTx,
	buildSmartContractTxFromOp,
	prepareTransaction,
	simulateTx,
} from "services/soroban/connection/connection";
import {
	orderTokens,
	parseTokenContractId,
} from "services/soroban/contracts/tokenContract";
import {
	amountToInt128,
	amountToUint128,
	amountToUint32,
	contractIdToScVal,
	i128ToInt,
	publicKeyToScVal,
	scValToArray,
} from "services/soroban/utils/scValHelpers";

const AMM_SMART_CONTRACT_ID = CONTRACTS[getEnv()].amm;
const BATCH_SMART_CONTRACT_ID = CONTRACTS[getEnv()].batch;

export function getInitConstantPoolTx(
	accountId,
	base,
	counter,
	fee,
	createInfo
) {
	const args = [
		publicKeyToScVal(accountId),
		scValToArray(
			orderTokens([base, counter]).map((asset) =>
				contractIdToScVal(asset.contract)
			)
		),
		amountToUint32(fee),
	];

	const operation = StellarSdk.Operation.invokeContractFunction({
		contract: AMM_SMART_CONTRACT_ID,
		function: AMM_CONTRACT_METHOD.INIT_CONSTANT_POOL,
		args,
		auth: [
			new xdr.SorobanAuthorizationEntry({
				credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
				rootInvocation: new xdr.SorobanAuthorizedInvocation({
					function:
						xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
							new xdr.InvokeContractArgs({
								contractAddress: contractIdToScVal(
									AMM_SMART_CONTRACT_ID
								).address(),
								functionName: AMM_CONTRACT_METHOD.INIT_CONSTANT_POOL,
								args,
							})
						),
					subInvocations: [
						new xdr.SorobanAuthorizedInvocation({
							function:
								xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
									new xdr.InvokeContractArgs({
										functionName: ASSET_CONTRACT_METHOD.TRANSFER,
										contractAddress: contractIdToScVal(
											createInfo.token.contract
										).address(),
										args: [
											publicKeyToScVal(accountId),
											contractIdToScVal(createInfo.destination),
											amountToInt128(
												createInfo.constantFee,
												createInfo.token.decimal
											),
										],
									})
								),
							subInvocations: [],
						}),
					],
				}),
			}),
		],
	});

	return buildSmartContractTxFromOp(accountId, operation).then((tx) =>
		prepareTransaction(tx)
	);
}

export function getInitStableSwapPoolTx(accountId, assets, fee, createInfo) {
	const args = [
		publicKeyToScVal(accountId),
		scValToArray(
			orderTokens(assets).map((asset) => contractIdToScVal(asset.contract))
		),
		amountToUint32(fee * 100),
	];

	const transferInvocation = new xdr.SorobanAuthorizedInvocation({
		function:
			xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
				new xdr.InvokeContractArgs({
					functionName: ASSET_CONTRACT_METHOD.TRANSFER,
					contractAddress: contractIdToScVal(
						createInfo.token.contract
					).address(),
					args: [
						publicKeyToScVal(accountId),
						contractIdToScVal(createInfo.destination),
						amountToInt128(createInfo.stableFee, createInfo.token.decimal),
					],
				})
			),
		subInvocations: [],
	});

	const rootInvocation = new xdr.SorobanAuthorizationEntry({
		credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
		rootInvocation: new xdr.SorobanAuthorizedInvocation({
			function:
				xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
					new xdr.InvokeContractArgs({
						contractAddress: contractIdToScVal(AMM_SMART_CONTRACT_ID).address(),
						functionName: AMM_CONTRACT_METHOD.INIT_STABLESWAP_POOL,
						args,
					})
				),
			subInvocations: [transferInvocation],
		}),
	});

	const operation = StellarSdk.Operation.invokeContractFunction({
		contract: AMM_SMART_CONTRACT_ID,
		function: AMM_CONTRACT_METHOD.INIT_STABLESWAP_POOL,
		args,
		auth: [rootInvocation],
	});

	return buildSmartContractTxFromOp(accountId, operation).then((tx) =>
		prepareTransaction(tx)
	);
}

function parsePoolRewards(value) {
	return value.reduce((acc, val) => {
		const key = val.key().value().toString();
		if (key === "exp_at" || key === "last_time") {
			acc[key] = new BigNumber(i128ToInt(val.val()).toString())
				.times(1e7)
				.toNumber();
			return acc;
		}
		acc[key] = i128ToInt(val.val());
		return acc;
	}, {});
}

export function getPoolRewards(accountId, poolId) {
	return buildSmartContractTx(
		accountId,
		poolId,
		AMM_CONTRACT_METHOD.GET_REWARDS_INFO,
		publicKeyToScVal(accountId)
	)
		.then((tx) => simulateTx(tx))
		.then(({ result }) => {
			if (result) {
				return parsePoolRewards(result.retval.value());
			}

			throw new Error("getPoolRewards error");
		});
}

export function getPoolsRewards(accountId, pools) {
	const batches = pools.map((pool) =>
		scValToArray([
			contractIdToScVal(pool),
			xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.GET_REWARDS_INFO),
			scValToArray([publicKeyToScVal(accountId)]),
		])
	);

	return buildSmartContractTx(
		accountId,
		BATCH_SMART_CONTRACT_ID,
		BATCH_CONTRACT_METHOD.batch,
		scValToArray([publicKeyToScVal(accountId)]),
		scValToArray(batches),
		xdr.ScVal.scvBool(true)
	)
		.then((tx) => simulateTx(tx))
		.then((res) => {
			if (!res.result) {
				throw new Error("getPoolsRewards error");
			}

			const retValArr = res.result.retval.value();

			return retValArr.map((val) => parsePoolRewards(val.value()));
		});
}

export function getTotalShares(poolId) {
	return buildSmartContractTx(
		ACCOUNT_FOR_SIMULATE,
		poolId,
		AMM_CONTRACT_METHOD.GET_TOTAL_SHARES
	)
		.then((tx) => simulateTx(tx))
		.then(({ result }) => {
			if (result) {
				return i128ToInt(result.retval);
			}

			throw new Error("getTotalShares error");
		});
}

export function getClaimRewardsTx(accountId, poolId) {
	return buildSmartContractTx(
		accountId,
		poolId,
		AMM_CONTRACT_METHOD.CLAIM,
		publicKeyToScVal(accountId)
	).then((tx) => prepareTransaction(tx));
}

export function getClaimBatchTx(accountId, pools) {
	const batches = pools.map((pool) =>
		scValToArray([
			contractIdToScVal(pool),
			xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.CLAIM),
			scValToArray([publicKeyToScVal(accountId)]),
		])
	);

	return buildSmartContractTx(
		accountId,
		BATCH_SMART_CONTRACT_ID,
		BATCH_CONTRACT_METHOD.batch,
		scValToArray([publicKeyToScVal(accountId)]),
		scValToArray(batches),
		xdr.ScVal.scvBool(false)
	).then((tx) => prepareTransaction(tx));
}

// Helper functions for creating core invocations and authorizations

/**
 * Creates the burn authorization invocation required to burn shares.
 */
function createBurnInvocation(accountId, shareAmount, shareAddress) {
	return new xdr.SorobanAuthorizedInvocation({
		function:
			xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
				new xdr.InvokeContractArgs({
					functionName: ASSET_CONTRACT_METHOD.BURN,
					contractAddress: contractIdToScVal(shareAddress).address(),
					args: [publicKeyToScVal(accountId), amountToInt128(shareAmount)],
				})
			),
		subInvocations: [],
	});
}

/**
 * Creates the withdraw invocation with burn as a sub-invocation.
 */
function createWithdrawInvocation(
	accountId,
	poolAddress,
	functionName,
	args,
	burnInvocation
) {
	return new xdr.SorobanAuthorizedInvocation({
		function:
			xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
				new xdr.InvokeContractArgs({
					contractAddress: contractIdToScVal(poolAddress).address(),
					functionName,
					args,
				})
			),
		subInvocations: [burnInvocation],
	});
}

/**
 * Creates the claim invocation which doesn't require any sub-invocations.
 */
function createClaimInvocation(accountId, poolAddress) {
	return new xdr.SorobanAuthorizedInvocation({
		function:
			xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
				new xdr.InvokeContractArgs({
					contractAddress: contractIdToScVal(poolAddress).address(),
					functionName: AMM_CONTRACT_METHOD.CLAIM,
					args: [publicKeyToScVal(accountId)],
				})
			),
		subInvocations: [],
	});
}

/**
 * Wraps the root invocation into an authorization entry.
 */
function createRootAuthorization(accountId, rootInvocation) {
	return new xdr.SorobanAuthorizationEntry({
		credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
		rootInvocation,
	});
}

/**
 * Builds a transaction for a single withdraw function (either normal or single coin).
 */
async function buildSingleWithdrawTx(
	accountId,
	poolAddress,
	shareAmount,
	shareAddress,
	functionName,
	args
) {
	const burnInvocation = createBurnInvocation(
		accountId,
		shareAmount,
		shareAddress
	);

	const rootInvocation = createRootAuthorization(
		accountId,
		new xdr.SorobanAuthorizedInvocation({
			function:
				xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
					new xdr.InvokeContractArgs({
						contractAddress: contractIdToScVal(poolAddress).address(),
						functionName,
						args,
					})
				),
			subInvocations: [burnInvocation],
		})
	);

	const operation = StellarSdk.Operation.invokeContractFunction({
		contract: poolAddress,
		function: functionName,
		args,
		auth: [rootInvocation],
	});

	const tx = await buildSmartContractTxFromOp(accountId, operation);
	return prepareTransaction(tx);
}

/**
 * Builds a batch transaction for withdraw + claim operations.
 */
async function buildWithdrawAndClaimTx(
	accountId,
	poolAddress,
	shareAmount,
	shareAddress,
	withdrawFunctionName,
	withdrawArgs
) {
	// Prepare batch calls: withdraw and claim
	const withdrawCall = scValToArray([
		contractIdToScVal(poolAddress),
		xdr.ScVal.scvSymbol(withdrawFunctionName),
		scValToArray(withdrawArgs),
	]);

	const claimCall = scValToArray([
		contractIdToScVal(poolAddress),
		xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.CLAIM),
		scValToArray([publicKeyToScVal(accountId)]),
	]);

	const batchCalls = [withdrawCall, claimCall];

	// Prepare authorizations
	const burnInvocation = createBurnInvocation(
		accountId,
		shareAmount,
		shareAddress
	);

	const withdrawAuthInvocation = createWithdrawInvocation(
		accountId,
		poolAddress,
		withdrawFunctionName,
		withdrawArgs,
		burnInvocation
	);

	const claimAuthInvocation = createClaimInvocation(accountId, poolAddress);

	const rootInvocation = new xdr.SorobanAuthorizedInvocation({
		function:
			xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
				new xdr.InvokeContractArgs({
					contractAddress: contractIdToScVal(BATCH_SMART_CONTRACT_ID).address(),
					functionName: BATCH_CONTRACT_METHOD.batch,
					args: [
						scValToArray([publicKeyToScVal(accountId)]),
						scValToArray(batchCalls),
						xdr.ScVal.scvBool(true),
					],
				})
			),
		subInvocations: [withdrawAuthInvocation, claimAuthInvocation],
	});

	const batchAuth = createRootAuthorization(accountId, rootInvocation);

	const batchOperation = StellarSdk.Operation.invokeContractFunction({
		contract: BATCH_SMART_CONTRACT_ID,
		function: BATCH_CONTRACT_METHOD.batch,
		args: [
			scValToArray([publicKeyToScVal(accountId)]),
			scValToArray(batchCalls),
			xdr.ScVal.scvBool(true),
		],
		auth: [batchAuth],
	});

	const tx = await buildSmartContractTxFromOp(accountId, batchOperation);
	return prepareTransaction(tx);
}

// --- Exported functions for external use ---

export function getWithdrawTx(
	accountId,
	poolAddress,
	shareAmount,
	assets,
	shareAddress
) {
	const args = [
		publicKeyToScVal(accountId),
		amountToUint128(shareAmount),
		scValToArray(assets.map(() => amountToUint128("0.0000001"))),
	];
	return buildSingleWithdrawTx(
		accountId,
		poolAddress,
		shareAmount,
		shareAddress,
		AMM_CONTRACT_METHOD.WITHDRAW,
		args
	);
}

export function getWithdrawAndClaim(
	accountId,
	poolAddress,
	shareAmount,
	assets,
	shareAddress
) {
	const withdrawArgs = [
		publicKeyToScVal(accountId),
		amountToUint128(shareAmount),
		scValToArray(assets.map(() => amountToUint128("0.0000001"))),
	];
	return buildWithdrawAndClaimTx(
		accountId,
		poolAddress,
		shareAmount,
		shareAddress,
		AMM_CONTRACT_METHOD.WITHDRAW,
		withdrawArgs
	);
}

export function getSingleCoinWithdrawTx(
	accountId,
	poolAddress,
	shareAmount,
	tokenIndex,
	minimumTokenAmount,
	tokenDecimals,
	shareAddress
) {
	const args = [
		publicKeyToScVal(accountId),
		amountToUint128(shareAmount),
		amountToUint32(tokenIndex),
		amountToUint128(minimumTokenAmount, tokenDecimals),
	];
	return buildSingleWithdrawTx(
		accountId,
		poolAddress,
		shareAmount,
		shareAddress,
		AMM_CONTRACT_METHOD.WITHDRAW_ONE_COIN,
		args
	);
}

export function getSingleTokenWithdrawAndClaim(
	accountId,
	poolAddress,
	shareAmount,
	tokenIndex,
	minimumTokenAmount,
	tokenDecimals,
	shareAddress
) {
	const withdrawArgs = [
		publicKeyToScVal(accountId),
		amountToUint128(shareAmount),
		amountToUint32(tokenIndex),
		amountToUint128(minimumTokenAmount, tokenDecimals),
	];
	return buildWithdrawAndClaimTx(
		accountId,
		poolAddress,
		shareAmount,
		shareAddress,
		AMM_CONTRACT_METHOD.WITHDRAW_ONE_COIN,
		withdrawArgs
	);
}

export function getCustomWithdrawTx(
	accountId,
	poolAddress,
	shareAmountMaximum,
	amounts,
	tokens,
	shareAddress
) {
	const args = [
		publicKeyToScVal(accountId),
		scValToArray(
			[...amounts.values()].map((value, index) =>
				amountToUint128(value || "0", tokens[index].decimal)
			)
		),
		amountToUint128(shareAmountMaximum),
	];
	return buildSingleWithdrawTx(
		accountId,
		poolAddress,
		shareAmountMaximum,
		shareAddress,
		AMM_CONTRACT_METHOD.WITHDRAW_CUSTOM,
		args
	);
}

export function getCustomWithdrawAndClaim(
	accountId,
	poolAddress,
	shareAmountMaximum,
	amounts,
	tokens,
	shareAddress
) {
	const withdrawArgs = [
		publicKeyToScVal(accountId),
		scValToArray(
			[...amounts.values()].map((value, index) =>
				amountToUint128(value || "0", tokens[index].decimal)
			)
		),
		amountToUint128(shareAmountMaximum),
	];
	return buildWithdrawAndClaimTx(
		accountId,
		poolAddress,
		shareAmountMaximum,
		shareAddress,
		AMM_CONTRACT_METHOD.WITHDRAW_CUSTOM,
		withdrawArgs
	);
}

export async function estimateCustomWithdraw(
	accountId,
	poolAddress,
	shareAmountMaximum,
	amounts,
	tokens,
	shareAddress
) {
	const args = [
		publicKeyToScVal(accountId),
		scValToArray(
			[...amounts.values()].map((value, index) =>
				amountToUint128(value || "0", tokens[index].decimal)
			)
		),
		amountToUint128(shareAmountMaximum),
	];
	const tx = await buildSingleWithdrawTx(
		accountId,
		poolAddress,
		shareAmountMaximum,
		shareAddress,
		AMM_CONTRACT_METHOD.WITHDRAW_CUSTOM,
		args
	);
	const res = await simulateTx(tx);

	return i128ToInt(res.result.retval);
}

export function getSingleTokenWithdrawEstimate(poolId, tokens, accountShare) {
	const estimateCalls = tokens.map((_, i) =>
		scValToArray([
			contractIdToScVal(poolId),
			xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.CALC_WITHDRAW_ONE_COIN),
			scValToArray([amountToUint128(accountShare), amountToUint32(i)]),
		])
	);
	return buildSmartContractTx(
		ACCOUNT_FOR_SIMULATE,
		BATCH_SMART_CONTRACT_ID,
		BATCH_CONTRACT_METHOD.batch,
		scValToArray([publicKeyToScVal(ACCOUNT_FOR_SIMULATE)]),
		scValToArray(estimateCalls),
		xdr.ScVal.scvBool(true)
	)
		.then((tx) => simulateTx(tx))
		.then((res) => {
			if (!res.result) return;
			const map = new Map();

			res.result.retval
				.value()

				.forEach((val, index) => {
					map.set(
						tokens[index].contract,
						i128ToInt(val, tokens[index].decimal)
					);
				});

			return map;
		});
}

function getCreationFeeToken() {
	return buildSmartContractTx(
		ACCOUNT_FOR_SIMULATE,
		AMM_SMART_CONTRACT_ID,
		AMM_CONTRACT_METHOD.GET_CREATION_FEE_TOKEN
	)
		.then((tx) => simulateTx(tx))
		.then(({ result }) =>
			parseTokenContractId(StellarSdk.scValToNative(result.retval))
		);
}

function getCreationFee(type) {
	return buildSmartContractTx(
		ACCOUNT_FOR_SIMULATE,
		AMM_SMART_CONTRACT_ID,
		type === POOL_TYPE.constant
			? AMM_CONTRACT_METHOD.GET_CONSTANT_CREATION_FEE
			: AMM_CONTRACT_METHOD.GET_STABLE_CREATION_FEE
	)
		.then((tx) => simulateTx(tx))
		.then(({ result }) => i128ToInt(result.retval));
}

function getCreationFeeAddress() {
	return buildSmartContractTx(
		ACCOUNT_FOR_SIMULATE,
		AMM_SMART_CONTRACT_ID,
		AMM_CONTRACT_METHOD.GET_INIT_POOL_DESTINATION
	)
		.then((tx) => simulateTx(tx))
		.then(({ result }) =>
			StellarSdk.StrKey.encodeContract(result.retval.value().value())
		);
}

export function getCreationFeeInfo() {
	return Promise.all([
		getCreationFeeToken(),
		getCreationFee(POOL_TYPE.constant),
		getCreationFee(POOL_TYPE.stable),
		getCreationFeeAddress(),
	]).then(([token, constantFee, stableFee, destination]) => ({
		token,
		constantFee,
		stableFee,
		destination,
	}));
}

export function getPoolReserves(assets, poolId) {
	return buildSmartContractTx(
		ACCOUNT_FOR_SIMULATE,
		poolId,
		AMM_CONTRACT_METHOD.GET_RESERVES
	)
		.then((tx) => simulateTx(tx))
		.then(({ result }) => {
			if (result) {
				return orderTokens(assets).reduce((acc, asset, index) => {
					acc.set(
						getAssetString(asset),
						i128ToInt(result.retval.value()[index], assets[index].decimal)
					);
					return acc;
				}, new Map());
			}

			throw new Error("getPoolPrice fail");
		});
}

export function getDepositTx(accountId, poolAddress, assets, amounts) {
	const args = [
		publicKeyToScVal(accountId),
		scValToArray(
			orderTokens(assets).map((asset) =>
				amountToUint128(
					amounts.get(getAssetString(asset)) || "0",
					asset.decimal
				)
			)
		),
		amountToUint128("0.0000001"),
	];

	const transferInvocations = orderTokens(assets).map(
		(asset) =>
			new xdr.SorobanAuthorizedInvocation({
				function:
					xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
						new xdr.InvokeContractArgs({
							functionName: ASSET_CONTRACT_METHOD.TRANSFER,
							contractAddress: contractIdToScVal(asset.contract).address(),
							args: [
								publicKeyToScVal(accountId),
								contractIdToScVal(poolAddress),
								amountToInt128(
									amounts.get(getAssetString(asset)) || "0",
									asset.decimal
								),
							],
						})
					),
				subInvocations: [],
			})
	);

	const rootInvocation = new xdr.SorobanAuthorizationEntry({
		credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
		rootInvocation: new xdr.SorobanAuthorizedInvocation({
			function:
				xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
					new xdr.InvokeContractArgs({
						contractAddress: contractIdToScVal(poolAddress).address(),
						functionName: AMM_CONTRACT_METHOD.DEPOSIT,
						args,
					})
				),
			subInvocations: transferInvocations,
		}),
	});

	const operation = StellarSdk.Operation.invokeContractFunction({
		contract: poolAddress,
		function: AMM_CONTRACT_METHOD.DEPOSIT,
		args,
		auth: [rootInvocation],
	});

	return buildSmartContractTxFromOp(accountId, operation).then((tx) =>
		prepareTransaction(tx)
	);
}

export function getSwapChainedTx(
	accountId,
	base,
	counter,
	chainedXDR,
	amount,
	amountWithSlippage,
	isSend
) {
	const args = [
		publicKeyToScVal(accountId),
		xdr.ScVal.fromXDR(chainedXDR, "base64"),
		contractIdToScVal(base.contract),
		amountToUint128(amount, isSend ? base.decimal : counter.decimal),
		amountToUint128(
			amountWithSlippage,
			isSend ? counter.decimal : base.decimal
		),
	];

	const transferInvocation = new xdr.SorobanAuthorizedInvocation({
		function:
			xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
				new xdr.InvokeContractArgs({
					functionName: ASSET_CONTRACT_METHOD.TRANSFER,
					contractAddress: contractIdToScVal(base.contract).address(),
					args: [
						publicKeyToScVal(accountId),
						contractIdToScVal(AMM_SMART_CONTRACT_ID),
						amountToInt128(isSend ? amount : amountWithSlippage, base.decimal),
					],
				})
			),
		subInvocations: [],
	});

	const rootInvocation = new xdr.SorobanAuthorizationEntry({
		credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
		rootInvocation: new xdr.SorobanAuthorizedInvocation({
			function:
				xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
					new xdr.InvokeContractArgs({
						contractAddress: contractIdToScVal(AMM_SMART_CONTRACT_ID).address(),
						functionName: isSend
							? AMM_CONTRACT_METHOD.SWAP_CHAINED
							: AMM_CONTRACT_METHOD.SWAP_CHAINED_RECEIVE,
						args,
					})
				),
			subInvocations: [transferInvocation],
		}),
	});

	const operation = StellarSdk.Operation.invokeContractFunction({
		contract: AMM_SMART_CONTRACT_ID,
		function: isSend
			? AMM_CONTRACT_METHOD.SWAP_CHAINED
			: AMM_CONTRACT_METHOD.SWAP_CHAINED_RECEIVE,
		args,
		auth: [rootInvocation],
	});
	return buildSmartContractTxFromOp(accountId, operation).then((tx) =>
		prepareTransaction(tx)
	);
}
