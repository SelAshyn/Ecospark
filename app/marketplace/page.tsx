'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import UploadListingModal from '@/components/UploadListingModal';
import MarketplaceDetailsModal from '@/components/MarketplaceDetailsModal';
import { Package, Search, Filter, MapPin, Clock, Plus, Leaf, ArrowRight } from 'lucide-react';
import { supabase, getCurrentUser } from '@/lib/supabase-auth';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Footer from '@/components/Footer';

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  location_name: string;
  photo_url: string;
  sustainability_score: number;
  created_at: string;
  status: string;
  availability_type?: 'temporary' | 'permanent';
  price?: number | null;
}

const demoListings: Listing[] = [
  {
    id: 'demo-1',
    title: 'Rice Husk — 50kg',
    description: 'Agricultural waste from rice milling. Perfect for composting, mulch, or fuel briquettes. Turn waste into garden gold!',
    category: 'waste',
    location_name: 'Kathmandu',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Rice_chaffs.jpg',
    sustainability_score: 9,
    created_at: '2024-01-15T10:00:00Z',
    status: 'available',
    availability_type: 'permanent',
    price: 0,
  },
  {
    id: 'demo-2',
    title: 'Corn Stalks Bundle — 30kg',
    description: 'Post-harvest corn stalks, dried and bundled. Reuse for animal feed, composting, or mushroom cultivation.',
    category: 'waste',
    location_name: 'Bhaktapur',
    photo_url: 'https://m.media-amazon.com/images/I/71w6yffNOKL._AC_SL400_.jpg',
    sustainability_score: 8,
    created_at: '2024-01-15T07:00:00Z',
    status: 'available',
    availability_type: 'permanent',
    price: 0,
  },
  {
    id: 'demo-3',
    title: 'Old Tractor — Massey Ferguson',
    description: 'Rusty but functional tractor available for temporary use. Perfect for plowing and heavy farm work. Needs some TLC but gets the job done.',
    category: 'equipment',
    location_name: 'Patan',
    photo_url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800',
    sustainability_score: 7,
    created_at: '2024-01-15T09:00:00Z',
    status: 'available',
    availability_type: 'temporary',
    price: 500,
  },
  {
    id: 'demo-4',
    title: 'Vintage Hand Plow',
    description: 'Traditional iron plow with wooden handles. Shows its age but still works great for small plots. A piece of farming history!',
    category: 'equipment',
    location_name: 'Bhaktapur',
    photo_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
    sustainability_score: 8,
    created_at: '2024-01-15T06:00:00Z',
    status: 'available',
    availability_type: 'temporary',
    price: 150,
  },
  {
    id: 'demo-5',
    title: 'Rusty Cultivator',
    description: 'Well-worn cultivator with some rust spots. Still sharp and effective for breaking up soil. Available for short-term rental.',
    category: 'equipment',
    location_name: 'Lalitpur',
    photo_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800',
    sustainability_score: 7,
    created_at: '2024-01-15T04:00:00Z',
    status: 'available',
    availability_type: 'temporary',
    price: 200,
  },
  {
    id: 'demo-6',
    title: 'Old Water Pump',
    description: 'Vintage manual water pump. Rusty exterior but mechanically sound. Great for irrigation when electricity is unavailable.',
    category: 'equipment',
    location_name: 'Kirtipur',
    photo_url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',
    sustainability_score: 8,
    created_at: '2024-01-14T08:00:00Z',
    status: 'available',
    availability_type: 'temporary',
    price: 300,
  },
  {
    id: 'demo-7',
    title: 'Weathered Wheelbarrow',
    description: 'Heavy-duty metal wheelbarrow with character. Rusty but sturdy. Perfect for hauling soil, compost, or harvest. Built to last!',
    category: 'equipment',
    location_name: 'Kathmandu',
    photo_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800',
    sustainability_score: 7,
    created_at: '2024-01-15T08:00:00Z',
    status: 'available',
    availability_type: 'temporary',
    price: 100,
  },
  {
    id: 'demo-8',
    title: 'Sugarcane Bagasse — 40kg',
    description: 'Sugarcane processing waste. Reuse for paper making, animal feed, or as mulch. High fiber content.',
    category: 'waste',
    location_name: 'Lalitpur',
    photo_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    sustainability_score: 8,
    created_at: '2024-01-15T00:00:00Z',
    status: 'available',
    availability_type: 'permanent',
    price: 0,
  },
  {
    id: 'demo-9',
    title: 'Coffee Grounds — 15kg',
    description: 'Used coffee grounds from cafes. Excellent for composting, pest control, or mushroom growing. Rich in nitrogen.',
    category: 'waste',
    location_name: 'Patan',
    photo_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',
    sustainability_score: 9,
    created_at: '2024-01-15T02:00:00Z',
    status: 'available',
    availability_type: 'temporary',
    price: 0,
  },
  {
    id: 'demo-10',
    title: 'Coconut Coir — 30kg',
    description: 'Coconut husk waste fiber. Perfect for potting mix, erosion control, or making grow bags. Sustainable alternative!',
    category: 'waste',
    location_name: 'Bhaktapur',
    photo_url: 'https://images.unsplash.com/photo-1598966739654-5e9daa6e8b7c?w=800',
    sustainability_score: 10,
    created_at: '2024-01-14T16:00:00Z',
    status: 'available',
    availability_type: 'permanent',
    price: 200,
  },
  {
    id: 'demo-11',
    title: 'Sawdust — 50kg',
    description: 'Wood processing waste from carpentry. Use for animal bedding, mushroom cultivation, or composting.',
    category: 'waste',
    location_name: 'Kathmandu',
    photo_url: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800',
    sustainability_score: 7,
    created_at: '2024-01-14T21:00:00Z',
    status: 'available',
    availability_type: 'permanent',
    price: 0,
  },
  {
    id: 'demo-12',
    title: 'Eggshells — 5kg',
    description: 'Crushed eggshells from restaurants. Rich in calcium, perfect for composting or direct soil amendment.',
    category: 'waste',
    location_name: 'Lalitpur',
    photo_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800',
    sustainability_score: 8,
    created_at: '2024-01-15T05:00:00Z',
    status: 'available',
    availability_type: 'temporary',
    price: 0,
  },
]

export default function Marketplace() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [claimLoading, setClaimLoading] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    document.title = 'Ecospark | Marketplace';

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

    checkUser();
    fetchListings();
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setListings(!data || data.length === 0 ? demoListings : data);
    } catch {
      setListings(demoListings);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsClick = (listing: Listing) => {
    setSelectedListing(listing);
    setShowDetailsModal(true);
  };

  const handleUploadClick = () => {
    if (!user) { router.push('/login?from=marketplace'); return; }
    setShowUploadModal(true);
  };

  const handleClaim = async (listingId: string) => {
    if (!user) {
      router.push('/login?from=marketplace');
      return;
    }

    // Don't allow claiming demo listings
    if (listingId.startsWith('demo-')) {
      alert('Demo listings cannot be claimed. Please add your own listings to test this feature!');
      return;
    }

    setClaimLoading(true);
    try {
      // Check if already claimed
      const { data: existingClaim } = await supabase
        .from('marketplace_claims')
        .select('id')
        .eq('listing_id', listingId)
        .eq('user_id', user.id)
        .single();

      if (existingClaim) {
        alert('You have already claimed this item!');
        setClaimLoading(false);
        return;
      }

      // Create claim record
      const { error: claimError } = await supabase
        .from('marketplace_claims')
        .insert({
          listing_id: listingId,
          user_id: user.id,
          claimed_at: new Date().toISOString(),
        });

      if (claimError) throw claimError;

      // Update listing status
      const { error: updateError } = await supabase
        .from('listings')
        .update({ status: 'claimed' })
        .eq('id', listingId);

      if (updateError) throw updateError;

      // Refresh listings
      await fetchListings();

      // Update selected listing
      if (selectedListing && selectedListing.id === listingId) {
        setSelectedListing({ ...selectedListing, status: 'claimed' });
      }

      alert('Item claimed successfully! Check your profile for claimed items.');
    } catch (error: any) {
      console.error('Claim error:', error);
      alert(error.message || 'Failed to claim item. Please try again.');
    } finally {
      setClaimLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const diffInHours = Math.floor((Date.now() - new Date(dateString).getTime()) / 3600000);
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const scoreColor = (score: number) => {
    if (score >= 9) return 'text-[#74c69d]';
    if (score >= 7) return 'text-[#95d5b2]';
    return 'text-[#b7e4c7]';
  };

  const filtered = listings.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.description.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="min-h-screen bg-[#040d07] overflow-x-hidden">

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.12),transparent_70%)]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(82,183,136,0.08),transparent_70%)]" />
      </div>

      <Navbar />

      <div className="relative z-10 pt-28 pb-24 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="mb-14" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.3)] px-4 py-1.5 rounded-full text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-[#95d5b2] mb-5">
              <Leaf size={12} />
              Trash to Treasure
            </div>
            <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-black text-white leading-none tracking-[-0.02em] mb-4">
              Waste{' '}
              <em className="not-italic bg-gradient-to-br from-[#74c69d] via-[#52b788] to-[#d4a853] bg-clip-text text-transparent">
                Marketplace
              </em>
            </h1>
            <p className="text-lg text-[rgba(183,228,199,0.6)] max-w-2xl leading-relaxed">
              Browse agricultural waste, tools, and resources. Turn byproducts into valuable assets with AI-powered sustainability insights.
            </p>
          </div>

          <div className="relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-5 mb-10 backdrop-blur-xl" data-aos="fade-up" data-aos-delay="100">
            <div className="flex flex-col md:flex-row gap-3">

              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52b788]" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search for waste, tools, or resources..."
                  className="w-full pl-11 pr-4 py-3 bg-[rgba(5,18,10,0.6)] border border-[rgba(82,183,136,0.2)] rounded-xl text-white placeholder-[rgba(183,228,199,0.35)] text-sm focus:outline-none focus:border-[rgba(82,183,136,0.5)] focus:bg-[rgba(5,18,10,0.8)] transition-all duration-200"
                />
              </div>


              <button className="flex items-center justify-center gap-2 px-5 py-3 bg-[rgba(45,106,79,0.15)] border border-[rgba(82,183,136,0.2)] rounded-xl text-[rgba(183,228,199,0.65)] text-sm font-medium hover:bg-[rgba(45,106,79,0.25)] hover:border-[rgba(82,183,136,0.35)] hover:text-[#b7e4c7] transition-all duration-200">
                <Filter size={16} />
                Filters
              </button>

              <button
                onClick={handleUploadClick}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] text-sm font-bold tracking-[0.04em] uppercase shadow-[0_0_22px_rgba(116,198,157,0.3)] hover:shadow-[0_0_36px_rgba(116,198,157,0.5)] hover:scale-[1.02] transition-all duration-200"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Listing
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-[rgba(82,183,136,0.2)] border-t-[#74c69d] animate-spin" />
              <p className="text-[rgba(183,228,199,0.5)] text-sm tracking-wide">Loading listings…</p>
            </div>

          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-gradient-to-br from-[rgba(13,35,24,0.6)] to-[rgba(7,21,16,0.8)] border border-[rgba(82,183,136,0.12)] rounded-2xl">
              <Package size={48} className="text-[rgba(82,183,136,0.4)]" />
              <p className="text-[rgba(183,228,199,0.5)]">No listings found. Be the first to share!</p>
            </div>

          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {paginatedListings.map((listing, index) => (
                <div
                  key={listing.id}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.12)] rounded-[20px] overflow-hidden hover:-translate-y-1.5 hover:border-[rgba(82,183,136,0.3)] hover:shadow-[0_24px_80px_rgba(0,0,0,0.4),0_0_60px_rgba(64,145,108,0.08)] transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#74c69d] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                  <div className="relative h-48 overflow-hidden bg-[rgba(13,35,24,0.9)]">
                    {listing.photo_url ? (
                      <img
                        src={listing.photo_url}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package size={48} className="text-[rgba(82,183,136,0.3)]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,13,7,0.6)] to-transparent" />
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-[rgba(4,13,7,0.75)] border border-[rgba(82,183,136,0.3)] backdrop-blur-md px-2.5 py-1 rounded-full">
                      <Leaf size={10} className="text-[#74c69d]" />
                      <span className={`text-[0.75rem] font-bold ${scoreColor(listing.sustainability_score)}`}>
                        {listing.sustainability_score}/10
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-block text-[0.7rem] font-semibold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full ${
                        listing.availability_type === 'permanent'
                          ? 'text-[rgba(116,198,157,0.9)] border border-[rgba(82,183,136,0.3)] bg-[rgba(64,145,108,0.2)]'
                          : 'text-[rgba(212,168,83,0.9)] border border-[rgba(212,168,83,0.3)] bg-[rgba(212,168,83,0.15)]'
                      }`}>
                        {listing.availability_type === 'permanent' ? '🔄 Permanent' : '⏱️ Temporary'}
                      </span>
                    </div>

                    <h3 className="font-serif text-[1.4rem] font-bold text-white mb-2 leading-snug group-hover:text-[#95d5b2] transition-colors tracking-wide duration-300">
                      {listing.title}
                    </h3>

                      <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)] leading-relaxed mb-4 line-clamp-2 tracking-wide">
                      {listing.description}
                    </p>

                    <div className="flex items-center gap-4 text-[0.8rem] text-[rgba(183,228,199,0.4)] mb-5">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#52b788]" />
                        {listing.location_name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-[#52b788]" />
                        {getTimeAgo(listing.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[rgba(82,183,136,0.1)] mb-4">
                      <div>
                        <p className="text-[0.8rem] text-[rgba(183,228,199,0.4)] mb-1">Price</p>
                        <span className="font-serif text-[1.5rem] font-black bg-gradient-to-br from-[#95d5b2] to-[#74c69d] bg-clip-text text-transparent">
                          {listing.price && listing.price > 0 ? `NPR ${listing.price}` : 'Free'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => handleDetailsClick(listing)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] text-[0.8rem] font-bold tracking-[0.05em] uppercase shadow-[0_0_16px_rgba(116,198,157,0.25)] hover:shadow-[0_0_28px_rgba(116,198,157,0.45)] hover:scale-105 transition-all duration-200"
                      >
                        View Details
                        <ArrowRight size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
                ))}
              </div>


              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2" data-aos="fade-up">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={[
                      'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                      currentPage === 1
                        ? 'bg-[rgba(13,35,24,0.5)] border border-[rgba(82,183,136,0.1)] text-[rgba(183,228,199,0.3)] cursor-not-allowed'
                        : 'bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.2)] text-[rgba(183,228,199,0.7)] hover:bg-[rgba(45,106,79,0.3)] hover:border-[rgba(82,183,136,0.4)] hover:text-white'
                    ].join(' ')}
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={[
                          'w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200',
                          currentPage === page
                            ? 'bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] shadow-[0_0_20px_rgba(116,198,157,0.3)]'
                            : 'bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.15)] text-[rgba(183,228,199,0.6)] hover:bg-[rgba(45,106,79,0.3)] hover:border-[rgba(82,183,136,0.3)] hover:text-white'
                        ].join(' ')}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={[
                      'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                      currentPage === totalPages
                        ? 'bg-[rgba(13,35,24,0.5)] border border-[rgba(82,183,136,0.1)] text-[rgba(183,228,199,0.3)] cursor-not-allowed'
                        : 'bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.2)] text-[rgba(183,228,199,0.7)] hover:bg-[rgba(45,106,79,0.3)] hover:border-[rgba(82,183,136,0.4)] hover:text-white'
                    ].join(' ')}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {user && (
        <UploadListingModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => { fetchListings(); setShowUploadModal(false); }}
          userId={user.id}
        />
      )}

      <MarketplaceDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        listing={selectedListing}
        onClaim={handleClaim}
        isClaimLoading={claimLoading}
      />
      <Footer />
    </div>
  );
}
