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
  U8Value,
  AddressValue,
  TypedValue,
} from '@elrondnetwork/erdjs';
import { useContext } from 'context';

import { DappState } from '../context/state';

export class DeployContract {
  private address: Address;
  private dapp: DappState;
  private contract: SmartContract;
  private signerProvider?: IDappProvider;
  private standardGasLimit = 60000000;

  constructor(dapp: DappState, contract: string, signer: IDappProvider, address: Address) {
    this.dapp = dapp;
    this.contract = new SmartContract({ address: new Address(contract) });
    this.signerProvider = signer;
    this.address = address;
  }

  public async mutateDeploy(quorum: number, boardMembers: Address[]) {
    this.sendTransaction(0, 'deployContract', new U8Value(quorum), ...boardMembers.map(x => new AddressValue(x)));
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

export function useDeployContract() {
  const { dapp, address, multisigDeployerContracts } = useContext();

  let randomInt = Math.floor(Math.random() * (multisigDeployerContracts.length) );
  let multisigDeployerContract = multisigDeployerContracts[randomInt];

  const deployContract = new DeployContract(dapp, multisigDeployerContract ?? '', dapp.provider, new Address(address));
  return { deployContract };
}