import React, { useState } from 'react';
import { 
  Palette, 
  Type, 
  Component, 
  Check, 
  ShieldCheck, 
  Disc, 
  Layers, 
  Search, 
  ArrowRight, 
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

export const DesignSystemView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'typography' | 'components' | 'principles'>('tokens');

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-xs">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Superbdeal Design System &bull; Clean White &amp; Slate Edition</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-heading">
            Design Tokens &amp; Component Architecture
          </h1>
          
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Engineered for precision B2B fleet logistics, instant quotation calculations, and Quezon City automotive service workflows. Built on a foundation of clean white canvases, soft slate structural neutrals, high-contrast readable typography, and cobalt blue clarity.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-200">
          {[
            { id: 'tokens', label: 'Color Tokens', icon: Palette },
            { id: 'typography', label: 'Typography Scale', icon: Type },
            { id: 'components', label: 'Component Library', icon: Component },
            { id: 'principles', label: 'Design Principles', icon: Layers },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: Color Tokens */}
      {activeTab === 'tokens' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Color Palette (60-30-10 Hierarchy)</h2>
            <p className="text-sm text-slate-600">
              Dimmed eye-comfort white theme: Soft matte slate canvas to eliminate eye strain and screen glare, crisp white/slate card surfaces, dark slate typography, and focused cobalt blue action points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Neutral */}
            <div className="bg-white border border-slate-300/80 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">60% Background Base</span>
                <span className="text-[11px] font-mono text-slate-400">Surface Neutrals</span>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-xl bg-[#edf0f5] border border-slate-300 flex items-center justify-between px-4 text-xs">
                  <span className="text-slate-700 font-medium">Eye-Safe Canvas (No Glare)</span>
                  <span className="font-mono text-slate-600">#EDF0F5</span>
                </div>
                <div className="h-16 rounded-xl bg-white border border-slate-300 flex items-center justify-between px-4 text-xs">
                  <span className="text-slate-700 font-medium">Card Surface</span>
                  <span className="font-mono text-slate-600">#FFFFFF</span>
                </div>
                <div className="h-16 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-between px-4 text-xs">
                  <span className="text-slate-700 font-medium">Slate 100 (Subtle Wells)</span>
                  <span className="font-mono text-slate-600">#F1F5F9</span>
                </div>
              </div>
            </div>

            {/* Accent Primary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">10% Strategic Accent</span>
                <span className="text-[11px] font-mono text-slate-400">Cobalt Blue Focus</span>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-xl bg-blue-600 flex items-center justify-between px-4 text-xs text-white">
                  <span className="font-semibold">Blue 600 (Primary CTAs)</span>
                  <span className="font-mono">#2563EB</span>
                </div>
                <div className="h-16 rounded-xl bg-blue-700 flex items-center justify-between px-4 text-xs text-white">
                  <span className="font-semibold">Blue 700 (Hover &amp; Focus)</span>
                  <span className="font-mono">#1D4ED8</span>
                </div>
                <div className="h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between px-4 text-xs text-blue-700">
                  <span className="font-medium">Blue 50 (Badges &amp; Tags)</span>
                  <span className="font-mono">#EFF6FF</span>
                </div>
              </div>
            </div>

            {/* Typography & Contrast */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">30% Typography Contrast</span>
                <span className="text-[11px] font-mono text-slate-400">Readable Text</span>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-xl bg-slate-900 flex items-center justify-between px-4 text-xs text-white">
                  <span className="font-bold">Slate 900 (Headings &amp; Values)</span>
                  <span className="font-mono font-semibold">#0F172A</span>
                </div>
                <div className="h-16 rounded-xl bg-slate-700 flex items-center justify-between px-4 text-xs text-white">
                  <span className="font-medium">Slate 700 (Body Primary)</span>
                  <span className="font-mono">#334155</span>
                </div>
                <div className="h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between px-4 text-xs text-slate-500">
                  <span className="font-medium">Slate 500 (Secondary / Labels)</span>
                  <span className="font-mono">#64748B</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Typography Scale */}
      {activeTab === 'typography' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Typography Hierarchy</h2>
            <p className="text-sm text-slate-500">
              Three-tiered font pairing: Plus Jakarta Sans for structural display headings, Inter for high-density UI text, and JetBrains Mono for spec codes and financial figures.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-blue-700 uppercase">H1 Display &bull; Plus Jakarta Sans (800)</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading mt-1">
                  Computerized 3D Wheel Alignment &amp; Fleet Tires
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">36px / 1.15</span>
            </div>

            <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-blue-700 uppercase">H2 Section Heading &bull; Plus Jakarta Sans (700)</span>
                <div className="text-2xl font-bold text-slate-900 font-heading mt-1">
                  Commercial Fleet Volume Discount Schedule
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">24px / 1.25</span>
            </div>

            <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-blue-700 uppercase">H3 Component Subtitle &bull; Plus Jakarta Sans (600)</span>
                <div className="text-lg font-semibold text-slate-900 font-heading mt-1">
                  MICHELIN Primacy SUV+ &bull; 265/65 R17 112H
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">18px / 1.35</span>
            </div>

            <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-blue-700 uppercase">Body UI &bull; Inter Regular (400/500)</span>
                <div className="text-sm text-slate-700 mt-1 max-w-2xl leading-relaxed">
                  Engineered with Michelin EverGrip compound technology offering class-leading wet braking distance, reduced road rolling resistance, and enhanced tread life for commercial utility vehicles.
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">14px / 1.6</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-blue-700 uppercase">Numeric &amp; Spec Data &bull; JetBrains Mono (700)</span>
                <div className="font-mono text-xl font-bold text-blue-700 mt-1">
                  ₱11,450.00 &bull; 265/65 R17 112H &bull; UTQG 420 A A
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">Tabular Numbers</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Component Library */}
      {activeTab === 'components' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Reusable Component Primitives</h2>
            <p className="text-sm text-slate-500">
              Interactive states, button variants, form fields, and status badges formatted with consistent padding and 48px touch targets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buttons */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900">Button Variants</h3>
              <div className="space-y-3">
                <button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs">
                  <span>Primary Blue CTA (h-12 / 48px)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="w-full h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold text-xs tracking-wide transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs">
                  <span>Secondary Slate Button</span>
                </button>
                <button className="w-full h-12 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 font-medium text-xs tracking-wide transition-all flex items-center justify-center space-x-2 cursor-pointer">
                  <span>Ghost / Tertiary Button</span>
                </button>
              </div>
            </div>

            {/* Badges & Status Indicators */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900">Status Badges</h3>
              <div className="flex flex-wrap gap-2.5">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Payment Verified</span>
                </span>

                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Pending Audit</span>
                </span>

                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <span>Rejected / Discrepancy</span>
                </span>

                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Info className="w-3.5 h-3.5" />
                  <span>Warehouse Pick &amp; Prep</span>
                </span>
              </div>

              {/* Form Input Sample */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Standardized 48px Input Field</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value="265/65 R17 &bull; Commercial Spec"
                    className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm text-slate-800 outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-4 top-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Principles */}
      {activeTab === 'principles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900">Modern Minimalism</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unnecessary borders, glowing drop shadows, and noisy visual gradients were eliminated. Crisp white and slate surfaces with optical hierarchy establish density without cognitive overload.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900">Sophisticated Color</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict 60-30-10 distribution utilizing clean slate foundations (#F8FAFC / #FFFFFF), readable dark slate typography (#0F172A / #334155), and cobalt blue (#2563EB) as the strategic focal point.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900">High Data Density</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              B2B fleet quotes, 12% BIR VAT breakdowns, tire load/speed indices, and shop bay status are organized with clear tabular alignment and monospaced figures.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
