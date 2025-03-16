import { Button } from '@/components/ui'
import { DEFAULT_NET_WORK } from '@/components/wallet-provider'
import { useGetBalance } from '@/hooks'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui/faucet'
import { Coin } from 'aftermath-ts-sdk/dist/packages/coin'
import { useCallback } from 'react'
import { toast } from 'sonner'

export const Faucet = () => {
  const account = useCurrentAccount()
  const address = account?.address
  const { refetch: refetchSuiBalance } = useGetBalance()

  const faucet = useCallback(async () => {
    if (!address) return

    try {
      const res = await requestSuiFromFaucetV0({
        recipient: address,
        host: getFaucetHost(DEFAULT_NET_WORK),
      })

      if (res.error) {
        throw new Error(res.error)
      }

      return res.transferredGasObjects
    } catch (e) {
      toast.error('Failed to faucet', { description: String(e) })
      throw new Error('Failed to faucet')
    }
  }, [address])

  if (!address) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        toast.promise(faucet, {
          loading: 'Faucet processing...',
          success: (data) => {
            if (!data?.length) return ''

            refetchSuiBalance()
            const item = data[0]

            return `Balance changed: +${Coin.balanceWithDecimals(item.amount, 9)} SUI`
          },
        })
      }}
    >
      Faucet SUI
    </Button>
  )
}
