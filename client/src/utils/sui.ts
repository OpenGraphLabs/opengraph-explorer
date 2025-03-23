import { SUI_NETWORK } from "../constants/suiConfig";

// Get Sui Explorer URL
export const getSuiScanUrl = (type: 'transaction' | 'object', id: string) => {
  const baseUrl = `https://suiscan.xyz/${SUI_NETWORK.TYPE}`;
  return type === 'transaction' 
    ? `${baseUrl}/tx/${id}`
    : `${baseUrl}/object/${id}`;
};