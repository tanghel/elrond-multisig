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
    'erd1qqqqqqqqqqqqqpgqjzplgwvy8epyewpkvprtmmfccncug7f4erms54e06y',
    'erd1qqqqqqqqqqqqqpgqaazq2rcg54fhug6put4x4cu9z0xe66rkermsga8242',
    'erd1qqqqqqqqqqqqqpgqpctw875mnzhfg58prmnhxrxjv65dg65eermsy5shek',
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