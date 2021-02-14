import {IProviderInfo} from "./types";
import * as standardProviders from "./standardProviders";
import * as injectedProviders from "./injectedProviders";
import {FALLBACK} from "./injectedProviders";

// Index provider metadata recrds by id
const providerInfoById = [
  ...Object.values(standardProviders),
  ...Object.values(injectedProviders)
].reduce((d, item) => { d[item.id] = item; return d; }, {})


/**
 * We give each supported provider an ID. Use it to query the info we have about this
 * provider, such as the name or logo.
 */
export function getProviderInfo(id: string): IProviderInfo {
  const info = id == 'injected' ? FALLBACK : providerInfoById[id];
  if (!info) {
    throw new Error(`Invalid provider id: ${id}`);
  }
  return {
    ...info,
    description: getProviderDescription(info)
  }
}

export function getProviderDescription(
    providerInfo: Partial<IProviderInfo>
): string {
  if (providerInfo.description) {
    return providerInfo.description;
  }
  let description = "";
  switch (providerInfo.type) {
    case "injected":
      description = `Connect to your ${providerInfo.name} Wallet`;
      break;
    case "web":
      description = `Connect with your ${providerInfo.name} account`;
      break;
    case "qrcode":
      description = `Scan with ${providerInfo.name} to connect`;
      break;
    case "hardware":
      description = `Connect to your ${providerInfo.name} Hardware Wallet`;
      break;
    default:
      break;
  }
  return description;
}