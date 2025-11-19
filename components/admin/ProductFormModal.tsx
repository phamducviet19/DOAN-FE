import React, { useState, useEffect } from 'react';
import { Brand, Category, Product, ProductAttribute, AttributeValuePayload, ProductSaveData } from '../../types';
import { X } from 'lucide-react';
import api, { API_HOST } from '../../services/api';
import Spinner from '../common/Spinner';

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  stock: string;
  brand_id: string;
  category_id: string;
}

type ImageFiles = { 
  image1: File | null; 
  image2: File | null; 
  image3: File | null 
};

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: ProductSaveData, images: ImageFiles) => Promise<void>;
  brands: Brand[];
  categories: Category[];
  productToEdit?: Product | null;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  brands,
  categories,
  productToEdit,
}) => {
  const initialFormState: ProductFormData = {
    name: '',
    description: '',
    price: '',
    stock: '0',
    brand_id: '',
    category_id: '',
  };
  
  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData | 'image1', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [images, setImages] = useState<ImageFiles>({ image1: null, image2: null, image3: null });
  const [imagePreviews, setImagePreviews] = useState<{ image1: string | null; image2: string | null; image3: string | null }>({ image1: null, image2: null, image3: null });

  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string | boolean | null>>({});
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  
  // NEW STATE: Store the fully fetched product to ensure validation has access to complete data.
  const [detailedProductForEditing, setDetailedProductForEditing] = useState<Product | null>(null);

  const imageFields = [
    { name: 'image1' as const, label: 'Main Image (Required)' },
    { name: 'image2' as const, label: 'Image 2' },
    { name: 'image3' as const, label: 'Image 3' }
  ];

  useEffect(() => {
    const fetchAndSetProductDetails = async (product: Product) => {
        setIsDetailsLoading(true);
        try {
            const detailedProduct = await api.get<Product>(`/product/${product.id}`);
            
            // UPDATE: Store the complete product object
            setDetailedProductForEditing(detailedProduct);

            setFormData({
                name: detailedProduct.name,
                description: detailedProduct.description,
                price: String(detailedProduct.price),
                stock: String(detailedProduct.stock),
                brand_id: String(detailedProduct.brand_id),
                category_id: String(detailedProduct.category_id),
            });
            
            const mainImageUrl = detailedProduct.mainImage;
            const allImageUrls = (detailedProduct.images as string[]) || [];
            const otherImageUrls = allImageUrls.filter(url => url !== mainImageUrl);

            setImagePreviews({
                image1: mainImageUrl ? `${API_HOST}${mainImageUrl}` : null,
                image2: otherImageUrls[0] ? `${API_HOST}${otherImageUrls[0]}` : null,
                image3: otherImageUrls[1] ? `${API_HOST}${otherImageUrls[1]}` : null,
            });

            setImages({ image1: null, image2: null, image3: null });

        } catch (error) {
            console.error("Failed to fetch product details for editing:", error);
            alert("Could not load full product details. Some information might be missing.");
            setDetailedProductForEditing(product); // Fallback to potentially incomplete data
            setFormData({
                name: product.name,
                description: product.description,
                price: String(product.price),
                stock: String(product.stock),
                brand_id: String(product.brand_id),
                category_id: String(product.category_id),
            });
        } finally {
            setIsDetailsLoading(false);
        }
    };

    if (isOpen) {
        if (productToEdit) {
            fetchAndSetProductDetails(productToEdit);
        } else {
            setFormData(initialFormState);
            setAttributes([]);
            setAttributeValues({});
            setImages({ image1: null, image2: null, image3: null });
            setImagePreviews({ image1: null, image2: null, image3: null });
            setIsDetailsLoading(false);
            // UPDATE: Reset detailed product for new product form
            setDetailedProductForEditing(null);
        }
        setErrors({});
    }
  }, [productToEdit, isOpen]);


  useEffect(() => {
    if (!isOpen) return;

    const fetchAttributes = async () => {
        if (formData.category_id) {
            setIsLoadingAttributes(true);
            try {
                const response = await api.get<{ data: ProductAttribute[] }>(`/attribute/category/${formData.category_id}`);
                const fetchedAttributes = Array.isArray(response?.data) ? response.data : [];
                setAttributes(fetchedAttributes);

                // UPDATE: Use detailedProductForEditing for populating attribute values
                if (detailedProductForEditing && String(detailedProductForEditing.category_id) === formData.category_id) {
                    const initialValues = fetchedAttributes.reduce((acc, attr) => {
                        const existingValue = detailedProductForEditing.ProductAttributeValues.find(v => v.attribute_id === attr.id);
                        if (existingValue) {
                            let value: string | boolean | null = null;
                            if (existingValue.value_text !== null) value = existingValue.value_text;
                            else if (existingValue.value_number !== null) value = existingValue.value_number;
                            else if (existingValue.value_boolean !== null) value = existingValue.value_boolean;
                            
                            if (value !== null) {
                                acc[attr.id] = value;
                            }
                        }
                        return acc;
                    }, {} as Record<string, string | boolean | null>);
                    setAttributeValues(initialValues);
                } else {
                    setAttributeValues({});
                }
            } catch (error: any) {
                if (error?.message?.toLowerCase().includes('no attributes found')) {
                    setAttributes([]);
                } else {
                    console.error('Failed to fetch attributes', error);
                    setAttributes([]);
                }
            } finally {
                setIsLoadingAttributes(false);
            }
        } else {
            setAttributes([]);
            setAttributeValues({});
        }
    };

    fetchAttributes();
  }, [formData.category_id, isOpen, detailedProductForEditing]); // UPDATE: Add detailedProductForEditing dependency
  
  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData | 'image1', string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (formData.stock === '' || isNaN(Number(formData.stock)) || Number(formData.stock) < 0 || !Number.isInteger(Number(formData.stock))) {
      newErrors.stock = 'Stock must be a non-negative integer';
    }
    if (!formData.brand_id) newErrors.brand_id = 'Brand is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';

    // UPDATE: Use the detailed product state for validation. This correctly checks
    // if an image exists when editing, even if a new one hasn't been uploaded.
    if (!detailedProductForEditing?.mainImage && !images.image1) {
        newErrors.image1 = 'Main image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setImages(prev => ({ ...prev, [name]: file as File }));
      setImagePreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  const handleAttributeChange = (attributeId: string, value: string | boolean | null) => {
    setAttributeValues(prev => ({
        ...prev,
        [attributeId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);

    const attributesPayload: AttributeValuePayload[] = attributes
      .map(attr => {
          const value = attributeValues[String(attr.id)];
          
          const hasValue = (attr.data_type === 'boolean' && typeof value === 'boolean') || 
                         (value !== undefined && value !== null && value !== '');

          if (!hasValue) {
            return null;
          }

          const payload: AttributeValuePayload = { 
              attribute_id: attr.id,
              value_text: null,
              value_number: null,
              value_boolean: null,
          };

          switch (attr.data_type) {
              case 'number':
                  if (!isNaN(Number(value))) {
                      payload.value_number = String(value);
                  } else {
                      return null;
                  }
                  break;
              case 'boolean':
                  payload.value_boolean = value as boolean;
                  break;
              case 'text':
              default:
                  payload.value_text = String(value);
                  break;
          }
          return payload;
      })
      .filter((p): p is AttributeValuePayload => p !== null);

    const saveData: ProductSaveData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: Number(formData.stock),
        brand_id: Number(formData.brand_id),
        category_id: Number(formData.category_id),
        attributes: attributesPayload,
    };

    try {
      await onSave(saveData, images);
    } catch (error) {
        // Error is alerted by the parent component (ProductManagementPage)
        console.error("Failed to save product from modal", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderAttributeInput = (attribute: ProductAttribute) => {
    const attributeId = String(attribute.id);
    const value = attributeValues[attributeId];
    const commonClasses = "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500";

    switch (attribute.data_type) {
      case 'number':
        return <input type="number" id={`attr_${attribute.id}`} name={`attr_${attribute.id}`} value={value as string || ''} onChange={e => handleAttributeChange(attributeId, e.target.value)} className={commonClasses} />;
      case 'boolean':
        return (
          <select id={`attr_${attribute.id}`} name={`attr_${attribute.id}`} value={value === null || value === undefined ? '' : String(value)} onChange={e => handleAttributeChange(attributeId, e.target.value === '' ? null : e.target.value === 'true')} className={commonClasses}>
            <option value="">Select an option</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      case 'text':
      default:
        return <input type="text" id={`attr_${attribute.id}`} name={`attr_${attribute.id}`} value={value as string || ''} onChange={e => handleAttributeChange(attributeId, e.target.value)} className={commonClasses} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-8 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-100">{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="flex-grow overflow-y-auto pr-4 -mr-4">
          {isDetailsLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner />
            </div>
          ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500" required />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                    <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500" min="0" required />
                    {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                    </div>
                    <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-1">Stock</label>
                    <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500" min="0" required />
                    {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock}</p>}
                    </div>
                    <div>
                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                    <select name="category_id" id="category_id" value={formData.category_id} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500" required>
                        <option value="">Select a category</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    {errors.category_id && <p className="text-red-400 text-xs mt-1">{errors.category_id}</p>}
                    </div>
                    <div>
                    <label htmlFor="brand_id" className="block text-sm font-medium text-gray-300 mb-1">Brand</label>
                    <select name="brand_id" id="brand_id" value={formData.brand_id} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500" required>
                        <option value="">Select a brand</option>
                        {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                    </select>
                    {errors.brand_id && <p className="text-red-400 text-xs mt-1">{errors.brand_id}</p>}
                    </div>
                    <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500" required></textarea>
                    {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Product Images</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {imageFields.map(field => (
                            <div key={field.name}>
                                <label htmlFor={field.name} className="block text-xs font-medium text-gray-400 mb-1">{field.label}</label>
                                <input type="file" name={field.name} id={field.name} onChange={handleImageChange} accept="image/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30"/>
                                {imagePreviews[field.name] && <img src={imagePreviews[field.name]} alt={`Preview for ${field.name}`} className="mt-2 w-full h-24 object-cover rounded-md"/>}
                                {field.name === 'image1' && errors.image1 && <p className="text-red-400 text-xs mt-1">{errors.image1}</p>}
                            </div>
                        ))}
                        </div>
                    </div>
                </div>

                { (isLoadingAttributes || attributes.length > 0) && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">
                            Attributes for {categories.find(c => c.id.toString() === formData.category_id)?.name}
                        </h3>
                        {isLoadingAttributes ? (
                            <p className="text-gray-400">Loading attributes...</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {attributes.map(attr => (
                                    <div key={attr.id}>
                                        <label htmlFor={`attr_${attr.id}`} className="block text-sm font-medium text-gray-300 mb-1">
                                            {attr.name} {attr.unit && `(${attr.unit})`}
                                        </label>
                                        {renderAttributeInput(attr)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </>
          )}

          <div className="mt-8 flex justify-end space-x-4 flex-shrink-0 pt-6 border-t border-gray-700 -mb-8 -mx-8 px-8 pb-8">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-100 bg-gray-600 hover:bg-gray-500">Cancel</button>
            <button type="submit" disabled={isSubmitting || isDetailsLoading} className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;