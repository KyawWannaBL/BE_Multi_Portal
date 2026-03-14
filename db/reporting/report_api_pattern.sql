-- PostgreSQL function pattern for paginated JSON report responses
-- Adapt table/view names and filters to your schema.

create or replace function api_report_ways_count(
  p_page integer default 1,
  p_page_size integer default 20,
  p_sort_by text default 'count',
  p_sort_order text default 'desc',
  p_date_from date default null,
  p_date_to date default null,
  p_branch_id uuid default null,
  p_township text default null,
  p_merchant text default null
)
returns jsonb
language plpgsql
as $$
declare
  v_offset integer := greatest((p_page - 1) * p_page_size, 0);
  v_total integer;
  v_items jsonb;
  v_summary jsonb;
begin
  select count(*)
    into v_total
  from rpt_ways_count_report r
  where (p_date_from is null or r.report_date::date >= p_date_from)
    and (p_date_to is null or r.report_date::date <= p_date_to)
    and (p_branch_id is null or r.branch_id = p_branch_id)
    and (p_township is null or r.township ilike '%' || p_township || '%')
    and (p_merchant is null or r.merchant_name ilike '%' || p_merchant || '%');

  select jsonb_agg(to_jsonb(x))
    into v_items
  from (
    select *
    from rpt_ways_count_report r
    where (p_date_from is null or r.report_date::date >= p_date_from)
      and (p_date_to is null or r.report_date::date <= p_date_to)
      and (p_branch_id is null or r.branch_id = p_branch_id)
      and (p_township is null or r.township ilike '%' || p_township || '%')
      and (p_merchant is null or r.merchant_name ilike '%' || p_merchant || '%')
    order by
      case when p_sort_by = 'township' and p_sort_order = 'asc' then r.township end asc,
      case when p_sort_by = 'township' and p_sort_order = 'desc' then r.township end desc,
      case when p_sort_by = 'count' and p_sort_order = 'asc' then r.count end asc,
      case when p_sort_by = 'count' and p_sort_order = 'desc' then r.count end desc
    offset v_offset
    limit p_page_size
  ) x;

  select jsonb_build_object(
    'totalWays', coalesce(sum(count), 0),
    'activeWays', coalesce(sum(count), 0),
    'closedWays', 0
  )
    into v_summary
  from rpt_ways_count_report r
  where (p_date_from is null or r.report_date::date >= p_date_from)
    and (p_date_to is null or r.report_date::date <= p_date_to)
    and (p_branch_id is null or r.branch_id = p_branch_id)
    and (p_township is null or r.township ilike '%' || p_township || '%')
    and (p_merchant is null or r.merchant_name ilike '%' || p_merchant || '%');

  return jsonb_build_object(
    'items', coalesce(v_items, '[]'::jsonb),
    'total', coalesce(v_total, 0),
    'page', p_page,
    'pageSize', p_page_size,
    'summary', coalesce(v_summary, '{}'::jsonb)
  );
end;
$$;
