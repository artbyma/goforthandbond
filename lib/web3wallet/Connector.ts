/**
 * A `connector` is a function which knows how to connect to a provider.
 * We don't actually provide those - we use the connectors implemented in `web3-react`, and the API they provide.
 *
 * What we *are* doing is maintaining a list of provider metadata (names, icons, and so on). We assign to each
 * provider an id, and it is up to you to configure and provide the connectors you want to use, mapped to our
 * provider ids. In that way, we enrich the `web3-react` connectors with metadata.
 *
 * When it comes to the `injected` connector, this mapping is not 1:1. We define multiple providers, based on the
 * different browser plugins which can inject themselves, but there is only one connector which
 **/

import {getProviderInfo} from "./providerdb";
import {AbstractConnector} from "@web3-react/abstract-connector";


// This is used to map a `web3-react` connector implementation to an entry in the provider metadata list.
export interface Connector {
  provider: string,
  connector: AbstractConnector,
}

// Various ways to specify a set of connectors
export type ConnectorSet = Connector[]|{[provider: string]: AbstractConnector};


/**
 * Return a list of connectors, and their provider information attached.
 *
 * TODO: Auto-detect injected here...
 */
export function resolveConnectors(set: ConnectorSet) {
  let connectors: Connector[];
  if (!Array.isArray(set)) {
    connectors = Object.entries(set).map(([id, connector]) => {
      return {provider: id, connector};
    })
  } else {
    connectors = set;
  }

  return connectors.map(connector => {
    // the provider "injected" is special - we try to autodetect it.
    return {
      info: getProviderInfo(connector.provider),
      connector: connector.connector,
      // connector and provider id are the same, expect for the "injected" connector, which can map to multiple providers.
      connectorId: connector.provider
    };
  })
}


/**
 * Find the connector for the given provider id.
 */
export function findConnectorById(set: ConnectorSet, id: string) {
  const providers = resolveConnectors(set);
  return providers.find(p => p.connectorId == id);
}