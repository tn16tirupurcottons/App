# Fix Environment Variables Issue

## Problem
The server is failing to start because `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are empty in your `.env` file.

## Solution

### Option 1: Generate Secrets Automatically (Recommended)

I've created a script to generate secure secrets. Run:

```bash
cd ecommerce-backend
node scripts/generateSecrets.js
```

This will output two secure secrets. Copy them to your `.env` file:

```
JWT_ACCESS_SECRET=<generated-secret-1>
JWT_REFRESH_SECRET=<generated-secret-2>
```

### Option 2: Use Generated Secrets

I've already generated secrets for you. Add these to your `.env` file:

```
JWT_ACCESS_SECRET=e25d44ac009127a3f029f2248dba3a4b371e827e84bc82046e6b2669a44218a4
JWT_REFRESH_SECRET=39b48bdd9b5ba4d5807b4211a3a6f400311f4dc96aea3e0faae86c0178b3a459
```

### Option 3: Create Your Own Secrets

Generate your own 32+ character secrets. You can use:
- Online generator: https://randomkeygen.com/
- Command line: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Steps to Fix

1. Open `ecommerce-backend/.env` file
2. Find these lines:
   ```
   JWT_ACCESS_SECRET=
   JWT_REFRESH_SECRET=
   ```
3. Replace them with the generated secrets (from Option 1 or 2 above)
4. Save the file
5. Restart the server

## Important Notes

- **Never commit `.env` file to git** - it contains sensitive secrets
- **Use different secrets for production** - generate new ones for production environment
- **Secrets must be at least 32 characters long** - the validator enforces this

## After Fixing

Once you've added the secrets, the server should start successfully. You'll see:

```
✅ Environment variables validated successfully
✅ Database & tables synced!
🚀 Server running at http://localhost:5000
```

