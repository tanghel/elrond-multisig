import { object, string, boolean, InferType, array } from 'yup';

export const decimals: number = 2;
export const denomination: number = 18;

export const network: NetworkType = {
  id: 'testnet',
  name: 'Testnet',
  egldLabel: 'xEGLD',
  walletAddress: 'https://testnet-wallet.elrond.com/dapp/init',
  apiAddress: 'https://testnet-api.elrond.com',
  gatewayAddress: 'https://testnet-gateway.elrond.com',
  explorerAddress: 'http://testnet-explorer.elrond.com/',
  multisigDeployerContracts: [ 
    'erd1qqqqqqqqqqqqqpgqexj86qkaey54p768xxktxjhf4v7g5svherms3jq45t',
    'erd1qqqqqqqqqqqqqpgqes94t3grsn59m2ze8qk3ggkwm0rtagfpermsf0tk8g',
    'erd1qqqqqqqqqqqqqpgqlkmwztwgs3mncp2jtavmu47q5vzj8t6mermsjzumvd',
  ],
  multisigManagerContract: 'erd1qqqqqqqqqqqqqpgqy6uk930uursyuxkrt8pzrmeqaf60ttjuermsyjskp9',
};

const networkSchema = object({
  id: string()
    .defined()
    .required(),
  egldLabel: string()
    .defined()
    .required(),
  name: string()
    .defined()
    .required(),
  walletAddress: string(),
  apiAddress: string(),
  gatewayAddress: string(),
  explorerAddress: string(),
  multisigDeployerContracts: array().of(string().defined().required()).defined().required(),
  multisigManagerContract: string(),
}).required();

export type NetworkType = InferType<typeof networkSchema>;

networkSchema.validate(network, { strict: true }).catch(({ errors }) => {
  console.error(`Config invalid format for ${network.id}`, errors);
});