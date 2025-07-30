import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { Theme as RadixTheme } from "@radix-ui/themes";
import { ThemeProvider } from "@/shared/ui/design-system";
import { networkConfig } from "@/networkConfig.ts";
import { AuthProvider } from "@/contexts/data/AuthContext";
import { ZkLoginProvider } from "@/contexts/data/ZkLoginContext";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
          <WalletProvider autoConnect>
            <ZkLoginProvider>
              <AuthProvider>
                <ThemeProvider defaultMode="light">
                  <RadixTheme
                    appearance="inherit" // Will inherit from our ThemeProvider
                    accentColor="gray"
                    grayColor="slate"
                    radius="medium"
                    scaling="100%"
                  >
                    {children}
                  </RadixTheme>
                </ThemeProvider>
              </AuthProvider>
            </ZkLoginProvider>
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
