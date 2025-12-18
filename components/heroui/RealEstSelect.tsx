"use client"

import { Select, type SelectProps } from "@heroui/react"

export type RealEstSelectProps<T extends object = object> = SelectProps<T>

export function RealEstSelect<T extends object = object>(props: RealEstSelectProps<T>) {
  return <Select {...props} />
}
