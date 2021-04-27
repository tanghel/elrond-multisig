import { object, string, boolean, InferType, array } from 'yup';

export const decimals: number = 2;
export const denomination: number = 18;

export const network: NetworkType = {
  id: 'testnet',
  name: 'Testnet',
  egldLabel: 'xEGLD',
  walletAddress: 'https://devnet-wallet.elrond.com/dapp/init',
  apiAddress: 'https://devnet-api.elrond.com',
  gatewayAddress: 'https://devnet-gateway.elrond.com',
  explorerAddress: 'http://devnet-explorer.elrond.com/',
  multisigDeployerContracts: [ 
    'erd1qqqqqqqqqqqqqpgqv00sumumxt6pswtfp7u87md7k7apgll8ermsg9qmze',
    'erd1qqqqqqqqqqqqqpgqv00sumumxt6pswtfp7u87md7k7apgll8ermsg9qmze',
    'erd1qqqqqqqqqqqqqpgqv00sumumxt6pswtfp7u87md7k7apgll8ermsg9qmze',
  ],
  multisigManagerContract: 'erd1qqqqqqqqqqqqqpgqjsq7r0vsemjxxyruh4scgut3jgc6dtasermsq7ejx9',
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