'use client';

import { useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Leaf, ArrowRight, TreePine, Recycle, Sprout, Target, Camera, Wind } from "lucide-react";
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Home() {
  useEffect(() => {
    document.title = 'Ecospark | Home';

    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Initialize AOS with settings that show initial content
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      offset: 120, // Start animation earlier
      delay: 0,
      disable: false,
      mirror: false,
      anchorPlacement: 'top-center', // Better for initial viewport
    });

    // Refresh AOS after a brief delay to ensure DOM is ready
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  }, []);

  return (
    <div className="min-h-screen bg-[#040d07] font-sans overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden bg-[radial-gradient(ellipse_100%_80%_at_50%_-10%,rgba(45,106,79,0.35),transparent_70%),radial-gradient(ellipse_60%_60%_at_80%_80%,rgba(64,145,108,0.12),transparent_60%)]">
        {/* Blobs */}
        <div className="absolute -top-24 -left-24 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.18),transparent_70%)] animate-[breathe_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(82,183,136,0.12),transparent_70%)] animate-[breathe_10s_ease-in-out_infinite_reverse]" />

        {/* Particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#95d5b2] opacity-0 animate-[float-up_linear_infinite]"
            style={{
              left: `${8 + i * 8}%`,
              bottom: `${10 + (i % 3) * 15}%`,
              animationDuration: `${4 + i * 0.7}s`,
              animationDelay: `${i * 0.4}s`,
              width: i % 3 === 0 ? '4px' : '2px',
              height: i % 3 === 0 ? '4px' : '2px',
            }}
          />
        ))}

        <div className="max-w-7xl mx-auto  relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <div className="inline-flex items-center gap-2 bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.3)] px-5 py-2 rounded-full text-[0.8rem] font-semibold tracking-[0.1em] uppercase text-[#95d5b2] mb-8">
              <Leaf size={13} />
              Where Action Sparks Sustainability
              </div>
              <h1 className="font-serif text-[clamp(3.5rem,8vw,7rem)] font-black leading-none tracking-[-0.02em] text-white mb-6">
                Turn Your<br />
                <b>Trash</b> into{" "}
                <em className="not-italic bg-gradient-to-br from-[#74c69d] via-[#52b788] to-[#d4a853] bg-clip-text text-transparent">
                  Treasury
                </em>
              </h1>
              <p className="text-lg leading-relaxed text-[rgba(183,228,199,0.65)] max-w-xl mb-10">
                Stop ghosting the planet. We&apos;re bridging the gap between wasted resources and productive growth using AI, peer-to-peer sharing, and real-world missions.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] font-bold text-base tracking-[0.04em] uppercase shadow-[0_0_40px_rgba(116,198,157,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(116,198,157,0.55)] transition-all duration-300"
                >
                  Shop the Hustle
                  <ArrowRight size={18} strokeWidth={2.5} />
                </Link>
                <Link
                  href="/land"
                  className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full border border-[rgba(82,183,136,0.35)] text-[#95d5b2] font-semibold text-base tracking-[0.04em] uppercase hover:bg-[rgba(82,183,136,0.1)] hover:border-[rgba(82,183,136,0.6)] hover:-translate-y-1 transition-all duration-300"
                >
                  Claim your Plot
                </Link>
              </div>
              <div className="flex items-center gap-4 max-w-xs mt-14">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(82,183,136,0.4)] to-transparent" />
                <TreePine size={14} color="rgba(82,183,136,0.5)" />
                <span className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-[rgba(82,183,136,0.45)]">
                  Building Nepal&apos;s Future
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(82,183,136,0.4)] to-transparent" />
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center" data-aos="fade-left" data-aos-delay="200">
              <div className="relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(116,198,157,0.3),transparent_70%)] blur-3xl" />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-[400px] h-[400px] drop-shadow-[0_0_60px_rgba(116,198,157,0.4)] animate-[breathe_6s_ease-in-out_infinite]">
                  <path fill="#74c69d" d="M103.23,52.71l12.44-12.02c1.01-.52,1.96-.4,2.93.15,5.99,3.41-6.8,10.98-7.96,14.14l-5.76,40.48,21.97-18.51c1.4-1.86.24-4.02.2-5.93-.06-2.93-.46-10.73.63-12.97.88-1.82,3.23-2.28,4.72-1.01.22.19,1.25,1.92,1.25,2.04v11.72l12.31-10.09c2.62-.96,4.84,1.45,4.05,4.05l-20.47,18.79h18.29c2.88,0,3.67,5.36,1.15,6.09-.72.21-3.47.44-4.43.51-7.48.49-15.49-.41-23.03,0l-8.84,7.19c4.59-.07,9.05-1.76,13.52-2.51.6-.1,1-.51.86.45l-16.03,31.24c1.92,19.99,4.53,39.92,7.45,59.78l25.15.13c2.99.67,3.37,5.58.06,6.05l-87.85-.06c-2.59-1.34-2.21-5.61.83-5.98l24.73-.14,8.26-61.61-20.55,4.11,11.33-24.25-6.62-4.91-24.87-.21c-3.29-1.02-1.6-5.98-.19-5.98h17.47c.15-.69-.22-.83-.62-1.23-4.12-4.01-14.49-10.38-17.23-14.42-1.92-2.83-.17-5.51,3.06-5.14l13.56,10.92v-9.25c0-2.74,5.65-4.37,6.18-.02s-.62,9.7.2,14.19l11.91,10.28,10.1-19.92-30.44-23.43c-2.13-1.99.54-5.53,2.98-5.08,1.48.27,11.27,8.77,11.81,8.16-.25-3.14-1.32-13.32.54-15.5,1.42-1.67,3.96-1.1,4.98.74,2.03,3.65-.33,15.09.85,19.7l12.54,9.04v-37.61c0-.12,1.02-1.85,1.25-2.04,1.81-1.54,5.33-.14,5.33,2.04v17.88-.05ZM97.06,106.97l3.29-27.95-20.14,40.9,16.85-3.09-3.28,27.95,21.36-40.5c.17-.9-.36-.61-.97-.56-2.33.16-16.38,3.97-17.11,3.25Z"/>
                  <path fill="#74c69d" d="M117.82,130.81l-.42-.81,2.85-5.38,41.13-.39c20.91-3.33,27.07-29,10.68-42.32-2.06-1.67-4.22-2.46-6.31-3.96,8.37-17.67-3.22-41.06-23.26-42.52-3.85-.28-7.62.33-11.32.65-2.93-6.2-5.81-11.18-11.31-15.42-18.31-14.13-43.27-5.62-50.81,15.55-8.31-1.46-15.66-1.27-23.08,3.02-11.28,6.52-16.8,20.23-13.73,32.89.48,2,1.61,3.75,1.88,5.8-1.82,1.59-4.26,2.35-6.31,3.99-13.44,10.81-12.19,32.17,3.47,40.09,1.25.63,5.61,2.24,6.8,2.24h24.46l-3.15,6.59c-9.5-.45-19.55,1.3-28.61-2.17-19.04-7.3-24.51-32.03-11.39-47.37,2.12-2.48,4.62-4.06,6.91-6.27-3.85-15.69,1.66-31.76,15.3-40.57,7.27-4.69,15.16-6,23.72-5.67C75.5,9.11,99.76,1.57,119.27,12.63c6.86,3.89,11.74,10.04,15.88,16.61,25.5-3.39,45.2,21.44,38.41,45.8,15.34,10.19,19.26,31.44,6.93,45.69-4.35,5.03-13.17,10.08-19.92,10.08h-42.75Z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-12 px-6 bg-gradient-to-br from-[rgba(13,35,24,0.9)] to-[rgba(18,48,32,0.95)] border-y border-[rgba(82,183,136,0.15)] overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_40px,rgba(82,183,136,0.02)_40px,rgba(82,183,136,0.02)_41px)]" />
        <div className="max-w-7xl mx-auto relative leading-10 z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '1,234', label: 'The Growth Squad' },
            { value: '312kg', label: 'Tons of "Trash" Rescued' },
            { value: '12.5K m²', label: 'Greenspace Reclaimed' },
            { value: '8,567', label: 'Vibes Verified' },
          ].map((s, i) => (
            <div key={i} className="text-center" data-aos="fade-up" data-aos-delay={i * 100}>
              <div className="font-serif text-[3.5rem] font-black text-[#95d5b2] leading-none mb-2 [text-shadow:0_0_20px_rgba(149,213,178,0.4)]">
                {s.value}
              </div>
              <div className="text-[0.8rem] font-semibold tracking-[0.1em] uppercase text-[rgba(177,244,200,0.72)]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="relative py-32 px-6 bg-[#040d07]">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[rgba(82,183,136,0.2)] to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20" data-aos="fade-up">
            <p className="text-[0.75rem] font-bold tracking-[0.15em] uppercase text-[#52b788] mb-4">Three Ways to Contribute</p>
            <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-black text-white leading-[1.1] tracking-[0.02em] mb-5">
              Choose your path to<br />sustainable impact
            </h2>
            <p className="text-lg text-[rgba(183,228,199,0.55)] leading-relaxed max-w-lg mx-auto">
              Whether you have waste to share, land to restore, or time to contribute—there's a place for you in Nepal's circular economy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Recycle, num: '01', title: 'The Upcycle Flex',   desc: 'Upload agricultural waste and receive AI-powered sustainability analysis with tailored repurposing suggestions for maximum value.', href: '/marketplace', bg: 'rgba(45,106,79,0.2)', link:'Explore the loop',    color: '#52b788' },
              { icon: Sprout,  num: '02', title: 'Touch Grass (Literally)', desc: 'Kathamndu\'s fallow plots are waiting for you. Find a space, grab a crew and start a micro-farm. Every claim starts with a "Sweat Mission". Clear the weeds, upload the pic, and own the impact.',        href: '/land',        bg: 'rgba(64,145,108,0.18)', link:'Get your hands dirty',  color: '#74c69d' },
              { icon: Target,  num: '03', title: 'The Greenhouse Effect',   desc: 'Transparent pricing for seeds and tools. No middlemen, no cap. Crowdsourced data to keep local farming affordable and sustainable.', link:'Get the Deets',        href: '/resources',    bg: 'rgba(82,183,136,0.15)',  color: '#95d5b2' },
            ].map((f, i) => (
              <div
                key={i}
                data-aos="fade-up"
                data-aos-delay={i * 150}
                className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.12)] rounded-[20px] p-10 overflow-hidden hover:-translate-y-1.5 hover:border-[rgba(82,183,136,0.3)] hover:shadow-[0_24px_80px_rgba(0,0,0,0.4),0_0_60px_rgba(64,145,108,0.1)] transition-all duration-300 cursor-default"
              >

                <p className="font-serif text-[0.75rem] font-bold tracking-[0.1em] text-[rgba(82,183,136,0.4)] mb-2">— {f.num}</p>

                <div className="relative w-[70px] h-[70px] rounded-2xl flex items-center justify-center mb-7 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]" style={{ background: f.bg }}>
                  <div className="absolute inset-[-1px] rounded-[17px] p-px bg-gradient-to-br from-[#40916c] to-[#95d5b2] opacity-60 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:xor]" />
                  <div className="relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                    <f.icon size={36} color="#95d5b2" strokeWidth={2.2} />
                  </div>
                </div>

                <h3 className="font-serif text-[1.6rem] font-bold text-white tracking-[0.02em] mb-3.5">{f.title}</h3>
                <p className="text-[0.95rem] leading-[1.75] text-[rgba(183,228,199,0.55)] mb-6">{f.desc}</p>
                <Link
                  href={f.href}
                  className="inline-flex items-center gap-2 text-[0.85rem] font-bold tracking-[0.06em] uppercase text-[#74c69d] hover:gap-3.5 transition-all duration-300"
                >
                  {f.link} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-gradient-to-b from-[rgba(13,35,24,0.5)] to-[#040d07]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div data-aos="fade-right">
            <p className="text-[0.75rem] font-bold tracking-[0.15em] uppercase text-[#52b788] mb-4">Smart Features</p>
            <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-black text-white leading-[1.3] tracking-[-0.02em] mb-5">
              AI-powered insights,<br />
              <em className="not-italic text-[#95d5b2]">verified impact</em>
            </h2>
            <p className="text-lg text-[rgba(183,228,199,0.55)] leading-relaxed mb-12">
              From waste analysis to crop recommendations, our platform uses AI to maximize value while ensuring every action is tracked and verified.
            </p>

            <div className="flex flex-col gap-4">
              {[
                { icon: Recycle, title: 'AI Waste Analysis', desc: 'Snap a pic, get a plan. Our AI tells you if that husk is trash or tomorrow\'s fertilizer.' },
                {
                  icon: Sprout, title: 'Smart Crop Advisor', desc: 'Open-Meteo integration keeps you ahead of the weather. Plant what the soil actually wants, not just what\'s trendy.' },
                { icon: Camera,  title: 'Geo-Tagged Verification', desc: 'Proof of Work > Proof of Words. Every mission requires a geo-tagged "Before and After" shot. We keep it 100% real.' },
              ].map((item, i) => (
                <div
                  key={i}
                  data-aos="fade-up"
                  data-aos-delay={i * 100}
                  className="flex gap-5 items-start p-6 rounded-[14px] border border-[rgba(82,183,136,0.08)] hover:bg-[rgba(13,35,24,0.6)] hover:border-[rgba(82,183,136,0.2)] transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-[46px] h-[46px] bg-[rgba(45,106,79,0.25)] border border-[rgba(82,183,136,0.25)] rounded-xl flex items-center justify-center">
                    <item.icon size={20} color="#74c69d" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="font-serif text-[1.1rem] font-bold text-[#e8f5ee] mb-1.5">{item.title}</div>
                    <div className="text-[0.9rem] leading-relaxed text-[rgba(183,228,199,0.5)]">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[rgba(13,35,24,0.9)] to-[rgba(7,21,16,1)] border border-[rgba(82,183,136,0.2)] rounded-3xl p-6 md:p-10 shadow-[0_0_120px_rgba(64,145,108,0.12),inset_0_1px_0_rgba(82,183,136,0.1)] overflow-hidden" data-aos="fade-left">
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_0%,rgba(45,106,79,0.15),transparent_60%)] pointer-events-none" />

            <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-1 relative z-10">Today's Activity</h3>
            <div className="relative z-10 flex items-center gap-1.5 text-[0.75rem] font-semibold tracking-[0.08em] uppercase text-[#74c69d] mb-6 md:mb-8">
              <span className="w-[7px] h-[7px] rounded-full bg-[#74c69d] animate-[pulse-ring_2s_ease-out_infinite]" />
              Live Updates
            </div>

            {[
              { label: 'Waste Listings',    value: '47 New Drops' },
              { label: 'Land Plots Claimed', value: '12 Plot Secured'  },
              { label: 'Missions Completed', value: '89 Mission Verified'  },
              { label: 'Active Farmers',     value: '1,234 Legends'   },
            ].map((s, i, arr) => (
              <div
                key={i}
                className={`relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 md:py-5 gap-2 sm:gap-0 ${i < arr.length - 1 ? 'border-b border-[rgba(82,183,136,0.1)]' : ''}`}
              >
                <span className="text-[0.85rem] md:text-[0.9rem] font-medium text-[rgba(183,228,199,0.55)]">{s.label}</span>
                <span className="font-serif text-[1.1rem] md:text-[1.3rem] font-black bg-gradient-to-br from-[#95d5b2] to-[#74c69d] bg-clip-text text-transparent">
                  {s.value}
                </span>
              </div>
            ))}

            <Link
              href="/impact"
              className="relative z-10 block text-center mt-8 py-3.5 rounded-xl bg-[rgba(45,106,79,0.25)] border border-[rgba(82,183,136,0.25)] text-[#95d5b2] font-semibold text-[0.875rem] tracking-[0.06em] uppercase hover:bg-[rgba(45,106,79,0.4)] hover:border-[rgba(82,183,136,0.45)] transition-all duration-300 no-underline"
            >
              View Impact Dashboard →
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-36 px-6 overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(45,106,79,0.25),transparent_70%)]">
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_25%_35%,rgba(82,183,136,0.35),transparent),radial-gradient(1px_1px_at_75%_65%,rgba(82,183,136,0.25),transparent),radial-gradient(1px_1px_at_60%_20%,rgba(149,213,178,0.2),transparent)]" />
        <div className="font-serif absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(6rem,18vw,14rem)] font-black italic text-[rgba(45,106,79,0.06)] whitespace-nowrap pointer-events-none tracking-[-0.04em] select-none">
          Ecospark
        </div>

        <div className="max-w-3xl mx-auto relative z-10 text-center" data-aos="zoom-in">
          <div className="inline-flex items-center gap-2 bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.3)] px-5 py-2 rounded-full text-[0.8rem] font-semibold tracking-[0.1em] uppercase text-[#95d5b2] mb-8">
            <Wind size={13} />
            Join the Action Movement
          </div>
          <h2 className="font-serif text-[clamp(2.75rem,6vw,5rem)] font-black text-white leading-[1.1] tracking-[-0.025em] mb-6">
            Stop the Yapping<br />
            <em className="not-italic text-[#74c69d]">Start the Mapping</em>
          </h2>
          <p className="text-lg text-[rgba(183,228,199,0.55)] leading-relaxed max-w-lg mx-auto mb-12">
            Join the movement of youth, farmer, and landowners turning Nepal's "barren" into "bountiful". One mission at a time.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] font-bold text-base tracking-[0.04em] uppercase shadow-[0_0_40px_rgba(116,198,157,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(116,198,157,0.55)] transition-all duration-300"
            >
              Join the squad
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
            <Link
              href="/impact"
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full border border-[rgba(82,183,136,0.35)] text-[#95d5b2] font-semibold text-base tracking-[0.04em] uppercase hover:bg-[rgba(82,183,136,0.1)] hover:border-[rgba(82,183,136,0.6)] hover:-translate-y-1 transition-all duration-300"
            >
              See Real Impact
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1) translate(0,0); opacity: 0.8; }
          50%       { transform: scale(1.1) translate(20px,-20px); opacity: 1; }
        }
        @keyframes float-up {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-200px) translateX(30px); opacity: 0; }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(116,198,157,0.6); }
          100% { box-shadow: 0 0 0 10px rgba(116,198,157,0); }
        }
      `}</style>
    </div>
  );
}
