# Vastu Ops

Launch folder for the Vastu Ops public website and optional free inquiry storage.

## Structure

- Root website files are the GitHub Pages customer website.
- `supabase/` contains optional Supabase Free Plan SQL for inquiry storage.

## Public Details

- Public branding: Krantik Sanghrash with Krant
- Short name: Krant
- Manager: Renuka
- Krant text/WhatsApp: 469-975-7385, text only
- Renuka call/WhatsApp: 469-659-3734
- Vastu: in-person only, at least one visit required
- Numerology: online available, $100
- In-person guide: $300

## Safety Rules

Do not commit:

- `.env`
- `secrets/`
- Telegram tokens
- Supabase service role keys
- customer records
- SQLite database files
- passwords or password plaintext

The public website may use a Supabase anon key only after Row Level Security is enabled.
Never put a service role key in `config.js`.

## Free Supabase Option

Preferred no-payment setup:

1. Create a Supabase project only if it stays on the Free Plan and does not ask for payment information.
2. In Supabase SQL editor, run `supabase/inquiries.sql`.
3. Confirm Row Level Security is enabled on `public.inquiries`.
4. Confirm anon users can insert only and cannot read, update, or delete rows.
5. Copy the project URL and anon key into `config.js`.

If Supabase asks for billing, a credit card, paid add-ons, or upgrade prompts, stop and use WhatsApp-only booking.

## Admin Setup

The hidden admin page is `admin.html`. It is not linked from the public navigation.

1. In Supabase, go to Authentication -> Users.
2. Create a user for Renuka with email and password.
3. Create a user for Krant with email and password, if needed.
4. Copy each user's UUID from the Users table.
5. In SQL Editor, add approved admins:

```sql
insert into public.admin_users (user_id, display_name, role)
values
  ('RENUKA-USER-UUID-HERE', 'Renuka', 'manager'),
  ('KRANT-USER-UUID-HERE', 'Krant', 'consultant')
on conflict (user_id) do update
set display_name = excluded.display_name,
    role = excluded.role;
```

Only users listed in `public.admin_users` can read or update inquiry records.
Do not share admin passwords in GitHub, text messages, or public chat.

## Public Config

`config.js` should look like this after Supabase is set up:

```javascript
window.VNG_SUPABASE_URL = "https://your-project.supabase.co";
window.VNG_SUPABASE_ANON_KEY = "your-public-anon-key";
```

Leave both values blank for WhatsApp fallback only.

## Launch Notes

1. Deploy the repo root with GitHub Pages using `.github/workflows/pages.yml`.
2. Test WhatsApp links.
3. If Supabase is configured, submit one test inquiry.
4. Confirm the inquiry appears in the private Supabase dashboard.
5. Open `admin.html`, sign in, and confirm records load.
6. Run the visible text audit before launch.

## Spam Protection

Cloudflare Turnstile is a possible future improvement if it can be used completely free with no payment method.
It is not wired into the current launch because the first priority is a small, safe, no-cost inquiry flow.
