
import { createClient } from '@supabase/supabase-js'



// USE YOUR FULL SERVICE ROLE KEY

const supabase = createClient(

  'https://dltavabvjwocknkyvwgz.supabase.co',

  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGF2YWJ2andvY2tua3l2d2d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTExMzE5NCwiZXhwIjoyMDg2Njg5MTk0fQ.ckX1XXGgKPzD3IBW6yG2iG2RGfkQXyjE9IQbQZMMymA'

)



async function forceAdmin() {

  console.log("Attempting to bypass 'Find User' and force metadata injection...");

  

  // We use createUser with 'email_confirm: true' to overwrite/sync the record

  const { data, error } = await supabase.auth.admin.createUser({

    email: 'sainyanhtun82@gmail.com',

    password: 'Sh@nstar28', // Use your existing password

    user_metadata: { role: 'admin', full_name: 'Sain Yan Htun' },

    email_confirm: true

  });



  if (error) {

    console.error("🚨 Database still unresponsive:", error.message);

    console.log("TIP: If it says 'already exists', the database is up but the ID is stuck.");

  } else {

    console.log("✅ Success! Forced metadata update for Sain Yan Htun.");

  }

}



forceAdmin();

