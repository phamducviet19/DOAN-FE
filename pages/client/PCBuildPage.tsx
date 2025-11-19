import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePCBuild } from '../../contexts/PCBuildContext';
import { Product, PcBuild, Category } from '../../types';
import api, { API_HOST } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import ProductSelectionModal from '../../components/client/ProductSelectionModal';
import { PlusCircle, Trash2 } from 'lucide-react';

// A predefined structure for the PC build for a better, guided user experience.
// In a real-world app, this might come from the API.
const CORE_COMPONENTS = [
  { name: 'CPU', categoryId: 1 },
  { name: 'Motherboard', categoryId: 3 },
  { name: 'Memory (RAM)', categoryId: 9 },
  // Assuming IDs for other categories
  { name: 'Video Card (GPU)', categoryId: 4 },
  { name: 'Storage', categoryId: 5 },
  { name: 'Power Supply', categoryId: 8 },
  { name: 'Case', categoryId: 7 },
];

const PCBuildPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createBuild, updateBuild, getBuildById, loading: contextLoading } = usePCBuild();
  
  const isNewBuild = id === 'new';

  const [build, setBuild] = useState<PcBuild | null>(null);
  const [buildName, setBuildName] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<Record<number, Product | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategoryId, setModalCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const loadBuild = async () => {
      if (!isNewBuild && id) {
        setLoading(true);
        const fetchedBuild = await getBuildById(Number(id));
        if (fetchedBuild) {
          setBuild(fetchedBuild);
          setBuildName(fetchedBuild.name);
          const initialComponents: Record<number, Product> = {};
          // FIX: Check if PcBuildDetails is an array before iterating
          if (Array.isArray(fetchedBuild.PcBuildDetails)) {
            fetchedBuild.PcBuildDetails.forEach(detail => {
              initialComponents[detail.Product.category_id] = detail.Product;
            });
          }
          setSelectedComponents(initialComponents);
        } else {
          setError('Build not found.');
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    loadBuild();
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

    // FIX: Used a type guard to ensure TypeScript correctly infers the array type as Product[], not (Product | null)[].
    // This resolves the error where `p.id` could not be accessed on an `unknown` type.
    const product_ids = Object.values(selectedComponents).filter((p): p is Product => p !== null).map(p => p.id);

    if (isNewBuild) {
      await createBuild(buildName, product_ids);
    } else if (build) {
      await updateBuild(build.id, buildName, product_ids);
    }
    navigate('/pcbuilds');
  };

  // FIX: Used a type guard to filter out nulls before reducing.
  // This correctly types `product` as `Product` within the reduce function,
  // resolving errors related to `unknown` types and property access.
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
            {CORE_COMPONENTS.map(({name, categoryId}) => {
                const selected = selectedComponents[categoryId];
                return (
                    <div key={categoryId} className="flex items-center justify-between p-4 bg-secondary rounded-md">
                        <div className="flex items-center gap-4">
                            <div className="font-bold text-text-primary w-28">{name}</div>
                            {selected ? (
                                <>
                                    <img src={selected.mainImage ? `${API_HOST}${selected.mainImage}` : `https://via.placeholder.com/48x48.png/F9FAFB/6B7280?text=No+Image`} alt={selected.name} className="w-12 h-12 object-contain bg-secondary rounded"/>
                                    <div>
                                        <p className="font-semibold">{selected.name}</p>
                                        <p className="text-sm text-accent">{parseFloat(selected.price).toLocaleString('vi-VN')} ₫</p>
                                    </div>
                                </>
                            ) : (
                               <p className="text-sm text-text-secondary italic">Not selected</p>
                            )}
                        </div>
                         <div className="flex items-center gap-2">
                           {selected && (
                                <button onClick={() => handleRemoveComponent(categoryId)} className="p-2 text-red-500 hover:bg-gray-200 rounded-full" title="Remove Component">
                                    <Trash2 size={18} />
                                </button>
                           )}
                           <button onClick={() => handleOpenModal(categoryId)} className="px-4 py-2 text-sm bg-primary border border-border-color text-text-primary rounded-md hover:bg-gray-100">
                             {selected ? 'Change' : 'Choose'}
                           </button>
                         </div>
                    </div>
                );
            })}
        </div>
        
        <div className="mt-8 pt-6 border-t border-border-color text-right">
            <button
                onClick={handleSaveBuild}
                disabled={contextLoading}
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