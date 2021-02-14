import WalletConnectLogo from "../logos/walletconnect-circle.svg";
import PortisLogo from "../logos/portis.svg";
import FortmaticLogo from "../logos/fortmatic.svg";
import ArkaneLogo from "../logos/arkane.svg";
import TorusLogo from "../logos/torus.svg";
import AuthereumLogo from "../logos/authereum.svg";
import BurnerWalletLogo from "../logos/burnerwallet.png";
import MEWwallet from "../logos/mewwallet.png";
import DcentWalletLogo from "../logos/dcentwallet.png";
import BitskiLogo from "../logos/bitski.svg";
import FrameLogo from "../logos/frame.svg";
import Web3DefaultLogo from "../logos/web3-default.svg";
import {IProviderInfo} from "./types";


export const WALLETCONNECT: IProviderInfo = {
  id: "walletconnect",
  name: "WalletConnect",
  logo: WalletConnectLogo,
  type: "qrcode",
};

export const PORTIS: IProviderInfo = {
  id: "portis",
  name: "Portis",
  logo: PortisLogo,
  type: "web",
};

export const FORTMATIC: IProviderInfo = {
  id: "fortmatic",
  name: "Fortmatic",
  logo: FortmaticLogo,
  type: "web",
};

export const TORUS: IProviderInfo = {
  id: "torus",
  name: "Torus",
  logo: TorusLogo,
  type: "web",
};

export const ARKANE: IProviderInfo = {
  id: "arkane",
  name: "Arkane",
  logo: ArkaneLogo,
  type: "web",
  package: {
    required: ["clientId"]
  }
};

export const AUTHEREUM: IProviderInfo = {
  id: "authereum",
  name: "Authereum",
  logo: AuthereumLogo,
  type: "web",
};

export const WALLETLINK: IProviderInfo = {
  id: "walletlink",
  name: "WalletLink",
  logo: Web3DefaultLogo,
  type: "web",
};

export const BURNERCONNECT: IProviderInfo = {
  id: "burnerconnect",
  name: "Burner Connect",
  logo: BurnerWalletLogo,
  type: "web",
};

export const MEWCONNECT: IProviderInfo = {
  id: "mewconnect",
  name: "MEW wallet",
  logo: MEWwallet,
  type: "qrcode",
  package: {
    required: [["infuraId", "rpc"]]
  }
};

export const DCENT: IProviderInfo = {
  id: "dcentwallet",
  name: "D'CENT",
  logo: DcentWalletLogo,
  type: "hardware",
  package: {
    required: ["rpcUrl"]
  }
};

export const TREZOR: IProviderInfo = {
  id: "trezor",
  name: "Trezor",
  logo: Web3DefaultLogo,
  type: "hardware",
};

export const LEDGER: IProviderInfo = {
  id: "ledger",
  name: "Ledger",
  logo: Web3DefaultLogo,
  type: "hardware",
};

export const LATTICE: IProviderInfo = {
  id: "lattice",
  name: "Lattice",
  logo: Web3DefaultLogo,
  type: "hardware",
};

export const BITSKI: IProviderInfo = {
  id: "bitski",
  name: "Bitski",
  logo: BitskiLogo,
  type: "web",
  package: {
    required: ["clientId", "callbackUrl"]
  }
};

export const FRAME: IProviderInfo = {
  id: "frame",
  name: "Frame",
  logo: FrameLogo,
  type: "web",
};
