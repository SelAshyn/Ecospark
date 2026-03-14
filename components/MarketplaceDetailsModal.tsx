'use client';

import { X, MapPin, Clock, Leaf, Package, DollarSign, User } from 'lucide-react';

interface MarketplaceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
  onClaim: (listingId: string) => Promise<void>;
  isClaimLoading?: boolean;
}

export default function MarketplaceDetailsModal({ isOpen, onClose, listing, onClaim, isClaimLoading = false }: MarketplaceDetailsModalProps) {
  if (!isOpen || !listing) return null;

  const handleClaim = async () => {
    await onClaim(listing.id);
  };

  const getTimeAgo = (dateString: string) => {
    const diffInHours = Math.floor((Date.now() - new Date(dateString).getTime()) / 3600000);
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-[rgba(4,13,7,0.95)] backdrop-blur-lg z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl bg-gradient-to-br from-[rgba(13,35,24,0.98)] to-[rgba(7,21,16,0.99)] border border-[rgba(82,183,136,0.25)] rounded-3xl p-6 max-h-[85vh] overflow-y-auto shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.5)] to-transparent" />

        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <p className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-[#52b788] mb-1.5">Marketplace Listing</p>
            <h2 className="font-serif text-[1.6rem] font-black text-white tracking-[-0.02em] leading-tight">{listing.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(82,183,136,0.25)] bg-[rgba(45,106,79,0.2)] text-[rgba(183,228,199,0.7)] hover:text-white hover:bg-[rgba(45,106,79,0.4)] hover:border-[rgba(82,183,136,0.4)] transition-all duration-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative h-52 overflow-hidden rounded-2xl mb-5">
          {listing.photo_url ? (
            <img src={listing.photo_url} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full bg-[rgba(13,35,24,0.9)]">
              <Package size={56} className="text-[rgba(82,183,136,0.3)]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,13,7,0.7)] to-transparent" />

          {listing.sustainability_score && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[rgba(4,13,7,0.85)] border border-[rgba(82,183,136,0.35)] backdrop-blur-md px-3 py-1.5 rounded-full">
              <Leaf size={12} className="text-[#74c69d]" />
              <span className="text-[0.8rem] font-bold text-[#74c69d]">{listing.sustainability_score}/10</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[0.7rem] font-bold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.45)] mb-2">Description</p>
            <p className="text-[0.95rem] text-[rgba(183,228,199,0.75)] leading-relaxed">{listing.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)] mb-1">Category</p>
              <p className="text-[0.95rem] font-bold text-white capitalize">{listing.category}</p>
            </div>
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)] mb-1">Availability</p>
              <p className="text-[0.95rem] font-bold text-white capitalize">{listing.availability_type || 'Permanent'}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[rgba(45,106,79,0.25)] to-[rgba(64,145,108,0.15)] border border-[rgba(82,183,136,0.25)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-[#74c69d]" />
              <p className="text-[0.7rem] font-bold tracking-[0.1em] uppercase text-[#74c69d]">Price</p>
            </div>
            <p className="font-serif text-[2.5rem] font-black bg-gradient-to-br from-[#95d5b2] to-[#74c69d] bg-clip-text text-transparent leading-none">
              {listing.price && listing.price > 0 ? `NPR ${listing.price}` : 'Free'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-[0.875rem] text-[rgba(183,228,199,0.6)]">
              <MapPin size={15} className="text-[#52b788]" />
              <span>{listing.location_name}</span>
            </div>
            <div className="flex items-center gap-2 text-[0.875rem] text-[rgba(183,228,199,0.6)]">
              <Clock size={15} className="text-[#52b788]" />
              <span>{getTimeAgo(listing.created_at)}</span>
            </div>
          </div>

          {listing.status && (
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)] mb-1">Status</p>
              <p className="text-[0.95rem] font-bold text-[#74c69d] capitalize">{listing.status}</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-[rgba(82,183,136,0.15)] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-[rgba(82,183,136,0.2)] bg-[rgba(13,35,24,0.6)] text-[rgba(183,228,199,0.7)] text-[0.85rem] font-semibold hover:bg-[rgba(13,35,24,0.9)] hover:text-white hover:border-[rgba(82,183,136,0.35)] transition-all duration-200"
          >
            Close
          </button>
          <button
            onClick={handleClaim}
            disabled={isClaimLoading || listing.status === 'claimed'}
            className={`flex-1 py-2.5 rounded-full text-[0.85rem] font-bold tracking-[0.04em] uppercase transition-all duration-200 ${
              listing.status === 'claimed'
                ? 'bg-[rgba(82,183,136,0.2)] border border-[rgba(82,183,136,0.3)] text-[rgba(183,228,199,0.5)] cursor-not-allowed'
                : isClaimLoading
                ? 'bg-[rgba(45,106,79,0.4)] text-[rgba(183,228,199,0.6)] cursor-wait'
                : 'bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] shadow-[0_0_20px_rgba(116,198,157,0.3)] hover:shadow-[0_0_32px_rgba(116,198,157,0.5)]'
            }`}
          >
            {isClaimLoading ? 'Claiming...' : listing.status === 'claimed' ? 'Already Claimed' : 'Claim Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
