import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Product } from '../../types';
import ProductCard from '../../components/client/ProductCard';
import Spinner from '../../components/common/Spinner';
import HeroSlider from '../../components/client/HeroSlider';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        // The /product/featured endpoint seems to return incomplete product data (missing mainImage).
        // To fix this, we'll fetch from the main /product endpoint which is known to return full data,
        // and then take a slice of the results to feature on the homepage.
        const response = await api.get<any>('/product');
        
        // Handle both direct array response and { data: [...] } wrapped response
        const allProducts = Array.isArray(response) ? response : (response?.data && Array.isArray(response.data) ? response.data : []);

        // Take the first 8 products as "featured"
        setFeaturedProducts(allProducts.slice(0, 8));

      } catch (err: any) {
        setError(err.message || 'Failed to fetch featured products.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <div>
      <HeroSlider />
      
      <h2 className="text-3xl font-bold text-center mb-8 text-text-primary">Featured Products</h2>
      
      {loading && (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      )}
      
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && !error && featuredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && !error && featuredProducts.length === 0 && (
        <p className="text-center text-text-secondary">No featured products available at the moment.</p>
      )}
    </div>
  );
};

export default HomePage;