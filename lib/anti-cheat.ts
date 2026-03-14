// Anti-Cheat Utility Functions
// Integrates EXIF checking, duplicate detection, and cooldown validation

export interface SecurityCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  data: {
    exif?: any;
    ai?: any;
    duplicate?: any;
    cooldown?: any;
  };
}

export async function performSecurityChecks(
  imageBase64: string,
  userId: string,
  missionType?: string,
  userLocation?: { lat: number; lng: number }
): Promise<SecurityCheckResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: any = {};

  try {
    // 1. Check cooldown first (fastest check)
    const cooldownResponse = await fetch('/api/check-cooldown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, missionType }),
    });
    const cooldownData = await cooldownResponse.json();
    data.cooldown = cooldownData;

    if (!cooldownData.allowed) {
      errors.push(cooldownData.message);
      return { passed: false, errors, warnings, data };
    }

    // 2. Verify EXIF metadata
    const exifResponse = await fetch('/api/verify-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, userLocation }),
    });
    const exifData = await exifResponse.json();
    data.exif = exifData;

    if (!exifData.isValid) {
      errors.push('Image verification failed - photo does not meet security requirements');
      if (exifData.warnings && exifData.warnings.length > 0) {
        warnings.push(...exifData.warnings);
      }
    } else if (exifData.warnings && exifData.warnings.length > 0) {
      warnings.push(...exifData.warnings);
    }

    // 3. AI Content Validation - Check if image is related to mission and environment
    const aiResponse = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, missionType }),
    });
    const aiData = await aiResponse.json();
    data.ai = aiData;

    if (aiData.error) {
      errors.push('Failed to analyze image content');
    } else {
      // Check if image is related to environment/sustainability
      if (!aiData.isValid) {
        errors.push(`This image is not related to environmental activities. We detected: ${aiData.category}`);
      } else if (aiData.confidence < 70) {
        errors.push(`Image content unclear or not relevant (${aiData.confidence}% confidence). Please take a clearer photo of environmental activities.`);
      }

      // Check sustainability score
      if (aiData.sustainabilityScore && aiData.sustainabilityScore < 5) {
        errors.push(`This image has low environmental relevance (${aiData.sustainabilityScore}/10). Please submit photos of actual environmental work.`);
      }

      // Check mission match if available
      if (aiData.missionMatch === false) {
        errors.push(`This image doesn't match the mission type. Expected: ${missionType}`);
      }
    }

    // 4. Check for duplicates
    const duplicateResponse = await fetch('/api/check-duplicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, userId }),
    });
    const duplicateData = await duplicateResponse.json();
    data.duplicate = duplicateData;

    if (duplicateData.isDuplicate) {
      if (duplicateData.isSelfDuplicate) {
        errors.push('You have already submitted this or a very similar image');
      } else {
        errors.push('This image has been submitted by another user');
      }
    }

    const passed = errors.length === 0;
    return { passed, errors, warnings, data };
  } catch (error: any) {
    errors.push('Security check failed: ' + error.message);
    return { passed: false, errors, warnings, data };
  }
}

export function formatCooldownTime(cooldownEnds: string): string {
  const now = new Date();
  const end = new Date(cooldownEnds);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'Ready now';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function getSecurityBadgeColor(passed: boolean, warningCount: number): string {
  if (!passed) return 'red';
  if (warningCount > 0) return 'yellow';
  return 'green';
}
