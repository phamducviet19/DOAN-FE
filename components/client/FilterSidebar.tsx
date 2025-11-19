import React from 'react';
import { Category, Brand } from '../../types';
import { Search, X } from 'lucide-react';

interface FilterSidebarProps {
  categories: Category[];
  brands: Brand[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  brandFilter: string;
  setBrandFilter: (value: string) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  clearFilters: () => void;
  className?: string; // For mobile responsive classes
  onClose?: () => void; // For mobile close button
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  brands,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  brandFilter,
  setBrandFilter,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  clearFilters,
  className,
  onClose
}) => {
  const baseInputClass = "w-full bg-secondary border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-highlight/50 focus:border-accent text-text-primary transition-all duration-200";

  return (
    <aside className={`bg-primary p-6 rounded-lg shadow-sm border border-border-color ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-text-primary">Filters</h2>
        {onClose && (
            <button onClick={onClose} className="md:hidden text-text-secondary hover:text-text-primary">
                <X size={24} />
            </button>
        )}
      </div>

      <div className="divide-y divide-border-color -mx-6 px-6">
        {/* Search */}
        <div className="pb-6">
          <label htmlFor="search-sidebar" className="sr-only">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            <input
              type="text"
              id="search-sidebar"
              placeholder="Search components..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`${baseInputClass} pl-10 py-2`}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="py-6">
          <h3 className="font-semibold text-text-primary mb-2">Category</h3>
          <select
            id="category"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className={`${baseInputClass} py-2`}
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        
        {/* Brands */}
        <div className="py-6">
          <h3 className="font-semibold text-text-primary mb-2">Brand</h3>
          <select
            id="brand"
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className={`${baseInputClass} py-2`}
          >
            <option value="">All Brands</option>
            {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
        </div>

        {/* Price Range */}
        <div className="py-6">
            <h3 className="font-semibold text-text-primary mb-2">Price Range</h3>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className={`${baseInputClass} text-center py-2`}
                    aria-label="Minimum price"
                />
                <span className="text-text-secondary">-</span>
                <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className={`${baseInputClass} text-center py-2`}
                    aria-label="Maximum price"
                />
            </div>
        </div>

        {/* Clear Filters */}
        <div className="pt-6">
            <button 
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-secondary border border-border-color text-text-primary rounded-md hover:bg-gray-200 transition-colors font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-highlight/50"
            >
                Clear All Filters
            </button>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;