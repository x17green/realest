realest\API_TESTING_GUIDE.md
# RealEST API Testing Guide

## Overview

This guide provides comprehensive testing instructions for all RealEST API endpoints. The APIs are designed for a Nigerian property marketplace with features like duplicate detection, infrastructure filtering, and real-time notifications.

## Prerequisites

1. **Development Server Running**
   ```bash
   npm run dev
   # Server should be running on http://localhost:3000
   ```

2. **Database Setup**
   - Ensure Supabase is running
   - Migration script has been applied
   - Test data exists (users, properties)

3. **Environment Variables**
   ```bash
   # Required for geocoding
   MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   ```

## Getting Test Data

### 1. Get User IDs from Database

Run these SQL queries in your Supabase dashboard to get real user IDs:

```sql
-- Get all users by type
SELECT id, user_type, full_name, email FROM profiles ORDER BY user_type;

-- Get specific user types
SELECT id FROM profiles WHERE user_type = 'admin' LIMIT 1;
SELECT id FROM profiles WHERE user_type = 'owner' LIMIT 1;
SELECT id FROM profiles WHERE user_type = 'user' LIMIT 1;
SELECT id FROM profiles WHERE user_type = 'agent' LIMIT 1;
```

### 2. Get JWT Tokens

1. Start your app: `npm run dev`
2. Open browser and go to `http://localhost:3000`
3. Log in as different user types
4. Open browser DevTools → Application → Local Storage
5. Copy the `supabase.auth.token` value
6. Use this token in API requests

### 3. Get Property IDs

```sql
-- Get existing properties
SELECT id, title, status, verification_status FROM properties ORDER BY created_at DESC;
```

## API Testing Commands

### Public Endpoints (No Authentication Required)

#### 1. Get All Properties
```bash
curl -X GET "http://localhost:3000/api/properties" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "properties": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "pages": 2
  }
}
```

#### 2. Search Properties with Nigerian Filters
```bash
curl -X GET "http://localhost:3000/api/properties?state=Lagos&property_type=duplex&nepa_status=stable&has_bq=true&min_price=10000000&max_price=50000000" \
  -H "Content-Type: application/json"
```

#### 3. Geocode Nigerian Address
```bash
curl -X POST "http://localhost:3000/api/geocode" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Lekki Phase 1, Lagos, Nigeria",
    "country": "Nigeria"
  }'
```

### Authentication Required Endpoints

#### 4. Get User Profile
```bash
curl -X GET "http://localhost:3000/api/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 5. Update User Profile
```bash
curl -X PUT "http://localhost:3000/api/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "full_name": "Updated Name",
    "phone": "+2348012345678",
    "bio": "Updated bio"
  }'
```

#### 6. Create Property (Property Owner Only)
```bash
curl -X POST "http://localhost:3000/api/properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -d '{
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
```

**Expected Response:**
```json
{
  "property": {
    "id": "uuid-here",
    "title": "Beautiful 3 Bedroom Duplex in Lekki",
    "status": "draft",
    "verification_status": "pending"
  },
  "message": "Property created successfully. Add photos and documents to complete your listing."
}
```

#### 7. Get Property Details
```bash
curl -X GET "http://localhost:3000/api/properties/PROPERTY_ID_HERE" \
  -H "Content-Type: application/json"
```

#### 8. Update Property (Owner Only)
```bash
curl -X PUT "http://localhost:3000/api/properties/PROPERTY_ID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -d '{
    "title": "Updated: Beautiful 3 Bedroom Duplex in Lekki",
    "price": 27000000,
    "nepa_status": "intermittent"
  }'
```

#### 9. Get Owner's Properties
```bash
curl -X GET "http://localhost:3000/api/properties/owner" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OWNER_JWT_TOKEN"
```

#### 10. Upload Property Media
```bash
# First get signed URL
curl -X POST "http://localhost:3000/api/upload/signed-url" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -d '{
    "file_name": "property-photo-1.jpg",
    "file_type": "image/jpeg",
    "file_size": 2048000,
    "bucket": "property-media"
  }'

# Then upload media
curl -X POST "http://localhost:3000/api/properties/PROPERTY_ID_HERE/media" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -d '{
    "file_name": "property-photo-1.jpg",
    "file_url": "SIGNED_URL_FROM_PREVIOUS_RESPONSE",
    "media_type": "image",
    "is_primary": true
  }'
```

#### 11. Upload Property Documents
```bash
curl -X POST "http://localhost:3000/api/properties/PROPERTY_ID_HERE/documents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -d '{
    "file_name": "certificate-of-occupancy.pdf",
    "file_url": "SIGNED_DOCUMENT_URL",
    "document_type": "certificate_of_occupancy"
  }'
```

#### 12. Advanced Property Search
```bash
curl -X GET "http://localhost:3000/api/search/properties?query=lekki&state=Lagos&property_type=duplex&min_price=10000000&max_price=50000000&bedrooms=3&nepa_status=stable&has_bq=true&latitude=6.4698&longitude=3.5852&radius=5" \
  -H "Content-Type: application/json"
```

#### 13. Create Property Inquiry (User)
```bash
curl -X POST "http://localhost:3000/api/inquiries" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -d '{
    "property_id": "PROPERTY_ID_HERE",
    "message": "Hello! I am interested in this property. Is the price negotiable? When can we schedule a viewing?",
    "contact_phone": "+2348012345678",
    "contact_email": "user@example.com"
  }'
```

#### 14. Get User Inquiries (User View)
```bash
curl -X GET "http://localhost:3000/api/inquiries" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

#### 15. Get User Inquiries (Owner View)
```bash
curl -X GET "http://localhost:3000/api/inquiries" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OWNER_JWT_TOKEN"
```

#### 16. Owner Responds to Inquiry
```bash
curl -X PUT "http://localhost:3000/api/inquiries/INQUIRY_ID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -d '{
    "status": "responded",
    "response_message": "Thank you for your interest! The price is slightly negotiable. We can schedule a viewing this weekend."
  }'
```

#### 17. Save Property to Favorites
```bash
curl -X POST "http://localhost:3000/api/saved-properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -d '{
    "property_id": "PROPERTY_ID_HERE"
  }'
```

#### 18. Get Saved Properties
```bash
curl -X GET "http://localhost:3000/api/saved-properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

#### 19. Remove from Saved Properties
```bash
curl -X DELETE "http://localhost:3000/api/saved-properties?property_id=PROPERTY_ID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

#### 20. Check for Duplicate Properties
```bash
curl -X POST "http://localhost:3000/api/properties/PROPERTY_ID_HERE/duplicate-check" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -d '{
    "address": "Lekki Phase 1, Lagos",
    "latitude": 6.4698,
    "longitude": 3.5852,
    "radius": 0.5
  }'
```

### Admin Endpoints

#### 21. Get Properties Pending Admin Review
```bash
curl -X GET "http://localhost:3000/api/admin/properties?status=pending_vetting" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### 22. Admin Validates Property
```bash
curl -X PUT "http://localhost:3000/api/admin/properties/PROPERTY_ID_HERE/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "status": "live",
    "admin_notes": "Property verified. All documents valid, location confirmed."
  }'
```

### Notification Endpoints

#### 23. Get User Notifications
```bash
curl -X GET "http://localhost:3000/api/notifications" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

#### 24. Mark All Notifications as Read
```bash
curl -X POST "http://localhost:3000/api/notifications/mark-all-read" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

## Full Workflow Testing

### Complete Property Listing Flow

1. **Create Property** (Owner)
2. **Upload Media** (Owner)
3. **Upload Documents** (Owner)
4. **Check Duplicates** (Owner)
5. **Submit for Review** (Owner)
6. **Admin Review** (Admin)
7. **Property Goes Live** (System)
8. **User Searches** (User)
9. **User Inquires** (User)
10. **Owner Responds** (Owner)
11. **User Saves Property** (User)

### Complete User Journey

1. **User Registration** (Public)
2. **Profile Setup** (Authenticated)
3. **Property Search** (Public)
4. **Save Favorites** (Authenticated)
5. **Send Inquiry** (Authenticated)
6. **Receive Response** (Authenticated)
7. **View Notifications** (Authenticated)

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check JWT token is valid and not expired
   - Ensure user has correct permissions for the endpoint

2. **403 Forbidden**
   - Check user type (user vs owner vs agent vs admin)
   - Verify ownership of resources

3. **404 Not Found**
   - Check property/inquiry IDs exist
   - Verify correct API paths

4. **500 Internal Server Error**
   - Check server logs: `npm run dev` output
   - Verify database connection
   - Check environment variables

### Database Issues

```sql
-- Check table existence
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies WHERE schemaname = 'public';

-- Check user profiles
SELECT id, user_type, full_name FROM profiles;

-- Check properties
SELECT id, title, status, verification_status, owner_id FROM properties;
```

### Environment Variables

```bash
# Check if variables are set
echo $MAPBOX_ACCESS_TOKEN
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Testing Script

Run the automated testing script:

```bash
chmod +x test-apis.sh
./test-apis.sh
```

This script tests all endpoints systematically. Remember to update the placeholder values with real data from your database.

## Performance Testing

### Load Testing
```bash
# Test search endpoint with high load
ab -n 1000 -c 10 "http://localhost:3000/api/properties?state=Lagos"
```

### Database Query Analysis
```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

## Security Testing

### Authentication Testing
- Test with expired tokens
- Test with invalid tokens
- Test cross-user access attempts

### Authorization Testing
- Test user accessing owner-only endpoints
- Test owner accessing admin endpoints
- Test accessing other users' data

### Input Validation Testing
- Test with malformed JSON
- Test with oversized payloads
- Test with invalid Nigerian phone numbers
- Test with invalid coordinates

## Monitoring & Logging

### Check API Logs
```bash
# Server logs
npm run dev

# Check for errors in logs
grep "ERROR" logs/app.log
```

### Database Monitoring
```sql
-- Check connection count
SELECT count(*) FROM pg_stat_activity;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Success Criteria

✅ All endpoints return 200-201 status codes
✅ Authentication works correctly
✅ Authorization respects user roles
✅ Nigerian market features work (NEPA, BQ, etc.)
✅ File uploads work with signed URLs
✅ Search and filtering work
✅ Notifications are created automatically
✅ Duplicate detection works
✅ Geocoding works for Nigerian addresses
✅ Admin validation workflow works
✅ All CRUD operations work
✅ Real-time features work (notifications)

## Next Steps

1. **Frontend Integration**: Connect React components to these APIs
2. **Error Handling**: Implement proper error boundaries
3. **Caching**: Add Redis for frequently accessed data
4. **Rate Limiting**: Implement API rate limiting
5. **Monitoring**: Set up application monitoring
6. **Documentation**: Generate OpenAPI/Swagger docs

---

**Happy Testing!** 🎉

Remember: Always test with real data from your database and use proper authentication tokens. The APIs are production-ready but require proper setup and configuration.
