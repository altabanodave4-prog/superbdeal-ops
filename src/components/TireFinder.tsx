import React from 'react';
import { SlidersHorizontal, Car, Tag, RotateCcw, Check, Sparkles, ChevronDown } from 'lucide-react';
import { VEHICLE_DATABASE } from '../data';

export interface FilterState {
  width: string; // 'all' or number
  profile: string; // 'all' or number
  rim: string; // 'all' or string
  selectedMake: string;
  selectedModel: string;
  selectedBrands: string[];
  selectedTerrain: string;
}

interface TireFinderProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  matchCount: number;
  onReset: () => void;
}

export const TireFinder: React.FC<TireFinderProps> = ({
  filters,
  setFilters,
  matchCount,
  onReset,
}) => {
  const [activeTab, setActiveTab] = React.useState<'size' | 'vehicle' | 'brand'>('size');

  const widths = ['all', '185', '195', '205', '215', '225', '265'];
  const profiles = ['all', '45', '50', '55', '60', '65', '70'];
  const rims = ['all', 'R14', 'R15', 'R16', 'R17', 'R18'];
  const brands = ['Michelin', 'Bridgestone', 'Yokohama', 'Goodyear', 'Continental', 'Dunlop'];
  const terrains = [
    'All Terrains',
    'Touring',
    'Highway Terrain (HT)',
    'All-Terrain (AT)',
    'Performance'
  ];

  // Handle vehicle selection mapping
  const handleMakeChange = (make: string) => {
    if (make === 'all') {
      setFilters(prev => ({
        ...prev,
        selectedMake: 'all',
        selectedModel: 'all'
      }));
      return;
    }

    const availableModels = VEHICLE_DATABASE[make]?.models || [];
    const firstModel = availableModels[0] || 'all';
    
    // Auto-map first model size
    const mapping = VEHICLE_DATABASE[make]?.specMapping[firstModel];
    if (mapping) {
      setFilters(prev => ({
        ...prev,
        selectedMake: make,
        selectedModel: firstModel,
        width: String(mapping.width),
        profile: String(mapping.profile),
        rim: mapping.rim
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        selectedMake: make,
        selectedModel: firstModel
      }));
    }
  };

  const handleModelChange = (model: string) => {
    const mapping = VEHICLE_DATABASE[filters.selectedMake]?.specMapping[model];
    if (mapping) {
      setFilters(prev => ({
        ...prev,
        selectedModel: model,
        width: String(mapping.width),
        profile: String(mapping.profile),
        rim: mapping.rim
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        selectedModel: model
      }));
    }
  };

  const toggleBrand = (brand: string) => {
    setFilters(prev => {
      const exists = prev.selectedBrands.includes(brand);
      return {
        ...prev,
        selectedBrands: exists
          ? prev.selectedBrands.filter(b => b !== brand)
          : [...prev.selectedBrands, brand]
      };
    });
  };

  return (
    <div id="tire-finder-section" className="bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black mb-12 backdrop-blur-sm">
      {/* Header with Results Counter and Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <SlidersHorizontal className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Tire Specification &amp; Vehicle Finder
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Filter certified Quezon City warehouse stock by metric dimensions, OEM vehicle trim, or compound terrain.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-black/80 border border-zinc-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-xs font-mono font-semibold text-blue-400">
              {matchCount} {matchCount === 1 ? 'Tire Match' : 'Tires Available'}
            </span>
          </div>

          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-all cursor-pointer"
            title="Reset all search parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Modern Integrated Tabs */}
      <div className="flex items-center space-x-1.5 pt-6 pb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('size')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer shrink-0 ${
            activeTab === 'size'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-950/30'
              : 'bg-black/60 text-zinc-300 hover:bg-zinc-900 border border-zinc-850'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>By Metric Dimensions</span>
        </button>

        <button
          onClick={() => setActiveTab('vehicle')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer shrink-0 ${
            activeTab === 'vehicle'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-950/30'
              : 'bg-black/60 text-zinc-300 hover:bg-zinc-900 border border-zinc-850'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>By Vehicle Trim &amp; Make</span>
        </button>

        <button
          onClick={() => setActiveTab('brand')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer shrink-0 ${
            activeTab === 'brand'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-950/30'
              : 'bg-black/60 text-zinc-300 hover:bg-zinc-900 border border-zinc-850'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>By Brand &amp; Terrain</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'size' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 bg-black/60 p-5 sm:p-6 rounded-2xl border border-zinc-850">
          {/* Width */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Width (mm)
            </label>
            <div className="relative">
              <select
                value={filters.width}
                onChange={e => setFilters(prev => ({ ...prev, width: e.target.value }))}
                className="w-full h-12 bg-zinc-900 text-white font-mono text-sm rounded-xl border border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 outline-none appearance-none transition-all"
              >
                <option value="all">All Widths</option>
                {widths.filter(w => w !== 'all').map(w => (
                  <option key={w} value={w}>{w} mm</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5">Nominal section width in millimeters</p>
          </div>

          {/* Profile */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Aspect Ratio (%)
            </label>
            <div className="relative">
              <select
                value={filters.profile}
                onChange={e => setFilters(prev => ({ ...prev, profile: e.target.value }))}
                className="w-full h-12 bg-zinc-900 text-white font-mono text-sm rounded-xl border border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 outline-none appearance-none transition-all"
              >
                <option value="all">All Aspect Ratios</option>
                {profiles.filter(p => p !== 'all').map(p => (
                  <option key={p} value={p}>Series {p}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5">Sidewall height as % of width</p>
          </div>

          {/* Rim */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Rim Diameter (Inches)
            </label>
            <div className="relative">
              <select
                value={filters.rim}
                onChange={e => setFilters(prev => ({ ...prev, rim: e.target.value }))}
                className="w-full h-12 bg-zinc-900 text-white font-mono text-sm rounded-xl border border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 outline-none appearance-none transition-all"
              >
                <option value="all">All Rim Diameters</option>
                {rims.filter(r => r !== 'all').map(r => (
                  <option key={r} value={r}>{r} ({r.replace('R', '')} inch)</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5">Wheel bead diameter</p>
          </div>
        </div>
      )}

      {activeTab === 'vehicle' && (
        <div className="bg-black/60 p-5 sm:p-6 rounded-2xl border border-zinc-850 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Year Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Vehicle Model Year
              </label>
              <div className="relative">
                <select className="w-full h-12 bg-zinc-900 text-white font-mono text-sm rounded-xl border border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 outline-none appearance-none transition-all">
                  <option value="2026">2026 (Current Lineup)</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Make */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Vehicle Manufacturer
              </label>
              <div className="relative">
                <select
                  value={filters.selectedMake}
                  onChange={e => handleMakeChange(e.target.value)}
                  className="w-full h-12 bg-zinc-900 text-white text-sm font-medium rounded-xl border border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 outline-none appearance-none transition-all"
                >
                  <option value="all">Select Make</option>
                  {Object.keys(VEHICLE_DATABASE).map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Vehicle Model &amp; Trim
              </label>
              <div className="relative">
                <select
                  disabled={filters.selectedMake === 'all'}
                  value={filters.selectedModel}
                  onChange={e => handleModelChange(e.target.value)}
                  className="w-full h-12 bg-zinc-900 text-white text-sm font-medium rounded-xl border border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 outline-none appearance-none transition-all disabled:opacity-40"
                >
                  {filters.selectedMake === 'all' ? (
                    <option value="all">Choose Make First</option>
                  ) : (
                    (VEHICLE_DATABASE[filters.selectedMake]?.models || []).map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {filters.selectedMake !== 'all' && filters.selectedModel !== 'all' && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-300">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  Factory OEM Specification for <strong>{filters.selectedMake} {filters.selectedModel}</strong>:
                </span>
                <span className="font-mono font-bold px-2 py-0.5 rounded-lg bg-zinc-900 border border-blue-500/30 text-blue-300">
                  {filters.width}/{filters.profile} {filters.rim}
                </span>
              </div>
              <span className="text-zinc-400 text-[11px]">Size filters automatically applied below</span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'brand' && (
        <div className="bg-black/60 p-5 sm:p-6 rounded-2xl border border-zinc-850 space-y-6">
          {/* Brand Checkbox Chips */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">
              Certified Tire Brands
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {brands.map(brand => {
                const isChecked = filters.selectedBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-blue-500/15 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <span>{brand}</span>
                    {isChecked && <Check className="w-4 h-4 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Terrain Radios */}
          <div className="pt-5 border-t border-zinc-800/80">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">
              Terrain &amp; Tread Compound Application
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {terrains.map(terrain => {
                const isSelected = filters.selectedTerrain === terrain;
                return (
                  <div
                    key={terrain}
                    onClick={() => setFilters(prev => ({ ...prev, selectedTerrain: terrain }))}
                    className={`flex items-center space-x-2.5 p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-500/15 border-blue-500 text-blue-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-blue-400 bg-blue-500' : 'border-zinc-600'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                    <span className="font-medium">{terrain}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
