'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { TrendingUp, Leaf, Recycle, MapPin, Award, Users, Target, Droplets, Globe, Calendar, Image as ImageIcon, Zap, Heart } from 'lucide-react';

export default function Impact() {
  const [activeTab, setActiveTab] = useState<'overview' | 'carbon' |'community'>('overview');

  useEffect(() => {
    document.title = 'Ecospark | Impact';

    window.scrollTo(0, 0);

    import('aos').then((AOS) => {
      AOS.init({
        duration: 800,
        once: true,
        easing: 'ease-out-cubic',
        offset: 120,
      });
      // @ts-ignore - AOS CSS doesn't have type definitions
      import('aos/dist/aos.css');
    });
  }, []);

  // Demo data
  const stats = {
    totalUsers: 2847,
    completedMissions: 1456,
    totalPoints: 87340,
    totalCO2: 728.5,
    landsClaimed: 234,
    itemsShared: 567,
    resourcesAdded: 389,
    impactScore: 96
  };

  const monthlyData = [
    { month: 'Aug', co2: 45.2, missions: 89, users: 234, points: 5420 },
    { month: 'Sep', co2: 98.5, missions: 156, users: 389, points: 9850 },
    { month: 'Oct', co2: 167.3, missions: 245, users: 567, points: 15670 },
    { month: 'Nov', co2: 289.6, missions: 398, users: 892, points: 24890 },
    { month: 'Dec', co2: 423.8, missions: 567, users: 1234, points: 38450 },
    { month: 'Jan', co2: 578.2, missions: 892, users: 1789, points: 56780 },
    { month: 'Feb', co2: 645.9, missions: 1123, users: 2234, points: 71230 },
    { month: 'Mar', co2: 728.5, missions: 1456, users: 2847, points: 87340 }
  ];

  const topContributors = [
    { name: 'Sarah Chen', points: 4850, missions: 48, avatar: '👩‍🌾' },
    { name: 'Marcus Johnson', points: 4320, missions: 43, avatar: '👨‍🌾' },
    { name: 'Priya Patel', points: 3890, missions: 39, avatar: '👩‍🔬' },
    { name: 'Ahmed Hassan', points: 3560, missions: 36, avatar: '👨‍🔬' },
    { name: 'Elena Rodriguez', points: 3240, missions: 32, avatar: '👩‍🌾' }
  ];

  const missionImages = [
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
    'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400',
    'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=400',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=400',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400',
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400'
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-[#040d07] overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.15),transparent_70%)] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(82,183,136,0.1),transparent_70%)]" />
      </div>

      <Navbar />

      <div className="relative z-10 pt-28 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 bg-[rgba(45,106,79,0.25)] border border-[rgba(82,183,136,0.4)] px-5 py-2 rounded-full text-[0.8rem] font-bold tracking-[0.15em] uppercase text-[#95d5b2] mb-6 shadow-lg">
              <TrendingUp size={14} />
              Live Impact Dashboard
            </div>
            <h1 className="font-serif text-[clamp(3rem,8vw,5.5rem)] font-black text-white leading-none tracking-[-0.03em] mb-6">
              Our Collective{' '}
              <span className="relative inline-block">
                <em className="not-italic bg-gradient-to-br from-[#74c69d] via-[#52b788] to-[#d4a853] bg-clip-text text-transparent">
                  Impact
                </em>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#74c69d] to-[#d4a853] rounded-full" />
              </span>
            </h1>
            <p className="text-xl text-[rgba(183,228,199,0.7)] max-w-3xl mx-auto leading-relaxed mb-8">
              Together, we're creating real environmental change. Every action counts, every mission matters.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { value: formatNumber(stats.totalUsers), label: 'Active Users', icon: Users, color: '#95d5b2' },
                { value: formatNumber(stats.completedMissions), label: 'Missions Done', icon: Target, color: '#74c69d' },
                { value: `${stats.totalCO2.toFixed(0)}t`, label: 'CO₂ Saved', icon: Leaf, color: '#52b788' },
                { value: `${stats.impactScore}/100`, label: 'Spark Points', icon: Award, color: '#d4a853' }
              ].map((stat, i) => (
                <div key={i} className="bg-[rgba(13,35,24,0.6)] border border-[rgba(82,183,136,0.2)] rounded-2xl p-4 backdrop-blur-sm hover:border-[rgba(82,183,136,0.4)] transition-all">
                  <stat.icon size={24} className="mx-auto mb-2" style={{ color: stat.color }} />
                  <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-[rgba(183,228,199,0.6)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-3 mb-12" data-aos="fade-up">
            {[
              { id: 'overview', label: 'Overview', icon: Globe },
              { id: 'carbon', label: 'Carbon Impact', icon: Leaf },
              { id: 'community', label: 'Community', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#52b788] to-[#74c69d] text-[#040d07] shadow-lg shadow-[rgba(82,183,136,0.3)]'
                    : 'bg-[rgba(13,35,24,0.6)] border border-[rgba(82,183,136,0.2)] text-[rgba(183,228,199,0.7)] hover:border-[rgba(82,183,136,0.4)]'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid with Mini Graphs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-aos="fade-up">
                {[
                  { icon: Users, label: 'Community Growth', value: formatNumber(stats.totalUsers), trend: '+24%', data: [234, 389, 567, 892, 1234, 1789, 2234, 2847], color: '#95d5b2' },
                  { icon: Target, label: 'Missions Completed', value: formatNumber(stats.completedMissions), trend: '+18%', data: [89, 156, 245, 398, 567, 892, 1123, 1456], color: '#74c69d' },
                  { icon: MapPin, label: 'Land Restored', value: formatNumber(stats.landsClaimed), trend: '+32%', data: [12, 28, 45, 78, 112, 156, 198, 234], color: '#52b788' },
                  { icon: Recycle, label: 'Items Shared', value: formatNumber(stats.itemsShared), trend: '+15%', data: [45, 89, 156, 234, 345, 456, 512, 567], color: '#40916c' }
                ].map((stat, i) => {
                  const maxValue = Math.max(...stat.data);
                  return (
                    <div key={i} className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.9)] to-[rgba(7,21,16,0.95)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-6 hover:border-[rgba(82,183,136,0.4)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-[rgba(45,106,79,0.25)] border border-[rgba(82,183,136,0.2)]">
                          <stat.icon size={24} style={{ color: stat.color }} />
                        </div>
                        <div className="text-right">
                          <div className="text-[0.7rem] text-[#74c69d] font-bold mb-1">{stat.trend}</div>
                          <div className="text-2xl font-black text-white">{stat.value}</div>
                        </div>
                      </div>

                      <div className="h-16 flex items-end gap-1 mb-3">
                        {stat.data.map((val, idx) => (
                          <div key={idx} className="flex-1 flex flex-col justify-end">
                            <div
                              className="w-full rounded-t transition-all duration-500"
                              style={{
                                height: `${(val / maxValue) * 100}%`,
                                backgroundColor: stat.color,
                                opacity: 0.4 + (idx / stat.data.length) * 0.6
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="text-sm text-[rgba(183,228,199,0.6)] font-medium">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-gradient-to-br from-[rgba(13,35,24,0.9)] to-[rgba(7,21,16,0.95)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-8" data-aos="fade-up">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Community Sparks</h2>
      <p className="text-sm text-[rgba(183,228,199,0.6)]">Real photos from completed missions</p>
                  </div>
                  <ImageIcon size={28} className="text-[#74c69d]" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {missionImages.map((img, i) => (
                    <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-[rgba(82,183,136,0.15)] hover:border-[rgba(82,183,136,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_rgba(116,198,157,0.3)]">
                      <img src={img} alt="Mission" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,13,7,0.9)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="w-6 h-6 rounded-full bg-[#52b788] flex items-center justify-center">
                            <Target size={14} className="text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'carbon' && (
            <div className="space-y-6">
              {/* CO2 Line Graph */}
              <div className="bg-gradient-to-br from-[rgba(13,35,24,0.9)] to-[rgba(7,21,16,0.95)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-8" data-aos="fade-up">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">CO₂ Reduction Progress</h2>
                    <p className="text-[rgba(183,228,199,0.6)]">8-month carbon offset journey</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-[#74c69d]">{stats.totalCO2}t</div>
                    <div className="text-sm text-[rgba(183,228,199,0.6)]">Total CO₂ Saved</div>
                  </div>
                </div>

                <div className="relative h-96 mb-8 bg-[rgba(4,13,7,0.4)] rounded-xl p-6">

                  <div className="absolute left-2 top-6 bottom-20 w-12 flex flex-col justify-between text-right pr-2">
                    {[800, 600, 400, 200, 0].map((val) => (
                      <div key={val} className="text-[0.7rem] text-[rgba(183,228,199,0.5)] font-medium">{val}t</div>
                    ))}
                  </div>

                  <div className="absolute left-16 right-6 top-6 bottom-20">

                    {[0, 25, 50, 75, 100].map((p) => (
                      <div key={p} className="absolute left-0 right-0 border-t border-[rgba(82,183,136,0.1)]" style={{ top: `${100 - p}%` }} />
                    ))}

                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#52b788" />
                          <stop offset="50%" stopColor="#74c69d" />
                          <stop offset="100%" stopColor="#95d5b2" />
                        </linearGradient>
                        <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#74c69d" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#74c69d" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      {(() => {
                        const points = monthlyData.map((d, i) => ({
                          x: (i / (monthlyData.length - 1)) * 100,
                          y: 100 - ((d.co2 / 800) * 100),
                          data: d
                        }));

                        let path = `M ${points[0].x} ${points[0].y}`;
                        for (let i = 0; i < points.length - 1; i++) {
                          const curr = points[i];
                          const next = points[i + 1];
                          const midX = (curr.x + next.x) / 2;
                          const midY = (curr.y + next.y) / 2;
                          path += ` Q ${curr.x} ${curr.y}, ${midX} ${midY}`;
                          if (i === points.length - 2) path += ` Q ${next.x} ${next.y}, ${next.x} ${next.y}`;
                        }

                        const area = `${path} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

                        return (
                          <>

                            <path d={area} fill="url(#areaGrad)" />


                            <path
                              d={path}
                              fill="none"
                              stroke="url(#lineGrad)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              style={{ filter: 'drop-shadow(0 0 8px rgba(116, 198, 157, 0.5))' }}
                            />


                            {points.map((p, i) => (
                              <g key={i} className="hover-point">
                                <circle
                                  cx={`${p.x}%`}
                                  cy={`${p.y}%`}
                                  r="6"
                                  fill="#040d07"
                                  stroke="#74c69d"
                                  strokeWidth="3"
                                  style={{ filter: 'drop-shadow(0 0 6px rgba(116, 198, 157, 0.8))' }}
                                />
                                <circle
                                  cx={`${p.x}%`}
                                  cy={`${p.y}%`}
                                  r="3"
                                  fill="#95d5b2"
                                />
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>


                    <div className="absolute inset-0 flex">
                      {monthlyData.map((d, i) => (
                        <div key={i} className="flex-1 group relative">
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30">
                            <div className="bg-[rgba(4,13,7,0.98)] border-2 border-[rgba(116,198,157,0.6)] rounded-xl px-4 py-3 shadow-2xl backdrop-blur-sm min-w-[140px]">
                              <div className="text-[#95d5b2] text-[0.65rem] font-bold mb-1 uppercase tracking-wider">{d.month} 2024</div>
                              <div className="text-white font-black text-xl mb-1">{d.co2}t CO₂</div>
                              <div className="text-[rgba(183,228,199,0.7)] text-xs">{d.missions} missions</div>
                            </div>

                            <div className="w-3 h-3 bg-[rgba(4,13,7,0.98)] border-r-2 border-b-2 border-[rgba(116,198,157,0.6)] rotate-45 mx-auto -mt-1.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="absolute left-16 right-6 bottom-6 flex justify-between">
                    {monthlyData.map((d) => (
                      <div key={d.month} className="text-[0.7rem] text-[rgba(183,228,199,0.6)] font-semibold">{d.month}</div>
                    ))}
                  </div>
                </div>

                {/* Impact Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: '🚗', value: `${(stats.totalCO2 * 4347).toLocaleString()} km`, label: 'Car driving saved' },
                    { icon: '⚡', value: `${(stats.totalCO2 * 1200).toLocaleString()} kWh`, label: 'Energy offset' },
                    { icon: '🌳', value: `${(stats.totalCO2 * 2.5).toFixed(0)} trees`, label: 'Tree equivalent' }
                  ].map((metric, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 rounded-xl bg-[rgba(45,106,79,0.15)] border border-[rgba(82,183,136,0.12)]">
                      <div className="text-4xl">{metric.icon}</div>
                      <div>
                        <div className="text-white font-bold text-lg">{metric.value}</div>
                        <div className="text-[rgba(183,228,199,0.6)] text-sm">{metric.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Community Tab */}
          {activeTab === 'community' && (
            <div className="space-y-6">
              {/* Top Contributors */}
              <div className="bg-gradient-to-br from-[rgba(13,35,24,0.9)] to-[rgba(7,21,16,0.95)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-8" data-aos="fade-up">
                <div className="flex items-center gap-3 mb-8">
                  <Award size={32} className="text-[#d4a853]" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Top Contributors</h2>
                    <p className="text-sm text-[rgba(183,228,199,0.6)]">Leading the environmental movement</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {topContributors.map((user, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 rounded-xl bg-[rgba(45,106,79,0.15)] border border-[rgba(82,183,136,0.12)] hover:border-[rgba(82,183,136,0.3)] transition-all">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                        i === 0 ? 'bg-gradient-to-br from-[#d4a853] to-[#b8923d] shadow-lg' :
                        i === 1 ? 'bg-gradient-to-br from-[#95d5b2] to-[#74c69d]' :
                        i === 2 ? 'bg-gradient-to-br from-[#b8923d] to-[#8b6f2e]' :
                        'bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.2)]'
                      }`}>
                        {user.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-lg">{user.name}</div>
                        <div className="text-[rgba(183,228,199,0.6)] text-sm">{user.missions} missions completed</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#74c69d] font-black text-xl">{formatNumber(user.points)}</div>
                        <div className="text-[rgba(183,228,199,0.5)] text-xs">points</div>
                      </div>
                      {i < 3 && <Award size={20} className={i === 0 ? 'text-[#d4a853]' : i === 1 ? 'text-[#95d5b2]' : 'text-[#b8923d]'} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-aos="fade-up">
                {[
                  { icon: Heart, value: '98%', label: 'Satisfaction Rate', color: '#d4a853' },
                  { icon: Zap, value: '24/7', label: 'Active Community', color: '#74c69d' },
                  { icon: Globe, value: '45+', label: 'Countries', color: '#52b788' }
                ].map((stat, i) => (
                  <div key={i} className="text-center p-8 bg-gradient-to-br from-[rgba(13,35,24,0.9)] to-[rgba(7,21,16,0.95)] border border-[rgba(82,183,136,0.15)] rounded-2xl">
                    <stat.icon size={40} className="mx-auto mb-4" style={{ color: stat.color }} />
                    <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                    <div className="text-[rgba(183,228,199,0.6)]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
