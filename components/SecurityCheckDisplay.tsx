'use client';

import { AlertCircle, CheckCircle, Clock, Shield, XCircle } from 'lucide-react';
import { SecurityCheckResult } from '@/lib/anti-cheat';

interface SecurityCheckDisplayProps {
  result: SecurityCheckResult | null;
  loading?: boolean;
}

export default function SecurityCheckDisplay({ result, loading }: SecurityCheckDisplayProps) {
  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600 animate-pulse" />
          <span className="text-blue-800 font-medium">Running security checks...</span>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { passed, errors, warnings } = result;

  return (
    <div className="space-y-3">
      {/* Main Status */}
      <div
        className={`border rounded-lg p-4 ${
          passed
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="flex items-start gap-3">
          {passed ? (
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h3 className={`font-semibold ${passed ? 'text-green-800' : 'text-red-800'}`}>
              {passed ? 'Security Checks Passed' : 'Security Checks Failed'}
            </h3>
            <p className={`text-sm mt-1 ${passed ? 'text-green-700' : 'text-red-700'}`}>
              {passed
                ? 'Your submission meets all security requirements'
                : 'Please address the issues below before submitting'}
            </p>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-800 mb-2">Errors</h4>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800 mb-2">Warnings</h4>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-700">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Cooldown Info */}
      {result.data.cooldown && result.data.cooldown.remainingMissions !== undefined && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-800">Daily Progress</h4>
              <p className="text-sm text-blue-700 mt-1">
                {result.data.cooldown.remainingMissions} of {result.data.cooldown.dailyLimit} missions remaining today
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Info - Only show when passed */}
      {result.data.ai && passed && result.data.ai.isValid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800">Content Verified</h4>
              <p className="text-sm text-green-700 mt-1">
                {result.data.ai.description}
              </p>
              {result.data.ai.sustainabilityScore && (
                <div className="mt-2 text-xs text-green-600">
                  Environmental relevance: {result.data.ai.sustainabilityScore}/10
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
