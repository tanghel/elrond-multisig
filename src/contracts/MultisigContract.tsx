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
  Argument,
} from '@elrondnetwork/erdjs';

import { parseAction, parseActionDetailed } from 'helpers/converters';
import { Query } from '@elrondnetwork/erdjs/out/smartcontracts/query';
import { DappState } from '../context/state';
import { BigUIntValue } from '@elrondnetwork/erdjs/out/smartcontracts/typesystem';
import { MultisigAction } from 'types/MultisigAction';
import { MultisigActionDetailed } from 'types/MultisigActionDetailed';
import { MultisigIssueToken } from 'types/MultisigIssueToken';
import { MultisigSendToken } from 'types/MultisigSendToken';
import { useContext } from 'context';
import axios from 'axios';

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
    return this.sendTransaction(0, 'sign', Argument.fromNumber(actionId));
  }

  mutateUnsign(actionId: number) {
    return this.sendTransaction(0, 'unsign', Argument.fromNumber(actionId));
  }

  mutatePerformAction(actionId: number) {
    return this.sendTransaction(0, 'performAction', Argument.fromNumber(actionId));
  }

  mutateDiscardAction(actionId: number) {
    return this.sendTransaction(0, 'discardAction', Argument.fromNumber(actionId));
  }

  mutateProposeChangeQuorum(quorumSize: number) {
    return this.sendTransaction(0, 'proposeChangeQuorum', Argument.fromNumber(quorumSize));
  }

  mutateProposeAddProposer(address: Address) {
    return this.sendTransaction(0, 'proposeAddProposer', Argument.fromHex(address.hex()));
  }

  mutateProposeAddBoardMember(address: Address) {
    return this.sendTransaction(0, 'proposeAddBoardMember', Argument.fromHex(address.hex()));
  }

  mutateProposeRemoveUser(address: Address) {
    return this.sendTransaction(0, 'proposeRemoveUser', Argument.fromHex(address.hex()));
  }

  mutateSendEgld(address: Address, amount: BigUIntValue, data: string) {
    return this.sendTransaction(0, 'proposeSendEgld', Argument.fromPubkey(address), Argument.fromBigInt(BigInt(amount)), Argument.fromBytes(Buffer.from(data)));
  }

  mutateSmartContractCall(address: Address, amount: BigUIntValue, endpointName: string, args: Argument[]) {
    let allArgs = [ Argument.fromPubkey(address), Argument.fromBigInt(amount.valueOf()), Argument.fromUTF8(endpointName) ];
    allArgs.push(...args);

    return this.sendTransaction(0, 'proposeSCCall', ...allArgs);
  }

  mutateEsdtSendToken(proposal: MultisigSendToken) {
    this.mutateSmartContractCall(proposal.address, new BigUIntValue(BigInt(0)), 'ESDTTransfer', [ Argument.fromUTF8(proposal.identifier), Argument.fromNumber(proposal.amount) ]);
  }

  mutateEsdtIssueToken(proposal: MultisigIssueToken) {
    let esdtAddress = new Address('erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u');
    let esdtAmount = new BigUIntValue(Balance.eGLD(5).valueOf());

    let args = [];
    args.push(Argument.fromUTF8(proposal.name));
    args.push(Argument.fromUTF8(proposal.identifier));
    args.push(Argument.fromNumber(proposal.amount * Math.pow(10, proposal.decimals)));
    args.push(Argument.fromNumber(proposal.decimals));

    if (proposal.canFreeze) {
      args.push(Argument.fromUTF8('canFreeze'));
      args.push(Argument.fromUTF8('true'));
    }

    if (proposal.canWipe) {
      args.push(Argument.fromUTF8('canWipe'));
      args.push(Argument.fromUTF8('true'));
    }

    if (proposal.canPause) {
      args.push(Argument.fromUTF8('canPause'));
      args.push(Argument.fromUTF8('true'));
    }

    if (proposal.canMint) {
      args.push(Argument.fromUTF8('canMint'));
      args.push(Argument.fromUTF8('true'));
    }

    if (proposal.canBurn) {
      args.push(Argument.fromUTF8('canBurn'));
      args.push(Argument.fromUTF8('true'));
    }

    if (proposal.canChangeOwner) {
      args.push(Argument.fromUTF8('canChangeOwner'));
      args.push(Argument.fromUTF8('true'));
    }

    if (proposal.canUpgrade) {
      args.push(Argument.fromUTF8('canUpgrade'));
      args.push(Argument.fromUTF8('true'));
    }

    this.mutateSmartContractCall(esdtAddress, esdtAmount, 'issue', args);
  }

  queryAllActions(): Promise<MultisigActionDetailed[]> {
    return this.queryActionContainerArray('getPendingActionFullInfo');
  }

  async queryBoardMembersCount(): Promise<number> {
    // return this.queryNumber('getNumBoardMembers');
    let response = await axios.get('http://localhost:3001/multisig/boardMembers');
    return response.data;
  }

  async queryProposersCount(): Promise<number> {
    // return this.queryNumber('getNumProposers');
    let response = await axios.get('http://localhost:3001/multisig/proposers');
    return response.data;
  }

  async queryQuorumCount(): Promise<number> {
    // return this.queryNumber('getQuorum');
    let response = await axios.get('http://localhost:3001/multisig/quorumSize');
    return response.data;
  }

  queryActionLastId(): Promise<number> {
    return this.queryNumber('getActionLastIndex');
  }

  queryActionData(actionId: number): Promise<MultisigAction | null> {
    return this.queryActionContainer('getActionData', Argument.fromNumber(actionId));
  }

  async queryUserRole(userAddress: string): Promise<number> {
    // return this.queryNumber('userRole', Argument.fromHex(userAddress));
    let response = await axios.get('http://localhost:3001/multisig/userRole/' + new Address(userAddress).bech32());
    return response.data;
  }

  queryBoardMemberAddresses(): Promise<Address[]> {
    return this.queryAddressArray('getAllBoardMembers');
  }

  queryProposerAddresses(): Promise<Address[]> {
    return this.queryAddressArray('getAllProposers');
  }

  queryActionSignerAddresses(actionId: number): Promise<Address[]> {
    return this.queryAddressArray('getActionSigners', Argument.fromNumber(actionId));
  }

  queryActionSignerCount(actionId: number): Promise<number> {
    return this.queryNumber('getActionSignerCount', Argument.fromNumber(actionId));
  }

  queryActionValidSignerCount(actionId: number): Promise<number> {
    return this.queryNumber('getActionValidSignerCount', Argument.fromNumber(actionId));
  }

  queryActionIsQuorumReached(actionId: number): Promise<boolean> {
    return this.queryBoolean('quorumReached', Argument.fromNumber(actionId));
  }

  queryActionIsSignedByAddress(userAddress: Address, actionId: number): Promise<boolean> {
    return this.queryBoolean('signed', Argument.fromHex(userAddress.hex()), Argument.fromNumber(actionId));
  }

  private async queryNumber(functionName: string, ...args: Array<Argument>): Promise<number> {
    let result = await this.query(functionName, ...args);

    return result.returnData[0].asNumber;
  }

  private async queryBoolean(functionName: string, ...args: Array<Argument>): Promise<boolean> {
    let result = await this.query(functionName, ...args);

    return result.returnData[0].asBool;
  }

  private async queryActionContainer(functionName: string, ...args: Array<Argument>): Promise<MultisigAction | null> {
    let result = await this.query(functionName, ...args);

    if (result.returnData.length === 0) {
      return null;
    }

    let [action] = parseAction(result.returnData[0].asBuffer);
    return action;
  }

  private async queryActionContainerArray(functionName: string, ...args: Array<Argument>): Promise<MultisigActionDetailed[]> {
    let result = await this.query(functionName, ...args);

    let actions = [];
    for (let returnData of result.returnData) {
        let buffer = returnData.asBuffer;
        
        let action = parseActionDetailed(buffer);
        if (action !== null) {
          actions.push(action);
        }
    }

    return actions;
  }

  private async queryAddressArray(functionName: string, ...args: Array<Argument>): Promise<Address[]> {
    let result = await this.query(functionName, ...args);

    return result.returnData.map(x => new Address(x.asHex));
  }

  private async query(functionName: string, ...args: Array<Argument>) {
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
    ...args: Argument[]
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
    ...args: Argument[]
  ): Promise<boolean> {
    const func = new ContractFunction(functionName);

    let payload = TransactionPayload.contractCall()
      .setFunction(func)
      .setArgs(args)
      .build();

    let transaction = new Transaction({
      receiver: this.contract.getAddress(),
      value: Balance.eGLD(value),
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