-- 2026-03-05: Absolute Final Identity Schema Repair
-- EN: Creates all missing core tables (merchants, customers, users, enhanced) and repairs view.
-- MY: လိုအပ်နေသော ဇယားများ (merchants, customers, users) အားလုံးကို တစ်ခါတည်း တည်ဆောက်ပြီး ပြင်ဆင်ခြင်း။

BEGIN;

-- 1. Create Core Platform Tables (The "missing" relations)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  role text DEFAULT 'USER',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  business_name text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  full_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.users_enhanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text,
  department text,
  is_active boolean DEFAULT true
);

-- 2. Create the Identity View (Now with all tables existing)
CREATE OR REPLACE VIEW public.app_identities AS
WITH me AS (
  SELECT
    auth.uid() AS auth_user_id,
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) AS jwt_email
)
SELECT
  me.auth_user_id,
  NULLIF(me.jwt_email, '') AS email,
  u.id AS user_id,
  m.id AS merchant_id,
  c.id AS customer_id,
  ue.id AS user_enhanced_id,
  COALESCE(
    ue.role::text,
    p.role_code::text, -- Priority for Enterprise roles
    p.role::text,      -- Fallback for basic profiles
    u.role::text,
    NULL
  ) AS primary_role
FROM me
LEFT JOIN public.profiles p ON p.id = me.auth_user_id
LEFT JOIN public.users_enhanced ue ON ue.auth_user_id = me.auth_user_id
LEFT JOIN public.users u ON LOWER(u.email) = me.jwt_email
LEFT JOIN public.merchants m ON LOWER(m.email) = me.jwt_email
LEFT JOIN public.customers c ON LOWER(c.email) = me.jwt_email;

-- 3. Restore Identity Helpers
CREATE OR REPLACE FUNCTION public.current_user_id() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT user_id FROM public.app_identities;
$$;

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r text;
BEGIN
  SELECT primary_role INTO r FROM public.app_identities;
  RETURN r;
END;
$$;

COMMIT;