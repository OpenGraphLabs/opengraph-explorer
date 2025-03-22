import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { SUI_NETWORK } from "./constants/suiConfig";

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  devnet: {
    url: getFullnodeUrl("devnet"),
  },
  testnet: {
    url: getFullnodeUrl("testnet"),
  },
  mainnet: {
    url: getFullnodeUrl("mainnet"),
  },
});

// Sui 클라이언트 인스턴스
export const suiClient = new SuiClient({ url: SUI_NETWORK.URL });

export { useNetworkVariable, useNetworkVariables, networkConfig };
