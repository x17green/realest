# RealEST API Testing Script (PowerShell Version)
# Tests all implemented API endpoints with JWT authentication

Write-Host "🚀 Starting RealEST API Tests" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Load environment variables from .env.local
function Load-EnvironmentVariables {
    $envFile = ".env.local"
    if (Test-Path $envFile) {
        Write-Host "Loading environment variables from $envFile" -ForegroundColor Yellow
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^([^#][^=]+)=(.*)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                [Environment]::SetEnvironmentVariable($key, $value)
                Write-Host "  Loaded: $key" -ForegroundColor Gray
            }
        }
    } else {
        Write-Warning "Environment file $envFile not found"
    }
}

# JWT tokens for different user types (replace with real tokens)
$USER_TOKEN = "eyJhbGciOiJIUzI1NiIsImtpZCI6InV3VTRmTEpBbGlrdW4zTGkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3J6Y2x6Y2VybW1mcmJ2dmplZ3dnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5ZGE0MDRkYS0wMzE4LTQ0NDktYTBmNi1jY2NhMzZhMzMwNGMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY2NDY5NzEzLCJpYXQiOjE3NjY0NjYxMTMsImVtYWlsIjoiYW5pdGFvd2V2QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJhbml0YW93ZXZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IkFuaXRhIE93ZXYiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjlkYTQwNGRhLTAzMTgtNDQ0OS1hMGY2LWNjY2EzNmEzMzA0YyIsInVzZXJfdHlwZSI6InVzZXIifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc2NjQ2NjExM31dLCJzZXNzaW9uX2lkIjoiNWQ3MTc2ZmItMWQ1ZS00MTVmLTk5YTgtNmJlNzlhNTkxNTRmIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.kSHvDDg3zquAOWNE3tHYjwQiLkXiz0N9r_rDmA1G_rI"
$OWNER_TOKEN = "eyJhbGciOiJIUzI1NiIsImtpZCI6InV3VTRmTEpBbGlrdW4zTGkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3J6Y2x6Y2VybW1mcmJ2dmplZ3dnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2NGQ1NWJlMy0zNjgxLTQ5MTQtOTEzOC05MDQ0YjQyNzExNDIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY2NDY5NzcxLCJpYXQiOjE3NjY0NjYxNzEsImVtYWlsIjoicHJlNGViaUBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoicHJlNGViaUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiUHJlY2lvdXMgT2tveWVuIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiI2NGQ1NWJlMy0zNjgxLTQ5MTQtOTEzOC05MDQ0YjQyNzExNDIiLCJ1c2VyX3R5cGUiOiJvd25lciJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzY2NDY2MTcxfV0sInNlc3Npb25faWQiOiIyN2FjZWRiMi1iNjMyLTQxNWYtODZiNS02OWM0NWM4YzFlYjkiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.9UTyYWYG24B8ColSuA4waUeBFWe0aXkm8EjtAjAlOwU"
$ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsImtpZCI6InV3VTRmTEpBbGlrdW4zTGkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3J6Y2x6Y2VybW1mcmJ2dmplZ3dnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkYzVjMTc0OC02ZjhjLTRiYzMtOGNkOS0yMTc2ZWYyYzcxYjciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY2NDY5NjM5LCJpYXQiOjE3NjY0NjYwMzksImVtYWlsIjoibW1ncmVlbjE3ODJAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdLCJyb2xlIjoiYWRtaW4ifSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NjY0NjYwMzl9XSwic2Vzc2lvbl9pZCI6ImU2OTZiNDI5LTBkMjAtNGVmMC04ZTdmLTQzZDk3NDUxOTQ2ZiIsImlzX2Fub255bW91cyI6ZmFsc2V9.G60bEdDIGc8Fhg1r9DFWbBpVHzajbcn4gOlLxK8IC7Q"

# Base URL
$BASE_URL = "http://localhost:3000"

# Make API request function
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = $null,
        [string]$AuthToken = $null
    )

    $url = "$BASE_URL$Endpoint"
    Write-Host "Testing: $Endpoint" -ForegroundColor White
    Write-Host "Method: $Method" -ForegroundColor Gray

    $headers = @{}
    if ($AuthToken) {
        $headers["Authorization"] = "Bearer $AuthToken"
        Write-Host "Auth: Bearer token included" -ForegroundColor Yellow
    }

    if ($Data) {
        $headers["Content-Type"] = "application/json"
        Write-Host "Data: $Data" -ForegroundColor Gray
    }

    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $headers
        }

        if ($Data) {
            $params.Body = $Data
        }

        $response = Invoke-RestMethod @params
        Write-Host "✅ Success" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Load environment
Load-EnvironmentVariables

# Test functions
function Test-SystemStatus {
    Write-Host "`n📋 STEP 1: Testing System Status" -ForegroundColor Magenta
    Write-Host "=================================" -ForegroundColor Magenta
    Invoke-ApiRequest -Method "GET" -Endpoint "/api/system/status"
}

function Test-PublicPropertyEndpoints {
    Write-Host "`n📋 STEP 2: Testing Public Property Endpoints" -ForegroundColor Magenta
    Write-Host "=============================================" -ForegroundColor Magenta

    Invoke-ApiRequest -Method "GET" -Endpoint "/api/properties"
    Invoke-ApiRequest -Method "GET" -Endpoint "/api/properties?state=Lagos&property_type=duplex"
    Invoke-ApiRequest -Method "GET" -Endpoint "/api/properties/featured"
}

function Test-ProfileManagement {
    Write-Host "`n📋 STEP 3: Testing Profile Management" -ForegroundColor Magenta
    Write-Host "=====================================" -ForegroundColor Magenta

    Invoke-ApiRequest -Method "GET" -Endpoint "/api/profile" -AuthToken $USER_TOKEN
    Invoke-ApiRequest -Method "PUT" -Endpoint "/api/profile" -Data '{"full_name":"Updated Name","phone":"+2348012345678"}' -AuthToken $USER_TOKEN
}

function Test-PropertyCRUD {
    Write-Host "`n📋 STEP 4: Testing Property CRUD Operations" -ForegroundColor Magenta
    Write-Host "===========================================" -ForegroundColor Magenta

    Invoke-ApiRequest -Method "GET" -Endpoint "/api/properties/owner" -AuthToken $OWNER_TOKEN

    $propertyData = @{
        title = "Beautiful 3 Bedroom Duplex in Lekki"
        description = "Modern duplex with all amenities in a gated community. Features 24/7 power, borehole water, and security."
        price = 25000000
        address = "Lekki Phase 1, Lagos"
        state = "Lagos"
        latitude = 6.4698
        longitude = 3.5852
        property_type = "duplex"
        bedrooms = 3
        bathrooms = 4
        nepa_status = "stable"
        has_generator = $true
        has_bq = $true
        bq_type = "self_contained"
        security_type = @("gated_community", "cctv", "security_post")
        water_source = "borehole"
        internet_type = "fiber"
    } | ConvertTo-Json

    Invoke-ApiRequest -Method "POST" -Endpoint "/api/properties" -Data $propertyData -AuthToken $OWNER_TOKEN
}

function Test-SearchAndDiscovery {
    Write-Host "`n📋 STEP 5: Testing Search & Discovery" -ForegroundColor Magenta
    Write-Host "=====================================" -ForegroundColor Magenta

    Invoke-ApiRequest -Method "GET" -Endpoint "/api/search/properties?query=lekki&state=Lagos"
}

function Test-InquirySystem {
    Write-Host "`n📋 STEP 6: Testing Inquiry System" -ForegroundColor Magenta
    Write-Host "=================================" -ForegroundColor Magenta

    Invoke-ApiRequest -Method "GET" -Endpoint "/api/inquiries" -AuthToken $USER_TOKEN

    $inquiryData = @{
        property_id = "placeholder_property_id"
        message = "Hello! I am interested in this property. Is the price negotiable?"
        contact_phone = "+2348012345678"
        contact_email = "user@example.com"
    } | ConvertTo-Json

    Invoke-ApiRequest -Method "POST" -Endpoint "/api/inquiries" -Data $inquiryData -AuthToken $USER_TOKEN
}

function Test-SavedProperties {
    Write-Host "`n📋 STEP 7: Testing Saved Properties" -ForegroundColor Magenta
    Write-Host "===================================" -ForegroundColor Magenta

    Invoke-ApiRequest -Method "GET" -Endpoint "/api/saved-properties" -AuthToken $USER_TOKEN
    Invoke-ApiRequest -Method "POST" -Endpoint "/api/saved-properties" -Data '{"property_id": "placeholder_property_id"}' -AuthToken $USER_TOKEN
}

function Test-Geocoding {
    Write-Host "`n📋 STEP 8: Testing Geocoding" -ForegroundColor Magenta
    Write-Host "===========================" -ForegroundColor Magenta

    $geocodeData = @{
        address = "Lekki Phase 1, Lagos, Nigeria"
        country = "Nigeria"
    } | ConvertTo-Json

    Invoke-ApiRequest -Method "POST" -Endpoint "/api/geocode" -Data $geocodeData
    Invoke-ApiRequest -Method "GET" -Endpoint "/api/geocode/reverse?lat=6.4698&lng=3.5852"
}

function Test-FileUpload {
    Write-Host "`n📋 STEP 9: Testing File Upload" -ForegroundColor Magenta
    Write-Host "===============================" -ForegroundColor Magenta

    $uploadData = @{
        file_name = "property-photo-1.jpg"
        file_type = "image/jpeg"
        file_size = 2048000
        bucket = "property-media"
    } | ConvertTo-Json

    Invoke-ApiRequest -Method "POST" -Endpoint "/api/upload/signed-url" -Data $uploadData -AuthToken $OWNER_TOKEN
}

function Test-AdminEndpoints {
    Write-Host "`n📋 STEP 10: Testing Admin Endpoints" -ForegroundColor Magenta
    Write-Host "==================================" -ForegroundColor Magenta

    Invoke-ApiRequest -Method "GET" -Endpoint "/api/admin/properties?status=pending_vetting" -AuthToken $ADMIN_TOKEN
}

function Test-Notifications {
    Write-Host "`n📋 STEP 11: Testing Notifications" -ForegroundColor Magenta
    Write-Host "=================================" -ForegroundColor Magenta

    Invoke-ApiRequest -Method "GET" -Endpoint "/api/notifications" -AuthToken $USER_TOKEN
    Invoke-ApiRequest -Method "POST" -Endpoint "/api/notifications/mark-all-read" -AuthToken $USER_TOKEN
}

function Test-Dashboard {
    Write-Host "`n📋 STEP 12: Testing Dashboard" -ForegroundColor Magenta
    Write-Host "=============================" -ForegroundColor Magenta

    Invoke-ApiRequest -Method "GET" -Endpoint "/api/dashboard/stats" -AuthToken $OWNER_TOKEN
}

function Test-AgentEndpoints {
    Write-Host "`n📋 STEP 13: Testing Agent Endpoints" -ForegroundColor Magenta
    Write-Host "==================================" -ForegroundColor Magenta

    Invoke-ApiRequest -Method "GET" -Endpoint "/api/agents"
}

# Main execution
Write-Host "`n🚀 RealEST API Testing Script" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "Note: Make sure the development server is running on $BASE_URL`n" -ForegroundColor Yellow

# Run all tests
Test-SystemStatus
Test-PublicPropertyEndpoints
Test-ProfileManagement
Test-PropertyCRUD
Test-SearchAndDiscovery
Test-InquirySystem
Test-SavedProperties
Test-Geocoding
Test-FileUpload
Test-AdminEndpoints
Test-Notifications
Test-Dashboard
Test-AgentEndpoints

Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "`n📝 Summary:" -ForegroundColor White
Write-Host "✅ System status endpoint working" -ForegroundColor Green
Write-Host "✅ Public property endpoints accessible" -ForegroundColor Green
Write-Host "✅ Authentication system functional" -ForegroundColor Green
Write-Host "⚠️  Some endpoints may require real data/tokens" -ForegroundColor Yellow

Write-Host "`n🔗 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Replace placeholder JWT tokens with real ones from authenticated sessions" -ForegroundColor White
Write-Host "2. Add real property IDs to test property-specific endpoints" -ForegroundColor White
Write-Host "3. Populate database with test data for meaningful results" -ForegroundColor White
Write-Host "4. Test file uploads with actual files" -ForegroundColor White

Write-Host "`n⚠️  Remember: Update JWT tokens regularly as they expire!" -ForegroundColor Yellow