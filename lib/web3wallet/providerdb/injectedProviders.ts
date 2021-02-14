import {IProviderInfo} from "./types";
import Web3DefaultLogo from "../logos/web3-default.svg";
import MetaMaskLogo from "../logos/metamask.svg";
import SafeLogo from "../logos/safe.svg";
import NiftyWalletLogo from "../logos/niftyWallet.png";
import DapperLogo from "../logos/dapper.png";
import OperaLogo from "../logos/opera.svg";
import TrustLogo from "../logos/trust.svg";
import CoinbaseLogo from "../logos/coinbase.svg";
import CipherLogo from "../logos/cipher.svg";
import imTokenLogo from "../logos/imtoken.svg";
import StatusLogo from "../logos/status.svg";
import TokenaryLogo from "../logos/tokenary.png";
import FrameLogo from "../logos/frame.svg";
import LiqualityLogo from "../logos/liquality.png";

export const FALLBACK: IProviderInfo = {
  id: "fallback",
  name: "Web3",
  logo: Web3DefaultLogo,
  type: "injected",
  check: "isWeb3"
};

export const METAMASK: IProviderInfo = {
  id: "metamask",
  name: "MetaMask",
  logo: MetaMaskLogo,
  type: "injected",
  check: "isMetaMask"
};

export const SAFE: IProviderInfo = {
  id: "safe",
  name: "Safe",
  logo: SafeLogo,
  type: "injected",
  check: "isSafe"
};

export const NIFTY: IProviderInfo = {
  id: "nifty",
  name: "Nifty",
  logo: NiftyWalletLogo,
  type: "injected",
  check: "isNiftyWallet"
};

export const DAPPER: IProviderInfo = {
  id: "dapper",
  name: "Dapper",
  logo: DapperLogo,
  type: "injected",
  check: "isDapper"
};

export const OPERA: IProviderInfo = {
  id: "opera",
  name: "Opera",
  logo: OperaLogo,
  type: "injected",
  check: "isOpera"
};

export const TRUST: IProviderInfo = {
  id: "trust",
  name: "Trust",
  logo: TrustLogo,
  type: "injected",
  check: "isTrust"
};

export const COINBASE: IProviderInfo = {
  id: "coinbase",
  name: "Coinbase",
  logo: CoinbaseLogo,
  type: "injected",
  check: "isToshi"
};

export const CIPHER: IProviderInfo = {
  id: "cipher",
  name: "Cipher",
  logo: CipherLogo,
  type: "injected",
  check: "isCipher"
};

export const IMTOKEN: IProviderInfo = {
  id: "imtoken",
  name: "imToken",
  logo: imTokenLogo,
  type: "injected",
  check: "isImToken"
};

export const STATUS: IProviderInfo = {
  id: "status",
  name: "Status",
  logo: StatusLogo,
  type: "injected",
  check: "isStatus"
};

export const TOKENARY: IProviderInfo = {
  id: "tokenary",
  name: "Tokenary",
  logo: TokenaryLogo,
  type: "injected",
  check: "isTokenary"
};

export const FRAMEINJECTED: IProviderInfo = {
  id: "frameinjected",
  name: "Frame",
  logo: FrameLogo,
  type: "injected",
  check: "isFrame"
};

export const LIQUALITY: IProviderInfo = {
  id: "liquality",
  name: "Liquality",
  logo: LiqualityLogo,
  type: "injected",
  check: "isLiquality"
};