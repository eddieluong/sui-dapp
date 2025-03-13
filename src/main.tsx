import { App } from '@/app'
import { SuiWallet } from '@/components/wallet-provider'
import '@/global.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SuiWallet>
      <App />
      <Toaster richColors />
    </SuiWallet>
  </StrictMode>
)
