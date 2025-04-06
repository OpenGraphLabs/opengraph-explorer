import { SUI_NETWORK } from "../constants/suiConfig";

// Get Sui Explorer URL
export const getSuiScanUrl = (type: "transaction" | "object" | "account", id: string) => {
  const baseUrl = `https://suiscan.xyz/${SUI_NETWORK.TYPE}`;

  if (type === "transaction") {
    return `${baseUrl}/tx/${id}`;
  } else if (type === "account") {
    return `${baseUrl}/account/${id}`;
  } else {
    return `${baseUrl}/object/${id}`;
  }
};
