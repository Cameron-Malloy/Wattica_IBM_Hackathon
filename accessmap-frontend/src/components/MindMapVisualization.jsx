import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Panel,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  UsersIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';

// Custom node components
const CustomNode = ({ data, selected }) => {
  const getNodeColor = () => {
    switch (data.type) {
      case 'root': return 'from-purple-600 to-blue-600';
      case 'severity': return data.severity === 'critical' ? 'from-red-500 to-red-600' : 
                             data.severity === 'high' ? 'from-orange-500 to-orange-600' :
                             data.severity === 'moderate' ? 'from-yellow-500 to-yellow-600' :
                             'from-green-500 to-green-600';
      case 'location': return 'from-blue-500 to-cyan-500';
      case 'issue': return 'from-gray-500 to-gray-600';
      case 'recommendation': return 'from-emerald-500 to-teal-500';
      case 'impact': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getIcon = () => {
    switch (data.type) {
      case 'root': return <MapIcon className="h-6 w-6 text-white" />;
      case 'severity': return <ExclamationTriangleIcon className="h-5 w-5 text-white" />;
      case 'location': return <BuildingOfficeIcon className="h-5 w-5 text-white" />;
      case 'issue': return <ComputerDesktopIcon className="h-5 w-5 text-white" />;
      case 'recommendation': return <LightBulbIcon className="h-5 w-5 text-white" />;
      case 'impact': return <UserGroupIcon className="h-5 w-5 text-white" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-white" />;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative bg-gradient-to-r ${getNodeColor()} rounded-xl shadow-lg border-2 ${
        selected ? 'border-white' : 'border-transparent'
      } transition-all duration-200`}
      style={{ minWidth: data.type === 'root' ? 200 : 150, minHeight: data.type === 'root' ? 80 : 60 }}
    >
      <div className="p-3 flex items-center space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">
            {data.label}
          </p>
          {data.subtitle && (
            <p className="text-white/80 text-xs truncate">
              {data.subtitle}
            </p>
          )}
        </div>
      </div>
      
      {data.count && (
        <div className="absolute -top-2 -right-2 bg-white text-gray-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
          {data.count}
        </div>
      )}
    </motion.div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const MindMapVisualization = ({ results, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // overview, severity, location, recommendations

  // Generate mind map data
  const mindMapData = useMemo(() => {
    if (!results?.scan_results) return { nodes: [], edges: [] };

    const scanResults = results.scan_results;
    const recommendations = results.recommendations || [];
    const nodes = [];
    const edges = [];

    // Root node
    const rootNode = {
      id: 'root',
      type: 'custom',
      position: { x: 400, y: 200 },
      data: {
        type: 'root',
        label: 'Accessibility Analysis',
        subtitle: `${scanResults.length} Issues Found`,
        count: scanResults.length
      }
    };
    nodes.push(rootNode);

    if (viewMode === 'overview' || viewMode === 'severity') {
      // Severity clusters
      const severityGroups = scanResults.reduce((acc, item) => {
        if (!acc[item.severity]) acc[item.severity] = [];
        acc[item.severity].push(item);
        return acc;
      }, {});

      Object.entries(severityGroups).forEach(([severity, items], index) => {
        const angle = (index / Object.keys(severityGroups).length) * 2 * Math.PI;
        const radius = 250;
        const x = 400 + Math.cos(angle) * radius;
        const y = 200 + Math.sin(angle) * radius;

        const severityNode = {
          id: `severity-${severity}`,
          type: 'custom',
          position: { x, y },
          data: {
            type: 'severity',
            severity,
            label: severity.toUpperCase(),
            subtitle: `${items.length} issues`,
            count: items.length
          }
        };
        nodes.push(severityNode);

        // Edge from root to severity
        edges.push({
          id: `edge-root-severity-${severity}`,
          source: 'root',
          target: `severity-${severity}`,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: severity === 'critical' ? '#DC2626' : 
                          severity === 'high' ? '#EA580C' :
                          severity === 'moderate' ? '#D97706' : '#65A30D' }
        });

        // Add issue nodes for each severity (limit to top 5)
        items.slice(0, 5).forEach((item, itemIndex) => {
          const itemAngle = angle + (itemIndex - 2) * 0.3;
          const itemRadius = 120;
          const itemX = x + Math.cos(itemAngle) * itemRadius;
          const itemY = y + Math.sin(itemAngle) * itemRadius;

          const issueNode = {
            id: `issue-${item.id}`,
            type: 'custom',
            position: { x: itemX, y: itemY },
            data: {
              type: 'issue',
              label: item.issue_type?.replace(/_/g, ' ') || 'Unknown Issue',
              subtitle: item.location?.split(',')[0] || 'Unknown Location',
              clickable: true,
              issueData: item
            }
          };
          nodes.push(issueNode);

          edges.push({
            id: `edge-severity-issue-${item.id}`,
            source: `severity-${severity}`,
            target: `issue-${item.id}`,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#6B7280', strokeWidth: 1 }
          });
        });
      });
    }

    if (viewMode === 'location') {
      // Location clusters
      const locationGroups = scanResults.reduce((acc, item) => {
        const location = item.location?.split(',')[0] || 'Unknown';
        if (!acc[location]) acc[location] = [];
        acc[location].push(item);
        return acc;
      }, {});

      Object.entries(locationGroups).slice(0, 8).forEach(([location, items], index) => {
        const angle = (index / Math.min(8, Object.keys(locationGroups).length)) * 2 * Math.PI;
        const radius = 300;
        const x = 400 + Math.cos(angle) * radius;
        const y = 200 + Math.sin(angle) * radius;

        const locationNode = {
          id: `location-${location}`,
          type: 'custom',
          position: { x, y },
          data: {
            type: 'location',
            label: location,
            subtitle: `${items.length} issues`,
            count: items.length
          }
        };
        nodes.push(locationNode);

        edges.push({
          id: `edge-root-location-${location}`,
          source: 'root',
          target: `location-${location}`,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#3B82F6' }
        });
      });
    }

    if (viewMode === 'recommendations') {
      // Recommendation clusters
      const recGroups = recommendations.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
      }, {});

      Object.entries(recGroups).forEach(([type, items], index) => {
        const angle = (index / Object.keys(recGroups).length) * 2 * Math.PI;
        const radius = 280;
        const x = 400 + Math.cos(angle) * radius;
        const y = 200 + Math.sin(angle) * radius;

        const recNode = {
          id: `rec-type-${type}`,
          type: 'custom',
          position: { x, y },
          data: {
            type: 'recommendation',
            label: type.toUpperCase(),
            subtitle: `${items.length} recommendations`,
            count: items.length
          }
        };
        nodes.push(recNode);

        edges.push({
          id: `edge-root-rec-${type}`,
          source: 'root',
          target: `rec-type-${type}`,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#059669' }
        });

        // Add individual recommendations (limit to top 3)
        items.slice(0, 3).forEach((item, itemIndex) => {
          const itemAngle = angle + (itemIndex - 1) * 0.4;
          const itemRadius = 150;
          const itemX = x + Math.cos(itemAngle) * itemRadius;
          const itemY = y + Math.sin(itemAngle) * itemRadius;

          const recItemNode = {
            id: `rec-item-${item.id}`,
            type: 'custom',
            position: { x: itemX, y: itemY },
            data: {
              type: 'impact',
              label: item.title?.substring(0, 30) + '...' || 'Unknown',
              subtitle: `${item.priority_level || item.priority} priority`,
              clickable: true,
              recommendationData: item
            }
          };
          nodes.push(recItemNode);

          edges.push({
            id: `edge-rec-item-${item.id}`,
            source: `rec-type-${type}`,
            target: `rec-item-${item.id}`,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#6B7280', strokeWidth: 1 }
          });
        });
      });
    }

    return { nodes, edges };
  }, [results, viewMode]);

  // Update nodes and edges when data changes
  React.useEffect(() => {
    setNodes(mindMapData.nodes);
    setEdges(mindMapData.edges);
  }, [mindMapData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    if (node.data.clickable && node.data.issueData && onNodeClick) {
      onNodeClick(node.data.issueData);
    }
    if (node.data.clickable && node.data.recommendationData && onNodeClick) {
      onNodeClick(node.data.recommendationData);
    }
  }, [onNodeClick]);

  const viewModes = [
    { key: 'overview', label: 'Overview', icon: EyeIcon },
    { key: 'severity', label: 'By Severity', icon: ExclamationTriangleIcon },
    { key: 'location', label: 'By Location', icon: MapIcon },
    { key: 'recommendations', label: 'Recommendations', icon: LightBulbIcon }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapIcon className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Mind Map Visualization</h2>
          </div>
          <div className="flex items-center space-x-2">
            {viewModes.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <button
                  key={mode.key}
                  onClick={() => setViewMode(mode.key)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-all ${
                    viewMode === mode.key
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mind Map */}
      <div style={{ width: '100%', height: '600px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Controls />
          <MiniMap 
            nodeStrokeColor="#374151"
            nodeColor="#9CA3AF"
            nodeBorderRadius={8}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          <Background variant="dots" gap={12} size={1} />
          
          <Panel position="top-right" className="bg-white/90 backdrop-blur-sm rounded-lg p-3 m-4">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Critical Issues</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>High Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Moderate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Low Priority</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Selected Node Details */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 bg-gray-50 px-6 py-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Node Details</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Label</p>
                <p className="text-gray-900">{selectedNode.data.label}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Type</p>
                <p className="text-gray-900">{selectedNode.data.type}</p>
              </div>
              {selectedNode.data.subtitle && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Details</p>
                  <p className="text-gray-900">{selectedNode.data.subtitle}</p>
                </div>
              )}
              {selectedNode.data.count && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Count</p>
                  <p className="text-gray-900">{selectedNode.data.count}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MindMapVisualization;
