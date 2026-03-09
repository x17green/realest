# RealEST: Vetted & Verified Property Marketplace

## Product & Project Documentation

**Project Name:** RealEST (www.realest.ng)
**Domain:** realest.ng
**Date:** [Current Date]
**Version:** 1.0

---

## 1. Executive Summary

RealEST is an innovative online marketplace designed to revolutionize the real estate industry in Nigeria (and potentially beyond) by establishing an unparalleled level of trust and data integrity. We address common pain points like duplicate listings, fraudulent documents, and inaccurate property information by implementing a unique, multi-stage validation pipeline: **ML-powered document verification** combined with **physical, on-site vetting** by our team. RealEST ensures a seamless and transparent experience for property owners, users, renters, and leasers, making property transactions more reliable and efficient.

## 2. Product Vision & Mission

**Vision:** To be the most trusted and authentic property marketplace, setting the standard for verified real estate listings globally.

**Mission:** To empower property owners with a reliable platform to list their assets and provide buyers, renters, and leasers with verified, accurate, and comprehensive property information, fostering confidence and transparency in every transaction.

## 3. Unique Selling Propositions (USPs)

1.  **Immutability & No Duplicates:** Leveraging technology and robust checks to ensure each unique physical property has only one definitive, verified listing.
2.  **Dual-Layer Validation:**
    *   **ML-Powered Document Verification:** Automated initial scanning and authentication of property documents (e.g., title deeds, permits).
    *   **Physical On-site Vetting:** A dedicated RealEST team conducts physical inspections to verify property details, location, and documents against the listing.
3.  **Live Location Mapping:** Highly accurate property locations displayed on interactive maps, reducing ambiguity and aiding discovery.
4.  **Comprehensive Property Information:** Rich, structured data including high-quality media (photos, virtual tours), detailed specifications, and neighborhood insights.
5.  **User-Centric Experience:** Intuitive interface, personalized search, and transparent communication tools.

## 4. Target Audience

*   **Primary:**
    *   **Property Owners:** Individuals, real estate agencies, developers, commercial landlords, hotel owners looking to sell, rent, or lease their properties or event spaces.
    *   **Buyers/Renters/Leasers:** Individuals and businesses actively seeking residential, commercial, or event properties.
*   **Secondary:**
    *   Real Estate Agents/Brokers (as certified partners).
    *   Mortgage Lenders, Insurance Providers, Legal Advisors (potential integration partners).

## 5. Core Features & Modules

### 5.1. User & Profile Management
*   **User Roles:** Property Owner(owner), Agent/Agency(agent), Buyer/Renter(user), Admin/Vetting Team (admin).
*   **Authentication:** Email/Password, Social Logins (Google, Apple).
*   **Profile Management:** Detailed user profiles, preferences, saved searches.
*   **Two-Factor Authentication (2FA):** Enhanced security for owners.

### 5.2. Property Listing & Management
*   **Property Types:** Houses (Sale/Rent), Land (Sale/Lease), Commercial (Sale/Rent/Lease), Event Centers (Rent), Hotels (Sale/Lease).
*   **Comprehensive Data Model:** Basic info, detailed features, financials, high-quality media (photos, videos, virtual tours, floor plans), accurate geocoordinates, owner/agent contact.
*   **Listing Workflow:**
    1.  Owner provides property details, uploads documents & media.
    2.  ML Service performs initial document validation.
    3.  RealEST Vetting Team conducts physical inspection & document verification.
    4.  Property goes live on the marketplace.
*   **Owner Dashboard:** Manage listings (edit, unlist), track status, view inquiries.

### 5.3. Search & Discovery
*   **Advanced Search:** Filters by location (radius search), property type, price, rooms, amenities, keywords.
*   **Map-Based Search:** Interactive map display of properties with live location pins.
*   **Personalized Recommendations:** Based on user behavior.
*   **Saved Searches & Alerts:** Notifications for new matching properties.
*   **Neighborhood Guides:** Information on local amenities, schools, transport, etc.

### 5.4. Communication & Interaction
*   **Inquiry System:** In-app messaging for buyers/renters to contact owners/agents.
*   **Appointment Scheduling:** Integrated calendar for property viewings.
*   **Reviews & Ratings:** (Post-transaction) for properties, owners, and agents.

### 5.5. Admin & Vetting Dashboard
*   **Validation Queue:** Dashboard for properties awaiting ML review, physical vetting, and duplicate review.
*   **ML Results Display:** View ML confidence scores and flags.
*   **User Management:** Administer user accounts, roles, and resolve disputes.
*   **Content Moderation:** Ensure listing compliance.
*   **Analytics:** Marketplace performance, user engagement, listing trends.

## 6. Technology Stack

*   **Database:** Supabase (PostgreSQL with PostGIS extension for geospatial data).
    *   Leverages Row Level Security (RLS) for robust access control.
*   **Authentication:** Supabase Auth.
*   **Storage:** Supabase Storage (for property images, videos, documents).
*   **Backend Logic:**
    *   **Supabase Edge Functions:** For lightweight, event-driven tasks (e.g., triggering ML, notifications).
    *   **Custom Microservice (Python/Node.js):** For complex ML workflows, external API integrations, and heavy processing if Edge Functions become a bottleneck.
*   **Frontend:** [Chosen Framework, e.g., Next.js, React, Vue, Svelte].
*   **Mapping Services:** Mapbox GL JS / Google Maps API (for geocoding and interactive maps).
*   **ML Services (Phase 4):**
    *   **Document Validation:** Cloud Vision APIs (AWS Textract, Google Cloud Vision) combined with custom NLP/CV models.
    *   **Duplicate Detection:** Image hashing, fuzzy string matching, geospatial clustering algorithms.
*   **Other Integrations (Future):** Payment Gateway (Stripe, Paystack), Email/SMS (SendGrid, Twilio).

## 7. Implementation Roadmap (Phased Approach)

### Phase 0: Foundation & Setup
*   **0.1 Supabase Setup:** Project creation, RLS configuration for all core tables, Storage bucket setup.
*   **0.2 Frontend Setup:** Project initialization, Supabase client integration, basic routing, styling framework.
*   **0.3 Version Control & CI/CD:** Git, automated deployments (e.g., Vercel).

### Phase 1: Core User Flows (MVP)
*   **1.1 User Authentication:** Register, Login, Logout (Email/Password).
*   **1.2 Profile Management:** Basic profile update (name, avatar).
*   **1.3 Property Listing Form:** Multi-step form for property details, address with geocoding, document/media upload.
*   **1.4 Property Browsing:** Homepage (featured), Property Listing Page (grid/list view of live properties).
*   **1.5 Property Details Page:** Display all data, interactive map, "Vetted" badge, owner contact form.
*   **1.6 Owner Dashboard:** View own listings and their current status.
*   **1.7 Inquiry System:** Send inquiries from property page, view inquiries in owner dashboard.

### Phase 2: Manual Validation Pipeline & Admin Tools
*   **2.1 Admin Dashboard:** UI to manage property validation queue (`pending_ml_validation`, `pending_vetting`).
*   **2.2 Manual ML Review:** Admin manually reviews uploaded documents, updates `ml_validation_status`.
*   **2.3 Manual Physical Vetting:** Admin manually updates `properties.status` to `live` or `rejected` after simulated vetting.
*   **2.4 Basic Duplicate Check:** Initial logic on submission for exact address/proximity matches; Admin UI for review.
*   **2.5 Admin User Management:** View/edit user roles.

### Phase 3: Enhancements & Scalability Prep
*   **3.1 Advanced Search:** More filters, radius search.
*   **3.2 Media Optimization:** Image compression, CDN integration, lazy loading.
*   **3.3 Basic Recommendations:** "Similar Properties" based on type/location.
*   **3.4 Premium Listings (Manual):** Admin-flagged featured properties.
*   **3.5 Notifications:** Real-time in-app notifications (Supabase Realtime).

### Phase 4: Full ML Integration & Operationalization
*   **4.1 Automated ML Document Validation:** Integration of ML service to automatically classify, OCR, and validate documents.
*   **4.2 Advanced Duplicate Detection:** Image hashing, fuzzy address matching, geospatial clustering for automatic flagging.
*   **4.3 Vetting Team Mobile App:** Dedicated app for on-site verification (geotagged photos, live status updates).
*   **4.4 Neighborhood Guides:** Integrate third-party data APIs.
*   **4.5 Monetization Logic:** Implement transaction fees, tiered subscriptions for agents.
*   **4.6 Full Review & Ratings System.**

## 8. Core Logic & Architecture Details

### 8.1. Data Integrity & Immutability (No Duplicates)
*   **Principle:** A single, verified source of truth for each physical property.
*   **Logic:**
    1.  **Unique Property Signature:** Upon listing, a property's identity is defined by its verified `address`, `latitude`, `longitude`, and `property_type`.
    2.  **Initial Duplicate Check (Submission):**
        *   Exact `address` match.
        *   Geospatial proximity check (e.g., `ST_DWithin` in PostGIS) within a tight radius.
        *   Owner-specific listing check.
        *   **Action:** If a potential duplicate, flag `is_duplicate=TRUE` and set `status='pending_duplicate_review'`.
    3.  **Advanced Duplicate Detection (Phase 4 ML):**
        *   **Image Hashing:** Perceptual hashing of all property images; high similarity flags visual duplicates.
        *   **Textual Analysis:** NLP for description similarity.
        *   **Metadata Clustering:** Combine all features for a comprehensive similarity score.
        *   **Action:** High-confidence ML flags lead to `status='pending_duplicate_review'`.
    4.  **Admin Resolution:** Dedicated UI for Admin to review flagged properties, decide to `merge`, `approve` (false positive), or `reject_duplicate`.

### 8.2. Property Validation Pipeline
*   **Principle:** A multi-stage process to ensure the authenticity and accuracy of every listing.
*   **Stages:**
    1.  **Owner Submission:**
        *   Owner uploads data, documents, media.
        *   `properties.status` set to `'pending_ml_validation'`.
        *   `property_documents.ml_validation_status` set to `'pending'`.
    2.  **ML Document Validation (Automated in Phase 4):**
        *   **Trigger:** Document upload event.
        *   **ML Service:** Performs OCR, document type classification, keyword/template verification, anomaly detection.
        *   **Output:** Updates `property_documents.ml_validation_status` (`passed`, `failed`, `review_required`) and stores `confidence_score`/`notes`.
        *   **Transition:** If all documents pass ML, `properties.status` moves to `'pending_vetting'`. If any fail or need review, `properties.status` remains `'pending_ml_validation'` for Admin intervention.
    3.  **Admin Review & Physical Vetting (Manual):**
        *   **Trigger:** `properties.status` is `'pending_ml_validation'` or `'pending_vetting'`.
        *   **Admin Action:** Reviews ML results, manually verifies documents (updates `property_documents.admin_vetting_status`), and performs/simulates physical inspection.
        *   **Decision:**
            *   **Live:** If all checks pass, `properties.status` becomes `'live'`. Property gains "Vetted" badge.
            *   **Rejected:** If significant discrepancies or issues, `properties.status` becomes `'rejected'`, with a `rejection_reason`.
*   **Transparency:** Owners are informed of their property's status throughout the pipeline via their dashboard and notifications.

### 8.3. Live Location Mapping
*   **Principle:** Pinpoint accuracy for property locations.
*   **Logic:**
    1.  **Geocoding on Input:** Frontend integrates with Mapbox/Google Geocoding API to convert owner's `address` to `latitude`/`longitude`. This is stored.
    2.  **Map Display:** Property details page uses stored `latitude`/`longitude` to display an interactive map with a precise marker.
    3.  **Search Integration:** Map-based search allows users to explore properties within visible bounds or a defined radius, leveraging PostGIS spatial queries.
    4.  **Vetting Confirmation:** Physical vetting explicitly confirms the accuracy of the listed coordinates.

### 8.4. Communication & Notifications
*   **Inquiry Flow:** User submits inquiry form -> `inquiries` table record -> owner receives in-app/email notification.
*   **Status Updates:** Owners receive real-time notifications (via Supabase Realtime/WebSockets) and/or email/SMS for status changes (e.g., `Live`, `Rejected`, new inquiry).
*   **Admin Alerts:** Admins are alerted to new properties awaiting validation/review.

## 9. Monetization Strategy

*   **Premium Listings:** Property owners/agents pay a fee to have their listings featured, boosted in search, or receive additional visibility.
*   **Agent/Agency Subscriptions:** Tiered plans offering more listings, advanced analytics, and lead generation tools.
*   **Transaction Fees:** A small percentage on successful property sales or long-term rentals (requires robust transaction tracking and legal framework).
*   **Value-Added Services:** Referrals to verified legal, financial, or photography services for a commission.

## 10. Legal & Compliance

*   **Data Privacy:** Adherence to data protection laws (e.g., NDPR in Nigeria, GDPR if expanding).
*   **Real Estate Regulations:** Compliance with Nigerian real estate laws and regulations regarding listings, advertising, and transactions.
*   **Terms of Service & Privacy Policy:** Clearly defined for all users.
*   **Dispute Resolution:** Established process for mediating disputes.

## 11. Success Metrics

*   **User Engagement:** Active users, session duration, return rate.
*   **Listing Growth:** Number of new verified properties listed monthly.
*   **Conversion Rate:** Inquiries-to-viewings, viewings-to-transactions.
*   **Validation Efficiency:** Time taken for ML validation, physical vetting, and overall listing approval.
*   **User Trust:** Feedback, reviews, low incidence of reported issues.
*   **Monetization:** Revenue growth from premium services.

---

This comprehensive documentation for RealEST (realest.ng) now provides a complete blueprint for both product vision and project execution. It should be a living document, updated as the project evolves, but it provides a solid foundation to move forward with confidence.