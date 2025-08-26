import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { zkLoginService } from "@/shared/services/zkLoginService";

interface ZkLoginState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  ephemeralPublicKey: string | null;
  nonce: string | null;
  suiAddress: string | null;
  zkProofCompleted: boolean;
}

interface ZkLoginContextValue extends ZkLoginState {
  initializeZkLogin: () => Promise<boolean>;
  generateGoogleOAuthUrl: () => Promise<string | null>;
  generateZkProof: (jwtToken: string) => Promise<boolean>;
  setSuiAddress: (address: string) => void;
  clearSession: () => void;
}

const ZkLoginContext = createContext<ZkLoginContextValue | undefined>(undefined);

export function ZkLoginProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ZkLoginState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    ephemeralPublicKey: null,
    nonce: null,
    suiAddress: null,
    zkProofCompleted: false,
  });

  const isInitializing = useRef(false);

  const initializeZkLogin = useCallback(async (): Promise<boolean> => {
    // This function is now mainly for explicit initialization if needed
    // Most initialization happens in generateGoogleOAuthUrl
    if (state.isInitialized) {
      return true;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Initialize ephemeral key pair
      const keyPair = await zkLoginService.initializeEphemeralKeyPair();
      const publicKey = keyPair.getPublicKey().toBase64();

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        ephemeralPublicKey: publicKey,
      }));

      return true;
    } catch (error) {
      console.error("Failed to initialize zkLogin:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to initialize zkLogin",
      }));
      return false;
    }
  }, [state.isInitialized]);

  const generateGoogleOAuthUrl = useCallback(async (): Promise<string | null> => {
    // Use server-based initialization
    try {
      // Always get nonce from zkLoginService directly to ensure consistency
      let nonce: string;

      try {
        // Try to generate nonce, if it fails, initialize ephemeral key pair first
        try {
          nonce = zkLoginService.generateNonce();
        } catch (error) {
          await zkLoginService.initializeEphemeralKeyPair();
          nonce = zkLoginService.generateNonce();
        }

        // Update state with the nonce for reference
        setState(prev => ({
          ...prev,
          nonce: nonce,
          isInitialized: true,
          ephemeralPublicKey: zkLoginService.getEphemeralKeyPair().getPublicKey().toBase64(),
        }));
      } catch (nonceError) {
        throw new Error("Failed to generate nonce. Please try again.");
      }

      const oauthUrl = await zkLoginService.initializeWithServer(nonce);
      return oauthUrl;
    } catch (error) {
      console.error("Failed to generate OAuth URL:", error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to generate OAuth URL",
      }));
      return null;
    }
  }, []);

  const generateZkProof = useCallback(async (jwtToken: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await zkLoginService.generateZkProof(jwtToken);

      setState(prev => ({
        ...prev,
        isLoading: false,
        suiAddress: result.sui_address,
        zkProofCompleted: true,
      }));

      return true;
    } catch (error) {
      console.error("Failed to generate ZK proof:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to generate ZK proof",
      }));
      return false;
    }
  }, []);

  const setSuiAddress = useCallback((address: string) => {
    setState(prev => ({
      ...prev,
      suiAddress: address,
      zkProofCompleted: true,
    }));
  }, []);

  const clearSession = useCallback(() => {
    zkLoginService.clearSession();
    setState({
      isInitialized: false,
      isLoading: false,
      error: null,
      ephemeralPublicKey: null,
      nonce: null,
      suiAddress: null,
      zkProofCompleted: false,
    });
  }, []);

  const value: ZkLoginContextValue = {
    ...state,
    initializeZkLogin,
    generateGoogleOAuthUrl,
    generateZkProof,
    setSuiAddress,
    clearSession,
  };

  return <ZkLoginContext.Provider value={value}>{children}</ZkLoginContext.Provider>;
}

export function useZkLogin() {
  const context = useContext(ZkLoginContext);
  if (!context) {
    throw new Error("useZkLogin must be used within ZkLoginProvider");
  }
  return context;
}
