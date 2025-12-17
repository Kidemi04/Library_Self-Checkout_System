# Library Self-Checkout System

[![Test Build Next.js in Ubuntu](https://github.com/Kidemi04/Library_Self-Checkout_System/actions/workflows/test.yml/badge.svg)](https://github.com/Kidemi04/Library_Self-Checkout_System/actions/workflows/test.yml)

A modern, web-based library self-service system built with Next.js 14, featuring Azure AD authentication, Supabase backend, and a responsive mobile-first design.

## Features

- **Self-Service Operations**
  - Book borrowing and returns
  - QR code / barcode scanning support
  - Real-time availability checking
  - Active loans management

- **User Management**
  - Azure AD integration
  - Role-based access control (User/Staff/Admin)
  - Profile customization
  - User activity tracking

- **Admin Dashboard**
  - Comprehensive book management
  - User administration
  - Loan history and analytics
  - System settings configuration
- **Digital Learning Integration**
  - LinkedIn Learning search and curation hub
  - Sample data fallback for demos without credentials
  - Quick filters for AI, customer experience, and leadership topics

## Technology Stack

- **Frontend**
  - [Next.js 14](https://nextjs.org/) - React framework with App Router
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
  - [Heroicons](https://heroicons.com/) - SVG icons

- **Backend**
  - [Supabase](https://supabase.com/) - PostgreSQL database
  - [Azure AD](https://azure.microsoft.com/en-us/services/active-directory/) - Authentication
  - [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) - Server-side endpoints

## Getting Started

### Prerequisites

1. Install Node.js
   - Download and install from [Node.js Official Website](https://nodejs.org/)
   - Recommended version: 18.x or later

2. Install pnpm
   ```bash
   npm install -g pnpm
   ```

3. Set up Supabase Project
   - Create a new project at [Supabase](https://supabase.com/)
   - Keep your project URL and keys handy

4. Configure Azure AD
   - Set up an App Registration in Azure Portal
   - Configure redirect URIs
   - Note down your client ID and tenant ID

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Kidemi04/Library_Self-Checkout_System.git
   cd Library_Self-Checkout_System
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase and Azure AD credentials.

4. Start the development server
   ```bash
   pnpm dev
   ```

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Azure AD Configuration
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id

# Development Settings (optional)
DEV_BYPASS_AUTH=false
DEV_BYPASS_ROLE=user
DEV_AZURE_EMAIL_SUFFIX=@your-domain.com
```

### Azure AD Setup

1. Create an App Registration
   - Navigate to Azure Portal > App Registrations
   - Create a new registration
   - Set supported account types

2. Configure Authentication
   - Platform: Web
   - Redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/azure-ad
     http://localhost:3000/auth/azure-logout
     https://your-domain.com/api/auth/callback/azure-ad
     https://your-domain.com/auth/azure-logout
     ```
   - Enable ID tokens

3. Configure App Roles
   - Add roles for 'user', 'staff', and 'admin'
   - Assign roles to users as needed

### Custom Styling

The project uses custom Tailwind CSS colors prefixed with 'swin-':
- `swin-red`
- `swin-charcoal`
- `swin-ivory`

Configure these in `tailwind.config.ts`.

## Database Setup

### Core Tables

```sql
-- Enums
CREATE TYPE public.user_role AS ENUM ('user','staff','admin');
CREATE TYPE public.copy_status AS ENUM ('AVAILABLE','ON_LOAN','LOST','DAMAGED','PROCESSING','HOLD_SHELF');
CREATE TYPE public.profile_visibility AS ENUM ('PUBLIC','CAMPUS','PRIVATE');

-- Books and Copies
CREATE TABLE books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text,
  publisher text,
  isbn text UNIQUE,
  classification text,
  cover_image_url text,
  publication_year text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE copies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  barcode text NOT NULL UNIQUE,
  status public.copy_status NOT NULL DEFAULT 'AVAILABLE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User Management
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  display_name text,
  role public.user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username citext UNIQUE,
  display_name text,
  avatar_url text,
  phone text,
  student_id text UNIQUE,
  visibility public.profile_visibility NOT NULL DEFAULT 'CAMPUS'
);

-- Circulation
CREATE TABLE loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_id uuid NOT NULL REFERENCES copies(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  borrowed_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz NOT NULL,
  returned_at timestamptz,
  renewed_count int NOT NULL DEFAULT 0,
  handled_by uuid REFERENCES users(id) ON DELETE SET NULL
);
```

### Security Policies

Set up these Row Level Security (RLS) policies in Supabase:

```sql
-- Allow users to view available books
CREATE POLICY "Public book viewing"
ON public.books FOR SELECT
TO authenticated
USING (true);

-- Allow staff to manage books
CREATE POLICY "Staff book management"
ON public.books FOR ALL
TO authenticated
USING (auth.uid() IN (
  SELECT id FROM users WHERE role IN ('staff', 'admin')
));

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

## Development Notes

### Local Testing

- For Azure AD testing:
  - Use `DEV_AZURE_EMAIL_SUFFIX` in `.env.local`
  - Set up test users in Azure AD
  - Configure redirect URIs for localhost

- Quick Development:
  - Use `DEV_BYPASS_AUTH=true`
  - Set `DEV_BYPASS_ROLE` as needed
  - Remember to disable before deployment

### LinkedIn Learning Setup

1. Request LinkedIn Learning API access
   - Create or reuse a LinkedIn Developer application inside your organization tenant
   - Request the **LinkedIn Learning** product and ensure the tenant owns an enterprise subscription
2. Configure OAuth client credentials
   - In the developer portal add the `learning openid profile r_liteprofile r_emailaddress organization_learning` scopes
   - Copy the client ID and client secret
3. Populate the environment variables in `.env.local`
   ```env
   LINKEDIN_LEARNING_CLIENT_ID=xxxxxxxx
   LINKEDIN_LEARNING_CLIENT_SECRET=xxxxxxxx
   LINKEDIN_LEARNING_ORGANIZATION_URN=urn:li:organization:123456
   LINKEDIN_LEARNING_DEFAULT_LOCALE=en_US
   LINKEDIN_LEARNING_API_VERSION=202404
   LINKEDIN_LEARNING_SCOPE="learning openid profile r_liteprofile r_emailaddress organization_learning"
   ```
4. Optional: keep `LINKEDIN_LEARNING_USE_STUB=true` locally to use the bundled sample catalogue without real API calls
5. Open `/dashboard/learning` to search courses, explore curated topics, and verify whether the module is using live or sample data via the status badges

### Mobile Testing

- Test responsive design on various devices
- Check scanner functionality on real devices
- Verify touch interactions work properly
- Test under different network conditions

## Production Deployment

1. Environment Setup
   - Update all environment variables
   - Remove development settings
   - Configure production database URLs

2. Azure AD Configuration
   - Update redirect URIs for production domain
   - Ensure proper tenant settings
   - Configure proper scopes and permissions

3. Supabase Setup
   - Review and update RLS policies
   - Configure proper backups
   - Set up monitoring and alerts

4. Final Checks
   - Test all auth flows
   - Verify mobile responsiveness
   - Ensure proper error handling
   - Check performance and loading times
