-- Check current policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'waitlist';

-- Check if RLS is enabled
SELECT
    relname,
    relrowsecurity,
    relforcerowsecurity
FROM pg_class
WHERE relname = 'waitlist';

-- Check grants
SELECT
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'waitlist';