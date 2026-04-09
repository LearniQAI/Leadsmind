# LeadsMind - SaaS CRM + LMS Platform

Phase 1: Auth & Multi-Tenant Foundation

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js 18+ 
- Supabase Project
- Resend Account (for emails)

### 2. Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase Storage Setup
To enable avatar uploads, you must create a public bucket named `avatars`. Run the following SQL in the Supabase SQL Editor:

```sql
-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- 2. Allow public access to read avatars
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- 3. Allow authenticated users to upload avatars
create policy "Authenticated users can upload avatars"
on storage.objects for insert
with check (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- 4. Allow users to update/delete their own avatars
create policy "Users can update their own avatars"
on storage.objects for update
using ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can delete their own avatars"
on storage.objects for delete
using ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
```

### 4. Installation & Development
```bash
npm install
npm run dev
```

---

## 🛠 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4 + custom design tokens
- **Auth**: Supabase Auth
- **Database**: Supabase (Postgres) + RLS
- **Components**: shadcn/ui + Base UI
- **Email**: Resend
