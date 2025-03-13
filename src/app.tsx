import { Faucet } from '@/components'
import '@/global.css'
import { useAfterMath, useGetBalance } from '@/hooks'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import '@mysten/dapp-kit/dist/index.css'

const MyComp = () => {
  const data = useAfterMath()
  console.log(data)

  return <div>AfterMath</div>
}

export function App() {
  const account = useCurrentAccount()
  const address = account?.address || ''

  const { data } = useGetBalance()

  const afterMath = useAfterMath()
  console.log(afterMath)

  console.log(data)

  return (
    <div className="bg-secondary m-auto my-[5%] flex max-w-md flex-col gap-6 divide-y-2 rounded-xl border p-6 shadow-sm">
      <div className="py-4">
        <ConnectButton />
        <Faucet />
      </div>

      <div>Address: {address}</div>
      <MyComp />
    </div>
  )
}

export default App
