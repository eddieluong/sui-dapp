import FdusdIcon from '@/assets/fdusd.svg?react'
import SuiIcon from '@/assets/sui.svg?react'
import { Button, DecimalInput } from '@/components'
import { useAfterMath, useGetBalance } from '@/hooks'
import { formatDecimal, formatUsd } from '@/lib/utils'
import { SUI_DECIMALS } from '@mysten/sui/utils'
import { useQuery } from '@tanstack/react-query'
import { Coin, CoinMetadaWithInfo } from 'aftermath-ts-sdk/'
import { Wallet } from 'lucide-react'
import {
  ComponentProps,
  Dispatch,
  forwardRef,
  FunctionComponent,
  SVGProps,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react'

const COIN_ICONS: Record<string, FunctionComponent<SVGProps<SVGSVGElement>>> = {
  sui: SuiIcon,
  fdusd: FdusdIcon,
}

const CoinIcon = ({
  symbol,
  iconUrl,
}: {
  symbol?: string
  iconUrl?: string | null
}) => {
  const lowerSymbol = symbol?.toLowerCase() || ''

  if (!symbol || !(lowerSymbol in COIN_ICONS)) return null

  if (iconUrl) {
    return <img src={iconUrl} alt={lowerSymbol} className="size-5" />
  }

  const Icon = COIN_ICONS[lowerSymbol]
  return <Icon className="size-5" />
}

const QuickSelectButton = ({
  title,
  onClick,
}: ComponentProps<typeof Button> & {
  title: string
}) => {
  return (
    <Button
      size="icon"
      onClick={onClick}
      variant="ghost"
      className="hover:bg-primary/20 hover:text-primary text-primary size-fit px-1 py-0"
    >
      {title}
    </Button>
  )
}

interface Props {
  label: string
  coinType: string
  hasQuickSelect?: boolean
  metaData?: CoinMetadaWithInfo
  onChange: (val: string) => void
}

export interface CoinAmountInputRef {
  setValue: Dispatch<React.SetStateAction<string>>
}

export const CoinAmountInput = forwardRef<CoinAmountInputRef, Props>(
  (
    { label, coinType, onChange, metaData, hasQuickSelect = true, ...props },
    ref
  ) => {
    const afterMath = useAfterMath()
    const coin = afterMath?.Coin(coinType)

    const [value, setValue] = useState('')

    const { data: balance } = useGetBalance(coinType)
    const { data: priceInfo } = useQuery({
      async queryFn() {
        return await coin?.getPrice(coinType)
      },
      enabled: !!coin,
      refetchInterval: 30000, // 30s
      queryKey: ['coinPrize', coinType],
    })

    const decimals = metaData?.decimals ?? SUI_DECIMALS
    const price = priceInfo?.price ?? 1
    const totalBalance = Coin.balanceWithDecimals(
      BigInt(balance?.totalBalance ?? 0),
      decimals
    )

    const setAmount = useCallback(
      (value: string) => {
        setValue(value)
        onChange(value)
      },
      [onChange]
    )

    const setPercentageBalance = useCallback(
      (percent: number) => {
        const target = (totalBalance * percent) / 100
        setAmount?.(formatDecimal(target))
      },
      [totalBalance, setAmount]
    )

    // expose setValue
    useImperativeHandle(ref, () => ({
      setValue,
    }))

    const valueUSD = value ? formatUsd(Number(value) * price) : ''

    return (
      <div className="space-y-1 rounded-lg border p-4 shadow-sm">
        <div className="flex justify-between">
          <div className="text-muted-foreground flex justify-between text-sm font-medium">
            {label}
          </div>
          {hasQuickSelect && (
            <div className="flex gap-1">
              <QuickSelectButton
                title="Half"
                onClick={() => setPercentageBalance(50)}
              />
              <QuickSelectButton
                title="Max"
                onClick={() => setPercentageBalance(100)}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <DecimalInput
            {...props}
            value={value}
            decimals={decimals}
            onChange={setAmount}
            className="border-none px-0 !text-2xl font-medium shadow-none focus-visible:ring-0"
          />
          <div className="bg-ring/30 flex w-20 min-w-fit items-center gap-2 rounded-2xl px-3 font-medium uppercase">
            <CoinIcon symbol={metaData?.symbol} iconUrl={metaData?.iconUrl} />{' '}
            <span>{metaData?.symbol}</span>
          </div>
        </div>

        <div className="text-muted-foreground flex justify-between text-sm">
          <div>{valueUSD}</div>
          <div className="flex items-center gap-1">
            <Wallet className="size-4" />
            {formatDecimal(totalBalance, decimals)}
          </div>
        </div>
      </div>
    )
  }
)
