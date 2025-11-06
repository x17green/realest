'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { StatusBadge, VerifiedBadge, PendingBadge, FeaturedBadge, NewBadge } from '@/components/ui/status-badge'

export default function DesignTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-display font-display text-brand-violet">
            RealEST Design System Test
          </h1>
          <p className="text-body-lg text-muted-foreground">
            Testing the implementation of RealEST design tokens and components
          </p>
        </div>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className="text-h2 font-heading">Brand Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-h3 font-heading">Primary Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-dark border border-border"></div>
                  <div>
                    <p className="font-medium">Brand Dark</p>
                    <p className="text-sm text-muted-foreground">#242834</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-violet border border-border"></div>
                  <div>
                    <p className="font-medium">Brand Violet</p>
                    <p className="text-sm text-muted-foreground">#7D53FF</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-neon border border-border"></div>
                  <div>
                    <p className="font-medium">Brand Neon</p>
                    <p className="text-sm text-muted-foreground">#B6FF00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-h3 font-heading">UI Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary border border-border"></div>
                  <div>
                    <p className="font-medium">Primary</p>
                    <p className="text-sm text-muted-foreground">--primary</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary border border-border"></div>
                  <div>
                    <p className="font-medium">Secondary</p>
                    <p className="text-sm text-muted-foreground">--secondary</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent border border-border"></div>
                  <div>
                    <p className="font-medium">Accent</p>
                    <p className="text-sm text-muted-foreground">--accent</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-h3 font-heading">Status Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-success border border-border"></div>
                  <div>
                    <p className="font-medium">Success</p>
                    <p className="text-sm text-muted-foreground">--color-success</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-warning border border-border"></div>
                  <div>
                    <p className="font-medium">Warning</p>
                    <p className="text-sm text-muted-foreground">--color-warning</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-error border border-border"></div>
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm text-muted-foreground">--color-error</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-h2 font-heading">Typography</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-h3 font-heading mb-4">Font Families</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Display (Lufga)</p>
                  <p className="font-display text-3xl">Find Your Next Move</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Heading (Neulis Neue)</p>
                  <p className="font-heading text-2xl">Welcome to RealEST</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Body (Space Grotesk)</p>
                  <p className="font-body text-base">Nigeria's premier geo-verified property marketplace</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Mono (JetBrains Mono)</p>
                  <p className="font-mono text-sm">6.4321°N, 3.4219°E</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-h3 font-heading mb-4">Text Hierarchy</h3>
              <div className="space-y-3">
                <h1 className="text-h1">Heading 1 - Property Listings</h1>
                <h2 className="text-h2">Heading 2 - Featured Properties</h2>
                <h3 className="text-h3">Heading 3 - Property Details</h3>
                <h4 className="text-h4">Heading 4 - Amenities</h4>
                <p className="text-body-lg">Large body text for introductions and important content</p>
                <p className="text-body-base">Regular body text for general content and descriptions</p>
                <p className="text-body-sm">Small body text for captions and secondary information</p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-6">
          <h2 className="text-h2 font-heading">Buttons</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-h3 font-heading mb-4">Button Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="violet">Violet</Button>
                <Button variant="neon">Neon</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            <div>
              <h3 className="text-h3 font-heading mb-4">Button Sizes</h3>
              <div className="flex flex-wrap items-end gap-4">
                <Button size="sm" variant="violet">Small</Button>
                <Button size="default" variant="violet">Default</Button>
                <Button size="lg" variant="violet">Large</Button>
                <Button size="xl" variant="violet">Extra Large</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Status Badges */}
        <section className="space-y-6">
          <h2 className="text-h2 font-heading">Status Badges</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-h3 font-heading mb-4">Property Status</h3>
              <div className="flex flex-wrap gap-3">
                <VerifiedBadge />
                <PendingBadge />
                <StatusBadge variant="rejected">Rejected</StatusBadge>
                <StatusBadge variant="available">Available</StatusBadge>
                <StatusBadge variant="rented">Rented</StatusBadge>
                <StatusBadge variant="sold">Sold</StatusBadge>
              </div>
            </div>

            <div>
              <h3 className="text-h3 font-heading mb-4">Special Badges</h3>
              <div className="flex flex-wrap gap-3">
                <NewBadge />
                <FeaturedBadge />
                <StatusBadge variant="info">Info</StatusBadge>
              </div>
            </div>

            <div>
              <h3 className="text-h3 font-heading mb-4">Nigerian-Specific Badges</h3>
              <div className="flex flex-wrap gap-3">
                <StatusBadge variant="available" showIcon={false}>BQ Available</StatusBadge>
                <StatusBadge variant="info" showIcon={false}>Gated Community</StatusBadge>
                <StatusBadge variant="featured" showIcon={false}>Power Included</StatusBadge>
                <StatusBadge variant="success" showIcon={false}>Water Supply</StatusBadge>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-6">
          <h2 className="text-h2 font-heading">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card-enhanced p-6 space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-h3 font-heading">Property Card</h3>
                <VerifiedBadge size="sm" />
              </div>
              <p className="text-muted-foreground">
                A beautiful 3-bedroom apartment in Lekki Phase 1 with modern amenities
              </p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-semibold text-brand-violet">₦2,500,000</p>
                <Button size="sm" variant="violet">View Details</Button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <h3 className="text-h3 font-heading">Standard Card</h3>
                <FeaturedBadge size="sm" />
              </div>
              <p className="text-muted-foreground">
                Standard card styling without enhanced hover effects
              </p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-semibold text-brand-neon">₦1,800,000</p>
                <Button size="sm" variant="neon">Contact Owner</Button>
              </div>
            </div>

            <div className="bg-gradient-brand p-6 rounded-xl text-white space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-h3 font-heading">Gradient Card</h3>
                <NewBadge size="sm" />
              </div>
              <p className="text-white/90">
                Card with brand gradient background for special promotions
              </p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-semibold">₦3,200,000</p>
                <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Gradients */}
        <section className="space-y-6">
          <h2 className="text-h2 font-heading">Gradients</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-brand p-8 rounded-xl text-white text-center">
              <h3 className="text-h3 font-heading mb-2">Brand Gradient</h3>
              <p>Violet to Neon gradient for hero sections</p>
            </div>
            <div className="bg-gradient-hero p-8 rounded-xl text-white text-center">
              <h3 className="text-h3 font-heading mb-2">Hero Gradient</h3>
              <p>Complex gradient for landing page heroes</p>
            </div>
          </div>
        </section>

        {/* Interactive Elements */}
        <section className="space-y-6">
          <h2 className="text-h2 font-heading">Interactive Elements</h2>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg hover:border-brand-violet transition-colors">
              <p className="font-medium mb-2">Hover Border Change</p>
              <p className="text-sm text-muted-foreground">Hover over this element to see the border color change</p>
            </div>

            <button className="w-full p-4 text-left border border-border rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <p className="font-medium mb-2">Hover Lift Effect</p>
              <p className="text-sm text-muted-foreground">This element lifts slightly on hover with shadow</p>
            </button>

            <div className="p-4 border border-border rounded-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <label htmlFor="test-input" className="block font-medium mb-2">Focus Ring Test</label>
              <input
                id="test-input"
                type="text"
                placeholder="Click here to see focus ring"
                className="w-full p-2 border border-input rounded-md bg-background"
              />
            </div>
          </div>
        </section>

        {/* Dark Mode Toggle */}
        <section className="space-y-6">
          <h2 className="text-h2 font-heading">Theme Toggle</h2>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => document.documentElement.classList.remove('dark')}
            >
              Light Mode
            </Button>
            <Button
              variant="outline"
              onClick={() => document.documentElement.classList.add('dark')}
            >
              Dark Mode
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
