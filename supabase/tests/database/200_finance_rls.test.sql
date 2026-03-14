begin;
select plan(2);

select * from skip('financial_transactions missing', 2) where not has_table('public','financial_transactions');

do $$
declare
  inv_id uuid := gen_random_uuid();
begin
  insert into public.invoices(id,invoice_number,customer_name,invoice_date,due_date,total_amount)
  values (inv_id,'INV-TEST-001','Customer',current_date,current_date + 7,9999)
  on conflict do nothing;
end $$;

-- Finance staff can insert
select lives_ok($$
  do $$
  begin
    perform set_config('request.jwt.claims', json_build_object('sub','66666666-6666-6666-6666-666666666666','email','fin@test.local','app_role','FINANCE_STAFF')::text, true);
    execute 'set local role authenticated';

    insert into public.financial_transactions(transaction_id,transaction_type,reference_type,reference_id,amount)
    values ('TX-TEST-001','INVOICE','invoice',(select id from public.invoices where invoice_number='INV-TEST-001' limit 1),9999);
  end $$;
$$, 'Finance can insert financial transactions');

-- Merchant cannot insert
select throws_ok($$
  do $$
  begin
    perform set_config('request.jwt.claims', json_build_object('sub','77777777-7777-7777-7777-777777777777','email','merchantx@test.local','app_role','MERCHANT')::text, true);
    execute 'set local role authenticated';

    insert into public.financial_transactions(transaction_id,transaction_type,reference_type,reference_id,amount)
    values ('TX-TEST-002','INVOICE','invoice',(select id from public.invoices where invoice_number='INV-TEST-001' limit 1),1);
  end $$;
$$, '.*row-level security.*', 'Merchant blocked from finance writes');

select * from finish();
rollback;
