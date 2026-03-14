
import { createClient } from '@supabase/supabase-js'



// USE YOUR FULL SERVICE ROLE KEY (sb_secret_...)

const supabase = createClient(

  'https://dltavabvjwocknkyvwgz.supabase.co',

  'sb_publishable_x1RtZqu_R4UNjwKAZWyQ3w_iU5ct4m3' 

)



const email = 'sainyanhtun82@gmail.com';



async function syncUser() {

  console.log(`Checking project for: ${email}...`);

  

  // 1. Get the list of all users in the NEW project

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  

  if (listError) return console.error("🚨 Database Connection Failed:", listError.message);



  const user = users.find(u => u.email === email);



  if (!user) {

    return console.error(`❌ User ${email} NOT FOUND in project dltavabv. Please create them in the Dashboard first.`);

  }



  console.log(`Found User! Internal ID in this project: ${user.id}`);



  // 2. Update the user using the CORRECT ID for this project

  const { data, error } = await supabase.auth.admin.updateUserById(

    user.id,

    { user_metadata: { role: 'admin', full_name: 'Sain Yan Htun' } }

  );



  if (error) console.error("❌ Update Failed:", error.message);

  else console.log("✅ Metadata injected successfully with the correct Project ID!");

}



syncUser();

