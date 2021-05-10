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
    'erd1qqqqqqqqqqqqqpgqx55dua9mjepmxtvejhgrcn6qj5lmftx3ermst6wtjn',
    'erd1qqqqqqqqqqqqqpgqx55dua9mjepmxtvejhgrcn6qj5lmftx3ermst6wtjn',
    'erd1qqqqqqqqqqqqqpgqx55dua9mjepmxtvejhgrcn6qj5lmftx3ermst6wtjn',
  ],
  multisigManagerContract: 'erd1qqqqqqqqqqqqqpgqpueavdgy55zcw6js4ppty4fdtnha3xhferms680hv4',
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