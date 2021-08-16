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
    'erd1qqqqqqqqqqqqqpgqp593httv72s3decqv2psa3yssajmmrhqerms52yjjd',
    'erd1qqqqqqqqqqqqqpgqp593httv72s3decqv2psa3yssajmmrhqerms52yjjd',
    'erd1qqqqqqqqqqqqqpgqp593httv72s3decqv2psa3yssajmmrhqerms52yjjd',
  ],
  multisigManagerContract: 'erd1qqqqqqqqqqqqqpgq4wxs8k5060eph7ehdkx4wmm9s4qgdj70ermspyr7pq',
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