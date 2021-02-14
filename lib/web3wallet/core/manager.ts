import { useReducer, useEffect, useCallback, useRef } from 'react'
import { ConnectorUpdate, ConnectorEvent } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import warning from 'tiny-warning'

import { Web3ReactManagerReturn } from './types'
import { normalizeChainId, normalizeAccount } from './normalizers'
import {ConnectorSet, findConnectorById} from "../Connector";

class StaleConnectorError extends Error {
  constructor() {
    super()
    this.name = this.constructor.name
  }
}

export class UnsupportedChainIdError extends Error {
  public constructor(unsupportedChainId: number, supportedChainIds?: readonly number[]) {
    super()
    this.name = this.constructor.name
    this.message = `Unsupported chain id: ${unsupportedChainId}. Supported chain ids are: ${supportedChainIds}.`
  }
}

interface Web3ReactManagerState {
  // The connector in the process of being activated.
  activatingConnector?: AbstractConnector

  connector?: AbstractConnector
  provider?: any
  chainId?: number
  account?: null | string

  error?: Error
}

enum ActionType {
  CONNECTOR_ACTIVATION_STARTED,
  CONNECTOR_ACTIVATION_SUCCESS,
  CONNECTOR_ACTIVATION_FAILED,
  UPDATE,
  UPDATE_FROM_ERROR,
  ERROR,
  DEACTIVATE_CONNECTOR
}

interface Action {
  type: ActionType
  payload?: any
}

function reducer(state: Web3ReactManagerState, { type, payload }: Action): Web3ReactManagerState {
  switch (type) {
    case ActionType.CONNECTOR_ACTIVATION_STARTED: {
      const { connector } = payload
      return { ...state, activatingConnector: connector }
    }
    case ActionType.CONNECTOR_ACTIVATION_SUCCESS: {
      const { connector, provider, chainId, account } = payload
      return { connector, provider, chainId, account }
    }
    case ActionType.CONNECTOR_ACTIVATION_FAILED: {
      const { connector, error } = payload
      return {
        ...state,
        activatingConnector: undefined,
        connector,
        error
      }
    }
    case ActionType.UPDATE: {
      const { provider, chainId, account } = payload
      return {
        ...state,
        ...(provider === undefined ? {} : { provider }),
        ...(chainId === undefined ? {} : { chainId }),
        ...(account === undefined ? {} : { account })
      }
    }
    case ActionType.UPDATE_FROM_ERROR: {
      const { provider, chainId, account } = payload
      return {
        ...state,
        ...(provider === undefined ? {} : { provider }),
        ...(chainId === undefined ? {} : { chainId }),
        ...(account === undefined ? {} : { account }),
        error: undefined
      }
    }
    case ActionType.ERROR: {
      const { error } = payload
      const { connector } = state
      return {
        ...state,
        connector,
        error
      }
    }
    case ActionType.DEACTIVATE_CONNECTOR: {
      return {}
    }
  }
}

async function augmentConnectorUpdate(
    connector: AbstractConnector,
    update: ConnectorUpdate
): Promise<ConnectorUpdate<number>> {
  const provider = update.provider === undefined ? await connector.getProvider() : update.provider
  const [_chainId, _account] = (await Promise.all([
    update.chainId === undefined ? connector.getChainId() : update.chainId,
    update.account === undefined ? connector.getAccount() : update.account
  ])) as [Required<ConnectorUpdate>['chainId'], Required<ConnectorUpdate>['account']]

  const chainId = normalizeChainId(_chainId)
  if (!!connector.supportedChainIds && !connector.supportedChainIds.includes(chainId)) {
    throw new UnsupportedChainIdError(chainId, connector.supportedChainIds)
  }
  const account = _account === null ? _account : normalizeAccount(_account)

  return { provider, chainId, account }
}

/**
 * This provides the context value for a manager.
 *
 * TODO: Right now returns a single account; support multiple accounts, and multiple providers.
 * -
 */
export function useWeb3ReactManager(props?: {
  // This is only used or needed for restoring a connection.
  connectors?: ConnectorSet
}): Web3ReactManagerReturn {
  const [state, dispatch] = useReducer(reducer, {})
  const { connector, provider, chainId, account, error } = state;

  const updateBusterRef = useRef(-1);
  useEffect(() => {
    updateBusterRef.current += 1;
  }, [updateBusterRef]);

  const activate = useCallback(
      async (connector: AbstractConnector): Promise<void> => {
        const updateBusterInitial = updateBusterRef.current

        let activated = false
        try {
          dispatch({ type: ActionType.CONNECTOR_ACTIVATION_STARTED, payload: { connector }})
          const update: ConnectorUpdate = await connector.activate();
          activated = true

          const augmentedUpdate = await augmentConnectorUpdate(connector, update)

          if (updateBusterRef.current > updateBusterInitial) {
            throw new StaleConnectorError()
          }
          dispatch({ type: ActionType.CONNECTOR_ACTIVATION_SUCCESS, payload: { connector, ...augmentedUpdate } })
        } catch (error) {
          if (error instanceof StaleConnectorError) {
            activated && connector.deactivate()
            warning(false, `Suppressed stale connector activation ${connector}`)
            return;
          }

          // we don't call activated && connector.deactivate() here because it'll be handled in the useEffect
          dispatch({ type: ActionType.CONNECTOR_ACTIVATION_FAILED, payload: { connector, error } })

          throw error;
        }
      },
      []
  )

  const setError = useCallback((error: Error): void => {
    dispatch({ type: ActionType.ERROR, payload: { error } })
  }, [])

  const deactivate = useCallback((): void => {
    dispatch({ type: ActionType.DEACTIVATE_CONNECTOR })
  }, [])

  const handleUpdate = useCallback(
      async (update: ConnectorUpdate): Promise<void> => {
        if (!connector) {
          throw Error("This should never happen, it's just so Typescript stops complaining")
        }

        const updateBusterInitial = updateBusterRef.current

        // updates are handled differently depending on whether the connector is active vs in an error state
        if (!error) {
          const chainId = update.chainId === undefined ? undefined : normalizeChainId(update.chainId)
          if (chainId !== undefined && !!connector.supportedChainIds && !connector.supportedChainIds.includes(chainId)) {
            const error = new UnsupportedChainIdError(chainId, connector.supportedChainIds)
            dispatch({ type: ActionType.ERROR, payload: { error } });
          } else {
            const account = typeof update.account === 'string' ? normalizeAccount(update.account) : update.account
            dispatch({ type: ActionType.UPDATE, payload: { provider: update.provider, chainId, account } })
          }
        } else {
          try {
            const augmentedUpdate = await augmentConnectorUpdate(connector, update)

            if (updateBusterRef.current > updateBusterInitial) {
              throw new StaleConnectorError()
            }
            dispatch({ type: ActionType.UPDATE_FROM_ERROR, payload: augmentedUpdate })
          } catch (error) {
            if (error instanceof StaleConnectorError) {
              warning(false, `Suppressed stale connector update from error state ${connector} ${update}`)
            } else {
              // though we don't have to, we're re-circulating the new error
              dispatch({ type: ActionType.ERROR, payload: { error } })
            }
          }
        }
      },
      [connector, error]
  )
  const handleError = useCallback(
      (error: Error): void => {
        dispatch({ type: ActionType.ERROR, payload: { error } })
      },
      []
  )
  const handleDeactivate = useCallback((): void => {
    dispatch({ type: ActionType.DEACTIVATE_CONNECTOR })
  }, []);

  // ensure that connectors which were set are deactivated
  useEffect((): (() => void) => {
    return () => {
      if (connector) {
        connector.deactivate()
      }
    }
  }, [connector]);

  // Try to restore a previous connection.
  // Prior art:
  // - Trying only metamask: https://github.com/NoahZinsmeister/web3-react/blob/3a4fbf5d6a22b24df901c6d8eda0cc23b15d8916/example/hooks.ts
  // - Uniswap copy of that code: https://github.com/Uniswap/uniswap-interface/blob/8fd894f2d1b03921c5519c050aed164343c47fb1/src/hooks/index.ts#L52
  // - web3modal cached provider: https://github.com/Web3Modal/web3modal/blob/c17015b8160c7d28e3443b9f048692a1df880bb2/src/controllers/providers.ts
  // We may try to test the injected provider (like useEagerLoad() in the examples above), even if it is not in
  // the cache.
  useEffect(() => {
    if (!props?.connectors) {
      return;
    }
    let cachedProvider = 'injected';
    const connector = findConnectorById(props.connectors, cachedProvider);
    if (connector) {
      activate(connector.connector);
    }
  }, []);

  // ensure that events emitted from the set connector are handled appropriately
  useEffect((): (() => void) => {
    if (connector) {
      connector
          .on(ConnectorEvent.Update, handleUpdate)
          .on(ConnectorEvent.Error, handleError)
          .on(ConnectorEvent.Deactivate, handleDeactivate)
    }

    return () => {
      if (connector) {
        connector
            .off(ConnectorEvent.Update, handleUpdate)
            .off(ConnectorEvent.Error, handleError)
            .off(ConnectorEvent.Deactivate, handleDeactivate)
      }
    }
  }, [connector, handleUpdate, handleError, handleDeactivate])

  return {
    connector, provider, chainId, account, activate, setError, deactivate, error,
    activatingConnector: state.activatingConnector
  }
}