'use client';

import { useState } from 'react';
import { X, Upload, Loader, Leaf, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase-auth';

interface UploadListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

const EMPTY_FORM = {
  title: '', description: '', category: 'waste', location: '', price: '',
};

export default function UploadListingModal({ isOpen, onClose, onSuccess, userId }: UploadListingModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [focused, setFocused] = useState<string | null>(null);

  if (!isOpen) return null;

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setAnalyzing(true);
    setError('');
    setAiAnalysis(null);
    try {
      const base64 = await fileToBase64(file);
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const analysis = await response.json();

      // Check if AI vision is not configured
      if (analysis.error === 'AI_VISION_NOT_CONFIGURED') {
        setError('⚠️ AI Vision Not Configured: Image validation is currently unavailable. The system cannot verify if images contain people or agricultural content. Please contact the administrator to integrate OpenAI GPT-4 Vision or Google Gemini Vision API. See AI-VISION-INTEGRATION.md for details.');
        setImage(null);
        setImagePreview('');
        setAiAnalysis(null);
        return;
      }

      if (!analysis.isValid) {
        setError(analysis.description || 'This image does not appear to be related to agriculture or farming.');
        setImage(null);
        setImagePreview('');
        setAiAnalysis(null);
      } else {
        setAiAnalysis(analysis);
      }
    } catch {
      setError('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !aiAnalysis?.isValid) { setError('Please upload a valid agricultural image'); return; }
    setLoading(true);
    setError('');
    try {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('listings').upload(fileName, image);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(fileName);
      const { error: insertError } = await supabase.from('listings').insert({
        user_id: userId,
        title: form.title,
        description: form.description,
        category: form.category,
        listing_type: 'permanent',
        photo_url: publicUrl,
        location_name: form.location,
        price: form.price ? parseFloat(form.price) : null,
        sustainability_score: aiAnalysis.sustainabilityScore,
        status: 'available',
      });
      if (insertError) throw insertError;
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (name: string) => [
    'w-full py-3.5 px-5 rounded-2xl text-white text-[0.9rem] placeholder-[rgba(183,228,199,0.2)]',
    'bg-[rgba(13,35,24,0.7)] border outline-none transition-all duration-200',
    focused === name
      ? 'border-[rgba(82,183,136,0.6)] shadow-[0_0_0_4px_rgba(82,183,136,0.07)]'
      : 'border-[rgba(82,183,136,0.15)] hover:border-[rgba(82,183,136,0.3)]',
  ].join(' ');

  return (
    <div className="fixed inset-0 bg-[rgba(4,13,7,0.95)] backdrop-blur-lg z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8">

        {/* Outer glow ring */}
        <div className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-[rgba(82,183,136,0.2)] via-transparent to-[rgba(45,106,79,0.15)] pointer-events-none" />

        <div className="relative bg-gradient-to-br from-[rgba(13,35,24,0.97)] to-[rgba(7,21,16,0.99)] border border-[rgba(82,183,136,0.18)] rounded-[26px] p-8 shadow-[0_32px_80px_rgba(0,0,0,0.7)]">

          {/* Top shimmer */}
          <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[rgba(116,198,157,0.4)] to-transparent rounded-full" />

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[0.72rem] font-bold tracking-[0.1em] uppercase text-[#52b788] mb-1">Share with community</p>
              <h2 className="font-serif text-[1.75rem] font-black text-white tracking-[-0.02em]">Upload Listing</h2>
              <p className="text-[0.875rem] text-[rgba(183,228,199,0.45)] mt-1">Share agricultural waste or tools with local farmers</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(82,183,136,0.2)] bg-[rgba(45,106,79,0.15)] text-[rgba(183,228,199,0.6)] hover:text-white hover:bg-[rgba(45,106,79,0.3)] transition-all duration-200 shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Image upload */}
            <div>
              <label className="block text-[0.78rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)] mb-2">
                Photo
              </label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" required />
              <label
                htmlFor="image-upload"
                className={[
                  'flex flex-col items-center justify-center w-full rounded-2xl border border-dashed cursor-pointer transition-all duration-200 overflow-hidden',
                  imagePreview ? 'border-[rgba(82,183,136,0.3)] h-52' : 'border-[rgba(82,183,136,0.2)] h-36 hover:border-[rgba(82,183,136,0.45)] hover:bg-[rgba(45,106,79,0.08)]',
                ].join(' ')}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2.5 p-6">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.2)] flex items-center justify-center">
                      <Upload size={22} className="text-[rgba(82,183,136,0.6)]" />
                    </div>
                    <div className="text-center">
                      <p className="text-[0.875rem] font-medium text-[rgba(183,228,199,0.55)]">Click to upload photo</p>
                      <p className="text-[0.75rem] text-[rgba(183,228,199,0.3)] mt-0.5">JPG, PNG, WEBP supported</p>
                    </div>
                  </div>
                )}
              </label>

              {/* AI analysis states */}
              {analyzing && (
                <div className="flex items-center gap-2.5 mt-3 px-4 py-3 bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.15)] rounded-xl">
                  <Loader size={15} className="text-[#74c69d] animate-spin shrink-0" />
                  <span className="text-[0.83rem] text-[rgba(183,228,199,0.6)]">Analyzing image with AI…</span>
                </div>
              )}

              {aiAnalysis && !analyzing && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-start gap-3 px-4 py-3 bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.2)] rounded-xl">
                    <CheckCircle size={15} className="text-[#74c69d] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[0.83rem] font-semibold text-[#74c69d]">Valid agricultural image detected</p>
                      <p className="text-[0.78rem] text-[rgba(183,228,199,0.45)] mt-0.5">
                        Category: <span className="text-[#95d5b2]">{aiAnalysis.category}</span>
                        {' · '}Sustainability score: <span className="text-[#95d5b2]">{aiAnalysis.sustainabilityScore}/10</span>
                      </p>
                    </div>
                  </div>
                  {aiAnalysis.warning && (
                    <div className="flex items-start gap-3 px-4 py-3 bg-[rgba(212,168,83,0.1)] border border-[rgba(212,168,83,0.25)] rounded-xl">
                      <AlertCircle size={15} className="text-[#d4a853] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[0.83rem] font-semibold text-[#d4a853]">Important Notice</p>
                        <p className="text-[0.78rem] text-[rgba(183,228,199,0.5)] mt-0.5">
                          {aiAnalysis.warning}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-[0.78rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)]">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                onFocus={() => setFocused('title')}
                onBlur={() => setFocused(null)}
                placeholder="e.g., Rice Husk — 50kg"
                required
                className={inputCls('title')}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-[0.78rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)]">Description</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                onFocus={() => setFocused('desc')}
                onBlur={() => setFocused(null)}
                placeholder="Describe the item, quantity, condition…"
                required
                rows={3}
                className={[inputCls('desc'), 'resize-none'].join(' ')}
              />
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="block text-[0.78rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)]">
                Price <span className="text-[rgba(183,228,199,0.3)] normal-case font-normal">(optional — leave empty if free)</span>
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[rgba(183,228,199,0.35)] text-[0.9rem] font-semibold pointer-events-none">NPR</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                  onFocus={() => setFocused('price')}
                  onBlur={() => setFocused(null)}
                  placeholder="0"
                  min="0"
                  step="1"
                  className={[inputCls('price'), 'pl-14'].join(' ')}
                />
              </div>
            </div>

            {/* Category + Location */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[0.78rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)]">Category</label>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  onFocus={() => setFocused('cat')}
                  onBlur={() => setFocused(null)}
                  className={inputCls('cat')}
                >
                  <option value="waste">Waste</option>
                  <option value="tools">Tools</option>
                  <option value="seeds">Seeds</option>
                  <option value="equipment">Equipment</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[0.78rem] font-semibold tracking-[0.06em] uppercase text-[rgba(183,228,199,0.55)]">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  onFocus={() => setFocused('loc')}
                  onBlur={() => setFocused(null)}
                  placeholder="e.g., Kathmandu"
                  required
                  className={inputCls('loc')}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-[rgba(239,68,68,0.07)] border border-[rgba(239,68,68,0.18)] text-[#fca5a5] px-4 py-3.5 rounded-2xl text-[0.85rem] leading-relaxed">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-full border border-[rgba(82,183,136,0.15)] bg-[rgba(13,35,24,0.5)] text-[rgba(183,228,199,0.6)] text-[0.875rem] font-semibold hover:bg-[rgba(13,35,24,0.8)] hover:text-white hover:border-[rgba(82,183,136,0.3)] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || analyzing || !aiAnalysis?.isValid}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] text-[0.875rem] font-bold tracking-[0.04em] uppercase shadow-[0_0_24px_rgba(116,198,157,0.3)] hover:shadow-[0_0_40px_rgba(116,198,157,0.5)] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_0_24px_rgba(116,198,157,0.3)] transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader size={15} className="animate-spin" />
                    Uploading…
                  </>
                ) : analyzing ? (
                  <>
                    <Loader size={15} className="animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    Create Listing
                    <ArrowRight size={15} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
