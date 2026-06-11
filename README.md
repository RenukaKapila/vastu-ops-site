# Vastu Numerology Guide

Customer website for Vastu Numerology Guide, led by Krant with booking support from Renuka.

## Open The Website

Live public website:

[https://renukakapila.github.io/vastu-ops-site/](https://renukakapila.github.io/vastu-ops-site/)

## What This Site Does

- Introduces Vastu, Numerology, and personalized remedy guidance.
- Helps customers understand which consultation may fit their needs.
- Lets customers send a consultation request.
- Stores inquiry records securely in Supabase when configured.
- Provides a private admin page for approved users to review, search, schedule, and update inquiries.

## Public Details

- Brand: Vastu Numerology Guide
- Consultant: Krant
- Manager and booking support: Renuka
- Service area: Arlington and the Dallas Metroplex
- Online Numerology Consultation: `$150`
- In-Person Vastu Visit: `$300`
- Vastu + Numerology Combined Guidance: custom quote

## Project Files

- `index.html` is the public customer website.
- `styles.css` controls the public website design.
- `app.js` handles the customer inquiry form and WhatsApp links.
- `admin.html` is the private admin page. It is not linked from the public website navigation.
- `admin.css` and `admin.js` power the private admin tools.
- `config.js` holds the public Supabase URL and publishable key only.
- `supabase/inquiries.sql` sets up the inquiry database, security rules, and admin access table.

## Safe Setup Notes

Do not commit or publish private information such as:

- `.env` files
- `secrets/`
- Telegram tokens
- Supabase service role keys
- customer records
- SQLite database files
- admin passwords

The public website may use a Supabase publishable or anon key only when Row Level Security is enabled. Never put a Supabase service role key in `config.js`.

## Supabase Setup

Use Supabase only on the free plan unless the business intentionally decides to upgrade later.

1. Open the Supabase SQL Editor.
2. Run `supabase/inquiries.sql`.
3. Confirm Row Level Security is enabled on `public.inquiries`.
4. Confirm public visitors can insert inquiries only.
5. Confirm approved admin users can read and update inquiry records after login.
6. Add the Supabase project URL and public publishable key to `config.js`.

Example `config.js`:

```javascript
window.VNG_SUPABASE_URL = "https://your-project.supabase.co";
window.VNG_SUPABASE_ANON_KEY = "your-public-publishable-key";
```

## Admin Access

The admin page is:

[https://renukakapila.github.io/vastu-ops-site/admin.html](https://renukakapila.github.io/vastu-ops-site/admin.html)

Only approved Supabase Auth users listed in `public.admin_users` should be able to access inquiry records.

To approve an admin, create the user in Supabase Authentication, copy their user UUID, then add them to `public.admin_users`:

```sql
insert into public.admin_users (user_id, display_name, role)
values
  ('RENUKA-USER-UUID-HERE', 'Renuka', 'manager'),
  ('KRANT-USER-UUID-HERE', 'Krant', 'consultant')
on conflict (user_id) do update
set display_name = excluded.display_name,
    role = excluded.role;
```

## Launch Checklist

Before sharing the site widely:

1. Confirm the latest GitHub Pages deployment passed.
2. Open the live public website and submit one test inquiry.
3. Open the private admin page and confirm the test inquiry appears.
4. Test search, notes, status updates, and scheduling.
5. Test WhatsApp buttons on desktop and phone.
6. Remove or close test records.
7. Check the homepage on a phone.
8. Confirm no secrets, passwords, or customer records are committed.

## Domain Later

When a custom domain is purchased, connect it in GitHub Pages settings and then update:

- `README.md`
- `sitemap.xml`
- `robots.txt`
- canonical and social links in `index.html`

