'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmail } from '@/lib/supabase-auth';
import { Leaf, ArrowRight, AlertCircle, ArrowLeft, Mail, Lock } from 'lucide-react';

function EcosparkLogo({ size = 36 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size}>
      <path fill="#74c69d" d="M103.23,52.71l12.44-12.02c1.01-.52,1.96-.4,2.93.15,5.99,3.41-6.8,10.98-7.96,14.14l-5.76,40.48,21.97-18.51c1.4-1.86.24-4.02.2-5.93-.06-2.93-.46-10.73.63-12.97.88-1.82,3.23-2.28,4.72-1.01.22.19,1.25,1.92,1.25,2.04v11.72l12.31-10.09c2.62-.96,4.84,1.45,4.05,4.05l-20.47,18.79h18.29c2.88,0,3.67,5.36,1.15,6.09-.72.21-3.47.44-4.43.51-7.48.49-15.49-.41-23.03,0l-8.84,7.19c4.59-.07,9.05-1.76,13.52-2.51.6-.1,1-.51.86.45l-16.03,31.24c1.92,19.99,4.53,39.92,7.45,59.78l25.15.13c2.99.67,3.37,5.58.06,6.05l-87.85-.06c-2.59-1.34-2.21-5.61.83-5.98l24.73-.14,8.26-61.61-20.55,4.11,11.33-24.25-6.62-4.91-24.87-.21c-3.29-1.02-1.6-5.98-.19-5.98h17.47c.15-.69-.22-.83-.62-1.23-4.12-4.01-14.49-10.38-17.23-14.42-1.92-2.83-.17-5.51,3.06-5.14l13.56,10.92v-9.25c0-2.74,5.65-4.37,6.18-.02s-.62,9.7.2,14.19l11.91,10.28,10.1-19.92-30.44-23.43c-2.13-1.99.54-5.53,2.98-5.08,1.48.27,11.27,8.77,11.81,8.16-.25-3.14-1.32-13.32.54-15.5,1.42-1.67,3.96-1.1,4.98.74,2.03,3.65-.33,15.09.85,19.7l12.54,9.04v-37.61c0-.12,1.02-1.85,1.25-2.04,1.81-1.54,5.33-.14,5.33,2.04v17.88-.05ZM97.06,106.97l3.29-27.95-20.14,40.9,16.85-3.09-3.28,27.95,21.36-40.5c.17-.9-.36-.61-.97-.56-2.33.16-16.38,3.97-17.11,3.25Z"/>
      <path fill="#74c69d" d="M117.82,130.81l-.42-.81,2.85-5.38,41.13-.39c20.91-3.33,27.07-29,10.68-42.32-2.06-1.67-4.22-2.46-6.31-3.96,8.37-17.67-3.22-41.06-23.26-42.52-3.85-.28-7.62.33-11.32.65-2.93-6.2-5.81-11.18-11.31-15.42-18.31-14.13-43.27-5.62-50.81,15.55-8.31-1.46-15.66-1.27-23.08,3.02-11.28,6.52-16.8,20.23-13.73,32.89.48,2,1.61,3.75,1.88,5.8-1.82,1.59-4.26,2.35-6.31,3.99-13.44,10.81-12.19,32.17,3.47,40.09,1.25.63,5.61,2.24,6.8,2.24h24.46l-3.15,6.59c-9.5-.45-19.55,1.3-28.61-2.17-19.04-7.3-24.51-32.03-11.39-47.37,2.12-2.48,4.62-4.06,6.91-6.27-3.85-15.69,1.66-31.76,15.3-40.57,7.27-4.69,15.16-6,23.72-5.67C75.5,9.11,99.76,1.57,119.27,12.63c6.86,3.89,11.74,10.04,15.88,16.61,25.5-3.39,45.2,21.44,38.41,45.8,15.34,10.19,19.26,31.44,6.93,45.69-4.35,5.03-13.17,10.08-19.92,10.08h-42.75Z"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoBack, setShowGoBack] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Ecospark | Login';

    // Check if there's a redirect parameter or if user came from another page
    const from = searchParams.get('from');
    const hasHistory = window.history.length > 1;

    // Show go back if user was redirected from another page (not from navbar)
    if (from && from !== 'navbar') {
      setShowGoBack(true);
    } else if (hasHistory && document.referrer && !document.referrer.includes('/login')) {
      setShowGoBack(true);
    }
  }, [searchParams]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error } = await signInWithEmail(email, password);
      if (error) throw error;

      console.log('Login successful, session:', data.session); // Debug log
      console.log('User:', data.user); // Debug log

      // Wait a moment for session to be stored
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to the page they came from, or marketplace by default
      const from = searchParams.get('from');
      const redirectTo = from ? `/${from}` : '/marketplace';
      console.log('Redirecting to:', redirectTo); // Debug log
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040d07] flex overflow-hidden">

      {/* ── Left panel — decorative ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative p-12 bg-[radial-gradient(ellipse_at_top_left,rgba(45,106,79,0.3),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(82,183,136,0.15),transparent_60%)]">

        {/* Vertical line */}
        <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-[rgba(82,183,136,0.2)] to-transparent" />

        {/* Logo top-left */}
        <div className="flex items-center gap-3">
          <EcosparkLogo size={38} />
          <span className="font-serif text-[1.35rem] font-bold text-white tracking-[-0.01em]">
            Eco<span className="text-[#74c69d]">spark</span>
          </span>
        </div>

        {/* Center quote */}
        <div className="space-y-6">
          <div className="w-12 h-px bg-gradient-to-r from-[#74c69d] to-transparent" />
          <blockquote className="font-serif text-[2.25rem] font-black text-white leading-[1.15] tracking-[-0.025em]">
            Turn waste into{' '}
            <em className="not-italic bg-gradient-to-br from-[#74c69d] via-[#52b788] to-[#d4a853] bg-clip-text text-transparent">
              living wealth.
            </em>
          </blockquote>
          <p className="text-[rgba(183,228,199,0.5)] text-[0.95rem] leading-relaxed max-w-xs">
            Join thousands of farmers and landowners building a circular economy across Nepal.
          </p>
        </div>

        {/* Stats bottom */}
        <div className="flex gap-8">
          {[['1,234', 'Active users'], ['500m²', 'Land restored'], ['312kg', 'Waste recycled']].map(([val, label]) => (
            <div key={label}>
              <div className="font-serif text-[1.5rem] font-black text-[#95d5b2]">{val}</div>
              <div className="text-[0.72rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.35)]">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">

        {/* Ambient glow */}
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.12),transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <EcosparkLogo size={32} />
            <span className="font-serif text-[1.2rem] font-bold text-white">
              Eco<span className="text-[#74c69d]">spark</span>
            </span>
          </div>

          {/* Go Back Button */}
          {showGoBack && (
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors duration-300 mb-6 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-sm font-medium">Go Back</span>
            </button>
          )}

          {/* Heading */}
          <div className="mb-10">
            <h1 className="font-serif text-[2.25rem] font-black text-white tracking-[-0.025em] leading-none mb-2">
              Sign in
            </h1>
            <p className="text-[rgba(183,228,199,0.45)] text-[0.9rem]">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#74c69d] font-semibold hover:text-[#95d5b2] transition-colors duration-200" style={{ textDecoration: 'none' }}>
                Sign up free
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[0.8rem] font-semibold text-[rgba(183,228,199,0.6)]">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="you@example.com"
                required
                className={[
                  'w-full py-4 px-5 rounded-2xl text-white text-[0.95rem] placeholder-[rgba(183,228,199,0.2)]',
                  'bg-[rgba(13,35,24,0.7)] border outline-none transition-all duration-200',
                  focused === 'email'
                    ? 'border-[rgba(82,183,136,0.6)] shadow-[0_0_0_4px_rgba(82,183,136,0.07),0_0_20px_rgba(82,183,136,0.1)]'
                    : 'border-[rgba(82,183,136,0.15)] hover:border-[rgba(82,183,136,0.3)]',
                ].join(' ')}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[0.8rem] font-semibold text-[rgba(183,228,199,0.6)]">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[0.78rem] text-[rgba(116,198,157,0.6)] hover:text-[#74c69d] transition-colors duration-200" style={{ textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                required
                minLength={6}
                className={[
                  'w-full py-4 px-5 rounded-2xl text-white text-[0.95rem] placeholder-[rgba(183,228,199,0.2)]', 'bg-[rgba(13,35,24,0.7)] border outline-none transition-all duration-200',
                  focused === 'password'
                    ? 'border-[rgba(82,183,136,0.6)] shadow-[0_0_0_4px_rgba(82,183,136,0.07),0_0_20px_rgba(82,183,136,0.1)]': 'border-[rgba(82,183,136,0.15)] hover:border-[rgba(82,183,136,0.3)]',
                ].join(' ')}
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-[rgba(239,68,68,0.07)] border border-[rgba(239,68,68,0.18)] text-[#fca5a5] px-4 py-3.5 rounded-2xl text-[0.85rem] leading-relaxed">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] font-bold text-[0.95rem] tracking-[0.04em] shadow-[0_0_28px_rgba(116,198,157,0.3)] hover:shadow-[0_0_44px_rgba(116,198,157,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-[rgba(4,13,7,0.25)] border-t-[#040d07] animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={17} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-1.5 mt-10 text-[0.7rem] text-[rgba(183,228,199,0.2)] tracking-[0.1em] uppercase">
            <Leaf size={10} className="text-[rgba(82,183,136,0.3)]" />
            Sustainable Agriculture · Nepal
          </div>
        </div>
      </div>
    </div>
  );
}
