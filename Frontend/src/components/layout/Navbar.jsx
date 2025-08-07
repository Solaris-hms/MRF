import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaBell, FaUserCircle, FaChevronDown } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import authService from '../../services/authService';
import { getPendingUsers } from '../../services/apiService';

const Navbar = ({ setSidebarOpen, sidebarOpen }) => {
    const { pendingApprovals, setPendingApprovals } = useAppContext();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        const isAdmin = user?.roles?.includes('Admin');

        if (isAdmin) {
            const fetchCount = async () => {
                try {
                    const response = await getPendingUsers();
                    setPendingApprovals(response.data?.length || 0);
                } catch (error) {
                    console.error("Failed to fetch pending approvals count:", error);
                }
            };
            fetchCount();
        }
    }, [setPendingApprovals]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleRedirectToApprovals = () => {
        setIsDropdownOpen(false);
        navigate('/approvals');
    };

    const getFirstName = () => {
        return currentUser?.full_name?.split(' ')[0] || 'User';
    };

    const getInitials = () => {
        return currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : '?';
    };

    return (
        // --- THIS IS THE FIX ---
        // The header now has a fixed height (h-16) to ensure layout consistency.
        <header className="bg-white sticky top-0 z-10 shadow-sm border-b border-slate-200 h-16 flex-shrink-0">
            <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
                
                <div className="flex items-center">
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)} 
                        className="text-slate-500 mr-4 md:hidden"
                        aria-controls="sidebar"
                        aria-expanded={sidebarOpen}
                    >
                        <FaBars className="text-xl" />
                    </button>
                </div>

                <div className="flex items-center space-x-4 md:space-x-6">
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={handleNotificationClick} className="relative text-slate-500 hover:text-slate-700">
                            <FaBell className="text-xl"/>
                            {pendingApprovals > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                                    {pendingApprovals}
                                </span>
                            )}
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 p-2">
                                <div className="font-bold text-slate-700 px-2 py-1">Notifications</div>
                                <div className="border-t border-slate-100 my-1"></div>
                                {pendingApprovals > 0 ? (
                                    <div onClick={handleRedirectToApprovals} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 cursor-pointer">
                                        <div className="bg-blue-100 p-2 rounded-full"><FaUserCircle className="text-blue-500" /></div>
                                        <div>
                                            <p className="font-semibold text-slate-800">New Access Requests</p>
                                            <p className="text-sm text-slate-500">{pendingApprovals} user(s) waiting for approval.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500 p-4">No new notifications</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 cursor-pointer p-1 rounded-lg hover:bg-slate-100">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                            {getInitials()}
                        </div>
                        <span className="hidden sm:block font-medium text-slate-700">{getFirstName()}</span>
                        <FaChevronDown className="hidden sm:block text-slate-500 text-sm"/>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;