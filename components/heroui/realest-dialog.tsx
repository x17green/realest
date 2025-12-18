"use client"

import {
  Modal,
  ModalBody,
  ModalContent,
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
  ModalContent as RealEstDialogContent,
  ModalFooter as RealEstDialogFooter,
  ModalHeader as RealEstDialogHeader,
}
