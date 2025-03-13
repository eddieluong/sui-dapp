import { Button } from '@/components/ui'
import { DEFAULT_NET_WORK } from '@/components/wallet-provider'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui/faucet'
import { toast } from 'sonner'

export const Faucet = () => {
  const account = useCurrentAccount()
  const address = account?.address

  if (!address) return null

  const faucet = async () => {
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
  }

  return (
    <Button variant="outline" size="sm" onClick={faucet}>
      Faucet
    </Button>
  )
}
