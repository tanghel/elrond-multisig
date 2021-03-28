import { Address, Argument, Balance } from '@elrondnetwork/erdjs/out';
import { BigUIntValue } from '@elrondnetwork/erdjs/out/smartcontracts/typesystem';
import { hexToBigInt, hexToNumber, hexToString } from 'helpers/converters';
import { MultisigAction } from './MultisigAction';
import { MultisigActionType } from './MultisigActionType';
import i18next from 'i18next';

export class MultisigSmartContractCall extends MultisigAction {
    address: Address;
    amount: BigUIntValue;
    endpointName: string;
    args: Argument[];
  
    constructor(address: Address, amount: BigUIntValue, endpointName: string, args: Argument[]) { 
        super(MultisigActionType.SCCall);
        this.address = address;
        this.amount = amount;
        this.endpointName = endpointName;
        this.args = args;
    }
  
    title() {
      switch (this.endpointName) {
        case 'issue':
          return i18next.t('Issue Token');
        case 'ESDTTransfer':
          return i18next.t('Send Token');
      }

      return i18next.t('Smart Contract Call');
    }
  
    description() {
      switch (this.endpointName) {
        case 'issue':
          return this.getIssueTokenDescription();
        case 'ESDTTransfer':
          return this.getSendTokenDescription();
      }

      return `${this.endpointName}: ${new Balance(this.amount.valueOf()).toCurrencyString()} to ${this.address.bech32()}`;
    }

    tooltip() {
      switch (this.endpointName) {
        case 'issue':
          return this.getIssueTokenToolTip();
      }

      return '';
    }

    getIssueTokenToolTip(): string {
      let extraProperties = [];
      let index = 4;
      while (index < this.args.length) {
        let name = hexToString(this.args[index++].valueOf()) ?? '';
        let value = hexToString(this.args[index++].valueOf()) ?? '';

        extraProperties.push({name, value});
      }

      return extraProperties.map(x => `${x.name}: ${x.value}`).join('\n');
    }

    getSendTokenDescription(): string {
      let identifier = hexToString(this.args[0].valueOf()) ?? 'Unknown';
      let amount = hexToBigInt(this.args[1].valueOf()) ?? BigInt(0);

      return `${i18next.t('Identifier')}: ${identifier}, ${i18next.t('Amount')}: ${amount}`;
    }

    getIssueTokenDescription(): string {
      let name = hexToString(this.args[0].valueOf()) ?? 'Unknown';
      let identifier = hexToString(this.args[1].valueOf()) ?? 'Unknown';
      let amount = hexToBigInt(this.args[2].valueOf()) ?? BigInt(0);
      let decimals = hexToNumber(this.args[3].valueOf()) ?? 0;

      let amountString = amount.toString().slice(0, amount.toString().length - decimals);

      return `${i18next.t('Name')}: ${name}, ${i18next.t('Identifier')}: ${identifier}, ${i18next.t('Amount')}: ${amountString}, ${i18next.t('Decimals')}: ${decimals}`;
    }
  }