import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit'

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
