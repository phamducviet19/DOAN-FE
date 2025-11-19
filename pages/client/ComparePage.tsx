import React, { useMemo } from 'react';
import { useCompare } from '../../contexts/CompareContext';
import { Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import { Trash2 } from 'lucide-react';
import { CompareItem } from '../../types';
import { API_HOST } from '../../services/api';

const ComparePage: React.FC = () => {
  const { groupedCompareList, loading, removeFromCompare } = useCompare();

  const attributesByCategory = useMemo(() => {
    const result: Record<string, { id: number; name: string; unit: string | null }[]> = {};
    Object.keys(groupedCompareList).forEach(categoryName => {
      const products = groupedCompareList[categoryName];
      const allAttributes = new Map<number, { name: string; unit: string | null }>();
      products.forEach(product => {
        product.ProductAttributeValues.forEach(attrVal => {
          if (!allAttributes.has(attrVal.ProductAttribute.id)) {
            allAttributes.set(attrVal.ProductAttribute.id, {
              name: attrVal.ProductAttribute.name,
              unit: attrVal.ProductAttribute.unit
            });
          }
        });
      });
      result[categoryName] = Array.from(allAttributes.entries()).map(([id, { name, unit }]) => ({ id, name, unit }));
    });
    return result;
  }, [groupedCompareList]);

  const getAttributeValue = (product: any, attributeId: number) => {
    const attr = product.ProductAttributeValues.find((a: any) => a.ProductAttribute.id === attributeId);
    if (!attr) return '-';
    if (attr.value_text) return attr.value_text;
    if (attr.value_number) return parseFloat(attr.value_number).toString();
    if (attr.value_boolean !== null) return attr.value_boolean ? 'Yes' : 'No';
    return '-';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (Object.keys(groupedCompareList).length === 0) {
    return (
      <div className="text-center bg-primary border border-border-color p-10 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Your Compare List is Empty</h1>
        <p className="text-text-secondary mb-6">Add products to compare their features side-by-side.</p>
        <Link to="/products" className="bg-accent text-white font-semibold px-6 py-3 rounded-md hover:bg-highlight transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-primary p-6 rounded-lg shadow-sm border border-border-color">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Compare Products</h1>
      {Object.entries(groupedCompareList).map(([categoryName, products]: [string, CompareItem[]]) => (
        <div key={categoryName} className="mb-12 overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-4 text-highlight">{categoryName}</h2>
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="p-3 font-semibold text-left border border-border-color w-1/5">Feature</th>
                {products.map(product => (
                  <th key={product.id} className="p-3 font-semibold text-center border border-border-color">
                     <Link to={`/product/${product.id}`} className="hover:text-highlight">{product.name}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Product Image */}
              <tr className="bg-primary">
                <td className="p-3 font-medium border border-border-color">Image</td>
                {products.map(product => (
                  <td key={product.id} className="p-3 border border-border-color text-center">
                    <img src={product.mainImage ? `${API_HOST}${product.mainImage}` : `https://via.placeholder.com/100x100.png/F9FAFB/6B7280?text=No+Image`} alt={product.name} className="w-24 h-24 object-contain mx-auto" />
                  </td>
                ))}
              </tr>
              {/* Product Price */}
              <tr className="bg-secondary">
                <td className="p-3 font-medium border border-border-color">Price</td>
                {products.map(product => (
                  <td key={product.id} className="p-3 border border-border-color text-center font-bold text-lg text-accent">
                    {parseFloat(product.price).toLocaleString('vi-VN')} ₫
                  </td>
                ))}
              </tr>
              {/* Dynamic Attributes */}
              {attributesByCategory[categoryName].map((attr, index) => (
                <tr key={attr.id} className={index % 2 === 0 ? 'bg-primary' : 'bg-secondary'}>
                  <td className="p-3 font-medium border border-border-color">{attr.name} {attr.unit && `(${attr.unit})`}</td>
                  {products.map(product => (
                    <td key={product.id} className="p-3 border border-border-color text-center">
                      {getAttributeValue(product, attr.id)}
                    </td>
                  ))}
                </tr>
              ))}
               {/* Remove Button */}
              <tr className="bg-primary">
                <td className="p-3 font-medium border border-border-color"></td>
                {products.map(product => (
                  <td key={product.id} className="p-3 border border-border-color text-center">
                    <button onClick={() => removeFromCompare(product.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-100">
                      <Trash2 size={18} />
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ComparePage;