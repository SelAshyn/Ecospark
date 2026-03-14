'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, MapPin, Phone, Mail, Save, AlertCircle, CheckCircle, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase-auth';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    bio: '',
    avatar_url: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    document.title = 'Ecospark | Profile';

    window.scrollTo(0, 0);

    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      offset: 120,
    });

    checkUserAndLoadProfile();
  }, []);

  const checkUserAndLoadProfile = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = await getCurrentUser();
    console.log('Current user:', currentUser); // Debug log

    if (!currentUser) {
      console.log('No user found, redirecting to login'); // Debug log
      router.push('/login?from=profile');
      return;
    }

    setUser(currentUser);
    await loadUserProfile(currentUser.id);
  };

  const loadUserProfile = async (userId: string) => {
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login?from=profile');
        return;
      }

      const authUser = session.user;

      setFormData({
        fullName: profile?.full_name || authUser?.user_metadata?.full_name || '',
        email: authUser?.email || '',
        phone: profile?.phone || '',
        address: profile?.address || '',
        city: profile?.city || '',
        country: profile?.country || '',
        bio: profile?.bio || '',
        avatar_url: profile?.avatar_url || authUser?.user_metadata?.avatar_url || '',
      });

      if (profile?.avatar_url) {
        setAvatarPreview(profile.avatar_url);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      router.push('/login?from=profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 2MB' });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' });
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    setUploadingAvatar(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Storage bucket not configured. Please run the supabase-storage-setup.sql migration in your Supabase dashboard.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      throw error;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (!user) throw new Error('No user found');

      console.log('Submitting profile update for user:', user.id); // Debug

      let avatarUrl = formData.avatar_url;
      if (avatarFile) {
        console.log('Uploading avatar...'); // Debug
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
          console.log('Avatar uploaded:', avatarUrl); // Debug
        }
      }

      console.log('Updating auth metadata...'); // Debug
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          avatar_url: avatarUrl,
        },
      });

      if (authError) {
        console.error('Auth update error:', authError); // Debug
        throw authError;
      }

      console.log('Upserting profile data...'); // Debug
      const profileData = {
        id: user.id,
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        bio: formData.bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };
      console.log('Profile data:', profileData); // Debug

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (profileError) {
        console.error('Profile upsert error:', profileError); // Debug
        throw profileError;
      }

      console.log('Profile updated successfully!'); // Debug
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setAvatarFile(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (name: string) => [
    'w-full py-3.5 px-5 rounded-2xl text-white text-[0.95rem] placeholder-[rgba(183,228,199,0.2)]',
    'bg-[rgba(13,35,24,0.7)] border outline-none transition-all duration-200',
    focused === name
      ? 'border-[rgba(82,183,136,0.6)] shadow-[0_0_0_4px_rgba(82,183,136,0.07)]'
      : 'border-[rgba(82,183,136,0.15)] hover:border-[rgba(82,183,136,0.3)]',
  ].join(' ');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040d07]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[rgba(82,183,136,0.2)] border-t-[#74c69d] animate-spin" />
            <p className="text-[rgba(183,228,199,0.5)] text-sm">Loading profile...</p>
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-12" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.3)] px-4 py-1.5 rounded-full text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-[#95d5b2] mb-5">
              <User size={12} />
              Your Profile
            </div>
            <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-black text-white leading-none tracking-[-0.02em] mb-4">
              Edit{' '}
              <em className="not-italic bg-gradient-to-br from-[#74c69d] via-[#52b788] to-[#d4a853] bg-clip-text text-transparent">
                Profile
              </em>
            </h1>
            <p className="text-lg text-[rgba(183,228,199,0.6)] max-w-2xl leading-relaxed">
              Update your personal information and preferences.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.15)] rounded-3xl p-8" data-aos="fade-up" data-aos-delay="100">
            {message && (
              <div className={[
                'flex items-center gap-3 p-4 rounded-xl mb-6',
                message.type === 'success'
                  ? 'bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.3)] text-[#95d5b2]'
                  : 'bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#fca5a5]',
              ].join(' ')}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="text-[0.9rem] font-medium">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#40916c] to-[#74c69d] flex items-center justify-center shadow-[0_0_30px_rgba(116,198,157,0.3)] border-4 border-[rgba(82,183,136,0.2)]">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-[#040d07]" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform duration-200 border-2 border-[#040d07]">
                    <Camera size={18} className="text-[#040d07]" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[0.75rem] text-[rgba(183,228,199,0.4)] mt-3 text-center">
                  Click the camera icon to upload a new profile picture<br />
                  (Max 2MB, JPG/PNG)
                </p>
              </div>

              <div>
                <label className="block text-[0.85rem] font-semibold text-[rgba(183,228,199,0.7)] mb-2 tracking-[0.02em] uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onFocus={() => setFocused('fullName')}
                  onBlur={() => setFocused(null)}
                  className={inputClass('fullName')}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-[0.85rem] font-semibold text-[rgba(183,228,199,0.7)] mb-2 tracking-[0.02em] uppercase">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className={inputClass('email') + ' opacity-60 cursor-not-allowed'}
                  disabled
                />
                <p className="text-[0.75rem] text-[rgba(183,228,199,0.4)] mt-1.5">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-[0.85rem] font-semibold text-[rgba(183,228,199,0.7)] mb-2 tracking-[0.02em] uppercase">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocused('phone')}
                  onBlur={() => setFocused(null)}
                  className={inputClass('phone')}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-[0.85rem] font-semibold text-[rgba(183,228,199,0.7)] mb-2 tracking-[0.02em] uppercase">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onFocus={() => setFocused('address')}
                  onBlur={() => setFocused(null)}
                  className={inputClass('address')}
                  placeholder="Enter your address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[0.85rem] font-semibold text-[rgba(183,228,199,0.7)] mb-2 tracking-[0.02em] uppercase">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    onFocus={() => setFocused('city')}
                    onBlur={() => setFocused(null)}
                    className={inputClass('city')}
                    placeholder="Enter your city"
                  />
                </div>

                <div>
                  <label className="block text-[0.85rem] font-semibold text-[rgba(183,228,199,0.7)] mb-2 tracking-[0.02em] uppercase">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    onFocus={() => setFocused('country')}
                    onBlur={() => setFocused(null)}
                    className={inputClass('country')}
                    placeholder="Enter your country"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.85rem] font-semibold text-[rgba(183,228,199,0.7)] mb-2 tracking-[0.02em] uppercase">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  onFocus={() => setFocused('bio')}
                  onBlur={() => setFocused(null)}
                  className={inputClass('bio') + ' min-h-[120px] resize-none'}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving || uploadingAvatar}
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] text-[0.95rem] font-bold tracking-[0.02em] uppercase shadow-[0_0_22px_rgba(116,198,157,0.35)] hover:scale-[1.02] hover:shadow-[0_0_38px_rgba(116,198,157,0.55)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                >
                  {saving || uploadingAvatar ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-[#040d07] border-t-transparent animate-spin" />
                      {uploadingAvatar ? 'Uploading Image...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
