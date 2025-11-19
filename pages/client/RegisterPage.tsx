import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
        role: 'client'
      });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const commonInputClass = "w-full px-3 py-2 border border-border-color bg-primary placeholder-gray-500 text-text-primary rounded-md focus:outline-none focus:ring-accent focus:border-accent sm:text-sm";

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-primary rounded-lg shadow-lg border border-border-color">
        <div className="text-center">
            <div className="flex justify-center items-center mb-4">
               <Cpu className="w-12 h-12 text-highlight mr-3" />
               <h1 className="text-3xl font-bold text-text-primary">Create Account</h1>
            </div>
          <p className="text-text-secondary">Join us to get the best parts for your PC</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-center text-sm">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-3 rounded-md text-center text-sm">{success}</div>}

          <div className="space-y-4">
             <input name="name" type="text" required placeholder="Full Name" value={formData.name} onChange={handleChange} className={commonInputClass} />
             <input name="email" type="email" autoComplete="email" required placeholder="Email Address" value={formData.email} onChange={handleChange} className={commonInputClass} />
             <input name="phone" type="tel" required placeholder="Phone Number" value={formData.phone} onChange={handleChange} className={commonInputClass} />
             <input name="address" type="text" required placeholder="Address" value={formData.address} onChange={handleChange} className={commonInputClass} />
             <input name="password" type="password" autoComplete="new-password" required placeholder="Password" value={formData.password} onChange={handleChange} className={commonInputClass} />
             <input name="confirmPassword" type="password" autoComplete="new-password" required placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className={commonInputClass} />
          </div>

          <div>
            <button type="submit" disabled={isLoading || !!success} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-highlight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-400">
              {isLoading ? 'Creating account...' : 'Register'}
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-highlight hover:text-blue-500">
                Sign in
            </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;