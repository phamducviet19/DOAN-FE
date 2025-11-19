import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import { User } from '../../types';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleLoginSuccess = (user: User) => {
    if (user.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // FIX: Use the login function from AuthContext which handles auth state and returns the user.
      // This avoids a page reload and fixes the 'user is not defined' error.
      const user = await login(email, password);
      handleLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const commonInputClass = "appearance-none relative block w-full px-3 py-2 border border-border-color bg-primary placeholder-gray-500 text-text-primary focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm";


  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-secondary">
      <div className="w-full max-w-md p-8 space-y-8 bg-primary rounded-lg shadow-lg border border-border-color">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
             <Cpu className="w-12 h-12 text-highlight mr-3" />
             <h1 className="text-3xl font-bold text-text-primary">Sign In</h1>
          </div>
          <p className="text-text-secondary">Access your account to start shopping or manage the store.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-center text-sm">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`${commonInputClass} rounded-t-md`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`${commonInputClass} rounded-b-md`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-highlight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-400"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
         <p className="mt-2 text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-highlight hover:text-blue-500">
                Register here
            </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
