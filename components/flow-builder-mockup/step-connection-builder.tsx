'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ArrowRight, Link2, AlertCircle } from 'lucide-react';
import { FlowNode, FlowConnection } from './types';
import { cn } from '@/lib/utils';

interface StepConnectionBuilderProps {
  nodes: FlowNode[];
  connections: FlowConnection[];
  onAddConnection: (fromNodeId: string, toNodeId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
}

export function StepConnectionBuilder({
  nodes,
  connections,
  onAddConnection,
  onDeleteConnection,
}: StepConnectionBuilderProps) {
  const [fromNode, setFromNode] = useState<string>('');
  const [toNode, setToNode] = useState<string>('');

  const handleAddConnection = () => {
    if (fromNode && toNode && fromNode !== toNode) {
      // Check for duplicate
      const isDuplicate = connections.some(
        (conn) => conn.fromNodeId === fromNode && conn.toNodeId === toNode
      );
      if (!isDuplicate) {
        onAddConnection(fromNode, toNode);
        setFromNode('');
        setToNode('');
      }
    }
  };

  const getNodeById = (nodeId: string) => nodes.find((n) => n.id === nodeId);

  // Find nodes without connections
  const nodesWithoutConnections = nodes.filter((node) => {
    const hasOutgoing = connections.some((c) => c.fromNodeId === node.id);
    const hasIncoming = connections.some((c) => c.toNodeId === node.id);
    return !hasOutgoing && !hasIncoming;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Define Connections</h2>
        <p className="text-muted-foreground">
          Create connections between nodes to define how data flows through your payment system.
        </p>
      </div>

      {/* Add Connection Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Add New Connection</CardTitle>
          <CardDescription>Select the source and target nodes for the connection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label>From Node</Label>
              <Select value={fromNode} onValueChange={setFromNode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source node" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.appName} ({node.appId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground mb-2 hidden sm:block" />

            <div className="flex-1 min-w-[200px] space-y-2">
              <Label>To Node</Label>
              <Select value={toNode} onValueChange={setToNode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target node" />
                </SelectTrigger>
                <SelectContent>
                  {nodes
                    .filter((n) => n.id !== fromNode)
                    .map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.appName} ({node.appId})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAddConnection}
              disabled={!fromNode || !toNode || fromNode === toNode}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warning for unconnected nodes */}
      {nodesWithoutConnections.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Unconnected Nodes
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              The following nodes have no connections:{' '}
              {nodesWithoutConnections.map((n) => n.appName).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Connections List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Connections</CardTitle>
              <CardDescription>{connections.length} connection(s) defined</CardDescription>
            </div>
            <Badge variant="secondary">
              <Link2 className="mr-1 h-3 w-3" />
              {connections.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <Link2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">No connections yet</p>
              <p className="text-xs text-muted-foreground">
                Use the form above to create connections between nodes
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {connections.map((connection, index) => {
                const from = getNodeById(connection.fromNodeId);
                const to = getNodeById(connection.toNodeId);

                return (
                  <div
                    key={connection.id}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{from?.appName}</span>
                        <span className="text-xs text-muted-foreground">{from?.appId}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{to?.appName}</span>
                        <span className="text-xs text-muted-foreground">{to?.appId}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDeleteConnection(connection.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
