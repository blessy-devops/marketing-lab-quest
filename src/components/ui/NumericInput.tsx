import * as React from "react"
import { ControllerRenderProps } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface NumericInputProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> {
  field: ControllerRenderProps<any, any>
  decimals?: number
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ field, decimals = 2, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>("")

    // Format number for display (123456.78 -> "123.456,78")
    const formatNumberForDisplay = (value: number | string | undefined): string => {
      if (value === undefined || value === null || value === "") return ""
      
      const numValue = typeof value === "string" ? parseFloat(value) : value
      if (isNaN(numValue)) return ""
      
      return numValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      })
    }

    // Parse display value to number ("123.456,78" -> 123456.78)
    const parseDisplayValue = (displayStr: string): number | undefined => {
      if (!displayStr || displayStr.trim() === "") return undefined
      
      // Remove thousand separators and replace comma with dot
      const normalizedStr = displayStr.replace(/\./g, "").replace(",", ".")
      const parsed = parseFloat(normalizedStr)
      
      return isNaN(parsed) ? undefined : parsed
    }

    // Update display value when field value changes
    React.useEffect(() => {
      setDisplayValue(formatNumberForDisplay(field.value))
    }, [field.value, decimals])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value
      
      // Allow only numbers, dots, and commas
      inputValue = inputValue.replace(/[^0-9.,]/g, "")
      
      // Handle decimal separator
      const commaIndex = inputValue.indexOf(",")
      if (commaIndex !== -1) {
        // Keep only the first comma and limit decimals
        const integerPart = inputValue.substring(0, commaIndex)
        const decimalPart = inputValue.substring(commaIndex + 1, commaIndex + 1 + decimals)
        inputValue = integerPart + "," + decimalPart.replace(/[^0-9]/g, "")
      }
      
      // Apply thousand separators to integer part
      const parts = inputValue.split(",")
      const integerPart = parts[0].replace(/\./g, "") // Remove existing dots
      
      if (integerPart.length > 0) {
        // Add thousand separators
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        inputValue = formattedInteger + (parts[1] !== undefined ? "," + parts[1] : "")
      }
      
      setDisplayValue(inputValue)
      
      // Convert to number and update form
      const numberValue = parseDisplayValue(inputValue)
      field.onChange(numberValue)
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={field.onBlur}
        className={cn(className)}
        inputMode="decimal"
      />
    )
  }
)

NumericInput.displayName = "NumericInput"

export { NumericInput }
