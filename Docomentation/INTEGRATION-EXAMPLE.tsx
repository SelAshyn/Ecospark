// Example: How to integrate anti-cheat into your mission submission flow
// This shows the complete flow from image upload to submission

'use client';

import { useState } from 'react';
import { performSecurityChecks } from '@/lib/anti-cheat';
import { submitMissionWithSecurity } from '@/lib/mission-submission';
import SecurityCheckDisplay from '@/components/SecurityCheckDisplay';

export default function MissionSubmissionExample() {
  const [imageBase64, setImageBase64] = useState<string>('');
  const [securityResult, setSecurityResult] = useState<any>(null);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
          alert('Please enable location services for mission verification');
        }
      );
    }
  };

  // Handle image upload and run security checks
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Get user location if not already obtained
    if (!userLocation) {
      getUserLocation();
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImageBase64(base64);

      // Run security checks immediately
      setSecurityLoading(true);
      try {
        const result = await performSecurityChecks(
          base64,
          'current-user-id', // Replace with actual user ID
          'waste-collection', // Replace with actual mission type
          userLocation || undefined
        );
        setSecurityResult(result);
      } catch (error) {
        console.error('Security check error:', error);
      } finally {
        setSecurityLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit mission with all security checks
  const handleSubmit = async () => {
    if (!securityResult?.passed) {
      alert('Please fix security issues before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitMissionWithSecurity({
        userId: 'current-user-id', // Replace with actual user ID
        missionId: 'mission-id', // Replace with actual mission ID
        missionType: 'waste-collection', // Replace with actual mission type
        imageBase64,
        userLocation: userLocation || undefined,
        description: 'Mission completion description',
      });

      if (result.success) {
        alert('Mission completed successfully! 🎉');
        // Reset form or redirect
      } else {
        alert('Submission failed: ' + result.errors?.join(', '));
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit mission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Complete Mission</h1>

      {/* Step 1: Upload Image */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Proof Photo</h2>
        <input
          type="file"
          accept="image/*"
          capture="environment" // Opens camera on mobile
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-green-50 file:text-green-700
            hover:file:bg-green-100"
        />
        <p className="text-sm text-gray-600 mt-2">
          📸 Take a photo with your camera for best results
        </p>
      </div>

      {/* Step 2: Security Check Results */}
      {(securityLoading || securityResult) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Security Verification</h2>
          <SecurityCheckDisplay result={securityResult} loading={securityLoading} />
        </div>
      )}

      {/* Step 3: Image Preview */}
      {imageBase64 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <img
            src={imageBase64}
            alt="Preview"
            className="w-full rounded-lg"
          />
        </div>
      )}

      {/* Step 4: Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!securityResult?.passed || submitting}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
          securityResult?.passed && !submitting
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {submitting ? 'Submitting...' : 'Complete Mission'}
      </button>

      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Security Features Active:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ EXIF metadata verification</li>
          <li>✅ Duplicate image detection</li>
          <li>✅ Time-based cooldown enforcement</li>
          <li>✅ Location verification</li>
          <li>✅ AI content analysis</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================
// SIMPLIFIED VERSION (Minimal Integration)
// ============================================

export function SimpleMissionSubmission() {
  const handleSubmit = async (imageBase64: string) => {
    // One-line integration!
    const result = await submitMissionWithSecurity({
      userId: 'user-id',
      missionId: 'mission-id',
      missionType: 'waste-collection',
      imageBase64,
      userLocation: { lat: 40.7128, lng: -74.0060 },
    });

    if (result.success) {
      console.log('✅ Mission completed!');
    } else {
      console.error('❌ Failed:', result.errors);
    }
  };

  return <div>Simple integration example</div>;
}
