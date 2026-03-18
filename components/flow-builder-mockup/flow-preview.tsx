'use client';

import { useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Save,
  Download,
  CheckCircle2,
  Box,
  Link2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { FlowNode, FlowConnection, SECTION_POSITIONS, REGIONS, getSectionXPosition, getCanvasWidth } from './types';
import { getNodesBySection } from './mock-data';
import { cn } from '@/lib/utils';

interface FlowPreviewProps {
  region: string | null;
  sectionHeaders: string[];
  nodes: FlowNode[];
  connections: FlowConnection[];
  onEditConfiguration: () => void;
}

export function FlowPreview({
  region,
  sectionHeaders,
  nodes,
  connections,
  onEditConfiguration,
}: FlowPreviewProps) {
  const regionData = REGIONS.find((r) => r.id === region);
  
  // Zoom state with min 25%, max 200%, step 25%
  const [zoomLevel, setZoomLevel] = useState(100);
  const ZOOM_MIN = 25;
  const ZOOM_MAX = 200;
  const ZOOM_STEP = 25;

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(100);
  }, []);

  // Calculate canvas dimensions based on nodes and section count
  const canvasDimensions = useMemo(() => {
    const maxY = nodes.length > 0 
      ? Math.max(...nodes.map((n) => (n.yPosition || 0) + SECTION_POSITIONS.NODE_HEIGHT))
      : SECTION_POSITIONS.FIRST_NODE_Y + SECTION_POSITIONS.NODE_HEIGHT;
    return {
      width: getCanvasWidth(sectionHeaders.length),
      height: Math.max(maxY + 100, 600),
    };
  }, [nodes, sectionHeaders.length]);

  // Generate SVG paths for connections
  const connectionPaths = useMemo(() => {
    return connections.map((conn) => {
      const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
      const toNode = nodes.find((n) => n.id === conn.toNodeId);

      if (!fromNode || !toNode) return null;

      const fromX = (fromNode.xPosition || 0) + SECTION_POSITIONS.NODE_WIDTH;
      const fromY = (fromNode.yPosition || 0) + SECTION_POSITIONS.NODE_HEIGHT / 2;
      const toX = toNode.xPosition || 0;
      const toY = (toNode.yPosition || 0) + SECTION_POSITIONS.NODE_HEIGHT / 2;

      // Create a curved path
      const midX = (fromX + toX) / 2;

      return {
        id: conn.id,
        path: `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`,
        fromNode,
        toNode,
      };
    }).filter(Boolean);
  }, [connections, nodes]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">Flow Preview</h2>
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Generated
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Review your generated flow diagram. You can edit the configuration or save.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onEditConfiguration}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Config
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Flow
          </Button>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Box className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{nodes.length}</p>
              <p className="text-xs text-muted-foreground">Total Nodes</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{connections.length}</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-lg font-bold text-primary">{sectionHeaders.length}</span>
            </div>
            <div>
              <p className="text-2xl font-bold">Sections</p>
              <p className="text-xs text-muted-foreground">{regionData?.name || 'N/A'}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ExternalLink className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{nodes.filter((n) => n.type === 'External').length}</p>
              <p className="text-xs text-muted-foreground">External Nodes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Flow Diagram Canvas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Flow Diagram</CardTitle>
            <CardDescription>
              {regionData?.name} - {regionData?.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleZoomOut}
              disabled={zoomLevel <= ZOOM_MIN}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <button 
              onClick={handleResetZoom}
              className="min-w-[50px] text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Reset to 100%"
            >
              {zoomLevel}%
            </button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleZoomIn}
              disabled={zoomLevel >= ZOOM_MAX}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border bg-muted/30">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top left',
                width: canvasDimensions.width,
                height: canvasDimensions.height,
                transition: 'transform 0.2s ease-out',
              }}
            >
              <svg
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                className="min-w-full"
              >
              {/* Section Headers */}
              {sectionHeaders.map((header, index) => {
                const x = getSectionXPosition(index);

                return (
                  <g key={`header-${index}`}>
                    {/* Section background */}
                    <rect
                      x={x - 20}
                      y={10}
                      width={SECTION_POSITIONS.NODE_WIDTH + 40}
                      height={canvasDimensions.height - 20}
                      rx={8}
                      className="fill-muted/50"
                    />
                    {/* Header text */}
                    <text
                      x={x + SECTION_POSITIONS.NODE_WIDTH / 2}
                      y={50}
                      textAnchor="middle"
                      className="fill-foreground text-sm font-semibold"
                    >
                      {header}
                    </text>
                    {/* Node count badge */}
                    <text
                      x={x + SECTION_POSITIONS.NODE_WIDTH / 2}
                      y={70}
                      textAnchor="middle"
                      className="fill-muted-foreground text-xs"
                    >
                      {getNodesBySection(nodes, index).length} nodes
                    </text>
                  </g>
                );
              })}

              {/* Connection Lines */}
              <g className="connections">
                {connectionPaths.map((conn) =>
                  conn ? (
                    <g key={conn.id}>
                      <path
                        d={conn.path}
                        fill="none"
                        strokeWidth={2}
                        className="stroke-primary/60"
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  ) : null
                )}
              </g>

              {/* Arrow marker definition */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    className="fill-primary/60"
                  />
                </marker>
              </defs>

              {/* Nodes */}
              {nodes.map((node) => {
                const x = node.xPosition || 0;
                const y = node.yPosition || 0;
                const isExternal = node.type === 'External';

                return (
                  <g key={node.id} className="cursor-pointer">
                    {/* Node background */}
                    <rect
                      x={x}
                      y={y}
                      width={SECTION_POSITIONS.NODE_WIDTH}
                      height={SECTION_POSITIONS.NODE_HEIGHT}
                      rx={8}
                      className={cn(
                        'fill-card stroke-border stroke-2 transition-colors hover:stroke-primary',
                        isExternal && 'stroke-dashed'
                      )}
                    />

                    {/* Node header bar */}
                    <rect
                      x={x}
                      y={y}
                      width={SECTION_POSITIONS.NODE_WIDTH}
                      height={40}
                      rx={8}
                      className={cn(
                        'fill-primary',
                        isExternal && 'fill-orange-500'
                      )}
                    />
                    <rect
                      x={x}
                      y={y + 32}
                      width={SECTION_POSITIONS.NODE_WIDTH}
                      height={8}
                      className={cn(
                        'fill-primary',
                        isExternal && 'fill-orange-500'
                      )}
                    />

                    {/* App Name */}
                    <text
                      x={x + SECTION_POSITIONS.NODE_WIDTH / 2}
                      y={y + 26}
                      textAnchor="middle"
                      className="fill-primary-foreground text-sm font-semibold"
                    >
                      {node.appName}
                    </text>

                    {/* App ID */}
                    <text
                      x={x + SECTION_POSITIONS.NODE_WIDTH / 2}
                      y={y + 70}
                      textAnchor="middle"
                      className="fill-muted-foreground text-xs"
                    >
                      {node.appId}
                    </text>

                    {/* Description (truncated) */}
                    <text
                      x={x + SECTION_POSITIONS.NODE_WIDTH / 2}
                      y={y + 95}
                      textAnchor="middle"
                      className="fill-foreground text-xs"
                    >
                      {node.description.length > 30
                        ? node.description.substring(0, 30) + '...'
                        : node.description}
                    </text>

                    {/* Type badge */}
                    {isExternal && (
                      <g>
                        <rect
                          x={x + SECTION_POSITIONS.NODE_WIDTH - 70}
                          y={y + SECTION_POSITIONS.NODE_HEIGHT - 30}
                          width={60}
                          height={20}
                          rx={4}
                          className="fill-orange-100 dark:fill-orange-900/50"
                        />
                        <text
                          x={x + SECTION_POSITIONS.NODE_WIDTH - 40}
                          y={y + SECTION_POSITIONS.NODE_HEIGHT - 16}
                          textAnchor="middle"
                          className="fill-orange-600 dark:fill-orange-400 text-xs"
                        >
                          External
                        </text>
                      </g>
                    )}

                    {/* Size indicator */}
                    <text
                      x={x + 10}
                      y={y + SECTION_POSITIONS.NODE_HEIGHT - 10}
                      className="fill-muted-foreground text-xs"
                    >
                      {SECTION_POSITIONS.NODE_WIDTH}x{SECTION_POSITIONS.NODE_HEIGHT}
                    </text>
                  </g>
                );
              })}
            </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Node Positions</CardTitle>
          <CardDescription>
            Auto-calculated positions for each node. Default size: 294x174
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left font-medium">App ID</th>
                  <th className="p-2 text-left font-medium">App Name</th>
                  <th className="p-2 text-left font-medium">Section</th>
                  <th className="p-2 text-left font-medium">X Position</th>
                  <th className="p-2 text-left font-medium">Y Position</th>
                  <th className="p-2 text-left font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => (
                  <tr key={node.id} className="border-b last:border-0">
                    <td className="p-2 font-mono text-xs">{node.appId}</td>
                    <td className="p-2">{node.appName}</td>
                    <td className="p-2">{sectionHeaders[node.sectionIndex]}</td>
                    <td className="p-2 font-mono">{node.xPosition}</td>
                    <td className="p-2 font-mono">{node.yPosition}</td>
                    <td className="p-2">
                      <Badge variant={node.type === 'External' ? 'outline' : 'secondary'}>
                        {node.type}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
