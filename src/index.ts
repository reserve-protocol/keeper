import { Relayer } from 'defender-relay-client';
import { RelayerModel, RelayerParams } from 'defender-relay-client/lib/relayer';
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { ethers } from 'ethers'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const facadeActAddr = '0x348644F24FA34c40a8E3C4Cf9aF14f8a96aD63fC' // # v1.1.0
const speed = 'safeLow'

// Append RTokens to this list to have them kept by the keeper
const rTokenAddrs = ['0x40008f2E9B40a5Cb6AfC9B2C9c018Ed109b8CB55'] // can expand
// Careful: This address (0x40008f2E9B40a5Cb6AfC9B2C9c018Ed109b8CB55) has no auction limits,
// so most keeps result in a tx. 

const keepRToken = async (signer: DefenderRelaySigner, rTokenAddr: string) => {
  console.log("========================================================")
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
    const facadeAct = new ethers.Contract(facadeActAddr, abi, signer);
    const [to, data] = await facadeAct.callStatic.getActCalldata(rTokenAddr);
    console.log(to, data);

    // Send tx if real
    if (to != ZERO_ADDRESS && data != "0x") {
        const tx = await signer.populateTransaction({to, data, speed})
        tx.gasLimit = (tx.gasLimit as ethers.BigNumber).mul(101).div(100)
        console.log(`Sending tx for RToken ${rTokenAddr}`, await signer.sendTransaction(tx));
    } else {
      console.log(`No action required for RToken ${rTokenAddr}`)
    }
}

// Entrypoint for the Autotask
export async function handler(credentials: RelayerParams) {
  const relayer = new Relayer(credentials);
  const info: RelayerModel = await relayer.getRelayer();
  console.log(`Relayer address is ${info.address}`);

  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, { speed });

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
