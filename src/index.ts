import { Relayer } from 'defender-relay-client';
import { RelayerModel, RelayerParams } from 'defender-relay-client/lib/relayer';
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { ethers } from 'ethers'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const facadeAddr = '0x798918a19AedDA5B923ffC053a63e6a96911dC0a'
const speed = 'average'

const keepRToken = async (signer: DefenderRelaySigner, rTokenAddr: string) => {
  // Fetch call to make
  const abi = [{
      "inputs": [
        {
          "internalType": "contract IRToken",
          "name": "rToken",
          "type": "address"
        }
      ],
      "name": "getActCalldata",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }]
    const facade = new ethers.Contract(facadeAddr, abi, signer);
    const [to, data] = await facade.callStatic.getActCalldata(rTokenAddr);
    console.log(to, data);

    // Send tx if real
    if (to != ZERO_ADDRESS && data != "0x") {
        const tx = await signer.populateTransaction({to, data, speed})
        tx.gasLimit = (tx.gasLimit as ethers.BigNumber).mul(101).div(100)
        console.log(await signer.checkTransaction(tx));
        console.log(await signer.sendTransaction(tx));
    }
}

// Entrypoint for the Autotask
export async function handler(credentials: RelayerParams) {
  const relayer = new Relayer(credentials);
  const info: RelayerModel = await relayer.getRelayer();
  console.log(`Relayer address is ${info.address}`);

  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, { speed });

  const rTokenAddrs = ['0x40008f2E9B40a5Cb6AfC9B2C9c018Ed109b8CB55'] // can expand

  for (const addr of rTokenAddrs) {
    await keepRToken(signer, addr)
  }

}

// Sample typescript type definitions
type EnvInfo = {
  API_KEY: string;
  API_SECRET: string;
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
  require('dotenv').config();
  const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env as EnvInfo;
  handler({ apiKey, apiSecret })
    .then(() => process.exit(0))
    .catch((error: Error) => { console.error(error); process.exit(1); });
}
