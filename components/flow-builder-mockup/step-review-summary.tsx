'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Globe,
  LayoutGrid,
  Box,
  Link2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { FlowNode, FlowConnection, REGIONS } from './types';
import { getNodesBySection } from './mock-data';

interface StepReviewSummaryProps {
  region: string | null;
  sectionHeaders: [string, string, string, string];
  nodes: FlowNode[];
  connections: FlowConnection[];
}

export function StepReviewSummary({
  region,
  sectionHeaders,
  nodes,
  connections,
}: StepReviewSummaryProps) {
  const regionData = REGIONS.find((r) => r.id === region);

  const nodesWithoutConnections = nodes.filter((node) => {
    const hasOutgoing = connections.some((c) => c.fromNodeId === node.id);
    const hasIncoming = connections.some((c) => c.toNodeId === node.id);
    return !hasOutgoing && !hasIncoming;
  });

  const isValid = region && nodes.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Review Configuration</h2>
        <p className="text-muted-foreground">
          Review your flow configuration before generating the diagram.
        </p>
      </div>

      {/* Validation Status */}
      <div
        className={`flex items-center gap-3 rounded-lg border p-4 ${
          isValid
            ? 'border-green-500/50 bg-green-500/10'
            : 'border-destructive/50 bg-destructive/10'
        }`}
      >
        {isValid ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Configuration Valid
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your flow is ready to be generated.
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Configuration Incomplete</p>
              <p className="text-sm text-destructive/80">
                Please ensure you have selected a region and added at least one node.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Region Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Region</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {regionData ? (
              <div>
                <p className="text-lg font-semibold">{regionData.name}</p>
                <p className="text-sm text-muted-foreground">{regionData.description}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No region selected</p>
            )}
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Box className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-primary">{nodes.length}</p>
                <p className="text-sm text-muted-foreground">Total Nodes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{connections.length}</p>
                <p className="text-sm text-muted-foreground">Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Section Breakdown</CardTitle>
          </div>
          <CardDescription>Nodes organized by section</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sectionHeaders.map((header, index) => {
              const sectionNodes = getNodesBySection(nodes, index);
              return (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="h-6 w-6 rounded-full p-0 text-xs">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{header}</span>
                    </div>
                    <Badge variant="secondary">{sectionNodes.length} nodes</Badge>
                  </div>
                  {sectionNodes.length > 0 && (
                    <div className="ml-8 mt-2 space-y-1">
                      {sectionNodes.map((node) => (
                        <div
                          key={node.id}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <ChevronRight className="h-3 w-3" />
                          <span>{node.appName}</span>
                          <span className="text-xs">({node.appId})</span>
                          {node.type === 'External' && (
                            <Badge variant="outline" className="text-xs">
                              External
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {index < sectionHeaders.length - 1 && <Separator className="mt-4" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Connections Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Connections Summary</CardTitle>
          </div>
          <CardDescription>{connections.length} connection(s) defined</CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No connections defined</p>
          ) : (
            <div className="space-y-2">
              {connections.slice(0, 5).map((conn) => {
                const from = nodes.find((n) => n.id === conn.fromNodeId);
                const to = nodes.find((n) => n.id === conn.toNodeId);
                return (
                  <div key={conn.id} className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{from?.appName}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{to?.appName}</span>
                  </div>
                );
              })}
              {connections.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  ... and {connections.length - 5} more connections
                </p>
              )}
            </div>
          )}

          {nodesWithoutConnections.length > 0 && (
            <div className="mt-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="mr-1 inline h-4 w-4" />
                {nodesWithoutConnections.length} node(s) have no connections
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
