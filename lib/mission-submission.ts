// Mission Submission with Anti-Cheat Integration
import { supabase } from '@/lib/supabase';
import { performSecurityChecks } from '@/lib/anti-cheat';

export interface MissionSubmissionData {
  userId: string;
  missionId: string;
  missionType: string;
  imageBase64: string;
  userLocation?: { lat: number; lng: number };
  description?: string;
}

export interface SubmissionResult {
  success: boolean;
  message: string;
  completionId?: string;
  errors?: string[];
  warnings?: string[];
  securityData?: any;
}

export async function submitMissionWithSecurity(
  data: MissionSubmissionData
): Promise<SubmissionResult> {
  try {
    // Step 1: Run all security checks
    const securityCheck = await performSecurityChecks(
      data.imageBase64,
      data.userId,
      data.missionType,
      data.userLocation
    );

    // If security checks fail, return immediately
    if (!securityCheck.passed) {
      return {
        success: false,
        message: 'Security checks failed',
        errors: securityCheck.errors,
        warnings: securityCheck.warnings,
        securityData: securityCheck.data,
      };
    }

    // Step 2: Analyze image with AI (existing functionality)
    const analysisResponse = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: data.imageBase64 }),
    });

    if (!analysisResponse.ok) {
      return {
        success: false,
        message: 'Image analysis failed',
        errors: ['Failed to analyze image content'],
      };
    }

    const analysis = await analysisResponse.json();

    if (!analysis.isValid || analysis.confidence < 70) {
      return {
        success: false,
        message: 'Image does not meet mission requirements',
        errors: ['Image content is not related to the mission'],
      };
    }

    // Step 3: Save to database with security metadata
    const { data: completion, error } = await supabase
      .from('mission_completions')
      .insert({
        user_id: data.userId,
        mission_id: data.missionId,
        mission_type: data.missionType,
        image_url: data.imageBase64, // In production, upload to storage first
        description: data.description,
        // Security metadata
        image_hash: securityCheck.data.duplicate?.exactHash,
        perceptual_hash: securityCheck.data.duplicate?.perceptualHash,
        exif_data: securityCheck.data.exif?.exifData,
        photo_timestamp: securityCheck.data.exif?.exifData?.timestamp,
        photo_location: securityCheck.data.exif?.exifData?.location
          ? `(${securityCheck.data.exif.exifData.location.lat},${securityCheck.data.exif.exifData.location.lng})`
          : null,
        // AI analysis results
        ai_analysis: {
          category: analysis.category,
          confidence: analysis.confidence,
          description: analysis.description,
          sustainabilityScore: analysis.sustainabilityScore,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        message: 'Failed to save mission completion',
        errors: [error.message],
      };
    }

    return {
      success: true,
      message: 'Mission completed successfully!',
      completionId: completion.id,
      warnings: securityCheck.warnings,
      securityData: securityCheck.data,
    };
  } catch (error: any) {
    console.error('Mission submission error:', error);
    return {
      success: false,
      message: 'Submission failed',
      errors: [error.message || 'An unexpected error occurred'],
    };
  }
}
