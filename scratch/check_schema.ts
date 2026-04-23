import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking websites table schema...');
    
    // Attempt to select one row and see the columns
    const { data, error } = await supabase
        .from('websites')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching websites:', error);
    } else if (data && data.length > 0) {
        console.log('Columns in websites table:', Object.keys(data[0]));
    } else {
        console.log('No data in websites table to check columns.');
        
        // Alternative: use rpc or just try to select status specifically
        const { error: statusError } = await supabase
            .from('websites')
            .select('status')
            .limit(1);
            
        if (statusError) {
            console.error('Error selecting status column:', statusError);
        } else {
            console.log('status column exists.');
        }
    }
}

checkSchema();
