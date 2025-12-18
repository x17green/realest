"use client"

import { Select, SelectItem, type SelectProps } from "@heroui/react"

export type RealEstSelectProps<T extends string = string> = SelectProps<T>

export function RealEstSelect<T extends string = string>(props: RealEstSelectProps<T>) {
  return <Select variant="bordered" radius="md" {...props} />
}

export { SelectItem as RealEstSelectItem }
