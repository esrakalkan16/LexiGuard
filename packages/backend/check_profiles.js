require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const s = require('./lib/supabase');
async function check() {
  const { data, error } = await s.from('profiles').select('*');
  console.log('Profiles:', data ? data.length : error);
}
check();
