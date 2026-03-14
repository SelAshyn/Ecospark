'use client';

import { X, MapPin, Leaf, Star, User, TrendingUp, DollarSign } from 'lucide-react';

interface ResourceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: any;
}

export default function ResourceDetailsModal({ isOpen, onClose, resource }: ResourceDetailsModalProps) {
  if (!isOpen || !resource) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(4,13,7,0.95)] backdrop-blur-lg z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl bg-gradient-to-br from-[rgba(13,35,24,0.98)] to-[rgba(7,21,16,0.99)] border border-[rgba(82,183,136,0.25)] rounded-3xl p-6 max-h-[85vh] overflow-y-auto shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.5)] to-transparent" />

        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <p className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-[#52b788] mb-1.5">Resource Details</p>
            <h2 className="font-serif text-[1.6rem] font-black text-white tracking-[-0.02em] leading-tight">{resource.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(82,183,136,0.25)] bg-[rgba(45,106,79,0.2)] text-[rgba(183,228,199,0.7)] hover:text-white hover:bg-[rgba(45,106,79,0.4)] hover:border-[rgba(82,183,136,0.4)] transition-all duration-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-4">
            <p className="text-[0.7rem] font-bold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.45)] mb-2">Supplier</p>
            <p className="text-[1.15rem] font-bold text-white">{resource.supplier}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)] mb-1">Category</p>
              <p className="text-[0.95rem] font-bold text-white capitalize">{resource.category}</p>
            </div>
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-3.5">
              <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[rgba(183,228,199,0.4)] mb-1">Location</p>
              <p className="text-[0.95rem] font-bold text-white">{resource.location}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[rgba(45,106,79,0.25)] to-[rgba(64,145,108,0.15)] border border-[rgba(82,183,136,0.25)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={16} className="text-[#74c69d]" />
              <p className="text-[0.7rem] font-bold tracking-[0.1em] uppercase text-[#74c69d]">Price</p>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-serif text-[2.5rem] font-black bg-gradient-to-br from-[#95d5b2] to-[#74c69d] bg-clip-text text-transparent leading-none">
                NPR {resource.price}
              </span>
              <span className="text-[0.95rem] text-[rgba(183,228,199,0.6)]">{resource.unit}</span>
            </div>
            {resource.priceComparison < 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] text-[#74c69d] text-[0.8rem] font-bold">
                <TrendingUp size={12} />
                {Math.abs(resource.priceComparison)}% below market average
              </div>
            )}
          </div>

          {resource.isOrganic && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[rgba(45,106,79,0.25)] border border-[rgba(82,183,136,0.3)]">
              <Leaf size={18} className="text-[#74c69d]" />
              <span className="text-[0.95rem] font-bold text-[#74c69d]">Certified Organic Product</span>
            </div>
          )}

          {resource.co2Savings && (
            <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <Leaf size={14} className="text-[#74c69d]" />
                <span className="text-[0.7rem] font-bold tracking-[0.1em] uppercase text-[#74c69d]">
                  Sustainability Score: {resource.sustainabilityScore}/100
                </span>
              </div>
              <p className="text-[0.9rem] text-[rgba(183,228,199,0.7)] leading-relaxed">{resource.co2Savings}</p>
            </div>
          )}

          <div className="bg-[rgba(5,18,10,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-[#d4a853] fill-[#d4a853]" />
                <span className="text-[1.2rem] font-bold text-white">{resource.rating}</span>
                <span className="text-[0.9rem] text-[rgba(183,228,199,0.5)]">({resource.reviews} reviews)</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[0.875rem] text-[rgba(183,228,199,0.6)]">
              <User size={13} className="text-[#52b788]" />
              <span>Added by <span className="text-[#74c69d] font-semibold">{resource.addedBy}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[0.85rem] text-[rgba(183,228,199,0.5)]">
            <MapPin size={14} className="text-[#52b788]" />
            <span>Last updated: {resource.lastUpdated}</span>
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
            className="flex-1 py-2.5 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] text-[0.85rem] font-bold tracking-[0.04em] uppercase shadow-[0_0_20px_rgba(116,198,157,0.3)] hover:shadow-[0_0_32px_rgba(116,198,157,0.5)] transition-all duration-200"
          >
            Contact Supplier
          </button>
        </div>
      </div>
    </div>
  );
}

