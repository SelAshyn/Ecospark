'use client';

import { X, Calendar, Droplets, User as UserIcon, Sprout, Target, Users } from 'lucide-react';

interface PlotDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plot: any;
  type: 'claimed' | 'joined';
}

export default function MyFlexPlotDetailsModal({ isOpen, onClose, plot, type }: PlotDetailsModalProps) {
  if (!isOpen || !plot) return null;

  const plotDetails = {
    id: plot.land_plot_id,
    title: plot.mission_title || `Land Plot #${plot.land_plot_id}`,
    location: 'Kathmandu Valley',
    size: '500 m²',
    description: plot.mission_description || 'Land restoration project',
    ownerName: type === 'claimed' ? 'You' : 'Project Owner',
    soilType: 'Loamy',
    waterAccess: true,
    beforeImage: plot.before_photo_url,
    afterImage: plot.after_photo_url,
    claimedAt: plot.claimed_at,
    participants: 0,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-[rgba(4,13,7,0.95)] backdrop-blur-lg z-[99999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-3xl bg-gradient-to-br from-[rgba(13,35,24,0.98)] to-[rgba(7,21,16,0.99)] border border-[rgba(82,183,136,0.25)] rounded-3xl p-6 max-h-[90vh] overflow-y-auto shadow-[0_32px_80px_rgba(0,0,0,0.8)]" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.5)] to-transparent" />
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {type === 'claimed' ? (
                <div className="px-2.5 py-1 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] border border-[rgba(255,255,255,0.2)] text-[0.65rem] font-bold text-white uppercase tracking-wider">Owner</div>
              ) : (
                <div className="px-2.5 py-1 rounded-full bg-gradient-to-br from-[#95d5b2] to-[#d4a853] border border-[rgba(255,255,255,0.2)] text-[0.65rem] font-bold text-[#040d07] uppercase tracking-wider">Participant</div>
              )}
              <p className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-[#52b788]">{type === 'claimed' ? 'Your Claimed Plot' : 'Joined Project'}</p>
            </div>
            <h2 className="font-serif text-[1.6rem] font-black text-white tracking-[-0.02em] leading-tight">{plotDetails.title}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(82,183,136,0.25)] bg-[rgba(45,106,79,0.2)] text-[rgba(183,228,199,0.7)] hover:text-white hover:bg-[rgba(45,106,79,0.4)] transition-all duration-200"><X size={16} /></button>
        </div>
        <div className="relative h-64 overflow-hidden rounded-2xl mb-5">
          <div className="grid grid-cols-2 gap-2 h-full">
            <div className="relative">
              <img src={plotDetails.beforeImage} alt="Before" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,13,7,0.7)] to-transparent" />
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-[rgba(4,13,7,0.9)] border border-[rgba(116,198,157,0.4)] text-[0.75rem] font-bold text-[#74c69d] uppercase tracking-wider">Before</div>
            </div>
            <div className="relative">
              <img src={plotDetails.afterImage} alt="After" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,13,7,0.7)] to-transparent" />
              <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[rgba(4,13,7,0.9)] border border-[rgba(116,198,157,0.4)] text-[0.75rem] font-bold text-[#74c69d] uppercase tracking-wider">After</div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {plotDetails.description && (
            <div>
              <p className="text-[0.7rem] font-bold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.45)] mb-2">Mission Description</p>
              <p className="text-[0.95rem] text-[rgba(183,228,199,0.75)] leading-relaxed">{plotDetails.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)] mb-1">Plot ID</p>
              <p className="text-[1.1rem] font-black text-white">#{plotDetails.id}</p>
            </div>
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)] mb-1">Plot Size</p>
              <p className="text-[1.1rem] font-black text-white">{plotDetails.size}</p>
            </div>
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)] mb-1">Location</p>
              <p className="text-[0.95rem] font-bold text-white">{plotDetails.location}</p>
            </div>
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)] mb-1">Soil Type</p>
              <p className="text-[0.95rem] font-bold text-white">{plotDetails.soilType}</p>
            </div>
          </div>
          <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-[#52b788]" />
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)]">{type === 'claimed' ? 'Claimed On' : 'Joined On'}</p>
            </div>
            <p className="text-[0.95rem] font-bold text-white">{formatDate(plotDetails.claimedAt)}</p>
          </div>
          <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <UserIcon size={14} className="text-[#52b788]" />
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)]">{type === 'claimed' ? 'Project Owner' : 'Your Role'}</p>
            </div>
            <p className="text-[0.95rem] font-bold text-white">{type === 'claimed' ? plotDetails.ownerName : 'Participant'}</p>
          </div>
          <div className="flex items-center gap-5 text-[0.875rem] text-[rgba(183,228,199,0.6)]">
            <div className="flex items-center gap-2"><Droplets size={15} className="text-[#52b788]" /><span>{plotDetails.waterAccess ? 'Water available' : 'No water'}</span></div>
            {type === 'claimed' && (<div className="flex items-center gap-2"><Users size={15} className="text-[#52b788]" /><span>{plotDetails.participants} participants</span></div>)}
          </div>
          <div className={type === 'claimed' ? 'bg-gradient-to-r from-[rgba(64,145,108,0.15)] to-[rgba(116,198,157,0.1)] border-[rgba(116,198,157,0.3)] border rounded-xl p-4' : 'bg-gradient-to-r from-[rgba(149,213,178,0.15)] to-[rgba(212,168,83,0.1)] border-[rgba(149,213,178,0.3)] border rounded-xl p-4'}>
            <div className="flex items-start gap-3">
              <div className={type === 'claimed' ? 'p-2 rounded-lg border bg-[rgba(116,198,157,0.2)] border-[rgba(116,198,157,0.3)]' : 'p-2 rounded-lg border bg-[rgba(149,213,178,0.2)] border-[rgba(149,213,178,0.3)]'}>
                {type === 'claimed' ? (<Sprout size={20} className="text-[#74c69d]" />) : (<Target size={20} className="text-[#95d5b2]" />)}
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{type === 'claimed' ? 'You Own This Plot' : 'You are Contributing'}</h3>
                <p className="text-[0.85rem] text-[rgba(183,228,199,0.6)]">{type === 'claimed' ? 'You are responsible for leading this land restoration mission. You can invite others to join and collaborate.' : 'You are participating in this land restoration project. Work together with the owner and other participants to restore this land.'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-5 border-t border-[rgba(82,183,136,0.15)]">
          <button onClick={onClose} className="w-full py-2.5 rounded-full border border-[rgba(82,183,136,0.2)] bg-[rgba(13,35,24,0.6)] text-[rgba(183,228,199,0.7)] text-[0.85rem] font-semibold hover:bg-[rgba(13,35,24,0.9)] hover:text-white transition-all duration-200">Close</button>
        </div>
      </div>
    </div>
  );
}
