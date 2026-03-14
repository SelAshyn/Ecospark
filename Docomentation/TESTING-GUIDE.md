# Anti-Cheat Testing Guide

## Pre-Testing Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migration
```sql
-- In Supabase SQL Editor, run:
-- File: supabase-anti-cheat-migration.sql
```

### 3. Verify Environment Variables
Ensure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
GROQ_API_KEY=your-groq-key
```

## Test Scenarios

### Test 1: EXIF Metadata Checking ✅

#### Scenario A: Valid Photo (Should Pass)
1. Take a photo with your phone camera
2. Upload immediately (within 48 hours)
3. Ensure GPS is enabled
4. **Expected Result:** ✅ Pass with green checkmark

#### Scenario B: Screenshot (Should Fail)
1. Take a screenshot of any image
2. Upload the screenshot
3. **Expected Result:** ❌ Fail with warning "No EXIF data found"

#### Scenario C: Old Photo (Should Fail)
1. Upload a photo taken more than 48 hours ago
2. **Expected Result:** ❌ Fail with warning "Photo is X hours old"

#### Scenario D: Wrong Location (Should Fail)
1. Upload a photo with GPS data from different location
2. **Expected Result:** ❌ Fail with warning "Photo location is X km away"

#### Scenario E: Edited Photo (Should Fail)
1. Edit a photo in Photoshop/GIMP
2. Upload the edited version
3. **Expected Result:** ❌ Fail with warning "Photo shows signs of editing"

### Test 2: Duplicate Image Detection 🔍

#### Scenario A: Exact Duplicate (Should Fail)
1. Upload an image successfully
2. Try to upload the exact same image again
3. **Expected Result:** ❌ Fail with "You have already submitted this image"

#### Scenario B: Similar Image (Should Warn)
1. Upload an image successfully
2. Crop or resize the same image
3. Try to upload the modified version
4. **Expected Result:** ❌ Fail with "Similar image detected"

#### Scenario C: Different User Same Image (Should Fail)
1. User A uploads an image
2. User B tries to upload the same image
3. **Expected Result:** ❌ Fail with "This image has been submitted by another user"

#### Scenario D: Unique Image (Should Pass)
1. Upload a completely new, unique image
2. **Expected Result:** ✅ Pass

### Test 3: Time-Based Restrictions ⏰

#### Scenario A: Daily Limit (Should Fail)
1. Complete 5 missions in one day
2. Try to complete a 6th mission
3. **Expected Result:** ❌ Fail with "You have reached the daily limit"

#### Scenario B: Mission Type Cooldown (Should Fail)
1. Complete a "waste-collection" mission
2. Immediately try to complete another "waste-collection" mission
3. **Expected Result:** ❌ Fail with "You must wait 24 hours"

#### Scenario C: Rate Limiting (Should Fail)
1. Complete any mission
2. Immediately try to complete another mission (within 30 minutes)
3. **Expected Result:** ❌ Fail with "Please wait X minutes"

#### Scenario D: After Cooldown (Should Pass)
1. Wait for cooldown period to expire
2. Try to complete mission again
3. **Expected Result:** ✅ Pass

## API Testing with cURL

### Test EXIF Verification
```bash
curl -X POST http://localhost:3000/api/verify-image \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
    "userLocation": {"lat": 40.7128, "lng": -74.0060}
  }'
```

### Test Duplicate Detection
```bash
curl -X POST http://localhost:3000/api/check-duplicate \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
    "userId": "test-user-id"
  }'
```

### Test Cooldown
```bash
curl -X POST http://localhost:3000/api/check-cooldown \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "missionType": "waste-collection"
  }'
```

## Browser Console Testing

### Quick Test in Browser Console
```javascript
// Test security checks
const testImage = 'data:image/jpeg;base64,...'; // Your base64 image

const result = await fetch('/api/verify-image', {
  method: 'POST',
d": true,
  "distanceFromUser": 150
}
```

### Duplicate Detection Response
```json
{
  "isDuplicate": false,
  "isSelfDuplicate": false,
  "exactHash": "abc123...",
  "perceptualHash": "def456...",
  "exactDuplicates": [],
  "similarImages": [],
  "warnings": []
}
```

### Cooldown Response
```json
{
  "allowed": true,
  "remainingMissions": 4,
  "dailyCount": 1,
  "dailyLimit": 5
}
```

## Troubleshooting

### Issue: "No EXIF data found" for valid photos
**Solution:**
- Ensure photo is taken with camera app (not screenshot)
- Some messaging apps strip EXIF data
- Try uploading directly from camera roll

### Issue: Location verification fails
**Solution:**
- Enable GPS/location services on device
- Ensure browser has location permission
- Check if photo has GPS data (some cameras don't include it)

### Issue: Cooldown not working
**Solution:**
- Verify database migration ran successfully
- Check `mission_completions` table has `created_at` column
- Ensure user_id is correct

### Issue: Duplicate detection too sensitive
**Solution:**
- Adjust hamming distance threshold in `check-duplicate/route.ts`
- Current threshold: 10 (can increase to 15-20 for less sensitivity)

## Performance Benchmarks

Expected processing times:
- EXIF extraction: 50-100ms
- Duplicate check: 100-200ms
- Cooldown check: 50ms
- Total: ~200-400ms

If slower:
- Check database indexes are created
- Verify network latency
- Consider caching for cooldown checks

## Test Checklist

Before deploying to production:

- [ ] All three APIs respond correctly
- [ ] Database migration completed
- [ ] EXIF validation works for camera photos
- [ ] EXIF validation fails for screenshots
- [ ] Duplicate detection catches exact matches
- [ ] Duplicate detection catches similar images
- [ ] Daily limit enforced (5 missions)
- [ ] Mission type cooldown enforced (24 hours)
- [ ] Rate limiting enforced (30 minutes)
- [ ] Security checks integrated into mission flow
- [ ] Error messages are user-friendly
- [ ] Cooldown timers display correctly
- [ ] Location verification works
- [ ] Performance is acceptable (<500ms)

## Automated Testing (Optional)

Create test suite:

```typescript
// __tests__/anti-cheat.test.ts
describe('Anti-Cheat Features', () => {
  test('EXIF validation rejects screenshots', async () => {
    // Test implementation
  });

  test('Duplicate detection catches exact matches', async () => {
    // Test implementation
  });

  test('Cooldown enforces daily limit', async () => {
    // Test implementation
  });
});
```

## Production Monitoring

Monitor these metrics:
- Security check failure rate
- Average processing time
- False positive rate
- User complaints about restrictions

## Next Steps

After testing:
1. ✅ Verify all tests pass
2. ✅ Deploy to staging environment
3. ✅ Test with real users
4. ✅ Monitor for issues
5. ✅ Adjust thresholds if needed
6. ✅ Deploy to production

---

**Happy Testing! 🧪**
