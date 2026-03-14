'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ResourceDetailsModal from '@/components/ResourceDetailsModal';
import { MapPin, DollarSign, Leaf, TrendingDown, Plus, Search, Star, Package, Droplets, Sprout, User, ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, supabase } from '@/lib/supabase-auth';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface Resource {
  id: number;
  name: string;
  category: 'seeds' | 'fertilizer' | 'water' | 'tools';
  price: number;
  unit: string;
  supplier: string;
  location: string;
  coordinates: { lat: number; lng: number };
  isOrganic: boolean;
  sustainabilityScore: number;
  co2Savings?: string;
  priceComparison: number;
  rating: number;
  reviews: number;
  lastUpdated: string;
  addedBy: string;
}

const demoResources: Resource[] = [
  { id: 1, name: 'Organic Tomato Seeds', category: 'seeds', price: 120, unit: 'per 100g', supplier: 'Green Valley Seeds', location: 'Kathmandu', coordinates: { lat: 27.7172, lng: 85.3240 }, isOrganic: true, sustainabilityScore: 95, co2Savings: 'Saves 1.5 kg CO₂ per kg vs. synthetic', priceComparison: -20, rating: 4.8, reviews: 156, lastUpdated: '2 days ago', addedBy: 'Ram Sharma' },
  { id: 2, name: 'Organic Compost Fertilizer', category: 'fertilizer', price: 450, unit: 'per 10kg', supplier: 'EcoFarm Supplies', location: 'Bhaktapur', coordinates: { lat: 27.6710, lng: 85.4298 }, isOrganic: true, sustainabilityScore: 92, co2Savings: 'Reduces chemical runoff by 80%', priceComparison: -15, rating: 4.9, reviews: 203, lastUpdated: '1 day ago', addedBy: 'Sita Thapa' },
  { id: 3, name: 'Drip Irrigation Kit', category: 'water', price: 2500, unit: 'per kit', supplier: 'WaterSmart Nepal', location: 'Lalitpur', coordinates: { lat: 27.6667, lng: 85.3167 }, isOrganic: false, sustainabilityScore: 88, co2Savings: 'Saves 60% water vs. traditional methods', priceComparison: -25, rating: 4.7, reviews: 89, lastUpdated: '3 days ago', addedBy: 'Krishna Maharjan' },
  { id: 4, name: 'Bean Seeds (Nitrogen-Fixing)', category: 'seeds', price: 80, unit: 'per 100g', supplier: 'Sustainable Seeds Co.', location: 'Patan', coordinates: { lat: 27.6667, lng: 85.3240 }, isOrganic: true, sustainabilityScore: 98, co2Savings: 'Natural nitrogen fixation - reduces fertilizer needs by 30%', priceComparison: -18, rating: 5.0, reviews: 178, lastUpdated: '1 day ago', addedBy: 'Binod Shrestha' },
  { id: 5, name: 'Bio-Pesticide (Neem-based)', category: 'fertilizer', price: 350, unit: 'per liter', supplier: 'Natural Guard', location: 'Kathmandu', coordinates: { lat: 27.7172, lng: 85.3240 }, isOrganic: true, sustainabilityScore: 90, co2Savings: 'Zero chemical residue - safe for pollinators', priceComparison: -12, rating: 4.6, reviews: 134, lastUpdated: '4 days ago', addedBy: 'Maya Gurung' },
  { id: 6, name: 'Rainwater Harvesting System', category: 'water', price: 8500, unit: 'per system', supplier: 'AquaHarvest Nepal', location: 'Bhaktapur', coordinates: { lat: 27.6710, lng: 85.4298 }, isOrganic: false, sustainabilityScore: 95, co2Savings: 'Reduces groundwater dependency by 70%', priceComparison: -30, rating: 4.9, reviews: 67, lastUpdated: '2 days ago', addedBy: 'Rajesh Tamang' },
  { id: 7, name: 'Organic Spinach Seeds', category: 'seeds', price: 95, unit: 'per 50g', supplier: 'Green Valley Seeds', location: 'Lalitpur', coordinates: { lat: 27.6667, lng: 85.3167 }, isOrganic: true, sustainabilityScore: 93, co2Savings: 'Fast-growing - reduces land use time', priceComparison: -22, rating: 4.7, reviews: 145, lastUpdated: '1 day ago', addedBy: 'Anita Rai' },
  { id: 8, name: 'Vermicompost', category: 'fertilizer', price: 380, unit: 'per 10kg', supplier: 'Worm Power Nepal', location: 'Patan', coordinates: { lat: 27.6667, lng: 85.3240 }, isOrganic: true, sustainabilityScore: 96, co2Savings: 'Converts waste to nutrients - circular economy', priceComparison: -20, rating: 4.8, reviews: 192, lastUpdated: '2 days ago', addedBy: 'Prakash Limbu' },
  { id: 9, name: 'Organic Cucumber Seeds', category: 'seeds', price: 110, unit: 'per 50g', supplier: 'Heritage Seeds Nepal', location: 'Kirtipur', coordinates: { lat: 27.6789, lng: 85.2789 }, isOrganic: true, sustainabilityScore: 94, co2Savings: 'Heirloom variety - preserves biodiversity', priceComparison: -19, rating: 4.9, reviews: 128, lastUpdated: '3 days ago', addedBy: 'Deepak Rana' },
  { id: 10, name: 'Hand-Operated Seed Planter', category: 'tools', price: 1200, unit: 'per unit', supplier: 'AgriTools Nepal', location: 'Kathmandu', coordinates: { lat: 27.7172, lng: 85.3240 }, isOrganic: false, sustainabilityScore: 75, co2Savings: 'Manual operation - zero fuel consumption', priceComparison: -28, rating: 4.5, reviews: 94, lastUpdated: '5 days ago', addedBy: 'Suresh Karki' },
  { id: 11, name: 'Organic Carrot Seeds', category: 'seeds', price: 85, unit: 'per 50g', supplier: 'Pure Harvest Seeds', location: 'Bhaktapur', coordinates: { lat: 27.6710, lng: 85.4298 }, isOrganic: true, sustainabilityScore: 92, co2Savings: 'Root crop - improves soil structure', priceComparison: -16, rating: 4.6, reviews: 112, lastUpdated: '2 days ago', addedBy: 'Kamala Devi' },
  { id: 12, name: 'Liquid Seaweed Fertilizer', category: 'fertilizer', price: 420, unit: 'per liter', supplier: 'Ocean Nutrients', location: 'Lalitpur', coordinates: { lat: 27.6667, lng: 85.3167 }, isOrganic: true, sustainabilityScore: 89, co2Savings: 'Natural growth hormones - boosts yield by 25%', priceComparison: -14, rating: 4.7, reviews: 87, lastUpdated: '4 days ago', addedBy: 'Bikash Thapa' },
  { id: 13, name: 'Solar Water Pump', category: 'water', price: 15000, unit: 'per pump', supplier: 'SolarAgri Nepal', location: 'Patan', coordinates: { lat: 27.6667, lng: 85.3240 }, isOrganic: false, sustainabilityScore: 97, co2Savings: 'Solar powered - eliminates diesel costs and emissions', priceComparison: -35, rating: 4.9, reviews: 56, lastUpdated: '1 week ago', addedBy: 'Ramesh Gurung' },
  { id: 14, name: 'Organic Chili Seeds', category: 'seeds', price: 130, unit: 'per 50g', supplier: 'Spice Valley Seeds', location: 'Kathmandu', coordinates: { lat: 27.7172, lng: 85.3240 }, isOrganic: true, sustainabilityScore: 91, co2Savings: 'High-value crop - maximizes income per acre', priceComparison: -21, rating: 4.8, reviews: 143, lastUpdated: '2 days ago', addedBy: 'Laxmi Sharma' },
  { id: 15, name: 'Compost Turner Tool', category: 'tools', price: 850, unit: 'per unit', supplier: 'Farm Essentials', location: 'Bhaktapur', coordinates: { lat: 27.6710, lng: 85.4298 }, isOrganic: false, sustainabilityScore: 70, co2Savings: 'Speeds up composting - reduces methane emissions', priceComparison: -24, rating: 4.4, reviews: 76, lastUpdated: '6 days ago', addedBy: 'Gopal Rai' },
  { id: 16, name: 'Organic Lettuce Seeds', category: 'seeds', price: 105, unit: 'per 25g', supplier: 'Green Valley Seeds', location: 'Lalitpur', coordinates: { lat: 27.6667, lng: 85.3167 }, isOrganic: true, sustainabilityScore: 93, co2Savings: 'Short growing cycle - multiple harvests per year', priceComparison: -17, rating: 4.7, reviews: 98, lastUpdated: '3 days ago', addedBy: 'Sunita Magar' },
  { id: 17, name: 'Biochar Soil Amendment', category: 'fertilizer', price: 520, unit: 'per 10kg', supplier: 'Carbon Farmers Nepal', location: 'Kirtipur', coordinates: { lat: 27.6789, lng: 85.2789 }, isOrganic: true, sustainabilityScore: 98, co2Savings: 'Sequesters carbon - improves soil for decades', priceComparison: -13, rating: 5.0, reviews: 64, lastUpdated: '5 days ago', addedBy: 'Arjun Tamang' },
  { id: 18, name: 'Sprinkler Irrigation System', category: 'water', price: 4500, unit: 'per system', supplier: 'IrriTech Nepal', location: 'Patan', coordinates: { lat: 27.6667, lng: 85.3240 }, isOrganic: false, sustainabilityScore: 85, co2Savings: 'Uniform water distribution - saves 40% water', priceComparison: -22, rating: 4.6, reviews: 72, lastUpdated: '4 days ago', addedBy: 'Kiran Shrestha' },
  { id: 19, name: 'Organic Radish Seeds', category: 'seeds', price: 70, unit: 'per 100g', supplier: 'Quick Grow Seeds', location: 'Kathmandu', coordinates: { lat: 27.7172, lng: 85.3240 }, isOrganic: true, sustainabilityScore: 90, co2Savings: 'Ready in 30 days - efficient land use', priceComparison: -20, rating: 4.5, reviews: 105, lastUpdated: '1 day ago', addedBy: 'Prem Bahadur' },
  { id: 20, name: 'Pruning Shears Set', category: 'tools', price: 650, unit: 'per set', supplier: 'Garden Pro Nepal', location: 'Bhaktapur', coordinates: { lat: 27.6710, lng: 85.4298 }, isOrganic: false, sustainabilityScore: 68, co2Savings: 'Durable steel - lasts 10+ years', priceComparison: -26, rating: 4.7, reviews: 118, lastUpdated: '1 week ago', addedBy: 'Sanjay Limbu' },
  { id: 21, name: 'Organic Pumpkin Seeds', category: 'seeds', price: 140, unit: 'per 100g', supplier: 'Heritage Seeds Nepal', location: 'Lalitpur', coordinates: { lat: 27.6667, lng: 85.3167 }, isOrganic: true, sustainabilityScore: 94, co2Savings: 'Dual purpose - edible seeds and fruit', priceComparison: -18, rating: 4.8, reviews: 89, lastUpdated: '2 days ago', addedBy: 'Rita Thapa' },
  { id: 22, name: 'Mycorrhizal Fungi Inoculant', category: 'fertilizer', price: 680, unit: 'per 500g', supplier: 'Soil Life Nepal', location: 'Patan', coordinates: { lat: 27.6667, lng: 85.3240 }, isOrganic: true, sustainabilityScore: 96, co2Savings: 'Enhances nutrient uptake - reduces fertilizer by 40%', priceComparison: -11, rating: 4.9, reviews: 53, lastUpdated: '3 days ago', addedBy: 'Dipak Rana' },
  { id: 23, name: 'Soil Moisture Sensor', category: 'tools', price: 950, unit: 'per unit', supplier: 'SmartFarm Tech', location: 'Kathmandu', coordinates: { lat: 27.7172, lng: 85.3240 }, isOrganic: false, sustainabilityScore: 82, co2Savings: 'Prevents overwatering - saves 30% water', priceComparison: -29, rating: 4.6, reviews: 81, lastUpdated: '5 days ago', addedBy: 'Nabin Karki' },
];

const stats = [
  { icon: Package,     label: 'Listed Resources',   value: '2,456' },
  { icon: MapPin,      label: 'Verified Suppliers',  value: '234'   },
  { icon: TrendingDown,label: 'Avg. Savings',        value: '22%'   },
  { icon: Leaf,        label: 'Eco-Friendly',        value: '71%'   },
];

const howItWorks = [
  { icon: Plus,   title: 'Add Purchase Details', desc: 'Share what you bought, where, and for how much'             },
  { icon: MapPin, title: 'Find Best Prices',     desc: 'Interactive map shows affordable suppliers near you'        },
  { icon: Leaf,   title: 'Choose Sustainable',   desc: 'Filter eco-friendly options with CO₂ savings data'         },
];

const getCategoryIcon = (cat: string) => ({ seeds: Sprout, fertilizer: Leaf, water: Droplets, tools: Package }[cat] ?? Package);

const getCategoryAccent = (cat: string) => ({
  seeds:      { border: 'border-[rgba(116,198,157,0.25)]', text: 'text-[#74c69d]',  bg: 'bg-[rgba(45,106,79,0.25)]'  },
  fertilizer: { border: 'border-[rgba(82,183,136,0.25)]',  text: 'text-[#52b788]',  bg: 'bg-[rgba(40,100,70,0.25)]'  },
  water:      { border: 'border-[rgba(100,180,220,0.25)]', text: 'text-[#7ecbe8]',  bg: 'bg-[rgba(30,80,120,0.25)]'  },
  tools:      { border: 'border-[rgba(183,183,183,0.2)]',  text: 'text-[#b7b7b7]',  bg: 'bg-[rgba(60,60,60,0.25)]'   },
}[cat] ?? { border: 'border-[rgba(82,183,136,0.25)]', text: 'text-[#52b788]', bg: 'bg-[rgba(40,100,70,0.25)]' });

const EMPTY_FORM = { name: '', category: 'seeds', price: '', unit: '', supplier: '', location: '', isOrganic: false, co2Savings: '', sustainabilityScore: 0 };

export default function ResourceMarketplace() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSustainableOnly, setShowSustainableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [calculatingSustainability, setCalculatingSustainability] = useState(false);

  useEffect(() => {
    document.title = 'Ecospark | Resources';

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
    fetchResources();
  }, []);

  const checkUser = async () => setUser(await getCurrentUser());

  const getTimeAgo = (d: string) => {
    const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)} weeks ago`;
  };

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      const dbResources = data && data.length > 0 ? data.map((item: any) => ({
        id: item.id, name: item.name, category: item.category, price: item.price, unit: item.unit,
        supplier: item.supplier, location: item.location, coordinates: item.coordinates || { lat: 27.7172, lng: 85.3240 },
        isOrganic: item.is_organic || false, sustainabilityScore: item.sustainability_score || 0,
        co2Savings: item.co2_savings, priceComparison: item.price_comparison || 0,
        rating: item.rating || 0, reviews: item.reviews || 0,
        lastUpdated: getTimeAgo(item.created_at), addedBy: item.added_by || 'Anonymous',
      })) : [];

      // Merge database resources with demo resources (demo resources come after)
      setResources([...dbResources, ...demoResources]);
    } catch { setResources(demoResources); }
    finally { setLoading(false); }
  };

  const handleAddResourceClick = () => { if (!user) { router.push('/login?from=resources'); return; } setShowAddModal(true); };

  const handleDetailsClick = (resource: Resource) => {
    setSelectedResource(resource);
    setShowDetailsModal(true);
  };

  const calculateSustainability = async () => {
    if (!formData.name || !formData.category) return;

    setCalculatingSustainability(true);
    try {
      const response = await fetch('/api/calculate-sustainability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          isOrganic: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          sustainabilityScore: data.sustainabilityScore,
          co2Savings: data.co2Savings,
        }));
      }
    } catch (error) {
      console.error('Error calculating sustainability:', error);
      // Set default values on error
      setFormData(prev => ({
        ...prev,
        sustainabilityScore: 75,
        co2Savings: 'Organic production reduces environmental impact and supports sustainable farming practices',
      }));
    } finally {
      setCalculatingSustainability(false);
    }
  };

  const handleOrganicChange = async (checked: boolean) => {
    setFormData({ ...formData, isOrganic: checked });

    if (checked) {
      // Automatically calculate sustainability when organic is checked
      await calculateSustainability();
    } else {
      // Clear values when unchecked
      setFormData(prev => ({
        ...prev,
        sustainabilityScore: 0,
        co2Savings: '',
      }));
    }
  };

  const handleSubmitResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { error } = await supabase.from('resources').insert([{
        name: formData.name, category: formData.category, price: parseFloat(formData.price),
        unit: formData.unit, supplier: formData.supplier, location: formData.location,
        is_organic: formData.isOrganic, sustainability_score: formData.sustainabilityScore,
        co2_savings: formData.co2Savings || null,
        added_by: user.user_metadata?.full_name || user.email || 'Anonymous User',
        user_id: user.id, rating: 0, reviews: 0, price_comparison: 0,
        coordinates: { lat: 27.7172, lng: 85.3240 },
      }]);
      if (error) throw error;
      await fetchResources();
      setFormData(EMPTY_FORM);
      setShowAddModal(false);
    } catch (err: any) { alert('Failed to add resource: ' + err.message); }
  };

  const filteredResources = resources.filter(r =>
    (selectedCategory === 'all' || r.category === selectedCategory) &&
    (!showSustainableOnly || r.isOrganic) &&
    (r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.supplier.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResources = filteredResources.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, showSustainableOnly, searchQuery]);

  const inputCls = (name: string) => [
    'w-full py-3.5 px-5 rounded-2xl text-white text-[0.9rem] placeholder-[rgba(183,228,199,0.2)]',
    'bg-[rgba(13,35,24,0.7)] border outline-none transition-all duration-200',
    focused === name
      ? 'border-[rgba(82,183,136,0.6)] shadow-[0_0_0_4px_rgba(82,183,136,0.07)]'
      : 'border-[rgba(82,183,136,0.15)] hover:border-[rgba(82,183,136,0.3)]',
  ].join(' ');

  return (
    <div className="min-h-screen bg-[#040d07] overflow-x-hidden">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.12),transparent_70%)]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(82,183,136,0.07),transparent_70%)]" />
      </div>

      <Navbar />

      <div className="relative z-10 pt-28 pb-24 px-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="mb-14" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.3)] px-4 py-1.5 rounded-full text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-[#95d5b2] mb-5">
              <DollarSign size={12} />
              Community-Driven Pricing
            </div>
            <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-black text-white leading-none tracking-[-0.02em] mb-4">
              Resource{' '}
              <em className="not-italic bg-gradient-to-br from-[#74c69d] via-[#52b788] to-[#d4a853] bg-clip-text text-transparent">
                Marketplace
              </em>
            </h1>
            <p className="text-lg text-[rgba(183,228,199,0.6)] max-w-2xl leading-relaxed">
              Crowdsourced database for seeds, water systems, and fertilizers. Find affordable suppliers and reduce middleman exploitation.
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
                  <div className="text-[0.78rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.45)]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-5 mb-10" data-aos="fade-up" data-aos-delay="200">
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52b788]" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search resources or suppliers…"
                  className="w-full pl-11 pr-4 py-3 bg-[rgba(5,18,10,0.6)] border border-[rgba(82,183,136,0.2)] rounded-xl text-white placeholder-[rgba(183,228,199,0.3)] text-sm focus:outline-none focus:border-[rgba(82,183,136,0.5)] transition-all duration-200"
                />
              </div>
              <button
                onClick={handleAddResourceClick}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] text-sm font-bold tracking-[0.04em] uppercase shadow-[0_0_22px_rgba(116,198,157,0.3)] hover:shadow-[0_0_36px_rgba(116,198,157,0.5)] hover:scale-[1.02] transition-all duration-200 whitespace-nowrap"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Resource
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {['all', 'seeds', 'fertilizer', 'water', 'tools'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={[
                    'px-4 py-1.5 rounded-full text-[0.8rem] font-semibold tracking-[0.05em] uppercase transition-all duration-200',
                    selectedCategory === cat
                      ? 'bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] shadow-[0_0_16px_rgba(116,198,157,0.3)]'
                      : 'bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.15)] text-[rgba(183,228,199,0.55)] hover:border-[rgba(82,183,136,0.35)] hover:text-[#b7e4c7]',
                  ].join(' ')}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSustainableOnly(!showSustainableOnly)}
                className={[
                  'flex items-center gap-2 px-4 py-1.5 rounded-full text-[0.8rem] font-semibold tracking-[0.05em] uppercase transition-all duration-200 border',
                  showSustainableOnly
                    ? 'bg-[rgba(45,106,79,0.3)] border-[rgba(82,183,136,0.5)] text-[#74c69d]'
                    : 'bg-[rgba(13,35,24,0.7)] border-[rgba(82,183,136,0.15)] text-[rgba(183,228,199,0.55)] hover:border-[rgba(82,183,136,0.35)]',
                ].join(' ')}
              >
                <Leaf size={13} />
                Eco-Friendly Only
              </button>
              <span className="text-[0.8rem] text-[rgba(183,228,199,0.4)]">
                {filteredResources.length} resources found
                {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-[rgba(82,183,136,0.2)] border-t-[#74c69d] animate-spin" />
              <p className="text-[rgba(183,228,199,0.5)] text-sm">Loading resources…</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-gradient-to-br from-[rgba(13,35,24,0.6)] to-[rgba(7,21,16,0.8)] border border-[rgba(82,183,136,0.12)] rounded-2xl">
              <Package size={48} className="text-[rgba(82,183,136,0.35)]" />
              <p className="text-[rgba(183,228,199,0.45)]">No resources found. Be the first to add one!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {paginatedResources.map((resource, index) => {
                const Icon = getCategoryIcon(resource.category);
                const accent = getCategoryAccent(resource.category);
                return (
                  <div
                    key={resource.id}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                    className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.12)] rounded-[20px] overflow-hidden hover:-translate-y-1.5 hover:border-[rgba(82,183,136,0.3)] hover:shadow-[0_24px_80px_rgba(0,0,0,0.4),0_0_60px_rgba(64,145,108,0.08)] transition-all duration-300"
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#74c69d] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-5">
                        <div className={`p-3 rounded-xl ${accent.bg} border ${accent.border}`}>
                          <Icon size={22} className={accent.text} />
                        </div>
                        {resource.isOrganic && (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.25)] text-[#74c69d] text-[0.7rem] font-bold tracking-[0.08em] uppercase">
                            <Leaf size={10} />
                            Organic
                          </div>
                        )}
                      </div>

                      <h3 className="font-serif text-[1.2rem] font-bold text-white mb-1 leading-snug group-hover:text-[#95d5b2] transition-colors duration-300">{resource.name}</h3>
                      <p className="text-[0.82rem] text-[rgba(183,228,199,0.45)] mb-4">{resource.supplier}</p>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="font-serif text-[1.75rem] font-black bg-gradient-to-br from-[#95d5b2] to-[#74c69d] bg-clip-text text-transparent">
                          NPR {resource.price}
                        </span>
                        <span className="text-[0.8rem] text-[rgba(183,228,199,0.4)]">{resource.unit}</span>
                      </div>

                      <div className="mb-4">
                        <div className={[
                          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.75rem] font-bold',
                          resource.priceComparison < 0
                            ? 'bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.2)] text-[#74c69d]'
                            : 'bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#fca5a5]',
                        ].join(' ')}>
                          <TrendingDown size={11} />
                          {Math.abs(resource.priceComparison)}% below market
                        </div>
                      </div>

                      {resource.co2Savings && (
                        <div className="bg-[rgba(5,18,10,0.6)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3 mb-4">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Leaf size={12} className="text-[#74c69d]" />
                            <span className="text-[0.7rem] font-bold tracking-[0.08em] uppercase text-[#74c69d]">Score {resource.sustainabilityScore}/100</span>
                          </div>
                          <p className="text-[0.8rem] text-[rgba(183,228,199,0.5)]">{resource.co2Savings}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[0.8rem] mb-5">
                        <div className="flex items-center gap-1.5 text-[rgba(183,228,199,0.45)]">
                          <MapPin size={13} className="text-[#52b788]" />
                          {resource.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star size={13} className="text-[#d4a853] fill-[#d4a853]" />
                          <span className="font-bold text-white">{resource.rating}</span>
                          <span className="text-[rgba(183,228,199,0.35)]">({resource.reviews})</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[rgba(82,183,136,0.1)]">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1.5 text-[0.78rem] text-[rgba(183,228,199,0.4)]">
                            <User size={12} className="text-[#52b788]" />
                            <span>by <span className="text-[#74c69d] font-semibold">{resource.addedBy}</span></span>
                          </div>
                          <span className="text-[0.75rem] text-[rgba(183,228,199,0.3)]">{resource.lastUpdated}</span>
                        </div>
                        <button
                          onClick={() => handleDetailsClick(resource)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] text-[0.8rem] font-bold tracking-[0.05em] uppercase shadow-[0_0_16px_rgba(116,198,157,0.2)] hover:shadow-[0_0_28px_rgba(116,198,157,0.4)] hover:scale-[1.02] transition-all duration-200">
                          View Details
                          <ArrowRight size={13} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-14" data-aos="fade-up">
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

          <div className="relative bg-gradient-to-br from-[rgba(13,35,24,0.7)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[radial-gradient(ellipse,rgba(45,106,79,0.2),transparent_70%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="text-center mb-10">
                <p className="text-[0.75rem] font-bold tracking-[0.15em] uppercase text-[#52b788] mb-3">Process</p>
                <h2 className="font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-black text-white tracking-[-0.02em]">How It Works</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {howItWorks.map((step, i) => (
                  <div key={i} className="group text-center p-6 rounded-[16px] border border-[rgba(82,183,136,0.08)] hover:bg-[rgba(13,35,24,0.6)] hover:border-[rgba(82,183,136,0.2)] transition-all duration-300">
                    <div className="inline-flex p-4 rounded-xl bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.2)] mb-5 group-hover:bg-[rgba(45,106,79,0.35)] group-hover:shadow-[0_0_20px_rgba(116,198,157,0.2)] transition-all duration-300">
                      <step.icon size={26} className="text-[#74c69d]" />
                    </div>
                    <h3 className="font-serif text-[1.1rem] font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)] leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-[rgba(4,13,7,0.95)] backdrop-blur-lg z-[9999] flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-[rgba(13,35,24,0.97)] to-[rgba(7,21,16,0.99)] border border-[rgba(82,183,136,0.2)] rounded-[24px] p-8 max-h-[90vh] overflow-y-auto shadow-[0_32px_80px_rgba(0,0,0,0.7)]">

            <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.4)] to-transparent rounded-full" />

            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[0.72rem] font-bold tracking-[0.1em] uppercase text-[#52b788] mb-1">Contribute</p>
                <h2 className="font-serif text-[1.5rem] font-black text-white tracking-[-0.02em]">Add Resource</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(82,183,136,0.2)] bg-[rgba(45,106,79,0.15)] text-[rgba(183,228,199,0.6)] hover:text-white hover:bg-[rgba(45,106,79,0.3)] transition-all duration-200">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitResource} className="space-y-4">

              <div className="space-y-1.5">
                <label className="block text-[0.78rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)]">Resource Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} placeholder="e.g., Organic Tomato Seeds" required className={inputCls('name')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[0.78rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)]">Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} onFocus={() => setFocused('cat')} onBlur={() => setFocused(null)} className={inputCls('cat')}>
                    <option value="seeds">Seeds</option>
                    <option value="fertilizer">Fertilizer</option>
                    <option value="water">Water</option>
                    <option value="tools">Tools</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[0.78rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)]">Price (NPR)</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} onFocus={() => setFocused('price')} onBlur={() => setFocused(null)} placeholder="120" required className={inputCls('price')} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[0.78rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)]">Unit</label>
                <input type="text" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} onFocus={() => setFocused('unit')} onBlur={() => setFocused(null)} placeholder="e.g., per 100g" required className={inputCls('unit')} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[0.78rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)]">Supplier Name</label>
                <input type="text" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} onFocus={() => setFocused('supplier')} onBlur={() => setFocused(null)} placeholder="e.g., Green Valley Seeds" required className={inputCls('supplier')} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[0.78rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)]">Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} onFocus={() => setFocused('loc')} onBlur={() => setFocused(null)} placeholder="e.g., Kathmandu" required className={inputCls('loc')} />
              </div>

              <label className="flex items-center gap-3 cursor-pointer group/check">
                <div className={['w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200', formData.isOrganic ? 'bg-[#74c69d] border-[#74c69d]' : 'border-[rgba(82,183,136,0.3)] bg-[rgba(13,35,24,0.7)]'].join(' ')}>
                  {formData.isOrganic && <span className="text-[#040d07] text-xs font-black">✓</span>}
                </div>
                <input type="checkbox" checked={formData.isOrganic} onChange={e => handleOrganicChange(e.target.checked)} className="hidden" disabled={calculatingSustainability} />
                <span className="text-[0.875rem] text-[rgba(183,228,199,0.6)] group-hover/check:text-[#b7e4c7] transition-colors duration-200">
                  This is an organic / eco-friendly product
                  {calculatingSustainability && <span className="ml-2 text-[#74c69d]">(Calculating...)</span>}
                </span>
              </label>

              {formData.isOrganic && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-[0.78rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)]">
                      CO₂ Savings / Environmental Benefit
                      <span className="ml-2 text-[0.7rem] text-[#74c69d] normal-case">✨ AI Generated</span>
                    </label>
                    <textarea
                      value={formData.co2Savings}
                      onChange={e => setFormData({ ...formData, co2Savings: e.target.value })}
                      onFocus={() => setFocused('co2')}
                      onBlur={() => setFocused(null)}
                      placeholder="AI will calculate this automatically..."
                      rows={2}
                      className={inputCls('co2')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[0.78rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)]">
                      Sustainability Score (0–100)
                      <span className="ml-2 text-[0.7rem] text-[#74c69d] normal-case">✨ AI Generated</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.sustainabilityScore}
                      onChange={e => setFormData({ ...formData, sustainabilityScore: parseInt(e.target.value) || 0 })}
                      onFocus={() => setFocused('score')}
                      onBlur={() => setFocused(null)}
                      placeholder="AI will calculate this..."
                      className={inputCls('score')}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-full border border-[rgba(82,183,136,0.15)] bg-[rgba(13,35,24,0.5)] text-[rgba(183,228,199,0.6)] text-[0.875rem] font-semibold hover:bg-[rgba(13,35,24,0.8)] hover:text-white hover:border-[rgba(82,183,136,0.3)] transition-all duration-200">
                  Cancel
                </button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] text-[0.875rem] font-bold tracking-[0.04em] uppercase shadow-[0_0_20px_rgba(116,198,157,0.25)] hover:shadow-[0_0_32px_rgba(116,198,157,0.45)] transition-all duration-200">
                  <Plus size={15} strokeWidth={2.5} />
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ResourceDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        resource={selectedResource}
      />
    </div>
  );
}
