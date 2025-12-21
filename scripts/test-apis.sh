#!/bin/bash

# RealEST API Testing Script
# This script tests all implemented API endpoints for the RealEST property marketplace
# Run this script after starting the development server with: npm run dev

# Configuration
BASE_URL="http://localhost:3000"
SUPABASE_URL="your_supabase_url_here"
SUPABASE_ANON_KEY="your_supabase_anon_key_here"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 RealEST API Testing Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to make curl requests and format output
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local auth=$4
    local description=$5

    echo -e "${YELLOW}Testing: ${description}${NC}"
    echo -e "${BLUE}Method: ${method} ${url}${NC}"

    if [ -n "$data" ]; then
        echo -e "${BLUE}Data: ${data}${NC}"
    fi

    if [ -n "$auth" ]; then
        echo -e "${BLUE}Auth: Bearer token included${NC}"
    fi

    echo ""

    # Build curl command
    local curl_cmd="curl -s -X $method \"$BASE_URL$url\""

    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H \"Content-Type: application/json\" -d '$data'"
    fi

    if [ -n "$auth" ]; then
        curl_cmd="$curl_cmd -H \"Authorization: Bearer $auth\""
    fi

    # Execute curl command
    response=$(eval $curl_cmd)

    # Check if response is valid JSON
    if echo "$response" | jq . >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Success:${NC}"
        echo "$response" | jq .
    else
        echo -e "${RED}❌ Response:${NC}"
        echo "$response"
    fi

    echo ""
    echo -e "${BLUE}----------------------------------------${NC}"
    echo ""
}

# Function to get user ID from database
get_user_id() {
    local user_type=$1
    echo -e "${YELLOW}Getting ${user_type} user ID from database...${NC}"

    # This would normally query your database
    # For now, we'll use placeholder values
    case $user_type in
        "agent")
            echo "placeholder_agent_user_id"
            ;;
        "admin")
            echo "placeholder_admin_user_id"
            ;;
        "user")
            echo "placeholder_user_id"
            ;;
        "owner")
            echo "placeholder_owner_user_id"
            ;;
    esac
}

# Function to get auth token (you would implement this)
get_auth_token() {
    local user_id=$1
    # This would normally authenticate and get a JWT token
    # For testing, you can manually get tokens from your app
    echo "your_jwt_token_here"
}

echo -e "${GREEN}📋 STEP 1: Testing Public GET Endpoints${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Test 1: Get all properties (public)
make_request "GET" "/api/properties" "" "" "Get all live properties with basic filters"

# Test 2: Get properties with search filters
make_request "GET" "/api/properties?state=Lagos&property_type=duplex&min_price=1000000&max_price=50000000" "" "" "Search properties with Nigerian market filters"

# Test 3: Get properties with infrastructure filters
make_request "GET" "/api/properties?nepa_status=stable&has_bq=true&gated_community=true" "" "" "Filter properties by infrastructure features"

# Test 4: Get featured properties (if implemented)
make_request "GET" "/api/properties/featured" "" "" "Get featured/premium properties"

echo -e "${GREEN}📋 STEP 2: Getting User IDs from Database${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Get user IDs (you would replace these with real queries)
echo -e "${YELLOW}To get real user IDs, run these SQL queries in your Supabase dashboard:${NC}"
echo ""
echo "1. Get an agent user ID:"
echo "   SELECT id FROM profiles WHERE user_type = 'agent' LIMIT 1;"
echo ""
echo "2. Get an admin user ID:"
echo "   SELECT id FROM profiles WHERE user_type = 'admin' LIMIT 1;"
echo ""
echo "3. Get a user ID:"
echo "   SELECT id FROM profiles WHERE user_type = 'user' LIMIT 1;"
echo ""
echo "4. Get a property owner user ID:"
echo "   SELECT id FROM profiles WHERE user_type = 'owner' LIMIT 1;"
echo ""

# Placeholder user IDs (replace with real ones)
AGENT_USER_ID="placeholder_agent_user_id"
ADMIN_USER_ID="placeholder_admin_user_id"
USER_ID="placeholder_user_id"
OWNER_USER_ID="placeholder_owner_user_id"

echo -e "${YELLOW}Using placeholder user IDs for demonstration. Replace with real IDs from your database.${NC}"
echo ""

echo -e "${GREEN}📋 STEP 3: Testing Authentication-Required Endpoints${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""

# Note: You need to get real JWT tokens from your authenticated app
# For testing, you can:
# 1. Log in to your app in the browser
# 2. Open browser dev tools → Application → Local Storage
# 3. Copy the 'supabase.auth.token' value

echo -e "${RED}⚠️  IMPORTANT: Get JWT tokens from your authenticated app first!${NC}"
echo ""
echo "To get tokens:"
echo "1. Start your app: npm run dev"
echo "2. Log in as different user types"
echo "3. Copy JWT tokens from browser localStorage"
echo "4. Replace the placeholder tokens below"
echo ""

# Placeholder tokens (replace with real ones)
AGENT_TOKEN="your_agent_jwt_token_here"
ADMIN_TOKEN="your_admin_jwt_token_here"
USER_TOKEN="your_user_jwt_token_here"
OWNER_TOKEN="your_owner_jwt_token_here"

echo -e "${YELLOW}Using placeholder tokens. Replace with real JWT tokens.${NC}"
echo ""

# Test 5: Get user profile
make_request "GET" "/api/profile" "" "$USER_TOKEN" "Get current user profile"

# Test 6: Update user profile
make_request "PUT" "/api/profile" '{"full_name":"Updated Name","phone":"+2348012345678","bio":"Updated bio"}' "$USER_TOKEN" "Update user profile with Nigerian phone"

# Test 7: Get owner's properties
make_request "GET" "/api/properties/owner" "" "$OWNER_TOKEN" "Get properties owned by current user"

echo -e "${GREEN}📋 STEP 4: Testing Property CRUD Operations${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

# Test 8: Create new property (owner only)
PROPERTY_DATA='{
  "title": "Beautiful 3 Bedroom Duplex in Lekki",
  "description": "Modern duplex with all amenities in a gated community. Features 24/7 power, borehole water, and security.",
  "price": 25000000,
  "currency": "NGN",
  "address": "Lekki Phase 1, Lagos",
  "city": "Lagos",
  "state": "Lagos",
  "latitude": 6.4698,
  "longitude": 3.5852,
  "property_type": "duplex",
  "listing_type": "sale",
  "bedrooms": 3,
  "bathrooms": 4,
  "square_feet": 2500,
  "nepa_status": "stable",
  "has_generator": true,
  "has_bq": true,
  "bq_type": "self_contained",
  "security_type": ["gated_community", "cctv", "security_post"],
  "water_source": "borehole",
  "internet_type": "fiber"
}'

make_request "POST" "/api/properties" "$PROPERTY_DATA" "$OWNER_TOKEN" "Create new property with Nigerian market features"

# Get the created property ID (you would extract this from the response)
PROPERTY_ID="placeholder_property_id"

# Test 9: Get specific property details
make_request "GET" "/api/properties/$PROPERTY_ID" "" "" "Get detailed property information"

# Test 10: Update property
UPDATE_DATA='{
  "title": "Updated: Beautiful 3 Bedroom Duplex in Lekki",
  "price": 27000000,
  "nepa_status": "intermittent"
}'

make_request "PUT" "/api/properties/$PROPERTY_ID" "$UPDATE_DATA" "$OWNER_TOKEN" "Update property details"

echo -e "${GREEN}📋 STEP 5: Testing Media & Document Uploads${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Test 11: Get signed URL for file upload
UPLOAD_DATA='{
  "file_name": "property-photo-1.jpg",
  "file_type": "image/jpeg",
  "file_size": 2048000,
  "bucket": "property-media"
}'

make_request "POST" "/api/upload/signed-url" "$UPLOAD_DATA" "$OWNER_TOKEN" "Get signed URL for secure file upload"

# Test 12: Upload property media
MEDIA_DATA='{
  "file_name": "property-photo-1.jpg",
  "file_url": "https://your-supabase-url.supabase.co/storage/v1/object/public/property-media/path/to/file.jpg",
  "media_type": "image",
  "is_primary": true
}'

make_request "POST" "/api/properties/$PROPERTY_ID/media" "$MEDIA_DATA" "$OWNER_TOKEN" "Upload property media"

# Test 13: Upload property documents
DOCUMENT_DATA='{
  "file_name": "certificate-of-occupancy.pdf",
  "file_url": "https://your-supabase-url.supabase.co/storage/v1/object/public/property-documents/path/to/file.pdf",
  "document_type": "certificate_of_occupancy"
}'

make_request "POST" "/api/properties/$PROPERTY_ID/documents" "$DOCUMENT_DATA" "$OWNER_TOKEN" "Upload property documents"

# Test 14: Get property media
make_request "GET" "/api/properties/$PROPERTY_ID/media" "" "$OWNER_TOKEN" "Get all media for a property"

# Test 15: Get property documents
make_request "GET" "/api/properties/$PROPERTY_ID/documents" "" "$OWNER_TOKEN" "Get all documents for a property"

echo -e "${GREEN}📋 STEP 6: Testing Search & Discovery${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# Test 16: Advanced property search
make_request "GET" "/api/search/properties?query=lekki&state=Lagos&property_type=duplex&min_price=10000000&max_price=50000000&bedrooms=3&nepa_status=stable&has_bq=true" "" "" "Advanced search with multiple filters"

echo -e "${GREEN}📋 STEP 7: Testing Inquiry System${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""

# Test 17: Create property inquiry (user)
INQUIRY_DATA='{
  "property_id": "'$PROPERTY_ID'",
  "message": "Hello! I am interested in this property. Is the price negotiable? When can we schedule a viewing?",
  "contact_phone": "+2348012345678",
  "contact_email": "user@example.com"
}'

make_request "POST" "/api/inquiries" "$INQUIRY_DATA" "$USER_TOKEN" "Create new property inquiry"

# Get the created inquiry ID
INQUIRY_ID="placeholder_inquiry_id"

# Test 18: Get user's inquiries (user view)
make_request "GET" "/api/inquiries" "" "$USER_TOKEN" "Get inquiries sent by current user"

# Test 19: Get user's inquiries (owner view)
make_request "GET" "/api/inquiries" "" "$OWNER_TOKEN" "Get inquiries received by current owner"

# Test 20: Get specific inquiry details
make_request "GET" "/api/inquiries/$INQUIRY_ID" "" "$USER_TOKEN" "Get detailed inquiry information"

# Test 21: Update inquiry status (owner response)
UPDATE_INQUIRY_DATA='{
  "status": "responded",
  "response_message": "Thank you for your interest! The price is slightly negotiable. We can schedule a viewing this weekend."
}'

make_request "PUT" "/api/inquiries/$INQUIRY_ID" "$UPDATE_INQUIRY_DATA" "$OWNER_TOKEN" "Owner responds to inquiry"

echo -e "${GREEN}📋 STEP 8: Testing Saved Properties${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""

# Test 22: Save property to favorites
SAVE_DATA='{
  "property_id": "'$PROPERTY_ID'"
}'

make_request "POST" "/api/saved-properties" "$SAVE_DATA" "$USER_TOKEN" "Save property to favorites"

# Test 23: Get saved properties
make_request "GET" "/api/saved-properties" "" "$USER_TOKEN" "Get user's saved properties"

# Test 24: Remove from saved properties
make_request "DELETE" "/api/saved-properties?property_id=$PROPERTY_ID" "" "$USER_TOKEN" "Remove property from favorites"

echo -e "${GREEN}📋 STEP 9: Testing Geocoding${NC}"
echo -e "${GREEN}===========================${NC}"
echo ""

# Test 25: Geocode address to coordinates
GEOCODE_DATA='{
  "address": "Lekki Phase 1, Lagos, Nigeria",
  "country": "Nigeria"
}'

make_request "POST" "/api/geocode" "$GEOCODE_DATA" "" "Convert Nigerian address to coordinates"

# Test 26: Reverse geocode coordinates to address
make_request "GET" "/api/geocode/reverse?lat=6.4698&lng=3.5852" "" "" "Convert coordinates to Nigerian address"

echo -e "${GREEN}📋 STEP 10: Testing Admin Endpoints${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""

# Test 27: Get properties pending admin review
make_request "GET" "/api/admin/properties?status=pending_vetting" "" "$ADMIN_TOKEN" "Get properties needing admin validation"

# Test 28: Admin validates property
VALIDATION_DATA='{
  "status": "live",
  "admin_notes": "Property verified. All documents valid, location confirmed."
}'

make_request "PUT" "/api/admin/properties/$PROPERTY_ID/validate" "$VALIDATION_DATA" "$ADMIN_TOKEN" "Admin approves property for live listing"

echo -e "${GREEN}📋 STEP 11: Testing Notifications${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""

# Test 29: Get user notifications
make_request "GET" "/api/notifications" "" "$USER_TOKEN" "Get user's notifications"

# Test 30: Mark all notifications as read
make_request "POST" "/api/notifications/mark-all-read" "" "$USER_TOKEN" "Mark all notifications as read"

echo -e "${GREEN}📋 STEP 12: Testing Duplicate Detection${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Test 31: Check for duplicate properties
DUPLICATE_CHECK_DATA='{
  "address": "Lekki Phase 1, Lagos",
  "latitude": 6.4698,
  "longitude": 3.5852,
  "radius": 0.5
}'

make_request "POST" "/api/properties/$PROPERTY_ID/duplicate-check" "$DUPLICATE_CHECK_DATA" "$OWNER_TOKEN" "Check for potential duplicate properties"

echo ""
echo -e "${GREEN}🎉 API Testing Complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Replace placeholder user IDs with real ones from your database"
echo "2. Replace placeholder JWT tokens with real tokens from authenticated sessions"
echo "3. Replace placeholder property/inquiry IDs with real ones from API responses"
echo "4. Run this script: chmod +x test-apis.sh && ./test-apis.sh"
echo "5. Check the responses for any errors and fix them"
echo ""
echo -e "${BLUE}🔗 Useful Commands:${NC}"
echo "# Get user IDs:"
echo "psql -h your-db-host -U postgres -d postgres -c \"SELECT id, user_type, full_name FROM profiles;\""
echo ""
echo "# Check API responses:"
echo "curl -s http://localhost:3000/api/properties | jq ."
echo ""
echo -e "${RED}⚠️  Remember to set your environment variables!${NC}"
```
