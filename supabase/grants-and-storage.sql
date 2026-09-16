-- Run after schema.sql and functions.sql.
-- Supabase Data API needs table/function grants in addition to RLS.

grant usage on schema public to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select,insert,update on public.profiles, public.companies to authenticated;
grant select on public.supplier_profiles, public.machines, public.supplier_capabilities to authenticated;
grant select,insert,update on public.rfqs, public.rfq_files to authenticated;
grant select,insert on public.supplier_matches to authenticated;
grant select,insert,update on public.quotes to authenticated;
grant select,insert,update on public.orders, public.order_items, public.purchase_orders to authenticated;
grant select,insert on public.payments, public.platform_fees, public.supplier_payouts to authenticated;
grant select,insert,update on public.production_updates, public.quality_documents, public.shipments, public.disputes to authenticated;
grant select,insert on public.conversations, public.conversation_members, public.messages, public.reviews, public.notifications, public.audit_logs to authenticated;
grant usage,select on all sequences in schema public to authenticated;
grant execute on function public.submit_rfq(jsonb) to authenticated;
grant execute on function public.create_order_from_quote(uuid,numeric) to authenticated;
grant execute on function public.set_order_commission(uuid,numeric) to authenticated;

insert into storage.buckets(id,name,public) values
('rfq-files','rfq-files',false),('order-documents','order-documents',false),('quality-documents','quality-documents',false)
on conflict (id) do nothing;

-- Files are private. Signed URLs should be generated only after the table-level
-- authorization check. These policies restrict browser uploads to authenticated users.
create policy rfq_storage_read on storage.objects for select to authenticated using (bucket_id='rfq-files');
create policy rfq_storage_insert on storage.objects for insert to authenticated with check (bucket_id='rfq-files' and (storage.foldername(name))[1]=auth.uid()::text);
create policy order_docs_read on storage.objects for select to authenticated using (bucket_id in ('order-documents','quality-documents'));
create policy order_docs_insert on storage.objects for insert to authenticated with check (bucket_id in ('order-documents','quality-documents') and (storage.foldername(name))[1]=auth.uid()::text);
