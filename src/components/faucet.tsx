import { Button } from '@/components/ui'
import { DEFAULT_NET_WORK } from '@/components/wallet-provider'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui/faucet'
import { useCallback } from 'react'
import { toast } from 'sonner'

export const Faucet = () => {
  const account = useCurrentAccount()
  const address = account?.address

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
    } catch (e) {
      toast.error(String(e))
    }
  }, [address])

  if (!address) return null

  return (
    <Button variant="outline" size="sm" onClick={faucet}>
      Faucet
    </Button>
  )
}
