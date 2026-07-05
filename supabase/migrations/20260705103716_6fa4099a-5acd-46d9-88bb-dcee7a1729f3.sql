
REVOKE EXECUTE ON FUNCTION public.has_paid_access(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_paid_access(UUID) TO authenticated, service_role;
