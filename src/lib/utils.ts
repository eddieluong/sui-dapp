import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function formatUsd(amount: number | string) {
  return usdFormatter.format(Number(amount))
}

export function formatDecimal(amount: number | string, decimals: number = 8) {
  return Number(amount).toFixed(decimals)
}
