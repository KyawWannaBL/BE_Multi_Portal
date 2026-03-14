-- PostgreSQL report template examples
-- Replace table names and field names with your live schema.

-- Example 1: ways count report
create or replace view rpt_ways_count_report as
select
  w.township,
  m.name as merchant_name,
  count(*) as count,
  date_trunc('day', w.created_at) as report_date,
  w.branch_id
from ways w
left join merchants m on m.id = w.merchant_id
group by w.township, m.name, date_trunc('day', w.created_at), w.branch_id;

-- Example 2: overdue ways by merchant
create or replace view rpt_overdue_ways_by_merchant as
select
  m.name as merchant_name,
  count(*) as overdue_count,
  date_trunc('day', w.created_at) as report_date,
  w.branch_id
from ways w
left join merchants m on m.id = w.merchant_id
where w.status = 'OVERDUE'
group by m.name, date_trunc('day', w.created_at), w.branch_id;

-- Example 3: account balance report
create or replace view rpt_account_balance as
select
  a.account_code,
  a.account_name,
  sum(coalesce(gl.debit, 0)) as debit,
  sum(coalesce(gl.credit, 0)) as credit,
  sum(coalesce(gl.debit, 0)) - sum(coalesce(gl.credit, 0)) as balance,
  gl.branch_id,
  date_trunc('day', gl.entry_date) as report_date
from general_ledger gl
join accounts a on a.id = gl.account_id
group by a.account_code, a.account_name, gl.branch_id, date_trunc('day', gl.entry_date);

-- Example 4: merchant receipts
create or replace view rpt_merchant_receipts as
select
  r.receipt_no,
  m.name as merchant_name,
  r.amount,
  r.receipt_date,
  r.status,
  r.branch_id
from receipts r
left join merchants m on m.id = r.merchant_id;
