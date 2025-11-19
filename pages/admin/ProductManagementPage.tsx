import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { Product, Category, Brand, ProductSaveData } from '../../types';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import ProductFormModal from '../../components/admin/ProductFormModal';

interface ProductsByCategoryProps {
  category: Category;
  refreshTrigger: number;
  searchTerm: string;
  brandFilter: string;
  onEdit: (product: Product) => void;
}

const ProductsByCategory: React.FC<ProductsByCategoryProps> = ({ category, refreshTrigger, searchTerm, brandFilter, onEdit }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Product[]>(`/product/category/${category.id}`);
      setProducts(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error(`Failed to fetch products for ${category.name}`, error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category.id, category.name]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshTrigger]);

  const handleDelete = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/product/${productId}`);
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Failed to delete product', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const brandMatch = brandFilter ? product.brand_id.toString() === brandFilter : true;
    return searchMatch && brandMatch;
  });

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-blue-400">{category.name}</h2>
      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-400">No products in this category.</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-gray-400">No products match your filters in this category.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Price</th>
                <th scope="col" className="px-6 py-3">Stock</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-6 py-4">{product.id}</td>
                  <th scope="row" className="px-6 py-4 font-medium text-gray-100 whitespace-nowrap">{product.name}</th>
                  <td className="px-6 py-4">{parseFloat(product.price).toLocaleString('vi-VN')} ₫</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4 flex space-x-2">
                    <button onClick={() => onEdit(product)} className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ProductManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          api.get<Category[]>('/category'),
          api.get<Brand[]>('/brand')
        ]);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
        setBrands(Array.isArray(brandsRes) ? brandsRes : []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch page data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  const handleSaveProduct = async (productData: ProductSaveData, images: { image1: File | null; image2: File | null; image3: File | null }) => {
    try {
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('stock', productData.stock.toString());
      formData.append('brand_id', productData.brand_id.toString());
      formData.append('category_id', productData.category_id.toString());
      formData.append('attributes', JSON.stringify(productData.attributes));

      if (images.image1) formData.append('images', images.image1);
      if (images.image2) formData.append('images', images.image2);
      if (images.image3) formData.append('images', images.image3);

      if (productToEdit) {
        await api.put(`/product/${productToEdit.id}`, formData);
      } else {
        await api.post('/product', formData);
      }
      
      handleCloseModal();
      setRefreshTrigger(t => t + 1);
    } catch (err: any) {
      console.error("Failed to save product:", err);
      alert(`Failed to save product:\n${err.message || 'Server error'}`);
      throw err;
    }
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setBrandFilter('');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  const displayedCategories = categoryFilter
    ? categories.filter(c => c.id.toString() === categoryFilter)
    : categories;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <div className="flex items-center flex-wrap gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">All Brands</option>
                {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
            <button onClick={handleClearFilters} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">
              Clear Filters
            </button>
            <button onClick={handleOpenAddModal} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition-colors">
                <PlusCircle size={20} className="mr-2" /> Add Product
            </button>
        </div>
      </div>
      {displayedCategories.length > 0 ? (
        displayedCategories.map(category => (
          <ProductsByCategory 
            key={category.id} 
            category={category} 
            refreshTrigger={refreshTrigger} 
            searchTerm={searchTerm}
            brandFilter={brandFilter}
            onEdit={handleOpenEditModal}
          />
        ))
      ) : (
        <p>No categories found. Please add categories first.</p>
      )}

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        brands={brands}
        categories={categories}
        productToEdit={productToEdit}
      />
    </div>
  );
};

export default ProductManagementPage;