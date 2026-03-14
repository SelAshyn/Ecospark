'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MyFlexPlotDetailsModal from '@/components/MyFlexPlotDetailsModal';
import { Package, Sprout, Leaf, Target, Award, MapPin, Clock, CheckCircle, Droplets, Zap } from 'lucide-react';
import { supabase, getCurrentUser } from '@/lib/supabase-auth';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface UserStats {
  listingsCreated: number;
  listingsPurchased: number;
  resourcesAdded: number;
  plotsClaimed: number;
  projectsJoined: number;
  missionsCompleted: number;
  totalSparkPoints: number;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  photo_url: string;
  price: number;
  status: string;
  created_at: string;
  location_name: string;
}

interface Resource {
  id: number;
  name: string;
  category: string;
  price: number;
  supplier: string;
  location: string;
  created_at: string;
}

interface Plot {
  id: string;
  land_plot_id: number;
  mission_title: string | null;
  mission_description: string | null;
  before_photo_url: string;
  after_photo_url: string;
  claimed_at: string;
  type: 'claimed' | 'joined';
}

interface CompletedMission {
  id: number;
  mission_id: number;
  mission_title: string;
  mission_category: string;
  mission_difficulty: string;
  points_earned: number;
  completed_at: string;
  before_photo_url: string;
  after_photo_url: string;
}

export default function MyFlexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'resources' | 'claimed' | 'joined' | 'purchases' | 'missions'>('listings');
  const [stats, setStats] = useState<UserStats>({
    listingsCreated: 0,
    listingsPurchased: 0,
    resourcesAdded: 0,
    plotsClaimed: 0,
    projectsJoined: 0,
    missionsCompleted: 0,
    totalSparkPoints: 0,
  });
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [claimedPlots, setClaimedPlots] = useState<Plot[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<Plot[]>([]);
  const [myPurchases, setMyPurchases] = useState<Listing[]>([]);
  const [completedMissions, setCompletedMissions] = useState<CompletedMission[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsModalType, setDetailsModalType] = useState<'claimed' | 'joined'>('claimed');

  useEffect(() => {
    document.title = 'Ecospark | My Flex';

    window.scrollTo(0, 0);
    AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic', offset: 120 });
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      router.push('/login?from=my-flex');
      return;
    }
    await fetchAllData(currentUser.id);
  };

  const fetchAllData = async (userId: string) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMyListings(userId),
        fetchMyResources(userId),
        fetchMyPlots(userId),
        fetchMyPurchases(userId),
        fetchCompletedMissions(userId),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;

      // Use demo data if no listings found
      const demoListings: Listing[] = [
        {
          id: 'demo-1',
          title: 'Organic Tomato Seeds — 100g',
          description: 'High-quality organic tomato seeds from my harvest. Perfect for home gardens.',
          category: 'seeds',
          photo_url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800',
          price: 150,
          status: 'available',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location_name: 'Kathmandu',
        },
        {
          id: 'demo-2',
          title: 'Fresh Compost — 20kg',
          description: 'Homemade organic compost from kitchen and farm waste. Rich in nutrients.',
          category: 'fertilizer',
          photo_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
          price: 0,
          status: 'available',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          location_name: 'Bhaktapur',
        },
      ];

      const listings = data && data.length > 0 ? data : demoListings;
      setMyListings(listings);
      setStats(prev => ({ ...prev, listingsCreated: listings.length }));
    } catch (error: any) {
      console.error('Error fetching listings:', error?.message);
      setMyListings([]);
    }
  };

  const fetchMyResources = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;

      // Use demo data if no resources found
      const demoResources: Resource[] = [
        {
          id: 1,
          name: 'Organic Spinach Seeds',
          category: 'seeds',
          price: 95,
          supplier: 'My Farm',
          location: 'Lalitpur',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          name: 'Vermicompost',
          category: 'fertilizer',
          price: 380,
          supplier: 'Home Production',
          location: 'Patan',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const resources = data && data.length > 0 ? data : demoResources;
      setMyResources(resources);
      setStats(prev => ({ ...prev, resourcesAdded: resources.length }));
    } catch (error: any) {
      console.error('Error fetching resources:', error?.message);
      setMyResources([]);
    }
  };

  const fetchMyPlots = async (userId: string) => {
    try {
      const { data: claimedData } = await supabase
        .from('land_claims')
        .select('*')
        .eq('user_id', userId)
        .order('claimed_at', { ascending: false });

      const { data: joinedData } = await supabase
        .from('land_participants')
        .select('*')
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      // Fetch land details for joined projects
      const joinedPlotIds = joinedData?.map((j: any) => j.land_plot_id) || [];
      let landsData: any[] = [];

      if (joinedPlotIds.length > 0) {
        const { data: fetchedLands } = await supabase
          .from('lands')
          .select('*')
          .in('id', joinedPlotIds);
        landsData = fetchedLands || [];
      }

      const claimed = (claimedData || []).map((plot: any) => ({
        ...plot,
        id: `claimed-${plot.id}`,
        type: 'claimed' as const,
      }));

      const joined = (joinedData || []).map((plot: any) => {
        // Find matching land details
        const landDetails = landsData.find((land: any) => land.id === plot.land_plot_id);

        return {
          ...plot,
          id: `joined-${plot.id}`,
          type: 'joined' as const,
          claimed_at: plot.joined_at,
          // Add land details if available
          mission_title: landDetails?.title || plot.mission_title,
          mission_description: landDetails?.description || plot.mission_description,
          before_photo_url: landDetails?.images?.[0] || plot.before_photo_url || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800',
          after_photo_url: landDetails?.images?.[1] || landDetails?.images?.[0] || plot.after_photo_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
        };
      });

      setClaimedPlots(claimed);
      setJoinedProjects(joined);
      setStats(prev => ({
        ...prev,
        plotsClaimed: claimed.length,
        projectsJoined: joined.length,
      }));
    } catch (error: any) {
      console.error('Error fetching plots:', error?.message);
      setClaimedPlots([]);
      setJoinedProjects([]);
    }
  };

  const fetchMyPurchases = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*, listing:listings(*)')
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;
      const purchases = data?.map((p: any) => p.listing).filter(Boolean) || [];
      setMyPurchases(purchases);
      setStats(prev => ({ ...prev, listingsPurchased: purchases.length }));
    } catch (error: any) {
      console.error('Error fetching purchases:', error?.message);
      setMyPurchases([]);
    }
  };

  const fetchCompletedMissions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('mission_completions')
        .select(`
          id,
          mission_id,
          proof_photo_url,
          completed_at,
          status,
          missions:mission_id (
            id,
            title,
            category,
            difficulty,
            points
          )
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;

      // Use demo data if no missions found
      const demoMissions: CompletedMission[] = [
        {
          id: 1,
          mission_id: 1,
          mission_title: 'Plant 10 Trees',
          mission_category: 'reforestation',
          mission_difficulty: 'beginner',
          points_earned: 50,
          completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          before_photo_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800',
          after_photo_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
        },
        {
          id: 2,
          mission_id: 2,
          mission_title: 'Create Compost Bin',
          mission_category: 'waste-management',
          mission_difficulty: 'beginner',
          points_earned: 30,
          completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          before_photo_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
          after_photo_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
        },
        {
          id: 3,
          mission_id: 3,
          mission_title: 'Install Drip Irrigation',
          mission_category: 'water-conservation',
          mission_difficulty: 'intermediate',
          points_earned: 75,
          completed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          before_photo_url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800',
          after_photo_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800',
        },
      ];

      const transformedData = data && data.length > 0 ? (data || []).map((completion: any) => ({
        id: completion.id,
        mission_id: completion.mission_id,
        mission_title: completion.missions?.title || 'Unknown Mission',
        mission_category: completion.missions?.category || 'General',
        mission_difficulty: completion.missions?.difficulty || 'beginner',
        points_earned: completion.missions?.points || 0,
        completed_at: completion.completed_at,
        before_photo_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800',
        after_photo_url: completion.proof_photo_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      })) : demoMissions;

      const totalPoints = transformedData.reduce((sum: number, mission: any) => sum + mission.points_earned, 0);

      setCompletedMissions(transformedData);
      setStats(prev => ({
        ...prev,
        missionsCompleted: transformedData.length,
        totalSparkPoints: totalPoints
      }));
    } catch (error: any) {
      console.error('Error fetching completed missions:', error?.message);
      setCompletedMissions([]);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const diffInHours = Math.floor((Date.now() - new Date(dateString).getTime()) / 3600000);
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const days = Math.floor(diffInHours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const handlePlotDetailsClick = (plot: Plot, type: 'claimed' | 'joined') => {
    setSelectedPlot(plot);
    setDetailsModalType(type);
    setShowDetailsModal(true);
  };

  const statCards = [
    { icon: Package, label: 'Listings Created', value: stats.listingsCreated, color: 'from-[#40916c] to-[#74c69d]' },
    { icon: Leaf, label: 'Resources Added', value: stats.resourcesAdded, color: 'from-[#52b788] to-[#95d5b2]' },
    { icon: Sprout, label: 'Plots Claimed', value: stats.plotsClaimed, color: 'from-[#74c69d] to-[#b7e4c7]' },
    { icon: Target, label: 'Projects Joined', value: stats.projectsJoined, color: 'from-[#95d5b2] to-[#d4a853]' },
    { icon: CheckCircle, label: 'Missions Completed', value: stats.missionsCompleted, color: 'from-[#d4a853] to-[#e8c468]' },
    { icon: Award, label: 'Items Purchased', value: stats.listingsPurchased, color: 'from-[#e8c468] to-[#f4d58d]' },
  ];

  const tabs = [
    { id: 'listings' as const, label: 'My Listings', icon: Package, count: myListings.length },
    { id: 'resources' as const, label: 'My Resources', icon: Leaf, count: myResources.length },
    { id: 'claimed' as const, label: 'Claimed Plots', icon: Sprout, count: claimedPlots.length },
    { id: 'joined' as const, label: 'Joined Projects', icon: Target, count: joinedProjects.length },
    { id: 'missions' as const, label: 'Missions', icon: CheckCircle, count: completedMissions.length },
    { id: 'purchases' as const, label: 'Purchases', icon: Award, count: myPurchases.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040d07]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[rgba(82,183,136,0.2)] border-t-[#74c69d] animate-spin" />
            <p className="text-[rgba(183,228,199,0.5)] text-sm">Loading your flex...</p>
          </div>
        </div>
      </div>
    );
  }

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
              <Award size={12} />
              Your Impact Dashboard
            </div>
            <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-black text-white leading-none tracking-[-0.02em] mb-4">
              My{' '}
              <em className="not-italic bg-gradient-to-br from-[#74c69d] via-[#52b788] to-[#d4a853] bg-clip-text text-transparent">
                Flex
              </em>
            </h1>
            <p className="text-lg text-[rgba(183,228,199,0.6)] max-w-2xl leading-relaxed">
              Track your contributions to sustainable agriculture and community building.
            </p>
          </div>

          <div className="mb-12" data-aos="fade-up" data-aos-delay="50">
            <div className="relative bg-gradient-to-r from-[rgba(13,35,24,0.95)] to-[rgba(7,21,16,0.98)] border border-[rgba(212,168,83,0.3)] rounded-2xl p-6 overflow-hidden">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(212,168,83,0.02)_40px,rgba(212,168,83,0.02)_41px)]" />

              <div className="relative z-10 flex items-center justify-between">
                {/* Left: Icon and Points */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#d4a853] to-[#b8935f] flex items-center justify-center">
                      <Zap size={32} className="text-[#040d07]" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#74c69d] border-2 border-[#040d07] flex items-center justify-center">
                      <span className="text-[0.6rem] font-black text-[#040d07]">✓</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[0.7rem] font-bold tracking-[0.15em] uppercase text-[rgba(212,168,83,0.8)] mb-1">
                      Total Spark Points
                    </div>
                    <div className="font-serif text-[3.5rem] font-black text-transparent bg-gradient-to-r from-[#d4a853] to-[#e8c468] bg-clip-text leading-none mb-1">
                      {stats.totalSparkPoints.toLocaleString()}
                    </div>
                    <div className="text-[0.8rem] text-[rgba(183,228,199,0.5)]">
                      Earned from {stats.missionsCompleted} completed missions
                    </div>
                  </div>
                </div>

                {/* Right: Stats */}
                <div className="flex gap-4">
                  <div className="text-center px-6 py-3 rounded-xl bg-[rgba(4,13,7,0.7)] border border-[rgba(82,183,136,0.2)]">
                    <div className="text-[2rem] font-black text-white leading-none mb-1">
                      {stats.missionsCompleted}
                    </div>
                    <div className="text-[0.65rem] text-[rgba(183,228,199,0.5)] uppercase tracking-[0.1em] font-semibold">
                      Missions
                    </div>
                  </div>
                  <div className="text-center px-6 py-3 rounded-xl bg-[rgba(4,13,7,0.7)] border border-[rgba(82,183,136,0.2)]">
                    <div className="text-[2rem] font-black text-white leading-none mb-1">
                      {stats.plotsClaimed + stats.projectsJoined}
                    </div>
                    <div className="text-[0.65rem] text-[rgba(183,228,199,0.5)] uppercase tracking-[0.1em] font-semibold">
                      Projects
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom info bar */}
              <div className="relative z-10 mt-5 pt-4 border-t border-[rgba(82,183,136,0.1)] flex items-center gap-6 text-[0.8rem] text-[rgba(183,228,199,0.5)]">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#74c69d]" />
                  <span>Earn Spark Points by completing missions and projects</span>
                </div>
                <div className="w-px h-3 bg-[rgba(82,183,136,0.2)]" />
                <div className="flex items-center gap-2">
                  <Zap size={12} className="text-[#d4a853]" />
                  <span>Use points for rewards and recognition</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12" data-aos="fade-up" data-aos-delay="100">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-6 hover:-translate-y-1 hover:border-[rgba(82,183,136,0.3)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 border border-[rgba(82,183,136,0.2)] mb-4`}>
                  <stat.icon size={22} className="text-[#74c69d]" />
                </div>
                <div className="font-serif text-[2.5rem] font-black text-white leading-none mb-2">
                  {stat.value}
                </div>
                <div className="text-[0.8rem] font-medium tracking-[0.05em] uppercase text-[rgba(183,228,199,0.5)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8" data-aos="fade-up" data-aos-delay="200">
            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-[0.875rem] tracking-[0.02em] transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] shadow-[0_0_20px_rgba(116,198,157,0.3)]'
                      : 'bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.15)] text-[rgba(183,228,199,0.6)] hover:border-[rgba(82,183,136,0.35)] hover:text-[#b7e4c7]',
                  ].join(' ')}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  <span className={[
                    'px-2 py-0.5 rounded-full text-[0.7rem] font-bold',
                    activeTab === tab.id
                      ? 'bg-[rgba(4,13,7,0.3)] text-[#040d07]'
                      : 'bg-[rgba(82,183,136,0.15)] text-[rgba(183,228,199,0.5)]',
                  ].join(' ')}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div data-aos="fade-up" data-aos-delay="300">
            {activeTab === 'listings' && (
              <ListingsTab listings={myListings} getTimeAgo={getTimeAgo} />
            )}
            {activeTab === 'resources' && (
              <ResourcesTab resources={myResources} />
            )}
            {activeTab === 'claimed' && (
              <ClaimedPlotsTab plots={claimedPlots} getTimeAgo={getTimeAgo} onDetailsClick={handlePlotDetailsClick} />
            )}
            {activeTab === 'joined' && (
              <JoinedProjectsTab plots={joinedProjects} getTimeAgo={getTimeAgo} onDetailsClick={handlePlotDetailsClick} />
            )}
            {activeTab === 'missions' && (
              <MissionsTab missions={completedMissions} getTimeAgo={getTimeAgo} />
            )}
            {activeTab === 'purchases' && (
              <PurchasesTab purchases={myPurchases} />
            )}
          </div>
        </div>
      </div>

      <MyFlexPlotDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        plot={selectedPlot}
        type={detailsModalType}
      />

      <Footer />
    </div>
  );
}

function MissionsTab({ missions, getTimeAgo }: { missions: CompletedMission[]; getTimeAgo: (date: string) => string }) {
  if (missions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-[rgba(13,35,24,0.6)] to-[rgba(7,21,16,0.8)] border border-[rgba(82,183,136,0.12)] rounded-2xl">
        <CheckCircle size={48} className="text-[rgba(82,183,136,0.3)] mb-4" />
        <p className="text-[rgba(183,228,199,0.5)] text-center">No missions completed yet.<br />Start completing missions to earn points!</p>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'from-[#74c69d] to-[#95d5b2]';
      case 'intermediate': return 'from-[#d4a853] to-[#e8c468]';
      case 'advanced': return 'from-[#ef4444] to-[#f87171]';
      default: return 'from-[#74c69d] to-[#95d5b2]';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Water Conservation': return Droplets;
      case 'Waste Management': return Package;
      case 'Tree Planting': return Sprout;
      case 'Energy Efficiency': return Zap;
      default: return Leaf;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {missions.map((mission) => {
        const CategoryIcon = getCategoryIcon(mission.mission_category);
        return (
          <div
            key={mission.id}
            className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.12)] rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-[rgba(82,183,136,0.3)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="grid grid-cols-2 gap-1 h-full">
                <div className="relative">
                  <img src={mission.before_photo_url} alt="Before" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-[rgba(4,13,7,0.85)] border border-[rgba(82,183,136,0.4)] text-[0.65rem] font-bold text-[#74c69d] uppercase tracking-wider">
                    Before
                  </div>
                </div>
                <div className="relative">
                  <img src={mission.after_photo_url} alt="After" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-[rgba(4,13,7,0.85)] border border-[rgba(82,183,136,0.4)] text-[0.65rem] font-bold text-[#74c69d] uppercase tracking-wider">
                    After
                  </div>
                </div>
              </div>
              <div className="absolute top-3 left-3 p-2 rounded-xl bg-gradient-to-br from-[#40916c] to-[#74c69d] border border-[rgba(255,255,255,0.2)] backdrop-blur-sm shadow-lg">
                <CategoryIcon size={18} className="text-white" />
              </div>
              <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-br ${getDifficultyColor(mission.mission_difficulty)} border border-[rgba(255,255,255,0.2)] text-[0.65rem] font-bold text-white uppercase tracking-wider backdrop-blur-sm shadow-lg`}>
                {mission.mission_difficulty}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-serif text-[1.2rem] font-bold text-white flex-1">
                  {mission.mission_title}
                </h3>
                <div className="flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full bg-gradient-to-br from-[#d4a853] to-[#e8c468] border border-[rgba(255,255,255,0.2)]">
                  <Award size={14} className="text-[#040d07]" />
                  <span className="text-[0.75rem] font-bold text-[#040d07]">+{mission.points_earned}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[0.7rem] font-bold tracking-[0.08em] uppercase text-[#74c69d] border border-[rgba(82,183,136,0.4)] bg-[rgba(45,106,79,0.2)] px-2.5 py-1 rounded-full">
                  {mission.mission_category}
                </span>
              </div>
              <div className="pt-3 border-t border-[rgba(82,183,136,0.1)]">
                <div className="flex items-center justify-between">
                  <span className="text-[0.8rem] text-[rgba(183,228,199,0.4)] flex items-center gap-1.5">
                    <Clock size={12} className="text-[#52b788]" />
                    Completed {getTimeAgo(mission.completed_at)}
                  </span>
                  <div className="flex items-center gap-1.5 text-[#74c69d]">
                    <CheckCircle size={16} />
                    <span className="text-[0.75rem] font-semibold">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListingsTab({ listings, getTimeAgo }: { listings: Listing[]; getTimeAgo: (date: string) => string }) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-[rgba(13,35,24,0.6)] to-[rgba(7,21,16,0.8)] border border-[rgba(82,183,136,0.12)] rounded-2xl">
        <Package size={48} className="text-[rgba(82,183,136,0.3)] mb-4" />
        <p className="text-[rgba(183,228,199,0.5)] text-center">No listings created yet.<br />Start sharing resources with the community!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.12)] rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-[rgba(82,183,136,0.3)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300"
        >
          <div className="relative h-48 overflow-hidden">
            {listing.photo_url ? (
              <img src={listing.photo_url} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="flex items-center justify-center h-full bg-[rgba(13,35,24,0.9)]">
                <Package size={48} className="text-[rgba(82,183,136,0.3)]" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,13,7,0.8)] to-transparent" />
            <div className={[
              'absolute top-3 right-3 px-3 py-1 rounded-full text-[0.7rem] font-bold tracking-[0.08em] uppercase backdrop-blur-md border',
              listing.status === 'available'
                ? 'bg-[rgba(4,13,7,0.75)] border-[rgba(82,183,136,0.4)] text-[#74c69d]'
                : 'bg-[rgba(4,13,7,0.75)] border-[rgba(239,68,68,0.4)] text-[#fca5a5]',
            ].join(' ')}>
              {listing.status}
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-serif text-[1.1rem] font-bold text-white mb-2 leading-snug">{listing.title}</h3>
            <p className="text-[0.85rem] text-[rgba(183,228,199,0.5)] mb-3 line-clamp-2">{listing.description}</p>
            <div className="flex items-center justify-between text-[0.8rem] text-[rgba(183,228,199,0.4)] mb-3">
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-[#52b788]" />
                {listing.location_name}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-[#52b788]" />
                {getTimeAgo(listing.created_at)}
              </div>
            </div>
            <div className="pt-3 border-t border-[rgba(82,183,136,0.1)]">
              <span className="font-serif text-[1.3rem] font-black bg-gradient-to-br from-[#95d5b2] to-[#74c69d] bg-clip-text text-transparent">
                {listing.price && listing.price > 0 ? `NPR ${listing.price}` : 'Free'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResourcesTab({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-[rgba(13,35,24,0.6)] to-[rgba(7,21,16,0.8)] border border-[rgba(82,183,136,0.12)] rounded-2xl">
        <Leaf size={48} className="text-[rgba(82,183,136,0.3)] mb-4" />
        <p className="text-[rgba(183,228,199,0.5)] text-center">No resources added yet.<br />Help others find affordable supplies!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.12)] rounded-2xl p-5 hover:-translate-y-1 hover:border-[rgba(82,183,136,0.3)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.2)]">
              <Leaf size={20} className="text-[#74c69d]" />
            </div>
            <span className="text-[0.7rem] font-bold tracking-[0.08em] uppercase text-[rgba(116,198,157,0.7)] border border-[rgba(82,183,136,0.2)] bg-[rgba(45,106,79,0.15)] px-2.5 py-1 rounded-full">
              {resource.category}
            </span>
          </div>
          <h3 className="font-serif text-[1.1rem] font-bold text-white mb-2">{resource.name}</h3>
          <p className="text-[0.85rem] text-[rgba(183,228,199,0.5)] mb-3">{resource.supplier}</p>
          <div className="flex items-center gap-1.5 text-[0.8rem] text-[rgba(183,228,199,0.4)] mb-4">
            <MapPin size={12} className="text-[#52b788]" />
            {resource.location}
          </div>
          <div className="pt-3 border-t border-[rgba(82,183,136,0.1)]">
            <span className="font-serif text-[1.3rem] font-black bg-gradient-to-br from-[#95d5b2] to-[#74c69d] bg-clip-text text-transparent">
              NPR {resource.price}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClaimedPlotsTab({ plots, getTimeAgo, onDetailsClick }: { plots: Plot[]; getTimeAgo: (date: string) => string; onDetailsClick: (plot: Plot, type: 'claimed' | 'joined') => void }) {
  if (plots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-[rgba(13,35,24,0.6)] to-[rgba(7,21,16,0.8)] border border-[rgba(82,183,136,0.12)] rounded-2xl">
        <Sprout size={48} className="text-[rgba(82,183,136,0.3)] mb-4" />
        <p className="text-[rgba(183,228,199,0.5)] text-center">No plots claimed yet.<br />Claim a plot and lead your own land revival project!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="bg-gradient-to-r from-[rgba(64,145,108,0.15)] to-[rgba(116,198,157,0.1)] border border-[rgba(116,198,157,0.3)] rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[rgba(116,198,157,0.2)] border border-[rgba(116,198,157,0.3)]">
            <Sprout size={20} className="text-[#74c69d]" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">Claimed Plots - You're the Project Owner</h3>
            <p className="text-[0.85rem] text-[rgba(183,228,199,0.6)]">
              These are plots you've claimed and are leading. You're responsible for the restoration mission and can invite others to join.
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plots.map((plot) => (
          <div
            key={plot.id}
            className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(116,198,157,0.25)] rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-[rgba(116,198,157,0.4)] hover:shadow-[0_20px_60px_rgba(116,198,157,0.15)] transition-all duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="grid grid-cols-2 gap-1 h-full">
                <div className="relative">
                  <img src={plot.before_photo_url} alt="Before" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-[rgba(4,13,7,0.85)] border border-[rgba(116,198,157,0.4)] text-[0.65rem] font-bold text-[#74c69d] uppercase tracking-wider">
                    Before
                  </div>
                </div>
                <div className="relative">
                  <img src={plot.after_photo_url} alt="After" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-[rgba(4,13,7,0.85)] border border-[rgba(116,198,157,0.4)] text-[0.65rem] font-bold text-[#74c69d] uppercase tracking-wider">
                    After
                  </div>
                </div>
              </div>
              <div className="absolute top-3 left-3 p-2 rounded-xl bg-gradient-to-br from-[#40916c] to-[#74c69d] border border-[rgba(255,255,255,0.2)] backdrop-blur-sm shadow-lg">
                <Sprout size={18} className="text-white" />
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] border border-[rgba(255,255,255,0.2)] text-[0.65rem] font-bold text-white uppercase tracking-wider backdrop-blur-sm shadow-lg">
                Owner
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-serif text-[1.2rem] font-bold text-white mb-2">
                {plot.mission_title || `Land Plot #${plot.land_plot_id}`}
              </h3>
              {plot.mission_description && (
                <p className="text-[0.85rem] text-[rgba(183,228,199,0.5)] mb-3 line-clamp-2">
                  {plot.mission_description}
                </p>
              )}
              <div className="pt-3 border-t border-[rgba(116,198,157,0.2)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[0.8rem] text-[rgba(183,228,199,0.4)]">
                    Claimed {getTimeAgo(plot.claimed_at)}
                  </span>
                  <span className="text-[0.7rem] font-bold tracking-[0.08em] uppercase text-[#74c69d] border border-[rgba(116,198,157,0.4)] bg-[rgba(64,145,108,0.2)] px-2.5 py-1 rounded-full">
                    Plot #{plot.land_plot_id}
                  </span>
                </div>
                <button
                  onClick={() => onDetailsClick(plot, 'claimed')}
                  className="w-full py-2 rounded-lg bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] text-[0.8rem] font-bold tracking-[0.02em] uppercase hover:shadow-[0_0_20px_rgba(116,198,157,0.3)] transition-all duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JoinedProjectsTab({ plots, getTimeAgo, onDetailsClick }: { plots: Plot[]; getTimeAgo: (date: string) => string; onDetailsClick: (plot: Plot, type: 'claimed' | 'joined') => void }) {
  if (plots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-[rgba(13,35,24,0.6)] to-[rgba(7,21,16,0.8)] border border-[rgba(82,183,136,0.12)] rounded-2xl">
        <Target size={48} className="text-[rgba(82,183,136,0.3)] mb-4" />
        <p className="text-[rgba(183,228,199,0.5)] text-center">No projects joined yet.<br />Join existing projects and contribute to land restoration!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="bg-gradient-to-r from-[rgba(149,213,178,0.15)] to-[rgba(212,168,83,0.1)] border border-[rgba(149,213,178,0.3)] rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[rgba(149,213,178,0.2)] border border-[rgba(149,213,178,0.3)]">
            <Target size={20} className="text-[#95d5b2]" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">Joined Projects - You're a Participant</h3>
            <p className="text-[0.85rem] text-[rgba(183,228,199,0.6)]">
              These are projects you've joined as a participant. You're contributing to someone else's land restoration mission.
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plots.map((plot) => (
          <div
            key={plot.id}
            className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(149,213,178,0.2)] rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-[rgba(149,213,178,0.35)] hover:shadow-[0_20px_60px_rgba(149,213,178,0.1)] transition-all duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="grid grid-cols-2 gap-1 h-full">
                <div className="relative">
                  <img src={plot.before_photo_url} alt="Before" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-[rgba(4,13,7,0.85)] border border-[rgba(149,213,178,0.3)] text-[0.65rem] font-bold text-[#95d5b2] uppercase tracking-wider">
                    Before
                  </div>
                </div>
                <div className="relative">
                  <img src={plot.after_photo_url} alt="After" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-[rgba(4,13,7,0.85)] border border-[rgba(149,213,178,0.3)] text-[0.65rem] font-bold text-[#95d5b2] uppercase tracking-wider">
                    After
                  </div>
                </div>
              </div>
              <div className="absolute top-3 left-3 p-2 rounded-xl bg-gradient-to-br from-[#95d5b2] to-[#d4a853] border border-[rgba(255,255,255,0.2)] backdrop-blur-sm shadow-lg">
                <Target size={18} className="text-white" />
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-br from-[#95d5b2] to-[#d4a853] border border-[rgba(255,255,255,0.2)] text-[0.65rem] font-bold text-[#040d07] uppercase tracking-wider backdrop-blur-sm shadow-lg">
                Participant
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-serif text-[1.2rem] font-bold text-white mb-2">
                {plot.mission_title || `Land Plot #${plot.land_plot_id}`}
              </h3>
              {plot.mission_description && (
                <p className="text-[0.85rem] text-[rgba(183,228,199,0.5)] mb-3 line-clamp-2">
                  {plot.mission_description}
                </p>
              )}
              <div className="pt-3 border-t border-[rgba(149,213,178,0.15)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[0.8rem] text-[rgba(183,228,199,0.4)]">
                    Joined {getTimeAgo(plot.claimed_at)}
                  </span>
                  <span className="text-[0.7rem] font-bold tracking-[0.08em] uppercase text-[#95d5b2] border border-[rgba(149,213,178,0.3)] bg-[rgba(149,213,178,0.15)] px-2.5 py-1 rounded-full">
                    Plot #{plot.land_plot_id}
                  </span>
                </div>
                <button
                  onClick={() => onDetailsClick(plot, 'joined')}
                  className="w-full py-2 rounded-lg bg-gradient-to-br from-[#95d5b2] to-[#d4a853] text-[#040d07] text-[0.8rem] font-bold tracking-[0.02em] uppercase hover:shadow-[0_0_20px_rgba(149,213,178,0.3)] transition-all duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PurchasesTab({ purchases }: { purchases: Listing[] }) {
  if (purchases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-[rgba(13,35,24,0.6)] to-[rgba(7,21,16,0.8)] border border-[rgba(82,183,136,0.12)] rounded-2xl">
        <Target size={48} className="text-[rgba(82,183,136,0.3)] mb-4" />
        <p className="text-[rgba(183,228,199,0.5)] text-center">No purchases yet.<br />Browse the marketplace to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {purchases.map((purchase) => (
        <div
          key={purchase.id}
          className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.12)] rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-[rgba(82,183,136,0.3)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300"
        >
          <div className="relative h-48 overflow-hidden">
            {purchase.photo_url ? (
              <img src={purchase.photo_url} alt={purchase.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full bg-[rgba(13,35,24,0.9)]">
                <Package size={48} className="text-[rgba(82,183,136,0.3)]" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,13,7,0.8)] to-transparent" />
          </div>
          <div className="p-5">
            <h3 className="font-serif text-[1.1rem] font-bold text-white mb-2">{purchase.title}</h3>
            <p className="text-[0.85rem] text-[rgba(183,228,199,0.5)] mb-3 line-clamp-2">{purchase.description}</p>
            <div className="pt-3 border-t border-[rgba(82,183,136,0.1)]">
              <span className="font-serif text-[1.3rem] font-black bg-gradient-to-br from-[#95d5b2] to-[#74c69d] bg-clip-text text-transparent">
                {purchase.price && purchase.price > 0 ? `NPR ${purchase.price}` : 'Free'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
