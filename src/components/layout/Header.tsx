import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Shield, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-gray-900">Password Vault</span>
            </div>
          </div>
          
          {state.isAuthenticated && (
            <>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <div className="relative">
                  <button
                    type="button"
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={toggleUserMenu}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      <User className="h-5 w-5 text-gray-500" />
                      <span className="ml-2 text-gray-700">{state.user?.username}</span>
                      <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                    </div>
                  </button>
                  
                  {showUserMenu && (
                    <div 
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                      style={{
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <span className="flex items-center">
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="-mr-2 flex items-center sm:hidden">
                <button
                  onClick={toggleMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {isOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {isOpen && state.isAuthenticated && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <div className="block px-4 py-2 text-base font-medium border-l-4 border-transparent">
              <span className="text-gray-500">Logged in as:</span>
              <br />
              <span className="text-gray-900">{state.user?.username}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <span className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;