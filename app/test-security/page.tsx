'use client';

import { useState } from 'react';
import { performSecurityChecks } from '@/lib/anti-cheat';
import SecurityCheckDisplay from '@/components/SecurityCheckDisplay';

export default function TestSecurityPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);

      setLoading(true);
      try {
        let userLocation = undefined;
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
          } catch (error) {
            console.log('Location not available');
          }
        }

        const securityResult = await performSecurityChecks(
          base64,
          'test-user-123',
          'waste-collection',
          userLocation
        );
        console.log('Security Check Result:', securityResult);
        console.log('EXIF Data:', securityResult.data.exif);
        console.log('Is Valid:', securityResult.data.exif?.isValid);
        console.log('Warnings:', securityResult.data.exif?.warnings);
        setResult(securityResult);
      } catch (error) {
        console.error('Security check error:', error);
        alert('Error: ' + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-2">🔒 Security Test Page</h1>
          <p className="text-gray-600 mb-8">
            Test EXIF verification, duplicate detection, and cooldown checks
          </p>

          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">Upload Test Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <p className="mt-2 text-sm text-gray-500">📸 Use camera photo for best results</p>
          </div>

          {imagePreview && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Image Preview</h2>
              <img src={imagePreview} alt="Preview" className="w-full max-w-md rounded-lg shadow-md" />
            </div>
          )}

          {(loading || result) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Security Check Results</h2>
              <SecurityCheckDisplay result={result} loading={loading} />
            </div>
          )}

          {/* Submit Button */}
          {imagePreview && result && (
            <div className="mb-8">
              <button
                disabled={!result.passed || loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  result.passed && !loading
                    ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Checking...' : result.passed ? '✅ Complete Mission' : '🚫 Cannot Submit - Fix Issues Above'}
              </button>
              {!result.passed && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  Please upload a valid photo that meets all requirements
                </p>
              )}
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">🛡️ Active Security Features:</h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white rounded p-3">
                <div className="font-semibold mb-1">📸 EXIF Verification</div>
                <ul className="text-xs space-y-1">
                  <li>• Timestamp check</li>
                  <li>• GPS validation</li>
                  <li>• Camera detection</li>
                  <li>• Edit detection</li>
                </ul>
              </div>
              <div className="bg-white rounded p-3">
                <div className="font-semibold mb-1">🤖 AI Content Check</div>
                <ul className="text-xs space-y-1">
                  <li>• Environmental relevance</li>
                  <li>• Mission type match</li>
                  <li>• Sustainability score</li>
                  <li>• Content validation</li>
                </ul>
              </div>
              <div className="bg-white rounded p-3">
                <div className="font-semibold mb-1">🔍 Duplicate Detection</div>
                <ul className="text-xs space-y-1">
                  <li>• Exact matching</li>
                  <li>• Perceptual hashing</li>
                  <li>• Similarity scoring</li>
                  <li>• Cross-user check</li>
                </ul>
              </div>
              <div className="bg-white rounded p-3">
                <div className="font-semibold mb-1">⏰ Time Restrictions</div>
                <ul className="text-xs space-y-1">
                  <li>• Daily limit (5)</li>
                  <li>• Cooldown (24h)</li>
                  <li>• Rate limit (30min)</li>
                  <li>• Timers</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-900 mb-3">🧪 Test Scenarios:</h3>
            <div className="space-y-2 text-sm">
              <div>✅ <strong>Valid:</strong> Fresh camera photo (should pass)</div>
              <div>❌ <strong>Screenshot:</strong> Should fail - no EXIF</div>
              <div>❌ <strong>Duplicate:</strong> Same image twice (should fail)</div>
              <div>❌ <strong>Old:</strong> Photo from 3+ days ago (should fail)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
