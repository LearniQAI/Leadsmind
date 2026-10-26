import { config } from 'dotenv';
import { resolve } from 'path';

// Loads the same isolated-dev-project credentials Next.js reads from .env.local. Vitest doesn't
// go through Next's own env loader, so the live integration tests need this to find
// NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY etc.
config({ path: resolve(__dirname, '.env.local') });
