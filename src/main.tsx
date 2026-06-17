import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster } from "@/components/ui/sonner.tsx"
import { AuthProvider } from "@/contexts/AuthContext.tsx"
import { SellerProvider } from "@/contexts/SellerContext.tsx"
import { WalletProvider } from "@/contexts/WalletContext.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <SellerProvider>
            <WalletProvider>
              <App />
              <Toaster richColors closeButton position="top-right" />
            </WalletProvider>
          </SellerProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
