begin;
select plan(2);

select * from skip('public.shipment_tracking missing', 1) where not has_table('public', 'shipment_tracking');
select ok(true, 'public.shipment_tracking exists') where has_table('public','shipment_tracking');

select * from skip('public.shipments missing', 1) where not has_table('public', 'shipments');
select ok(true, 'public.shipments exists') where has_table('public','shipments');

select * from finish();
rollback;
