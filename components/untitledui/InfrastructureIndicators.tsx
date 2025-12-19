"use client"

import React from "react"
import clsx from "clsx"

export type InfrastructureType = "power" | "water" | "security" | "internet" | "bq"

export type InfrastructureStatus =
  | "stable"
  | "intermittent"
  | "poor"
  | "none"
  | "generator_only"
  | "borehole"
  | "public_water"
  | "well"
  | "water_vendor"
  | "fiber"
  | "starlink"
  | "4g"
  | "3g"
  | "gated"
  | "security_post"
  | "cctv"
  | "perimeter"
  | "available"
  | "not_available"
  | "separate_entrance"
  | "shared"

interface IndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  type: InfrastructureType
  status: InfrastructureStatus
  label?: string
}

const typeIcons: Record<InfrastructureType, string> = {
  power: "⚡",
  water: "💧",
  security: "🛡️",
  internet: "📡",
  bq: "🏠",
}

function colorFor(type: InfrastructureType, status: InfrastructureStatus) {
  switch (type) {
    case "power":
      if (status === "stable") return "text-success"
      if (status === "intermittent" || status === "generator_only") return "text-warning"
      return "text-destructive"
    case "water":
      return status === "none" ? "text-destructive" : "text-success"
    case "security":
      return status === "none" ? "text-destructive" : "text-success"
    case "internet":
      return status === "none" ? "text-destructive" : "text-success"
    case "bq":
      return status === "not_available" ? "text-muted-foreground" : "text-success"
    default:
      return "text-foreground"
  }
}

export function InfrastructureIndicator({ type, status, label, className, ...rest }: IndicatorProps) {
  const icon = typeIcons[type]
  const color = colorFor(type, status)
  const resolvedLabel = label ?? `${typeLabel(type)}: ${statusLabel(status)}`

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium",
        className
      )}
      {...rest}
    >
      <span aria-hidden className={clsx(color)}>
        {icon}
      </span>
      <span className={clsx("text-foreground", color)}>{resolvedLabel}</span>
    </div>
  )
}

function typeLabel(type: InfrastructureType) {
  switch (type) {
    case "power":
      return "Power"
    case "water":
      return "Water"
    case "security":
      return "Security"
    case "internet":
      return "Internet"
    case "bq":
      return "BQ"
  }
}

function statusLabel(status: InfrastructureStatus) {
  switch (status) {
    case "stable":
      return "Stable"
    case "intermittent":
      return "Intermittent"
    case "generator_only":
      return "Generator"
    case "poor":
      return "Poor"
    case "none":
      return "None"
    case "borehole":
      return "Borehole"
    case "public_water":
      return "Public"
    case "well":
      return "Well"
    case "water_vendor":
      return "Vendor"
    case "fiber":
      return "Fiber"
    case "starlink":
      return "Starlink"
    case "4g":
      return "4G"
    case "3g":
      return "3G"
    case "gated":
      return "Gated"
    case "security_post":
      return "Security Post"
    case "cctv":
      return "CCTV"
    case "perimeter":
      return "Perimeter"
    case "available":
      return "Available"
    case "not_available":
      return "Not Available"
    case "separate_entrance":
      return "Separate Entrance"
    case "shared":
      return "Shared"
    default:
      return String(status)
  }
}

export function InfrastructureIndicatorGroup({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("flex flex-wrap gap-2", className)} {...rest}>
      {children}
    </div>
  )
}
