"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  value: number[]
  onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <input
          type="range"
          ref={ref}
          value={value[0]}
          onChange={(e) => onValueChange?.([parseInt(e.target.value)])}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#6c47ff] transition-all hover:accent-[#5b3ce0]"
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
