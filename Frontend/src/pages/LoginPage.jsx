import React, { useState } from 'react';
import { FaGlobe, FaUser, FaLock } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(email, password);
      navigate('/'); // Navigate to dashboard on successful login
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="grid md:grid-cols-2 max-w-4xl w-full bg-white shadow-2xl rounded-3xl overflow-hidden">
        
        <div className="hidden md:flex flex-col justify-center text-center text-white bg-gradient-to-b from-blue-500 to-blue-600 p-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <FaGlobe className="text-4xl" />
            <h1 className="text-3xl font-bold">MRF Portal</h1>
          </div>
          <p className="text-lg leading-relaxed opacity-90">
            Streamlining waste management with real-time data and analytics.
          </p>
        </div>

        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Welcome Back..</h2>
          <p className="text-slate-500 mb-8">Please sign in to continue.</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button type="submit" disabled={loading} className="w-full h-12 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors uppercase tracking-wider disabled:bg-slate-400">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm font-medium">
            <Link to="/request-access" className="text-blue-600 hover:underline">Request for Access</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;