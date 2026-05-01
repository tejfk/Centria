const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing environment variables. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createVaultBucket() {
  console.log('Attempting to create "vault" bucket...');
  const { data, error } = await supabase.storage.createBucket('vault', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf'],
    fileSizeLimit: 5242880 // 5MB
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Note: Bucket "vault" already exists.');
    } else {
      console.error('Error creating bucket:', error.message);
    }
  } else {
    console.log('🎉 Success! Bucket "vault" created successfully.');
  }
}

createVaultBucket();
