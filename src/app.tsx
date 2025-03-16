import {
  Button,
  CoinAmountInput,
  CoinAmountInputRef,
  DecimalInput,
  Faucet,
  LoadingButton,
} from '@/components'
import { SUI_COIN_TYPE } from '@/components/wallet-provider'
import '@/global.css'
import { useAfterMath, useCoinData, useGetBalance } from '@/hooks'
import { formatDecimal, toMist } from '@/lib/utils'
import {
  ConnectButton,
  ConnectModal,
  useCurrentAccount,
  useCurrentWallet,
  useSignAndExecuteTransaction,
} from '@mysten/dapp-kit'
import '@mysten/dapp-kit/dist/index.css'
import { formatDigest, SUI_DECIMALS } from '@mysten/sui/utils'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@uidotdev/usehooks'
import { Coin, RouterCompleteTradeRoute } from 'aftermath-ts-sdk'
import { ArrowDownUp } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const SwapButton = ({
  loading,
  disabled,
  onConfirmSwap,
}: {
  loading: boolean
  disabled?: boolean
  onConfirmSwap: VoidFunction
}) => {
  const wallet = useCurrentWallet()

  if (wallet.isConnected) {
    return (
      <LoadingButton
        size="xl"
        loading={loading}
        className="w-full"
        disabled={disabled}
        onClick={onConfirmSwap}
      >
        Confirm and Swap
      </LoadingButton>
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
  const account = useCurrentAccount()

  const amountInInputRef = useRef<CoinAmountInputRef>(null)
  const amountOutInputRef = useRef<CoinAmountInputRef>(null)

  const [slippagePercent, setSlippagePercent] = useState('0.5')
  const slippage = Number(slippagePercent) / 100

  const [coinInType, setCoinInType] = useState(SUI_COIN_TYPE)
  const [coinOutType, setCoinOutType] = useState(FDUSD_COIN_TYPE)

  const [coinInAmount, setCoinInAmount] = useState('')
  const [coinOutAmount, setCoinOutAmount] = useState('')

  const [optimalRoute, setOptimalRoute] =
    useState<RouterCompleteTradeRoute | null>(null)

  const { data: coinInData } = useCoinData(coinInType)
  const { data: coinOutData } = useCoinData(coinOutType)
  const { refetch: refetchCoinInBalance } = useGetBalance(coinInType)
  const { refetch: refetchCoinOutBalance } = useGetBalance(coinOutType)

  const coinInDecimals = coinInData?.decimals ?? SUI_DECIMALS
  const coinOutDecimals = coinOutData?.decimals ?? SUI_DECIMALS

  const debouncedCoinInAm = useDebounce(coinInAmount, 300)
  const debouncedCoinOutAm = useDebounce(coinOutAmount, 300)

  const { data: inRoute, isLoading: loadingRouteIn } = useQuery({
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
    enabled: !!router && !!coinInAmount,
    queryKey: [
      'getRouteGivenAmountIn',
      coinInType,
      coinOutType,
      debouncedCoinInAm,
    ],
  })

  const { data: outRoute, isLoading: loadingRouteOut } = useQuery({
    async queryFn({ signal }) {
      return await router?.getCompleteTradeRouteGivenAmountOut(
        {
          coinInType,
          coinOutType,
          slippage,
          coinOutAmount: toMist(debouncedCoinOutAm, coinOutDecimals),
        },
        signal
      )
    },
    enabled: !!router && !!coinOutAmount,
    queryKey: [
      'getRouteGivenAmountOut',
      slippage,
      coinInType,
      coinOutType,
      debouncedCoinOutAm,
    ],
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
      amountInInputRef.current.setValue(formattedInAmount)
    }
  }, [outRoute, coinInDecimals])

  const reverseSwapDirection = useCallback(() => {
    setCoinInType(coinOutType)
    setCoinOutType(coinInType)
    setCoinInAmount('')
    setCoinOutAmount('')
    amountInInputRef.current?.setValue('')
    amountOutInputRef.current?.setValue('')
  }, [coinInType, coinOutType])

  const { mutateAsync: signAsync, isPending: loadingSign } =
    useSignAndExecuteTransaction()

  const signAndTradeAsync = useCallback(async () => {
    if (!router || !account || !optimalRoute) return

    try {
      const transaction = await router.getTransactionForCompleteTradeRoute({
        walletAddress: account.address,
        completeRoute: optimalRoute,
        slippage: optimalRoute.slippage || slippage,
      })

      const res = await signAsync({
        account,
        transaction: transaction,
        chain: account.chains[0],
      })

      toast.success('Execute swap success', {
        description: `Digest: ${formatDigest(res.digest)}`,
      })

      refetchCoinInBalance()
      refetchCoinOutBalance()
    } catch (e) {
      console.error(e)
      toast.error('Swap failed', { description: String(e) })
    }
  }, [
    router,
    account,
    slippage,
    signAsync,
    optimalRoute,
    refetchCoinInBalance,
    refetchCoinOutBalance,
  ])

  return (
    <div className="bg-secondary inset-1 m-auto my-[5%] flex max-w-md flex-col gap-6 rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between border-b-1 py-4">
        <ConnectButton className="!h-10" />
        <Faucet />
      </div>

      <div className="relative mb-6 flex flex-col gap-1">
        <div className="mb-2 flex items-center gap-1">
          <label>Slippage:</label>
          <DecimalInput
            max={100}
            min={0.01}
            decimals={2}
            className="max-w-16"
            value={slippagePercent}
            onChange={setSlippagePercent}
          />
          %
        </div>
        <CoinAmountInput
          label="You pay"
          ref={amountInInputRef}
          coinType={coinInType}
          metaData={coinInData}
          onChange={(am) => {
            setCoinInAmount(am)
            if (!am) amountOutInputRef.current?.setValue('')
          }}
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
          onChange={(am) => {
            setCoinOutAmount(am)
            if (!am) amountInInputRef.current?.setValue('')
          }}
        />
      </div>

      <SwapButton
        loading={loadingSign}
        onConfirmSwap={signAndTradeAsync}
        disabled={!optimalRoute || loadingRouteIn || loadingRouteOut}
      />
    </div>
  )
}

export default App
