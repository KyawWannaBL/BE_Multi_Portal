begin;
select plan(2);

select * from skip('employees missing', 2) where not has_table('public','employees');

-- HR can insert
select lives_ok($$
  do $$
  begin
    perform set_config('request.jwt.claims', json_build_object('sub','88888888-8888-8888-8888-888888888888','email','hr@test.local','app_role','HR_ADMIN')::text, true);
    execute 'set local role authenticated';

    insert into public.employees(employee_code,first_name,last_name,job_title,hire_date)
    values ('EMP-TEST-001','A','B','HR',current_date);
  end $$;
$$, 'HR can insert employees');

-- Finance cannot insert employees
select throws_ok($$
  do $$
  begin
    perform set_config('request.jwt.claims', json_build_object('sub','99999999-9999-9999-9999-999999999999','email','fin2@test.local','app_role','FINANCE_STAFF')::text, true);
    execute 'set local role authenticated';

    insert into public.employees(employee_code,first_name,last_name,job_title,hire_date)
    values ('EMP-TEST-002','X','Y','No',current_date);
  end $$;
$$, '.*row-level security.*', 'Finance blocked from HR writes');

select * from finish();
rollback;
