import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { API_HOST } from '../../services/api';
import { Product, ProductAttributeValue } from '../../types';
import Spinner from '../../components/common/Spinner';
import { ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';


const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const inWishlist = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('No product ID provided.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await api.get<Product>(`/product/${id}`);
        setProduct(data);
        const placeholder = `https://via.placeholder.com/600x600.png/F9FAFB/6B7280?text=${encodeURIComponent(data.name)}`;
        setActiveImage(data.mainImage ? `${API_HOST}${data.mainImage}` : placeholder);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      addToCart(product.id, quantity);
    }
  };

  const handleAddToWishlist = () => {
    if(product) {
        if(!isAuthenticated) {
            navigate('/login');
            return;
        }
        addToWishlist(product.id);
    }
  }

  const getAttributeValue = (attrValue: ProductAttributeValue) => {
    if (attrValue.value_text) return attrValue.value_text;
    if (attrValue.value_number) return parseFloat(attrValue.value_number).toString();
    if (attrValue.value_boolean !== null) return attrValue.value_boolean ? 'Yes' : 'No';
    return 'N/A';
  }

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Spinner /></div>;
  }

  if (error) {
    return <p className="text-center text-red-500 text-xl py-10">{error}</p>;
  }

  if (!product) {
    return <p className="text-center text-text-secondary text-xl py-10">Product not found.</p>;
  }

  const images = (product.images as string[]).map(url => `${API_HOST}${url}`);
  const placeholder = `https://via.placeholder.com/600x600.png/F9FAFB/6B7280?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="bg-primary p-4 sm:p-8 rounded-lg shadow-lg border border-border-color">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-accent transition-colors gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-secondary rounded-lg mb-4 flex items-center justify-center border border-border-color">
             <img src={activeImage || placeholder} alt={product.name} className="w-full h-full object-contain rounded-lg"/>
          </div>
          {images.length > 0 && (
            <div className="flex space-x-2">
                {images.map((img, index) => (
                    <button key={index} onClick={() => setActiveImage(img)} className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${activeImage === img ? 'border-accent scale-105' : 'border-border-color hover:border-highlight'}`}>
                        <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover"/>
                    </button>
                ))}
            </div>
           )}
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">{product.name}</h1>
          <p className="text-3xl font-bold text-accent mt-4">{parseFloat(product.price).toLocaleString('vi-VN')} ₫</p>
          <div className={`mt-4 font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </div>
          
          <p className="text-text-secondary mt-4">{product.description}</p>
          
          <div className="flex items-center space-x-4 mt-6">
            <div className="flex items-center border border-border-color rounded-md">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-lg font-medium hover:bg-gray-100 transition-colors">-</button>
              <input type="text" value={quantity} readOnly className="w-12 text-center border-l border-r border-border-color py-2 bg-primary"/>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2 text-lg font-medium hover:bg-gray-100 transition-colors">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center bg-accent text-white px-6 py-3 rounded-md font-semibold hover:bg-highlight disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart className="mr-2" /> Add to Cart
            </button>
             <button onClick={handleAddToWishlist} className={`p-3 rounded-md border-2 transition-colors ${inWishlist ? 'text-red-500 border-red-300 bg-red-50' : 'text-text-secondary border-border-color hover:bg-gray-100'}`}>
                <Heart />
            </button>
          </div>

          {product.ProductAttributeValues && product.ProductAttributeValues.length > 0 && (
            <div className="mt-8 border-t border-border-color pt-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Specifications</h3>
              <ul className="space-y-2">
                {product.ProductAttributeValues.map((attrVal, index) => (
                  <li key={attrVal.id} className={`flex justify-between text-sm p-3 rounded-md ${index % 2 === 0 ? 'bg-secondary' : 'bg-primary'}`}>
                    <span className="font-medium text-text-secondary">{attrVal.ProductAttribute.name}</span>
                    <span className="text-text-primary font-semibold">
                        {getAttributeValue(attrVal)} {attrVal.ProductAttribute.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;