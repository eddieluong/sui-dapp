import { Faucet } from '@/components'
import '@/global.css'
import { useGetBalance } from '@/hooks'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import '@mysten/dapp-kit/dist/index.css'

export function App() {
  const account = useCurrentAccount()
  const address = account?.address || ''

  const { data } = useGetBalance()

  console.log(data)

  return (
    <div className="bg-secondary m-auto my-[5%] flex max-w-md flex-col gap-6 divide-y-2 rounded-xl border p-6 shadow-sm">
      <div className="py-4">
        <ConnectButton />
        <Faucet />
      </div>

      <div>Address: {address}</div>
    </div>
  )
}

export default App
