import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePCBuild } from '../../contexts/PCBuildContext';
import { useCart } from '../../contexts/CartContext';
import { Product, PcBuild, Category } from '../../types';
import api, { API_HOST } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import ProductSelectionModal from '../../components/client/ProductSelectionModal';
import { Trash2, ShoppingCart, Loader } from 'lucide-react';

const PCBuildPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createBuild, updateBuild, getBuildById, loading: contextLoading } = usePCBuild();
  const { addToCart } = useCart();
  
  const isNewBuild = id === 'new';

  const [build, setBuild] = useState<PcBuild | null>(null);
  const [buildName, setBuildName] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<Record<number, Product | null>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategoryId, setModalCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch categories dynamically
        const categoriesRes = await api.get<any>('/category');
        const categoriesData = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes?.data && Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        setCategories(categoriesData);

        if (!isNewBuild && id) {
          const fetchedBuild = await getBuildById(Number(id));
          if (fetchedBuild) {
            setBuild(fetchedBuild);
            setBuildName(fetchedBuild.name);
            const initialComponents: Record<number, Product> = {};
            if (Array.isArray(fetchedBuild.PcBuildDetails)) {
              fetchedBuild.PcBuildDetails.forEach(detail => {
                if (detail.Product && detail.Product.category_id) {
                    initialComponents[detail.Product.category_id] = detail.Product;
                }
              });
            }
            setSelectedComponents(initialComponents);
          } else {
            setError('Build not found.');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isNewBuild, getBuildById]);

  const handleOpenModal = (categoryId: number) => {
    setModalCategoryId(categoryId);
    setIsModalOpen(true);
  };
  
  const handleSelectProduct = (product: Product) => {
    setSelectedComponents(prev => ({
      ...prev,
      [product.category_id]: product,
    }));
    setIsModalOpen(false);
  };

  const handleRemoveComponent = (categoryId: number) => {
      setSelectedComponents(prev => {
          const newState = {...prev};
          delete newState[categoryId];
          return newState;
      });
  }

  const handleSaveBuild = async () => {
    if (!buildName.trim()) {
        alert('Please enter a name for your build.');
        return;
    }

    const product_ids = Object.values(selectedComponents)
      .filter((p): p is Product => p !== null)
      .map(p => p.id);

    if (isNewBuild) {
      await createBuild(buildName, product_ids);
    } else if (build) {
      await updateBuild(build.id, buildName, product_ids);
    }
    navigate('/pcbuilds');
  };

  const handleAddAllToCart = async () => {
    const products = Object.values(selectedComponents).filter((p): p is Product => p !== null);
    
    if (products.length === 0) {
      alert("Please select at least one component to add to cart.");
      return;
    }

    setIsAddingToCart(true);
    try {
      // Adding sequentially to ensure order and avoid overwhelming the backend
      for (const product of products) {
        await addToCart(product.id, 1);
      }
      alert("All selected components have been added to your cart!");
    } catch (error) {
      console.error("Error adding components to cart", error);
      alert("Failed to add some components to the cart. Please check your cart.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const total = Object.values(selectedComponents)
    .filter((p): p is Product => p !== null)
    .reduce((acc, product) => acc + parseFloat(product.price), 0);

  if (loading) return <div className="flex justify-center items-center h-96"><Spinner /></div>;
  if (error) return <p className="text-center text-red-500 text-xl py-10">{error}</p>;

  return (
    <>
      <div className="bg-primary p-8 rounded-lg shadow-lg border border-border-color">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-border-color pb-6">
          <div>
             <h1 className="text-3xl font-bold text-text-primary">{isNewBuild ? 'Create New PC Build' : 'Edit PC Build'}</h1>
             <input
                type="text"
                value={buildName}
                onChange={e => setBuildName(e.target.value)}
                placeholder="My Awesome Build"
                className="text-xl mt-2 p-2 w-full md:w-96 bg-secondary border border-border-color rounded-md"
             />
          </div>
          <div className="text-right w-full md:w-auto">
             <p className="text-text-secondary">Estimated Total</p>
             <p className="text-3xl font-bold text-accent">{total.toLocaleString('vi-VN')} ₫</p>
          </div>
        </div>

        <div className="space-y-4">
            {categories.length === 0 ? (
                <p className="text-center text-text-secondary">No component categories found.</p>
            ) : (
                categories.map((category) => {
                    const selected = selectedComponents[category.id];
                    return (
                        <div key={category.id} className="flex items-center justify-between p-4 bg-secondary rounded-md">
                            <div className="flex items-center gap-4">
                                <div className="font-bold text-text-primary w-28 md:w-40 truncate" title={category.name}>{category.name}</div>
                                {selected ? (
                                    <>
                                        <img src={selected.mainImage ? `${API_HOST}${selected.mainImage}` : `https://via.placeholder.com/48x48.png/F9FAFB/6B7280?text=No+Image`} alt={selected.name} className="hidden sm:block w-12 h-12 object-contain bg-secondary rounded border border-border-color"/>
                                        <div className="overflow-hidden">
                                            <p className="font-semibold truncate">{selected.name}</p>
                                            <p className="text-sm text-accent">{parseFloat(selected.price).toLocaleString('vi-VN')} ₫</p>
                                        </div>
                                    </>
                                ) : (
                                   <p className="text-sm text-text-secondary italic">Not selected</p>
                                )}
                            </div>
                             <div className="flex items-center gap-2">
                               {selected && (
                                    <button onClick={() => handleRemoveComponent(category.id)} className="p-2 text-red-500 hover:bg-gray-200 rounded-full" title="Remove Component">
                                        <Trash2 size={18} />
                                    </button>
                               )}
                               <button onClick={() => handleOpenModal(category.id)} className="px-4 py-2 text-sm bg-primary border border-border-color text-text-primary rounded-md hover:bg-gray-100 whitespace-nowrap">
                                 {selected ? 'Change' : 'Choose'}
                               </button>
                             </div>
                        </div>
                    );
                })
            )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-border-color flex justify-end gap-4">
             <button
                onClick={handleAddAllToCart}
                disabled={isAddingToCart || contextLoading}
                className="flex items-center bg-white border border-accent text-accent font-semibold px-6 py-3 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isAddingToCart ? <Loader size={20} className="animate-spin mr-2" /> : <ShoppingCart size={20} className="mr-2" />}
                Add All to Cart
            </button>
            <button
                onClick={handleSaveBuild}
                disabled={contextLoading || isAddingToCart}
                className="bg-accent text-white font-semibold px-6 py-3 rounded-md hover:bg-highlight disabled:bg-gray-400"
            >
                {contextLoading ? 'Saving...' : 'Save Build'}
            </button>
        </div>
      </div>
      {modalCategoryId !== null && (
        <ProductSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectProduct={handleSelectProduct}
          categoryId={modalCategoryId}
        />
      )}
    </>
  );
};

export default PCBuildPage;