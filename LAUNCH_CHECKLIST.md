# Launch Checklist

Use this before sharing Vastu Numerology Guide publicly.

## Built

- Public Vastu Numerology Guide website.
- Branding: Krantik Sanghrash with Krant.
- Vastu marked as in-person only.
- Numerology marked as online available for $100.
- Renuka listed as manager for booking and customer coordination.
- Inquiry form with frontend validation.
- Optional Supabase Free Plan inquiry storage.
- Supabase SQL with Row Level Security.
- Hidden admin page with Supabase Auth login.
- Admin search, create, status, notes, and schedule controls.
- WhatsApp fallback links.
- GitHub Pages workflow.

## Free Launch Path

1. Confirm Supabase does not ask for payment, billing, or a credit card.
2. If Supabase is safe to use, run `supabase/inquiries.sql` in the Supabase SQL editor.
3. Add the Supabase URL and anon key to `config.js`.
4. Push to GitHub.
5. Wait for GitHub Pages to publish.
6. Submit one test inquiry.
7. Confirm the inquiry appears in the private Supabase dashboard.
8. Create Supabase Auth users for Renuka and Krant.
9. Add approved user IDs to `public.admin_users`.
10. Open `admin.html` and confirm records load.
11. Test both WhatsApp links.

## If Supabase Is Not Free

Leave `config.js` blank and use WhatsApp booking only.
The form will show a safe message asking visitors to use WhatsApp.

## Safety Checks

- No service role key in frontend code.
- No Telegram token in frontend code.
- No `.env` file committed.
- No customer records committed.
- Vastu cannot be submitted as online.
- Public users cannot read inquiry rows.
- Only approved logged-in admins can read/update records.

## Future Improvements

- Cloudflare Turnstile if it stays completely free with no payment method.
- Telegram alerts from a server-side system only, never from public JavaScript.
- Hosted admin dashboard after a safe free or paid backend is chosen.
