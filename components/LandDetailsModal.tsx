'use client';

import { X, MapPin, Users, Leaf, TrendingUp, Droplets, User as UserIcon, Sprout } from 'lucide-react';
import { useState } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase-auth';

interface LandDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plot: any;
  onClaimClick?: (plot: any) => void;
}

export default function LandDetailsModal({ isOpen, onClose, plot, onClaimClick }: LandDetailsModalProps) {
  const [isJoining, setIsJoining] = useState(false);

  if (!isOpen || !plot) return null;

  const handleActionClick = async () => {
    const user = await getCurrentUser();

    if (!user) {
      alert('Please sign in to continue');
      window.location.href = '/login';
      return;
    }

    if (plot.status === 'Available') {
      // For available plots, open the claim modal with photo upload
      onClose();
      if (onClaimClick) {
        onClaimClick(plot);
      }
    } else {
      // For in-progress plots, join the project
      setIsJoining(true);
      try {
        // First check if user has already joined
        const { data: existingParticipant } = await supabase
          .from('land_participants')
          .select('id')
          .eq('land_plot_id', plot.id)
          .eq('user_id', user.id)
          .single();

        if (existingParticipant) {
          alert('You have already joined this project!');
          setIsJoining(false);
          return;
        }

        // Insert new participant
        const { error } = await supabase
          .from('land_participants')
          .insert({
            land_plot_id: plot.id,
            user_id: user.id,
            user_email: user.email,
            joined_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error joining project:', error?.message || error);

          // Check for specific error types
          if (error.code === '23505') {
            // Unique constraint violation - already joined (shouldn't happen due to check above)
            alert('You have already joined this project!');
          } else if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
            alert('The land participants system is not yet set up. Please contact support.');
          } else {
            alert(`Failed to join project: ${error.message || 'Please try again.'}`);
          }
        } else {
          alert('Successfully joined the project! You can now collaborate with other farmers.');
          onClose();
        }
      } catch (err: any) {
        console.error('Unexpected error:', err?.message || err);
        alert('An unexpected error occurred. Please try again.');
      } finally {
        setIsJoining(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(4,13,7,0.95)] backdrop-blur-lg z-[99999] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl bg-gradient-to-br from-[rgba(13,35,24,0.98)] to-[rgba(7,21,16,0.99)] border border-[rgba(82,183,136,0.25)] rounded-3xl p-6 max-h-[85vh] overflow-y-auto shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.5)] to-transparent" />

        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <p className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-[#52b788] mb-1.5">Land Revival Plot</p>
            <h2 className="font-serif text-[1.6rem] font-black text-white tracking-[-0.02em] leading-tight">{plot.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(82,183,136,0.25)] bg-[rgba(45,106,79,0.2)] text-[rgba(183,228,199,0.7)] hover:text-white hover:bg-[rgba(45,106,79,0.4)] hover:border-[rgba(82,183,136,0.4)] transition-all duration-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative h-52 overflow-hidden rounded-2xl mb-5">
          <img src={plot.image} alt={plot.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,13,7,0.7)] to-transparent" />

          <div className={[
            'absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.75rem] font-bold tracking-[0.08em] uppercase backdrop-blur-md border',
            plot.status === 'Available'
              ? 'bg-[rgba(4,13,7,0.85)] border-[rgba(82,183,136,0.4)] text-[#74c69d]'
              : 'bg-[rgba(4,13,7,0.85)] border-[rgba(212,168,83,0.4)] text-[#d4a853]',
          ].join(' ')}>
            <span className={['w-1.5 h-1.5 rounded-full animate-pulse', plot.status === 'Available' ? 'bg-[#74c69d]' : 'bg-[#d4a853]'].join(' ')} />
            {plot.status}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[0.7rem] font-bold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.45)] mb-2">Description</p>
            <p className="text-[0.95rem] text-[rgba(183,228,199,0.75)] leading-relaxed">{plot.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)] mb-1">Plot Size</p>
              <p className="text-[1.1rem] font-black text-white">{plot.size}</p>
            </div>
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)] mb-1">Location</p>
              <p className="text-[0.95rem] font-bold text-white">{plot.location}</p>
            </div>
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)] mb-1">Soil Type</p>
              <p className="text-[0.95rem] font-bold text-white">{plot.soilType}</p>
            </div>
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)] mb-1">Water Access</p>
              <p className="text-[0.95rem] font-bold text-white">{plot.waterAccess ? '✓ Available' : '✗ Not available'}</p>
            </div>
          </div>

          <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <UserIcon size={14} className="text-[#52b788]" />
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)]">Land Owner</p>
            </div>
            <p className="text-[0.95rem] font-bold text-white">{plot.ownerName}</p>
          </div>

          {plot.aiRecommendation && (
            <div className="bg-gradient-to-br from-[rgba(45,106,79,0.25)] to-[rgba(64,145,108,0.15)] border border-[rgba(82,183,136,0.25)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Leaf size={15} className="text-[#74c69d]" />
                <span className="text-[0.72rem] font-bold tracking-[0.1em] uppercase text-[#74c69d]">AI Crop Recommendation</span>
              </div>
              <p className="font-serif text-[1.15rem] font-bold text-white mb-2">{plot.aiRecommendation.crop}</p>
              <p className="text-[0.875rem] text-[rgba(183,228,199,0.65)] mb-3 leading-relaxed">{plot.aiRecommendation.reason}</p>
              <div className="flex items-center gap-2 text-[0.85rem] text-[#74c69d]">
                <TrendingUp size={13} />
                <span>{plot.aiRecommendation.benefit}</span>
              </div>
              <div className="mt-2 text-[0.8rem] text-[rgba(183,228,199,0.5)]">
                Best Season: <span className="text-[#74c69d] font-semibold">{plot.aiRecommendation.season}</span>
              </div>
            </div>
          )}

          {plot.progress > 0 && (
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-4">
              <div className="flex justify-between text-[0.78rem] mb-2.5">
                <span className="text-[rgba(183,228,199,0.5)] font-medium tracking-wide uppercase">Restoration Progress</span>
                <span className="font-bold text-[#74c69d]">{plot.progress}%</span>
              </div>
              <div className="w-full bg-[rgba(5,18,10,0.9)] rounded-full h-2 border border-[rgba(82,183,136,0.15)]">
                <div className="bg-gradient-to-r from-[#40916c] to-[#74c69d] h-2 rounded-full shadow-[0_0_10px_rgba(116,198,157,0.5)]" style={{ width: `${plot.progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-5 text-[0.875rem] text-[rgba(183,228,199,0.6)]">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-[#52b788]" />
              <span>{plot.participants} farmers joined</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets size={15} className="text-[#52b788]" />
              <span>{plot.waterAccess ? 'Water available' : 'No water'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[rgba(82,183,136,0.15)] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-[rgba(82,183,136,0.2)] bg-[rgba(13,35,24,0.6)] text-[rgba(183,228,199,0.7)] text-[0.85rem] font-semibold hover:bg-[rgba(13,35,24,0.9)] hover:text-white hover:border-[rgba(82,183,136,0.35)] transition-all duration-200"
          >
            Close
          </button>
          <button
            onClick={handleActionClick}
            disabled={isJoining}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] text-[0.85rem] font-bold tracking-[0.04em] uppercase shadow-[0_0_20px_rgba(116,198,157,0.3)] hover:shadow-[0_0_32px_rgba(116,198,157,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isJoining ? (
              'Joining...'
            ) : (
              <>
                <Sprout size={15} />
                {plot.status === 'Available' ? 'Claim Plot' : 'Join Project'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
