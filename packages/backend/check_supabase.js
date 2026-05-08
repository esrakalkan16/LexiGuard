require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const s = require('./lib/supabase');
async function check() {
  const { data, error } = await s.from('contracts').select('*');
  console.log('Contracts:', data ? data.length : error);
  const { data: users, error: uError } = await s.auth.admin.listUsers();
  console.log('Users:', users ? users.users.length : uError);
}
check();
