import React from 'react';
import { Search, Wrench, ShieldCheck, Truck, Clock, Award, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  onFindTiresClick: () => void;
  onBookServiceClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onFindTiresClick,
  onBookServiceClick,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black border-b border-zinc-850 py-12 lg:py-16">
      {/* Background ambient lighting - electric blue and cool sky subtle glow */}
      <div className="absolute top-0 left-1/3 -translate-x-1/2 w-full max-w-5xl h-96 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-sky-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Main Headline & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              <span>Quezon City Central Hub &bull; Authorized Fleet &amp; Tire Center</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              ENGINEERED FOR THE ROAD.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-white">
                FITTED BY FLEET SPECIALISTS.
              </span>
            </h1>

            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              Quezon City&apos;s premier tire distributor and automotive service center. Live verified warehouse inventory, BIR-compliant B2B fleet quotations, and precision computerized 3D laser alignment in our high-capacity service bays.
            </p>

            {/* Redesigned CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={onFindTiresClick}
                className="flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm tracking-wide transition-all duration-200 shadow-md shadow-blue-950/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Find Tires by Size &amp; Vehicle</span>
              </button>

              <button
                onClick={onBookServiceClick}
                className="flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 font-semibold text-sm tracking-wide transition-all duration-200 cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-blue-400" />
                <span>Book Service Bay Slot</span>
              </button>
            </div>

            {/* Quick Specs Highlight */}
            <div className="flex items-center gap-6 pt-2 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>100% Genuine Certified Stock</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Official BIR Sales Invoice</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>30-Day Fleet Terms Available</span>
              </div>
            </div>
          </div>

          {/* Interactive Hero Widget / Promo Package (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-900/90 border border-zinc-800 hover:border-blue-500/40 rounded-2xl p-6 sm:p-7 shadow-xl shadow-black relative overflow-hidden backdrop-blur-sm transition-all">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Complimentary Installation Package
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  SAVE ₱1,600
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Buy 4 Tires = 100% Complimentary Shop Fitting
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-5">
                Every order of 4 tires unlocks full professional fitting and calibration at our Quezon City service bays:
              </p>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-zinc-850">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-xs font-medium text-zinc-200">Computerized 3D Wheel Alignment</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs line-through text-zinc-500 font-mono">₱800</span>
                    <span className="text-xs font-mono font-bold text-blue-400">FREE</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-zinc-850">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-xs font-medium text-zinc-200">High-Speed Wheel Balancing &amp; Weights</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs line-through text-zinc-500 font-mono">₱500</span>
                    <span className="text-xs font-mono font-bold text-blue-400">FREE</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-zinc-850">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-xs font-medium text-zinc-200">Tire Mounting &amp; High-Pressure Valves</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs line-through text-zinc-500 font-mono">₱300</span>
                    <span className="text-xs font-mono font-bold text-blue-400">FREE</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-zinc-850">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-xs font-medium text-zinc-200">10-Point Underchassis &amp; Brake Inspection</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-400">FREE</span>
                </div>
              </div>

              <div className="bg-black/80 rounded-xl p-3.5 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Package Labor Cost</div>
                  <div className="text-xs font-semibold text-zinc-200">With Any 4-Tire Purchase</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-mono font-bold text-blue-400">₱0.00 (Included)</div>
                  <div className="text-[10px] text-zinc-400">Automatic cart credit</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Trust Signals Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-850 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 flex items-center space-x-3.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-mono font-bold text-white">50,000+</div>
              <div className="text-xs text-zinc-400">Tires Delivered &amp; Installed</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 flex items-center space-x-3.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-mono font-bold text-white">100+</div>
              <div className="text-xs text-zinc-400">Active Commercial Fleets</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 flex items-center space-x-3.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-mono font-bold text-white">45-Minute</div>
              <div className="text-xs text-zinc-400">Express Bay Fitting</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 flex items-center space-x-3.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-mono font-bold text-white">Quezon City Hub</div>
              <div className="text-xs text-zinc-400">Certified Direct Distributor</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
