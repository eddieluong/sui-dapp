import { ChangeEvent, forwardRef, useCallback } from 'react'
import { Input } from './ui'

export interface DecimalInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'onChange' | 'onBlur' | 'value'
  > {
  decimals: number
  value: string | number
  onChange?: (val: string) => void
}

const DecimalInput = forwardRef<HTMLInputElement, DecimalInputProps>(
  ({ onChange, placeholder = '0.0', ...props }, ref) => {
    const parseValue = useCallback((targetValue: string) => {
      let val = targetValue
      // Replace all commas with dots
      val = val.replace(/,/g, '.')

      // Prevent typing comma or dot before any number
      if (val.startsWith('.') || val.startsWith(',')) {
        val = val.substring(1)
      }

      // Prevent adding more than one comma or dot
      const parts = val.split('.')
      if (parts.length > 2) {
        val = parts[0] + '.' + parts.slice(1).join('')
      }

      // Allow only integer or decimal number values
      const regex = /^[0-9]*[.,]?[0-9]*$/
      if (!regex.test(val)) {
        val = val.replace(/[^0-9.,]/g, '')
      }

      return val
    }, [])

    const onInputChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(parseValue(e.target.value))
      },
      [onChange, parseValue]
    )

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        pattern="[0-9]*"
        formNoValidate
        inputMode="decimal"
        onChange={onInputChange}
        placeholder={placeholder}
      />
    )
  }
)

DecimalInput.displayName = 'DecimalInput'

export { DecimalInput }
