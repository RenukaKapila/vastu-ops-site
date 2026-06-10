# Vastu Ops Go-Live Guide

This is the simple launch guide for Renuka and Krant.

## Daily Links

After GitHub Pages is live:

- Public website: `https://renukakapila.github.io/vastu-ops-site/`
- Private admin: `https://renukakapila.github.io/vastu-ops-site/admin.html`

Save both links as browser bookmarks.

The admin page is not linked in the public menu. Only people with approved Supabase login access can see records.

## Before Launch

1. Open the public website locally and check the page.
2. Submit one test inquiry from the public form.
3. Confirm the test inquiry appears in admin.
4. Create one record from admin.
5. Update one record status.
6. Add a schedule time to one record.
7. Add a note to one record.
8. Test both WhatsApp buttons.
9. Delete or close test records.
10. Confirm the Supabase table has Row Level Security enabled.

## Supabase Safety Check

Keep these rules:

- Public users can insert inquiries only.
- Public users cannot read records.
- Only approved admin users can read and update records.
- Never put a Supabase secret key in website files.
- Never commit customer records, passwords, or private keys.

The website uses the Supabase publishable key only.

## How Renuka Uses Admin

1. Open `admin.html`.
2. Sign in with the Supabase email and password.
3. Use search to find a name, phone, email, service, or status.
4. Open the record on the page.
5. Change status if needed.
6. Add schedule date/time if needed.
7. Add notes.
8. Click Save Record.
9. Sign out when finished.

## How to Add Krant Later

1. In Supabase, go to Authentication -> Users.
2. Add Krant as a user with email and password.
3. Copy Krant's user ID.
4. In Supabase SQL Editor, run:

```sql
insert into public.admin_users (user_id, display_name, role)
values
  ('KRANT-USER-UUID-HERE', 'Krant', 'consultant')
on conflict (user_id) do update
set display_name = excluded.display_name,
    role = excluded.role;
```

5. Krant can then open `admin.html` and sign in.

## Domain Plan

When you buy a domain, choose one simple name that is easy to spell.

Good options are names like:

- `vastuops.com`
- `vastuopsguide.com`
- `krantvastu.com`

After buying it:

1. Add the domain in GitHub Pages settings.
2. Update DNS records at the domain company.
3. Wait for GitHub to show HTTPS is active.
4. Update these files with the new domain:
   - `index.html`
   - `robots.txt`
   - `sitemap.xml`
5. Test:
   - `https://yourdomain.com/`
   - `https://yourdomain.com/admin.html`

## What Is Ready

- Public website.
- Public inquiry form.
- Supabase inquiry storage.
- Admin login.
- Admin search.
- Admin create record.
- Admin schedule field.
- Admin notes.
- Admin status updates.
- WhatsApp fallback links.

## What Is Not Added Yet

- Telegram alerts.
- Paid hosting backend.
- File uploads.
- Online payments.
- Automatic calendar booking.

Those can be added later. The current launch is designed to stay simple and low risk.
