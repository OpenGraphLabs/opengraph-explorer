import { SUI_NETWORK } from "../constants/suiConfig";

// Get Sui Explorer URL
export const getSuiScanUrl = (type: "transaction" | "object" | "account", id: string) => {
  const baseUrl = `https://suiscan.xyz/${SUI_NETWORK.TYPE}`;

  if (type === "transaction") {
    return `${baseUrl}/tx/${id}`;
  } else if (type === "account") {
    return `${baseUrl}/account/${id}/fields`;
  } else {
    return `${baseUrl}/object/${id}/fields`;
  }
};

// Get WalruScan URL
export const getWalruScanUrl = (blogId: string) => {
  return `https://walruscan.com/${SUI_NETWORK.TYPE}/blob/${blogId}`;
};
