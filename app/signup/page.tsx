'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUpWithEmail } from '@/lib/supabase-auth';
import { Leaf, ArrowRight, AlertCircle } from 'lucide-react';

function EcosparkLogo({ size = 36 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size}>
      <path fill="#74c69d" d="M103.23,52.71l12.44-12.02c1.01-.52,1.96-.4,2.93.15,5.99,3.41-6.8,10.98-7.96,14.14l-5.76,40.48,21.97-18.51c1.4-1.86.24-4.02.2-5.93-.06-2.93-.46-10.73.63-12.97.88-1.82,3.23-2.28,4.72-1.01.22.19,1.25,1.92,1.25,2.04v11.72l12.31-10.09c2.62-.96,4.84,1.45,4.05,4.05l-20.47,18.79h18.29c2.88,0,3.67,5.36,1.15,6.09-.72.21-3.47.44-4.43.51-7.48.49-15.49-.41-23.03,0l-8.84,7.19c4.59-.07,9.05-1.76,13.52-2.51.6-.1,1-.51.86.45l-16.03,31.24c1.92,19.99,4.53,39.92,7.45,59.78l25.15.13c2.99.67,3.37,5.58.06,6.05l-87.85-.06c-2.59-1.34-2.21-5.61.83-5.98l24.73-.14,8.26-61.61-20.55,4.11,11.33-24.25-6.62-4.91-24.87-.21c-3.29-1.02-1.6-5.98-.19-5.98h17.47c.15-.69-.22-.83-.62-1.23-4.12-4.01-14.49-10.38-17.23-14.42-1.92-2.83-.17-5.51,3.06-5.14l13.56,10.92v-9.25c0-2.74,5.65-4.37,6.18-.02s-.62,9.7.2,14.19l11.91,10.28,10.1-19.92-30.44-23.43c-2.13-1.99.54-5.53,2.98-5.08,1.48.27,11.27,8.77,11.81,8.16-.25-3.14-1.32-13.32.54-15.5,1.42-1.67,3.96-1.1,4.98.74,2.03,3.65-.33,15.09.85,19.7l12.54,9.04v-37.61c0-.12,1.02-1.85,1.25-2.04,1.81-1.54,5.33-.14,5.33,2.04v17.88-.05ZM97.06,106.97l3.29-27.95-20.14,40.9,16.85-3.09-3.28,27.95,21.36-40.5c.17-.9-.36-.61-.97-.56-2.33.16-16.38,3.97-17.11,3.25Z"/>
      <path fill="#74c69d" d="M117.82,130.81l-.42-.81,2.85-5.38,41.13-.39c20.91-3.33,27.07-29,10.68-42.32-2.06-1.67-4.22-2.46-6.31-3.96,8.37-17.67-3.22-41.06-23.26-42.52-3.85-.28-7.62.33-11.32.65-2.93-6.2-5.81-11.18-11.31-15.42-18.31-14.13-43.27-5.62-50.81,15.55-8.31-1.46-15.66-1.27-23.08,3.02-11.28,6.52-16.8,20.23-13.73,32.89.48,2,1.61,3.75,1.88,5.8-1.82,1.59-4.26,2.35-6.31,3.99-13.44,10.81-12.19,32.17,3.47,40.09,1.25.63,5.61,2.24,6.8,2.24h24.46l-3.15,6.59c-9.5-.45-19.55,1.3-28.61-2.17-19.04-7.3-24.51-32.03-11.39-47.37,2.12-2.48,4.62-4.06,6.91-6.27-3.85-15.69,1.66-31.76,15.3-40.57,7.27-4.69,15.16-6,23.72-5.67C75.5,9.11,99.76,1.57,119.27,12.63c6.86,3.89,11.74,10.04,15.88,16.61,25.5-3.39,45.2,21.44,38.41,45.8,15.34,10.19,19.26,31.44,6.93,45.69-4.35,5.03-13.17,10.08-19.92,10.08h-42.75Z"/>
    </svg>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Ecospark | Sign Up';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error } = await signUpWithEmail(email, password, fullName);
      if (error) throw error;
      router.push('/marketplace');
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040d07] flex overflow-hidden">

      <div className="hidden lg:flex flex-col justify-between w-[45%] relative p-12 bg-[radial-gradient(ellipse_at_top_left,rgba(45,106,79,0.3),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(82,183,136,0.15),transparent_60%)]">

        <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-[rgba(82,183,136,0.2)] to-transparent" />

        <div className="flex items-center gap-3">
          <EcosparkLogo size={38} />
          <span className="font-serif text-[1.35rem] font-bold text-white tracking-[-0.01em]">
            Eco<span className="text-[#74c69d]">spark</span>
          </span>
        </div>

        <div className="space-y-6">
          <div className="w-12 h-px bg-gradient-to-r from-[#74c69d] to-transparent" />
          <blockquote className="font-serif text-[2.25rem] font-black text-white leading-[1.15] tracking-[-0.025em]">
            Your journey to a{' '}
            <em className="not-italic bg-gradient-to-br from-[#74c69d] via-[#52b788] to-[#d4a853] bg-clip-text text-transparent">
              greener Nepal
            </em>{' '}
            starts here.
          </blockquote>
          <p className="text-[rgb(169,168,168)] text-[0.95rem] leading-relaxed max-w-xs">
            Connect with farmers, revitalize land, and build a circular economy — one action at a time.
          </p>
        </div>

        <div className="space-y-4">
          {[
            'AI-powered waste sustainability analysis',
            'Claim and revitalize unused land plots',
            'Complete real-world eco missions',
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.35)] flex items-center justify-center shrink-0">
                <Leaf size={10} className="text-[#74c69d]" />
              </div>
              <span className="text-[0.875rem] text-[rgba(183,228,199,0.55)]">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">

        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.12),transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">

          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <EcosparkLogo size={32} />
            <span className="font-serif text-[1.2rem] font-bold text-white">
              Eco<span className="text-[#74c69d]">spark</span>
            </span>
          </div>

          <div className="mb-10">
            <h1 className="font-serif text-[2.25rem] font-black text-white tracking-[-0.025em] leading-none mb-2">
              Create account
            </h1>
            <p className="text-[rgba(183,228,199,0.45)] text-[0.9rem]">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#74c69d] font-semibold hover:text-[#95d5b2] transition-colors duration-200"
                style={{ textDecoration: 'none' }}
              >
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <label className="block text-[0.8rem] font-semibold text-[rgba(183,228,199,0.6)]">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                onFocus={() => setFocused('fullName')}
                onBlur={() => setFocused(null)}
                placeholder="John Doe"
                required
                className={[
                  'w-full py-4 px-5 rounded-2xl text-white text-[0.95rem] placeholder-[rgba(183,228,199,0.2)]',
                  'bg-[rgba(13,35,24,0.7)] border outline-none transition-all duration-200',
                  focused === 'fullName'
                    ? 'border-[rgba(82,183,136,0.6)] shadow-[0_0_0_4px_rgba(82,183,136,0.07),0_0_20px_rgba(82,183,136,0.1)]'
                    : 'border-[rgba(82,183,136,0.15)] hover:border-[rgba(82,183,136,0.3)]',
                ].join(' ')}
              />
            </div>

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

            <div className="space-y-1.5">
              <label className="block text-[0.8rem] font-semibold text-[rgba(183,228,199,0.6)]">
                Password
              </label>
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
                  'w-full py-4 px-5 rounded-2xl text-white text-[0.95rem] placeholder-[rgba(183,228,199,0.2)]',
                  'bg-[rgba(13,35,24,0.7)] border outline-none transition-all duration-200',
                  focused === 'password'
                    ? 'border-[rgba(82,183,136,0.6)] shadow-[0_0_0_4px_rgba(82,183,136,0.07),0_0_20px_rgba(82,183,136,0.1)]'
                    : 'border-[rgba(82,183,136,0.15)] hover:border-[rgba(82,183,136,0.3)]',
                ].join(' ')}
              />
              <p className="text-[0.75rem] text-[rgba(183,228,199,0.3)] pl-1">
                Must be at least 6 characters
              </p>
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
                  Creating account…
                </>
              ) : (
                <>
                  Get started
                  <ArrowRight size={17} strokeWidth={2.5} />
                </>
              )}
            </button>

            <p className="text-center text-[0.72rem] text-[rgba(183,228,199,0.25)] leading-relaxed">
              By signing up you agree to our{' '}
              <Link href="/privacy" className="text-[rgba(116,198,157,0.5)] hover:text-[#74c69d] transition-colors duration-200" style={{ textDecoration: 'none' }}>
                Privacy Policy
              </Link>
            </p>
          </form>

          {/* Bottom tag */}
          <div className="flex items-center justify-center gap-1.5 mt-10 text-[0.7rem] text-[rgba(183,228,199,0.2)] tracking-[0.1em] uppercase">
            <Leaf size={10} className="text-[rgba(82,183,136,0.3)]" />
            Sustainable Agriculture · Nepal
          </div>
        </div>
      </div>
    </div>
  );
}
