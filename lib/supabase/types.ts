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
          user_type: "property_owner" | "buyer" | "admin";
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
          user_type: "property_owner" | "buyer" | "admin";
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
          user_type?: "property_owner" | "buyer" | "admin";
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
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
          buyer_id: string;
          message: string;
          status: "pending" | "responded" | "closed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          buyer_id: string;
          message: string;
          status?: "pending" | "responded" | "closed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          buyer_id?: string;
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
