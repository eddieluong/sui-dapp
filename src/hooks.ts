import { DEFAULT_NET_WORK, SUI_COIN_TYPE } from '@/components/wallet-provider'
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { useQuery } from '@tanstack/react-query'
import { Aftermath } from 'aftermath-ts-sdk'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

let aftermathInstance: Aftermath | null = null
export function useAfterMath() {
  const [aftermath, setAftermath] = useState<Aftermath | null>(null)

  useEffect(() => {
    if (!aftermathInstance) {
      try {
        aftermathInstance = new Aftermath('MAINNET')
        aftermathInstance
          .init({ fullnodeUrl: getFullnodeUrl(DEFAULT_NET_WORK) })
          .then(() => {
            setAftermath(aftermathInstance)
          })
      } catch (e) {
        toast.error(String(e))
      }
    } else {
      setAftermath(aftermathInstance)
    }
  }, [])

  return aftermath
}

export function useCoinData(coinType: string = SUI_COIN_TYPE) {
  const afterMath = useAfterMath()
  const coin = afterMath?.Coin(coinType)

  return useQuery({
    queryFn: async () => {
      return await coin?.getCoinMetadata(coinType)
    },
    enabled: !!coin,
    queryKey: ['coinMetaData', coinType],
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })
}

export function useGetBalance(coinType: string = SUI_COIN_TYPE) {
  const account = useCurrentAccount()
  const address = account?.address ?? ''

  return useSuiClientQuery(
    'getBalance',
    {
      owner: address,
      coinType,
    },
    {
      networkMode: 'online',
      enabled: !!address,
      queryKey: ['getBalance', address, coinType],
    }
  )
}
