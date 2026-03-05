
import { createClient } from '@supabase/supabase-js'



// USE YOUR SERVICE ROLE KEY (Found in Settings > API)

const supabase = createClient(

  'https://dltavabvjwocknkyvwgz.supabase.co', 

  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGF2YWJ2andvY2tua3l2d2d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTExMzE5NCwiZXhwIjoyMDg2Njg5MTk0fQ.ckX1XXGgKPzD3IBW6yG2iG2RGfkQXyjE9IQbQZMMymA' 

)



const targetUsers = ['mgkyawwanna@gmail.com', 'sainyanhtun@gmail.com'];



async function updateUsers() {

  const { data: { users }, error: fetchError } = await supabase.auth.admin.listUsers();

  

  if (fetchError) return console.error("Error fetching users:", fetchError);



  for (const email of targetUsers) {

    const user = users.find(u => u.email === email);

    

    if (user) {

      const { error: updateError } = await supabase.auth.admin.updateUserById(

        user.id,

        { 

          password: 'Sh@nstar28',

          user_metadata: { role: 'admin' } 

        }

      );

      

      if (updateError) console.error(`❌ Failed for ${email}:`, updateError.message);

      else console.log(`✅ ${email}: Password & Admin Role updated.`);

    } else {

      console.log(`⚠️ User ${email} not found in this project.`);

    }

  }

}



updateUsers();

