'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Target, Award, Leaf, Droplets, Zap, Sprout, Users, TrendingUp,
  Camera, Upload, CheckCircle, X, Clock, Star, Filter, AlertCircle, Shield
} from 'lucide-react';
import { supabase, getCurrentUser } from '@/lib/supabase-auth';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface Mission {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  co2_impact: string;
  time_estimate: string;
  requirements: string[];
  image_url: string;
  is_active: boolean;
  completed?: boolean;
  completion_status?: string;
  started?: boolean;
  startedAt?: string;
  expiresAt?: string;
}

interface UserStats {
  totalPoints: number;
  completedMissions: number;
  totalCO2Saved: number;
  currentStreak: number;
}

interface MissionCompletion {
  mission_id: number;
  status: string;
}

interface MissionStart {
  mission_id: number;
  started_at: string;
  expires_at: string;
  completed: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All Missions', icon: Target },
  { id: 'Waste Management', label: 'Waste', icon: Sprout },
  { id: 'Water Conservation', label: 'Water', icon: Droplets },
  { id: 'Energy Efficiency', label: 'Energy', icon: Zap },
  { id: 'Biodiversity', label: 'Nature', icon: Leaf },
  { id: 'Sustainable Transport', label: 'Transport', icon: TrendingUp },
  { id: 'Sustainable Food', label: 'Food', icon: Sprout },
  { id: 'Community Education', label: 'Community', icon: Users },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return { bg: 'bg-[rgba(116,198,157,0.15)]', text: 'text-[#74c69d]', border: 'border-[rgba(116,198,157,0.3)]' };
    case 'intermediate': return { bg: 'bg-[rgba(212,168,83,0.15)]', text: 'text-[#d4a853]', border: 'border-[rgba(212,168,83,0.3)]' };
    case 'advanced': return { bg: 'bg-[rgba(239,68,68,0.15)]', text: 'text-[#ef4444]', border: 'border-[rgba(239,68,68,0.3)]' };
    default: return { bg: 'bg-[rgba(116,198,157,0.15)]', text: 'text-[#74c69d]', border: 'border-[rgba(116,198,157,0.3)]' };
  }
};

export default function MissionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [uploadedProof, setUploadedProof] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [missionStatus, setMissionStatus] = useState<{
    status: 'not_started' | 'in_progress' | 'expired';
    startedAt?: string;
    expiresAt?: string;
    timeRemaining?: { hours: number; minutes: number };
  } | null>(null);
  const [showStartConfirmModal, setShowStartConfirmModal] = useState(false);
  const [missionToStart, setMissionToStart] = useState<Mission | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    completedMissions: 0,
    totalCO2Saved: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    document.title = 'Ecospark | Missions';

    window.scrollTo(0, 0);
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      offset: 120,
    });
    checkUser();
    fetchMissions();
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      fetchUserStats(currentUser.id);
    }
  };

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: false });

      if (missionsError) throw missionsError;

      if (user) {
        // Get completions
        const { data: completionsData } = await supabase
          .from('mission_completions')
          .select('mission_id, status')
          .eq('user_id', user.id);

        const completionsMap = new Map(
          completionsData?.map((c: MissionCompletion) => [c.mission_id, c.status]) || []
        );

        // Get started missions
        const { data: startsData } = await supabase
          .from('mission_starts')
          .select('mission_id, started_at, expires_at, completed')
          .eq('user_id', user.id)
          .eq('completed', false)
          .gte('expires_at', new Date().toISOString());

        const startsMap = new Map<number, { startedAt: string; expiresAt: string }>(
          startsData?.map((s: MissionStart) => [s.mission_id, { startedAt: s.started_at, expiresAt: s.expires_at }]) || []
        );

        const missionsWithStatus = missionsData?.map((m: any) => ({
          ...m,
          completed: completionsMap.has(m.id),
          completion_status: completionsMap.get(m.id),
          started: startsMap.has(m.id),
          startedAt: startsMap.get(m.id)?.startedAt,
          expiresAt: startsMap.get(m.id)?.expiresAt,
        })) || [];

        setMissions(missionsWithStatus);
      } else {
        setMissions(missionsData || []);
      }
    } catch (error: any) {
      console.error('Error fetching missions:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId: string) => {
    try {
      const { data: completions } = await supabase
        .from('mission_completions')
        .select('mission_id')
        .eq('user_id', userId)
        .eq('status', 'completed');

      const completedCount = completions?.length || 0;

      const { data: missionsData } = await supabase
        .from('missions')
        .select('points')
        .in('id', completions?.map((c: { mission_id: any; }) => c.mission_id) || []);

      const totalPoints = missionsData?.reduce((sum: any, m: { points: any; }) => sum + m.points, 0) || 0;

      setUserStats({
        totalPoints,
        completedMissions: completedCount,
        totalCO2Saved: completedCount * 0.5,
        currentStreak: Math.min(completedCount, 7),
      });
    } catch (error: any) {
      console.error('Error fetching user stats:', error?.message);
    }
  };

  const handleViewDetails = (mission: Mission) => {
    setSelectedMission(mission);
    setShowDetailsModal(true);
  };

  const handleStartMission = async (mission: Mission) => {
    console.log('Start mission clicked:', mission.title);

    if (!user) {
      console.log('No user, redirecting to login');
      router.push('/login?from=mission');
      return;
    }

    try {
      console.log('Checking mission status...');
      // Check current mission status
      const statusResponse = await fetch('/api/check-mission-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          missionId: mission.id,
        }),
      });

      if (!statusResponse.ok) {
        console.error('Status check failed:', statusResponse.status);
        // If API doesn't exist yet, just show the modal
        setMissionToStart(mission);
        setShowStartConfirmModal(true);
        return;
      }

      const statusData = await statusResponse.json();
      console.log('Mission status:', statusData);

      if (statusData.status === 'in_progress') {
        // Mission already started, update the missions array to reflect this
        console.log('Mission already in progress, updating UI');
        setMissionStatus(statusData);

        // Update the missions array to show the button as "Mark Complete"
        setMissions(prevMissions =>
          prevMissions.map(m =>
            m.id === mission.id
              ? { ...m, started: true, startedAt: statusData.startedAt, expiresAt: statusData.expiresAt }
              : m
          )
        );

        // Also update selectedMission if it's the same mission
        if (selectedMission?.id === mission.id) {
          setSelectedMission({ ...mission, started: true, startedAt: statusData.startedAt, expiresAt: statusData.expiresAt });
        }

        return;
      }

      // Show confirmation modal with rules before starting
      console.log('Showing confirmation modal');
      console.log('Setting missionToStart:', mission.title);
      console.log('Setting showStartConfirmModal to true');
      setMissionToStart(mission);
      setShowStartConfirmModal(true);
      console.log('Modal state should be updated now');
    } catch (error) {
      console.error('Error in handleStartMission:', error);
      // Fallback: just show the modal
      console.log('Error fallback: showing modal anyway');
      setMissionToStart(mission);
      setShowStartConfirmModal(true);
    }
  };

  const confirmStartMission = async () => {
    if (!missionToStart || !user) return;

    try {
      console.log('Confirming mission start...');
      // Start new mission (don't open completion modal, just change button)
      const startResponse = await fetch('/api/start-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          missionId: missionToStart.id,
        }),
      });

      if (!startResponse.ok) {
        console.error('Start mission failed:', startResponse.status);
        alert('Failed to start mission. Please try again.');
        return;
      }

      const startData = await startResponse.json();
      console.log('Mission started:', startData);

      if (startData.success) {
        setMissionStatus({
          status: 'in_progress',
          startedAt: startData.startedAt,
          expiresAt: startData.expiresAt,
          timeRemaining: calculateTimeRemaining(startData.expiresAt),
        });
        setShowStartConfirmModal(false);
        setMissionToStart(null);
        // Refresh missions to update button state
        fetchMissions();
        alert('Mission started! You have 36 hours to complete it.');
      }
    } catch (error) {
      console.error('Error confirming mission start:', error);
      alert('Error starting mission. Please try again.');
    }
  };

  const handleMarkComplete = (mission: Mission) => {
    if (!user) {
      router.push('/login?from=mission');
      return;
    }
    // Open modal when user clicks "Mark Complete"
    setSelectedMission(mission);
    setShowDetailsModal(false);
    setShowCompletionModal(true);
    setUploadedProof(null);
    setCompletionNotes('');
    setVerificationResult(null);
  };

  const handleWithdrawMission = async () => {
    if (!selectedMission || !user) return;

    const confirmed = window.confirm('Are you sure you want to withdraw from this mission? You can start it again later.');
    if (!confirmed) return;

    try {
      console.log('Withdrawing mission...');

      // Call API to withdraw mission
      const response = await fetch('/api/withdraw-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          missionId: selectedMission.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw mission');
      }

      const data = await response.json();
      console.log('Mission withdrawn:', data);

      // Update UI: Change button back to "Start"
      setMissions(prevMissions =>
        prevMissions.map(m =>
          m.id === selectedMission.id
            ? { ...m, started: false, startedAt: undefined, expiresAt: undefined }
            : m
        )
      );

      // Close modal and reset state
      setShowCompletionModal(false);
      setSelectedMission(null);
      setMissionStatus(null);
      setUploadedProof(null);
      setCompletionNotes('');
      setVerificationResult(null);

      alert('Mission withdrawn successfully. You can start it again anytime.');
    } catch (error) {
      console.error('Error withdrawing mission:', error);
      alert('Failed to withdraw mission. Please try again.');
    }
  };

  const calculateTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageData = reader.result as string;
      setUploadedProof(imageData);

      // AI Verification
      if (selectedMission) {
        await verifyProofWithAI(imageData, selectedMission);
      }
    };
    reader.readAsDataURL(file);
  };

  const verifyProofWithAI = async (imageData: string, mission: Mission) => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Get user's current location for verification
      let userLocation = undefined;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: true,
            });
          });
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        } catch (error) {
          console.log('Location not available');
        }
      }


      const cooldownResponse = await fetch('/api/check-cooldown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          missionType: mission.category || mission.title.toLowerCase().replace(/\s+/g, '-'),
        }),
      });
      const cooldownData = await cooldownResponse.json();

      if (!cooldownData.allowed) {
        setVerificationResult({
          valid: false,
          message: cooldownData.message,
        });
        return;
      }

      const exifResponse = await fetch('/api/verify-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageData,
          userLocation,
        }),
      });
      const exifData = await exifResponse.json();


      if (!exifData.isValid) {
        const errorMessages = exifData.warnings?.filter((w: string) => w.includes('REJECTED')) || [];
        setVerificationResult({
          valid: false,
          message: errorMessages.length > 0
            ? errorMessages.join('. ')
            : 'Photo verification failed. Please take a fresh photo with your camera.',
        });
        return;
      }


      const duplicateResponse = await fetch('/api/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageData,
          userId: user?.id,
        }),
      });
      const duplicateData = await duplicateResponse.json();

      if (duplicateData.isDuplicate) {
        setVerificationResult({
          valid: false,
          message: duplicateData.isSelfDuplicate
            ? 'You have already submitted this or a very similar image'
            : 'This image has been submitted by another user',
        });
        return;
      }


      const aiResponse = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageData,
          missionType: mission.category || mission.title.toLowerCase().replace(/\s+/g, '-'),
        }),
      });

      const result = await aiResponse.json();


      if (result.error) {
        setVerificationResult({
          valid: false,
          message: result.error,
        });
      } else if (!result.isValid) {
        setVerificationResult({
          valid: false,
          message: `This image is not related to environmental activities. We detected: ${result.category}`,
        });
      } else if (result.confidence < 70) {
        setVerificationResult({
          valid: false,
          message: `Image content unclear or not relevant (${result.confidence}% confidence). Please take a clearer photo.`,
        });
      } else if (result.sustainabilityScore && result.sustainabilityScore < 5) {
        setVerificationResult({
          valid: false,
          message: `Low environmental relevance (${result.sustainabilityScore}/10). Please submit photos of actual environmental work.`,
        });
      } else {
        // ALL CHECKS PASSED! 🎉
        const photoAge = exifData.exifData?.timestamp
          ? Math.round((Date.now() - new Date(exifData.exifData.timestamp).getTime()) / (1000 * 60 * 60))
          : null;

        const successDetails = [
          '✓ All security checks passed!',
          photoAge ? `Photo taken ${photoAge}h ago` : 'Recent photo',
          exifData.locationValid ? 'Location verified' : '',
          `${cooldownData.remainingMissions - 1} missions remaining today`,
        ].filter(Boolean).join(' • ');

        setVerificationResult({
          valid: true,
          message: successDetails,
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        valid: false,
        message: 'Verification failed. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitCompletion = async () => {
    if (!selectedMission || !user || !uploadedProof) {
      alert('Please upload proof photo to complete the mission.');
      return;
    }

    if (verificationResult && !verificationResult.valid) {
      const confirm = window.confirm(
        'AI verification suggests this photo may not match the mission requirements. Do you want to submit anyway for manual review?'
      );
      if (!confirm) return;
    }

    try {
      const proofFile = await fetch(uploadedProof).then(r => r.blob());
      const fileName = `mission-completions/${user.id}/${selectedMission.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('mission-photos')
        .upload(fileName, proofFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('mission-photos')
        .getPublicUrl(fileName);

      const proofUrl = urlData.publicUrl;

      const { error: completionError } = await supabase
        .from('mission_completions')
        .insert({
          mission_id: selectedMission.id,
          user_id: user.id,
          user_email: user.email,
          proof_photo_url: proofUrl,
          notes: completionNotes,
          status: verificationResult?.valid ? 'completed' : 'pending',
          completed_at: new Date().toISOString(),
        });

      if (completionError) {
        if (completionError.code === '23505') {
          alert('You have already completed this mission!');
        } else {
          throw completionError;
        }
      } else {
        const statusMsg = verificationResult?.valid
          ? `Mission completed! You earned ${selectedMission.points} points! 🎉`
          : `Mission submitted for review. You'll earn ${selectedMission.points} points once verified! ⏳`;
        alert(statusMsg);
        setShowCompletionModal(false);
        fetchMissions();
        fetchUserStats(user.id);
      }
    } catch (error: any) {
      console.error('Error submitting completion:', error?.message);
      alert('Failed to submit mission completion. Please try again.');
    }
  };

  const filteredMissions = missions.filter(m => {
    const categoryMatch = selectedCategory === 'all' || m.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || m.difficulty === selectedDifficulty;
    const completedMatch = showCompleted || !m.completed;
    return categoryMatch && difficultyMatch && completedMatch;
  });

  const completedCount = missions.filter(m => m.completed).length;
  const availableCount = missions.filter(m => !m.completed).length;

  return (
    <div className="min-h-screen bg-[#040d07] overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.12),transparent_70%)]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(82,183,136,0.08),transparent_70%)]" />
      </div>

      <Navbar />

      <div className="relative z-10 pt-28 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.3)] px-4 py-1.5 rounded-full text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-[#95d5b2] mb-5">
              <Target size={12} />
              Gamified Sustainability
            </div>
            <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-black text-white leading-none tracking-[-0.02em] mb-4">
              Environmental{' '}
              <em className="not-italic bg-gradient-to-br from-[#74c69d] via-[#52b788] to-[#d4a853] bg-clip-text text-transparent">
                Missions
              </em>
            </h1>
            <p className="text-lg text-[rgba(183,228,199,0.6)] max-w-2xl leading-relaxed">
              Complete sustainability challenges, earn points, and make a real environmental impact. From waste reduction to renewable energy.
            </p>
          </div>

          {user && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12" data-aos="fade-up" data-aos-delay="100">
              {[
                { icon: Award, label: 'Total Points', value: userStats.totalPoints, color: 'from-[#d4a853] to-[#e8c468]' },
                { icon: CheckCircle, label: 'Completed', value: userStats.completedMissions, color: 'from-[#74c69d] to-[#95d5b2]' },
                { icon: Leaf, label: 'CO₂ Saved', value: `${userStats.totalCO2Saved.toFixed(1)}t`, color: 'from-[#52b788] to-[#74c69d]' },
                { icon: Star, label: 'Day Streak', value: userStats.currentStreak, color: 'from-[#40916c] to-[#52b788]' },
              ].map((stat, i) => (
                <div key={i} className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-5 hover:-translate-y-1 hover:border-[rgba(82,183,136,0.3)] transition-all duration-300">
                  <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 border border-[rgba(82,183,136,0.2)] mb-3`}>
                    <stat.icon size={20} className="text-[#74c69d]" />
                  </div>
                  <div className="font-serif text-[2rem] font-black text-white leading-none mb-1">{stat.value}</div>
                  <div className="text-[0.75rem] font-medium tracking-[0.05em] uppercase text-[rgba(183,228,199,0.5)]">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mb-8" data-aos="fade-up" data-aos-delay="200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={[
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-[0.85rem] font-semibold tracking-[0.02em] transition-all duration-200',
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] shadow-[0_0_20px_rgba(116,198,157,0.3)]'
                        : 'bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.15)] text-[rgba(183,228,199,0.6)] hover:border-[rgba(82,183,136,0.35)]',
                    ].join(' ')}
                  >
                    <cat.icon size={14} />
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[0.85rem] text-[rgba(183,228,199,0.5)]">
                <span>{filteredMissions.length} missions</span>
                {user && (
                  <span className="text-[rgba(183,228,199,0.3)]">
                    • {completedCount} completed • {availableCount} available
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {['all', 'beginner', 'intermediate', 'advanced'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={[
                      'px-4 py-1.5 rounded-full text-[0.75rem] font-semibold tracking-[0.05em] uppercase transition-all duration-200',
                      selectedDifficulty === diff
                        ? 'bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.5)] text-[#74c69d]'
                        : 'bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.15)] text-[rgba(183,228,199,0.5)] hover:border-[rgba(82,183,136,0.35)]',
                    ].join(' ')}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {user && completedCount > 0 && (
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={[
                    'flex items-center gap-2 px-4 py-1.5 rounded-full text-[0.75rem] font-semibold tracking-[0.05em] uppercase transition-all duration-200',
                    showCompleted
                      ? 'bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.5)] text-[#74c69d]'
                      : 'bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.15)] text-[rgba(183,228,199,0.5)] hover:border-[rgba(82,183,136,0.35)]',
                  ].join(' ')}
                >
                  <CheckCircle size={12} />
                  {showCompleted ? 'Hide Completed' : 'Show Completed'}
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-[rgba(82,183,136,0.2)] border-t-[#74c69d] animate-spin" />
                <p className="text-[rgba(183,228,199,0.5)] text-sm">Loading missions...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMissions.map((mission, index) => {
                const diffColor = getDifficultyColor(mission.difficulty);
                return (
                  <div
                    key={mission.id}
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                    className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.12)] rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-[rgba(82,183,136,0.3)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300"
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative h-48 overflow-hidden">
                      <img src={mission.image_url} alt={mission.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,13,7,0.9)] to-transparent" />

                      <div className="absolute top-3 right-3 flex gap-2">
                        <div className={`px-3 py-1 rounded-full text-[0.7rem] font-bold tracking-[0.08em] uppercase backdrop-blur-md border ${diffColor.bg} ${diffColor.text} ${diffColor.border}`}>
                          {mission.difficulty}
                        </div>
                        {mission.completed && (
                          <div className="px-3 py-1 rounded-full text-[0.7rem] font-bold tracking-[0.08em] uppercase backdrop-blur-md border bg-[rgba(45,106,79,0.3)] border-[rgba(82,183,136,0.4)] text-[#74c69d]">
                            ✓ Done
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(4,13,7,0.85)] border border-[rgba(212,168,83,0.4)] backdrop-blur-md">
                          <Award size={12} className="text-[#d4a853]" />
                          <span className="text-[0.75rem] font-bold text-[#d4a853]">{mission.points} pts</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(4,13,7,0.85)] border border-[rgba(82,183,136,0.3)] backdrop-blur-md">
                          <Clock size={12} className="text-[#74c69d]" />
                          <span className="text-[0.75rem] font-bold text-[#74c69d]">{mission.time_estimate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="mb-3">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[0.7rem] font-bold tracking-[0.08em] uppercase bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.25)] text-[#74c69d]">
                          {mission.category}
                        </span>
                      </div>

                      <h3 className="font-serif text-[1.15rem] font-bold text-white mb-2 leading-snug group-hover:text-[#95d5b2] transition-colors duration-300">
                        {mission.title}
                      </h3>

                      <p className="text-[0.85rem] text-[rgba(183,228,199,0.5)] leading-relaxed mb-4 line-clamp-2">
                        {mission.description}
                      </p>

                      <div className="bg-[rgba(5,18,10,0.6)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Leaf size={12} className="text-[#74c69d]" />
                          <span className="text-[0.7rem] font-bold tracking-[0.08em] uppercase text-[#74c69d]">Impact</span>
                        </div>
                        <p className="text-[0.8rem] text-[rgba(183,228,199,0.6)]">{mission.co2_impact}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(mission)}
                          className="flex-1 py-2.5 rounded-full border border-[rgba(82,183,136,0.3)] bg-[rgba(13,35,24,0.7)] text-[rgba(183,228,199,0.7)] text-[0.85rem] font-semibold hover:bg-[rgba(13,35,24,0.9)] hover:text-white hover:border-[rgba(82,183,136,0.5)] transition-all duration-200"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => mission.started ? handleMarkComplete(mission) : handleStartMission(mission)}
                          disabled={mission.completed}
                          className={[
                            'flex-1 py-2.5 rounded-full text-[0.85rem] font-bold tracking-[0.04em] uppercase transition-all duration-200',
                            mission.completed
                              ? 'bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.2)] text-[rgba(183,228,199,0.4)] cursor-not-allowed'
                              : mission.started
                              ? 'bg-gradient-to-br from-[#d4a853] to-[#f4c563] text-[#040d07] shadow-[0_0_20px_rgba(212,168,83,0.25)] hover:shadow-[0_0_32px_rgba(212,168,83,0.45)] hover:scale-[1.02]'
                              : 'bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] shadow-[0_0_20px_rgba(116,198,157,0.25)] hover:shadow-[0_0_32px_rgba(116,198,157,0.45)] hover:scale-[1.02]',
                          ].join(' ')}
                        >
                          {mission.completed ? 'Completed' : mission.started ? 'Mark Complete' : 'Start'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showDetailsModal && selectedMission && (
        <div className="fixed inset-0 bg-[rgba(4,13,7,0.95)] backdrop-blur-lg z-[9999] flex items-center justify-center p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="relative w-full max-w-3xl bg-gradient-to-br from-[rgba(13,35,24,0.97)] to-[rgba(7,21,16,0.99)] border border-[rgba(82,183,136,0.2)] rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-[0_32px_80px_rgba(0,0,0,0.7)]" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.4)] to-transparent" />

            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full text-[0.7rem] font-bold tracking-[0.08em] uppercase bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.25)] text-[#74c69d]">
                    {selectedMission.category}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-bold tracking-[0.08em] uppercase border ${getDifficultyColor(selectedMission.difficulty).bg} ${getDifficultyColor(selectedMission.difficulty).text} ${getDifficultyColor(selectedMission.difficulty).border}`}>
                    {selectedMission.difficulty}
                  </span>
                </div>
                <h2 className="font-serif text-[1.8rem] font-black text-white tracking-[-0.02em] mb-2">{selectedMission.title}</h2>
                <div className="flex items-center gap-4 text-[0.85rem] text-[rgba(183,228,199,0.5)]">
                  <div className="flex items-center gap-1.5">
                    <Award size={14} className="text-[#d4a853]" />
                    <span className="font-bold text-[#d4a853]">{selectedMission.points} points</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#74c69d]" />
                    {selectedMission.time_estimate}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(82,183,136,0.2)] bg-[rgba(45,106,79,0.15)] text-[rgba(183,228,199,0.6)] hover:text-white hover:bg-[rgba(45,106,79,0.3)] transition-all duration-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
              <img src={selectedMission.image_url} alt={selectedMission.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,13,7,0.8)] to-transparent" />
            </div>

            <div className="space-y-5">
              <div>
                <h3 className="text-[0.8rem] font-bold tracking-[0.1em] uppercase text-[#74c69d] mb-2">Description</h3>
                <p className="text-[0.95rem] text-[rgba(183,228,199,0.7)] leading-relaxed">{selectedMission.description}</p>
              </div>

              <div className="bg-[rgba(5,18,10,0.6)] border border-[rgba(82,183,136,0.15)] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf size={15} className="text-[#74c69d]" />
                  <h3 className="text-[0.8rem] font-bold tracking-[0.1em] uppercase text-[#74c69d]">Environmental Impact</h3>
                </div>
                <p className="text-[0.9rem] text-[rgba(183,228,199,0.7)]">{selectedMission.co2_impact}</p>
              </div>

              <div className="bg-[rgba(5,18,10,0.6)] border border-[rgba(82,183,136,0.15)] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={15} className="text-[#74c69d]" />
                  <h3 className="text-[0.8rem] font-bold tracking-[0.1em] uppercase text-[#74c69d]">Requirements</h3>
                </div>
                <ul className="space-y-2">
                  {selectedMission.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-[0.9rem] text-[rgba(183,228,199,0.7)]">
                      <span className="text-[#74c69d] mt-1">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-5 border-t border-[rgba(82,183,136,0.15)] flex gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 py-3 rounded-full border border-[rgba(82,183,136,0.15)] bg-[rgba(13,35,24,0.5)] text-[rgba(183,228,199,0.6)] text-[0.875rem] font-semibold hover:bg-[rgba(13,35,24,0.8)] hover:text-white transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => selectedMission && (selectedMission.started ? handleMarkComplete(selectedMission) : handleStartMission(selectedMission))}
                  disabled={selectedMission?.completed}
                  className={[
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[0.875rem] font-bold tracking-[0.04em] uppercase transition-all duration-200',
                    selectedMission?.completed
                      ? 'bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.2)] text-[rgba(183,228,199,0.4)] cursor-not-allowed'
                      : selectedMission?.started
                      ? 'bg-gradient-to-br from-[#d4a853] to-[#f4c563] text-[#040d07] shadow-[0_0_20px_rgba(212,168,83,0.25)] hover:shadow-[0_0_32px_rgba(212,168,83,0.45)]'
                      : 'bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] shadow-[0_0_20px_rgba(116,198,157,0.25)] hover:shadow-[0_0_32px_rgba(116,198,157,0.45)]',
                  ].join(' ')}
                >
                  <Target size={15} />
                  {selectedMission?.completed ? 'Already Completed' : selectedMission?.started ? 'Mark Complete' : 'Start Mission'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCompletionModal && selectedMission && (
        <div className="fixed inset-0 bg-[rgba(4,13,7,0.95)] backdrop-blur-lg z-[9999] flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-[rgba(13,35,24,0.97)] to-[rgba(7,21,16,0.99)] border border-[rgba(82,183,136,0.2)] rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
            <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.4)] to-transparent" />

            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <p className="text-[0.72rem] font-bold tracking-[0.1em] uppercase text-[#52b788] mb-1">Complete Mission</p>
                <h2 className="font-serif text-[1.5rem] font-black text-white tracking-[-0.02em] mb-2">{selectedMission.title}</h2>

                {missionStatus && missionStatus.status === 'in_progress' && missionStatus.timeRemaining && (
                  <div className="flex items-center gap-2 mt-3">
                    <Clock size={14} className="text-[#d4a853]" />
                    <span className="text-[0.8rem] font-semibold text-[#d4a853]">
                      Time Remaining: {missionStatus.timeRemaining.hours}h {missionStatus.timeRemaining.minutes}m
                    </span>
                    <span className="text-[0.7rem] text-[rgba(183,228,199,0.4)]">
                      (Started {new Date(missionStatus.startedAt!).toLocaleString()})
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(82,183,136,0.2)] bg-[rgba(45,106,79,0.15)] text-[rgba(183,228,199,0.6)] hover:text-white hover:bg-[rgba(45,106,79,0.3)] transition-all duration-200"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[0.9rem] text-[rgba(183,228,199,0.5)] mb-6 leading-relaxed">{selectedMission.description}</p>

            <div className="bg-[rgba(5,18,10,0.6)] border border-[rgba(82,183,136,0.15)] rounded-xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={15} className="text-[#74c69d]" />
                <span className="text-[0.72rem] font-bold tracking-[0.1em] uppercase text-[#74c69d]">Requirements</span>
              </div>
              <ul className="space-y-2">
                {selectedMission.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-[0.85rem] text-[rgba(183,228,199,0.6)]">
                    <span className="text-[#74c69d] mt-1">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-5">
              <label className="block text-[0.75rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)] mb-2">
                Upload Proof Photo (Required) *
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
                id="proof-upload"
                required
              />
              <label
                htmlFor="proof-upload"
                className="flex flex-col items-center justify-center gap-2 w-full h-48 border border-dashed border-[rgba(82,183,136,0.25)] rounded-xl hover:border-[rgba(82,183,136,0.5)] hover:bg-[rgba(45,106,79,0.1)] cursor-pointer transition-all duration-200 overflow-hidden"
              >
                {uploadedProof ? (
                  <div className="relative w-full h-full">
                    <img src={uploadedProof} alt="Proof" className="w-full h-full object-cover" />
                    {isVerifying && (
                      <div className="absolute inset-0 bg-[rgba(4,13,7,0.9)] flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-[rgba(82,183,136,0.2)] border-t-[#74c69d] animate-spin" />
                        <p className="text-[0.85rem] text-[rgba(183,228,199,0.7)]">AI is verifying your proof...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Camera size={32} className="text-[rgba(82,183,136,0.45)]" />
                    <span className="text-[0.85rem] text-[rgba(183,228,199,0.35)]">Click to upload proof photo</span>
                    <span className="text-[0.75rem] text-[rgba(183,228,199,0.25)]">AI will verify if it matches the mission</span>
                  </>
                )}
              </label>

              {verificationResult && (
                <div className={[
                  'mt-3 p-3 rounded-xl border flex items-start gap-2',
                  verificationResult.valid
                    ? 'bg-[rgba(45,106,79,0.2)] border-[rgba(82,183,136,0.3)]'
                    : 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)]',
                ].join(' ')}>
                  {verificationResult.valid ? (
                    <CheckCircle size={16} className="text-[#74c69d] mt-0.5 shrink-0" />
                  ) : (
                    <X size={16} className="text-[#ef4444] mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className={[
                      'text-[0.8rem] font-bold mb-1',
                      verificationResult.valid ? 'text-[#74c69d]' : 'text-[#ef4444]',
                    ].join(' ')}>
                      {verificationResult.valid ? '✓ Content Verified' : '✗ Verification Failed'}
                    </p>
                    <p className="text-[0.75rem] text-[rgba(183,228,199,0.6)]">{verificationResult.message}</p>
                    {!verificationResult.valid && (
                      <p className="text-[0.7rem] text-[#ef4444] mt-2 font-semibold">
                        Please upload a valid photo of environmental activities
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-[0.75rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)] mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Share your experience, challenges, or tips..."
                rows={4}
                className="w-full py-3 px-4 rounded-xl text-white text-[0.9rem] placeholder-[rgba(183,228,199,0.2)] bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.15)] outline-none focus:border-[rgba(82,183,136,0.6)] transition-all duration-200"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleWithdrawMission}
                className="flex-1 py-3 rounded-full border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] text-[rgba(239,68,68,0.8)] text-[0.875rem] font-semibold hover:bg-[rgba(239,68,68,0.2)] hover:text-[#ef4444] transition-all duration-200"
              >
                Withdraw
              </button>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 py-3 rounded-full border border-[rgba(82,183,136,0.15)] bg-[rgba(13,35,24,0.5)] text-[rgba(183,228,199,0.6)] text-[0.875rem] font-semibold hover:bg-[rgba(13,35,24,0.8)] hover:text-white transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCompletion}
                disabled={!uploadedProof || isVerifying || (verificationResult?.valid === false)}
                className={[
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[0.875rem] font-bold tracking-[0.04em] uppercase transition-all duration-200',
                  !uploadedProof || isVerifying || (verificationResult?.valid === false)
                    ? 'bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.2)] text-[rgba(183,228,199,0.4)] cursor-not-allowed'
                    : 'bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] shadow-[0_0_20px_rgba(116,198,157,0.25)] hover:shadow-[0_0_32px_rgba(116,198,157,0.45)]',
                ].join(' ')}
              >
                <CheckCircle size={15} />
                {isVerifying ? 'Verifying...' : (verificationResult?.valid === false) ? 'Cannot Submit' : 'Complete Mission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showStartConfirmModal && missionToStart && (
        <div className="fixed inset-0 bg-[rgba(4,13,7,0.95)] backdrop-blur-lg z-[9999] flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-[rgba(13,35,24,0.97)] to-[rgba(7,21,16,0.99)] border border-[rgba(82,183,136,0.2)] rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
            <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.4)] to-transparent" />

            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <p className="text-[0.72rem] font-bold tracking-[0.1em] uppercase text-[#52b788] mb-1">Start Mission</p>
                <h2 className="font-serif text-[1.5rem] font-black text-white tracking-[-0.02em] mb-2">{missionToStart.title}</h2>
              </div>
              <button
                onClick={() => {
                  setShowStartConfirmModal(false);
                  setMissionToStart(null);
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(82,183,136,0.2)] bg-[rgba(45,106,79,0.15)] text-[rgba(183,228,199,0.6)] hover:text-white hover:bg-[rgba(45,106,79,0.3)] transition-all duration-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-[rgba(5,18,10,0.6)] border border-[rgba(212,168,83,0.3)] rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={18} className="text-[#d4a853]" />
                <span className="text-[0.8rem] font-bold tracking-[0.08em] uppercase text-[#d4a853]">Important: Mission Rules & Regulations</span>
              </div>
              <div className="space-y-3 text-[0.85rem] text-[rgba(183,228,199,0.7)] leading-relaxed">
                <p className="font-semibold text-white">By starting this mission, you agree to:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#74c69d] mt-1">•</span>
                    <span><strong className="text-white">Complete within 36 hours (1.5 days)</strong> - You must upload proof of work within this timeframe or the mission will reset.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#74c69d] mt-1">•</span>
                    <span><strong className="text-white">Take original photos only</strong> - Photos must be taken with your camera during the mission period. Screenshots and downloaded images will be rejected.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#74c69d] mt-1">•</span>
                    <span><strong className="text-white">Location verification</strong> - Photos must be taken at your current location (within 5km radius) with GPS enabled.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#74c69d] mt-1">•</span>
                    <span><strong className="text-white">No duplicate submissions</strong> - Each photo can only be used once. Reusing photos or copying from others will be detected and rejected.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#74c69d] mt-1">•</span>
                    <span><strong className="text-white">Respect cooldown periods</strong> - Maximum 5 missions per day, 24-hour cooldown between same mission types, 30-minute minimum between any missions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#74c69d] mt-1">•</span>
                    <span><strong className="text-white">Environmental relevance</strong> - Photos must show actual environmental activities related to the mission. AI will verify content authenticity.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-[rgba(45,106,79,0.15)] border border-[rgba(82,183,136,0.2)] rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-[#74c69d] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[0.85rem] font-semibold text-white mb-1">Mission Deadline</p>
                  <p className="text-[0.8rem] text-[rgba(183,228,199,0.7)]">
                    Once you click "Start Mission", you'll have <strong className="text-[#74c69d]">36 hours</strong> to complete and submit your proof.
                    A countdown timer will be displayed on your mission card.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-[#ef4444] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[0.85rem] font-semibold text-[#ef4444] mb-1">Security Checks</p>
                  <p className="text-[0.8rem] text-[rgba(183,228,199,0.7)]">
                    All submissions go through automated security verification including EXIF metadata analysis,
                    duplicate detection, and AI content validation to ensure fair play.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStartConfirmModal(false);
                  setMissionToStart(null);
                }}
                className="flex-1 py-3 rounded-full border border-[rgba(82,183,136,0.15)] bg-[rgba(13,35,24,0.5)] text-[rgba(183,228,199,0.6)] text-[0.875rem] font-semibold hover:bg-[rgba(13,35,24,0.8)] hover:text-white transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmStartMission}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[0.875rem] font-bold tracking-[0.04em] uppercase transition-all duration-200 bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] shadow-[0_0_20px_rgba(116,198,157,0.25)] hover:shadow-[0_0_32px_rgba(116,198,157,0.45)]"
              >
                <CheckCircle size={15} />
                I Agree - Start Mission
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
