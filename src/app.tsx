import {
  Button,
  CoinAmountInput,
  CoinAmountInputRef,
  Faucet,
} from '@/components'
import { SUI_COIN_TYPE } from '@/components/wallet-provider'
import '@/global.css'
import { useAfterMath, useCoinData } from '@/hooks'
import { formatDecimal, toMist } from '@/lib/utils'
import { ConnectButton, ConnectModal, useCurrentWallet } from '@mysten/dapp-kit'
import '@mysten/dapp-kit/dist/index.css'
import { SUI_DECIMALS } from '@mysten/sui/utils'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@uidotdev/usehooks'
import { Coin, RouterCompleteTradeRoute } from 'aftermath-ts-sdk'
import { ArrowDownUp } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const SwapButton = ({
  onConfirmSwap,
  disabled,
}: {
  onConfirmSwap: VoidFunction
  disabled?: boolean
}) => {
  const wallet = useCurrentWallet()

  if (wallet.isConnected) {
    return (
      <div>
        <Button
          size="xl"
          className="w-full"
          disabled={disabled}
          onClick={onConfirmSwap}
        >
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

const FDUSD_COIN_TYPE =
  '0xf16e6b723f242ec745dfd7634ad072c42d5c1d9ac9d62a39c381303eaa57693a::fdusd::FDUSD'

export function App() {
  const afterMath = useAfterMath()
  const router = afterMath?.Router()

  const amountInInputRef = useRef<CoinAmountInputRef>(null)
  const amountOutInputRef = useRef<CoinAmountInputRef>(null)

  const [slippagePercent, setSlippagePercent] = useState(0.05)

  const [coinInType] = useState(SUI_COIN_TYPE)
  const [coinOutType] = useState(FDUSD_COIN_TYPE)

  const [coinInAmount, setCoinInAmount] = useState('')
  const [coinOutAmount, setCoinOutAmount] = useState('')

  const [optimalRoute, setOptimalRoute] =
    useState<RouterCompleteTradeRoute | null>(null)

  const { data: coinInData } = useCoinData(coinInType)
  const { data: coinOutData } = useCoinData(coinOutType)

  const coinInDecimals = coinInData?.decimals ?? SUI_DECIMALS
  const coinOutDecimals = coinOutData?.decimals ?? SUI_DECIMALS

  const debouncedCoinInAm = useDebounce(coinInAmount, 300)
  const debouncedCoinOutAm = useDebounce(coinOutAmount, 300)

  const { data: inRoute } = useQuery({
    async queryFn({ signal }) {
      return await router?.getCompleteTradeRouteGivenAmountIn(
        {
          coinOutType,
          coinInType,
          coinInAmount: toMist(debouncedCoinInAm, coinInDecimals),
        },
        signal
      )
    },
    enabled: !!router && !!debouncedCoinInAm,
    queryKey: ['getRouteGivenAmountIn', debouncedCoinInAm],
  })

  const { data: outRoute } = useQuery({
    async queryFn({ signal }) {
      return await router?.getCompleteTradeRouteGivenAmountOut(
        {
          coinInType,
          coinOutType,
          slippage: slippagePercent / 100,
          coinOutAmount: toMist(debouncedCoinOutAm, coinOutDecimals),
        },
        signal
      )
    },
    enabled: !!router && !!debouncedCoinOutAm,
    queryKey: ['getRouteGivenAmountOut', debouncedCoinOutAm, slippagePercent],
  })

  useEffect(() => {
    if (!inRoute) return

    setOptimalRoute(inRoute)
    const formattedOutAmount = formatDecimal(
      Coin.balanceWithDecimals(inRoute.coinOut.amount, coinOutDecimals),
      coinOutDecimals
    )

    if (amountOutInputRef.current) {
      amountOutInputRef.current.setValue(formattedOutAmount)
    }
  }, [inRoute, coinOutDecimals])

  useEffect(() => {
    if (!outRoute) return

    setOptimalRoute(outRoute)
    const formattedInAmount = formatDecimal(
      Coin.balanceWithDecimals(outRoute.coinIn.amount, coinInDecimals),
      coinInDecimals
    )

    if (amountInInputRef.current) {
      console.log(formattedInAmount)
      amountInInputRef.current.setValue(formattedInAmount)
    }
  }, [outRoute, coinInDecimals])

  const reverseSwapDirection = useCallback(() => {}, [])

  const confirmSwap = useCallback(() => {}, [])

  return (
    <div className="bg-secondary inset-1 m-auto my-[5%] flex max-w-md flex-col gap-6 rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between border-b-1 py-4">
        <ConnectButton className="!h-10" />
        <Faucet />
      </div>

      <div className="relative mb-6 flex flex-col gap-1">
        <CoinAmountInput
          label="You pay"
          ref={amountInInputRef}
          coinType={coinInType}
          metaData={coinInData}
          onChange={setCoinInAmount}
        />
        <Button
          size="icon"
          variant="outline"
          onClick={reverseSwapDirection}
          className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full"
        >
          <ArrowDownUp />
        </Button>
        <CoinAmountInput
          label="You receive"
          ref={amountOutInputRef}
          hasQuickSelect={false}
          coinType={coinOutType}
          metaData={coinOutData}
          onChange={setCoinOutAmount}
        />
      </div>

      <SwapButton
        onConfirmSwap={confirmSwap}
        disabled={!!coinInAmount && !!coinOutAmount}
      />
    </div>
  )
}

export default App
