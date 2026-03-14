'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, LogOut, Zap } from 'lucide-react';
import { getCurrentUser, signOut, supabase } from '@/lib/supabase-auth';

const NAV_LINKS = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Land Revival', href: '/land-revival' },
  { label: 'Resources', href: '/resources' },
  { label: 'Missions', href: '/mission' },
  { label: 'Farm Assistant', href: '/farm-assistant' },
  { label: 'Impact', href: '/impact' },
];

const ACCOUNT_LINKS = [
  { label: 'My Flex', href: '/my-flex', icon: Zap },
  { label: 'My Profile', href: '/profile', icon: Zap },
];

function EcosparkLogo({ size = 32 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} aria-label="Ecospark logo">
      <path fill="#74c69d" d="M103.23,52.71l12.44-12.02c1.01-.52,1.96-.4,2.93.15,5.99,3.41-6.8,10.98-7.96,14.14l-5.76,40.48,21.97-18.51c1.4-1.86.24-4.02.2-5.93-.06-2.93-.46-10.73.63-12.97.88-1.82,3.23-2.28,4.72-1.01.22.19,1.25,1.92,1.25,2.04v11.72l12.31-10.09c2.62-.96,4.84,1.45,4.05,4.05l-20.47,18.79h18.29c2.88,0,3.67,5.36,1.15,6.09-.72.21-3.47.44-4.43.51-7.48.49-15.49-.41-23.03,0l-8.84,7.19c4.59-.07,9.05-1.76,13.52-2.51.6-.1,1-.51.86.45l-16.03,31.24c1.92,19.99,4.53,39.92,7.45,59.78l25.15.13c2.99.67,3.37,5.58.06,6.05l-87.85-.06c-2.59-1.34-2.21-5.61.83-5.98l24.73-.14,8.26-61.61-20.55,4.11,11.33-24.25-6.62-4.91-24.87-.21c-3.29-1.02-1.6-5.98-.19-5.98h17.47c.15-.69-.22-.83-.62-1.23-4.12-4.01-14.49-10.38-17.23-14.42-1.92-2.83-.17-5.51,3.06-5.14l13.56,10.92v-9.25c0-2.74,5.65-4.37,6.18-.02s-.62,9.7.2,14.19l11.91,10.28,10.1-19.92-30.44-23.43c-2.13-1.99.54-5.53,2.98-5.08,1.48.27,11.27,8.77,11.81,8.16-.25-3.14-1.32-13.32.54-15.5,1.42-1.67,3.96-1.1,4.98.74,2.03,3.65-.33,15.09.85,19.7l12.54,9.04v-37.61c0-.12,1.02-1.85,1.25-2.04,1.81-1.54,5.33-.14,5.33,2.04v17.88-.05ZM97.06,106.97l3.29-27.95-20.14,40.9,16.85-3.09-3.28,27.95,21.36-40.5c.17-.9-.36-.61-.97-.56-2.33.16-16.38,3.97-17.11,3.25Z" />
      <path fill="#74c69d" d="M117.82,130.81l-.42-.81,2.85-5.38,41.13-.39c20.91-3.33,27.07-29,10.68-42.32-2.06-1.67-4.22-2.46-6.31-3.96,8.37-17.67-3.22-41.06-23.26-42.52-3.85-.28-7.62.33-11.32.65-2.93-6.2-5.81-11.18-11.31-15.42-18.31-14.13-43.27-5.62-50.81,15.55-8.31-1.46-15.66-1.27-23.08,3.02-11.28,6.52-16.8,20.23-13.73,32.89.48,2,1.61,3.75,1.88,5.8-1.82,1.59-4.26,2.35-6.31,3.99-13.44,10.81-12.19,32.17,3.47,40.09,1.25.63,5.61,2.24,6.8,2.24h24.46l-3.15,6.59c-9.5-.45-19.55,1.3-28.61-2.17-19.04-7.3-24.51-32.03-11.39-47.37,2.12-2.48,4.62-4.06,6.91-6.27-3.85-15.69,1.66-31.76,15.3-40.57,7.27-4.69,15.16-6,23.72-5.67C75.5,9.11,99.76,1.57,119.27,12.63c6.86,3.89,11.74,10.04,15.88,16.61,25.5-3.39,45.2,21.44,38.41,45.8,15.34,10.19,19.26,31.44,6.93,45.69-4.35,5.03-13.17,10.08-19.92,10.08h-42.75Z" />
    </svg>
  );
}

function AccountDropdown({
  user,
  userProfile,
  anchorRef,
  onClose,
  onSignOut,
}: {
  user: any;
  userProfile: any;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onSignOut: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        anchorRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [anchorRef, onClose]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Farmer';

  return (
    <div
      ref={dropdownRef}
      className="w-64 bg-[rgba(4,13,7,0.98)] border border-[rgba(82,183,136,0.3)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-hidden"
      style={{ animation: 'dropdown-in 0.2s ease forwards' }}
    >
      <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.5)] to-transparent" />

      <div className="p-3">
        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_12px_rgba(116,198,157,0.4)] ring-2 ring-[rgba(116,198,157,0.5)]">
            {userProfile?.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <span className="text-[#040d07] text-[0.9rem] font-black uppercase">
                {displayName.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.9rem] font-bold text-white truncate leading-tight mb-0.5">{displayName}</p>
            <p className="text-[0.75rem] text-[rgba(183,228,199,0.5)] truncate">{user?.email}</p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(82,183,136,0.15)] to-transparent mb-2" />

        {/* Menu Links */}
        {ACCOUNT_LINKS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.875rem] font-medium text-[rgba(183,228,199,0.75)] hover:text-[#b7e4c7] hover:bg-[rgba(45,106,79,0.2)] transition-all duration-200 cursor-pointer"
          >
            <Icon size={16} className="text-[#52b788] shrink-0" />
            <span>{label}</span>
          </Link>
        ))}

        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(82,183,136,0.15)] to-transparent my-2" />

        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.875rem] font-medium text-[rgba(252,165,165,0.8)] hover:text-[#fca5a5] hover:bg-[rgba(239,68,68,0.1)] transition-all duration-200 cursor-pointer"
        >
          <LogOut size={16} className="shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountBtnRef = useRef<HTMLButtonElement>(null);

 

  useEffect(() => {
    loadUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      await loadUserProfile(currentUser.id);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSignOut = async () => {
    setShowAccountMenu(false);
    await signOut();
    setUser(null);
    window.location.href = '/';
  };

  const toggleAccountMenu = () => setShowAccountMenu(v => !v);

  return (
    <>
      {showAccountMenu && user && (
        <div className="fixed top-0 left-0 right-0 z-[1000] px-6 pt-4 pointer-events-none sm:px-3">
          <div className="max-w-[1200px] mx-auto relative">
            <div className="absolute top-[68px] right-[10px] pointer-events-auto">
              <AccountDropdown
                user={user}
                userProfile={userProfile}
                anchorRef={accountBtnRef}
                onClose={() => setShowAccountMenu(false)}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-0 left-0 right-0 z-[999] px-6 pt-4 pointer-events-none sm:px-3">
        <div className={[
          'pointer-events-auto max-w-[1400px] mx-auto h-[64px] rounded-full',
          'flex items-center justify-between pl-4 pr-2.5',
          'relative overflow-hidden border backdrop-blur-xl',
          'transition-[background,border-color,box-shadow] duration-300',
          scrolled
            ? 'bg-[rgba(5,18,10,0.88)] border-[rgba(82,183,136,0.28)] shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(82,183,136,0.08),inset_0_1px_0_rgba(82,183,136,0.1)]'
            : 'bg-[rgba(5,18,10,0.55)] border-[rgba(82,183,136,0.18)]',
        ].join(' ')}>
          <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.6)] to-transparent pointer-events-none" />

          <Link href="/" className="flex items-center gap-2.5 shrink-0 group" style={{ textDecoration: 'none' }}>
            <div className="group-hover:-rotate-[8deg] group-hover:scale-[1.08] transition-transform duration-300 drop-shadow-[0_0_8px_rgba(116,198,157,0.5)] group-hover:drop-shadow-[0_0_14px_rgba(116,198,157,0.75)]">
              <EcosparkLogo size={36} />
            </div>
            <span className="font-serif text-[1.3rem] text-white tracking-[-0.01em]">
              Eco<span className="text-[#74c69d]">spark</span>
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-0.5 list-none m-0 p-0">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-[0.9375rem] font-medium tracking-[0.08em] text-[rgba(255,255,255,0.85)] px-4 py-2 rounded-lg whitespace-nowrap hover:text-white hover:bg-[rgba(82,183,136,0.12)] transition-all duration-200 ease-out"
                  style={{ textDecoration: 'none' }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="relative">
            {user ? (
              <button
                ref={accountBtnRef}
                onClick={toggleAccountMenu}
                className={[
                  'hidden md:inline-flex items-center justify-center overflow-hidden relative',
                  'w-[42px] h-[42px] rounded-full mt-1 shrink-0',
                  'bg-gradient-to-br from-[#40916c] to-[#74c69d]',
                  'shadow-[0_0_22px_rgba(116,198,157,0.5),0_0_40px_rgba(116,198,157,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]',
                  'hover:scale-[1.08] hover:shadow-[0_0_30px_rgba(116,198,157,0.7),0_0_60px_rgba(116,198,157,0.4)]',
                  'ring-2 ring-[rgba(116,198,157,0.6)] ring-offset-2 ring-offset-[#040d07]',
                  showAccountMenu ? 'scale-[1.08] shadow-[0_0_35px_rgba(116,198,157,0.8),0_0_70px_rgba(116,198,157,0.5)] ring-[rgba(116,198,157,0.8)]' : '',
                  'transition-all duration-200',
                ].join(' ')}
                aria-label="Account menu"
              >
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <span className="text-[#ffffff] text-[1rem] font-black uppercase flex items-center justify-center w-full h-full">
                    {(user?.user_metadata?.full_name || user?.email || 'F').charAt(0)}
                  </span>
                )}
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center gap-1.5 text-[0.8rem] font-semibold tracking-[0.06em] uppercase text-[#05120a] px-5 py-[9px] rounded-full whitespace-nowrap shrink-0 bg-gradient-to-br from-[#40916c] to-[#74c69d] shadow-[0_0_22px_rgba(116,198,157,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] hover:scale-[1.04] hover:shadow-[0_0_38px_rgba(116,198,157,0.55)] [&>svg]:transition-transform [&>svg]:duration-300 hover:[&>svg]:translate-x-[3px] transition-all duration-200"
                style={{ textDecoration: 'none' }}
              >
                Get Started
                <ChevronRight size={14} strokeWidth={2.5} />
              </Link>
            )}
          </div>

          <button
            className="md:hidden flex items-center justify-center w-[38px] h-[38px] rounded-full border border-[rgba(82,183,136,0.25)] bg-[rgba(45,106,79,0.15)] text-[#95d5b2] cursor-pointer shrink-0 hover:bg-[rgba(45,106,79,0.3)] hover:border-[rgba(82,183,136,0.45)] transition-all duration-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={17} strokeWidth={2} /> : <Menu size={17} strokeWidth={2} />}
          </button>
        </div>

        <div
          aria-hidden={!isOpen}
          className={[
            'pointer-events-auto max-w-[1200px] mx-auto mt-2 rounded-3xl',
            'border border-[rgba(82,183,136,0.18)] bg-[rgba(5,18,10,0.96)] backdrop-blur-2xl overflow-hidden',
            'transition-all duration-300',
            isOpen ? 'max-h-[560px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2',
          ].join(' ')}
        >
          <div className="p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2.5 px-4 py-3 mb-1">
              <EcosparkLogo size={28} />
              <span className="font-serif text-[1.1rem] text-white tracking-[-0.01em]">
                Eco<span className="text-[#74c69d]">spark</span>
              </span>
            </div>

            <div className="h-px mb-1 bg-gradient-to-r from-transparent via-[rgba(82,183,136,0.15)] to-transparent" />

            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between text-[0.9375rem] font-medium tracking-[-0.01em] text-[rgba(183,228,199,0.85)] px-4 py-3 rounded-xl border border-transparent hover:text-white hover:bg-[rgba(45,106,79,0.2)] hover:border-[rgba(82,183,136,0.2)] hover:pl-5 [&>svg]:opacity-0 [&>svg]:-translate-x-1 hover:[&>svg]:opacity-100 hover:[&>svg]:translate-x-0 [&>svg]:transition-all [&>svg]:duration-200 transition-all duration-200 ease-out"
                style={{ textDecoration: 'none' }}
              >
                {label}
                <ChevronRight size={15} strokeWidth={2} className="text-[#74c69d]" />
              </Link>
            ))}

            <div className="h-px my-1 bg-gradient-to-r from-transparent via-[rgba(82,183,136,0.15)] to-transparent" />

            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] flex items-center justify-center shrink-0 overflow-hidden">
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#040d07] text-[0.75rem] font-black uppercase">
                        {(user?.user_metadata?.full_name || user?.email || 'F').charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.82rem] font-bold text-white truncate leading-tight">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-[0.72rem] text-[rgba(183,228,199,0.4)] truncate">{user?.email}</p>
                  </div>
                </div>

                {ACCOUNT_LINKS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between text-[0.9rem] font-medium text-[rgba(183,228,199,0.7)] px-4 py-3 rounded-2xl border border-transparent hover:text-[#b7e4c7] hover:bg-[rgba(45,106,79,0.18)] hover:border-[rgba(82,183,136,0.18)] transition-all duration-200"
                    style={{ textDecoration: 'none' }}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon size={15} className="text-[#52b788]" />
                      {label}
                    </span>
                    <ChevronRight size={14} strokeWidth={2} className="text-[rgba(82,183,136,0.4)]" />
                  </Link>
                ))}

                <button
                  onClick={() => { setIsOpen(false); handleSignOut(); }}
                  className="flex items-center justify-center gap-2 mt-1 px-4 py-3.5 rounded-2xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.07)] text-[rgba(252,165,165,0.8)] font-semibold text-[0.875rem] tracking-[0.06em] uppercase hover:border-[rgba(239,68,68,0.45)] hover:text-[#fca5a5] transition-all duration-200"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 mt-1 px-4 py-3.5 rounded-2xl border border-[rgba(82,183,136,0.3)] bg-gradient-to-br from-[rgba(45,106,79,0.4)] to-[rgba(116,198,157,0.15)] text-[#95d5b2] font-semibold text-[0.875rem] tracking-[0.06em] uppercase hover:border-[rgba(82,183,136,0.5)] hover:text-[#b7e4c7] transition-all duration-200"
                style={{ textDecoration: 'none' }}
              >
                <EcosparkLogo size={16} />
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
