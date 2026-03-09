"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { RealEstButton } from "@/components/heroui/RealEstButton";

interface AdvancedSearchFormProps {
  onSearch?: (filters: any) => void;
  onSaveSearch?: (filters: any) => void;
  initialFilters?: any;
  className?: string;
}

export function AdvancedSearchForm({
  onSearch,
  onSaveSearch,
  initialFilters,
  className,
}: AdvancedSearchFormProps) {
  const [filters, setFilters] = useState({
    // Location
    state: "",
    lga: "",
    area: "",
    radius: 5, // km

    // Property Type
    propertyType: [],
    purpose: "any", // any, rent, sale

    // Price Range
    minPrice: "",
    maxPrice: "",
    currency: "NGN",

    // Property Details
    minBedrooms: "",
    maxBedrooms: "",
    minBathrooms: "",
    maxBathrooms: "",
    minSize: "",
    maxSize: "",

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
    sortBy: "relevance",
    verifiedOnly: true,
    availableOnly: true,

    ...initialFilters,
  });

  const [isExpanded, setIsExpanded] = useState(false);

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

  const mustHaveFeatures = [
    "Swimming Pool",
    "Gym",
    "Generator",
    "Parking Space",
    "Air Conditioning",
    "Furnished",
    "Security Post",
    "CCTV",
    "Elevator",
    "Balcony",
    "Garden",
    "Playground",
  ];

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [field]: (prev as any)[field].includes(value)
        ? (prev as any)[field].filter((item: string) => item !== value)
        : [...(prev as any)[field], value],
    }));
  };

  const handleSearch = () => {
    onSearch?.(filters);
  };

  const handleSaveSearch = () => {
    onSaveSearch?.(filters);
  };

  const clearFilters = () => {
    setFilters({
      state: "",
      lga: "",
      area: "",
      radius: 5,
      propertyType: [],
      purpose: "any",
      minPrice: "",
      maxPrice: "",
      currency: "NGN",
      minBedrooms: "",
      maxBedrooms: "",
      minBathrooms: "",
      maxBathrooms: "",
      minSize: "",
      maxSize: "",
      mustHave: [],
      niceToHave: [],
      hasBQ: false,
      hasNEPA: false,
      hasWater: false,
      isGated: false,
      hasGoodRoads: false,
      sortBy: "relevance",
      verifiedOnly: true,
      availableOnly: true,
    });
  };

  return (
    <div
      className={cn("bg-card border border-border rounded-xl p-6", className)}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-heading font-bold">Advanced Search</h3>
        <RealEstButton
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Hide" : "Show"} Filters
        </RealEstButton>
      </div>

      {/* Quick Filters - Always Visible */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange("state", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select State</option>
              {nigerianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Property Type
            </label>
            <select
              value={filters.propertyType[0] || ""}
              onChange={(e) =>
                handleFilterChange(
                  "propertyType",
                  e.target.value ? [e.target.value] : [],
                )
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Any Type</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Purpose</label>
            <select
              value={filters.purpose}
              onChange={(e) => handleFilterChange("purpose", e.target.value)}
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
            <label className="block text-sm font-medium mb-2">
              Min Price (₦)
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Max Price (₦)
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
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
            <h4 className="font-heading font-semibold mb-4">
              Property Details
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Min Bedrooms
                </label>
                <input
                  type="number"
                  value={filters.minBedrooms}
                  onChange={(e) =>
                    handleFilterChange("minBedrooms", e.target.value)
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Bedrooms
                </label>
                <input
                  type="number"
                  value={filters.maxBedrooms}
                  onChange={(e) =>
                    handleFilterChange("maxBedrooms", e.target.value)
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Min Bathrooms
                </label>
                <input
                  type="number"
                  value={filters.minBathrooms}
                  onChange={(e) =>
                    handleFilterChange("minBathrooms", e.target.value)
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Bathrooms
                </label>
                <input
                  type="number"
                  value={filters.maxBathrooms}
                  onChange={(e) =>
                    handleFilterChange("maxBathrooms", e.target.value)
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Nigerian Infrastructure */}
          <div>
            <h4 className="font-heading font-semibold mb-4">
              Infrastructure & Utilities
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: "hasNEPA", label: "NEPA/Power Supply" },
                { key: "hasWater", label: "Water Supply" },
                { key: "hasGoodRoads", label: "Good Road Network" },
                { key: "isGated", label: "Gated Community" },
                { key: "hasBQ", label: "Has Boys Quarters" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center space-x-2 cursor-pointer"
                >
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
            <h4 className="font-heading font-semibold mb-4">
              Must Have Features
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {mustHaveFeatures.map((feature) => (
                <label
                  key={feature}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.mustHave.includes(feature)}
                    onChange={() => handleArrayToggle("mustHave", feature)}
                    className="rounded border-border focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search Preferences */}
          <div>
            <h4 className="font-heading font-semibold mb-4">
              Search Preferences
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
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
                    onChange={(e) =>
                      handleFilterChange("verifiedOnly", e.target.checked)
                    }
                    className="rounded border-border focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm">Verified Only</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.availableOnly}
                    onChange={(e) =>
                      handleFilterChange("availableOnly", e.target.checked)
                    }
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
        <RealEstButton onClick={handleSearch} className="flex-1" size="lg">
          Search Properties
        </RealEstButton>
        <RealEstButton variant="tertiary" onClick={handleSaveSearch} size="lg">
          Save Search
        </RealEstButton>
        <RealEstButton variant="ghost" onClick={clearFilters} size="lg">
          Clear All
        </RealEstButton>
      </div>
    </div>
  );
}
