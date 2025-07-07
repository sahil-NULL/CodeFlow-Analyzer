import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  User, 
  Github, 
  Loader2, 
  Check, 
  AlertCircle,
  LogOut,
  Settings
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const Navbar = ({ onRepoAdded, user, repositories, setActiveRepoId }) => {
  const navigate = useNavigate()
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);


  const validateGithubUrl = (url) => {
    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    return githubUrlPattern.test(url);
  };

  const handleAddRepository = async () => {
    if (!repoUrl.trim()) {
      setStatus('error');
      setStatusMessage('Please enter a repository URL');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    if (!validateGithubUrl(repoUrl)) {
      setStatus('error');
      setStatusMessage('Please enter a valid public GitHub repository URL');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    repositories.map(repo => {
      if (repo.url === repoUrl) {
        setStatus('error');
        setStatusMessage('Repository already added');
        setActiveRepoId(repo._id)
        setTimeout(() => setStatus('idle'), 3000);
        return;
      }
    })

    try {
      setIsLoading(true);
      setStatus('idle');
      console.log(repoUrl)

      const response = await axios.post(
        `${BASE_URL}/api/v1/repo/`,
        { repoURL: repoUrl },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setStatus('success');
      setStatusMessage('Repository added successfully!');
      setRepoUrl('');
      setActiveRepoId(response.data.repo._id)
      
      // Call the callback to refresh the repo list
      if (onRepoAdded) {
        onRepoAdded();
      }

      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Error adding repository:', error);
      setStatus('error');
      setStatusMessage(
        error.response?.data?.message || 
        'Failed to add repository. Please try again.'
      );
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddRepository();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <nav className="sticky top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between relative z-40">
      {/* Left side - Logo/Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Github className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          CodeGraph
        </h1>
      </div>

      {/* Center - Add Repository Input */}
      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter public GitHub repository URL (e.g., https://github.com/user/repo)"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {status !== 'idle' && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getStatusIcon()}
                </div>
              )}
            </div>
            
            <button
              onClick={handleAddRepository}
              disabled={isLoading || !repoUrl.trim()}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[100px] justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">Add</span>
                </>
              )}
            </button>
          </div>
          
          {/* Status Message */}
          {status !== 'idle' && statusMessage && (
            <div className={`absolute top-full left-0 right-0 mt-2 p-2 text-sm ${getStatusColor()} bg-white border border-gray-200 rounded-lg shadow-sm`}>
              {statusMessage}
            </div>
          )}
        </div>
      </div>

      {/* Right side - User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          {/* <span className="text-xs font-medium text-gray-700">{user.username}</span> */}
        </button>

        {/* User Dropdown Menu */}
        {showUserMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowUserMenu(false)}
            />
            
            {/* Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
              </div>
              
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;