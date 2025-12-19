'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { RealEstButton } from '@/components/heroui/RealEstButton'
import { StatusBadge } from '@/components/ui/status-badge'
import { LoadingSpinner, ProgressRing } from '@/components/untitledui/StatusComponents'

// ================================================================
// PROPERTY LISTING FORM COMPONENT
// ================================================================

interface PropertyListingFormProps {
  onSubmit?: (data: any) => void
  onSaveDraft?: (data: any) => void
  initialData?: any
  className?: string
}

export function PropertyListingForm({
  onSubmit,
  onSaveDraft,
  initialData,
  className
}: PropertyListingFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Details
    title: '',
    description: '',
    propertyType: '',
    purpose: 'rent', // rent, sale

    // Location
    state: '',
    lga: '',
    area: '',
    address: '',
    coordinates: { lat: '', lng: '' },

    // Property Details
    bedrooms: '',
    bathrooms: '',
    toilets: '',
    size: '',
    yearBuilt: '',

    // Pricing
    price: '',
    serviceCharge: '',
    cautionFee: '',
    legalFee: '',
    agentFee: '',

    // Features & Amenities
    infrastructure: [],
    amenities: [],
    security: [],

    // Images & Documents
    images: [],
    documents: [],

    // Nigerian Specific
    hasBQ: false,
    hasNEPA: false,
    hasWater: false,
    isGated: false,
    hasGoodRoads: false,
    ...initialData
  })

  const [isLoading, setIsLoading] = useState(false)
  const totalSteps = 6

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ]

  const propertyTypes = [
    'Apartment', 'Duplex', 'Bungalow', 'Boys Quarters (BQ)',
    'Self-contained', 'Mini Flat', 'Face-me-I-face-you', 'Mansion',
    'Terrace', 'Semi-detached', 'Detached', 'Penthouse'
  ]

  const infrastructureOptions = [
    'NEPA/Power Supply', 'Borehole/Water Supply', 'Internet Connectivity',
    'Good Road Network', 'Drainage System', 'Street Lighting'
  ]

  const amenityOptions = [
    'Swimming Pool', 'Gym', 'Playground', 'Garden', 'Parking Space',
    'Generator', 'Air Conditioning', 'Furnished', 'Balcony', 'Elevator'
  ]

  const securityOptions = [
    'Gated Community', 'Security Post', 'CCTV Surveillance',
    'Perimeter Fencing', 'Security Guards', 'Access Control'
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayToggle = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: (prev as any)[field].includes(value)
        ? (prev as any)[field].filter((item: string) => item !== value)
        : [...(prev as any)[field], value]
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (isDraft = false) => {
    setIsLoading(true)
    try {
      if (isDraft) {
        await onSaveDraft?.(formData)
      } else {
        await onSubmit?.(formData)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">Basic Property Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Property Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g. Modern 3BR Apartment in Lekki Phase 1"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Make it descriptive and appealing</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Property Type *</label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background"
                  required
                >
                  <option value="">Select property type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Purpose *</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background"
                  required
                >
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Property Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the property, neighborhood, and special features..."
                  rows={4}
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring resize-none"
                  required
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">Location Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">State *</label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background"
                  required
                >
                  <option value="">Select state</option>
                  {nigerianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">LGA *</label>
                <input
                  type="text"
                  value={formData.lga}
                  onChange={(e) => handleInputChange('lga', e.target.value)}
                  placeholder="Local Government Area"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Area/District *</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="e.g. Lekki Phase 1, Victoria Island"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street name and number"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">GPS Coordinates (Optional)</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.coordinates.lat}
                    onChange={(e) => handleInputChange('coordinates', { ...formData.coordinates, lat: e.target.value })}
                    placeholder="Latitude"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="text"
                    value={formData.coordinates.lng}
                    onChange={(e) => handleInputChange('coordinates', { ...formData.coordinates, lng: e.target.value })}
                    placeholder="Longitude"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">GPS coordinates help with property verification</p>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">Property Specifications</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Bedrooms</label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background"
                >
                  <option value="">Select</option>
                  <option value="0">Studio</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4 Bedrooms</option>
                  <option value="5">5+ Bedrooms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bathrooms</label>
                <select
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background"
                >
                  <option value="">Select</option>
                  <option value="1">1 Bathroom</option>
                  <option value="2">2 Bathrooms</option>
                  <option value="3">3 Bathrooms</option>
                  <option value="4">4+ Bathrooms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Toilets</label>
                <select
                  value={formData.toilets}
                  onChange={(e) => handleInputChange('toilets', e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background"
                >
                  <option value="">Select</option>
                  <option value="1">1 Toilet</option>
                  <option value="2">2 Toilets</option>
                  <option value="3">3 Toilets</option>
                  <option value="4">4+ Toilets</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Property Size</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  placeholder="e.g. 120 sqm"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Year Built</label>
                <input
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                  placeholder="e.g. 2020"
                  min="1950"
                  max={new Date().getFullYear()}
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Nigerian-Specific Features */}
            <div className="space-y-4">
              <h4 className="text-lg font-heading font-medium">Nigerian Property Features</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasBQ}
                    onChange={(e) => handleInputChange('hasBQ', e.target.checked)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">Has Boys Quarters (BQ)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasNEPA}
                    onChange={(e) => handleInputChange('hasNEPA', e.target.checked)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">NEPA/Power Supply</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasWater}
                    onChange={(e) => handleInputChange('hasWater', e.target.checked)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">Water Supply</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isGated}
                    onChange={(e) => handleInputChange('isGated', e.target.checked)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">Gated Community</span>
                </label>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">Pricing Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {formData.purpose === 'rent' ? 'Annual Rent' : 'Sale Price'} (₦) *
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="e.g. 2,500,000"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              {formData.purpose === 'rent' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Service Charge (₦/year)</label>
                    <input
                      type="text"
                      value={formData.serviceCharge}
                      onChange={(e) => handleInputChange('serviceCharge', e.target.value)}
                      placeholder="e.g. 300,000"
                      className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Caution Fee (₦)</label>
                    <input
                      type="text"
                      value={formData.cautionFee}
                      onChange={(e) => handleInputChange('cautionFee', e.target.value)}
                      placeholder="e.g. 500,000"
                      className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Legal Fee (₦)</label>
                    <input
                      type="text"
                      value={formData.legalFee}
                      onChange={(e) => handleInputChange('legalFee', e.target.value)}
                      placeholder="e.g. 200,000"
                      className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Agent Fee (₦)</label>
                    <input
                      type="text"
                      value={formData.agentFee}
                      onChange={(e) => handleInputChange('agentFee', e.target.value)}
                      placeholder="e.g. 300,000"
                      className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Total Initial Payment</h4>
              <div className="text-2xl font-bold text-brand-violet">
                ₦{(
                  parseInt(formData.price.replace(/,/g, '') || '0') +
                  parseInt(formData.cautionFee.replace(/,/g, '') || '0') +
                  parseInt(formData.legalFee.replace(/,/g, '') || '0') +
                  parseInt(formData.agentFee.replace(/,/g, '') || '0')
                ).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.purpose === 'rent' ? 'First year payment' : 'Purchase price'}
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">Features & Amenities</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-heading font-medium mb-4">Infrastructure</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {infrastructureOptions.map(option => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.infrastructure.includes(option)}
                        onChange={() => handleArrayToggle('infrastructure', option)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-heading font-medium mb-4">Amenities</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenityOptions.map(option => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(option)}
                        onChange={() => handleArrayToggle('amenities', option)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-heading font-medium mb-4">Security Features</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {securityOptions.map(option => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.security.includes(option)}
                        onChange={() => handleArrayToggle('security', option)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">Images & Documents</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-heading font-medium mb-4">Property Images</h4>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">📸</div>
                  <p className="text-lg font-medium mb-2">Upload Property Photos</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload high-quality images of your property. First image will be the cover photo.
                  </p>
                  <RealEstButton variant="tertiary">
                    Choose Files
                  </RealEstButton>
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted formats: JPG, PNG, WebP. Max 10MB per image.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-heading font-medium mb-4">Documents (Optional)</h4>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-lg font-medium mb-2">Upload Property Documents</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Certificate of Occupancy, Survey Plan, Building Plan, etc.
                  </p>
                  <RealEstButton variant="tertiary">
                    Choose Documents
                  </RealEstButton>
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted formats: PDF, DOC, DOCX. Max 5MB per document.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-heading font-bold">List Your Property</h2>
          <div className="flex items-center gap-2">
            <ProgressRing value={(currentStep / totalSteps) * 100} size="md" color="violet" showValue />
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-4 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                i + 1 <= currentStep
                  ? 'bg-brand-violet text-white'
                  : 'bg-muted text-muted-foreground'
              )}>
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={cn(
                  'w-12 h-1 mx-2 rounded transition-all',
                  i + 1 < currentStep ? 'bg-brand-violet' : 'bg-muted'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-card border border-border rounded-xl p-8 mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <RealEstButton variant="tertiary" onClick={prevStep}>
              ← Previous
            </RealEstButton>
          )}
        </div>

        <div className="flex items-center gap-4">
          <RealEstButton
            variant="ghost"
            onClick={() => handleSubmit(true)}
            isLoading={isLoading}
          >
            Save Draft
          </RealEstButton>

          {currentStep < totalSteps ? (
            <RealEstButton variant="neon" onClick={nextStep}>
              Next →
            </RealEstButton>
          ) : (
            <RealEstButton
              variant="neon"
              onClick={() => handleSubmit(false)}
              isLoading={isLoading}
            >
              {isLoading ? 'Publishing...' : 'Publish Listing'}
            </RealEstButton>
          )}
        </div>
      </div>
    </div>
  )
}

// ================================================================
// USER REGISTRATION FORM COMPONENT
// ================================================================

interface UserRegistrationFormProps {
  onSubmit?: (data: any) => void
  userType?: 'buyer' | 'owner' | 'agent'
  className?: string
}

export function UserRegistrationForm({
  onSubmit,
  userType = 'buyer',
  className
}: UserRegistrationFormProps) {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',

    // Account Information
    password: '',
    confirmPassword: '',

    // Location
    state: '',
    city: '',

    // User Type Specific
    profession: '',
    companyName: '',
    licenseNumber: '',
    experience: '',

    // Preferences
    interestedAreas: [],
    budgetRange: '',
    propertyTypes: [],

    // Legal
    agreeToTerms: false,
    subscribeNewsletter: true
  })

  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Calculate password strength
    if (field === 'password') {
      let strength = 0
      if (value.length >= 8) strength += 25
      if (/[A-Z]/.test(value)) strength += 25
      if (/[0-9]/.test(value)) strength += 25
      if (/[^A-Za-z0-9]/.test(value)) strength += 25
      setPasswordStrength(strength)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      await onSubmit?.(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500'
    if (passwordStrength <= 50) return 'bg-yellow-500'
    if (passwordStrength <= 75) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak'
    if (passwordStrength <= 50) return 'Fair'
    if (passwordStrength <= 75) return 'Good'
    return 'Strong'
  }

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading font-bold mb-2">
          Create Your RealEST Account
        </h2>
        <p className="text-muted-foreground">
          Join Nigeria's most trusted property marketplace
        </p>
        <div className="flex justify-center mt-4">
          <StatusBadge variant="verified">
            {userType === 'buyer' && 'Property Buyer'}
            {userType === 'owner' && 'Property Owner'}
            {userType === 'agent' && 'Real Estate Agent'}
          </StatusBadge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-xl font-heading font-semibold mb-6">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+234 901 234 5678"
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">State *</label>
              <select
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background"
                required
              >
                <option value="">Select your state</option>
                <option value="Lagos">Lagos</option>
                <option value="Abuja">FCT Abuja</option>
                <option value="Rivers">Rivers</option>
                <option value="Kano">Kano</option>
                <option value="Ogun">Ogun</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Your city"
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-xl font-heading font-semibold mb-6">Account Security</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                required
              />
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={cn('h-2 rounded-full transition-all', getPasswordStrengthColor())}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{getPasswordStrengthText()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use 8+ characters with uppercase, lowercase, numbers, and symbols
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          </div>
        </div>

        {/* User Type Specific Fields */}
        {userType === 'agent' && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-xl font-heading font-semibold mb-6">Professional Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">License Number</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  placeholder="Professional license number"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Years of Experience</label>
                <select
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background"
                >
                  <option value="">Select experience level</option>
                  <option value="0-1">0-1 years</option>
                  <option value="2-5">2-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Legal & Preferences */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-xl font-heading font-semibold mb-6">Terms & Preferences</h3>

          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                className="mt-1 rounded border-input"
                required
              />
              <span className="text-sm">
                I agree to the{' '}
                <a href="/terms" className="text-brand-violet hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="/privacy" className="text-brand-violet hover:underline">Privacy Policy</a>
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.subscribeNewsletter}
                onChange={(e) => handleInputChange('subscribeNewsletter', e.target.checked)}
                className="mt-1 rounded border-input"
              />
              <span className="text-sm">
                Subscribe to our newsletter for property updates and market insights
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <RealEstButton
          type="submit"
          variant="neon"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          isDisabled={!formData.agreeToTerms || formData.password !== formData.confirmPassword}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </RealEstButton>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/signin" className="text-brand-violet hover:underline font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </form>
    </div>
  )
}

// ================================================================
// CONTACT FORM COMPONENT
// ================================================================

interface ContactFormProps {
  propertyId?: string
  recipientType?: 'owner' | 'agent'
  recipientName?: string
  onSubmit?: (data: any) => void
  className?: string
}

export function ContactForm({
  propertyId,
  recipientType = 'owner',
  recipientName,
  onSubmit,
  className
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    inquiryType: 'viewing',
    preferredContactMethod: 'email',
    availableTimes: []
  })

  const [isLoading, setIsLoading] = useState(false)

  const inquiryTypes = [
    { value: 'viewing', label: 'Schedule a Viewing' },
    { value: 'rental', label: 'Rental Inquiry' },
    { value: 'purchase', label: 'Purchase Inquiry' },
    { value: 'information', label: 'Request Information' },
    { value: 'negotiation', label: 'Price Negotiation' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit?.({ ...formData, propertyId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('max-w-lg mx-auto', className)}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-heading font-bold mb-2">Contact {recipientType}</h3>
        {recipientName && (
          <p className="text-muted-foreground">Get in touch with {recipientName}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Inquiry Type</label>
            <select
              value={formData.inquiryType}
              onChange={(e) => setFormData(prev => ({ ...prev, inquiryType: e.target.value }))}
              className="w-full p-3 border border-input rounded-lg bg-background"
            >
              {inquiryTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+234 901 234 5678"
              className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message *</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Tell us about your requirements, preferred viewing times, or any questions you have..."
              rows={4}
              className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preferred Contact Method</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="contactMethod"
                  value="email"
                  checked={formData.preferredContactMethod === 'email'}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredContactMethod: e.target.value }))}
                  className="border-input"
                />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="contactMethod"
                  value="phone"
                  checked={formData.preferredContactMethod === 'phone'}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredContactMethod: e.target.value }))}
                  className="border-input"
                />
                <span className="text-sm">Phone</span>
              </label>
            </div>
          </div>
        </div>

        <RealEstButton
          type="submit"
          variant="neon"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          isDisabled={isLoading}
        >
          {isLoading ? 'Sending Message...' : 'Send Message'}
        </RealEstButton>

        <p className="text-xs text-muted-foreground text-center">
          Your contact information will be shared with the {recipientType} to facilitate communication.
        </p>
      </form>
    </div>
  )
}

// ================================================================
// ADVANCED SEARCH FORM COMPONENT
// ================================================================

interface AdvancedSearchFormProps {
  onSearch?: (filters: any) => void
  onSaveSearch?: (filters: any) => void
  initialFilters?: any
  className?: string
}

export function AdvancedSearchForm({
  onSearch,
  onSaveSearch,
  initialFilters,
  className
}: AdvancedSearchFormProps) {
  const [filters, setFilters] = useState({
    // Location
    state: '',
    lga: '',
    area: '',
    radius: 5, // km

    // Property Type
    propertyType: [],
    purpose: 'any', // any, rent, sale

    // Price Range
    minPrice: '',
    maxPrice: '',
    currency: 'NGN',

    // Property Details
    minBedrooms: '',
    maxBedrooms: '',
    minBathrooms: '',
    maxBathrooms: '',
    minSize: '',
    maxSize: '',

    // Features
    mustHave: [],
    niceToHave: [],

    // Nigerian Specific
    hasBQ: false,
    hasNEPA: false,
    hasWater: false,
    isGated: false,
    hasGoodRoads: false,

    // Search Preferences
    sortBy: 'relevance',
    verifiedOnly: true,
    availableOnly: true,

    ...initialFilters
  })

  const [isExpanded, setIsExpanded] = useState(false)

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ]

  const propertyTypes = [
    'Apartment', 'Duplex', 'Bungalow', 'Boys Quarters (BQ)',
    'Self-contained', 'Mini Flat', 'Face-me-I-face-you', 'Mansion',
    'Terrace', 'Semi-detached', 'Detached', 'Penthouse'
  ]

  const mustHaveFeatures = [
    'Swimming Pool', 'Gym', 'Generator', 'Parking Space',
    'Air Conditioning', 'Furnished', 'Security Post', 'CCTV',
    'Elevator', 'Balcony', 'Garden', 'Playground'
  ]

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayToggle = (field: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [field]: (prev as any)[field].includes(value)
        ? (prev as any)[field].filter((item: string) => item !== value)
        : [...(prev as any)[field], value]
    }))
  }

  const handleSearch = () => {
    onSearch?.(filters)
  }

  const handleSaveSearch = () => {
    onSaveSearch?.(filters)
  }

  const clearFilters = () => {
    setFilters({
      state: '',
      lga: '',
      area: '',
      radius: 5,
      propertyType: [],
      purpose: 'any',
      minPrice: '',
      maxPrice: '',
      currency: 'NGN',
      minBedrooms: '',
      maxBedrooms: '',
      minBathrooms: '',
      maxBathrooms: '',
      minSize: '',
      maxSize: '',
      mustHave: [],
      niceToHave: [],
      hasBQ: false,
      hasNEPA: false,
      hasWater: false,
      isGated: false,
      hasGoodRoads: false,
      sortBy: 'relevance',
      verifiedOnly: true,
      availableOnly: true
    })
  }

  return (
    <div className={cn('bg-card border border-border rounded-xl p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-heading font-bold">Advanced Search</h3>
        <RealEstButton
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide' : 'Show'} Filters
        </RealEstButton>
      </div>

      {/* Quick Filters - Always Visible */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select State</option>
              {nigerianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Property Type</label>
            <select
              value={filters.propertyType[0] || ''}
              onChange={(e) => handleFilterChange('propertyType', e.target.value ? [e.target.value] : [])}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Any Type</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Purpose</label>
            <select
              value={filters.purpose}
              onChange={(e) => handleFilterChange('purpose', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="any">Any</option>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Min Price (₦)</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Price (₦)</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="No limit"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Advanced Filters - Expandable */}
      {isExpanded && (
        <div className="space-y-6 border-t border-border pt-6">
          {/* Property Details */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Property Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Min Bedrooms</label>
                <input
                  type="number"
                  value={filters.minBedrooms}
                  onChange={(e) => handleFilterChange('minBedrooms', e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Bedrooms</label>
                <input
                  type="number"
                  value={filters.maxBedrooms}
                  onChange={(e) => handleFilterChange('maxBedrooms', e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Min Bathrooms</label>
                <input
                  type="number"
                  value={filters.minBathrooms}
                  onChange={(e) => handleFilterChange('minBathrooms', e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Bathrooms</label>
                <input
                  type="number"
                  value={filters.maxBathrooms}
                  onChange={(e) => handleFilterChange('maxBathrooms', e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Nigerian Infrastructure */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Infrastructure & Utilities</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'hasNEPA', label: 'NEPA/Power Supply' },
                { key: 'hasWater', label: 'Water Supply' },
                { key: 'hasGoodRoads', label: 'Good Road Network' },
                { key: 'isGated', label: 'Gated Community' },
                { key: 'hasBQ', label: 'Has Boys Quarters' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters[key as keyof typeof filters] as boolean}
                    onChange={(e) => handleFilterChange(key, e.target.checked)}
                    className="rounded border-border focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Must Have Features */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Must Have Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {mustHaveFeatures.map(feature => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.mustHave.includes(feature)}
                    onChange={() => handleArrayToggle('mustHave', feature)}
                    className="rounded border-border focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search Preferences */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Search Preferences</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="size_large">Largest First</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                    className="rounded border-border focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm">Verified Only</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.availableOnly}
                    onChange={(e) => handleFilterChange('availableOnly', e.target.checked)}
                    className="rounded border-border focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm">Available Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-border">
        <RealEstButton
          onClick={handleSearch}
          className="flex-1"
          size="lg"
        >
          Search Properties
        </RealEstButton>
        <RealEstButton
          variant="tertiary"
          onClick={handleSaveSearch}
          size="lg"
        >
          Save Search
        </RealEstButton>
        <RealEstButton
          variant="ghost"
          onClick={clearFilters}
          size="lg"
        >
          Clear All
        </RealEstButton>
      </div>
    </div>
  )
}

// ================================================================
// PROFILE SETTINGS FORM COMPONENT
// ================================================================

interface ProfileSettingsFormProps {
  onSubmit?: (data: any) => void
  initialData?: any
  userType?: 'buyer' | 'owner' | 'agent' | 'admin'
  className?: string
}

export function ProfileSettingsForm({
  onSubmit,
  initialData,
  userType = 'buyer',
  className
}: ProfileSettingsFormProps) {
  const [activeTab, setActiveTab] = useState('personal')
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    profileImage: null,

    // Location
    state: '',
    city: '',
    address: '',

    // Professional (Agent/Owner specific)
    companyName: '',
    licenseNumber: '',
    experience: '',
    specialization: [],

    // Preferences
    language: 'en',
    currency: 'NGN',
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false
    },

    // Privacy
    profileVisibility: 'public',
    showContact: true,
    showLocation: false,

    // Account
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,

    ...initialData
  })

  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'privacy', label: 'Privacy', icon: '👁️' }
  ]

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))

    // Calculate password strength
    if (field === 'newPassword') {
      let strength = 0
      if (value.length >= 8) strength += 25
      if (/[A-Z]/.test(value)) strength += 25
      if (/[0-9]/.test(value)) strength += 25
      if (/[^A-Za-z0-9]/.test(value)) strength += 25
      setPasswordStrength(strength)
    }
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit?.(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+234"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select State</option>
                  {nigerianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )

      case 'professional':
        if (userType === 'buyer') {
          return (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Professional settings are not available for buyer accounts.</p>
            </div>
          )
        }
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {userType === 'agent' && (
              <div>
                <label className="block text-sm font-medium mb-2">License Number</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Years of Experience</label>
              <select
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Experience</option>
                <option value="0-1">0-1 years</option>
                <option value="2-5">2-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="11-15">11-15 years</option>
                <option value="16+">16+ years</option>
              </select>
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="ha">Hausa</option>
                  <option value="ig">Igbo</option>
                  <option value="yo">Yoruba</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="font-heading font-semibold mb-4">Notifications</h4>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Email Notifications' },
                  { key: 'sms', label: 'SMS Notifications' },
                  { key: 'push', label: 'Push Notifications' },
                  { key: 'marketing', label: 'Marketing Communications' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications[key as keyof typeof formData.notifications]}
                      onChange={(e) => handleNestedChange('notifications', key, e.target.checked)}
                      className="rounded border-border focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          passwordStrength >= 75 ? "bg-green-500" :
                          passwordStrength >= 50 ? "bg-yellow-500" :
                          passwordStrength >= 25 ? "bg-orange-500" : "bg-red-500"
                        )}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {passwordStrength >= 75 ? "Strong" :
                       passwordStrength >= 50 ? "Good" :
                       passwordStrength >= 25 ? "Fair" : "Weak"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.twoFactorEnabled}
                  onChange={(e) => handleInputChange('twoFactorEnabled', e.target.checked)}
                  className="rounded border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">Enable Two-Factor Authentication</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Profile Visibility</label>
              <select
                value={formData.profileVisibility}
                onChange={(e) => handleInputChange('profileVisibility', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="public">Public - Anyone can see your profile</option>
                <option value="verified">Verified Users Only</option>
                <option value="private">Private - Hidden from search</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showContact}
                  onChange={(e) => handleInputChange('showContact', e.target.checked)}
                  className="rounded border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">Show contact information</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showLocation}
                  onChange={(e) => handleInputChange('showLocation', e.target.checked)}
                  className="rounded border-border focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">Show general location</span>
              </label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading font-bold mb-2">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {renderTabContent()}

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-border">
            <RealEstButton
              type="button"
              variant="tertiary"
              onClick={() => window.location.reload()}
            >
              Cancel
            </RealEstButton>
            <RealEstButton
              type="submit"
              isLoading={isLoading}
              isDisabled={isLoading}
            >
              Save Changes
            </RealEstButton>
          </div>
        </form>
      </div>
    </div>
  )
}

// ================================================================
// PROPERTY VERIFICATION FORM COMPONENT
// ================================================================

interface PropertyVerificationFormProps {
  propertyId: string
  onSubmit?: (data: any) => void
  onReject?: (reason: string) => void
  initialData?: any
  className?: string
}

export function PropertyVerificationForm({
  propertyId,
  onSubmit,
  onReject,
  initialData,
  className
}: PropertyVerificationFormProps) {
  const [formData, setFormData] = useState({
    // Verification Status
    overallStatus: 'pending', // approved, rejected, pending

    // Document Verification
    titleDeed: {
      status: 'pending',
      notes: '',
      confidence: 0
    },
    survey: {
      status: 'pending',
      notes: '',
      confidence: 0
    },
    cOfO: {
      status: 'pending',
      notes: '',
      confidence: 0
    },

    // Physical Verification
    locationAccuracy: {
      status: 'pending',
      notes: '',
      gpsCoordinates: { lat: '', lng: '' },
      accuracy: 0
    },
    propertyCondition: {
      status: 'pending',
      notes: '',
      rating: 0
    },
    amenitiesVerified: {
      status: 'pending',
      notes: '',
      verified: [],
      missing: []
    },

    // Infrastructure Assessment
    powerSupply: {
      available: false,
      type: '', // NEPA, generator, solar
      reliability: 0,
      notes: ''
    },
    waterSupply: {
      available: false,
      type: '', // borehole, public, well
      quality: 0,
      notes: ''
    },
    roadAccess: {
      condition: '', // excellent, good, fair, poor
      type: '', // tarred, interlocked, dirt
      notes: ''
    },

    // Security Assessment
    security: {
      rating: 0,
      features: [],
      concerns: [],
      notes: ''
    },

    // Final Assessment
    recommendation: 'pending', // approve, reject, conditional
    rejectionReason: '',
    conditions: [],
    verifierNotes: '',

    ...initialData
  })

  const [currentSection, setCurrentSection] = useState('documents')
  const [isLoading, setIsLoading] = useState(false)

  const sections = [
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'physical', label: 'Physical Check', icon: '🏠' },
    { id: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'assessment', label: 'Final Assessment', icon: '✅' }
  ]

  const documentTypes = [
    { key: 'titleDeed', label: 'Title Deed/Certificate of Occupancy' },
    { key: 'survey', label: 'Survey Plan' },
    { key: 'cOfO', label: 'Certificate of Occupancy' }
  ]

  const securityFeatures = [
    'Gated Community', 'Security Guards', 'CCTV Surveillance',
    'Perimeter Fencing', 'Access Control', 'Security Post',
    'Street Lighting', 'Neighborhood Watch'
  ]

  const handleStatusChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit?.(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!formData.rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    setIsLoading(true)
    try {
      await onReject?.(formData.rejectionReason)
    } finally {
      setIsLoading(false)
    }
  }

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'documents':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold mb-2">Document Verification</h3>
              <p className="text-muted-foreground">Review and verify property documents</p>
            </div>

            {documentTypes.map(({ key, label }) => (
              <div key={key} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-heading font-semibold">{label}</h4>
                  <StatusBadge
                    variant={formData[key as keyof typeof formData].status as any}
                    size="sm"
                  >
                    {formData[key as keyof typeof formData].status}
                  </StatusBadge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={formData[key as keyof typeof formData].status}
                      onChange={(e) => handleStatusChange(key, 'status', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="pending">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="conditional">Needs Clarification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confidence Level</label>
                    <select
                      value={formData[key as keyof typeof formData].confidence}
                      onChange={(e) => handleStatusChange(key, 'confidence', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value={0}>Select Level</option>
                      <option value={25}>Low (25%)</option>
                      <option value={50}>Medium (50%)</option>
                      <option value={75}>High (75%)</option>
                      <option value={100}>Very High (100%)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={formData[key as keyof typeof formData].notes}
                    onChange={(e) => handleStatusChange(key, 'notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Add verification notes..."
                  />
                </div>
              </div>
            ))}
          </div>
        )

      case 'physical':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold mb-2">Physical Verification</h3>
              <p className="text-muted-foreground">On-site property assessment</p>
            </div>

            {/* Location Accuracy */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-heading font-semibold mb-4">Location Accuracy</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">GPS Latitude</label>
                  <input
                    type="text"
                    value={formData.locationAccuracy.gpsCoordinates.lat}
                    onChange={(e) => handleStatusChange('locationAccuracy', 'gpsCoordinates', {
                      ...formData.locationAccuracy.gpsCoordinates,
                      lat: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="6.5244"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">GPS Longitude</label>
                  <input
                    type="text"
                    value={formData.locationAccuracy.gpsCoordinates.lng}
                    onChange={(e) => handleStatusChange('locationAccuracy', 'gpsCoordinates', {
                      ...formData.locationAccuracy.gpsCoordinates,
                      lng: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="3.3792"
                  />
                </div>
              </div>
            </div>

            {/* Property Condition */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-heading font-semibold mb-4">Property Condition</h4>
              <div>
                <label className="block text-sm font-medium mb-2">Overall Rating</label>
                <select
                  value={formData.propertyCondition.rating}
                  onChange={(e) => handleStatusChange('propertyCondition', 'rating', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={0}>Select Rating</option>
                  <option value={1}>1 - Poor Condition</option>
                  <option value={2}>2 - Fair Condition</option>
                  <option value={3}>3 - Good Condition</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={5}>5 - Excellent</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Condition Notes</label>
                <textarea
                  value={formData.propertyCondition.notes}
                  onChange={(e) => handleStatusChange('propertyCondition', 'notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe property condition..."
                />
              </div>
            </div>
          </div>
        )

      case 'infrastructure':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold mb-2">Infrastructure Assessment</h3>
              <p className="text-muted-foreground">Evaluate utilities and infrastructure</p>
            </div>

            {/* Power Supply */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-heading font-semibold mb-4">Power Supply</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={formData.powerSupply.available}
                      onChange={(e) => handleStatusChange('powerSupply', 'available', e.target.checked)}
                      className="rounded border-border focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm">Power Available</span>
                  </label>
                  {formData.powerSupply.available && (
                    <select
                      value={formData.powerSupply.type}
                      onChange={(e) => handleStatusChange('powerSupply', 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      <option value="nepa">NEPA/Grid</option>
                      <option value="generator">Generator</option>
                      <option value="solar">Solar</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  )}
                </div>
                {formData.powerSupply.available && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Reliability Rating</label>
                    <select
                      value={formData.powerSupply.reliability}
                      onChange={(e) => handleStatusChange('powerSupply', 'reliability', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value={0}>Select Rating</option>
                      <option value={1}>1 - Very Poor</option>
                      <option value={2}>2 - Poor</option>
                      <option value={3}>3 - Average</option>
                      <option value={4}>4 - Good</option>
                      <option value={5}>5 - Excellent</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Water Supply */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-heading font-semibold mb-4">Water Supply</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={formData.waterSupply.available}
                      onChange={(e) => handleStatusChange('waterSupply', 'available', e.target.checked)}
                      className="rounded border-border focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm">Water Available</span>
                  </label>
                  {formData.waterSupply.available && (
                    <select
                      value={formData.waterSupply.type}
                      onChange={(e) => handleStatusChange('waterSupply', 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      <option value="borehole">Borehole</option>
                      <option value="public">Public Supply</option>
                      <option value="well">Well Water</option>
                      <option value="packaged">Packaged Water</option>
                    </select>
                  )}
                </div>
                {formData.waterSupply.available && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Quality Rating</label>
                    <select
                      value={formData.waterSupply.quality}
                      onChange={(e) => handleStatusChange('waterSupply', 'quality', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value={0}>Select Rating</option>
                      <option value={1}>1 - Poor Quality</option>
                      <option value={2}>2 - Fair Quality</option>
                      <option value={3}>3 - Good Quality</option>
                      <option value={4}>4 - Very Good</option>
                      <option value={5}>5 - Excellent</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Road Access */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-heading font-semibold mb-4">Road Access</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Road Type</label>
                  <select
                    value={formData.roadAccess.type}
                    onChange={(e) => handleStatusChange('roadAccess', 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="tarred">Tarred Road</option>
                    <option value="interlocked">Interlocked</option>
                    <option value="dirt">Dirt Road</option>
                    <option value="gravel">Gravel Road</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Road Condition</label>
                  <select
                    value={formData.roadAccess.condition}
                    onChange={(e) => handleStatusChange('roadAccess', 'condition', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select Condition</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold mb-2">Security Assessment</h3>
              <p className="text-muted-foreground">Evaluate security features and concerns</p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Overall Security Rating</label>
                <select
                  value={formData.security.rating}
                  onChange={(e) => handleStatusChange('security', 'rating', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={0}>Select Rating</option>
                  <option value={1}>1 - Very Poor</option>
                  <option value={2}>2 - Poor</option>
                  <option value={3}>3 - Average</option>
                  <option value={4}>4 - Good</option>
                  <option value={5}>5 - Excellent</option>
                </select>
              </div>

              <div className="mb-4">
                <h4 className="font-heading font-semibold mb-3">Security Features Present</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {securityFeatures.map(feature => (
                    <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.security.features.includes(feature)}
                        onChange={(e) => {
                          const features = e.target.checked
                            ? [...formData.security.features, feature]
                            : formData.security.features.filter((f: string) => f !== feature)
                          handleStatusChange('security', 'features', features)
                        }}
                        className="rounded border-border focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Security Notes</label>
                <textarea
                  value={formData.security.notes}
                  onChange={(e) => handleStatusChange('security', 'notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Additional security observations..."
                />
              </div>
            </div>
          </div>
        )

      case 'assessment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold mb-2">Final Assessment</h3>
              <p className="text-muted-foreground">Make your verification recommendation</p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Recommendation</label>
                <select
                  value={formData.recommendation}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, recommendation: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="pending">Select Recommendation</option>
                  <option value="approve">Approve - Property meets all standards</option>
                  <option value="conditional">Conditional Approval - Minor issues to resolve</option>
                  <option value="reject">Reject - Property does not meet standards</option>
                </select>
              </div>

              {formData.recommendation === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rejection Reason</label>
                  <textarea
                    value={formData.rejectionReason}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, rejectionReason: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Explain why the property is being rejected..."
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Verifier Notes</label>
                <textarea
                  value={formData.verifierNotes}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, verifierNotes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Additional notes for the property owner and internal team..."
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading font-bold mb-2">Property Verification</h2>
        <p className="text-muted-foreground">Property ID: {propertyId}</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Progress Steps */}
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center">
                <button
                  onClick={() => setCurrentSection(section.id)}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    currentSection === section.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : sections.findIndex(s => s.id === currentSection) > index
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-border bg-background text-muted-foreground"
                  )}
                >
                  <span className="text-sm">{section.icon}</span>
                </button>
                {index < sections.length - 1 && (
                  <div className={cn(
                    "w-16 h-0.5 mx-2",
                    sections.findIndex(s => s.id === currentSection) > index
                      ? "bg-green-500"
                      : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            {sections.map(section => (
              <span key={section.id} className="text-xs text-muted-foreground">
                {section.label}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {renderSectionContent()}

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <div className="flex space-x-3">
              {currentSection !== 'documents' && (
                <RealEstButton
                  type="button"
                  variant="tertiary"
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === currentSection)
                    if (currentIndex > 0) {
                      setCurrentSection(sections[currentIndex - 1].id)
                    }
                  }}
                >
                  Previous
                </RealEstButton>
              )}
              {currentSection !== 'assessment' && (
                <RealEstButton
                  type="button"
                  variant="tertiary"
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === currentSection)
                    if (currentIndex < sections.length - 1) {
                      setCurrentSection(sections[currentIndex + 1].id)
                    }
                  }}
                >
                  Next
                </RealEstButton>
              )}
            </div>

            <div className="flex space-x-3">
              {formData.recommendation === 'reject' && (
                <RealEstButton
                  type="button"
                  variant="danger"
                  onClick={handleReject}
                  isLoading={isLoading}
                  isDisabled={isLoading || !formData.rejectionReason.trim()}
                >
                  Reject Property
                </RealEstButton>
              )}
              {currentSection === 'assessment' && formData.recommendation !== 'reject' && (
                <RealEstButton
                  type="submit"
                  isLoading={isLoading}
                  isDisabled={isLoading || formData.recommendation === 'pending'}
                >
                  {formData.recommendation === 'approve' ? 'Approve Property' : 'Conditional Approval'}
                </RealEstButton>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ================================================================
// REVIEW & RATING FORM COMPONENT
// ================================================================

interface ReviewFormProps {
  propertyId?: string
  agentId?: string
  reviewType: 'property' | 'agent' | 'landlord'
  onSubmit?: (data: any) => void
  initialData?: any
  className?: string
}

export function ReviewForm({
  propertyId,
  agentId,
  reviewType,
  onSubmit,
  initialData,
  className
}: ReviewFormProps) {
  const [formData, setFormData] = useState({
    // Overall Rating
    overallRating: 0,

    // Specific Ratings (property)
    locationRating: 0,
    amenitiesRating: 0,
    valueRating: 0,

    // Specific Ratings (agent/landlord)
    communicationRating: 0,
    professionalismRating: 0,
    responsivenessRating: 0,

    // Review Content
    title: '',
    reviewText: '',

    // Experience Details
    moveInDate: '',
    rentalDuration: '',
    wouldRecommend: null,

    // Pros and Cons
    pros: [],
    cons: [],

    // Contact Information
    reviewerName: '',
    reviewerEmail: '',
    isAnonymous: false,

    // Media
    photos: [],

    ...initialData
  })

  const [isLoading, setIsLoading] = useState(false)
  const [currentPro, setCurrentPro] = useState('')
  const [currentCon, setCurrentCon] = useState('')

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  }

  const propertyAspects = [
    { key: 'locationRating', label: 'Location & Accessibility' },
    { key: 'amenitiesRating', label: 'Amenities & Features' },
    { key: 'valueRating', label: 'Value for Money' }
  ]

  const serviceAspects = [
    { key: 'communicationRating', label: 'Communication' },
    { key: 'professionalismRating', label: 'Professionalism' },
    { key: 'responsivenessRating', label: 'Responsiveness' }
  ]

  const handleRatingChange = (field: string, rating: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: rating
    }))
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const addPro = () => {
    if (currentPro.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        pros: [...prev.pros, currentPro.trim()]
      }))
      setCurrentPro('')
    }
  }

  const addCon = () => {
    if (currentCon.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        cons: [...prev.cons, currentCon.trim()]
      }))
      setCurrentCon('')
    }
  }

  const removePro = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      pros: prev.pros.filter((_: any, i: number) => i !== index)
    }))
  }

  const removeCon = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      cons: prev.cons.filter((_: any, i: number) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit?.(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const StarRating = ({ rating, onRatingChange, size = 'md' }: {
    rating: number
    onRatingChange: (rating: number) => void
    size?: 'sm' | 'md' | 'lg'
  }) => {
    const starSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={cn(
              starSize,
              "transition-colors",
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300 hover:text-yellow-400"
            )}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {ratingLabels[rating as keyof typeof ratingLabels]}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading font-bold mb-2">
          Write a Review
        </h2>
        <p className="text-muted-foreground">
          Share your experience with {reviewType === 'property' ? 'this property' : 'this service'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-card border border-border rounded-xl p-6">
          {/* Overall Rating */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-heading font-semibold mb-4">Overall Rating</h3>
            <StarRating
              rating={formData.overallRating}
              onRatingChange={(rating) => handleRatingChange('overallRating', rating)}
              size="lg"
            />
          </div>

          {/* Specific Ratings */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold">Rate Specific Aspects</h4>
            {(reviewType === 'property' ? propertyAspects : serviceAspects).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <StarRating
                  rating={formData[key as keyof typeof formData] as number}
                  onRatingChange={(rating) => handleRatingChange(key, rating)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Review Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <textarea
              value={formData.reviewText}
              onChange={(e) => handleInputChange('reviewText', e.target.value)}
              rows={5}
              placeholder="Share details about your experience..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">What you liked</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={currentPro}
                  onChange={(e) => setCurrentPro(e.target.value)}
                  placeholder="Add a positive point"
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
                />
                <RealEstButton type="button" onClick={addPro} size="sm">
                  Add
                </RealEstButton>
              </div>
              <div className="space-y-2">
                {formData.pros.map((pro: string, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-sm text-green-800">{pro}</span>
                    <button
                      type="button"
                      onClick={() => removePro(index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Areas for improvement</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={currentCon}
                  onChange={(e) => setCurrentCon(e.target.value)}
                  placeholder="Add an area for improvement"
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
                />
                <RealEstButton type="button" onClick={addCon} size="sm">
                  Add
                </RealEstButton>
              </div>
              <div className="space-y-2">
                {formData.cons.map((con: string, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <span className="text-sm text-red-800">{con}</span>
                    <button
                      type="button"
                      onClick={() => removeCon(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-medium mb-3">Would you recommend this {reviewType}?</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="recommendation"
                  value="yes"
                  checked={formData.wouldRecommend === true}
                  onChange={() => handleInputChange('wouldRecommend', true)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm">Yes, I would recommend</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="recommendation"
                  value="no"
                  checked={formData.wouldRecommend === false}
                  onChange={() => handleInputChange('wouldRecommend', false)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm">No, I would not recommend</span>
              </label>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h4 className="font-heading font-semibold">Contact Information</h4>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
              className="rounded border-border focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm">Post this review anonymously</span>
          </label>

          {!formData.isAnonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  value={formData.reviewerName}
                  onChange={(e) => handleInputChange('reviewerName', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Email</label>
                <input
                  type="email"
                  value={formData.reviewerEmail}
                  onChange={(e) => handleInputChange('reviewerEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <RealEstButton
            type="button"
            variant="tertiary"
            onClick={() => window.history.back()}
          >
            Cancel
          </RealEstButton>
          <RealEstButton
            type="submit"
            isLoading={isLoading}
            isDisabled={isLoading || formData.overallRating === 0 || !formData.reviewText.trim()}
          >
            Submit Review
          </RealEstButton>
        </div>
      </form>
    </div>
  )
}

// ================================================================
// QUICK INQUIRY FORM COMPONENT
// ================================================================

interface QuickInquiryFormProps {
  propertyId?: string
  propertyTitle?: string
  onSubmit?: (data: any) => void
  className?: string
}

export function QuickInquiryForm({
  propertyId,
  propertyTitle,
  onSubmit,
  className
}: QuickInquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'viewing',
    message: '',
    preferredTime: '',
    urgency: 'normal'
  })

  const [isLoading, setIsLoading] = useState(false)

  const inquiryTypes = [
    { value: 'viewing', label: 'Schedule Viewing', icon: '👁️' },
    { value: 'rental', label: 'Rental Inquiry', icon: '🏠' },
    { value: 'purchase', label: 'Purchase Inquiry', icon: '💰' },
    { value: 'information', label: 'More Information', icon: 'ℹ️' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit?.({ ...formData, propertyId })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className={cn('', className)}>
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-heading font-bold mb-2">Quick Inquiry</h3>
          {propertyTitle && (
            <p className="text-sm text-muted-foreground">{propertyTitle}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                placeholder="+234"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Inquiry Type</label>
            <div className="grid grid-cols-2 gap-2">
              {inquiryTypes.map(type => (
                <label
                  key={type.value}
                  className={cn(
                    "flex items-center space-x-2 p-3 border border-border rounded-lg cursor-pointer transition-colors",
                    formData.inquiryType === type.value
                      ? "border-primary bg-primary/10"
                      : "hover:border-primary/50"
                  )}
                >
                  <input
                    type="radio"
                    name="inquiryType"
                    value={type.value}
                    checked={formData.inquiryType === type.value}
                    onChange={(e) => handleInputChange('inquiryType', e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={3}
              placeholder="Tell us about your requirements..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <RealEstButton
            type="submit"
            className="w-full"
            isLoading={isLoading}
            isDisabled={isLoading}
            size="lg"
          >
            Send Inquiry
          </RealEstButton>
        </form>
      </div>
    </div>
  )
}
