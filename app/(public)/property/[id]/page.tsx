"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Chip,
  Avatar,
} from "@heroui/react";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Textarea,
} from '@/components/ui'
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
} from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { PropertyMap } from "@/components/property/PropertyMap";

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
  property_details: {
    bedrooms: number | null;
    bathrooms: number | null;
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
  owner?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    user_type?: string;
  };
  agent?: {
    id: string;
    license_number: string;
    agency_name: string;
    specialization: string[];
    verified: boolean;
    rating: number | null;
    agent_profile?: {
      id: string;
      full_name: string;
      email: string;
      phone: string | null;
      avatar_url: string | null;
    };
  };
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      const supabase = createClient();


      const { data } = await supabase
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
          ),
          agent:agents!properties_agent_id_fkey (
            id,
            license_number,
            agency_name,
            specialization,
            verified,
            rating,
            agent_profile:profiles!agents_profile_id_fkey (
              id,
              full_name,
              email,
              phone,
              avatar_url
            )
          )
        `,
        )
        .eq("id", propertyId)
        .eq("status", "active")
        .single();

      if (data) {
        setProperty(data as Property);
      }
      setIsLoading(false);
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("inquiries").insert({
        property_id: propertyId,
        user_email: inquiryForm.email,
        user_name: inquiryForm.name,
        user_phone: inquiryForm.phone,
        message: inquiryForm.message,
      });

      if (!error) {
        setInquirySent(true);
        setInquiryForm({ name: "", email: "", phone: "", message: "" });
      }
    } catch (err) {
      console.error("Error sending inquiry:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-96 bg-muted rounded-lg" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-8 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-32 bg-muted rounded" />
                </div>
                <div className="h-96 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The property you're looking for doesn't exist or has been removed.
              </p>
              <Button variant="default">
                <Link href="/">Back to Homepage</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  const primaryImage = property.property_media.find(
    (media) => media.is_primary,
  );
  const galleryImages = property.property_media.filter(
    (media) => media.media_type === "image",
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden mb-4">
            <img
              src={
                galleryImages[selectedImage]?.file_url ||
                primaryImage?.file_url ||
                "/placeholder.jpg"
              }
              alt={property.title}
              className="w-full h-full object-cover"
            />
            {property.verification_status === "verified" && (
              <div className="absolute top-4 left-4">
                <Chip
                  color="success"
                  variant="primary"
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Vetted Property
                </Chip>
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="secondary" size="sm">
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {galleryImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent"
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
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {property.address}, {property.city}
                      {property.state && `, ${property.state}`}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <Chip variant="secondary">
                      {property.property_type.replace("_", " ")}
                    </Chip>
                    <Chip variant="secondary">For {property.listing_type}</Chip>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary mb-1">
                    £{property.price.toLocaleString()}
                  </div>
                  {property.listing_type === "rent" && (
                    <div className="text-sm text-muted-foreground">
                      per month
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.property_details?.bedrooms && (
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {property.property_details.bedrooms}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Bedrooms
                        </div>
                      </div>
                    </div>
                  )}
                  {property.property_details?.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {property.property_details.bathrooms}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Bathrooms
                        </div>
                      </div>
                    </div>
                  )}
                  {property.property_details?.square_feet && (
                    <div className="flex items-center gap-2">
                      <Ruler className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {property.property_details.square_feet.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Sq Ft
                        </div>
                      </div>
                    </div>
                  )}
                  {property.property_details?.parking_spaces && (
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {property.property_details.parking_spaces}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Parking
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {property.property_details?.year_built && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        Built in {property.property_details.year_built}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {property.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {property.property_details?.amenities &&
              property.property_details.amenities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {property.property_details.amenities.map(
                        (amenity, index) => (
                          <Chip key={index} variant="secondary">
                            {amenity}
                          </Chip>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Property Location Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                {property.latitude && property.longitude ? (
                  <div className="h-64 rounded-lg overflow-hidden">
                    <PropertyMap
                      className="w-full h-full"
                      initialCenter={[property.latitude, property.longitude]}
                      initialZoom={15}
                      showFilters={false}
                      showLegend={false}
                    />
                  </div>
                ) : (
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Location coordinates not available
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Property Owner</CardTitle>
                <CardDescription>
                  Send an inquiry about this property
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inquirySent ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Inquiry Sent!</h3>
                    <p className="text-sm text-muted-foreground">
                      The property owner will get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Your Name
                      </label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={inquiryForm.name}
                        onChange={(e) =>
                          setInquiryForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={inquiryForm.email}
                        onChange={(e) =>
                          setInquiryForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Phone (Optional)
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={inquiryForm.phone}
                        onChange={(e) =>
                          setInquiryForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Tell the owner about your interest in this property..."
                        value={inquiryForm.message}
                        onChange={(e) =>
                          setInquiryForm((prev) => ({
                            ...prev,
                            message: e.target.value,
                          }))
                        }
                        required
                        rows={4}
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="default"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Inquiry"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle>Listed by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  {(() => {
                    // Robust lister resolution: agent > owner > fallback
                    let lister = null;
                    let listerType = '';
                    if (property.agent && property.agent.agent_profile) {
                      lister = property.agent.agent_profile;
                      listerType = 'Agent';
                    } else if (property.owner) {
                      lister = property.owner;
                      listerType = property.owner.user_type === 'admin' ? 'Admin' : 'Owner';
                    } else {
                      lister = { full_name: 'Unknown', avatar_url: null };
                      listerType = 'Admin';
                    }
                    return (
                      <>
                        <Avatar.Root size="lg">
                          <Avatar.Image src={lister.avatar_url || undefined} />
                          <Avatar.Fallback>
                            {lister.full_name ? lister.full_name.charAt(0) : "?"}
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <div>
                          <div className="font-medium">{lister.full_name}</div>
                          <div className="text-sm text-muted-foreground">{listerType}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="space-y-2">
                  <Button variant="secondary" className="w-full" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="secondary" className="w-full" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>

                {property.verification_status === "verified" && (
                  <div className="mt-4 p-3 bg-success-50 border border-success-200 rounded-lg">
                    <div className="flex items-center gap-2 text-success-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Verified Property Owner
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Property Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Listed
                    </span>
                    <span className="text-sm">
                      {new Date(property.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Property Type
                    </span>
                    <span className="text-sm">{property.property_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <Chip
                      color={
                        property.verification_status === "verified"
                          ? "success"
                          : property.verification_status === "rejected"
                            ? "danger"
                            : "warning"
                      }
                      variant="secondary"
                    >
                      {property.verification_status}
                    </Chip>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}
