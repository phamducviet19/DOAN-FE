import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary border-t border-border-color text-text-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-accent">
              <Cpu size={28} />
              <span className="text-text-primary">PC Parts</span>
            </Link>
            <p className="text-sm">
              Your one-stop shop for the latest and greatest PC components. We're dedicated to helping you build your dream rig with quality parts and expert advice.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-highlight transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-highlight transition-colors">Products</Link></li>
              <li><Link to="/profile" className="hover:text-highlight transition-colors">My Account</Link></li>
              <li><Link to="/cart" className="hover:text-highlight transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin size={16} className="mr-3 mt-1 flex-shrink-0 text-text-secondary" />
                <span>123 Tech Lane, Silicon Valley, CA 94000</span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-3 flex-shrink-0 text-text-secondary" />
                <a href="tel:+1234567890" className="hover:text-highlight transition-colors">(123) 456-7890</a>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-3 flex-shrink-0 text-text-secondary" />
                <a href="mailto:support@pcparts.com" className="hover:text-highlight transition-colors">support@pcparts.com</a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-text-secondary hover:text-highlight transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="text-text-secondary hover:text-highlight transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="text-text-secondary hover:text-highlight transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border-color text-center text-sm">
          <p>&copy; {new Date().getFullYear()} PC Parts Store. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
