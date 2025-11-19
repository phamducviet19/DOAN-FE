import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../../types';
import api, { API_HOST } from '../../services/api';
import Spinner from '../common/Spinner';
import { X, Search } from 'lucide-react';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  categoryId: number;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({ isOpen, onClose, onSelectProduct, categoryId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && categoryId) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          // FIX: Fetch all products to ensure complete data (with mainImage), then filter.
          // The /product/category/:id endpoint may return incomplete data.
          const response = await api.get<any>('/product');
          const allProducts = Array.isArray(response) ? response : (response?.data && Array.isArray(response.data) ? response.data : []);
          
          const categoryProducts = allProducts.filter((p: Product) => p.category_id === categoryId);
          setProducts(categoryProducts);
        } catch (error) {
          console.error(`Failed to fetch products for category ${categoryId}`, error);
          setProducts([]);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [isOpen, categoryId]);
  
  const filteredProducts = useMemo(() => {
      return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-border-color flex-shrink-0">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search components..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-secondary border-border-color rounded-md pl-10 pr-4 py-2"
              />
            </div>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary" aria-label="Close modal">
                <X size={24} />
            </button>
        </div>
        <div className="overflow-y-auto p-4 flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-full"><Spinner /></div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="border border-border-color rounded-lg p-3 flex flex-col justify-between hover:border-accent hover:shadow-md transition-all cursor-pointer" onClick={() => onSelectProduct(product)}>
                    <div>
                        <img src={product.mainImage ? `${API_HOST}${product.mainImage}` : `https://via.placeholder.com/200x128.png/F9FAFB/6B7280?text=No+Image`} alt={product.name} className="w-full h-32 object-contain mb-2 bg-secondary rounded"/>
                        <p className="font-semibold text-sm truncate">{product.name}</p>
                    </div>
                    <p className="text-accent font-bold mt-2">{parseFloat(product.price).toLocaleString('vi-VN')} ₫</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-secondary py-10">No products found for this category.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;