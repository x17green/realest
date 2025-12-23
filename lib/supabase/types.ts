export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          user_type: "owner" | "agent" | "user" | "admin";
          avatar_url: string | null;
          phone: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          user_type: "owner" | "agent" | "user" | "admin";
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          user_type?: "owner" | "agent" | "user" | "admin";
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      owners: {
        Row: {
          id: string;
          profile_id: string;
          business_name: string | null;
          property_types: string[] | null;
          phone: string | null;
          verified: boolean;
          verification_date: string | null;
          years_experience: number | null;
          bio: string | null;
          photo_url: string | null;
          rating: number | null;
          total_properties: number | null;
          whatsapp: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          business_name?: string | null;
          property_types?: string[] | null;
          phone?: string | null;
          verified?: boolean;
          verification_date?: string | null;
          years_experience?: number | null;
          bio?: string | null;
          photo_url?: string | null;
          rating?: number | null;
          total_properties?: number | null;
          whatsapp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          business_name?: string | null;
          property_types?: string[] | null;
          phone?: string | null;
          verified?: boolean;
          verification_date?: string | null;
          years_experience?: number | null;
          bio?: string | null;
          photo_url?: string | null;
          rating?: number | null;
          total_properties?: number | null;
          whatsapp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      agents: {
        Row: {
          id: string;
          profile_id: string;
          license_number: string | null;
          agency_name: string | null;
          specialization: string[] | null;
          phone: string | null;
          verified: boolean;
          verification_date: string | null;
          years_experience: number | null;
          bio: string | null;
          photo_url: string | null;
          rating: number | null;
          total_sales: number | null;
          total_listings: number | null;
          whatsapp: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          license_number?: string | null;
          agency_name?: string | null;
          specialization?: string[] | null;
          phone?: string | null;
          verified?: boolean;
          verification_date?: string | null;
          years_experience?: number | null;
          bio?: string | null;
          photo_url?: string | null;
          rating?: number | null;
          total_sales?: number | null;
          total_listings?: number | null;
          whatsapp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          license_number?: string | null;
          agency_name?: string | null;
          specialization?: string[] | null;
          phone?: string | null;
          verified?: boolean;
          verification_date?: string | null;
          years_experience?: number | null;
          bio?: string | null;
          photo_url?: string | null;
          rating?: number | null;
          total_sales?: number | null;
          total_listings?: number | null;
          whatsapp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      kyc_requests: {
        Row: {
          id: string;
          user_id: string;
          user_type: "agent" | "owner";
          status: "pending" | "approved" | "rejected";
          kyc_provider: string;
          kyc_reference_id: string | null;
          documents: Json | null;
          submitted_at: string;
          approved_at: string | null;
          rejected_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_type: "agent" | "owner";
          status?: "pending" | "approved" | "rejected";
          kyc_provider: string;
          kyc_reference_id?: string | null;
          documents?: Json | null;
          submitted_at?: string;
          approved_at?: string | null;
          rejected_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_type?: "agent" | "owner";
          status?: "pending" | "approved" | "rejected";
          kyc_provider?: string;
          kyc_reference_id?: string | null;
          documents?: Json | null;
          submitted_at?: string;
          approved_at?: string | null;
          rejected_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
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
          status: "draft" | "active" | "inactive" | "sold" | "rented";
          verification_status: "pending" | "verified" | "rejected";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          price: number;
          currency?: string;
          address: string;
          city: string;
          state?: string | null;
          zip_code?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          property_type: string;
          listing_type: "sale" | "rent" | "lease";
          status?: "draft" | "active" | "inactive" | "sold" | "rented";
          verification_status?: "pending" | "verified" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          address?: string;
          city?: string;
          state?: string | null;
          zip_code?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          property_type?: string;
          listing_type?: "sale" | "rent" | "lease";
          status?: "draft" | "active" | "inactive" | "sold" | "rented";
          verification_status?: "pending" | "verified" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
      };
      property_details: {
        Row: {
          id: string;
          property_id: string;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_feet?: number | null;
          lot_size?: number | null;
          year_built?: number | null;
          parking_spaces?: number | null;
          furnished?: boolean | null;
          pets_allowed?: boolean | null;
          amenities?: string[] | null;
          utilities_included?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_feet?: number | null;
          lot_size?: number | null;
          year_built?: number | null;
          parking_spaces?: number | null;
          furnished?: boolean | null;
          pets_allowed?: boolean | null;
          amenities?: string[] | null;
          utilities_included?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      property_documents: {
        Row: {
          id: string;
          property_id: string;
          document_type: string;
          file_url: string;
          file_name: string;
          ml_validation_status: "pending" | "passed" | "failed";
          admin_vetting_status: "pending" | "approved" | "rejected";
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          document_type: string;
          file_url: string;
          file_name: string;
          ml_validation_status?: "pending" | "passed" | "failed";
          admin_vetting_status?: "pending" | "approved" | "rejected";
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          document_type?: string;
          file_url?: string;
          file_name?: string;
          ml_validation_status?: "pending" | "passed" | "failed";
          admin_vetting_status?: "pending" | "approved" | "rejected";
          uploaded_at?: string;
        };
      };
      property_media: {
        Row: {
          id: string;
          property_id: string;
          media_type: "image" | "video" | "virtual_tour";
          file_url: string;
          file_name: string;
          is_primary: boolean;
          sort_order: number;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          media_type: "image" | "video" | "virtual_tour";
          file_url: string;
          file_name: string;
          is_primary?: boolean;
          sort_order?: number;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          media_type?: "image" | "video" | "virtual_tour";
          file_url?: string;
          file_name?: string;
          is_primary?: boolean;
          sort_order?: number;
          uploaded_at?: string;
        };
      };
      inquiries: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          message: string;
          status: "pending" | "responded" | "closed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          user_id: string;
          message: string;
          status?: "pending" | "responded" | "closed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          user_id?: string;
          message?: string;
          status?: "pending" | "responded" | "closed";
          created_at?: string;
          updated_at?: string;
        };
      };
      waitlist: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string | null;
          phone: string | null;
          source: string;
          status: "active" | "unsubscribed" | "bounced";
          interests: string[] | null;
          location_preference: string | null;
          property_type_preference: string | null;
          budget_range: string | null;
          subscribed_at: string;
          unsubscribed_at: string | null;
          last_contacted_at: string | null;
          contact_count: number;
          referrer_url: string | null;
          user_agent: string | null;
          ip_address: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name?: string | null;
          phone?: string | null;
          source?: string;
          status?: "active" | "unsubscribed" | "bounced";
          interests?: string[] | null;
          location_preference?: string | null;
          property_type_preference?: string | null;
          budget_range?: string | null;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          last_contacted_at?: string | null;
          contact_count?: number;
          referrer_url?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string | null;
          phone?: string | null;
          source?: string;
          status?: "active" | "unsubscribed" | "bounced";
          interests?: string[] | null;
          location_preference?: string | null;
          property_type_preference?: string | null;
          budget_range?: string | null;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          last_contacted_at?: string | null;
          contact_count?: number;
          referrer_url?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_properties: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_id?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type:
            | "inquiry_received"
            | "property_status_changed"
            | "property_approved"
            | "property_rejected"
            | "duplicate_detected"
            | "system_message";
          title: string;
          message: string;
          data: Json | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type:
            | "inquiry_received"
            | "property_status_changed"
            | "property_approved"
            | "property_rejected"
            | "duplicate_detected"
            | "system_message";
          title: string;
          message: string;
          data?: Json | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?:
            | "inquiry_received"
            | "property_status_changed"
            | "property_approved"
            | "property_rejected"
            | "duplicate_detected"
            | "system_message";
          title?: string;
          message?: string;
          data?: Json | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          property_id: string;
          reviewer_id: string;
          target_type: "property" | "agent" | "owner";
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          reviewer_id: string;
          target_type: "property" | "agent" | "owner";
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          reviewer_id?: string;
          target_type?: "property" | "agent" | "owner";
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          property_id: string | null;
          amount: number;
          currency: string;
          type: "listing_fee" | "premium_feature";
          status: "pending" | "completed" | "failed";
          transaction_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id?: string | null;
          amount: number;
          currency?: string;
          type: "listing_fee" | "premium_feature";
          status?: "pending" | "completed" | "failed";
          transaction_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_id?: string | null;
          amount?: number;
          currency?: string;
          type?: "listing_fee" | "premium_feature";
          status?: "pending" | "completed" | "failed";
          transaction_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      active_waitlist: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string | null;
          source: string;
          location_preference: string | null;
          property_type_preference: string | null;
          interests: string[] | null;
          subscribed_at: string;
          created_at: string;
        };
      };
    };
    Functions: {
      unsubscribe_from_waitlist: {
        Args: {
          user_email: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Zod schemas for validation
import { z } from 'zod'

export const propertyListingSchema = z.object({
  property_type: z.enum(['house', 'apartment', 'land', 'commercial', 'event_center', 'hotel', 'shop', 'office']),
  title: z.string().min(10).max(100),
  description: z.string().min(50).max(2000),
  address: z.string().min(10),
  state: z.string().length(2),
  lga: z.string().min(3),
  landmark: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  price: z.number().min(1000),
  price_frequency: z.enum(['sale', 'annual', 'monthly', 'nightly']),
  bedrooms: z.number().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  size_sqm: z.number().min(1).optional(),
  has_bq: z.boolean().default(false),
  nepa_status: z.enum(['stable', 'intermittent', 'poor', 'none', 'generator_only']),
  water_source: z.enum(['borehole', 'public_water', 'well', 'water_vendor', 'none']),
  internet_type: z.enum(['fiber', 'starlink', '4g', '3g', 'none']),
  security_type: z.array(z.enum(['gated_community', 'security_post', 'cctv', 'perimeter_fence', 'security_dogs', 'none'])),
  is_duplicate: z.boolean().optional()
})

export type PropertyListingInput = z.infer<typeof propertyListingSchema>
