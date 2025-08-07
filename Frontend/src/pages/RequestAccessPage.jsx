import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaChevronLeft, FaBriefcase, FaUserTag } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const RequestAccessPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    designation: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.register(
        formData.fullName,
        formData.username,
        formData.email,
        formData.designation,
        formData.password
      );
      setIsSubmitted(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="relative max-w-2xl w-full bg-white shadow-2xl rounded-3xl p-8 md:p-12">
        
        {isSubmitted ? (
          <div className="text-center py-12">
            <h2 className="text-3xl font-extrabold text-slate-800">Request Submitted</h2>
            <p className="text-slate-500 mt-2 text-lg">Please wait for admin approval.</p>
            <p className="text-slate-400 mt-4">You will be redirected to the login page shortly...</p>
          </div>
        ) : (
          <>
            <Link to="/login" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 font-medium hover:text-blue-600 transition-colors">
                <FaChevronLeft />
                <span>Back to Login</span>
            </Link>

            <h2 className="text-3xl font-extrabold text-slate-800 mb-2 text-center mt-8">Request for Access</h2>
            <p className="text-slate-500 mb-8 text-center">Fill out the form below to create your account.</p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" name="fullName" placeholder="Full Name" required 
                  value={formData.fullName} onChange={handleChange}
                  className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <FaUserTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" name="username" placeholder="Create a Username" required
                  value={formData.username} onChange={handleChange}
                  className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" name="email" placeholder="Email Address" required
                  value={formData.email} onChange={handleChange}
                  className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" name="designation" placeholder="Your Designation (e.g., Operator)" required 
                  value={formData.designation} onChange={handleChange}
                  className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" name="password" placeholder="Create Password" required minLength="8"
                  value={formData.password} onChange={handleChange}
                  className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" name="confirmPassword" placeholder="Confirm Password" required
                  value={formData.confirmPassword} onChange={handleChange}
                  className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
              
              <button type="submit" disabled={loading} className="w-full h-12 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors uppercase tracking-wider mt-2 disabled:bg-slate-400">
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestAccessPage;