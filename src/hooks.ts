import { DEFAULT_NET_WORK } from '@/components/wallet-provider'
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit'
import { Aftermath } from 'aftermath-ts-sdk'
import { useEffect, useRef } from 'react'

let isInitialized = false
export function useAfterMath() {
  const instance = useRef(new Aftermath(DEFAULT_NET_WORK))

  useEffect(() => {
    if (!isInitialized) {
      instance.current.init()
      isInitialized = true
    }
  }, [])

  return instance.current
}

export function useCoinData(coinType: string = '0x2::sui::SUI') {
  return useSuiClientQuery(
    'getCoinMetadata',
    {
      coinType,
    },
    {
      queryKey: ['coinMetaData', coinType],
      refetchOnWindowFocus: false,
    }
  )
}

export function useGetBalance(coinType: string = '0x2::sui::SUI') {
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
