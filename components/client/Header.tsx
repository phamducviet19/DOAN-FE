import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, GitCompare, User as UserIcon, LogOut, Menu, X, Cpu, Wrench } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCompare } from '../../contexts/CompareContext';
import { usePCBuild } from '../../contexts/PCBuildContext';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();
  const { builds } = usePCBuild();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative py-2 px-3 rounded-md text-sm md:text-xl transition-colors group
  ${isActive ? 'text-accent font-bold' : 'text-text-primary hover:bg-gray-100 font-medium'}
  after:content-[''] after:absolute after:left-0 after:-bottom-[1px]
  after:h-[1.5px] after:bg-accent after:transition-all after:duration-300
  ${isActive ? 'after:w-full' : 'after:w-0 group-hover:after:w-full'}
  `;

  const iconLinkClass = (isActive: boolean) =>
  `relative p-2 rounded-full transition-colors ${
    isActive ? 'text-accent bg-gray-200' : 'text-text-secondary hover:bg-gray-100'
  }`;

  return (
    <header className="bg-primary/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-border-color">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-accent">
            <Cpu size={28} />
            <span className="text-text-primary">Sale PC</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-4 font-bold">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            <NavLink to="/products" className={navLinkClass}>Product</NavLink>
          </nav>

          <div className="flex items-center space-x-2">
            <NavLink to="/compare" className={({ isActive }) => iconLinkClass(isActive)} aria-label="Compare Products">
                <GitCompare />
                {compareList.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                    {compareList.length}
                  </span>
                )}
              </NavLink>

              <NavLink to="/wishlist" className={({ isActive }) => iconLinkClass(isActive)} aria-label="Your Wishlist">
                <Heart />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                    {wishlist.length}
                  </span>
                )}
              </NavLink>

              <NavLink to="/pcbuilds" className={({ isActive }) => iconLinkClass(isActive)} aria-label="PC Builder">
                <Wrench />
                {builds.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                    {builds.length}
                  </span>
                )}
              </NavLink>

              <NavLink to="/cart" className={({ isActive }) => iconLinkClass(isActive)} aria-label="Shopping Cart">
                <ShoppingCart />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                    {cart.length}
                  </span>
                )}
              </NavLink>

            <div className="hidden md:block border-l border-border-color ml-2 pl-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
                    <UserIcon className="text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary">{user?.name.split(' ')[0]}</span>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-primary rounded-md shadow-lg py-1 z-50 border border-border-color">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-text-primary hover:bg-gray-100" onClick={() => setIsUserMenuOpen(false)}>Profile</Link>
                      <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-100 rounded-md">Login</Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-highlight rounded-md">Register</Link>
                </div>
              )}
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-text-secondary hover:bg-gray-100">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-primary border-t border-border-color">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <NavLink to="/" className={navLinkClass} onClick={()=>setIsMenuOpen(false)}>Home</NavLink>
             <NavLink to="/products" className={navLinkClass} onClick={()=>setIsMenuOpen(false)}>Product</NavLink>
          </div>
          <div className="pt-4 pb-3 border-t border-border-color">
            {isAuthenticated ? (
               <div className="px-2 space-y-1">
                 <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-gray-100">Profile</Link>
                 <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100">Logout</button>
               </div>
            ) : (
                <div className="px-2 space-y-1">
                    <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-gray-100">Login</Link>
                    <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-gray-100">Register</Link>
                </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;