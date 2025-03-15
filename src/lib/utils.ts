import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

// 2 => $2.00
export function formatUsd(amount: number | string) {
  return usdFormatter.format(Number(amount))
}

// 2 => 2.[decimals -> 0]
export function formatDecimal(amount: number | string, decimals: number = 8) {
  return Number(amount).toFixed(decimals)
}

// convert to MIST, smallest unit of SUI: 2SUI => 2.000.000.000MIST
export function toMist(amount: number | string, decimals: number) {
  return BigInt(Number(amount) * 10 ** decimals)
}
