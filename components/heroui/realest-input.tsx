"use client"

import { Input, TextArea, type InputProps, type TextAreaProps } from "@heroui/react"

export type RealEstInputProps = InputProps
export function RealEstInput(props: RealEstInputProps) {
  return <Input variant="bordered" radius="md" {...props} />
}

export type RealEstTextAreaProps = TextAreaProps
export function RealEstTextArea(props: RealEstTextAreaProps) {
  return <TextArea variant="bordered" radius="md" {...props} />
}
