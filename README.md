# AL IQRAH TECH ACADEMY — Diwali Spin & Win 2026

This is a starter website bundle with a responsive landing page, prize-wheel animation, registration form, and WhatsApp claim message.

## Important: demo vs production

The current browser-only version is **a visual/functional prototype, not a secure live promotion**:
- Registration is not saved to a database.
- The wheel result and coupon are generated in the browser.
- The one-spin check uses localStorage and can be bypassed on another browser/device.
- Demo coupons are not valid for redemption.
- Do not publish this as a real prize campaign until a secure backend is connected and tested.

## Run it on your computer

1. Download and extract the ZIP.
2. Open the `aiq_diwali_spin_win` folder.
3. Double-click `index.html` to open it in a browser.
4. For development, open the folder in Visual Studio Code.

No build tools are required for this prototype.

## Before going live

1. Create a Supabase project.
2. Apply the SQL schema in `supabase/schema.sql` using the Supabase SQL Editor.
3. Configure server-side Edge Functions for registration, spin allocation, and coupon redemption.
4. Add administrator authentication and server-enforced admin roles.
5. Add rate limiting / bot protection.
6. Test RLS policies, duplicate requests, stock limits, coupon expiry, and redemption.
7. Replace the browser-only demo logic with API calls to the Edge Functions.
8. Update the privacy policy and campaign terms.
9. Confirm the final offer values, prize quantities, eligibility, and expiry dates with the academy before activation.

## Campaign dates

Configured for Asia/Kolkata:
- Opens: 25 October 2026
- Last campaign day: 6 November 2026
- Closes at the start of 7 November 2026

## Contact details

- 7418093446
- 9025545372

The WhatsApp claim button uses the primary number 7418093446.
