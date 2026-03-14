begin;
select plan(2);

select * from skip('support_tickets missing', 2) where not has_table('public','support_tickets');

-- Support can insert
select lives_ok($$
  do $$
  begin
    perform set_config('request.jwt.claims', json_build_object('sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','email','cs@test.local','app_role','CUSTOMER_SERVICE')::text, true);
    execute 'set local role authenticated';

    insert into public.support_tickets(ticket_number,customer_name,customer_email,subject,description)
    values ('TCK-TEST-001','Cust','cust@test.local','Help','Need help');
  end $$;
$$, 'Support can insert ticket');

-- Customer cannot insert support ticket (only Support role)
select throws_ok($$
  do $$
  begin
    perform set_config('request.jwt.claims', json_build_object('sub','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','email','cust2@test.local','app_role','CUSTOMER')::text, true);
    execute 'set local role authenticated';

    insert into public.support_tickets(ticket_number,customer_name,customer_email,subject,description)
    values ('TCK-TEST-002','Cust','cust2@test.local','Help','Need help');
  end $$;
$$, '.*row-level security.*', 'Customer blocked from inserting support tickets');

select * from finish();
rollback;
