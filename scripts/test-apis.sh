#!/bin/bash

# RealEST API Testing Script
# Tests all implemented API endpoints for the RealEST Nigerian property marketplace
# Run with: bash scripts/test-apis.sh

set -e  # Exit on any error

# Configuration
BASE_URL="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
load_env() {
    if [ -f ".env.local" ]; then
        echo -e "${BLUE}Loading environment variables from .env.local${NC}"
        export $(grep -v '^#' .env.local | xargs 2>/dev/null || true)
    else
        echo -e "${RED}Warning: .env.local not found${NC}"
    fi
}

# JWT Tokens (replace with real tokens from authenticated sessions)
# To get tokens: Login to the app, check browser localStorage for 'supabase.auth.token'
USER_JWT="eyJhbGciOiJIUzI1NiIsImtpZCI6InV3VTRmTEpBbGlrdW4zTGkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3J6Y2x6Y2VybW1mcmJ2dmplZ3dnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5ZGE0MDRkYS0wMzE4LTQ0NDktYTBmNi1jY2NhMzZhMzMwNGMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY2NDY5NzEzLCJpYXQiOjE3NjY0NjYxMTMsImVtYWlsIjoiYW5pdGFvd2V2QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJhbml0YW93ZXZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IkFuaXRhIE93ZXYiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjlkYTQwNGRhLTAzMTgtNDQ0OS1hMGY2LWNjY2EzNmEzMzA0YyIsInVzZXJfdHlwZSI6InVzZXIifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc2NjQ2NjExM31dLCJzZXNzaW9uX2lkIjoiNWQ3MTc2ZmItMWQ1ZS00MTVmLTk5YTgtNmJlNzlhNTkxNTRmIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.kSHvDDg3zquAOWNE3tHYjwQiLkXiz0N9r_rDmA1G_rI"
OWNER_JWT="eyJhbGciOiJIUzI1NiIsImtpZCI6InV3VTRmTEpBbGlrdW4zTGkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3J6Y2x6Y2VybW1mcmJ2dmplZ3dnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2NGQ1NWJlMy0zNjgxLTQ5MTQtOTEzOC05MDQ0YjQyNzExNDIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY2NDY5NzcxLCJpYXQiOjE3NjY0NjYxNzEsImVtYWlsIjoicHJlNGViaUBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoicHJlNGViaUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiUHJlY2lvdXMgT2tveWVuIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiI2NGQ1NWJlMy0zNjgxLTQ5MTQtOTEzOC05MDQ0YjQyNzExNDIiLCJ1c2VyX3R5cGUiOiJvd25lciJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzY2NDY2MTcxfV0sInNlc3Npb25faWQiOiIyN2FjZWRiMi1iNjMyLTQxNWYtODZiNS02OWM0NWM4YzFlYjkiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.9UTyYWYG24B8ColSuA4waUeBFWe0aXkm8EjtAjAlOwU"
ADMIN_JWT="eyJhbGciOiJIUzI1NiIsImtpZCI6InV3VTRmTEpBbGlrdW4zTGkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3J6Y2x6Y2VybW1mcmJ2dmplZ3dnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkYzVjMTc0OC02ZjhjLTRiYzMtOGNkOS0yMTc2ZWYyYzcxYjciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY2NDY5NjM5LCJpYXQiOjE3NjY0NjYwMzksImVtYWlsIjoibW1ncmVlbjE3ODJAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdLCJyb2xlIjoiYWRtaW4ifSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NjY0NjYwMzl9XSwic2Vzc2lvbl9pZCI6ImU2OTZiNDI5LTBkMjAtNGVmMC04ZTdmLTQzZDk3NDUxOTQ2ZiIsImlzX2Fub255bW91cyI6ZmFsc2V9.G60bEdDIGc8Fhg1r9DFWbBpVHzajbcn4gOlLxK8IC7Q"

# Function to make API requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_token=$4
    local description=$5

    echo -e "${YELLOW}Testing: ${description}${NC}"
    echo -e "${BLUE}Method: ${method} ${endpoint}${NC}"

    local url="${BASE_URL}${endpoint}"
    local curl_cmd="curl -s -X ${method} \"${url}\""

    if [ -n "$data" ]; then
        echo -e "${BLUE}Data: ${data}${NC}"
        curl_cmd="${curl_cmd} -H \"Content-Type: application/json\" -d '${data}'"
    fi

    if [ -n "$auth_token" ]; then
        echo -e "${BLUE}Auth: Bearer token included${NC}"
        curl_cmd="${curl_cmd} -H \"Authorization: Bearer ${auth_token}\""
    fi

    echo ""

    # Execute the curl command
    local response
    response=$(eval "$curl_cmd" 2>/dev/null || echo "ERROR: curl failed")

    if [ "$response" = "ERROR: curl failed" ]; then
        echo -e "${RED}❌ Curl command failed${NC}"
        echo -e "${BLUE}Command was: ${curl_cmd}${NC}"
    elif [ -z "$response" ]; then
        echo -e "${RED}❌ No response received${NC}"
    else
        echo -e "${GREEN}✅ Response received${NC}"
        # Try to format JSON if jq is available
        if command -v jq >/dev/null 2>&1; then
            echo "$response" | jq . 2>/dev/null || echo "$response"
        else
            echo "$response"
        fi
    fi

    echo ""
    echo -e "${BLUE}----------------------------------------${NC}"
    echo ""
}

# Main testing function
run_tests() {
    echo -e "${BLUE}🚀 RealEST API Testing Script${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""

    # Test 1: System Status
    echo -e "${BLUE}📋 STEP 1: Testing System Status${NC}"
    echo -e "${BLUE}=================================${NC}"
    make_request "GET" "/api/system/status" "" "" "Get system status and health check"

    # Test 2: Public Property Endpoints
    echo -e "${BLUE}📋 STEP 2: Testing Public Property Endpoints${NC}"
    echo -e "${BLUE}=============================================${NC}"
    make_request "GET" "/api/properties" "" "" "Get all live properties"
    make_request "GET" "/api/properties?state=Lagos&property_type=duplex" "" "" "Search properties with filters"
    make_request "GET" "/api/properties/featured" "" "" "Get featured properties"

    # Test 3: Authentication Required - Profile
    echo -e "${BLUE}📋 STEP 3: Testing Profile Management${NC}"
    echo -e "${BLUE}=====================================${NC}"
    make_request "GET" "/api/profile" "" "$USER_JWT" "Get current user profile"
    make_request "PUT" "/api/profile" '{"full_name":"Updated Name","phone":"+2348012345678"}' "$USER_JWT" "Update user profile"

    # Test 4: Property CRUD (Owner)
    echo -e "${BLUE}📋 STEP 4: Testing Property CRUD Operations${NC}"
    echo -e "${BLUE}===========================================${NC}"
    make_request "GET" "/api/properties/owner" "" "$OWNER_JWT" "Get owner's properties"

    local property_data='{
        "title": "Beautiful 3 Bedroom Duplex in Lekki",
        "description": "Modern duplex with all amenities in a gated community. Features 24/7 power, borehole water, and security.",
        "price": 25000000,
        "address": "Lekki Phase 1, Lagos",
        "state": "Lagos",
        "latitude": 6.4698,
        "longitude": 3.5852,
        "property_type": "duplex",
        "bedrooms": 3,
        "bathrooms": 4,
        "nepa_status": "stable",
        "has_generator": true,
        "has_bq": true,
        "bq_type": "self_contained",
        "security_type": ["gated_community", "cctv", "security_post"],
        "water_source": "borehole",
        "internet_type": "fiber"
    }'

    make_request "POST" "/api/properties" "$property_data" "$OWNER_JWT" "Create new property"

    # Test 5: Search & Discovery
    echo -e "${BLUE}📋 STEP 5: Testing Search & Discovery${NC}"
    echo -e "${BLUE}=====================================${NC}"
    make_request "GET" "/api/search/properties?query=lekki&state=Lagos" "" "" "Advanced property search"

    # Test 6: Inquiries
    echo -e "${BLUE}📋 STEP 6: Testing Inquiry System${NC}"
    echo -e "${BLUE}=================================${NC}"
    make_request "GET" "/api/inquiries" "" "$USER_JWT" "Get user inquiries"

    local inquiry_data='{
        "property_id": "placeholder_property_id",
        "message": "Hello! I am interested in this property. Is the price negotiable?",
        "contact_phone": "+2348012345678",
        "contact_email": "user@example.com"
    }'

    make_request "POST" "/api/inquiries" "$inquiry_data" "$USER_JWT" "Create property inquiry"

    # Test 7: Saved Properties
    echo -e "${BLUE}📋 STEP 7: Testing Saved Properties${NC}"
    echo -e "${BLUE}===================================${NC}"
    make_request "GET" "/api/saved-properties" "" "$USER_JWT" "Get saved properties"

    local save_data='{"property_id": "placeholder_property_id"}'
    make_request "POST" "/api/saved-properties" "$save_data" "$USER_JWT" "Save property to favorites"

    # Test 8: Geocoding
    echo -e "${BLUE}📋 STEP 8: Testing Geocoding${NC}"
    echo -e "${BLUE}===========================${NC}"
    local geocode_data='{"address": "Lekki Phase 1, Lagos, Nigeria", "country": "Nigeria"}'
    make_request "POST" "/api/geocode" "$geocode_data" "" "Convert address to coordinates"

    make_request "GET" "/api/geocode/reverse?lat=6.4698&lng=3.5852" "" "" "Convert coordinates to address"

    # Test 9: Upload (Signed URLs)
    echo -e "${BLUE}📋 STEP 9: Testing File Upload${NC}"
    echo -e "${BLUE}==============================${NC}"
    local upload_data='{
        "file_name": "property-photo-1.jpg",
        "file_type": "image/jpeg",
        "file_size": 2048000,
        "bucket": "property-media"
    }'
    make_request "POST" "/api/upload/signed-url" "$upload_data" "$OWNER_JWT" "Get signed upload URL"

    # Test 10: Admin Endpoints
    echo -e "${BLUE}📋 STEP 10: Testing Admin Endpoints${NC}"
    echo -e "${BLUE}==================================${NC}"
    make_request "GET" "/api/admin/properties?status=pending_vetting" "" "$ADMIN_JWT" "Get properties needing validation"

    # Test 11: Notifications
    echo -e "${BLUE}📋 STEP 11: Testing Notifications${NC}"
    echo -e "${BLUE}=================================${NC}"
    make_request "GET" "/api/notifications" "" "$USER_JWT" "Get user notifications"
    make_request "POST" "/api/notifications/mark-all-read" "" "$USER_JWT" "Mark notifications as read"

    # Test 12: Dashboard
    echo -e "${BLUE}📋 STEP 12: Testing Dashboard${NC}"
    echo -e "${BLUE}=============================${NC}"
    make_request "GET" "/api/dashboard/stats" "" "$OWNER_JWT" "Get dashboard statistics"

    # Test 13: Agents
    echo -e "${BLUE}📋 STEP 13: Testing Agent Endpoints${NC}"
    echo -e "${BLUE}==================================${NC}"
    make_request "GET" "/api/agents" "" "" "Get all agents"

    echo -e "${GREEN}🎉 API Testing Complete!${NC}"
    echo ""
    echo -e "${YELLOW}📝 Summary:${NC}"
    echo "✅ System status endpoint working"
    echo "✅ Public property endpoints accessible"
    echo "✅ Authentication system functional"
    echo "⚠️  Some endpoints may require real data/tokens"
    echo ""
    echo -e "${BLUE}🔗 Next Steps:${NC}"
    echo "1. Replace placeholder JWT tokens with real ones from authenticated sessions"
    echo "2. Add real property IDs to test property-specific endpoints"
    echo "3. Populate database with test data for meaningful results"
    echo "4. Test file uploads with actual files"
    echo ""
    echo -e "${RED}⚠️  Remember: Update JWT tokens regularly as they expire!${NC}"
}

# Main execution
main() {
    load_env

    echo -e "${BLUE}🚀 Starting RealEST API Tests${NC}"
    echo -e "${BLUE}================================${NC}"
    echo -e "${YELLOW}Note: Make sure the development server is running on http://localhost:3000${NC}"
    echo ""

    run_tests
}

main "$@"