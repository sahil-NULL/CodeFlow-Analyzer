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


const GraphDisplay = ({ activeRepoId }) => {
  const cyRef = useRef(null);
  const cyInstance = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState('dagre');

  // Fetch graph data from API
  useEffect(() => {
    if (!activeRepoId) {
      setGraphData(null);
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
      } catch (err) {
        console.error('Error fetching graph data:', err);
        setError('Failed to load repository graph data');
        setGraphData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [activeRepoId]);

  const getFileName = (filePath) => {
    if (!filePath) return 'Unknown';
    // Split by '/' and get the last part (filename)
    const parts = filePath.split('\\');
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
        // Nodes
        ...graphData.nodes.map(node => ({
          data: {
            id: node.id,
            label: getFileName(node.id),
            fullPath: node.id, // Use id as label
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
        // Node styles
        {
          selector: 'node',
          style: {
            'background-color': ele => getNodeColor(ele.data('type')),
            'label': 'data(label)',
            'width': 'label',
            'height': 'label',
            'padding': '10px',
            'shape': 'round-rectangle',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '11px',
            'font-weight': '600',
            'color': '#fff',
            'text-outline-width': 1,
            'text-outline-color': '#000',
            'border-width': 2,
            'border-color': '#6366f1',
            'shadow-blur': 8,
            'shadow-color': '#999',
            'shadow-opacity': 0.4,
            'text-wrap': 'wrap',
            'text-max-width': 120
          }
        },
        {
          selector: 'node:hover',
          style: {
            'background-color': '#a855f7',
            'border-color': '#c084fc',
            'transform': 'scale(1.1)',
            'width': 50,
            'height': 50
          }
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#c084fc',
            'border-color': '#e879f9',
            'border-width': 3,
            'transform': 'scale(1.05)',
          }
        },
        // Edge styles
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#a78bfa',
            'target-arrow-color': '#a78bfa',
            'target-arrow-shape': 'triangle',
            'target-arrow-size': 10,
            'curve-style': 'bezier',
            'opacity': 0.6,
            'transition-property': 'width, line-color, opacity',
            'transition-duration': '0.2s'
          }
        },
        {
          selector: 'edge:hover',
          style: {
            'width': 3,
            'line-color': '#c084fc',
            'target-arrow-color': '#c084fc',
            'opacity': 1
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
          spacingFactor: 0.8,
          nodeDimensionsIncludeLabels: true,
          rankSep: 80,
          edgeSep: 15,
          nodeSep: 30
        }),
        ...(selectedLayout === 'breadthfirst' && {
          directed: true,
          spacingFactor: 1.4,
          orientation: 'vertical'
        }),
        ...(selectedLayout === 'grid' && {
          spacingFactor: 1.4
        }),
        ...(selectedLayout === 'circle' && {
          radius: 200,
          spacingFactor: 2
        })
      },
      wheelSensitivity: 0.2,
      minZoom: 0.1,
      maxZoom: 3
    });

    // Add event listeners
    cyInstance.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      console.log('Node clicked:', node.data());
    });

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
  }, [graphData, selectedLayout]);

  // Helper function for node colors
  const getNodeColor = (type) => {
    const colors = {
      'internal': '#6366f1', // Indigo
      'external': '#f43f5e'  // Rose
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
      link.download = `repository-graph-${activeRepoId}.png`;
      link.href = png;
      link.click();
    }
  };

  const handleLayoutChange = (layout) => {
    setSelectedLayout(layout);
  };

  const updateGraph = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`${BASE_URL}/api/v1/repo/getGraph`, null, {
        params: {
          repoId: activeRepoId
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setGraphData(response.data.graph);
      setLoading(false);
    } catch (error) {
      console.error('Error updating graph:', error);
      setError('Failed to update repository graph');
      setLoading(false);
    }  
  };

  if (!activeRepoId) {
    return (
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <GitBranch className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Repository Graph Viewer</h2>
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
          <div>
            
            {graphData && (
              <p className="text-sm text-gray-500">
                {/* {graphData.nodes.length} nodes • {graphData.edges.length} edges */}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
        <button
            onClick={updateGraph}
            disabled={loading}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            title="Refresh with latest commit"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm">{loading ? 'Refreshing...' : 'Refresh'}</span>
            {console.log("graph rerendered")}
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
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Loading repository graph...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Graph</h3>
              <p className="text-gray-600 max-w-md">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && graphData && (
          <div 
            ref={cyRef} 
            className="w-full h-full bg-white"
            style={{ minHeight: '500px' }}
          />
        )}

        {!loading && !error && !graphData && (
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <div className="text-center">
              <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Graph Data</h3>
              <p className="text-gray-600 max-w-md">
                No graph data available for this repository. The repository may not have been analyzed yet.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {graphData && !loading && !error && (
        <div className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-6">
              <div className="text-sm font-medium text-gray-700">Node Types:</div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-xs text-gray-600">Internal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs text-gray-600">External</span>
                </div>
              </div>
            </div>
            
            {/* <div className="text-xs text-gray-500">
              Repository ID: {activeRepoId}
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphDisplay;