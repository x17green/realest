"use client"

import { Input, TextArea, type InputProps, type TextAreaProps } from "@heroui/react"

export type RealEstInputProps = InputProps
export function RealEstInput(props: RealEstInputProps) {
  return <Input {...props} />
}

export type RealEstTextAreaProps = TextAreaProps
export function RealEstTextArea(props: RealEstTextAreaProps) {
  return <TextArea {...props} />
}
