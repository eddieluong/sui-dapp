import { AmountInput, Button, Faucet } from '@/components'
import { SUI_COIN_TYPE } from '@/components/wallet-provider'
import '@/global.css'
import { ConnectButton, ConnectModal, useCurrentWallet } from '@mysten/dapp-kit'
import '@mysten/dapp-kit/dist/index.css'
import { ArrowDown } from 'lucide-react'
import { useCallback, useState } from 'react'

const SwapButton = ({ onConfirmSwap }: { onConfirmSwap: VoidFunction }) => {
  const wallet = useCurrentWallet()

  if (wallet.isConnected) {
    return (
      <div>
        <Button size="xl" className="w-full" onClick={onConfirmSwap}>
          Confirm and Swap
        </Button>
      </div>
    )
  }

  return (
    <ConnectModal
      trigger={
        <Button size="xl" className="w-full" disabled={wallet.isConnecting}>
          Connect wallet
        </Button>
      }
    />
  )
}

export function App() {
  const [amount, setAmount] = useState('')

  const reverseSwapDirection = useCallback(() => {}, [])

  const confirmSwap = useCallback(() => {}, [])

  return (
    <div className="bg-secondary m-auto my-[5%] flex max-w-md flex-col gap-6 divide-y-2 rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between py-4">
        <ConnectButton className="!h-10" />
        <Faucet />
      </div>

      <div className="relative flex flex-col gap-1 pb-6">
        <AmountInput
          label="You pay"
          value={amount}
          coinType={SUI_COIN_TYPE}
          onChange={(am) => setAmount(am)}
        />
        <Button
          size="icon"
          variant="outline"
          onClick={reverseSwapDirection}
          className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full"
        >
          <ArrowDown />
        </Button>
        <AmountInput
          value={amount}
          label="You receive"
          hasQuickSelect={false}
          coinType="0xf16e6b723f242ec745dfd7634ad072c42d5c1d9ac9d62a39c381303eaa57693a::fdusd::FDUSD"
          onChange={(am) => setAmount(am)}
        />
      </div>

      <SwapButton onConfirmSwap={confirmSwap} />
    </div>
  )
}

export default App
