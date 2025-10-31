# RealProof - Verified Real Estate Marketplace

A modern real estate marketplace that ensures data integrity through ML-powered document validation and physical vetting, eliminating duplicates and providing verified listings.

## Features

- **No Duplicates**: Advanced ML algorithms detect and prevent duplicate property listings
- **Verified Listings**: Physical vetting and document validation ensure authenticity
- **Live Location Mapping**: Accurate geolocation for all properties
- **Comprehensive Search**: Advanced filters and map-based search
- **Role-Based Access**: Separate dashboards for property owners, buyers, and admins
- **Scalable Architecture**: Built with Next.js 16, Supabase, and HeroUI v3

## Tech Stack

- **Frontend**: Next.js 16, React 19, HeroUI v3, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Database**: PostgreSQL with PostGIS for geospatial data
- **Deployment**: Vercel (recommended)
- **Version Control**: Git with Commitlint

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd realproof-marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Setup

#### Option 1: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Initialize Supabase in your project:
```bash
supabase init
```

3. Start local Supabase:
```bash
supabase start
```

4. Run migrations:
```bash
supabase db push
```

#### Option 2: Manual Setup

If you prefer not to use the CLI, you can run the SQL scripts directly in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the scripts in order:
   - `scripts/001_create_profiles.sql`
   - `scripts/002_create_properties.sql`
   - `scripts/003_create_property_details.sql`
   - `scripts/004_create_property_documents.sql`
   - `scripts/005_create_property_media.sql`
   - `scripts/006_create_inquiries.sql`
   - `scripts/007_create_profile_trigger.sql`

### Development

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
realproof-marketplace/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── property/          # Property detail pages
│   ├── search/            # Search page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # HeroUI components
│   └── ...               # Feature components
├── lib/                  # Utility libraries
│   └── supabase/         # Supabase client and types
├── scripts/              # Database setup scripts
├── docs/                 # Documentation and mockups
└── public/               # Static assets
```

## Database Schema

The application uses the following main tables:

- `profiles`: User profiles with role-based access
- `properties`: Property listings with verification status
- `property_details`: Detailed property information
- `property_documents`: Document storage with ML validation
- `property_media`: Images, videos, and virtual tours
- `inquiries`: Communication between buyers and owners

## Key Features Implementation

### ML Document Validation
- OCR for text extraction from documents
- Computer vision for authenticity checks
- NLP for content validation

### Physical Vetting Process
- Mobile app for vetting team
- GPS tracking and timestamp verification
- Photo/video evidence collection

### Duplicate Prevention
- Fuzzy matching algorithms
- Image hashing for media comparison
- Geospatial clustering

## Contributing

1. Follow conventional commit messages:
```bash
npm run commit
```

2. Ensure all tests pass:
```bash
npm test
```

3. Create a pull request with a clear description

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.