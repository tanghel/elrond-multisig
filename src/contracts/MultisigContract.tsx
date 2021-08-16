import {
  ContractFunction,
  Transaction,
  TransactionPayload,
  Balance,
  GasLimit,
  IDappProvider,
  WalletProvider,
  HWProvider,
  Address,
  SmartContract,
  BinaryCodec,
} from '@elrondnetwork/erdjs';

import { parseAction, parseActionDetailed } from 'helpers/converters';
import { Query } from '@elrondnetwork/erdjs/out/smartcontracts/query';
import { DappState } from '../context/state';
import { AddressValue, BigIntValue, BigUIntValue, BooleanType, BooleanValue, BytesValue, NumericalValue, TypedValue, U32Type, U32Value } from '@elrondnetwork/erdjs/out/smartcontracts/typesystem';
import { MultisigAction } from 'types/MultisigAction';
import { MultisigActionDetailed } from 'types/MultisigActionDetailed';
import { MultisigIssueToken } from 'types/MultisigIssueToken';
import { MultisigSendToken } from 'types/MultisigSendToken';
import { useContext } from 'context';
import BigNumber from 'bignumber.js';
import { NumericalBinaryCodec } from '@elrondnetwork/erdjs/out/smartcontracts/codec/numerical';

export class MultisigContract {
  private dapp: DappState;
  private contract: SmartContract;
  private signerProvider?: IDappProvider;
  private standardGasLimit = 60000000;

  constructor(dapp: DappState, address?: Address, signer?: IDappProvider) {
    this.dapp = dapp;
    this.contract = new SmartContract({ address });
    this.signerProvider = signer;
  }

  mutateSign(actionId: number) {
    return this.sendTransaction(0, 'sign', new U32Value(actionId));
  }

  mutateUnsign(actionId: number) {
    return this.sendTransaction(0, 'unsign', new U32Value(actionId));
  }

  mutatePerformAction(actionId: number) {
    return this.sendTransaction(0, 'performAction', new U32Value(actionId));
  }

  mutateDiscardAction(actionId: number) {
    return this.sendTransaction(0, 'discardAction', new U32Value(actionId));
  }

  mutateProposeChangeQuorum(quorumSize: number) {
    return this.sendTransaction(0, 'proposeChangeQuorum', new U32Value(quorumSize));
  }

  mutateProposeAddProposer(address: Address) {
    return this.sendTransaction(0, 'proposeAddProposer', new AddressValue(address));
  }

  mutateProposeAddBoardMember(address: Address) {
    return this.sendTransaction(0, 'proposeAddBoardMember', new AddressValue(address));
  }

  mutateProposeRemoveUser(address: Address) {
    return this.sendTransaction(0, 'proposeRemoveUser', new AddressValue(address));
  }

  mutateSendEgld(address: Address, amount: BigUIntValue, data: string) {
    return this.sendTransaction(0, 'proposeSendEgld', new AddressValue(address), amount, BytesValue.fromUTF8(data));
  }

  mutateSmartContractCall(address: Address, amount: BigUIntValue, endpointName: string, args: TypedValue[]) {
    let allArgs: TypedValue[] = [ new AddressValue(address), amount, BytesValue.fromUTF8(endpointName) ];
    allArgs.push(...args);

    return this.sendTransaction(0, 'proposeSCCall', ...allArgs);
  }

  mutateEsdtSendToken(proposal: MultisigSendToken) {
    this.mutateSmartContractCall(proposal.address, new BigUIntValue(new BigNumber(0)), 'ESDTTransfer', [ BytesValue.fromUTF8(proposal.identifier), new U32Value(proposal.amount) ]);
  }

  mutateEsdtIssueToken(proposal: MultisigIssueToken) {
    let esdtAddress = new Address('erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u');
    let esdtAmount = new BigUIntValue(Balance.egld(5).valueOf());

    let args = [];
    args.push(BytesValue.fromUTF8(proposal.name));
    args.push(BytesValue.fromUTF8(proposal.identifier));
    args.push(new U32Value(proposal.amount * Math.pow(10, proposal.decimals)));
    args.push(new U32Value(proposal.decimals));

    if (proposal.canFreeze) {
      args.push(BytesValue.fromUTF8('canFreeze'));
      args.push(BytesValue.fromUTF8('true'));
    }

    if (proposal.canWipe) {
      args.push(BytesValue.fromUTF8('canWipe'));
      args.push(BytesValue.fromUTF8('true'));
    }

    if (proposal.canPause) {
      args.push(BytesValue.fromUTF8('canPause'));
      args.push(BytesValue.fromUTF8('true'));
    }

    if (proposal.canMint) {
      args.push(BytesValue.fromUTF8('canMint'));
      args.push(BytesValue.fromUTF8('true'));
    }

    if (proposal.canBurn) {
      args.push(BytesValue.fromUTF8('canBurn'));
      args.push(BytesValue.fromUTF8('true'));
    }

    if (proposal.canChangeOwner) {
      args.push(BytesValue.fromUTF8('canChangeOwner'));
      args.push(BytesValue.fromUTF8('true'));
    }

    if (proposal.canUpgrade) {
      args.push(BytesValue.fromUTF8('canUpgrade'));
      args.push(BytesValue.fromUTF8('true'));
    }

    this.mutateSmartContractCall(esdtAddress, esdtAmount, 'issue', args);
  }

  queryAllActions(): Promise<MultisigActionDetailed[]> {
    return this.queryActionContainerArray('getPendingActionFullInfo');
  }

  queryBoardMembersCount(): Promise<number> {
    return this.queryNumber('getNumBoardMembers');
  }

  queryProposersCount(): Promise<number> {
    return this.queryNumber('getNumProposers');
  }

  queryQuorumCount(): Promise<number> {
    return this.queryNumber('getQuorum');
  }

  queryActionLastId(): Promise<number> {
    return this.queryNumber('getActionLastIndex');
  }

  queryActionData(actionId: number): Promise<MultisigAction | null> {
    return this.queryActionContainer('getActionData', new U32Value(actionId));
  }

  queryUserRole(userAddress: string): Promise<number> {
    return this.queryNumber('userRole', new AddressValue(new Address(userAddress)));
  }

  queryBoardMemberAddresses(): Promise<Address[]> {
    return this.queryAddressArray('getAllBoardMembers');
  }

  queryProposerAddresses(): Promise<Address[]> {
    return this.queryAddressArray('getAllProposers');
  }

  queryActionSignerAddresses(actionId: number): Promise<Address[]> {
    return this.queryAddressArray('getActionSigners', new U32Value(actionId));
  }

  queryActionSignerCount(actionId: number): Promise<number> {
    return this.queryNumber('getActionSignerCount', new U32Value(actionId));
  }

  queryActionValidSignerCount(actionId: number): Promise<number> {
    return this.queryNumber('getActionValidSignerCount', new U32Value(actionId));
  }

  queryActionIsQuorumReached(actionId: number): Promise<boolean> {
    return this.queryBoolean('quorumReached', new U32Value(actionId));
  }

  queryActionIsSignedByAddress(userAddress: Address, actionId: number): Promise<boolean> {
    return this.queryBoolean('signed', new AddressValue(userAddress), new U32Value(actionId));
  }

  private async queryNumber(functionName: string, ...args: TypedValue[]): Promise<number> {
    let result = await this.query(functionName, ...args);

    let codec = new NumericalBinaryCodec();
    return codec.decodeTopLevel(result.outputUntyped()[0], new U32Type()).valueOf().toNumber();
  }

  private async queryBoolean(functionName: string, ...args: TypedValue[]): Promise<boolean> {
    let result = await this.query(functionName, ...args);

    let codec = new BinaryCodec();
    return codec.decodeTopLevel<BooleanValue>(result.outputUntyped()[0], new BooleanType()).valueOf();
  }

  private async queryActionContainer(functionName: string, ...args: TypedValue[]): Promise<MultisigAction | null> {
    let result = await this.query(functionName, ...args);

    if (result.returnData.length === 0) {
      return null;
    }

    let [action] = parseAction(result.outputUntyped()[0]);
    return action;
  }

  private async queryActionContainerArray(functionName: string, ...args: TypedValue[]): Promise<MultisigActionDetailed[]> {
    let result = await this.query(functionName, ...args);

    let actions = [];
    for (let buffer of result.outputUntyped()) {
        let action = parseActionDetailed(buffer);
        if (action !== null) {
          actions.push(action);
        }
    }

    return actions;
  }

  private async queryAddressArray(functionName: string, ...args: TypedValue[]): Promise<Address[]> {
    let result = await this.query(functionName, ...args);

    return result.outputUntyped().map(x => new Address(x));
  }

  private async query(functionName: string, ...args: TypedValue[]) {
    const query = new Query({
      address: this.contract.getAddress(),
      func: new ContractFunction(functionName),
      args: args,
    });

    return await this.dapp.proxy.queryContract(query);
  }

  private async sendTransaction(
    value: number,
    functionName: string,
    ...args: TypedValue[]
  ): Promise<boolean> {
    if (!this.signerProvider) {
      throw new Error(
        'You need a singer to send a transaction, use either WalletProvider or LedgerProvider'
      );
    }

    switch (this.signerProvider.constructor) {
      case WalletProvider:
        return this.sendTransactionBasedOnType(value, functionName, ...args);
      case HWProvider:
        return this.sendTransactionBasedOnType(value, functionName, ...args);
      default:
        console.warn('invalid signerProvider');
    }

    return true;
  }

  private async sendTransactionBasedOnType(
    value: number,
    functionName: string,
    ...args: TypedValue[]
  ): Promise<boolean> {
    const func = new ContractFunction(functionName);

    let payload = TransactionPayload.contractCall()
      .setFunction(func)
      .setArgs(args)
      .build();

    let transaction = new Transaction({
      receiver: this.contract.getAddress(),
      value: Balance.egld(value),
      gasLimit: new GasLimit(this.standardGasLimit),
      data: payload,
    });

    // @ts-ignore
    await this.signerProvider.sendTransaction(transaction);

    return true;
  }
}

export function useMultisigContract() {
  const { dapp, currentMultisigAddress } = useContext();
  const multisigContract = new MultisigContract(dapp, currentMultisigAddress, dapp.provider);
  return { multisigContract };
}