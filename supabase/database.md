## Database inventory — full structured summary
Below is a consolidated, organized and detailed dump of your database objects (schemas, tables, primary keys, columns, types/defaults/checks, RLS status, foreign keys, and comments). I include only objects returned by the schema listing; if you want functions, policies, or types enumerated too I can fetch them next (requires additional queries). This summary is grouped by schema.

Schema: auth
Comment: core Supabase Auth tables

Table: users (rls_enabled: true, rows: 4)

Primary key: id
Comment: Auth: Stores user login data within a secure schema.
Columns:
instance_id — uuid (nullable)
id — uuid
aud — varchar (nullable)
role — varchar (nullable)
email — varchar (nullable)
encrypted_password — varchar (nullable)
email_confirmed_at — timestamptz (nullable)
invited_at — timestamptz (nullable)
confirmation_token — varchar (nullable)
confirmation_sent_at — timestamptz (nullable)
recovery_token — varchar (nullable)
recovery_sent_at — timestamptz (nullable)
email_change_token_new — varchar (nullable)
email_change — varchar (nullable)
email_change_sent_at — timestamptz (nullable)
last_sign_in_at — timestamptz (nullable)
raw_app_meta_data — jsonb (nullable)
raw_user_meta_data — jsonb (nullable)
is_super_admin — boolean (nullable)
created_at — timestamptz (nullable)
updated_at — timestamptz (nullable)
phone — text (nullable), UNIQUE, default: NULL::character varying
phone_confirmed_at — timestamptz (nullable)
phone_change — text (nullable), default: ''::character varying
phone_change_token — varchar (nullable), default: ''::character varying
phone_change_sent_at — timestamptz (nullable)
confirmed_at — timestamptz (generated), default: LEAST(email_confirmed_at, phone_confirmed_at)
email_change_token_current — varchar (nullable), default: ''::character varying
email_change_confirm_status — smallint (nullable), default: 0, check: email_change_confirm_status >= 0 AND email_change_confirm_status <= 2
banned_until — timestamptz (nullable)
reauthentication_token — varchar (nullable), default: ''::character varying
reauthentication_sent_at — timestamptz (nullable)
is_sso_user — boolean (updatable), default: false — comment: Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.
deleted_at — timestamptz (nullable)
is_anonymous — boolean (updatable), default: false
Foreign keys (references):
auth.one_time_tokens.user_id -> auth.users.id
auth.identities.user_id -> auth.users.id
auth.sessions.user_id -> auth.users.id
auth.mfa_factors.user_id -> auth.users.id
auth.oauth_consents.user_id -> auth.users.id
auth.oauth_authorizations.user_id -> auth.users.id
public.profiles.id -> auth.users.id
Table: refresh_tokens (rls_enabled: true, rows: 3)

Primary key: id
Comment: Auth: Store of tokens used to refresh JWT tokens once they expire.
Columns:
instance_id — uuid (nullable)
id — bigint, default nextval('auth.refresh_tokens_id_seq')
token — varchar (nullable), UNIQUE
user_id — varchar (nullable)
revoked — boolean (nullable)
created_at — timestamptz (nullable)
updated_at — timestamptz (nullable)
parent — varchar (nullable)
session_id — uuid (nullable)
Foreign keys:
auth.refresh_tokens.session_id -> auth.sessions.id
Table: instances (rls_enabled: true, rows: 0)

Primary key: id
Comment: Auth: Manages users across multiple sites.
Columns:
id — uuid
uuid — uuid (nullable)
raw_base_config — text (nullable)
created_at — timestamptz (nullable)
updated_at — timestamptz (nullable)
Table: audit_log_entries (rls_enabled: true, rows: 197)

Primary key: id
Comment: Auth: Audit trail for user actions.
Columns:
instance_id — uuid (nullable)
id — uuid
payload — json (nullable)
created_at — timestamptz (nullable)
ip_address — varchar, default ''::character varying
Table: schema_migrations (rls_enabled: true, rows: 3)

Primary key: version
Comment: Auth: Manages updates to the auth system.
Columns:
version — varchar
Table: identities (rls_enabled: true, rows: 4)

Primary key: id
Comment: Auth: Stores identities associated to a user.
Columns:
provider_id — text
user_id — uuid
identity_data — jsonb
provider — text
last_sign_in_at — timestamptz (nullable)
created_at — timestamptz (nullable)
updated_at — timestamptz (nullable)
email — text (generated), default lower((identity_data ->> 'email'))
id — uuid, default gen_random_uuid()
Foreign keys:
auth.identities.user_id -> auth.users.id
Table: sessions (rls_enabled: true, rows: 2)

Primary key: id
Comment: Auth: Stores session data associated to a user.
Columns:
id — uuid
user_id — uuid
created_at — timestamptz (nullable)
updated_at — timestamptz (nullable)
factor_id — uuid (nullable)
aal — aal_level (enum: aal1, aal2, aal3) (nullable)
not_after — timestamptz (nullable) — comment: session expiry hint
refreshed_at — timestamp (nullable)
user_agent — text (nullable)
ip — inet (nullable)
tag — text (nullable)
oauth_client_id — uuid (nullable)
refresh_token_hmac_key — text (nullable) — comment: HMAC-SHA256 key used to sign refresh tokens
refresh_token_counter — bigint (nullable) — last issued refresh token id
scopes — text (nullable), check: char_length(scopes) <= 4096
Foreign keys:
auth.refresh_tokens.session_id -> auth.sessions.id
auth.sessions.oauth_client_id -> auth.oauth_clients.id
auth.sessions.user_id -> auth.users.id
auth.mfa_amr_claims.session_id -> auth.sessions.id
Table: mfa_factors (rls_enabled: true, rows: 0)

Primary key: id
Comment: auth: stores metadata about factors
Columns include:
id — uuid
user_id — uuid
friendly_name — text (nullable)
factor_type — factor_type enum (totp, webauthn, phone)
status — factor_status enum (unverified, verified)
created_at, updated_at — timestamptz
secret — text (nullable)
phone — text (nullable)
last_challenged_at — timestamptz (nullable), UNIQUE
web_authn_credential — jsonb (nullable)
web_authn_aaguid — uuid (nullable)
last_webauthn_challenge_data — jsonb (nullable) — comment stored challenge data
Foreign keys:
auth.mfa_factors.user_id -> auth.users.id
auth.mfa_challenges.factor_id -> auth.mfa_factors.id
Table: mfa_challenges (rls_enabled: true, rows: 0)

Primary key: id
Comment: auth: stores metadata about challenge requests made
Columns:
id — uuid
factor_id — uuid
created_at — timestamptz
verified_at — timestamptz (nullable)
ip_address — inet
otp_code — text (nullable)
web_authn_session_data — jsonb (nullable)
Foreign keys:
auth.mfa_challenges.factor_id -> auth.mfa_factors.id
Table: mfa_amr_claims (rls_enabled: true, rows: 2)

Primary key: id
Comment: auth: stores authenticator method reference claims for multi factor authentication
Columns:
session_id — uuid
created_at, updated_at — timestamptz
authentication_method — text
id — uuid
Foreign keys:
auth.mfa_amr_claims.session_id -> auth.sessions.id
Table: sso_providers (rls_enabled: true, rows: 0)

Primary key: id
Comment: Auth: Manages SSO identity provider information; see saml_providers for SAML.
Columns:
id — uuid
resource_id — text (nullable), check: resource_id = NULL::text OR char_length(resource_id) > 0 — comment: unique resource id for infra as code
created_at, updated_at — timestamptz (nullable)
disabled — boolean (nullable)
Foreign keys (examples):
auth.saml_relay_states.sso_provider_id -> auth.sso_providers.id
auth.sso_domains.sso_provider_id -> auth.sso_providers.id
auth.saml_providers.sso_provider_id -> auth.sso_providers.id
Table: sso_domains (rls_enabled: true, rows: 0)

Primary key: id
Comment: Auth: Manages SSO email address domain mapping to an SSO Identity Provider.
Columns:
id — uuid
sso_provider_id — uuid
domain — text, check: char_length(domain) > 0
created_at, updated_at — timestamptz (nullable)
Foreign keys:
auth.sso_domains.sso_provider_id -> auth.sso_providers.id
Table: saml_providers (rls_enabled: true, rows: 0)

Primary key: id
Comment: Auth: Manages SAML Identity Provider connections.
Columns:
id — uuid
sso_provider_id — uuid
entity_id — text UNIQUE, check: char_length(entity_id) > 0
metadata_xml — text, check: char_length(metadata_xml) > 0
metadata_url — text (nullable), check: metadata_url = NULL::text OR char_length(metadata_url) > 0
attribute_mapping — jsonb (nullable)
created_at, updated_at — timestamptz (nullable)
name_id_format — text (nullable)
Foreign keys:
auth.saml_providers.sso_provider_id -> auth.sso_providers.id
Table: saml_relay_states (rls_enabled: true, rows: 0)

Primary key: id
Comment: Auth: Contains SAML Relay State information for each Service Provider initiated login.
Columns:
id — uuid
sso_provider_id — uuid
request_id — text, check: char_length(request_id) > 0
for_email — text (nullable)
redirect_to — text (nullable)
created_at, updated_at — timestamptz (nullable)
flow_state_id — uuid (nullable)
Foreign keys:
auth.saml_relay_states.flow_state_id -> auth.flow_state.id
auth.saml_relay_states.sso_provider_id -> auth.sso_providers.id
Table: flow_state (rls_enabled: true, rows: 27)

Primary key: id
Comment: stores metadata for pkce logins
Columns:
id — uuid
user_id — uuid (nullable)
auth_code — text
code_challenge_method — code_challenge_method enum (s256, plain)
code_challenge — text
provider_type — text
provider_access_token — text (nullable)
provider_refresh_token — text (nullable)
created_at, updated_at — timestamptz (nullable)
authentication_method — text
auth_code_issued_at — timestamptz (nullable)
Foreign keys:
auth.saml_relay_states.flow_state_id -> auth.flow_state.id
Table: one_time_tokens (rls_enabled: true, rows: 0)

Primary key: id
Columns:
id — uuid
user_id — uuid
token_type — one_time_token_type enum (confirmation_token, reauthentication_token, recovery_token, email_change_token_new, email_change_token_current, phone_change_token)
token_hash — text, check: char_length(token_hash) > 0
relates_to — text
created_at — timestamp (without tz) default now()
updated_at — timestamp (without tz) default now()
Foreign keys:
auth.one_time_tokens.user_id -> auth.users.id
Table: oauth_clients (rls_enabled: false, rows: 0)

Primary key: id
Columns:
id — uuid
client_secret_hash — text (nullable)
registration_type — oauth_registration_type enum (dynamic, manual)
redirect_uris — text
grant_types — text
client_name — text (nullable), check length <= 1024
client_uri — text (nullable), check length <= 2048
logo_uri — text (nullable), check length <= 2048
created_at, updated_at — timestamptz default now()
deleted_at — timestamptz (nullable)
client_type — oauth_client_type enum (public, confidential), default 'confidential'
Foreign keys:
auth.oauth_authorizations.client_id -> auth.oauth_clients.id
auth.sessions.oauth_client_id -> auth.oauth_clients.id
auth.oauth_consents.client_id -> auth.oauth_clients.id
Table: oauth_authorizations (rls_enabled: false, rows: 0)

Primary key: id
Columns:
id — uuid
authorization_id — text UNIQUE
client_id — uuid
user_id — uuid (nullable)
redirect_uri — text, check length <= 2048
scope — text, check length <= 4096
state — text (nullable), check length <= 4096
resource — text (nullable), check length <= 2048
code_challenge — text (nullable), check length <= 128
code_challenge_method — code_challenge_method enum (nullable)
response_type — oauth_response_type enum (default 'code')
status — oauth_authorization_status enum (pending, approved, denied, expired) default 'pending'
authorization_code — text (nullable) UNIQUE, check length <= 255
created_at — timestamptz default now()
expires_at — timestamptz default now() + '00:03:00'
approved_at — timestamptz (nullable)
nonce — text (nullable), check length <= 255
Foreign keys:
auth.oauth_authorizations.client_id -> auth.oauth_clients.id
auth.oauth_authorizations.user_id -> auth.users.id
Table: oauth_consents (rls_enabled: false, rows: 0)

Primary key: id
Columns:
id — uuid
user_id — uuid
client_id — uuid
scopes — text, check length <= 2048
granted_at — timestamptz default now()
revoked_at — timestamptz (nullable)
Foreign keys:
auth.oauth_consents.user_id -> auth.users.id
auth.oauth_consents.client_id -> auth.oauth_clients.id
Table: oauth_client_states (rls_enabled: false, rows: 0)

Primary key: id
Comment: Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.
Columns:
id — uuid
provider_type — text
code_verifier — text (nullable)
created_at — timestamptz
Schema: storage
Comment: Supabase Storage tables

Table: buckets (rls_enabled: true, rows: 1)

Primary key: id
Columns:
id — text
name — text
owner — uuid (nullable) — comment: Field is deprecated, use owner_id instead
created_at — timestamptz default now()
updated_at — timestamptz default now()
public — boolean default false
avif_autodetection — boolean default false
file_size_limit — bigint (nullable)
allowed_mime_types — text[] (nullable)
owner_id — text (nullable)
type — storage.buckettype enum (STANDARD, ANALYTICS, VECTOR), default 'STANDARD'
Foreign keys:
storage.s3_multipart_uploads.bucket_id -> storage.buckets.id
storage.s3_multipart_uploads_parts.bucket_id -> storage.buckets.id
storage.prefixes.bucket_id -> storage.buckets.id
storage.objects.bucket_id -> storage.buckets.id
Table: objects (rls_enabled: true, rows: 0)

Primary key: id
Columns:
id — uuid, default gen_random_uuid()
bucket_id — text (nullable)
name — text (nullable)
owner — uuid (nullable) — comment: Field is deprecated, use owner_id instead
created_at — timestamptz default now()
updated_at — timestamptz default now()
last_accessed_at — timestamptz default now()
metadata — jsonb (nullable)
path_tokens — text[] (generated) default string_to_array(name, '/'::text)
version — text (nullable)
owner_id — text (nullable)
user_metadata — jsonb (nullable)
level — integer (nullable)
Foreign keys:
storage.objects.bucket_id -> storage.buckets.id
Table: migrations (rls_enabled: true, rows: 6)

Primary key: id
Columns:
id — integer
name — varchar UNIQUE
hash — varchar
executed_at — timestamp default CURRENT_TIMESTAMP
Table: s3_multipart_uploads (rls_enabled: true, rows: 0)

Primary key: id
Columns:
id — text
in_progress_size — bigint default 0
upload_signature — text
bucket_id — text
key — text
version — text
owner_id — text (nullable)
created_at — timestamptz default now()
user_metadata — jsonb (nullable)
Foreign keys:
storage.s3_multipart_uploads.bucket_id -> storage.buckets.id
storage.s3_multipart_uploads_parts.upload_id -> storage.s3_multipart_uploads.id
Table: s3_multipart_uploads_parts (rls_enabled: true, rows: 0)

Primary key: id
Columns:
id — uuid default gen_random_uuid()
upload_id — text
size — bigint default 0
part_number — integer
bucket_id — text
key — text
etag — text
owner_id — text (nullable)
version — text
created_at — timestamptz default now()
Foreign keys:
storage.s3_multipart_uploads_parts.upload_id -> storage.s3_multipart_uploads.id
storage.s3_multipart_uploads_parts.bucket_id -> storage.buckets.id
Table: prefixes (rls_enabled: true, rows: 0)

Primary key: (bucket_id, name, level)
Columns:
bucket_id — text
name — text
level — integer (generated) default storage.get_level(name)
created_at, updated_at — timestamptz default now()
Foreign keys:
storage.prefixes.bucket_id -> storage.buckets.id
Table: buckets_analytics (rls_enabled: true, rows: 0)

Primary key: id (uuid)
Columns:
name — text
type — buckettype (default 'ANALYTICS')
format — text default 'ICEBERG'
created_at, updated_at — timestamptz default now()
id — uuid default gen_random_uuid()
deleted_at — timestamptz (nullable)
Table: buckets_vectors (rls_enabled: true, rows: 0)

Primary key: id (text)
Columns:
id — text
type — buckettype default 'VECTOR'
created_at, updated_at — timestamptz default now()
Foreign keys:
storage.vector_indexes.bucket_id -> storage.buckets_vectors.id
Table: vector_indexes (rls_enabled: true, rows: 0)

Primary key: id
Columns:
id — text default gen_random_uuid()
name — text
bucket_id — text
data_type — text
dimension — integer
distance_metric — text
metadata_configuration — jsonb (nullable)
created_at, updated_at — timestamptz default now()
Foreign keys:
storage.vector_indexes.bucket_id -> storage.buckets_vectors.id
Schema: vault
Comment: secrets store with encrypted secret column

Table: secrets (rls_enabled: false, rows: 0)
Primary key: id
Comment: Table with encrypted secret column for storing sensitive information on disk.
Columns:
id — uuid default gen_random_uuid()
name — text (nullable)
description — text default ''::text
secret — text
key_id — uuid (nullable)
nonce — bytea nullable, default vault._crypto_aead_det_noncegen()
created_at — timestamptz default CURRENT_TIMESTAMP
updated_at — timestamptz default CURRENT_TIMESTAMP_
Schema: realtime
Comment: Supabase Realtime system tables

Table: schema_migrations (rls_enabled: false, rows: 0)

Primary key: version (bigint)
Columns:
version — bigint
inserted_at — timestamp (nullable)
Table: subscription (rls_enabled: false, rows: 0)

Primary key: id (bigint identity)
Columns:
id — bigint identity ALWAYS
subscription_id — uuid
entity — regclass
filters — realtime.user_defined_filter[] default '{}'::realtime.user_defined_filter[]
claims — jsonb
claims_role — regrole (generated) default realtime.to_regrole((claims ->> 'role'))
created_at — timestamp default timezone('utc', now())
Table: messages (rls_enabled: true, rows: 0)

Primary key: (inserted_at, id)
Columns:
topic — text
extension — text
payload — jsonb (nullable)
event — text (nullable)
private — boolean default false
updated_at — timestamp without tz default now()
inserted_at — timestamp without tz default now()
id — uuid default gen_random_uuid()
Tables: messages_2025_12_18, messages_2025_12_19, messages_2025_12_20, messages_2025_12_21, messages_2025_12_22 (rls_enabled: false, rows: 0 each)

Same columns as realtime.messages; likely partitioned/daily retention tables created by realtime.
Schema: public
Comment: your application data (profiles, properties, etc.)

Table: profiles (rls_enabled: true, rows: 4)

Primary key: id
Foreign keys:
public.profiles.id -> auth.users.id
Referenced by many tables (agents.profile_id, owners.profile_id, payments.user_id, reviews.reviewer_id, properties.owner_id, saved_properties.user_id, notifications.user_id, etc.)
Columns:
id — uuid
email — text
full_name — text (nullable)
user_type — user_type_enum (owner, agent, user, admin)
avatar_url — text (nullable)
phone — text (nullable)
bio — text (nullable)
created_at, updated_at — timestamptz default now()
Table: properties (rls_enabled: true, rows: 5)

Primary key: id
Columns:
id — uuid default gen_random_uuid()
owner_id — uuid (nullable)
title — text
description — text (nullable)
price — numeric
property_type — text, check in ('house','apartment','event_center','land','commercial')
listing_type — text default 'rent', check in ('for_sale','for_rent','for_lease')
address — text
city — text
state — text (nullable)
postal_code — text (nullable)
country — text default 'NG'
latitude, longitude — numeric (nullable)
bedrooms — integer (nullable)
bathrooms — numeric (nullable)
square_feet — numeric (nullable)
year_built — integer (nullable)
status — text default 'active', check in ('active','sold','rented','inactive')
verification_status — text default 'pending', check in ('pending','verified','rejected')
created_at, updated_at — timestamptz default now()
agent_id — uuid (nullable)
listing_source — text default 'owner', check in ('owner','agent')
price_frequency — text default 'sale', check in ('sale','annual','monthly','nightly')
Foreign keys:
public.payments.property_id -> public.properties.id
public.properties.agent_id -> public.agents.id
public.saved_properties.property_id -> public.properties.id
public.reviews.property_id -> public.properties.id
public.properties.owner_id -> public.profiles.id
public.property_details.property_id -> public.properties.id
public.property_documents.property_id -> public.properties.id
public.property_media.property_id -> public.properties.id
public.inquiries.property_id -> public.properties.id
Table: property_details (rls_enabled: true, rows: 0)

Primary key: id
Columns:
id — uuid default gen_random_uuid()
property_id — uuid
amenities — text[] default ARRAY[]::text[]
features — text[] default ARRAY[]::text[]
parking_spaces — integer (nullable)
has_pool, has_garage, has_garden — boolean default false
heating_type, cooling_type, flooring_type, roof_type, foundation_type — text (nullable)
created_at, updated_at — timestamptz default now()
Foreign keys:
public.property_details.property_id -> public.properties.id
Table: property_documents (rls_enabled: true, rows: 0)

Primary key: id
Columns:
id — uuid default gen_random_uuid()
property_id — uuid
document_type — text, check in ('title_deed','building_permit','energy_certificate','survey','inspection_report','other')
document_url — text
file_name — text
file_size — integer (nullable)
verification_status — text default 'pending', check in ('pending','verified','rejected')
verified_by — uuid (nullable)
verified_at — timestamptz (nullable)
notes — text (nullable)
created_at, updated_at — timestamptz default now()
Foreign keys:
public.property_documents.property_id -> public.properties.id
public.property_documents.verified_by -> public.profiles.id
Table: property_media (rls_enabled: true, rows: 0)

Primary key: id
Columns:
id — uuid default gen_random_uuid()
property_id — uuid
media_type — text, check in ('image','video')
media_url — text
file_name — text
display_order — integer default 0
is_featured — boolean default false
created_at — timestamptz default now()
Foreign keys:
public.property_media.property_id -> public.properties.id
Table: inquiries (rls_enabled: true, rows: 0)

Primary key: id
Columns:
id — uuid default gen_random_uuid()
property_id — uuid
sender_id — uuid
owner_id — uuid
message — text
status — text default 'new', check in ('new','viewed','responded','closed')
created_at, updated_at — timestamptz default now()
Foreign keys:
public.inquiries.owner_id -> public.profiles.id
public.inquiries.sender_id -> public.profiles.id
public.inquiries.property_id -> public.properties.id
Table: saved_properties (rls_enabled: true, rows: 0)

Primary key: id
Comment: Stores user favorite/saved properties for quick access
Columns:
id — uuid default gen_random_uuid()
user_id — uuid
property_id — uuid
created_at — timestamptz default now()
Foreign keys:
public.saved_properties.property_id -> public.properties.id
public.saved_properties.user_id -> public.profiles.id
Table: notifications (rls_enabled: true, rows: 0)

Primary key: id
Comment: Real-time notifications for users about inquiries, status changes, etc.
Columns:
id — uuid default gen_random_uuid()
user_id — uuid
type — text, check in ('inquiry_received','property_status_changed','property_approved','property_rejected','duplicate_detected','system_message')
title — text
message — text
data — jsonb default '{}'::jsonb
is_read — boolean default false
read_at — timestamptz (nullable)
created_at — timestamptz default now()
Foreign keys:
public.notifications.user_id -> public.profiles.id
Table: owners (rls_enabled: true, rows: 0)

Primary key: id
Columns:
id — uuid default gen_random_uuid()
profile_id — uuid
business_name — text (nullable)
property_types — text[] (nullable)
phone — text (nullable)
verified — boolean default false
verification_date — timestamptz (nullable)
years_experience — integer (nullable)
bio — text (nullable)
photo_url — text (nullable)
rating — numeric (nullable)
total_properties — integer (nullable)
whatsapp — varchar (nullable)
created_at, updated_at — timestamptz default now()
Foreign keys:
public.owners.profile_id -> public.profiles.id
Table: kyc_requests (rls_enabled: true, rows: 0)

Primary key: id
Columns:
id — uuid default gen_random_uuid()
user_id — uuid
user_type — text, check in ('agent','owner')
status — text default 'pending', check in ('pending','approved','rejected')
kyc_provider — text
kyc_reference_id — text (nullable)
documents — jsonb (nullable)
submitted_at — timestamptz default now()
approved_at, rejected_at — timestamptz (nullable)
rejection_reason — text (nullable)
created_at, updated_at — timestamptz default now()
Foreign keys:
public.kyc_requests.user_id -> public.profiles.id
Table: reviews (rls_enabled: true, rows: 0)

Primary key: id
Columns:
id — uuid default gen_random_uuid()
property_id — uuid
reviewer_id — uuid
target_type — user_type_enum (owner, agent, user, admin) with check limiting to admin/agent/owner entries
rating — integer, check rating >=1 AND rating <=5
comment — text (nullable)
created_at — timestamptz default now()
Foreign keys:
public.reviews.property_id -> public.properties.id
public.reviews.reviewer_id -> public.profiles.id
Table: payments (rls_enabled: true, rows: 0)

Primary key: id
Columns:
id — uuid default gen_random_uuid()
user_id — uuid
property_id — uuid (nullable)
amount — numeric
currency — text default 'NGN'
type — text, check in ('listing_fee','premium_feature')
status — text default 'pending', check in ('pending','completed','failed')
transaction_id — text (nullable)
created_at — timestamptz default now()
Foreign keys:
public.payments.user_id -> public.profiles.id
public.payments.property_id -> public.properties.id
Table: agents (rls_enabled: true, rows: 1)

Primary key: id
Columns:
id — uuid default gen_random_uuid()
profile_id — uuid UNIQUE
license_number — text UNIQUE
agency_name — text (nullable)
specialization — text[] (nullable)
phone — text (nullable)
verified — boolean default false
verification_date — timestamptz (nullable)
years_experience — integer (nullable)
bio — text (nullable)
photo_url — text (nullable)
rating — numeric (nullable)
total_sales — integer default 0
total_listings — integer default 0
created_at, updated_at — timestamptz default now()
whatsapp — varchar (nullable)
Foreign keys:
public.agents.profile_id -> public.profiles.id
public.properties.agent_id -> public.agents.id
Table: admin_audit_log (rls_enabled: true, rows: 0)

Primary key: id
Comment: Tracks all administrative actions for security and compliance auditing
Columns:
id — uuid default gen_random_uuid()
actor_id — uuid — comment: The admin who performed the action
action — text — comment: Type of action: create_subadmin, approve_agent, reject_agent, etc.
target_id — uuid (nullable) — comment: ID of the affected resource
metadata — jsonb (nullable) — comment: Additional context about the action
created_at — timestamptz default now()
Foreign keys:
public.admin_audit_log.actor_id -> public.profiles.id
Table: waitlist (rls_enabled: true, rows: 44)

Primary key: id
Comment: Stores email subscriptions for users waiting for RealEST launch
Columns:
id — uuid default gen_random_uuid()
email — varchar UNIQUE
first_name — varchar
last_name — varchar (nullable)
phone — varchar (nullable)
source — varchar default 'website' — comment: Where the user signed up from
status — varchar default 'active', check status in ('active','unsubscribed','bounced') — comment: Subscription status
interests — text[] (nullable) — comment: Array of user interests
location_preference — varchar (nullable)
property_type_preference — varchar (nullable)
budget_range — varchar (nullable)
subscribed_at — timestamptz default now()
unsubscribed_at — timestamptz (nullable)
last_contacted_at — timestamptz (nullable)
contact_count — integer default 0 — comment: Number of times contacted
referrer_url — text (nullable)
user_agent — text (nullable)
ip_address — inet (nullable)
utm_source, utm_medium, utm_campaign — varchar (nullable)
created_at, updated_at — timestamptz default now()
Schema: supabase_migrations
Table: schema_migrations (rls_enabled: false, rows: 1)
Primary key: version
Columns:
version — text
statements — text[] (nullable)
name — text (nullable)
created_by — text (nullable)
idempotency_key — text UNIQUE (nullable)
rollback — text[] (nullable)
Schema: extensions
(listed as schema; no tables returned in this listing)

Schema: pgbouncer
(listed as schema; no tables returned in this listing)

Notes and next steps

I enumerated tables, columns, constraints, defaults, enums and foreign keys returned by the listing. I did not fetch database functions, views, triggers, policies, or custom types (enums were reported when visible on columns). If you want a fully exhaustive export that includes:
RLS policies per table
Database functions and triggers (including realtime trigger functions)
Indexes
CHECK and UNIQUE constraints in full
All custom types and enums definitions then I can run additional targeted queries to collect them. This requires multiple queries (one per object type). Example next queries I can run:
list RLS policies for all schemas
list functions (showing security definer, arguments, returns)
list indexes for tables
list custom types / enum definitions
list triggers
list row counts (already included where available) Please tell me which additional object sets you want next (policies, functions, triggers, indexes, types), or say "everything" and I will enumerate them step-by-step (I recommend doing policies + functions + types next).
