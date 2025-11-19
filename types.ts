export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'admin' | 'client';
  created_at?: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  category_id: number;
  data_type: 'text' | 'number' | 'boolean';
  unit: string | null;
}

export interface ProductAttributeValue {
  id: number;
  product_id: number;
  attribute_id: number;
  value_text: string | null;
  value_number: string | null;
  value_boolean: boolean | null;
  ProductAttribute: ProductAttribute;
}

export interface ProductImage {
  id: number;
  image_url: string;
  is_main: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  brand_id: number;
  category_id: number;
  created_at: string;
  ProductAttributeValues: ProductAttributeValue[];
  mainImage: string | null;
  images: ProductImage[] | string[];
}

export interface OrderDetail {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  Product: {
    id: number;
    name: string;
    price: string;
  };
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Cancelled';

export interface Order {
  id: number;
  user_id: number;
  order_date: string;
  status: OrderStatus;
  total_amount: string;
  shipping_address: string;
  notes: string;
  OrderDetails: OrderDetail[];
  User: User;
}

// Client-side specific types
export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  Product: Product;
}

export interface WishlistItem {
    id: number;
    user_id: number;
    product_id: number;
    Product: Product;
}

export interface CompareItem extends Product {
    Category: {
        id: number;
        name: string;
    };
}

export interface PcBuildDetail {
  id: number;
  build_id: number;
  product_id: number;
  Product: Product;
}

export interface PcBuild {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  PcBuildDetails: PcBuildDetail[];
  User: {
    id: number;
    name: string;
    email: string;
  };
}


// FIX: Added missing type definitions for dashboard statistics
export interface RevenueData {
  date: string;
  total_revenue: string;
}

export interface TopProductData {
  product_id: number;
  total_sold: number;
  Product: {
    name: string;
  };
}

export interface OrderStatusData {
  status: OrderStatus;
  count: string;
}

export interface TopCustomerData {
  user_id: number;
  total_spent: string;
  User: {
    name: string;
    email: string;
  };
}

export interface OrderPercentageData {
  status: OrderStatus;
  percentage: string;
}

// FIX: Added missing type definitions for saving products
export interface AttributeValuePayload {
  attribute_id: number;
  value_text: string | null;
  value_number: string | null;
  value_boolean: boolean | null;
}

export interface ProductSaveData {
  name: string;
  description: string;
  price: string;
  stock: number;
  brand_id: number;
  category_id: number;
  attributes: AttributeValuePayload[];
}

// FIX: Added missing type definitions for suppliers and imports
export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ImportReceiptDetail {
  id: number;
  product_id: number;
  import_receipt_id: number;
  quantity: number;
  unit_price: string;
  Product: {
    name: string;
  };
}

export interface ImportReceipt {
  id: number;
  supplier_id: number;
  import_date: string;
  total_amount: string;
  Supplier: Supplier;
  ImportDetails: ImportReceiptDetail[];
}