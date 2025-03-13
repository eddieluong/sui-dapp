import { ChangeEvent, useCallback } from 'react'
import { Input } from './ui'

export interface Props
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'onChange' | 'onBlur' | 'value'
  > {
  value: string | number
  onChange?: (val: string) => void
  onBlur?: (val: number) => void
}

const DecimalInput = ({
  onBlur,
  onChange,
  placeholder = '0.0',
  ...props
}: Props) => {
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

  const onInputBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const num = Number(parseValue(e.target.value))

      if (isNaN(num)) {
        onBlur?.(0)
      } else {
        onBlur?.(num)
      }
    },
    [onBlur, parseValue]
  )

  return (
    <Input
      {...props}
      type="text"
      pattern="[0-9]*"
      formNoValidate
      inputMode="decimal"
      onBlur={onInputBlur}
      onChange={onInputChange}
      placeholder={placeholder}
    />
  )
}

DecimalInput.displayName = 'DecimalInput'

export { DecimalInput }
