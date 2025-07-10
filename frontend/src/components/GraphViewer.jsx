import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import axios from 'axios';
import { 
  GitBranch, 
  Loader2, 
  AlertCircle, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Maximize2,
  Download,
  Settings,
  RefreshCw
} from 'lucide-react';

// Register the dagre layout
cytoscape.use(dagre);

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

// Mock data for preview when no real data is available
// const mockGraphData = {
//   nodes: [
//     { id: 'src/components/App.tsx', type: 'internal' },
//     { id: 'src/components/Header.tsx', type: 'internal' },
//     { id: 'src/components/Sidebar.tsx', type: 'internal' },
//     { id: 'src/utils/helpers.ts', type: 'internal' },
//     { id: 'src/hooks/useAuth.ts', type: 'internal' },
//     { id: 'src/services/api.ts', type: 'internal' },
//     { id: 'react', type: 'external' },
//     { id: 'axios', type: 'external' },
//     { id: 'lodash', type: 'external' },
//     { id: 'src/styles/globals.css', type: 'internal' },
//     { id: 'src/components/Button.tsx', type: 'internal' },
//     { id: 'src/components/Modal.tsx', type: 'internal' }
//   ],
//   edges: [
//     { source: 'src/components/App.tsx', target: 'react' },
//     { source: 'src/components/App.tsx', target: 'src/components/Header.tsx' },
//     { source: 'src/components/App.tsx', target: 'src/components/Sidebar.tsx' },
//     { source: 'src/components/Header.tsx', target: 'react' },
//     { source: 'src/components/Header.tsx', target: 'src/components/Button.tsx' },
//     { source: 'src/components/Sidebar.tsx', target: 'react' },
//     { source: 'src/components/Sidebar.tsx', target: 'src/utils/helpers.ts' },
//     { source: 'src/utils/helpers.ts', target: 'lodash' },
//     { source: 'src/hooks/useAuth.ts', target: 'react' },
//     { source: 'src/services/api.ts', target: 'axios' },
//     { source: 'src/components/Button.tsx', target: 'react' },
//     { source: 'src/components/Modal.tsx', target: 'react' },
//     { source: 'src/components/Modal.tsx', target: 'src/components/Button.tsx' },
//     { source: 'src/components/App.tsx', target: 'src/styles/globals.css' }
//   ]
// };

const GraphDisplay = ({ activeRepoId }) => {
  const cyRef = useRef(null);
  const cyInstance = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState('dagre');
  const [refreshing, setRefreshing] = useState(false); // Added state for refresh loading
  const [name, setName] = useState(null);
  
  // Tooltip state
  const [tooltip, setTooltip] = useState({
    show: false,
    content: '',
    x: 0,
    y: 0
  });

  // Fetch graph data from API
  useEffect(() => {
    if (!activeRepoId) {
      // Use mock data for preview when no repo is selected
      //setGraphData(mockGraphData);
      return;
    }

    const fetchGraphData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.put(`${BASE_URL}/api/v1/repo/getGraph`, null, {
          params: {
            repoId: activeRepoId
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setGraphData(response.data.graph);
        setName(response.data.name);
      } catch (err) {
        console.error('Error fetching graph data:', err);
        setError('Failed to load repository graph data');
        // Fallback to mock data on error for preview
        //setGraphData(mockGraphData);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [activeRepoId]);

  // Helper function to extract filename from path
  const getFileName = (filePath) => {
    if (!filePath) return 'Unknown';
    // Split by '/' and get the last part (filename)
    const parts = filePath.split(/[\\/]/);
    return parts[parts.length - 1] || filePath;
  };

  // Initialize and update Cytoscape
  useEffect(() => {
    if (!cyRef.current || !graphData) return;

    // Destroy existing instance
    if (cyInstance.current) {
      cyInstance.current.destroy();
    }

    // Create new Cytoscape instance
    cyInstance.current = cytoscape({
      container: cyRef.current,
      elements: [
        // Nodes - Updated to use shortened labels
        ...graphData.nodes.map(node => ({
          data: {
            id: node.id,
            label: getFileName(node.id), // Use only filename as label
            fullPath: node.id, // Store full path for tooltips/details
            type: node.type
          }
        })),
        // Edges
        ...graphData.edges.map((edge, index) => ({
          data: {
            id: `edge-${index}`, // Generate unique edge ID
            source: edge.source,
            target: edge.target
          }
        }))
      ],
      style: [
        // Node styles - Enhanced for better visibility
        {
          selector: 'node',
          style: {
            'background-color': ele => getNodeColor(ele.data('type')),
            'label': 'data(label)',
            'width': 100, // Fixed width instead of deprecated 'label'
            'height': 30, // Fixed height instead of deprecated 'label'
            'padding': 10, // Numeric value for padding
            'shape': 'round-rectangle',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': 12, // Numeric value for font size
            'font-weight': 'semi-bold', // Use 'bold' instead of numeric weight
            'color': '#fff',
            'text-outline-width': 1,
            'text-outline-color': '#000',
            'border-width': 2,
            'border-color': '#000',
            // Remove invalid shadow properties - Cytoscape doesn't support these
            'text-wrap': 'wrap',
            'text-max-width': 70 // Numeric value for text max width
          }
        },
        // Edge styles - Improved for better visibility
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#3b3838',
            'target-arrow-color': '#000',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 1.2, // Use arrow-scale instead of target-arrow-size
            'curve-style': 'bezier',
            'opacity': 0.7
            // Remove transition properties as they're not supported
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 3,
            'line-color': '#facc15',
            'target-arrow-color': '#facc15',
            'opacity': 1
          }
        }
      ],
      layout: {
        name: selectedLayout,
        ...(selectedLayout === 'dagre' && {
          rankDir: 'TB', // Top to Bottom
          spacingFactor: 1, // Reduced spacing for more compact layout
          nodeDimensionsIncludeLabels: true,
          rankSep: 200, // Reduced rank separation for tighter layout
          edgeSep: 25, // Reduced edge separation
          nodeSep: 50 // Reduced node separation
        }),
        ...(selectedLayout === 'breadthfirst' && {
          directed: true,
          spacingFactor: 1.2, // Reduced spacing
          orientation: 'vertical'
        }),
        ...(selectedLayout === 'grid' && {
          spacingFactor: 1.4 // Reduced spacing
        }),
        ...(selectedLayout === 'circle' && {
          radius: 180, // Smaller radius for more compact circle
          spacingFactor: 1.5
        })
      },
      wheelSensitivity: 0.2,
      minZoom: 0.1,
      maxZoom: 4 // Increased max zoom for better detail viewing
    });

    // Enhanced event listeners with tooltip functionality
    cyInstance.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      console.log('Node clicked:', {
        filename: node.data('label'),
        fullPath: node.data('fullPath'),
        type: node.data('type')
      });
    });

    // Add mouseover event for showing tooltips
    cyInstance.current.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      const position = evt.renderedPosition;
      
      // Create tooltip content
      const tooltipContent = `
        <div class="tooltip-content">
          <div class="text-xs">
            ${node.data('fullPath').split('\\').slice(5).join('\\')}
          </div>
        </div>
      `;

      node.style({
        'background-color': node.data('type') === 'internal' ? '#9ec0e8' : '#edc168',
      })
      
      setTooltip({
        show: node.data('type') === 'internal' ? true : false,
        content: tooltipContent,
        x: position.x,
        y: position.y - 30 // Position above the node
      });
    });

    // Add mouseout event to hide tooltip
    cyInstance.current.on('mouseout', 'node', (evt) => {
      const node = evt.target;
      setTooltip(prev => ({ ...prev, show: false }));
      node.style({
        'background-color': getNodeColor(node.data('type')),
      })
    });

    // Add mouseover event for edges
    cyInstance.current.on('mouseover', 'edge', (evt) => {
      // const edge = evt.target;
      // const position = evt.renderedPosition;
      
      // const tooltipContent = `
      //   <div class="tooltip-content">
      //     <div class="font-bold text-sm">Dependency</div>
      //     <div class="text-xs text-gray-600 mt-1">${edge.data('source')} → ${edge.data('target')}</div>
      //   </div>
      // `;
      
      // setTooltip({
      //   show: true,
      //   content: tooltipContent,
      //   x: position.x,
      //   y: position.y - 40
      // });
    });

    // Add mouseout event for edges
    // cyInstance.current.on('mouseout', 'edge', () => {
    //   setTooltip(prev => ({ ...prev, show: false }));
    // });

    cyInstance.current.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      console.log('Edge clicked:', edge.data());
    });

    return () => {
      if (cyInstance.current) {
        cyInstance.current.destroy();
        cyInstance.current = null;
      }
    };
  }, [graphData, selectedLayout, name]);

  // Helper function for node colors
  const getNodeColor = (type) => {
    const colors = {
      'internal': '#4a96ed', // Indigo
      'external': '#e8af3c'  // Rose
    };
    return colors[type] || '#6b7280';
  };

  // Control functions
  const handleZoomIn = () => {
    if (cyInstance.current) {
      cyInstance.current.zoom(cyInstance.current.zoom() * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (cyInstance.current) {
      cyInstance.current.zoom(cyInstance.current.zoom() * 0.8);
    }
  };

  const handleResetView = () => {
    if (cyInstance.current) {
      cyInstance.current.fit();
      cyInstance.current.center();
    }
  };

  const handleFitToScreen = () => {
    if (cyInstance.current) {
      cyInstance.current.fit();
    }
  };

  const handleExportPNG = () => {
    if (cyInstance.current) {
      const png = cyInstance.current.png({ scale: 2, full: true });
      const link = document.createElement('a');
      link.download = `repository-graph-${activeRepoId || 'preview'}.png`;
      link.href = png;
      link.click();
    }
  };

  const handleLayoutChange = (layout) => {
    setSelectedLayout(layout);
  };

  // Enhanced refresh function to fetch latest commit and regenerate graph
  const handleRefresh = async () => {
    if (!activeRepoId) return;
    
    try {
      setRefreshing(true);
      setError(null);
      
      // Call API to fetch latest commit and regenerate graph
      const response = await axios.put(`${BASE_URL}/api/v1/repo/refreshGraph?repoId=${activeRepoId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update graph data with the latest version
      setGraphData(response.data.graph);
      
      // Show success feedback (you can enhance this with a toast notification)
      console.log('Graph refreshed successfully with latest commit');
      
    } catch (error) {
      console.error('Error refreshing graph:', error);
      setError('Failed to refresh repository graph. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  if (!activeRepoId) {
    return (
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <GitBranch className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">{name}</h2>
          <p className="text-gray-500 max-w-md">
            Select a repository from the sidebar to visualize its code structure and dependencies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          {/* <div>
            Display graph statistics when available
            {graphData && (
              <p className="text-sm text-gray-500">
                {graphData.nodes.length} files • {graphData.edges.length} dependencies
              </p>
            )}
          </div> */}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Refresh Button - New addition */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            title="Refresh with latest commit"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Layout Selector */}
          <select
            value={selectedLayout}
            onChange={(e) => handleLayoutChange(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="dagre">Hierarchical</option>
            <option value="circle">Circular</option>
            <option value="grid">Grid</option>
            <option value="breadthfirst">Tree</option>
          </select>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg">
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-50 transition-colors duration-200"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-50 transition-colors duration-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleResetView}
              className="p-2 hover:bg-gray-50 transition-colors duration-200"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleFitToScreen}
              className="p-2 hover:bg-gray-50 transition-colors duration-200"
              title="Fit to Screen"
            >
              <Maximize2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportPNG}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
            title="Export as PNG"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative">
        {(loading || refreshing) && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">
                {refreshing ? 'Refreshing with latest commit...' : 'Loading repository graph...'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Graph</h3>
              <p className="text-gray-600 max-w-md">{error}</p>
              {/* Add retry button for errors */}
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !refreshing && !error && graphData && (
          <div 
            ref={cyRef} 
            className="w-full h-full bg-white"
            style={{ minHeight: '500px' }}
          />
        )}

        {!loading && !refreshing && !error && !graphData && (
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <div className="text-center">
              <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Graph Data</h3>
              <p className="text-gray-600 max-w-md">
                No graph data available for this repository. The repository may not have been analyzed yet.
              </p>
              {/* Add refresh button to try generating graph */}
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate Graph</span>
              </button>
            </div>
          </div>
        )}

        {/* Custom Tooltip */}
        {tooltip.show && (
          <div
            className="absolute z-50 bg-gray-200 text-gray-600 px-3 py-2 text-xs rounded-lg shadow-lg pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translateX(-50%)'
            }}
            dangerouslySetInnerHTML={{ __html: tooltip.content }}
          />
        )}
      </div>

      {/* Legend */}
      {graphData && !loading && !refreshing && !error && (
        <div className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-6">
              <div className="text-sm font-medium text-gray-700">Node Types:</div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-xs text-gray-600">Internal Files</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-xs text-gray-600">External Dependencies</span>
                </div>
              </div>
            </div>
            
            {/* Display total file count */}
            {/* <div className="text-xs text-gray-500">
              Total: {graphData.nodes.length} files
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphDisplay;