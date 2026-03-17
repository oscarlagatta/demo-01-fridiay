'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, GripVertical, Box, ExternalLink } from 'lucide-react';
import { FlowNode } from './types';
import { getNodesBySection } from './mock-data';
import { cn } from '@/lib/utils';

interface StepNodeConfigurationProps {
  sectionHeaders: [string, string, string, string];
  nodes: FlowNode[];
  onAddNode: (node: Omit<FlowNode, 'id' | 'xPosition' | 'yPosition'>) => void;
  onDeleteNode: (nodeId: string) => void;
}

export function StepNodeConfiguration({
  sectionHeaders,
  nodes,
  onAddNode,
  onDeleteNode,
}: StepNodeConfigurationProps) {
  const [activeSection, setActiveSection] = useState('0');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNode, setNewNode] = useState({
    appId: '',
    appName: '',
    description: '',
    type: 'Internal' as 'Internal' | 'External',
  });

  const handleAddNode = () => {
    const sectionIndex = parseInt(activeSection) as 0 | 1 | 2 | 3;
    const sectionNodes = getNodesBySection(nodes, sectionIndex);

    onAddNode({
      appId: newNode.appId,
      appName: newNode.appName,
      description: newNode.description,
      type: newNode.type,
      sectionIndex,
      orderInSection: sectionNodes.length,
    });

    setNewNode({ appId: '', appName: '', description: '', type: 'Internal' });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Configure Nodes</h2>
        <p className="text-muted-foreground">
          Add application nodes to each section of your flow. Each node represents a system or
          service in the payment process.
        </p>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {sectionHeaders.map((header, index) => {
            const sectionNodes = getNodesBySection(nodes, index);
            return (
              <TabsTrigger key={index} value={String(index)} className="gap-2">
                <span className="hidden sm:inline">{header}</span>
                <span className="sm:hidden">S{index + 1}</span>
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {sectionNodes.length}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {sectionHeaders.map((header, sectionIndex) => {
          const sectionNodes = getNodesBySection(nodes, sectionIndex);

          return (
            <TabsContent key={sectionIndex} value={String(sectionIndex)} className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-lg">{header}</CardTitle>
                    <CardDescription>
                      {sectionNodes.length} node{sectionNodes.length !== 1 ? 's' : ''} configured
                    </CardDescription>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Node
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Node</DialogTitle>
                        <DialogDescription>
                          Add a new application node to the {header} section.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="appId">App ID *</Label>
                            <Input
                              id="appId"
                              value={newNode.appId}
                              onChange={(e) => setNewNode({ ...newNode, appId: e.target.value })}
                              placeholder="e.g., APP001"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="appName">App Name *</Label>
                            <Input
                              id="appName"
                              value={newNode.appName}
                              onChange={(e) => setNewNode({ ...newNode, appName: e.target.value })}
                              placeholder="e.g., Payment Gateway"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Node Type</Label>
                          <Select
                            value={newNode.type}
                            onValueChange={(value: 'Internal' | 'External') =>
                              setNewNode({ ...newNode, type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Internal">Internal</SelectItem>
                              <SelectItem value="External">External</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newNode.description}
                            onChange={(e) =>
                              setNewNode({ ...newNode, description: e.target.value })
                            }
                            placeholder="Brief description of the node's purpose"
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddNode}
                          disabled={!newNode.appId || !newNode.appName}
                        >
                          Add Node
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {sectionNodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                      <Box className="mb-3 h-10 w-10 text-muted-foreground/50" />
                      <p className="text-sm font-medium text-muted-foreground">No nodes yet</p>
                      <p className="text-xs text-muted-foreground">
                        Click &quot;Add Node&quot; to add your first node to this section
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sectionNodes.map((node, index) => (
                        <div
                          key={node.id}
                          className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                        >
                          <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-sm font-medium text-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{node.appName}</span>
                              <Badge
                                variant={node.type === 'External' ? 'outline' : 'secondary'}
                                className="text-xs"
                              >
                                {node.type === 'External' && (
                                  <ExternalLink className="mr-1 h-3 w-3" />
                                )}
                                {node.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {node.appId} - {node.description || 'No description'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onDeleteNode(node.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="grid grid-cols-4 gap-2 rounded-lg border bg-muted/30 p-3">
        {sectionHeaders.map((header, index) => {
          const count = getNodesBySection(nodes, index).length;
          return (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-primary">{count}</div>
              <div className="text-xs text-muted-foreground truncate">{header}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
