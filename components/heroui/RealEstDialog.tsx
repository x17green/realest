"use client"

import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  type ModalProps,
} from "@heroui/react"

export type RealEstDialogProps = ModalProps

export function RealEstDialog(props: RealEstDialogProps) {
  return <Modal {...props} />
}

export {
  ModalBody as RealEstDialogBody,
  ModalFooter as RealEstDialogFooter,
  ModalHeader as RealEstDialogHeader,
}
