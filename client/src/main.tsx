import React from "react";
import ReactDOM from "react-dom/client";
import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";
import "@/styles/ModelDetail.css";
import "@/styles/globals.css";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import { networkConfig } from "@/networkConfig";
import { ThemeProvider } from "@/shared/ui/theme";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultMode="light">
      <Theme appearance="light" accentColor="orange">
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
            <WalletProvider autoConnect>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </Theme>
    </ThemeProvider>
  </React.StrictMode>
);
