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
      /**
       * Lightweight auth mirror — no role column.
       * Role lives in public.users.role (UserRole enum).
       */
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          bio: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      /** Role source-of-truth; mirrors auth.users */
      users: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: "user" | "agent" | "owner" | "admin";
          is_active: boolean;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          phone?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "agent" | "owner" | "admin";
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "agent" | "owner" | "admin";
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
      };
      owners: {
        Row: {
          id: string;
          profile_id: string;
          business_name: string | null;
          /** NOT NULL array (empty array by default is fine) */
          property_types: string[];
          phone: string | null;
          verified: boolean | null;
          verification_date: string | null;
          years_experience: number | null;
          bio: string | null;
          photo_url: string | null;
          rating: number | null;
          total_properties: number | null;
          whatsapp: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          business_name?: string | null;
          property_types?: string[];
          phone?: string | null;
          verified?: boolean | null;
          verification_date?: string | null;
          years_experience?: number | null;
          bio?: string | null;
          photo_url?: string | null;
          rating?: number | null;
          total_properties?: number | null;
          whatsapp?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          business_name?: string | null;
          property_types?: string[];
          phone?: string | null;
          verified?: boolean | null;
          verification_date?: string | null;
          years_experience?: number | null;
          bio?: string | null;
          photo_url?: string | null;
          rating?: number | null;
          total_properties?: number | null;
          whatsapp?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      agents: {
        Row: {
          id: string;
          profile_id: string;
          /** NOT NULL UNIQUE in database */
          license_number: string;
          agency_name: string | null;
          specialization: string[];
          phone: string | null;
          verified: boolean | null;
          verification_date: string | null;
          years_experience: number | null;
          bio: string | null;
          photo_url: string | null;
          rating: number | null;
          total_sales: number | null;
          total_listings: number | null;
          whatsapp: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          license_number: string;
          agency_name?: string | null;
          specialization?: string[];
          phone?: string | null;
          verified?: boolean | null;
          verification_date?: string | null;
          years_experience?: number | null;
          bio?: string | null;
          photo_url?: string | null;
          rating?: number | null;
          total_sales?: number | null;
          total_listings?: number | null;
          whatsapp?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          license_number?: string;
          agency_name?: string | null;
          specialization?: string[];
          phone?: string | null;
          verified?: boolean | null;
          verification_date?: string | null;
          years_experience?: number | null;
          bio?: string | null;
          photo_url?: string | null;
          rating?: number | null;
          total_sales?: number | null;
          total_listings?: number | null;
          whatsapp?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      kyc_requests: {
        Row: {
          id: string;
          user_id: string;
          /** Plain string in DB — typical values: "agent" | "owner" */
          user_type: string;
          status: string | null;
          kyc_provider: string;
          kyc_reference_id: string | null;
          documents: Json | null;
          submitted_at: string | null;
          approved_at: string | null;
          rejected_at: string | null;
          rejection_reason: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_type: string;
          status?: string | null;
          kyc_provider: string;
          kyc_reference_id?: string | null;
          documents?: Json | null;
          submitted_at?: string | null;
          approved_at?: string | null;
          rejected_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_type?: string;
          status?: string | null;
          kyc_provider?: string;
          kyc_reference_id?: string | null;
          documents?: Json | null;
          submitted_at?: string | null;
          approved_at?: string | null;
          rejected_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      properties: {
        Row: {
          id: string;
          /** Nullable — a property can be listed by an agent without a direct owner link */
          owner_id: string | null;
          agent_id: string | null;
          title: string;
          description: string | null;
          price: number;
          price_frequency: string | null;
          address: string;
          city: string;
          state: string | null;
          postal_code: string | null;
          country: string;
          latitude: number | null;
          longitude: number | null;
          /** Columns on properties table (NOT in property_details) */
          bedrooms: number | null;
          bathrooms: number | null;
          square_feet: number | null;
          year_built: number | null;
          property_type: string;
          listing_type: string;
          listing_source: string | null;
          status: string;
          verification_status: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          agent_id?: string | null;
          title: string;
          description?: string | null;
          price: number;
          price_frequency?: string | null;
          address: string;
          city: string;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_feet?: number | null;
          year_built?: number | null;
          property_type: string;
          listing_type?: string;
          listing_source?: string | null;
          status?: string;
          verification_status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          agent_id?: string | null;
          title?: string;
          description?: string | null;
          price?: number;
          price_frequency?: string | null;
          address?: string;
          city?: string;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_feet?: number | null;
          year_built?: number | null;
          property_type?: string;
          listing_type?: string;
          listing_source?: string | null;
          status?: string;
          verification_status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      property_details: {
        /**
         * Nigerian infra attributes (has_bq, nepa_status, water_source,
         * internet_type, security_type) live in the `metadata` JSON column,
         * NOT as direct columns. Filter them client-side after fetching.
         */
        Row: {
          id: string;
          property_id: string;
          parking_spaces: number | null;
          has_pool: boolean | null;
          has_garage: boolean | null;
          has_garden: boolean | null;
          heating_type: string | null;
          cooling_type: string | null;
          flooring_type: string | null;
          roof_type: string | null;
          foundation_type: string | null;
          /** JSON blob: { has_bq, nepa_status, water_source, internet_type, security_type, … } */
          metadata: Json | null;
          /** JSON blob of amenity IDs */
          amenities: Json | null;
          /** JSON blob of feature flags */
          features: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          parking_spaces?: number | null;
          has_pool?: boolean | null;
          has_garage?: boolean | null;
          has_garden?: boolean | null;
          heating_type?: string | null;
          cooling_type?: string | null;
          flooring_type?: string | null;
          roof_type?: string | null;
          foundation_type?: string | null;
          metadata?: Json | null;
          amenities?: Json | null;
          features?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          property_id?: string;
          parking_spaces?: number | null;
          has_pool?: boolean | null;
          has_garage?: boolean | null;
          has_garden?: boolean | null;
          heating_type?: string | null;
          cooling_type?: string | null;
          flooring_type?: string | null;
          roof_type?: string | null;
          foundation_type?: string | null;
          metadata?: Json | null;
          amenities?: Json | null;
          features?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      property_documents: {
        Row: {
          id: string;
          property_id: string;
          document_type: string;
          /** Column is `document_url` (not `file_url`) */
          document_url: string;
          file_name: string;
          file_size: number | null;
          verification_status: string;
          verified_by: string | null;
          verified_at: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          document_type: string;
          document_url: string;
          file_name: string;
          file_size?: number | null;
          verification_status?: string;
          verified_by?: string | null;
          verified_at?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          property_id?: string;
          document_type?: string;
          document_url?: string;
          file_name?: string;
          file_size?: number | null;
          verification_status?: string;
          verified_by?: string | null;
          verified_at?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      property_media: {
        Row: {
          id: string;
          property_id: string;
          /** Plain string — typical values: "image" | "video" | "virtual_tour" */
          media_type: string;
          /** Column is `media_url` (not `file_url`) */
          media_url: string;
          file_name: string;
          /** Column is `display_order` (not `sort_order`) */
          display_order: number | null;
          /** Column is `is_featured` (not `is_primary`) */
          is_featured: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          media_type: string;
          media_url: string;
          file_name: string;
          display_order?: number | null;
          is_featured?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          property_id?: string;
          media_type?: string;
          media_url?: string;
          file_name?: string;
          display_order?: number | null;
          is_featured?: boolean | null;
          created_at?: string | null;
        };
      };
      inquiries: {
        Row: {
          id: string;
          property_id: string;
          /** The user who sent the inquiry — column is `sender_id` (not `user_id`) */
          sender_id: string;
          owner_id: string;
          message: string;
          /** Plain string — defaults to "new" */
          status: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          sender_id: string;
          owner_id: string;
          message: string;
          status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          property_id?: string;
          sender_id?: string;
          owner_id?: string;
          message?: string;
          status?: string;
          created_at?: string | null;
          updated_at?: string | null;
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
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_id?: string;
          created_at?: string | null;
        };
      };
      admin_audit_log: {
        Row: {
          id: string;
          actor_id: string;
          action: string;
          target_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id: string;
          action: string;
          target_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string;
          action?: string;
          target_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          /** Plain string in DB — typical values: inquiry_received, property_status_changed, etc. */
          type: string;
          title: string;
          message: string;
          data: Json | null;
          is_read: boolean | null;
          read_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data?: Json | null;
          is_read?: boolean | null;
          read_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          data?: Json | null;
          is_read?: boolean | null;
          read_at?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          property_id: string;
          reviewer_id: string;
          target_type: string;
          rating: number;
          comment: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          reviewer_id: string;
          target_type: string;
          rating: number;
          comment?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          property_id?: string;
          reviewer_id?: string;
          target_type?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          property_id: string | null;
          amount: number;
          currency: string | null;
          /** Plain string — typical values: "listing_fee" | "premium_feature" */
          type: string;
          status: string | null;
          transaction_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id?: string | null;
          amount: number;
          currency?: string | null;
          type: string;
          status?: string | null;
          transaction_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_id?: string | null;
          amount?: number;
          currency?: string | null;
          type?: string;
          status?: string | null;
          transaction_id?: string | null;
          created_at?: string | null;
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
  price_frequency: z.enum(['sale', 'annual', 'monthly', 'nightly', 'daily']),
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
