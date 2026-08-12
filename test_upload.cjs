const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  'https://dwqfwfplsvxdoyzorvxr.supabase.co',
  process.env.SUPABASE_KEY
);

async function testUpload() {
  const buffer = Buffer.from('test data');
  console.log('Attempting upload with key:', process.env.SUPABASE_KEY.substring(0, 15) + '...');
  
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload('test.txt', buffer, {
      contentType: 'text/plain',
      upsert: true
    });

  if (error) {
    console.error('Upload failed:', error.message);
  } else {
    console.log('Upload successful:', data);
  }
}

testUpload();
