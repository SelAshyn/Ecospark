'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LandDetailsModal from '@/components/LandDetailsModal';
import { MapPin, Sprout, Users, TrendingUp, Camera, Upload, CheckCircle, Leaf, Droplets, ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase-auth';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface LandPlot {
  id: number;
  title: string;
  location: string;
  size: string;
  status: 'Available' | 'In Progress';
  participants: number;
  progress: number;
  image: string;
  beforeImage?: string;
  afterImage?: string;
  description: string;
  ownerName: string;
  soilType: string;
  waterAccess: boolean;
  startupMission?: { title: string; description: string; requirement: string; completed: boolean };
  aiRecommendation?: { crop: string; reason: string; benefit: string; season: string };
}

const howItWorks = [
  {
    icon: MapPin,
    title: 'Landowners List Plots',
    desc: 'Have unused land? List it with details like size, soil type, and water access. Help farmers while your land gets restored.',
    color: '#74c69d'
  },
  {
    icon: Camera,
    title: 'Farmers Claim with Proof',
    desc: 'Complete a "Sweat & Share Mission" by uploading before/after photos of initial work. This proves commitment and prevents fraud.',
    color: '#d4a853'
  },
  {
    icon: Users,
    title: 'Community Collaboration',
    desc: 'Join ongoing projects to share labor, knowledge, and harvest. Multiple farmers work together for mutual benefit.',
    color: '#52b788'
  },
  {
    icon: Sprout,
    title: 'AI-Guided Growth',
    desc: 'Get crop recommendations based on soil type and season. Track progress from 0% to 100% restoration.',
    color: '#40916c'
  },
];

export default function Land() {
  const [selectedPlot, setSelectedPlot] = useState<LandPlot | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [uploadedBefore, setUploadedBefore] = useState<string | null>(null);
  const [uploadedAfter, setUploadedAfter] = useState<string | null>(null);
  const [landPlots, setLandPlots] = useState<LandPlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { icon: MapPin, label: 'Land Restored', value: '0 hectares', desc: '0m² revitalized' },
    { icon: Sprout, label: 'Food Produced', value: '0 kg', desc: 'Annual harvest' },
    { icon: Users, label: 'Active Farmers', value: '0', desc: 'Gained land access' },
    { icon: TrendingUp, label: 'CO₂ Absorbed', value: '0 tons', desc: 'Environmental impact' },
  ]);

  useEffect(() => {
    document.title = 'Ecospark | Land Revival';

    window.scrollTo(0, 0);

    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      offset: 120,
      delay: 0,
      disable: false,
      mirror: false,
      anchorPlacement: 'top-center',
    });

    setTimeout(() => {
      AOS.refresh();
    }, 100);

    fetchLandPlots();
  }, []);

  const fetchLandPlots = async () => {
    setLoading(true);
    try {
      const { data: plotsData, error: plotsError } = await supabase
        .from('lands')
        .select('*')
        .order('created_at', { ascending: false });

      if (plotsError) {
        console.error('Error fetching plots:', plotsError);
        throw plotsError;
      }

      console.log('Fetched plots:', plotsData);

      const { data: claimsData } = await supabase
        .from('land_claims')
        .select('land_plot_id, before_photo_url, after_photo_url');

      const { data: participantsData } = await supabase
        .from('land_participants')
        .select('land_plot_id');

      const claimsMap = new Map();
      claimsData?.forEach((claim: any) => {
        if (!claimsMap.has(claim.land_plot_id)) {
          claimsMap.set(claim.land_plot_id, claim);
        }
      });

      const participantsCount = new Map();
      participantsData?.forEach((participant: any) => {
        const count = participantsCount.get(participant.land_plot_id) || 0;
        participantsCount.set(participant.land_plot_id, count + 1);
      });

      const formattedPlots: LandPlot[] = (plotsData || []).map((plot: any) => {
        const claim = claimsMap.get(plot.id);
        const participants = participantsCount.get(plot.id) || 0;
        const hasClaim = !!claim;

        const plotId = typeof plot.id === 'string' ? parseInt(plot.id.split('-')[0], 16) % 10000 : plot.id;

        return {
          id: plotId,
          title: plot.title,
          location: plot.location_name || 'Unknown',
          size: `${plot.area_sqm} m²`,
          status: plot.status as 'Available' | 'In Progress',
          participants: participants,
          progress: hasClaim ? 45 : 0,
          image: (Array.isArray(plot.images) ? plot.images[0] : plot.images) || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800',
          beforeImage: claim?.before_photo_url || (Array.isArray(plot.images) ? plot.images[0] : plot.images),
          afterImage: claim?.after_photo_url,
          description: plot.description || '',
          ownerName: plot.owner_name || 'Land Owner',
          soilType: plot.soil_type || 'Loamy',
          waterAccess: plot.water_access !== false,
          startupMission: {
            title: 'Clear & Mulch Startup',
            description: 'Clear weeds from 5 m² and apply mulch layer',
            requirement: 'Upload geo-tagged before/after photos showing cleared area',
            completed: hasClaim,
          },
          aiRecommendation: getAIRecommendation(plot.soil_type || 'Loamy'),
        };
      });

      console.log('Formatted plots:', formattedPlots);
      setLandPlots(formattedPlots);

      const totalPlots = formattedPlots.length;
      const totalParticipants = Array.from(participantsCount.values()).reduce((a, b) => a + b, 0);
      const totalClaims = claimsData?.length || 0;

      const landRestored = totalClaims > 0 ? (totalClaims * 0.5).toFixed(1) : totalPlots > 0 ? (totalPlots * 0.05).toFixed(1) : '0.0';
      const landRestoredSqm = totalClaims > 0 ? totalClaims * 500 : totalPlots > 0 ? totalPlots * 50 : 0;
      const foodProduced = totalClaims > 0 ? (totalClaims * 200).toFixed(1) : totalPlots > 0 ? (totalPlots * 20).toFixed(1) : '0.0';
      const activeFarmers = totalParticipants + totalClaims || totalPlots;
      const co2Absorbed = totalClaims > 0 ? (totalClaims * 5).toFixed(1) : totalPlots > 0 ? (totalPlots * 0.5).toFixed(1) : '0.0';

      setStats([
        { icon: MapPin, label: 'Land Restored', value: `${landRestored} hectares`, desc: `${landRestoredSqm}m² revitalized` },
        { icon: Sprout, label: 'Food Produced', value: `${foodProduced} kg`, desc: 'Annual harvest' },
        { icon: Users, label: 'Active Farmers', value: `${activeFarmers}`, desc: 'Gained land access' },
        { icon: TrendingUp, label: 'CO₂ Absorbed', value: `${co2Absorbed} tons`, desc: 'Environmental impact' },
      ]);

      console.log('Stats updated:', { totalPlots, totalParticipants, totalClaims });
    } catch (error: any) {
      console.error('Error fetching land plots:', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const getAIRecommendation = (soilType: string) => {
    const recommendations: Record<string, any> = {
      'Loamy': { crop: 'Beans & Lentils', reason: 'Nitrogen-fixing legumes ideal for soil restoration', benefit: 'Reduces fertilizer needs by 30% and improves soil health', season: 'Spring/Autumn' },
      'Clay-Loam': { crop: 'Tomatoes & Peppers', reason: 'Clay-loam soil with good water retention suits these crops', benefit: 'High yield potential with proper care', season: 'Summer' },
      'Sandy-Loam': { crop: 'Leafy Greens (Spinach, Lettuce)', reason: 'Fast-growing crops suitable for urban farming', benefit: 'Quick harvest cycle, low water requirements', season: 'Year-round' },
      'Container Mix': { crop: 'Herbs (Basil, Coriander, Mint)', reason: 'Perfect for container gardening with high demand', benefit: 'Low maintenance, continuous harvest', season: 'Year-round' },
    };
    return recommendations[soilType] || recommendations['Loamy'];
  };

  const handleDetailsClick = (plot: LandPlot) => {
    setSelectedPlot(plot);
    setShowDetailsModal(true);
  };

  const handleClaimClick = (plot: LandPlot) => {
    setSelectedPlot(plot);
    setUploadedBefore(null);
    setUploadedAfter(null);
    setShowClaimModal(true);
  };

  const handleFileUpload = (type: 'before' | 'after', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'before') setUploadedBefore(reader.result as string);
      else setUploadedAfter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClaimSubmit = async () => {
    if (!uploadedBefore || !uploadedAfter || !selectedPlot) return;

    const user = await getCurrentUser();
    if (!user) {
      alert('Please sign in to claim a plot');
      window.location.href = '/login';
      return;
    }

    try {
      const beforeFile = await fetch(uploadedBefore).then(r => r.blob());
      const beforeFileName = `land-claims/${user.id}/${selectedPlot.id}/before-${Date.now()}.jpg`;
      const { error: beforeError } = await supabase.storage
        .from('land-photos')
        .upload(beforeFileName, beforeFile);

      if (beforeError) {
        console.error('Error uploading before photo:', beforeError?.message || beforeError);
        throw new Error(`Failed to upload before photo: ${beforeError.message}`);
      }

      const afterFile = await fetch(uploadedAfter).then(r => r.blob());
      const afterFileName = `land-claims/${user.id}/${selectedPlot.id}/after-${Date.now()}.jpg`;
      const { error: afterError } = await supabase.storage
        .from('land-photos')
        .upload(afterFileName, afterFile);

      if (afterError) {
        console.error('Error uploading after photo:', afterError?.message || afterError);
        throw new Error(`Failed to upload after photo: ${afterError.message}`);
      }

      // Get public URLs
      const { data: beforeData } = supabase.storage.from('land-photos').getPublicUrl(beforeFileName);
      const { data: afterData } = supabase.storage.from('land-photos').getPublicUrl(afterFileName);

      // Save claim to database
      const { error: claimError } = await supabase
        .from('land_claims')
        .insert({
          land_plot_id: selectedPlot.id,
          user_id: user.id,
          user_email: user.email,
          before_photo_url: beforeData.publicUrl,
          after_photo_url: afterData.publicUrl,
          claimed_at: new Date().toISOString(),
          mission_title: selectedPlot.startupMission?.title,
          mission_description: selectedPlot.startupMission?.description,
        });

      if (claimError) {
        console.error('Error saving claim:', claimError?.message || claimError);

        // Check for specific error types
        if (claimError.code === '23505') {
          throw new Error('You have already claimed this plot!');
        } else if (claimError.code === 'PGRST116' || claimError.message?.includes('does not exist')) {
          throw new Error('The land claims system is not yet set up. Please run the database setup script.');
        } else {
          throw new Error(`Failed to save claim: ${claimError.message}`);
        }
      }

      alert('Plot claimed successfully! You can now start farming.');
      setShowClaimModal(false);
      setUploadedBefore(null);
      setUploadedAfter(null);
      fetchLandPlots(); // Refresh the plots data
    } catch (error: any) {
      console.error('Error claiming plot:', error?.message || error);
      alert(error?.message || 'Failed to claim plot. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#040d07] overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.12),transparent_70%)]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(82,183,136,0.07),transparent_70%)]" />
      </div>

      <Navbar />

      <div className="relative z-10 pt-28 pb-24 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="mb-14" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.3)] px-4 py-1.5 rounded-full text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-[#95d5b2] mb-5">
              <Sprout size={12} />
              Collaborative Farming Platform
            </div>
            <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-black text-white leading-none tracking-[-0.02em] mb-4">
              Revitalize{' '}
              <em className="not-italic bg-gradient-to-br from-[#74c69d] via-[#52b788] to-[#d4a853] bg-clip-text text-transparent">
                Barren Land
              </em>
            </h1>
            <p className="text-lg text-[rgba(183,228,199,0.6)] max-w-2xl leading-relaxed">
              Claim unused plots for collaborative farming. Share labor and space to boost soil fertility, local food production, and community bonds.
            </p>
          </div>

          <div className="relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-8 mb-14 overflow-hidden" data-aos="fade-up" data-aos-delay="100">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_40px,rgba(82,183,136,0.015)_40px,rgba(82,183,136,0.015)_41px)]" />
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <div key={i} className="text-center group">
                  <div className="inline-flex p-3 rounded-xl bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.2)] mb-4 group-hover:bg-[rgba(45,106,79,0.35)] group-hover:shadow-[0_0_20px_rgba(116,198,157,0.2)] transition-all duration-300">
                    <s.icon size={22} className="text-[#74c69d]" />
                  </div>
                  <div className="font-serif text-[2.25rem] font-black text-[#95d5b2] leading-none mb-1 [text-shadow:0_0_30px_rgba(149,213,178,0.35)]">{s.value}</div>
                  <div className="text-[0.78rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.45)] mb-1">{s.label}</div>
                  <div className="text-[0.7rem] text-[rgba(183,228,199,0.3)]">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-14" data-aos="fade-up">
            <div className="text-center mb-8">
              <p className="text-[0.75rem] font-bold tracking-[0.15em] uppercase text-[#52b788] mb-3">Available Plots</p>
              <h2 className="font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-black text-white tracking-[-0.02em] mb-3">Browse & Claim Land</h2>
              <p className="text-[0.95rem] text-[rgba(183,228,199,0.5)] max-w-2xl mx-auto">Start your farming journey or join existing projects to collaborate with the community</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-[rgba(82,183,136,0.2)] border-t-[#74c69d] animate-spin" />
                <p className="text-[rgba(183,228,199,0.5)] text-sm">Loading land plots...</p>
              </div>
            </div>
          ) : landPlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-[rgba(13,35,24,0.6)] to-[rgba(7,21,16,0.8)] border border-[rgba(82,183,136,0.12)] rounded-2xl mb-14">
              <Sprout size={48} className="text-[rgba(82,183,136,0.3)] mb-4" />
              <p className="text-[rgba(183,228,199,0.5)] text-center">No land plots available yet.<br />Check back soon for new opportunities!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
              {landPlots.map((plot, index) => (
              <div
                key={plot.id}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.12)] rounded-[20px] overflow-hidden hover:-translate-y-1.5 hover:border-[rgba(82,183,136,0.3)] hover:shadow-[0_24px_80px_rgba(0,0,0,0.4),0_0_60px_rgba(64,145,108,0.08)] transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#74c69d] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                <div className="relative h-56 overflow-hidden">
                  <img src={plot.image} alt={plot.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,13,7,0.8)] via-[rgba(4,13,7,0.1)] to-transparent" />

                  <div className={[
                    'absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.72rem] font-bold tracking-[0.08em] uppercase backdrop-blur-md border',
                    plot.status === 'Available'
                      ? 'bg-[rgba(4,13,7,0.75)] border-[rgba(82,183,136,0.4)] text-[#74c69d]'
                      : 'bg-[rgba(4,13,7,0.75)] border-[rgba(212,168,83,0.4)] text-[#d4a853]',
                  ].join(' ')}>
                    <span className={['w-1.5 h-1.5 rounded-full animate-pulse', plot.status === 'Available' ? 'bg-[#74c69d]' : 'bg-[#d4a853]'].join(' ')} />
                    {plot.status}
                  </div>

                  {plot.beforeImage && plot.afterImage && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.72rem] font-bold tracking-[0.08em] uppercase backdrop-blur-md border bg-[rgba(4,13,7,0.75)] border-[rgba(82,183,136,0.25)] text-[rgba(149,213,178,0.8)]">
                      <Camera size={10} />
                      Before/After
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4 font-serif text-[1rem] font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]">{plot.size}</div>
                </div>

                <div className="p-6">
                  <h3 className="font-serif text-[1.3rem] font-bold text-white mb-2 leading-snug group-hover:text-[#95d5b2] transition-colors duration-300">{plot.title}</h3>
                  <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)] leading-relaxed mb-4">{plot.description}</p>

                  <div className="flex items-center gap-5 text-[0.8rem] text-[rgba(183,228,199,0.45)] mb-5">
                    <div className="flex items-center gap-1.5"><MapPin size={13} className="text-[#52b788]" />{plot.location}</div>
                    <div className="flex items-center gap-1.5"><Users size={13} className="text-[#52b788]" />{plot.participants} farmers</div>
                    <div className="flex items-center gap-1.5">
                      <Droplets size={13} className="text-[#52b788]" />
                      {plot.waterAccess ? 'Water available' : 'No water'}
                    </div>
                  </div>

                  {plot.aiRecommendation && (
                    <div className="bg-[rgba(5,18,10,0.6)] border border-[rgba(82,183,136,0.15)] rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf size={13} className="text-[#74c69d]" />
                        <span className="text-[0.7rem] font-bold tracking-[0.1em] uppercase text-[#74c69d]">AI Crop Advisor</span>
                      </div>
                      <p className="text-[0.9rem] font-bold text-white mb-1">Recommended: {plot.aiRecommendation.crop}</p>
                      <p className="text-[0.8rem] text-[rgba(183,228,199,0.45)] mb-2">{plot.aiRecommendation.reason}</p>
                      <div className="flex items-center gap-1.5 text-[0.78rem] text-[#74c69d]">
                        <TrendingUp size={12} />
                        {plot.aiRecommendation.benefit}
                      </div>
                    </div>
                  )}

                  {plot.startupMission && plot.status === 'Available' && (
                    <div className="bg-[rgba(5,18,10,0.6)] border border-[rgba(212,168,83,0.2)] rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera size={13} className="text-[#d4a853]" />
                        <span className="text-[0.7rem] font-bold tracking-[0.1em] uppercase text-[#d4a853]">Sweat & Share Mission</span>
                      </div>
                      <p className="text-[0.9rem] font-bold text-white mb-1">{plot.startupMission.title}</p>
                      <p className="text-[0.8rem] text-[rgba(183,228,199,0.45)] mb-1">{plot.startupMission.description}</p>
                      <p className="text-[0.75rem] text-[rgba(183,228,199,0.3)] italic">📸 {plot.startupMission.requirement}</p>
                    </div>
                  )}

                  {plot.progress > 0 && (
                    <div className="mb-5">
                      <div className="flex justify-between text-[0.78rem] mb-2">
                        <span className="text-[rgba(183,228,199,0.45)] font-medium tracking-wide uppercase">Restoration Progress</span>
                        <span className="font-bold text-[#74c69d]">{plot.progress}%</span>
                      </div>
                      <div className="w-full bg-[rgba(5,18,10,0.8)] rounded-full h-1.5 border border-[rgba(82,183,136,0.1)]">
                        <div className="bg-gradient-to-r from-[#40916c] to-[#74c69d] h-1.5 rounded-full shadow-[0_0_8px_rgba(116,198,157,0.4)] transition-all duration-700" style={{ width: `${plot.progress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[rgba(82,183,136,0.1)]">
                    <button
                      onClick={() => handleDetailsClick(plot)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] text-[0.82rem] font-bold tracking-[0.05em] uppercase shadow-[0_0_20px_rgba(116,198,157,0.25)] hover:shadow-[0_0_32px_rgba(116,198,157,0.45)] hover:scale-[1.02] transition-all duration-200"
                    >
                      View Details
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}

          <div className="relative bg-gradient-to-br from-[rgba(13,35,24,0.7)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[radial-gradient(ellipse,rgba(45,106,79,0.2),transparent_70%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="text-center mb-10">
                <p className="text-[0.75rem] font-bold tracking-[0.15em] uppercase text-[#52b788] mb-3">How It Works</p>
                <h2 className="font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-black text-white tracking-[-0.02em] mb-3">The Collaborative Farming Model</h2>
                <p className="text-[0.95rem] text-[rgba(183,228,199,0.5)] max-w-3xl mx-auto">A win-win-win solution for landowners, farmers, and the planet</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {howItWorks.map((step, i) => (
                  <div key={i} className="group relative p-6 rounded-[20px] border border-[rgba(82,183,136,0.08)] hover:bg-[rgba(13,35,24,0.6)] hover:border-[rgba(82,183,136,0.2)] transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 rounded-xl bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.2)] group-hover:bg-[rgba(45,106,79,0.35)] group-hover:shadow-[0_0_20px_rgba(116,198,157,0.2)] transition-all duration-300">
                        <step.icon size={24} className="text-[#74c69d]" style={{ color: step.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-[1.15rem] font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)] leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 mt-10 gap-6 mb-14" data-aos="fade-up">
            <div className="relative bg-gradient-to-br from-[rgba(45,106,79,0.25)] to-[rgba(13,35,24,0.8)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(116,198,157,0.15),transparent_70%)]" />
              <div className="relative z-10">
                <div className="inline-flex p-3 rounded-xl bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.25)] mb-4">
                  <Leaf size={24} className="text-[#74c69d]" />
                </div>
                <h3 className="font-serif text-[1.3rem] font-bold text-white mb-3">Environmental Impact</h3>
                <ul className="space-y-2 text-[0.875rem] text-[rgba(183,228,199,0.6)]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#74c69d] mt-1">•</span>
                    <span>Converts barren land into productive green spaces</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#74c69d] mt-1">•</span>
                    <span>Carbon sequestration through plant growth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#74c69d] mt-1">•</span>
                    <span>Supports biodiversity and soil health</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#74c69d] mt-1">•</span>
                    <span>Urban greening and air quality improvement</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-[rgba(64,145,108,0.25)] to-[rgba(13,35,24,0.8)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(82,183,136,0.15),transparent_70%)]" />
              <div className="relative z-10">
                <div className="inline-flex p-3 rounded-xl bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.25)] mb-4">
                  <Users size={24} className="text-[#52b788]" />
                </div>
                <h3 className="font-serif text-[1.3rem] font-bold text-white mb-3">Social Impact</h3>
                <ul className="space-y-2 text-[0.875rem] text-[rgba(183,228,199,0.6)]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#52b788] mt-1">•</span>
                    <span>Increases local food security in communities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#52b788] mt-1">•</span>
                    <span>Provides land access to landless farmers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#52b788] mt-1">•</span>
                    <span>Builds community through shared work</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#52b788] mt-1">•</span>
                    <span>Knowledge sharing and skill development</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-[rgba(212,168,83,0.2)] to-[rgba(13,35,24,0.8)] border border-[rgba(212,168,83,0.15)] rounded-2xl p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(212,168,83,0.15),transparent_70%)]" />
              <div className="relative z-10">
                <div className="inline-flex p-3 rounded-xl bg-[rgba(212,168,83,0.2)] border border-[rgba(212,168,83,0.25)] mb-4">
                  <TrendingUp size={24} className="text-[#d4a853]" />
                </div>
                <h3 className="font-serif text-[1.3rem] font-bold text-white mb-3">Economic Impact</h3>
                <ul className="space-y-2 text-[0.875rem] text-[rgba(183,228,199,0.6)]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#d4a853] mt-1">•</span>
                    <span>Income generation from shared harvests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#d4a853] mt-1">•</span>
                    <span>Reduced costs through shared labor & tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#d4a853] mt-1">•</span>
                    <span>Strengthens local food economy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#d4a853] mt-1">•</span>
                    <span>Lower food costs for participants</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[rgba(13,35,24,0.9)] to-[rgba(7,21,16,0.95)] border border-[rgba(82,183,136,0.2)] rounded-2xl p-8 mb-14 overflow-hidden" data-aos="fade-up">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_40px,rgba(82,183,136,0.02)_40px,rgba(82,183,136,0.02)_41px)]" />
            <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.4)] to-transparent" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)]">
                  <Camera size={24} className="text-[#d4a853]" />
                </div>
                <div>
                  <p className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-[#d4a853] mb-1">Real-World Example</p>
                  <h3 className="font-serif text-[1.5rem] font-bold text-white">500m² Plot in Kathmandu</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center text-[0.85rem] font-bold text-[#74c69d]">1</div>
                    <div>
                      <p className="text-[0.9rem] font-semibold text-white mb-1">Owner Lists Unused Plot</p>
                      <p className="text-[0.8rem] text-[rgba(183,228,199,0.5)]">Can't maintain it alone, wants it productive</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center text-[0.85rem] font-bold text-[#74c69d]">2</div>
                    <div>
                      <p className="text-[0.9rem] font-semibold text-white mb-1">Farmer A Claims It</p>
                      <p className="text-[0.8rem] text-[rgba(183,228,199,0.5)]">Clears weeds, adds mulch (photos prove work)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center text-[0.85rem] font-bold text-[#74c69d]">3</div>
                    <div>
                      <p className="text-[0.9rem] font-semibold text-white mb-1">Farmers B, C, D Join</p>
                      <p className="text-[0.8rem] text-[rgba(183,228,199,0.5)]">Collaborate on planting and maintenance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center text-[0.85rem] font-bold text-[#74c69d]">4</div>
                    <div>
                      <p className="text-[0.9rem] font-semibold text-white mb-1">AI Recommends Beans</p>
                      <p className="text-[0.8rem] text-[rgba(183,228,199,0.5)]">Nitrogen-fixing crop perfect for soil restoration</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[rgba(5,18,10,0.6)] border border-[rgba(82,183,136,0.15)] rounded-xl p-6">
                  <p className="text-[0.75rem] font-bold tracking-[0.1em] uppercase text-[#74c69d] mb-4">After 3 Months</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.875rem] text-[rgba(183,228,199,0.6)]">Total Harvest</span>
                      <span className="font-serif text-[1.5rem] font-bold text-white">200 kg</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-[rgba(82,183,136,0.2)] to-transparent" />
                    <div className="flex items-center justify-between">
                      <span className="text-[0.875rem] text-[rgba(183,228,199,0.6)]">Per Person (5 people)</span>
                      <span className="font-serif text-[1.3rem] font-bold text-[#95d5b2]">40 kg</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-[rgba(82,183,136,0.2)] to-transparent" />
                    <div className="flex items-center justify-between">
                      <span className="text-[0.875rem] text-[rgba(183,228,199,0.6)]">Market Value/Person</span>
                      <span className="font-serif text-[1.3rem] font-bold text-[#d4a853]">NPR 8,000</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[rgba(82,183,136,0.15)]">
                      <div className="flex items-center gap-2 text-[0.8rem] text-[#74c69d] mb-2">
                        <CheckCircle size={14} />
                        <span>Improved soil for next season</span>
                      </div>
                      <div className="flex items-center gap-2 text-[0.8rem] text-[#74c69d]">
                        <CheckCircle size={14} />
                        <span>Strong community bonds formed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showClaimModal && selectedPlot && (
        <div className="fixed inset-0 bg-[rgba(4,13,7,0.95)] backdrop-blur-lg z-[9999] flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-[rgba(13,35,24,0.97)] to-[rgba(7,21,16,0.99)] border border-[rgba(82,183,136,0.2)] rounded-[24px] p-8 max-h-[90vh] overflow-y-auto shadow-[0_32px_80px_rgba(0,0,0,0.7)]">

            <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.4)] to-transparent rounded-full" />

            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[0.72rem] font-bold tracking-[0.1em] uppercase text-[#52b788] mb-1">Claim Plot</p>
                <h2 className="font-serif text-[1.5rem] font-black text-white tracking-[-0.02em]">{selectedPlot.title}</h2>
              </div>
              <button
                onClick={() => setShowClaimModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(82,183,136,0.2)] bg-[rgba(45,106,79,0.15)] text-[rgba(183,228,199,0.6)] hover:text-white hover:bg-[rgba(45,106,79,0.3)] transition-all duration-200"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[0.9rem] text-[rgba(183,228,199,0.5)] mb-6 leading-relaxed">{selectedPlot.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[['Size', selectedPlot.size], ['Soil Type', selectedPlot.soilType], ['Water Access', selectedPlot.waterAccess ? '✓ Available' : '✗ Not available'], ['Owner', selectedPlot.ownerName]].map(([label, val]) => (
                <div key={label as string} className="bg-[rgba(5,18,10,0.6)] border border-[rgba(82,183,136,0.12)] rounded-xl p-4">
                  <p className="text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-[rgba(183,228,199,0.4)] mb-1">{label}</p>
                  <p className="text-[0.9rem] font-bold text-white">{val}</p>
                </div>
              ))}
            </div>

            {selectedPlot.aiRecommendation && (
              <div className="bg-[rgba(5,18,10,0.6)] border border-[rgba(82,183,136,0.15)] rounded-xl p-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf size={15} className="text-[#74c69d]" />
                  <span className="text-[0.72rem] font-bold tracking-[0.1em] uppercase text-[#74c69d]">AI Crop Recommendation</span>
                </div>
                <p className="font-serif text-[1.05rem] font-bold text-white mb-1.5">{selectedPlot.aiRecommendation.crop}</p>
                <p className="text-[0.85rem] text-[rgba(183,228,199,0.5)] mb-3">{selectedPlot.aiRecommendation.reason}</p>
                <div className="flex items-center gap-2 text-[0.8rem] text-[#74c69d]">
                  <TrendingUp size={13} />
                  {selectedPlot.aiRecommendation.benefit}
                </div>
              </div>
            )}

            {selectedPlot.startupMission && (
              <div className="bg-[rgba(5,18,10,0.6)] border border-[rgba(212,168,83,0.2)] rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Camera size={15} className="text-[#d4a853]" />
                  <span className="text-[0.72rem] font-bold tracking-[0.1em] uppercase text-[#d4a853]">Required Startup Mission</span>
                </div>
                <p className="font-serif text-[1.05rem] font-bold text-white mb-1">{selectedPlot.startupMission.title}</p>
                <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)] mb-5">{selectedPlot.startupMission.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  {(['before', 'after'] as const).map((type) => {
                    const uploaded = type === 'before' ? uploadedBefore : uploadedAfter;
                    return (
                      <div key={type}>
                        <p className="text-[0.75rem] font-semibold text-[rgba(183,228,199,0.5)] mb-2 capitalize">{type} Photo</p>
                        <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileUpload(type, e)} className="hidden" id={`${type}-upload`} />
                        <label
                          htmlFor={`${type}-upload`}
                          className="flex flex-col items-center justify-center gap-2 w-full h-32 border border-dashed border-[rgba(82,183,136,0.25)] rounded-xl hover:border-[rgba(82,183,136,0.5)] hover:bg-[rgba(45,106,79,0.1)] cursor-pointer transition-all duration-200 overflow-hidden"
                        >
                          {uploaded ? (
                            <img src={uploaded} alt={type} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <Upload size={20} className="text-[rgba(82,183,136,0.45)]" />
                              <span className="text-[0.75rem] text-[rgba(183,228,199,0.35)]">Upload {type}</span>
                            </>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>

                {uploadedBefore && uploadedAfter && (
                  <div className="mt-4 flex items-center gap-2 text-[0.85rem] text-[#74c69d]">
                    <CheckCircle size={15} />
                    Both photos uploaded — ready to claim!
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowClaimModal(false)}
                className="flex-1 py-3 rounded-full border border-[rgba(82,183,136,0.15)] bg-[rgba(13,35,24,0.5)] text-[rgba(183,228,199,0.6)] text-[0.875rem] font-semibold hover:bg-[rgba(13,35,24,0.8)] hover:text-white hover:border-[rgba(82,183,136,0.3)] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                disabled={!uploadedBefore || !uploadedAfter}
                onClick={handleClaimSubmit}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] text-[0.875rem] font-bold tracking-[0.04em] uppercase shadow-[0_0_20px_rgba(116,198,157,0.25)] hover:shadow-[0_0_32px_rgba(116,198,157,0.45)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Sprout size={15} />
                Claim Plot
              </button>
            </div>
          </div>
        </div>
      )}

      <LandDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        plot={selectedPlot}
        onClaimClick={handleClaimClick}
      />

      <Footer />
    </div>
  );
}
