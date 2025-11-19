import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CompareProvider } from './contexts/CompareContext';
import { PCBuildProvider } from './contexts/PCBuildContext';

// Layouts
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';


// Client Pages
import HomePage from './pages/client/HomePage';
import ProductsPage from './pages/client/ProductsPage';
import ProductDetailPage from './pages/client/ProductDetailPage';
import LoginPage from './pages/client/LoginPage';
import RegisterPage from './pages/client/RegisterPage';
import CartPage from './pages/client/CartPage';
import WishlistPage from './pages/client/WishlistPage';
import ComparePage from './pages/client/ComparePage';
import CheckoutPage from './pages/client/CheckoutPage';
import ProfilePage from './pages/client/ProfilePage';
import OrderSuccessPage from './pages/client/OrderSuccessPage';
import PCBuildListPage from './pages/client/PCBuildListPage';
import PCBuildPage from './pages/client/PCBuildPage';
import PaymentSuccessPage from './pages/client/PaymentSuccessPage';
import PaymentFailedPage from './pages/client/PaymentFailedPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import ProductManagementPage from './pages/admin/ProductManagementPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';
import BrandManagementPage from './pages/admin/BrandManagementPage';
import OrderManagementPage from './pages/admin/OrderManagementPage';
import CustomerManagementPage from './pages/admin/CustomerManagementPage';
import SupplierManagementPage from './pages/admin/SupplierManagementPage';
import ImportManagementPage from './pages/admin/ImportManagementPage';


const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <CompareProvider>
            <PCBuildProvider>
              <BrowserRouter>
                <Routes>
                  {/* Client Facing Routes */}
                  <Route path="/" element={<ClientLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="product/:id" element={<ProductDetailPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="wishlist" element={
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
                    } />
                    <Route path="compare" element={
                      <ProtectedRoute>
                        <ComparePage />
                      </ProtectedRoute>
                    } />
                    <Route path="checkout" element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    } />
                    <Route path="profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="order-success" element={
                      <ProtectedRoute>
                        <OrderSuccessPage />
                      </ProtectedRoute>
                    } />
                    <Route path="payment-success" element={
                      <ProtectedRoute>
                        <PaymentSuccessPage />
                      </ProtectedRoute>
                    } />
                    <Route path="payment-failed" element={
                      <ProtectedRoute>
                        <PaymentFailedPage />
                      </ProtectedRoute>
                    } />
                    <Route path="pcbuilds" element={
                      <ProtectedRoute>
                        <PCBuildListPage />
                      </ProtectedRoute>
                    } />
                    <Route path="pcbuild/:id" element={
                      <ProtectedRoute>
                        <PCBuildPage />
                      </ProtectedRoute>
                    } />
                  </Route>

                  {/* Standalone Login/Register Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Admin Routes */}
                  <Route element={<AdminProtectedRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                       <Route index element={<DashboardPage />} />
                       <Route path="products" element={<ProductManagementPage />} />
                       <Route path="categories" element={<CategoryManagementPage />} />
                       <Route path="brands" element={<BrandManagementPage />} />
                       <Route path="orders" element={<OrderManagementPage />} />
                       <Route path="customers" element={<CustomerManagementPage />} />
                       <Route path="suppliers" element={<SupplierManagementPage />} />
                       <Route path="imports" element={<ImportManagementPage />} />
                    </Route>
                  </Route>

                </Routes>
              </BrowserRouter>
            </PCBuildProvider>
          </CompareProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;