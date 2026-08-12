const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkBucket() {
  const { data, error } = await supabase.storage.getBucket('uploads');
  if (error) {
    console.error('Bucket Error:', error.message);
  } else {
    console.log('Bucket exists:', data.name);
  }
}
checkBucket();
