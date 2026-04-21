
import { createClient } from './src/lib/supabase/client';

async function testAccess() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.log("No session found. Please log in.");
    return;
  }

  console.log("User:", session.user.id);
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error("Error accessing 'users' table:", error.message);
  } else {
    console.log("Successfully accessed 'users' table:", data);
  }
  
  const { data: branding, error: brandingError } = await supabase
    .from('workspace_branding')
    .select('*')
    .limit(1);

  if (brandingError) {
    console.error("Error accessing 'workspace_branding' table:", brandingError.message);
  } else {
    console.log("Successfully accessed 'workspace_branding' table:", branding);
  }
}

testAccess();
