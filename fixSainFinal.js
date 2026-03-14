
import { createClient } from '@supabase/supabase-js'



// PASTE YOUR KEY INSIDE THE QUOTES BELOW

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGF2YWJ2andvY2tua3l2d2d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTExMzE5NCwiZXhwIjoyMDg2Njg5MTk0fQ.ckX1XXGgKPzD3IBW6yG2iG2RGfkQXyjE9IQbQZMMymA'; 

const SUPABASE_URL = 'https://dltavabvjwocknkyvwgz.supabase.co';



const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {

  auth: {

    autoRefreshToken: false,

    persistSession: false

  }

});



async function runFix() {

  const email = 'sainyanhtun82@gmail.com';

  console.log(`Authenticating with Bearer Token for ${email}...`);



  // 1. Find user in the NEW project

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  

  if (listError) return console.error("🚨 Auth Failed:", listError.message);



  const user = users.find(u => u.email === email);

  if (!user) return console.error("❌ User not found in this project.");



  // 2. Inject Metadata

  const { error: updateError } = await supabase.auth.admin.updateUserById(

    user.id,

    { user_metadata: { role: 'admin', full_name: 'Sain Yan Htun' } }

  );



  if (updateError) console.error("❌ Update Error:", updateError.message);

  else console.log(`✅ Success! ${email} is now an Admin.`);

}



runFix();

