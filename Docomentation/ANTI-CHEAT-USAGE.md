# Anti-Cheat Security Features - Usage Guide

## Overview

Three security features have been implemented to prevent cheating and ensure authentic mission completions:

1. **EXIF Metadata Checking** - Verifies photos are original and recent
2. **Duplicate Image Detection** - Prevents reuse of images
3. **Time-Based Restrictions** - Enforces cooldowns and rate limits

## Installation

First, install the required dependencies:

```bash
npm install
```

This will install:
- `exif-parser` - Extract EXIF metadata from images
- `sharp` - Image processing and metadata extraction
- `imghash` - Perceptual hashing for duplicate detection
- `geolib` - GPS distance calculations

## Database Setup

Run the migration script to add required columns:

```sql
-- Run this in your Supabase SQL editor
-- File: supabase-anti-cheat-migration.sql
```

This adds:
- `image_hash` - Exact image hash
- `perceptual_hash` - Similar image detection
- `exif_data` - EXIF metadata storage
- `photo_timestamp` - Original photo timestamp
- `photo_location` - GPS coordinates
- `mission_type` - For cooldown tracking

## API Endpoints

### 1. `/api/verify-image` - EXIF Verification

Checks image authenticity and metadata.

**Request:**
```typescript
POST /api/verify-image
{
  "imageBase64": "data:image/jpeg;base64,...",
  "userLocation": { "lat": 40.7128, "lng": -74.0060 }
}
```

**Response:**
```typescript
{
  "isValid": boolean,
  "warnings": string[],
  "exifData": {
    "timestamp": "2026-03-06T10:30:00Z",
    "location": { "lat": 40.7128, "lng": -74.0060 },
    "camera": { "make": "Apple", "model": "iPhone 14" },
    "software": null
  },
  "locationValid": boolean,
  "distanceFromUser": 150 // meters
}
```

**Checks:**
- Photo taken within 36 hours (1.5 days)
- GPS location within 5km of user
- Has camera information (not screenshot)
- No editing software detected
- Timestamp not in future

### 2. `/api/check-duplicate` - Duplicate Detection

Detects exact and similar images.

**Request:**
```typescript
POST /api/check-duplicate
{
  "imageBase64": "data:image/jpeg;base64,...",
  "userId": "user-uuid"
}
```

**Response:**
```typescript
{
  "isDuplicate": boolean,
  "isSelfDuplicate": boolean,
  "exactHash": "abc123...",
  "perceptualHash": "def456...",
  "exactDuplicates": [...],
  "similarImages": [
    { "id": "...", "similarity": 95, "user_id": "..." }
  ],
  "warnings": string[]
}
```

**Detection Methods:**
- Exact hash matching (identical images)
- Perceptual hashing (similar images, even if resized/cropped)
- Hamming distance calculation (similarity scoring)

### 3. `/api/check-cooldown` - Time Restrictions

Enforces rate limits and cooldowns.

**Request:**
```typescript
POST /api/check-cooldown
{
  "userId": "user-uuid",
  "missionType": "waste-collection" // optional
}
```

**Response:**
```typescript
{
  "allowed": boolean,
  "reason": "daily_limit" | "mission_cooldown" | "rate_limit",
  "message": "You have reached the daily limit of 5 missions",
  "cooldownEnds": "2026-03-07T00:00:00Z",
  "remainingMissions": 3,
  "dailyLimit": 5
}
```

**Restrictions:**
- Daily limit: 5 missions per day
- Mission cooldown: 24 hours between same mission type
- Rate limit: 30 minutes between any missions

## Integration Examples

### Basic Usage

```typescript
import { performSecurityChecks } from '@/lib/anti-cheat';

const result = await performSecurityChecks(
  imageBase64,
  userId,
  'waste-collection',
  { lat: 40.7128, lng: -74.0060 }
);

if (!result.passed) {
  console.error('Security checks failed:', result.errors);
  return;
}

// Proceed with mission submission
```

### Full Mission Submission

```typescript
import { submitMissionWithSecurity } from '@/lib/mission-submission';

const result = await submitMissionWithSecurity({
  userId: 'user-uuid',
  missionId: 'mission-uuid',
  missionType: 'waste-collection',
  imageBase64: 'data:image/jpeg;base64,...',
  userLocation: { lat: 40.7128, lng: -74.0060 },
  description: 'Collected 5kg of waste',
});

if (result.success) {
  console.log('Mission completed!', result.completionId);
} else {
  console.error('Failed:', result.errors);
}
```

### React Component

```typescript
import SecurityCheckDisplay from '@/components/SecurityCheckDisplay';

function MissionForm() {
  const [securityResult, setSecurityResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (imageBase64: string) => {
    setLoading(true);
    const result = await performSecurityChecks(
      imageBase64,
      userId,
# Duplicate Detection
- ✅ No exact duplicates allowed
- ✅ Similar images flagged (>90% similarity)
- ✅ Checks against all previous submissions
- ✅ Prevents both self-duplication and copying others

### Time Restrictions
- ✅ Maximum 5 missions per day
- ✅ 24-hour cooldown between same mission types
- ✅ 30-minute minimum between any missions
- ✅ Cooldown timers displayed to users

## Testing

### Test EXIF Verification
```bash
# Take a photo with your phone (has EXIF data)
# Upload it - should pass

# Take a screenshot
# Upload it - should fail (no EXIF)
```

### Test Duplicate Detection
```bash
# Upload same image twice
# Second upload should fail

# Upload similar image (cropped/resized)
# Should be flagged as similar
```

### Test Cooldowns
```bash
# Complete 5 missions in one day
# 6th attempt should fail

# Complete same mission type twice
# Second attempt within 24h should fail
```

## Error Handling

All APIs return consistent error formats:

```typescript
{
  "error": "Error message",
  "details": {...} // optional
}
```

Common errors:
- `400` - Missing required fields
- `500` - Server/processing error

## Performance Considerations

- EXIF extraction: ~50-100ms
- Duplicate checking: ~100-200ms (depends on database size)
- Cooldown check: ~50ms
- Total overhead: ~200-400ms per submission

## Future Enhancements

Potential improvements:
- Reverse image search integration (Google/TinEye)
- Machine learning for fake image detection
- Blockchain verification for immutable records
- Real-time location verification
- Face recognition for user verification

## Troubleshooting

### "No EXIF data found"
- User uploaded screenshot or downloaded image
- Image was edited and EXIF stripped
- Solution: Require camera photos only

### "Photo location too far"
- GPS coordinates don't match user location
- User may have location services disabled
- Solution: Prompt user to enable GPS

### "Daily limit reached"
- User completed 5 missions today
- Solution: Show cooldown timer, reset at midnight

## Support

For issues or questions:
1. Check console logs for detailed errors
2. Verify database migration ran successfully
3. Ensure all npm packages installed correctly
4. Check API endpoint responses in Network tab

---

**Security Status:** ✅ All three anti-cheat features implemented and ready to use!
