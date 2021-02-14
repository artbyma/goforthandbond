import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { LedgerConnector } from '@web3-react/ledger-connector'
import { TrezorConnector } from '@web3-react/trezor-connector'
import { TorusConnector } from '@web3-react/torus-connector'
import { LatticeConnector } from '@web3-react/lattice-connector'


const RPC_URL = "";
const APP_NAME = "Mahin NFT";
const POLLING_INTERVAL = 12000;


/**
 * Return all the connectors we are using.
 */
// TODO: We could make this a generic getAll() function in web3wallet, since none of them require an api key.
export function getConnectors(chainId: number) {
  const injected = new InjectedConnector({ supportedChainIds: [chainId] })

  const walletconnect = new WalletConnectConnector({
    rpc: { 1: RPC_URL },
    bridge: 'https://bridge.walletconnect.org',
    qrcode: true,
    pollingInterval: POLLING_INTERVAL
  });

  const torus = new TorusConnector({ chainId: chainId })

  const trezor = new TrezorConnector({
    chainId: chainId,
    url: RPC_URL,
    pollingInterval: POLLING_INTERVAL,
    manifestEmail: 'dummy@abc.xyz',
    manifestAppUrl: 'http://localhost:1234'
  });

  const ledger = new LedgerConnector({
    chainId: chainId, url: RPC_URL, pollingInterval: POLLING_INTERVAL });

  const walletlink = new WalletLinkConnector({
    url: RPC_URL,
    appName: APP_NAME
  });

  const lattice = new LatticeConnector({
    chainId: chainId,
    appName: APP_NAME,
    url: RPC_URL,
  });

  return {
    injected,
    walletconnect,
    torus,
    trezor,
    ledger,
    walletlink,
    lattice
  }
}