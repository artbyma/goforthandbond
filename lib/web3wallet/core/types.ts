import { AbstractConnector } from '@web3-react/abstract-connector'
import {ConnectorSet} from "../Connector";

export interface Web3ReactManagerFunctions {
  activate: (connector: AbstractConnector, onError?: (error: Error) => void, throwErrors?: boolean) => Promise<void>
  setError: (error: Error) => void
  deactivate: () => void
}

export interface Web3ReactManagerReturn extends Web3ReactManagerFunctions {
  connector?: AbstractConnector
  provider?: any
  chainId?: number
  account?: null | string

  error?: Error,
  activatingConnector?: AbstractConnector
}

export interface Web3ReactContextInterface<T = any> extends Web3ReactManagerFunctions {
  connector?: AbstractConnector,
  connectors?: ConnectorSet,
  activatingConnector?: AbstractConnector
  library?: T
  chainId?: number
  account?: null | string

  active: boolean
  error?: Error
}