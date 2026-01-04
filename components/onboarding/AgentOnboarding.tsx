// Create AgentOnboarding component with glassmorphism styling and consolidated logic

"use client";

import React, { useState } from "react";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { useLocationSearch, formatLocationName } from "@/lib/hooks/useLocationSearch";
import { validateNigerianPhoneDetailed } from "@/lib/utils/phoneUtils";
import { ProfileUpload } from "@/components/realest/ProfileUpload";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Home,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  MapPin,
  Building2,
  Shield,
  CheckCircle as CheckIcon,
} from "lucide-react";

const AgentOnboarding: React.FC = () => {
  const {
    currentStep,
    isLoading,
    error,
    success,
    formData,
    updateFormData,
    handleNext,
    handleBack,
    handleSubmit,
  } = useOnboarding({ userType: "agent" });

  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Location search hook
  const locationSearch = useLocationSearch({
    debounceMs: 300,
    maxResults: 8,
    includeStates: true,
    includePopularCities: true,
  });

  // Agent specializations
  const SPECIALIZATIONS = [
    "Residential Sales",
    "Residential Rentals",
    "Commercial Properties",
    "Land & Development",
    "Luxury Properties",
    "Investment Properties",
    "Property Management",
  ];

  // Handle phone validation
  const handlePhoneChange = (value: string) => {
    updateFormData("phone", value);
    const validation = validateNigerianPhoneDetailed(value);
    setPhoneError(validation.isValid ? null : validation.error || null);
  };

  // Handle specialization toggle
  const toggleSpecialization = (spec: string) => {
    const current = formData.specializations || [];
    const updated = current.includes(spec)
      ? current.filter(s => s !== spec)
      : [...current, spec];
    updateFormData("specializations", updated);
  };

  // Handle location selection
  const handleLocationSelect = (location: any) => {
    locationSearch.selectLocation(location);
    updateFormData("location", location.name);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="backdrop-blur-3xl border border-border/50 rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Welcome to RealEST!</h1>
          <p className="text-muted-foreground mb-8">
            Your agent profile is complete. Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {[1, 2].map((step, index) => (
              <React.Fragment key={step}>
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                  ${step <= currentStep ? 'bg-linear-to-tl from-primary/20 to-accent/20 shadow-lg shadow-accent/30 scale-105' : ''}
                  ${step < currentStep ? 'bg-success' : ''}
                  ${step > currentStep ? 'bg-muted border border-border/50' : ''}
                `}>
                  {step < currentStep ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <span className={`text-sm font-medium ${step <= currentStep ? 'text-accent/80' : 'text-muted-foreground'}`}>
                      {step}
                    </span>
                  )}
                </div>
                {index < 1 && (
                  <div className={`w-12 h-0.5 mx-2 transition-all duration-500 ease-out ${
                    step < currentStep ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-1">
              {currentStep === 1 ? "Basic Information" : "Professional Details"}
            </h2>
            <p className="text-muted-foreground">
              {currentStep === 1 ? "Tell us about yourself" : "Complete your agent profile"}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="backdrop-blur-3xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-secondary/20 pointer-events-none" />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent pointer-events-none" />

          <div className="relative p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-400">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-tr from-accent/20 to-primary/20 rounded-md mb-1">
                    <Mail className="w-7 h-7 text-accent/80" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold bg-linear-to-l from-primary to-accent bg-clip-text text-transparent">
                    Join RealEST as an Agent
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Start your journey as a verified real estate professional
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Profile Photo */}
                  <div className="text-center">
                    <ProfileUpload
                      size="xl"
                      onUploadSuccess={(url) => updateFormData("profilePhotoUrl", url)}
                      onUploadError={(err) => console.error("Upload error:", err)}
                      className="mx-auto mb-4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload a professional photo to build trust with clients
                    </p>
                  </div>

                  {/* Form Fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => updateFormData("fullName", e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 bg-surface border rounded-lg transition-all duration-200 focus:ring-2 focus:outline-none focus:border-primary/50 focus:ring-primary/20"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2.5 bg-surface border rounded-lg transition-all duration-200 focus:ring-2 focus:outline-none focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className={`w-full px-4 py-2.5 bg-surface border rounded-lg transition-all duration-200 focus:ring-2 focus:outline-none ${
                        phoneError ? 'border-red-500 focus:ring-red-200/50' : 'focus:border-primary/50 focus:ring-primary/20'
                      }`}
                    />
                    {phoneError && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {phoneError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">
                      Location <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={locationSearch.query}
                        onChange={(e) => {
                          locationSearch.setQuery(e.target.value);
                          updateFormData("location", e.target.value);
                        }}
                        placeholder="e.g., Lagos, Abuja, Port Harcourt"
                        className="w-full px-4 py-2.5 pr-10 bg-surface border border-border/50 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent/50 focus:outline-none transition-all duration-200"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

                      {/* Location Dropdown */}
                      {(locationSearch.results.length > 0 || (locationSearch.query && locationSearch.query.length < 3 && locationSearch.popularLocations.length > 0)) && (
                        <div className="absolute top-full left-0 right-0 bg-surface border border-border/50 rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
                          {locationSearch.results.length > 0 ? (
                            locationSearch.results.map((location) => (
                              <button
                                key={location.id}
                                onClick={() => handleLocationSelect(location)}
                                className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors duration-150 flex items-center gap-2.5"
                              >
                                {location.type === 'city' ? <Building2 className="w-4 h-4 text-muted-foreground" /> : <MapPin className="w-4 h-4 text-muted-foreground" />}
                                <span className="text-sm text-foreground">{formatLocationName(location)}</span>
                              </button>
                            ))
                          ) : (
                            <>
                              <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border/30">
                                Popular locations
                              </div>
                              {locationSearch.popularLocations.map((location) => (
                                <button
                                  key={location.id}
                                  onClick={() => handleLocationSelect(location)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors duration-150 flex items-center gap-2.5"
                                >
                                  <Building2 className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-foreground">{formatLocationName(location)}</span>
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">
                      Professional Bio <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => updateFormData("bio", e.target.value)}
                      placeholder="Tell clients about your experience and expertise..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-surface border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:outline-none transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-400">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-accent/20 to-primary/20 rounded-md mb-1">
                    <Home className="w-7 h-7 text-accent/80" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-accent to-primary bg-clip-text text-transparent mb-1">
                    Professional Credentials
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Verify your expertise and get started
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground">
                        License Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.licenseNumber || ""}
                        onChange={(e) => updateFormData("licenseNumber", e.target.value)}
                        placeholder="e.g., LICENSE-12345"
                        className="w-full px-4 py-2.5 bg-surface border rounded-lg transition-all duration-200 focus:ring-2 focus:outline-none focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground">
                        Agency Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.agencyName || ""}
                        onChange={(e) => updateFormData("agencyName", e.target.value)}
                        placeholder="Your real estate agency"
                        className="w-full px-4 py-2.5 bg-surface border rounded-lg transition-all duration-200 focus:ring-2 focus:outline-none focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">
                      WhatsApp Number <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp || ""}
                      onChange={(e) => updateFormData("whatsapp", e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-4 py-2.5 bg-surface border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:outline-none transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground mb-4">
                      Select Your Specializations <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {SPECIALIZATIONS.map((spec) => {
                        const isSelected = (formData.specializations || []).includes(spec);
                        return (
                          <button
                            key={spec}
                            onClick={() => toggleSpecialization(spec)}
                            className={`
                              p-4 rounded-xl hover:border-primary/30 hover:bg-primary/15 transition-all duration-200 text-left
                              ${isSelected ? 'border-accent/30 border bg-linear-to-br from-primary/15 to-accent/15 shadow-md scale-[1.02]' : 'border-accent/10 border bg-surface'}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`
                                w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                                ${isSelected ? 'bg-linear-to-br from-primary/30 to-accent/30' : 'bg-muted border border-border/30'}
                              `}>
                                <Home className={`w-5 h-5 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-sm font-semibold text-foreground truncate">{spec}</h4>
                                  {isSelected && <CheckIcon className="w-4.5 h-4.5 text-accent shrink-0" />}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms || false}
                        onChange={(e) => updateFormData("agreeTerms", e.target.checked)}
                        className="w-4 h-4 rounded border-muted-foreground mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium">I agree to RealEST Agent Terms</div>
                        <div className="text-xs text-muted-foreground">
                          I certify that I am a licensed real estate professional and agree to maintain professional standards
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-linear-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-semibold text-sm text-foreground">What you'll get:</p>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          Verified agent badge on your profile
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                          Access to premium client leads
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
                          Professional dashboard and analytics
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-border/30 px-6 sm:px-8 py-4 bg-surface/30 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row w-full gap-3">
              <div className={`flex ${currentStep === 1 ? 'w-full' : 'w-full sm:w-auto sm:flex-1 justify-between'} gap-3`}>
                {currentStep > 1 && (
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    size="lg"
                    className="flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                    Back
                  </Button>
                )}
                {currentStep === 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !!phoneError}
                    variant="default"
                    size="lg"
                    className="flex w-full items-center justify-center gap-2 btn-glow-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-muted disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight className="w-4.5 h-4.5" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !(formData.specializations || []).length || !formData.agreeTerms}
                    variant="default"
                    size="lg"
                    className="flex-1 w-full items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-muted"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Completing Setup...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <CheckCircle className="w-4.5 h-4.5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentOnboarding;
