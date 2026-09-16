# IndustrialConnect V2 — live setup

## 1. Create a Supabase project
Create a project at Supabase and copy the project URL plus the browser-safe publishable/anon key.

## 2. Run the SQL files in this order
Supabase Dashboard → SQL Editor:
1. `supabase/schema.sql`
2. `supabase/functions.sql`
3. `supabase/rls-fix.sql`
4. `supabase/grants-and-storage.sql`

These create the relational procurement model, RLS, supplier matching, transactional order creation, commission ledger, payout ledger, notifications, messages, production/QC/shipment records and private storage buckets.

## 3. Configure the browser client
Edit `supabase-config.js`:
```js
window.INDUSTRIALCONNECT_SUPABASE = {
  url: 'https://YOUR-PROJECT.supabase.co',
  anonKey: 'YOUR-PUBLISHABLE-OR-ANON-KEY'
};
```
Never use a `service_role`/secret key in this file. Supabase's browser client is intended to use a publishable/anon key with RLS protecting data.

## 4. Create the first admin
After creating your account, run in SQL Editor as the project owner:
```sql
update public.profiles
set role = 'admin'
where id = 'YOUR_AUTH_USER_UUID';
```
Do not expose this admin action in the public UI.

## 5. Supplier onboarding
A supplier profile should be created and verified by admin before live RFQs are quoted. Add:
- company
- verification status
- capabilities/categories
- machines
- materials
- tolerance capability
- certifications

## 6. Production workflow
Buyer:
RFQ → matching → quotes → accepted quote → order → payment → production → QC → dispatch → delivery → acceptance/completion.

Supplier:
matched RFQ → structured quote → accepted order → material → production updates → QC documents → dispatch.

Admin:
verification → RFQ/match exceptions → order/payment exceptions → disputes → payout/commission ledger.

## 7. Payments
The V2 database stores payment/provider IDs but does not pretend that a browser-side payment callback is proof of payment. A real payment gateway webhook/Edge Function should be added before accepting customer money.

## 8. Commission
Default example is 2%. The server-side `create_order_from_quote` RPC calculates the platform fee and supplier payout. Do not calculate or trust these values from the browser for real transactions.

## 9. Security
- RLS is enabled on all business tables.
- Buyer/supplier access is scoped by company/supplier membership.
- Supplier matches are private to matched suppliers and the buyer/admin.
- Service-role/secret keys must stay server-side.
- File buckets are private.
- Production payment webhooks and payout APIs should run server-side.
