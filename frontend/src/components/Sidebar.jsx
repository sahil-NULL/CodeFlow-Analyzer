import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  Sparkles,
  GitBranch,
  Star,
  ExternalLink,
  Code,
  Database,
  Globe,
  Smartphone,
  Palette,
  Zap,
  Shield,
  BookOpen,
  X,
  Filter,
  Trash2
} from 'lucide-react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const Sidebar = ({ isOpen, onToggle, setActiveRepoId, repositories, error, loading, onRepoDeleted }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [deletingRepoId, setDeletingRepoId] = useState(null);

  // Helper function to safely get repository type
  const getRepositoryType = (repo) => {
    if (repo.type) return repo.type;
    
    // Infer type from name or tags if type is not provided
    const name = repo.name?.toLowerCase() || '';
    const tags = repo.tags || [];
    const allText = [name, ...tags].join(' ').toLowerCase();
    
    if (allText.includes('mobile') || allText.includes('android') || allText.includes('ios') || allText.includes('react-native')) {
      return 'mobile';
    }
    if (allText.includes('api') || allText.includes('backend') || allText.includes('server')) {
      return 'api';
    }
    if (allText.includes('library') || allText.includes('package') || allText.includes('component')) {
      return 'library';
    }
    if (allText.includes('tool') || allText.includes('cli') || allText.includes('utility')) {
      return 'tool';
    }
    if (allText.includes('doc') || allText.includes('guide') || allText.includes('readme')) {
      return 'docs';
    }
    
    return 'web'; // Default to web
  };

  // Get unique languages and types for filters (filtering out null/undefined values)
  const uniqueLanguages = useMemo(() => {
    const languages = repositories
      .map(repo => repo.language)
      .filter((lang) => Boolean(lang))
      .filter((lang, index, arr) => arr.indexOf(lang) === index)
      .sort();
    return languages;
  }, [repositories]);

  const uniqueTypes = useMemo(() => {
    const types = repositories
      .map(repo => getRepositoryType(repo))
      .filter((type, index, arr) => arr.indexOf(type) === index)
      .sort();
    return types;
  }, [repositories]);

  // Filtered repositories based on search and filters
  const filteredRepositories = useMemo(() => {
    return repositories.filter(repo => {
      const name = repo.name || '';
      const description = repo.description || '';
      const tags = repo.tags || [];
      
      const matchesSearch = searchQuery === '' || 
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const repoLanguage = repo.language || '';
      const matchesLanguage = selectedLanguage === '' || repoLanguage === selectedLanguage;
      
      const repoType = getRepositoryType(repo);
      const matchesType = selectedType === '' || repoType === selectedType;
      
      return matchesSearch && matchesLanguage && matchesType;
    });
  }, [repositories, searchQuery, selectedLanguage, selectedType]);

  const getLanguageColor = (language) => {
    if (!language) return 'bg-gray-500';
    
    const colors = {
      'TypeScript': 'bg-blue-500',
      'JavaScript': 'bg-yellow-500',
      'Python': 'bg-green-500',
      'Java': 'bg-red-500',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-500',
      'C++': 'bg-pink-500',
      'PHP': 'bg-purple-500'
    };
    return colors[language] || 'bg-gray-500';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'web': Globe,
      'mobile': Smartphone,
      'api': Database,
      'library': Code,
      'tool': Zap,
      'docs': BookOpen
    };
    return icons[type] || Code;
  };

  const getTypeColor = (type) => {
    const colors = {
      'web': 'text-green-400',
      'mobile': 'text-blue-400',
      'api': 'text-orange-400',
      'library': 'text-purple-400',
      'tool': 'text-yellow-400',
      'docs': 'text-cyan-400'
    };
    return colors[type] || 'text-gray-400';
  };

  const handleRepoClick = (repo) => {
    setActiveRepoId(repo._id)
  };

  const handleDeleteRepo = async (e, repoId) => {
    e.stopPropagation(); // Prevent repo selection when clicking delete
    
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this repository? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingRepoId(repoId); // Set loading state for this specific repo
      
      // Call API to delete repository
      await axios.delete(`${BASE_URL}/api/v1/repo`, {
        params:   {
          repoId: repoId
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Call callback to refresh repository list
      if (onRepoDeleted) {
        onRepoDeleted();
      }

      // If the deleted repo was currently selected, clear the selection
      setActiveRepoId(null);

      console.log('Repository deleted successfully');
    } catch (error) {
      console.error('Error deleting repository:', error);
      alert('Failed to delete repository. Please try again.');
    } finally {
      setDeletingRepoId(null); // Clear loading state
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('');
    setSelectedType('');
  };

  const hasActiveFilters = searchQuery !== '' || selectedLanguage !== '' || selectedType !== '';

  return (
    <div className={`fixed h-full bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white transition-all duration-300 ease-in-out z-50 flex flex-col ${
      isOpen ? 'w-96' : 'w-20'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-700/50 flex-shrink-0">
        {isOpen ? (
          <>
            <div className="flex items-center space-x-3 transition-opacity duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-200 to-white bg-clip-text text-transparent">
                Repositories
              </h1>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-purple-700/50 transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-purple-700/50 transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      {isOpen && (
        <div className="p-4 border-b border-purple-700/50 flex-shrink-0">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-purple-800/30 border border-purple-700/50 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex space-x-2 mb-3">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="flex-1 px-3 py-2 bg-purple-800/30 border border-purple-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Languages</option>
              {uniqueLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-1 px-3 py-2 bg-purple-800/30 border border-purple-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Filter Status and Clear Button */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-300">
              {filteredRepositories.length} of {repositories.length} repositories
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-purple-300 hover:text-white transition-colors duration-200 flex items-center space-x-1"
              >
                <X className="w-3 h-3" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Repository List */}
      <div className="flex-1 overflow-hidden">
        {isOpen ? (
          <div className="p-4 h-full">
            <div className="space-y-3 overflow-y-auto h-full pr-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-purple-800">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-purple-300 text-sm">Loading repositories...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <X className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-purple-300 text-sm">{error}</p>
                </div>
              ) : filteredRepositories.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <p className="text-purple-300 text-sm">
                    {hasActiveFilters ? 'No repositories match your search' : 'No repositories found'}
                  </p>
                </div>
              ) : (
                filteredRepositories.map((repo) => {
                  const repoType = getRepositoryType(repo);
                  const TypeIcon = getTypeIcon(repoType);
                  const isDeleting = deletingRepoId === repo._id;
                  
                  return (
                    <div
                      key={repo._id}
                      onClick={() => handleRepoClick(repo)}
                      className="group bg-purple-800/30 hover:bg-purple-700/40 rounded-lg p-4 cursor-pointer transition-all duration-200 border border-purple-700/20 hover:border-purple-600/40 hover:shadow-lg hover:shadow-purple-500/10"
                    >
                      {/* Header with name and type */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <TypeIcon className={`w-4 h-4 ${getTypeColor(repoType)} flex-shrink-0`} />
                          <h4 className="text-sm font-semibold text-white truncate">
                            {repo.name || 'Unnamed Repository'}
                          </h4>
                          {repo.isPrivate && (
                            <Shield className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                          )}
                        </div>
                        <button
                          onClick={(e) => handleDeleteRepo(e, repo._id)}
                          disabled={isDeleting}
                          className="p-1 rounded hover:bg-red-600/30 transition-colors duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete repository"
                        >
                          {isDeleting ? (
                            <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3 text-red-400 hover:text-red-300 flex-shrink-0" />
                          )}
                        </button>
                      </div>
                      
                      {/* Description */}
                      {repo.description && (
                        <p className="text-xs text-purple-200 mb-3 line-clamp-2 leading-relaxed">
                          {repo.description}
                        </p>
                      )}
                      
                      {/* Stats and language */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {repo.language && (
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                              <span className="text-xs text-purple-300">{repo.language}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-purple-300">{repo.stars ?? 0}</span>
                          </div>
                        </div>
                        
                        <span className="text-xs text-purple-400">
                          {repo.lastUpdated || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          // Collapsed state - show minimal repo indicators
          <div className="p-2 space-y-2 overflow-y-auto h-full">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              filteredRepositories.slice(0, 8).map((repo) => {
                const repoType = getRepositoryType(repo);
                const TypeIcon = getTypeIcon(repoType);
                return (
                  <div
                    key={repo._id}
                    onClick={() => handleRepoClick(repo)}
                    className="group w-full p-2 rounded-lg hover:bg-purple-700/30 transition-colors duration-200 cursor-pointer flex justify-center"
                    title={repo.name || 'Unnamed Repository'}
                  >
                    <TypeIcon className={`w-5 h-5 ${getTypeColor(repoType)}`} />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;