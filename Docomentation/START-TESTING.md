# Quick Start Testing Guide

## Prerequisites ✅

- [x] Dependencies installed (`npm install` completed)
- [ ] Database migration completed
- [ ] Development server running

## Step 1: Database Setup (5 minutes)

### Option A: If you have Supabase Dashboard Access

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `supabase-anti-cheat-migration.sql`
5. Paste into the SQL editor
6. Click "Run" button
7. You should see "Success. No rows returned"

### Option B: If you need to create the table first

If you don't have a `mission_completions` table yet, run this first:

```sql
-- Create mission_completions table
CREATE TABLE IF NOT EXISTS mission_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL,
  mission_type TEXT,
  image_url TEXT,
  description TEXT,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Then run the anti-cheat migration
-- (Copy from supabase-anti-cheat-migration.sql)
```

## Step 2: Start Development Server

```bash
npm run dev
```

Wait for the server to start (usually at http://localhost:3000)

## Step 3: Test the APIs

### Test 1: Check Cooldown API (Easiest Test)

Open your browser console (F12) and run:

```javascript
fetch('http://localhost:3000/api/check-cooldown', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test-user-123',
    missionType: 'waste-collection'
  })
})
.then(r => r.json())
.then(data => console.log('✅ Cooldown API:', data))
.catch(err => console.error('❌ Error:', err));
```

**Expected Result:**
```json
{
  "allowed": true,
  "remainingMissions": 5,
  "dailyCount": 0,
  "dailyLimit": 5
}
```

### Test 2: Test EXIF Verification

1. Take a photo with your phone camera
2. Upload it to a base64 converter: https://base64.guru/converter/encode/image
3. Copy the base64 string
4. Run in browser console:

```javascript
const imageBase64 = 'data:image/jpeg;base64,YOUR_BASE64_HERE';

fetch('http://localhost:3000/api/verify-image', {
  method: 'POST',
  headers: { 'Content-T
ngify({
    imageBase64: imageBase64,
    userId: 'test-user-123'
  })
})
.then(r => r.json())
.then(data => console.log('✅ Duplicate API:', data))
.catch(err => console.error('❌ Error:', err));
```

## Step 4: Visual Testing with UI

Create a test page to see it in action:

1. Create `app/test-security/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { performSecurityChecks } from '@/lib/anti-cheat';
import SecurityCheckDisplay from '@/components/SecurityCheckDisplay';

export default function TestSecurityPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;

      setLoading(true);
      try {
        const securityResult = await performSecurityChecks(
          base64,
          'test-user-123',
          'waste-collection',
          { lat: 40.7128, lng: -74.0060 }
        );
        setResult(securityResult);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Security Test Page</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="mb-6"
      />

      <SecurityCheckDisplay result={result} loading={loading} />
    </div>
  );
}
```

2. Visit: http://localhost:3000/test-security
3. Upload a photo and see the results!

## Quick Troubleshooting

### Error: "Failed to fetch"
- Make sure dev server is running (`npm run dev`)
- Check the URL is correct (http://localhost:3000)

### Error: "Database error"
- Run the migration SQL in Supabase
- Check your `.env.local` has correct Supabase credentials

### Error: "No EXIF data found"
- This is expected for screenshots
- Use a real camera photo instead

### Error: "Module not found"
- Run `npm install` again
- Restart the dev server

## Success Checklist

- [ ] Cooldown API returns `{"allowed": true}`
- [ ] EXIF API returns data (or warnings for screenshots)
- [ ] Duplicate API returns hashes
- [ ] Test page loads without errors
- [ ] Can upload image and see security results

## Next Steps

Once all tests pass:
1. Integrate into your actual mission pages
2. Test with real user flows
3. Monitor for any issues
4. Adjust thresholds if needed

---

**Need Help?** Check the detailed `TESTING-GUIDE.md` for more scenarios!
