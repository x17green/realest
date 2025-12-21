"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { RealEstButton } from "@/components/heroui/RealEstButton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  LoadingSpinner,
  ProgressRing,
} from "@/components/untitledui/StatusComponents";

interface PropertyListingFormProps {
  onSubmit?: (data: any) => void;
  onSaveDraft?: (data: any) => void;
  initialData?: any;
  className?: string;
}

export function PropertyListingForm({
  onSubmit,
  onSaveDraft,
  initialData,
  className,
}: PropertyListingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Details
    title: "",
    description: "",
    propertyType: "",
    purpose: "rent", // rent, sale

    // Location
    state: "",
    lga: "",
    area: "",
    address: "",
    coordinates: { lat: "", lng: "" },

    // Property Details
    bedrooms: "",
    bathrooms: "",
    toilets: "",
    size: "",
    yearBuilt: "",

    // Pricing
    price: "",
    serviceCharge: "",
    cautionFee: "",
    legalFee: "",
    agentFee: "",

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
    ...initialData,
  });

  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 6;

  const nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];

  const propertyTypes = [
    "Apartment",
    "Duplex",
    "Bungalow",
    "Boys Quarters (BQ)",
    "Self-contained",
    "Mini Flat",
    "Face-me-I-face-you",
    "Mansion",
    "Terrace",
    "Semi-detached",
    "Detached",
    "Penthouse",
  ];

  const infrastructureOptions = [
    "NEPA/Power Supply",
    "Borehole/Water Supply",
    "Internet Connectivity",
    "Good Road Network",
    "Drainage System",
    "Street Lighting",
  ];

  const amenityOptions = [
    "Swimming Pool",
    "Gym",
    "Playground",
    "Garden",
    "Parking Space",
    "Generator",
    "Air Conditioning",
    "Furnished",
    "Balcony",
    "Elevator",
  ];

  const securityOptions = [
    "Gated Community",
    "Security Post",
    "CCTV Surveillance",
    "Perimeter Fencing",
    "Security Guards",
    "Access Control",
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: (prev as any)[field].includes(value)
        ? (prev as any)[field].filter((item: string) => item !== value)
        : [...(prev as any)[field], value],
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (isDraft = false) => {
    setIsLoading(true);
    try {
      if (isDraft) {
        await onSaveDraft?.(formData);
      } else {
        await onSubmit?.(formData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">
              Basic Property Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g. Modern 3BR Apartment in Lekki Phase 1"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Make it descriptive and appealing
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Type *
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) =>
                    handleInputChange("propertyType", e.target.value)
                  }
                  className="w-full p-3 border border-input rounded-lg bg-background"
                  required
                >
                  <option value="">Select property type</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Purpose *
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background"
                  required
                >
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Property Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe the property, neighborhood, and special features..."
                  rows={4}
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring resize-none"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">
              Location Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background"
                  required
                >
                  <option value="">Select state</option>
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">LGA *</label>
                <input
                  type="text"
                  value={formData.lga}
                  onChange={(e) => handleInputChange("lga", e.target.value)}
                  placeholder="Local Government Area"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Area/District *
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                  placeholder="e.g. Lekki Phase 1, Victoria Island"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Street name and number"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  GPS Coordinates (Optional)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.coordinates.lat}
                    onChange={(e) =>
                      handleInputChange("coordinates", {
                        ...formData.coordinates,
                        lat: e.target.value,
                      })
                    }
                    placeholder="Latitude"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="text"
                    value={formData.coordinates.lng}
                    onChange={(e) =>
                      handleInputChange("coordinates", {
                        ...formData.coordinates,
                        lng: e.target.value,
                      })
                    }
                    placeholder="Longitude"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  GPS coordinates help with property verification
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">
              Property Specifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bedrooms
                </label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) =>
                    handleInputChange("bedrooms", e.target.value)
                  }
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
                <label className="block text-sm font-medium mb-2">
                  Bathrooms
                </label>
                <select
                  value={formData.bathrooms}
                  onChange={(e) =>
                    handleInputChange("bathrooms", e.target.value)
                  }
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
                <label className="block text-sm font-medium mb-2">
                  Toilets
                </label>
                <select
                  value={formData.toilets}
                  onChange={(e) => handleInputChange("toilets", e.target.value)}
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
                <label className="block text-sm font-medium mb-2">
                  Property Size
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => handleInputChange("size", e.target.value)}
                  placeholder="e.g. 120 sqm"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Year Built
                </label>
                <input
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) =>
                    handleInputChange("yearBuilt", e.target.value)
                  }
                  placeholder="e.g. 2020"
                  min="1950"
                  max={new Date().getFullYear()}
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Nigerian-Specific Features */}
            <div className="space-y-4">
              <h4 className="text-lg font-heading font-medium">
                Nigerian Property Features
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasBQ}
                    onChange={(e) =>
                      handleInputChange("hasBQ", e.target.checked)
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">Has Boys Quarters (BQ)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasNEPA}
                    onChange={(e) =>
                      handleInputChange("hasNEPA", e.target.checked)
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">NEPA/Power Supply</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasWater}
                    onChange={(e) =>
                      handleInputChange("hasWater", e.target.checked)
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">Water Supply</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isGated}
                    onChange={(e) =>
                      handleInputChange("isGated", e.target.checked)
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">Gated Community</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">
              Pricing Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {formData.purpose === "rent" ? "Annual Rent" : "Sale Price"}{" "}
                  (₦) *
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="e.g. 2,500,000"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              {formData.purpose === "rent" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Service Charge (₦/year)
                    </label>
                    <input
                      type="text"
                      value={formData.serviceCharge}
                      onChange={(e) =>
                        handleInputChange("serviceCharge", e.target.value)
                      }
                      placeholder="e.g. 300,000"
                      className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Caution Fee (₦)
                    </label>
                    <input
                      type="text"
                      value={formData.cautionFee}
                      onChange={(e) =>
                        handleInputChange("cautionFee", e.target.value)
                      }
                      placeholder="e.g. 500,000"
                      className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Legal Fee (₦)
                    </label>
                    <input
                      type="text"
                      value={formData.legalFee}
                      onChange={(e) =>
                        handleInputChange("legalFee", e.target.value)
                      }
                      placeholder="e.g. 200,000"
                      className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Agent Fee (₦)
                    </label>
                    <input
                      type="text"
                      value={formData.agentFee}
                      onChange={(e) =>
                        handleInputChange("agentFee", e.target.value)
                      }
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
                ₦
                {(
                  parseInt(formData.price.replace(/,/g, "") || "0") +
                  parseInt(formData.cautionFee.replace(/,/g, "") || "0") +
                  parseInt(formData.legalFee.replace(/,/g, "") || "0") +
                  parseInt(formData.agentFee.replace(/,/g, "") || "0")
                ).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.purpose === "rent"
                  ? "First year payment"
                  : "Purchase price"}
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">
              Features & Amenities
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-heading font-medium mb-4">
                  Infrastructure
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {infrastructureOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.infrastructure.includes(option)}
                        onChange={() =>
                          handleArrayToggle("infrastructure", option)
                        }
                        className="rounded border-input"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-heading font-medium mb-4">
                  Amenities
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenityOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(option)}
                        onChange={() => handleArrayToggle("amenities", option)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-heading font-medium mb-4">
                  Security Features
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {securityOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.security.includes(option)}
                        onChange={() => handleArrayToggle("security", option)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold">
              Images & Documents
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-heading font-medium mb-4">
                  Property Images
                </h4>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">📸</div>
                  <p className="text-lg font-medium mb-2">
                    Upload Property Photos
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload high-quality images of your property. First image
                    will be the cover photo.
                  </p>
                  <RealEstButton variant="tertiary">Choose Files</RealEstButton>
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted formats: JPG, PNG, WebP. Max 10MB per image.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-heading font-medium mb-4">
                  Documents (Optional)
                </h4>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-lg font-medium mb-2">
                    Upload Property Documents
                  </p>
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
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-heading font-bold">
            List Your Property
          </h2>
          <div className="flex items-center gap-2">
            <ProgressRing
              value={(currentStep / totalSteps) * 100}
              size="md"
              color="violet"
              showValue
            />
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-4 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  i + 1 <= currentStep
                    ? "bg-brand-violet text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={cn(
                    "w-12 h-1 mx-2 rounded transition-all",
                    i + 1 < currentStep ? "bg-brand-violet" : "bg-muted",
                  )}
                />
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
              {isLoading ? "Publishing..." : "Publish Listing"}
            </RealEstButton>
          )}
        </div>
      </div>
    </div>
  );
}
