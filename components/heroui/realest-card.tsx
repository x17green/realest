'use client'

import React from 'react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { RealEstButton } from './realest-button'
import { StatusBadge, VerifiedBadge, PendingBadge } from '@/components/ui/status-badge'

// RealEST Card variant mapping
type RealEstCardVariant =
  | 'default'       // Standard property card
  | 'featured'      // Premium/featured properties
  | 'transparent'   // Minimal styling
  | 'elevated'      // Higher prominence
  | 'gradient'      // Brand gradient background
  | 'property'      // Property-specific styling
  | 'agent'         // Agent profile cards
  | 'listing'       // Property listing cards

interface RealEstCardProps extends ComponentProps<'div'> {
  variant?: RealEstCardVariant
  isInteractive?: boolean
  isHoverable?: boolean
  children?: React.ReactNode
  className?: string
}

const variantMap: Record<RealEstCardVariant, string> = {
  default: 'default',
  featured: 'tertiary',
  transparent: 'transparent',
  elevated: 'quaternary',
  gradient: 'default',
  property: 'default',
  agent: 'secondary',
  listing: 'default'
}

export function RealEstCard({
  variant = 'default',
  isInteractive = false,
  isHoverable = true,
  className,
  children,
  ...props
}: RealEstCardProps) {
  const mappedVariant = variantMap[variant] as any

  return (
    <div
      className={cn(
        // Base RealEST styling
        'font-body transition-all duration-300 ease-out',
        'border border-border rounded-xl overflow-hidden bg-card',

        // Interactive states
        isHoverable && [
          'hover:shadow-lg hover:border-brand-violet/30',
          'hover:-translate-y-1'
        ],

        isInteractive && [
          'cursor-pointer',
          'hover:shadow-xl hover:border-brand-violet/50',
          'active:translate-y-0 active:shadow-md'
        ],

        // RealEST-specific variants
        variant === 'featured' && [
          'border-brand-violet/30 bg-linear-to-br from-brand-violet/5 to-brand-neon/5',
          'shadow-md'
        ],

        variant === 'gradient' && [
          'bg-gradient-brand text-white border-transparent',
          'shadow-lg'
        ],

        variant === 'elevated' && [
          'shadow-lg border-brand-violet/20',
          'bg-linear-to-br from-card to-accent/10'
        ],

        variant === 'property' && [
          'hover:shadow-xl hover:border-brand-violet/40',
          'hover:bg-linear-to-br hover:from-card hover:to-brand-violet/5'
        ],

        variant === 'agent' && [
          'border-brand-neon/20 bg-linear-to-br from-card to-brand-neon/5'
        ],

        variant === 'transparent' && [
          'bg-transparent border-transparent shadow-none'
        ],

        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Property Card Components
interface PropertyCardProps {
  title: string
  location: string
  price: string
  priceUnit?: string
  bedrooms?: number
  bathrooms?: number
  area?: string
  imageUrl?: string
  isVerified?: boolean
  isPending?: boolean
  status?: 'available' | 'rented' | 'sold'
  badges?: string[]
  onView?: () => void
  onContact?: () => void
  onSave?: () => void
  className?: string
}

export function PropertyCard({
  title,
  location,
  price,
  priceUnit = 'per year',
  bedrooms,
  bathrooms,
  area,
  imageUrl,
  isVerified = false,
  isPending = false,
  status = 'available',
  badges = [],
  onView,
  onContact,
  onSave,
  className
}: PropertyCardProps) {
  return (
    <RealEstCard
      variant="property"
      isInteractive={!!onView}
      className={cn('max-w-sm w-full', className)}
      onClick={onView}
    >
      {/* Property Image */}
      <div className="relative h-48 bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-40">🏠</span>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isVerified && <VerifiedBadge size="sm">Verified</VerifiedBadge>}
          {isPending && <PendingBadge size="sm">Pending</PendingBadge>}
          {badges.map((badge, index) => (
            <StatusBadge key={index} variant="info" size="sm" showIcon={false}>
              {badge}
            </StatusBadge>
          ))}
        </div>

        {/* Save Button */}
        <div className="absolute top-4 right-4">
          <RealEstButton
            variant="ghost"
            size="sm"
            isIconOnly
            className="bg-white/90 hover:bg-white text-gray-700 hover:text-brand-violet"
            onClick={(e) => {
              e.stopPropagation()
              onSave?.()
            }}
          >
            ❤️
          </RealEstButton>
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-4 right-4">
          <StatusBadge
            variant={status === 'available' ? 'available' : status === 'rented' ? 'pending' : 'rejected'}
            size="sm"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </StatusBadge>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6 space-y-4">
        <div>
          <div className="p-0 space-y-1">
            <h3 className="text-lg font-heading font-semibold line-clamp-1">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              📍 {location}
            </p>
          </div>
        </div>

        {/* Property Features */}
        {(bedrooms || bathrooms || area) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {bedrooms && <span>🛏 {bedrooms} Beds</span>}
            {bathrooms && <span>🚿 {bathrooms} Baths</span>}
            {area && <span>📐 {area}</span>}
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-brand-violet">₦{price}</div>
            <div className="text-xs text-muted-foreground">{priceUnit}</div>
          </div>
          <div className="flex gap-2">
            {onContact && (
              <RealEstButton
                variant="violet"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onContact()
                }}
              >
                Contact
              </RealEstButton>
            )}
            {onView && (
              <RealEstButton
                variant="tertiary"
                size="sm"
                onClick={onView}
              >
                View Details
              </RealEstButton>
            )}
          </div>
        </div>
      </div>
    </RealEstCard>
  )
}

// Agent Card Component
interface AgentCardProps {
  name: string
  title?: string
  company?: string
  rating?: number
  totalProperties?: number
  avatarUrl?: string
  phone?: string
  email?: string
  isVerified?: boolean
  onContact?: () => void
  onViewProfile?: () => void
  className?: string
}

export function AgentCard({
  name,
  title = 'Property Agent',
  company,
  rating = 0,
  totalProperties = 0,
  avatarUrl,
  phone,
  email,
  isVerified = false,
  onContact,
  onViewProfile,
  className
}: AgentCardProps) {
  return (
    <RealEstCard
      variant="agent"
      isInteractive={!!onViewProfile}
      className={cn('max-w-sm w-full', className)}
      onClick={onViewProfile}
    >
      <div className="p-6 text-center space-y-4">
        {/* Avatar */}
        <div className="relative inline-block">
          <div className="w-20 h-20 mx-auto bg-linear-to-br from-brand-violet to-brand-neon rounded-full flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl text-white font-bold">
                {name.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          {isVerified && (
            <div className="absolute -bottom-1 -right-1">
              <VerifiedBadge size="sm">Verified</VerifiedBadge>
            </div>
          )}
        </div>

        {/* Agent Info */}
        <div>
          <h3 className="font-heading font-semibold text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
          {company && (
            <p className="text-xs text-brand-violet font-medium">{company}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <div className="font-semibold text-brand-violet">⭐ {rating.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-brand-violet">{totalProperties}</div>
            <div className="text-xs text-muted-foreground">Properties</div>
          </div>
        </div>

        {/* Contact Info */}
        {(phone || email) && (
          <div className="space-y-1 text-xs text-muted-foreground">
            {phone && <div>📞 {phone}</div>}
            {email && <div>📧 {email}</div>}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {onContact && (
            <RealEstButton
              variant="neon"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                onContact()
              }}
            >
              Contact Agent
            </RealEstButton>
          )}
          {onViewProfile && (
            <RealEstButton
              variant="tertiary"
              size="sm"
              className="flex-1"
              onClick={onViewProfile}
            >
              View Profile
            </RealEstButton>
          )}
        </div>
      </div>
    </RealEstCard>
  )
}

// Featured Property Card (Premium)
export function FeaturedPropertyCard({
  className,
  ...props
}: PropertyCardProps) {
  return (
    <RealEstCard
      variant="featured"
      isInteractive={!!props.onView}
      className={cn('max-w-sm w-full relative overflow-hidden', className)}
      onClick={props.onView}
    >
      {/* Featured Badge */}
      <div className="absolute top-0 right-0 z-10">
        <div className="bg-gradient-brand text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
          FEATURED
        </div>
      </div>

      {/* Property Image */}
      <div className="relative h-48 bg-linear-to-br from-brand-violet/20 to-brand-neon/20">
        {props.imageUrl ? (
          <img
            src={props.imageUrl}
            alt={props.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-40">🏠</span>
          </div>
        )}

        {/* Verification Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <VerifiedBadge size="sm">Verified</VerifiedBadge>
          {props.badges?.map((badge, index) => (
            <StatusBadge key={index} variant="featured" size="sm" showIcon={false}>
              {badge}
            </StatusBadge>
          ))}
        </div>

        {/* Save Button */}
        <div className="absolute top-4 right-16">
          <RealEstButton
            variant="ghost"
            size="sm"
            isIconOnly
            className="bg-white/90 hover:bg-white text-gray-700 hover:text-brand-violet"
            onClick={(e) => {
              e.stopPropagation()
              props.onSave?.()
            }}
          >
            ❤️
          </RealEstButton>
        </div>
      </div>

      {/* Property Details with Premium Styling */}
      <div className="p-6 space-y-4 bg-linear-to-br from-card to-brand-violet/5">
        <div>
          <div className="p-0 space-y-1">
            <h3 className="text-lg font-heading font-bold text-brand-violet line-clamp-1">
              {props.title}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              📍 {props.location}
            </p>
          </div>
        </div>

        {/* Property Features */}
        {(props.bedrooms || props.bathrooms || props.area) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {props.bedrooms && <span>🛏 {props.bedrooms} Beds</span>}
            {props.bathrooms && <span>🚿 {props.bathrooms} Baths</span>}
            {props.area && <span>📐 {props.area}</span>}
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold bg-gradient-brand bg-clip-text text-transparent">
              ₦{props.price}
            </div>
            <div className="text-xs text-muted-foreground font-medium">{props.priceUnit}</div>
          </div>
          <div className="flex gap-2">
            {props.onContact && (
              <RealEstButton
                variant="neon"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  props.onContact?.()
                }}
              >
                Contact
              </RealEstButton>
            )}
          </div>
        </div>
      </div>
    </RealEstCard>
  )
}

// Nigerian Market Specific Property Card
export function NigerianPropertyCard({
  className,
  hasNEPA = false,
  hasWater = false,
  isGated = false,
  hasBQ = false,
  ...props
}: PropertyCardProps & {
  hasNEPA?: boolean
  hasWater?: boolean
  isGated?: boolean
  hasBQ?: boolean
}) {
  const nigerianBadges = []
  if (hasNEPA) nigerianBadges.push('Power')
  if (hasWater) nigerianBadges.push('Water')
  if (isGated) nigerianBadges.push('Gated')
  if (hasBQ) nigerianBadges.push('BQ')

  return (
    <PropertyCard
      {...props}
      badges={[...nigerianBadges, ...(props.badges || [])]}
      className={cn('border-brand-neon/20', className)}
    />
  )
}
