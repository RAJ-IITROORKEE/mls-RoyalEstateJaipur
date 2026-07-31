# Supabase Auth Email Templates

These files are source-controlled copies of the hosted Supabase Auth templates. Supabase does not read them automatically; paste the HTML into the matching Dashboard template and save it.

## Confirm signup OTP

- Dashboard: **Authentication > Email Templates > Confirm signup**
- Subject: `Your RoyaleStateJaipur verification code`
- Body: paste the complete contents of `confirm-signup.html`
- Required variable: `{{ .Token }}`
- Do not replace the token with `{{ .ConfirmationURL }}` because the application verifies a six-digit OTP.

## Gmail SMTP

Open **Authentication > SMTP Settings**, enable custom SMTP, and use:

- Sender email: the same Gmail address as the SMTP username
- Sender name: `RoyaleStateJaipur`
- Host: `smtp.gmail.com`
- Port: `587`
- Username: the complete Gmail address
- Password: a Google App Password, not the normal Gmail password

Google 2-Step Verification must be enabled before generating an App Password. Paste the 16-character App Password into Supabase without spaces, save the settings, and never store it in this repository or `.env.local`.

After saving both settings, run `npm run diagnose:signup`. A working configuration reports `SUPABASE_SIGNUP: OK` and `EMAIL_VERIFICATION_REQUIRED`, then removes the disposable diagnostic user.
