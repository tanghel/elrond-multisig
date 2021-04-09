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
    'erd1qqqqqqqqqqqqqpgq2z9703wl0406ewezyhrgzfmm8xj8zuuvermsfmmmga',
    'erd1qqqqqqqqqqqqqpgq8x7ha7ukpgcazmlls8k3xqpse20u2h0lerms2ja5gk',
    'erd1qqqqqqqqqqqqqpgq43nyeuvpa6h5ept8hp02l76jsalssmg6ermsfyms44',
  ],
  multisigManagerContract: 'erd1qqqqqqqqqqqqqpgq2k0z4fqpsjfsnt9ww7dz2tj2s2ma43rlerms6hdhqn',
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