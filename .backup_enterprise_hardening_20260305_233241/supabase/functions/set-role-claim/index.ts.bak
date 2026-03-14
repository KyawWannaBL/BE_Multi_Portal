import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS Preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Parse the request body
    const { user_id, role } = await req.json()

    if (!user_id || !role) {
      throw new Error('Missing user_id or role')
    }

    // 3. Initialize Supabase Admin Client
    // We use the SERVICE_ROLE_KEY to bypass RLS and modify Auth schema
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Update the User's app_metadata
    // 'app_metadata' is secure and included in the JWT. 
    // 'user_metadata' is editable by the user (insecure for roles).
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { app_metadata: { role: role } }
    )

    if (error) throw error

    // 5. Return success response
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})