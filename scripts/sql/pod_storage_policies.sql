-- EN: Storage policies for bucket "pod" (optional)
-- MY: Bucket "pod" အတွက် Storage policy (optional)

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='pod_objects_insert') then
    create policy pod_objects_insert
      on storage.objects for insert to authenticated
      with check (bucket_id = 'pod');
  end if;

  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='pod_objects_select') then
    create policy pod_objects_select
      on storage.objects for select to authenticated
      using (bucket_id = 'pod');
  end if;
end $$;
