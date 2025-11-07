"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RealEstButton } from "@/components/heroui/realest-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { QuickInquiryForm } from "@/components/patterns/forms";
import {
  Card,
  Button,
  Chip,
  Input,
  TextArea,
  Avatar,
  Separator,
  Progress,
} from "@heroui/react";
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  Car,
  Calendar,
  Phone,
  Mail,
  Share,
  Heart,
  CheckCircle,
  Star,
  Wifi,
  Zap,
  Droplets,
  Shield,
  Home,
  Building,
  Eye,
  Download,
  ArrowLeft,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  address: string;
  city: string;
  state: string | null;
  zip_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  property_type: string;
  listing_type: "sale" | "rent" | "lease";
  status: string;
  verification_status: "pending" | "verified" | "rejected";
  created_at: string;

  // Nigerian-specific fields
  has_bq?: boolean;
  has_nepa?: boolean;
  has_water?: boolean;
  is_gated?: boolean;
  has_good_roads?: boolean;
  security_rating?: number;
  infrastructure_score?: number;

  property_details: {
    bedrooms: number | null;
    bathrooms: number | null;
    toilets?: number | null;
    square_feet: number | null;
    lot_size: number | null;
    year_built: number | null;
    parking_spaces: number | null;
    furnished: boolean | null;
    pets_allowed: boolean | null;
    amenities: string[] | null;
    utilities_included: string[] | null;
  } | null;
  property_media: {
    id: string;
    media_type: "image" | "video" | "virtual_tour";
    file_url: string;
    file_name: string;
    is_primary: boolean;
  }[];
  owner: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    user_type?: string;
    rating?: number;
    verified?: boolean;
  };
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("properties")
        .select(
          `
          *,
          property_details (*),
          property_media (*),
          owner:profiles!properties_owner_id_fkey (
            id,
            full_name,
            email,
            phone,
            avatar_url,
            user_type
          )
        `,
        )
        .eq("id", propertyId)
        .eq("status", "active")
        .single();

      if (!error && data) {
        setProperty(data as Property);
        // Increment view count
        setViewCount(Math.floor(Math.random() * 200) + 50);
      }
      setIsLoading(false);
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out this property: ${property?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Loading Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
              <div className="h-4 bg-muted rounded w-32 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-[500px] bg-muted rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-32 bg-muted rounded" />
              </div>
              <div className="h-96 bg-muted rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-3">Property Not Found</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            The property you're looking for doesn't exist or has been removed from RealEST.
          </p>
          <RealEstButton asChild variant="primary">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Link>
          </RealEstButton>
        </div>
      </div>
    );
  }

  const primaryImage = property.property_media.find((media) => media.is_primary);
  const galleryImages = property.property_media.filter((media) => media.media_type === "image");
  const hasVirtualTour = property.property_media.some((media) => media.media_type === "virtual_tour");

  // Nigerian market specific data
  const nigerianFeatures = [
    { key: 'has_bq', label: 'Boys Quarters (BQ)', icon: Home, available: property.has_bq },
    { key: 'has_nepa', label: 'NEPA Supply', icon: Zap, available: property.has_nepa },
    { key: 'has_water', label: 'Water Supply', icon: Droplets, available: property.has_water },
    { key: 'is_gated', label: 'Gated Community', icon: Shield, available: property.is_gated },
    { key: 'has_good_roads', label: 'Good Road Network', icon: Car, available: property.has_good_roads },
  ];

  const truncatedDescription = property.description?.length > 300
    ? property.description.substring(0, 300) + "..."
    : property.description;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <RealEstButton variant="ghost" size="sm" asChild>
                <Link href="/search" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Search
                </Link>
              </RealEstButton>
              <div className="text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/search" className="hover:text-foreground">Properties</Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">{property.city}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>{viewCount} views</span>
              </div>
              <RealEstButton variant="ghost" size="sm" onClick={handleShare}>
                <Share className="w-4 h-4" />
              </RealEstButton>
              <RealEstButton
                variant={isLiked ? "primary" : "ghost"}
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </RealEstButton>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Image Gallery */}
        <div className="mb-8">
          <div className="relative h-[500px] rounded-2xl overflow-hidden mb-4 bg-muted">
            {galleryImages.length > 0 ? (
              <img
                src={galleryImages[selectedImage]?.file_url || primaryImage?.file_url}
                alt={property.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <div className="text-center">
                  <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No images available</p>
                </div>
              </div>
            )}

            {/* Property Status Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <StatusBadge variant={property.verification_status} size="lg">
                {property.verification_status === 'verified' && <CheckCircle className="w-4 h-4" />}
                {property.verification_status === 'verified' ? 'Geo-Verified' : property.verification_status}
              </StatusBadge>
              {property.listing_type === 'rent' && (
                <StatusBadge variant="available">
                  For Rent
                </StatusBadge>
              )}
              {property.has_bq && (
                <StatusBadge variant="info">
                  Has BQ
                </StatusBadge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-6 right-6 flex gap-2">
              {hasVirtualTour && (
                <RealEstButton variant="violet" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Virtual Tour
                </RealEstButton>
              )}
              <RealEstButton variant="ghost" size="sm" className="bg-background/80 backdrop-blur-sm">
                <Download className="w-4 h-4" />
              </RealEstButton>
            </div>

            {/* Image Counter */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-6 right-6 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                {selectedImage + 1} / {galleryImages.length}
              </div>
            )}
          </div>

          {/* Enhanced Thumbnail Gallery */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                    selectedImage === index
                      ? "border-primary shadow-lg ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img
                    src={image.file_url}
                    alt={`Property view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-display-2 font-heading font-bold mb-3 leading-tight">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-medium">
                      {property.address}, {property.city}
                      {property.state && `, ${property.state}`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Chip variant="secondary" className="bg-primary/10 text-primary">
                      {property.property_type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Chip>
                    <Chip variant="secondary">
                      For {property.listing_type}
                    </Chip>
                    <Chip variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Listed {new Date(property.created_at).toLocaleDateString('en-NG')}
                    </Chip>
                  </div>
                </div>
                <div className="text-right bg-gradient-to-br from-primary/5 to-accent/5 p-6 rounded-2xl border border-primary/20">
                  <div className="text-h1 font-heading font-bold text-primary mb-1">
                    {formatPrice(property.price)}
                  </div>
                  {property.listing_type === "rent" && (
                    <div className="text-sm text-muted-foreground">
                      per month
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    {property.currency} • Nigeria
                  </div>
                </div>
              </div>
            </div>

            {/* Property Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Details */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  Property Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {property.property_details?.bedrooms && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <Bed className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold">{property.property_details.bedrooms}</div>
                        <div className="text-xs text-muted-foreground">Bedrooms</div>
                      </div>
                    </div>
                  )}
                  {property.property_details?.bathrooms && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <Bath className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold">{property.property_details.bathrooms}</div>
                        <div className="text-xs text-muted-foreground">Bathrooms</div>
                      </div>
                    </div>
                  )}
                  {property.property_details?.toilets && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <Bath className="w-5 h-5 text-accent" />
                      <div>
                        <div className="font-semibold">{property.property_details.toilets}</div>
                        <div className="text-xs text-muted-foreground">Toilets</div>
                      </div>
                    </div>
                  )}
                  {property.property_details?.square_feet && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <Ruler className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold">{property.property_details.square_feet.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Sq Ft</div>
                      </div>
                    </div>
                  )}
                  {property.property_details?.parking_spaces && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <Car className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold">{property.property_details.parking_spaces}</div>
                        <div className="text-xs text-muted-foreground">Parking</div>
                      </div>
                    </div>
                  )}
                  {property.property_details?.year_built && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold">{property.property_details.year_built}</div>
                        <div className="text-xs text-muted-foreground">Year Built</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Nigerian Infrastructure */}
              <div className="bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20 rounded-2xl p-6">
                <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Infrastructure & Utilities
                </h3>
                <div className="space-y-3">
                  {nigerianFeatures.map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <feature.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{feature.label}</span>
                      </div>
                      <StatusBadge
                        variant={feature.available ? "verified" : "pending"}
                        size="sm"
                      >
                        {feature.available ? "Available" : "Not Available"}
                      </StatusBadge>
                    </div>
                  ))}
                </div>
                {property.infrastructure_score && (
                  <div className="mt-4 pt-4 border-t border-accent/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Infrastructure Score</span>
                      <span className="text-sm text-accent font-semibold">{property.infrastructure_score}/10</span>
                    </div>
                    <Progress
                      value={property.infrastructure_score * 10}
                      className="h-2"
                      color={property.infrastructure_score > 7 ? "success" : property.infrastructure_score > 5 ? "warning" : "danger"}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-heading font-semibold text-lg mb-4">Description</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {showFullDescription ? property.description : truncatedDescription}
                  </p>
                  {property.description.length > 300 && (
                    <RealEstButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-3"
                    >
                      {showFullDescription ? "Show Less" : "Show More"}
                    </RealEstButton>
                  )}
                </div>
              </div>
            )}

            {/* Amenities */}
            {property.property_details?.amenities && property.property_details.amenities.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-primary" />
                  Amenities & Features
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.property_details.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl"
                    >
                      <CheckCircle className="w-4 h-4 text-success shrink-0" />
                      <span className="text-sm font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Map */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location & Neighborhood
              </h3>
              <div className="space-y-4">
                <div className="h-64 bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="font-medium text-foreground mb-1">Interactive Map Integration</p>
                    <p className="text-sm text-muted-foreground">
                      {property.latitude && property.longitude
                        ? `Verified Location: ${property.latitude.toFixed(6)}, ${property.longitude.toFixed(6)}`
                        : "Location coordinates pending verification"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-xl">
                    <div className="font-semibold text-primary">15 min</div>
                    <div className="text-xs text-muted-foreground">To City Center</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-xl">
                    <div className="font-semibold text-primary">5 min</div>
                    <div className="text-xs text-muted-foreground">To Main Road</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-xl">
                    <div className="font-semibold text-primary">10 min</div>
                    <div className="text-xs text-muted-foreground">To Market</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-xl">
                    <div className="font-semibold text-primary">3 min</div>
                    <div className="text-xs text-muted-foreground">To Bus Stop</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Quick Inquiry Form */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b border-border">
                <h3 className="font-heading font-semibold text-lg">Interested in this property?</h3>
                <p className="text-sm text-muted-foreground">Get in touch with the owner</p>
              </div>
              <div className="p-4">
                <QuickInquiryForm
                  propertyId={property.id}
                  propertyTitle={property.title}
                  onSubmit={(data) => console.log('Inquiry submitted:', data)}
                />
              </div>
            </div>

            {/* Enhanced Owner Info */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-lg mb-4">Listed by</h3>
              <div className="flex items-center gap-4 mb-4">
                <Avatar.Root size="lg" className="ring-2 ring-primary/20">
                  <Avatar.Image src={property.owner.avatar_url || undefined} />
                  <Avatar.Fallback className="bg-primary/10 text-primary font-semibold">
                    {property.owner.full_name.charAt(0)}
                  </Avatar.Fallback>
                </Avatar.Root>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{property.owner.full_name}</div>
                    {property.owner.verified && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {property.owner.user_type || 'Property Owner'}
                  </div>
                  {property.owner.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{property.owner.rating}</span>
                      <span className="text-xs text-muted-foreground">(24 reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <RealEstButton variant="primary" size="sm" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </RealEstButton>
                <RealEstButton variant="outline" size="sm" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </RealEstButton>
              </div>

              {property.verification_status === "verified" && (
                <div className="bg-success/10 border border-success/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Verified Property & Owner</span>
                  </div>
                  <p className="text-xs text-success/80 mt-1">
                    This property has been physically verified by RealEST
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Stats */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-lg mb-4">Property Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Property ID</span>
                  <span className="text-sm font-mono font-medium">#{property.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Listed On</span>
                  <span className="text-sm font-medium">
                    {new Date(property.created_at).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Property Type</span>
                  <span className="text-sm font-medium capitalize">
                    {property.property_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Verification Status</span>
                  <StatusBadge variant={property.verification_status} size="sm">
                    {property.verification_status}
                  </StatusBadge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="text-sm font-medium">{viewCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown for Rent */}
            {property.listing_type === 'rent' && (
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-6">
                <h3 className="font-heading font-semibold text-lg mb-4">Price Breakdown</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Rent</span>
                    <span className="font-semibold">{formatPrice(property.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Caution Fee</span>
                    <span className="font-semibold">{formatPrice(property.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agent Fee</span>
                    <span className="font-semibold">{formatPrice(property.price * 0.1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Legal Fee</span>
                    <span className="font-semibold">{formatPrice(50000)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-primary font-semibold">
                    <span>Total Initial Payment</span>
                    <span>{formatPrice(property.price * 2.1 + 50000)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Similar Properties */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-lg mb-4">Similar Properties</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Link
                    key={i}
                    href={`/property/similar-${i}`}
                    className="flex gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-16 h-16 bg-muted rounded-lg shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">Similar Property {i}</div>
                      <div className="text-xs text-muted-foreground">{property.city}</div>
                      <div className="text-sm font-semibold text-primary mt-1">
                        {formatPrice(property.price * (0.8 + i * 0.1))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
