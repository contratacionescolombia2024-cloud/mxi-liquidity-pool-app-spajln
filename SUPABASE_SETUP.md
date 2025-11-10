
# Supabase Setup Instructions for Maxcoin Pool App

This guide will help you set up Supabase for your Maxcoin liquidity pool application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Your Supabase project created

## Step 1: Enable Supabase in Natively

1. Click the **Supabase button** in your Natively interface
2. Connect to your Supabase project
3. Your environment variables will be automatically configured

## Step 2: Run Database Setup Script

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `lib/supabase-setup.sql` from your project
4. Copy the entire SQL script
5. Paste it into the SQL Editor
6. Click **Run** to execute the script

This will create:
- All necessary database tables (users, contributions, commissions, withdrawals, referrals, metrics)
- Database functions for referral processing and withdrawal eligibility
- Triggers for automatic updates
- Row Level Security (RLS) policies
- Indexes for performance optimization

## Step 3: Configure Email Authentication

1. In your Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates:
   - Go to **Authentication** → **Email Templates**
   - Customize the **Confirm signup** template
   - Make sure it includes the verification link

### Email Template Example:

```html
<h2>Confirm your email</h2>
<p>Welcome to Maxcoin Liquidity Pool!</p>
<p>Click the link below to verify your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email</a></p>
```

## Step 4: Configure Email Settings

1. Go to **Authentication** → **Settings**
2. Set **Site URL** to your app's URL (for development: `http://localhost:8081`)
3. Add redirect URLs:
   - `maxcoinpool://auth/callback`
   - `http://localhost:8081/auth/callback`
4. Enable **Confirm email** (this ensures users must verify their email before logging in)

## Step 5: Set Up Storage (Optional)

If you want to store user documents or verification files:

1. Go to **Storage**
2. Create a new bucket called `user-documents`
3. Set appropriate access policies

## Step 6: Test the Setup

1. Try registering a new user in your app
2. Check your email for the verification link
3. Verify the email and try logging in
4. Make a test contribution
5. Check the Supabase Dashboard to see if data is being stored correctly

## Database Schema Overview

### Tables:

- **users**: User profiles and account information
- **contributions**: All USDT contributions and MXI purchases
- **commissions**: Referral commissions (3 levels)
- **withdrawals**: USDT and MXI withdrawal requests
- **referrals**: Referral relationships between users
- **metrics**: Global pool metrics (total members, contributions, etc.)

### Key Features:

- **Email Verification**: Users must verify their email before logging in
- **Unique Accounts**: One account per email and ID number
- **Referral System**: 3-level commission structure (3%, 2%, 1%)
- **Withdrawal Eligibility**: Automatic checking based on referrals and time
- **Commission Processing**: Automatic commission calculation on contributions
- **Reinvestment**: Users can reinvest their commissions back into the pool

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure password hashing by Supabase Auth
- Email verification required
- Unique constraints on email and ID number

## Monitoring

Monitor your database in the Supabase Dashboard:

1. **Table Editor**: View and edit data
2. **Database**: Monitor performance and connections
3. **Logs**: View real-time logs
4. **API**: Test API endpoints

## Troubleshooting

### Email verification not working:
- Check your email provider settings in Supabase
- Verify the email template includes `{{ .ConfirmationURL }}`
- Check spam folder

### Users can't log in:
- Ensure email is verified
- Check if `email_verified` is `true` in the users table

### Commissions not calculating:
- Check if the `process_referral_commissions` function is working
- Verify referral relationships in the `referrals` table

### Database errors:
- Check the Supabase logs for detailed error messages
- Verify all tables were created correctly
- Ensure RLS policies are set up properly

## Support

For issues with:
- **Supabase**: Check https://supabase.com/docs
- **App functionality**: Contact your development team

## Important Notes

- The pool closes on **January 15, 2025 at 12:00 UTC**
- MXI withdrawals are only available after the launch date
- USDT commission withdrawals require 5 active referrals and 10 days since joining
- All contributions generate referral commissions
- Minimum contribution: 50 USDT
- Maximum contribution: 100,000 USDT per user
