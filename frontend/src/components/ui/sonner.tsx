"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[oklch(0.145_0_0)] group-[.toaster]:border-[oklch(0.922_0_0)] group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:px-4 group-[.toaster]:py-3",
          description: "group-[.toast]:text-[oklch(0.556_0_0)] group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-[oklch(0.205_0_0)] group-[.toast]:text-[oklch(0.985_0_0)]",
          cancelButton:
            "group-[.toast]:bg-[oklch(0.97_0_0)] group-[.toast]:text-[oklch(0.556_0_0)]",
          success:
            "group-[.toaster]:border-green-200 group-[.toaster]:text-green-800",
          error:
            "group-[.toaster]:border-red-200 group-[.toaster]:text-red-800",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
