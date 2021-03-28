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
import { Query } from '@elrondnetwork/erdjs/out/smartcontracts/query';
import { useContext } from 'context';
import { parseContractInfo } from 'helpers/converters';
import { MultisigContractInfo } from 'types/MultisigContractInfo';

import { DappState } from '../context/state';

export class ManagerContract {
  private address: Address;
  private dapp: DappState;
  private contract: SmartContract;
  private signerProvider?: IDappProvider;
  private standardGasLimit = 120000000;

  constructor(dapp: DappState, contract: string, signer: IDappProvider, address: Address) {
    this.dapp = dapp;
    this.contract = new SmartContract({ address: new Address(contract) });
    this.signerProvider = signer;
    this.address = address;
  }

  public async mutateRegisterMultisigContract(multisigAddress: Address) {
    this.sendTransaction(0, 'registerMultisigContract', Argument.fromPubkey(multisigAddress));
  }

  public async mutateUnregisterMultisigContract(multisigAddress: Address) {
    this.sendTransaction(0, 'unregisterMultisigContract', Argument.fromPubkey(multisigAddress));
  }

  public async mutateRegisterMultisigContractName(multisigAddress: Address, name: string) {
    this.sendTransaction(0, 'registerMultisigName', Argument.fromPubkey(multisigAddress), Argument.fromUTF8(name));
  }

  private async queryMultisigContractInfoArray(functionName: string, ...args: Argument[]): Promise<MultisigContractInfo[]> {
    let result = await this.query(functionName, ...args);

    let contractInfos = [];
    for (let returnData of result.returnData) {
        let buffer = returnData.asBuffer;
        
        let contractInfo = parseContractInfo(buffer);
        if (contractInfo !== null) {
          contractInfos.push(contractInfo);
        }
    }

    return contractInfos;
  }

  public async queryContracts() {
    return this.queryMultisigContractInfoArray('getMultisigContracts', Argument.fromPubkey(this.address));
  }

  private async query(functionName: string, ...args: Argument[]) {
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

export function useManagerContract() {
  const { dapp, address, multisigManagerContract } = useContext();
  const managerContract = new ManagerContract(dapp, multisigManagerContract ?? '', dapp.provider, new Address(address));
  return { managerContract };
}
