"use client"

import { Card } from "@heroui/react"
import clsx from "clsx"
import React from "react"

type TableProps = React.HTMLAttributes<HTMLTableElement>
type SectionProps = React.HTMLAttributes<HTMLTableSectionElement>
type RowProps = React.HTMLAttributes<HTMLTableRowElement>
type CellProps = React.TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }
type HeaderCellProps = React.ThHTMLAttributes<HTMLTableHeaderCellElement> & { numeric?: boolean }

type RealEstTableProps = TableProps & {
  elevated?: boolean
  stickyHeader?: boolean
}

export function RealEstTable({ className, elevated, stickyHeader, ...props }: RealEstTableProps) {
  return (
    <Card className={clsx(elevated && "shadow-md", "overflow-auto")}> 
      <table className={clsx("w-full border-collapse text-sm", className)} {...props} />
    </Card>
  )
}

export function RealEstTableHead(props: SectionProps) {
  return <thead className="bg-muted/60 text-foreground" {...props} />
}

export function RealEstTableBody(props: SectionProps) {
  return <tbody {...props} />
}

export function RealEstTableRow({ className, ...props }: RowProps) {
  return <tr className={clsx("border-b border-border last:border-0", className)} {...props} />
}

export function RealEstTableHeaderCell({ numeric, className, ...props }: HeaderCellProps) {
  return (
    <th
      className={clsx(
        "px-4 py-3 text-left text-xs font-semibold text-muted-foreground",
        numeric && "text-right",
        className
      )}
      {...props}
    />
  )
}

export function RealEstTableCell({ numeric, className, ...props }: CellProps) {
  return (
    <td
      className={clsx("px-4 py-3 text-foreground", numeric && "text-right", className)}
      {...props}
    />
  )
}
