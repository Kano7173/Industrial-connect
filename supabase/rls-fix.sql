-- Run after schema.sql. Replaces mutually-recursive RFQ/match policies.

create or replace function public.is_rfq_buyer(p_rfq uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from rfqs where id=p_rfq and buyer_company_id=my_company_id());
$$;
create or replace function public.is_rfq_matched_supplier(p_rfq uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from supplier_matches where rfq_id=p_rfq and supplier_id=my_supplier_id());
$$;
create or replace function public.complete_company_profile(p_name text,p_phone text default null,p_gstin text default null,p_address text default null,p_city text default null,p_state text default null,p_pincode text default null) returns uuid
language plpgsql security definer set search_path=public as $$
declare cid uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into companies(name,phone,gstin,address,city,state,pincode) values(p_name,p_phone,p_gstin,p_address,p_city,p_state,p_pincode) returning id into cid;
 update profiles set company_id=cid,phone=coalesce(p_phone,phone) where id=auth.uid();
 return cid;
end; $$;
grant execute on function public.complete_company_profile(text,text,text,text,text,text,text) to authenticated;

drop policy if exists rfq_buyer_read on public.rfqs;
create policy rfq_buyer_read on public.rfqs for select using (is_rfq_buyer(id) or public.is_admin() or is_rfq_matched_supplier(id));

drop policy if exists matches_read on public.supplier_matches;
create policy matches_read on public.supplier_matches for select using (public.is_admin() or supplier_id=public.my_supplier_id() or public.is_rfq_buyer(rfq_id));

-- Supplier quote policy should not depend on recursive RFQ RLS.
drop policy if exists quotes_supplier_insert on public.quotes;
create policy quotes_supplier_insert on public.quotes for insert with check (supplier_id=public.my_supplier_id() and exists(select 1 from supplier_matches m where m.rfq_id=rfq_id and m.supplier_id=public.my_supplier_id()));
