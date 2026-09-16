-- IndustrialConnect V2 production schema
-- Run this file in Supabase SQL Editor before enabling live mode.
-- Never put a service-role key in the browser.

create extension if not exists pgcrypto;

create type public.user_role as enum ('buyer','supplier','admin');
create type public.rfq_status as enum ('draft','submitted','under_review','matching','quotation_open','shortlisted','order_created','cancelled','expired');
create type public.quote_status as enum ('draft','submitted','under_review','shortlisted','rejected','accepted','expired','withdrawn');
create type public.order_status as enum ('payment_pending','payment_received','confirmed','production_pending','in_production','quality_check','ready_to_dispatch','dispatched','delivered','buyer_inspection','completed','disputed','cancelled');
create type public.production_status as enum ('order_confirmed','material_procurement','material_received','production_started','production_25','production_50','production_75','production_completed','quality_check','packed','dispatched');
create type public.document_status as enum ('pending','submitted','under_review','approved','rejected');
create type public.shipment_status as enum ('ready','dispatched','in_transit','delivered','delivery_exception');
create type public.dispute_status as enum ('open','under_review','waiting_for_buyer','waiting_for_supplier','resolved','rejected','closed');
create type public.payout_status as enum ('pending','eligible','processing','paid','failed','on_hold');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  gstin text,
  phone text,
  email text,
  address text,
  city text,
  state text,
  pincode text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'buyer',
  company_id uuid references public.companies(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  active boolean not null default true
);

create table public.supplier_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected','suspended')),
  years_experience integer default 0,
  description text,
  on_time_rate numeric(5,2) default 0,
  quality_rate numeric(5,2) default 0,
  certifications text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.machines (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.supplier_profiles(id) on delete cascade,
  machine_type text not null,
  make_model text,
  quantity integer not null default 1 check (quantity > 0),
  max_capacity text,
  created_at timestamptz not null default now()
);

create table public.supplier_capabilities (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.supplier_profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  materials text[] default '{}',
  tolerance_capability text,
  active boolean not null default true,
  unique(supplier_id, category_id)
);

create table public.rfqs (
  id uuid primary key default gen_random_uuid(),
  rfq_number bigint generated always as identity unique,
  buyer_company_id uuid not null references public.companies(id),
  created_by uuid not null references public.profiles(id),
  category_id uuid not null references public.categories(id),
  title text not null,
  description text,
  quantity numeric(14,2) not null check (quantity > 0),
  unit text not null default 'pcs',
  material text not null,
  material_grade text,
  tolerance text,
  surface_finish text,
  certification text,
  delivery_location text,
  required_delivery_date date,
  target_price numeric(14,2),
  status public.rfq_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rfq_files (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table public.supplier_matches (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  supplier_id uuid not null references public.supplier_profiles(id) on delete cascade,
  match_score numeric(6,2) not null default 0,
  match_reason jsonb not null default '{}'::jsonb,
  invited_at timestamptz,
  responded_at timestamptz,
  unique(rfq_id, supplier_id)
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  supplier_id uuid not null references public.supplier_profiles(id),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  quantity numeric(14,2) not null check (quantity > 0),
  tooling_cost numeric(14,2) not null default 0,
  material_cost numeric(14,2) not null default 0,
  setup_cost numeric(14,2) not null default 0,
  packaging_cost numeric(14,2) not null default 0,
  inspection_cost numeric(14,2) not null default 0,
  shipping_cost numeric(14,2) not null default 0,
  gst_percent numeric(5,2) not null default 18,
  lead_time_days integer not null check (lead_time_days >= 0),
  payment_terms text,
  valid_until date,
  notes text,
  status public.quote_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  rfq_id uuid references public.rfqs(id),
  buyer_company_id uuid not null references public.companies(id),
  supplier_id uuid not null references public.supplier_profiles(id),
  accepted_quote_id uuid references public.quotes(id),
  subtotal numeric(14,2) not null default 0,
  gst_amount numeric(14,2) not null default 0,
  platform_fee numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  commission_percent numeric(5,2) not null default 2,
  supplier_payout_amount numeric(14,2) not null default 0,
  currency text not null default 'INR',
  status public.order_status not null default 'payment_pending',
  expected_delivery_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  description text not null,
  quantity numeric(14,2) not null,
  unit text not null,
  unit_price numeric(14,2) not null,
  total numeric(14,2) generated always as (quantity * unit_price) stored
);

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references public.orders(id) on delete cascade,
  po_number text not null,
  file_path text,
  issued_at timestamptz default now(),
  accepted_at timestamptz
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text,
  provider_payment_id text unique,
  amount numeric(14,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending','authorized','paid','failed','refunded')),
  paid_at timestamptz,
  raw_event jsonb,
  created_at timestamptz not null default now()
);

create table public.platform_fees (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references public.orders(id) on delete cascade,
  commission_percent numeric(5,2) not null default 2,
  fee_amount numeric(14,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','earned','refunded')),
  created_at timestamptz not null default now()
);

create table public.supplier_payouts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references public.orders(id) on delete cascade,
  supplier_id uuid not null references public.supplier_profiles(id),
  amount numeric(14,2) not null check (amount >= 0),
  status public.payout_status not null default 'pending',
  provider_payout_id text unique,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.production_updates (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.production_status not null,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  note text,
  evidence_path text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.quality_documents (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  status public.document_status not null default 'submitted',
  uploaded_by uuid not null references public.profiles(id),
  reviewer_note text,
  created_at timestamptz not null default now()
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references public.orders(id) on delete cascade,
  courier text,
  tracking_number text,
  invoice_path text,
  packing_list_path text,
  dispatch_date date,
  expected_delivery_date date,
  delivered_at timestamptz,
  status public.shipment_status not null default 'ready',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  opened_by uuid not null references public.profiles(id),
  reason text not null,
  description text,
  status public.dispute_status not null default 'open',
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid references public.rfqs(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (rfq_id is not null or order_id is not null)
);

create table public.conversation_members (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key(conversation_id,user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  reviewee_supplier_id uuid references public.supplier_profiles(id),
  quality integer check (quality between 1 and 5),
  delivery integer check (delivery between 1 and 5),
  communication integer check (communication between 1 and 5),
  overall integer check (overall between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(order_id, reviewer_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index rfqs_buyer_company_idx on public.rfqs(buyer_company_id);
create index rfqs_status_idx on public.rfqs(status);
create index matches_supplier_idx on public.supplier_matches(supplier_id);
create index quotes_rfq_idx on public.quotes(rfq_id);
create index orders_buyer_idx on public.orders(buyer_company_id);
create index orders_supplier_idx on public.orders(supplier_id);
create index orders_status_idx on public.orders(status);
create index messages_conversation_idx on public.messages(conversation_id, created_at);

insert into public.categories(name,slug) values
('CNC Turning','cnc-turning'),('CNC Milling / VMC','cnc-milling-vmc'),('CNC Job Work','cnc-job-work'),('Investment Casting','investment-casting'),('Fabrication','fabrication'),('Laser Cutting','laser-cutting'),('Sheet Metal','sheet-metal'),('Grinding','grinding'),('Forging','forging'),('Die Casting','die-casting'),('Injection Moulding','injection-moulding'),('Heat Treatment','heat-treatment'),('Surface Treatment','surface-treatment'),('Assembly','assembly')
on conflict (slug) do nothing;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger companies_updated before update on public.companies for each row execute function public.set_updated_at();
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger suppliers_updated before update on public.supplier_profiles for each row execute function public.set_updated_at();
create trigger rfqs_updated before update on public.rfqs for each row execute function public.set_updated_at();
create trigger quotes_updated before update on public.quotes for each row execute function public.set_updated_at();
create trigger orders_updated before update on public.orders for each row execute function public.set_updated_at();
create trigger shipments_updated before update on public.shipments for each row execute function public.set_updated_at();
create trigger disputes_updated before update on public.disputes for each row execute function public.set_updated_at();

-- Protect roles: a normal user cannot promote themselves to supplier/admin.
create or replace function public.enforce_profile_role() returns trigger language plpgsql security definer set search_path = public as $$
declare caller_role public.user_role;
begin
  if new.role = 'admin' or new.role = 'supplier' then
    select role into caller_role from public.profiles where id = auth.uid();
    if caller_role is distinct from 'admin' then
      if tg_op = 'INSERT' then new.role := 'buyer'; else new.role := old.role; end if;
    end if;
  end if;
  return new;
end; $$;
create trigger profile_role_guard before insert or update of role on public.profiles for each row execute function public.enforce_profile_role();

-- New auth users receive a buyer profile. Company creation can be completed by the app.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,full_name,phone) values (new.id,new.raw_user_meta_data->>'full_name',new.phone);
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.supplier_profiles enable row level security;
alter table public.machines enable row level security;
alter table public.supplier_capabilities enable row level security;
alter table public.rfqs enable row level security;
alter table public.rfq_files enable row level security;
alter table public.supplier_matches enable row level security;
alter table public.quotes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.payments enable row level security;
alter table public.platform_fees enable row level security;
alter table public.supplier_payouts enable row level security;
alter table public.production_updates enable row level security;
alter table public.quality_documents enable row level security;
alter table public.shipments enable row level security;
alter table public.disputes enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin' and is_active); $$;
create or replace function public.my_company_id() returns uuid language sql stable security definer set search_path = public as $$ select company_id from public.profiles where id=auth.uid(); $$;
create or replace function public.my_supplier_id() returns uuid language sql stable security definer set search_path = public as $$ select id from public.supplier_profiles where user_id=auth.uid(); $$;

-- Profiles / companies
create policy profiles_self on public.profiles for select using (id=auth.uid() or public.is_admin());
create policy profiles_insert_self on public.profiles for insert with check (id=auth.uid());
create policy profiles_update_self on public.profiles for update using (id=auth.uid() or public.is_admin()) with check (id=auth.uid() or public.is_admin());
create policy companies_members on public.companies for select using (id=public.my_company_id() or public.is_admin());
create policy companies_insert_authenticated on public.companies for insert with check (auth.uid() is not null);
create policy companies_update_members on public.companies for update using (id=public.my_company_id() or public.is_admin()) with check (id=public.my_company_id() or public.is_admin());
create policy categories_public_read on public.categories for select using (active or public.is_admin());

-- Supplier discovery is public to authenticated users; edits belong to supplier/admin.
create policy supplier_public_read on public.supplier_profiles for select using (auth.uid() is not null);
create policy supplier_self_insert on public.supplier_profiles for insert with check (user_id=auth.uid() or public.is_admin());
create policy supplier_self_update on public.supplier_profiles for update using (user_id=auth.uid() or public.is_admin()) with check (user_id=auth.uid() or public.is_admin());
create policy machines_read_auth on public.machines for select using (auth.uid() is not null);
create policy machines_manage on public.machines for all using (exists(select 1 from supplier_profiles s where s.id=supplier_id and (s.user_id=auth.uid() or public.is_admin()))) with check (exists(select 1 from supplier_profiles s where s.id=supplier_id and (s.user_id=auth.uid() or public.is_admin())));
create policy capabilities_read_auth on public.supplier_capabilities for select using (auth.uid() is not null);
create policy capabilities_manage on public.supplier_capabilities for all using (exists(select 1 from supplier_profiles s where s.id=supplier_id and (s.user_id=auth.uid() or public.is_admin()))) with check (exists(select 1 from supplier_profiles s where s.id=supplier_id and (s.user_id=auth.uid() or public.is_admin())));

-- Buyer RFQs. Suppliers only see RFQs they are matched to.
create policy rfq_buyer_read on public.rfqs for select using (buyer_company_id=public.my_company_id() or public.is_admin() or exists(select 1 from supplier_matches m where m.rfq_id=id and m.supplier_id=public.my_supplier_id()));
create policy rfq_buyer_insert on public.rfqs for insert with check (created_by=auth.uid() and buyer_company_id=public.my_company_id());
create policy rfq_buyer_update on public.rfqs for update using (buyer_company_id=public.my_company_id() or public.is_admin()) with check (buyer_company_id=public.my_company_id() or public.is_admin());
create policy rfq_files_access on public.rfq_files for select using (exists(select 1 from rfqs r where r.id=rfq_id and (r.buyer_company_id=public.my_company_id() or public.is_admin() or exists(select 1 from supplier_matches m where m.rfq_id=r.id and m.supplier_id=public.my_supplier_id()))));
create policy rfq_files_insert on public.rfq_files for insert with check (exists(select 1 from rfqs r where r.id=rfq_id and (r.buyer_company_id=public.my_company_id() or public.is_admin())));

create policy matches_read on public.supplier_matches for select using (public.is_admin() or supplier_id=public.my_supplier_id() or exists(select 1 from rfqs r where r.id=rfq_id and r.buyer_company_id=public.my_company_id()));
create policy matches_admin_write on public.supplier_matches for all using (public.is_admin()) with check (public.is_admin());

create policy quotes_access on public.quotes for select using (public.is_admin() or supplier_id=public.my_supplier_id() or exists(select 1 from rfqs r where r.id=rfq_id and r.buyer_company_id=public.my_company_id()));
create policy quotes_supplier_insert on public.quotes for insert with check (supplier_id=public.my_supplier_id() and exists(select 1 from supplier_matches m where m.rfq_id=rfq_id and m.supplier_id=public.my_supplier_id()));
create policy quotes_supplier_update on public.quotes for update using (supplier_id=public.my_supplier_id() or public.is_admin()) with check (supplier_id=public.my_supplier_id() or public.is_admin());

-- Orders and downstream records.
create policy orders_access on public.orders for select using (public.is_admin() or buyer_company_id=public.my_company_id() or supplier_id=public.my_supplier_id());
create policy orders_admin_insert on public.orders for insert with check (public.is_admin() or buyer_company_id=public.my_company_id());
create policy orders_participant_update on public.orders for update using (public.is_admin() or buyer_company_id=public.my_company_id() or supplier_id=public.my_supplier_id()) with check (public.is_admin() or buyer_company_id=public.my_company_id() or supplier_id=public.my_supplier_id());
create policy order_items_access on public.order_items for select using (exists(select 1 from orders o where o.id=order_id and (public.is_admin() or o.buyer_company_id=public.my_company_id() or o.supplier_id=public.my_supplier_id())));
create policy order_items_manage on public.order_items for all using (exists(select 1 from orders o where o.id=order_id and (public.is_admin() or o.buyer_company_id=public.my_company_id() or o.supplier_id=public.my_supplier_id()))) with check (exists(select 1 from orders o where o.id=order_id and (public.is_admin() or o.buyer_company_id=public.my_company_id() or o.supplier_id=public.my_supplier_id())));
create policy purchase_orders_access on public.purchase_orders for select using (exists(select 1 from orders o where o.id=order_id and (public.is_admin() or o.buyer_company_id=public.my_company_id() or o.supplier_id=public.my_supplier_id())));
create policy payments_admin_or_buyer on public.payments for select using (public.is_admin() or exists(select 1 from orders o where o.id=order_id and o.buyer_company_id=public.my_company_id()));
create policy payments_admin_insert on public.payments for insert with check (public.is_admin());
create policy fees_admin_read on public.platform_fees for select using (public.is_admin());
create policy payouts_supplier_or_admin on public.supplier_payouts for select using (public.is_admin() or supplier_id=public.my_supplier_id());
create policy production_access on public.production_updates for select using (public.is_admin() or created_by=auth.uid() or exists(select 1 from orders o where o.id=order_id and (o.buyer_company_id=public.my_company_id() or o.supplier_id=public.my_supplier_id())));
create policy production_supplier_insert on public.production_updates for insert with check (created_by=auth.uid() and (public.is_admin() or exists(select 1 from orders o where o.id=order_id and o.supplier_id=public.my_supplier_id())));
create policy quality_access on public.quality_documents for select using (public.is_admin() or uploaded_by=auth.uid() or exists(select 1 from orders o where o.id=order_id and (o.buyer_company_id=public.my_company_id() or o.supplier_id=public.my_supplier_id())));
create policy quality_supplier_insert on public.quality_documents for insert with check (uploaded_by=auth.uid() and (public.is_admin() or exists(select 1 from orders o where o.id=order_id and o.supplier_id=public.my_supplier_id())));
create policy shipments_access on public.shipments for select using (public.is_admin() or exists(select 1 from orders o where o.id=order_id and (o.buyer_company_id=public.my_company_id() or o.supplier_id=public.my_supplier_id())));
create policy shipments_manage on public.shipments for all using (public.is_admin() or exists(select 1 from orders o where o.id=order_id and o.supplier_id=public.my_supplier_id())) with check (public.is_admin() or exists(select 1 from orders o where o.id=order_id and o.supplier_id=public.my_supplier_id()));
create policy disputes_access on public.disputes for select using (public.is_admin() or opened_by=auth.uid() or exists(select 1 from orders o where o.id=order_id and (o.buyer_company_id=public.my_company_id() or o.supplier_id=public.my_supplier_id())));
create policy disputes_insert on public.disputes for insert with check (opened_by=auth.uid());
create policy disputes_update on public.disputes for update using (public.is_admin() or opened_by=auth.uid()) with check (public.is_admin() or opened_by=auth.uid());

create policy conversation_access on public.conversations for select using (public.is_admin() or exists(select 1 from conversation_members cm where cm.conversation_id=id and cm.user_id=auth.uid()));
create policy conversation_members_access on public.conversation_members for select using (user_id=auth.uid() or public.is_admin());
create policy messages_access on public.messages for select using (public.is_admin() or exists(select 1 from conversation_members cm where cm.conversation_id=conversation_id and cm.user_id=auth.uid()));
create policy messages_insert on public.messages for insert with check (sender_id=auth.uid() and exists(select 1 from conversation_members cm where cm.conversation_id=conversation_id and cm.user_id=auth.uid()));
create policy reviews_access on public.reviews for select using (public.is_admin() or reviewer_id=auth.uid() or exists(select 1 from orders o where o.id=order_id and o.buyer_company_id=public.my_company_id()));
create policy reviews_insert on public.reviews for insert with check (reviewer_id=auth.uid());
create policy notifications_self on public.notifications for select using (user_id=auth.uid() or public.is_admin());
create policy notifications_update_self on public.notifications for update using (user_id=auth.uid() or public.is_admin()) with check (user_id=auth.uid() or public.is_admin());
create policy audit_admin_read on public.audit_logs for select using (public.is_admin());

-- Atomic order numbering helper for server-side order creation.
create or replace function public.next_order_number() returns text language plpgsql as $$
declare n bigint;
begin
  select coalesce(max((regexp_match(order_number, '[0-9]+$'))[1]::bigint),0)+1 into n from public.orders;
  return 'IC-' || to_char(current_date,'YYYY') || '-' || lpad(n::text,6,'0');
end; $$;

-- Recommended: create Storage buckets named `rfq-files`, `order-documents`, `quality-documents` and apply equivalent ownership RLS policies in Storage.
