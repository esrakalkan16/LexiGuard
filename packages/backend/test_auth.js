require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const s = require('./lib/supabase');

async function test() {
  const { data, error } = await s.auth.signUp({
    email: 'test_bot@example.com',
    password: 'password123'
  });
  
  let token = data?.session?.access_token;
  if (!token) {
    const { data: signData } = await s.auth.signInWithPassword({
      email: 'test_bot@example.com',
      password: 'password123'
    });
    token = signData?.session?.access_token;
  }
  
  if (!token) {
    console.log("Token alinamadi:", error);
    return;
  }

  const FormData = require('form-data');
  const { default: fetch } = await import('node-fetch');
  
  const form = new FormData();
  form.append('file', Buffer.from('this is a test contract to pass the 50 char limit. we are checking if db insertion works.'), { filename: 'test.txt', contentType: 'text/plain' });

  const res = await fetch('http://localhost:3000/api/analyze', {
    method: 'POST',
    body: form,
    headers: {
      ...form.getHeaders(),
      'Authorization': `Bearer ${token}`
    }
  });

  const json = await res.json();
  console.log("Backend Yaniti:", json.db_record ? "KAYDEDILDI: " + json.db_record.id : "KAYDEDILMEDI");
}

test();
