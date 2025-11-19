import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import { Product, Category, Brand } from '../../types';
import ProductCard from '../../components/client/ProductCard';
import Spinner from '../../components/common/Spinner';
import FilterSidebar from '../../components/client/FilterSidebar';
import { SlidersHorizontal } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // FIX: Use 'any' to handle inconsistent API responses (with or without 'data' wrapper).
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          api.get<any>('/product'),
          api.get<any>('/category'),
          api.get<any>('/brand'),
        ]);

        // FIX: Robustly extract array data, whether it's direct or wrapped in a 'data' property.
        const getArray = (res: any) => (Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []));

        setProducts(getArray(productsRes));
        setCategories(getArray(categoriesRes));
        setBrands(getArray(brandsRes));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch page data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const clearFilters = () => {
    setSearchTerm('');
    setBrandFilter('');
    setCategoryFilter('');
    setMinPrice('');
    setMaxPrice('');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const brandMatch = brandFilter ? product.brand_id.toString() === brandFilter : true;
      const categoryMatch = categoryFilter ? product.category_id.toString() === categoryFilter : true;
      const minPriceMatch = minPrice ? parseFloat(product.price) >= parseFloat(minPrice) : true;
      const maxPriceMatch = maxPrice ? parseFloat(product.price) <= parseFloat(maxPrice) : true;
      return searchMatch && brandMatch && categoryMatch && minPriceMatch && maxPriceMatch;
    });
  }, [products, searchTerm, brandFilter, categoryFilter, minPrice, maxPrice]);
  
  const productsByCategory = useMemo(() => {
    if (loading) return {};
    const grouped: { [key: string]: Product[] } = {};
    const visibleCategories = categoryFilter 
      ? categories.filter(c => c.id.toString() === categoryFilter) 
      : categories;

    if (!categoryFilter && (brandFilter || minPrice || maxPrice || searchTerm)) {
        // If filtering without a category, show all matching products under a generic title
        if (filteredProducts.length > 0) {
            grouped['Filtered Results'] = filteredProducts;
        }
    } else {
        // Group by category
        visibleCategories.forEach(category => {
          const categoryProducts = filteredProducts.filter(p => p.category_id === category.id);
          if (categoryProducts.length > 0) {
            grouped[category.name] = categoryProducts;
          }
        });
    }

    return grouped;
  }, [filteredProducts, categories, categoryFilter, brandFilter, minPrice, maxPrice, searchTerm, loading]);


  const filterSidebarProps = {
    categories,
    brands,
    searchTerm, setSearchTerm,
    categoryFilter, setCategoryFilter,
    brandFilter, setBrandFilter,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    clearFilters
  };

  return (
    <div>
        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
            <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 w-full justify-center px-4 py-2 bg-primary border border-border-color text-text-primary rounded-md shadow-sm font-semibold"
            >
                <SlidersHorizontal size={20} />
                Show Filters
            </button>
        </div>

        {/* Backdrop for mobile */}
        {isFilterOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsFilterOpen(false)}></div>}

        <div className="flex flex-col md:flex-row gap-8">
            {/* Desktop and Mobile Sliding Sidebar */}
            <FilterSidebar 
                {...filterSidebarProps}
                onClose={() => setIsFilterOpen(false)}
                className={`
                    md:w-1/4 md:relative md:translate-x-0 md:block
                    fixed top-0 left-0 h-full w-4/5 max-w-sm bg-primary z-50 transform transition-transform duration-300 ease-in-out
                    ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            />

            {/* Main Content */}
            <div className="md:w-3/4">
                {loading && (
                    <div className="flex justify-center items-center h-64"><Spinner /></div>
                )}
                
                {error && <p className="text-center text-red-500">{error}</p>}

                {!loading && !error && (
                    Object.keys(productsByCategory).length > 0 ? (
                    Object.entries(productsByCategory).map(([categoryName, productsInSection]: [string, Product[]]) => (
                        <div key={categoryName} className="mb-12">
                        <h2 className="text-3xl font-bold text-text-primary mb-6 border-b-2 border-accent pb-2">{categoryName}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {productsInSection.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                        </div>
                    ))
                    ) : (
                    <div className="text-center py-16 bg-primary rounded-lg border border-border-color">
                        <h3 className="text-xl font-semibold text-text-primary">No Products Found</h3>
                        <p className="text-text-secondary mt-2">Try adjusting your search or filters.</p>
                    </div>
                    )
                )}
            </div>
        </div>
    </div>
  );
};

export default ProductsPage;