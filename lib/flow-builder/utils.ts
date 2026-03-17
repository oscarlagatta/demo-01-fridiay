/**
 * Flow Builder - Utility Functions
 * 
 * Pure functions for flow builder operations.
 * No framework dependencies - can be used anywhere.
 */

import {
  FlowNode,
  FlowConnection,
  FlowConfiguration,
  PositionConfig,
  DEFAULT_POSITION_CONFIG,
} from './types';

// ============================================
// ID Generation
// ============================================

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================
// Position Calculations
// ============================================

export function calculateNodePosition(
  sectionIndex: number,
  orderInSection: number,
  config: PositionConfig = DEFAULT_POSITION_CONFIG
): { xPosition: number; yPosition: number } {
  const xPosition = config.sectionXPositions[sectionIndex] ?? config.sectionXPositions[0];
  const yPosition =
    config.firstNodeY +
    (config.defaultNodeHeight + config.nodeGapY) * orderInSection;

  return { xPosition, yPosition };
}

export function recalculateAllPositions(
  nodes: FlowNode[],
  config: PositionConfig = DEFAULT_POSITION_CONFIG
): FlowNode[] {
  // Group nodes by section
  const nodesBySection: FlowNode[][] = [[], [], [], []];
  nodes.forEach((node) => {
    if (node.sectionIndex >= 0 && node.sectionIndex <= 3) {
      nodesBySection[node.sectionIndex].push(node);
    }
  });

  // Sort each section by orderInSection and recalculate positions
  const repositionedNodes: FlowNode[] = [];
  nodesBySection.forEach((sectionNodes, sectionIndex) => {
    const sortedNodes = [...sectionNodes].sort((a, b) => a.orderInSection - b.orderInSection);
    sortedNodes.forEach((node, index) => {
      const { xPosition, yPosition } = calculateNodePosition(sectionIndex, index, config);
      repositionedNodes.push({
        ...node,
        orderInSection: index,
        xPosition,
        yPosition,
      });
    });
  });

  return repositionedNodes;
}

// ============================================
// Node Operations
// ============================================

export function createNode(
  data: Omit<FlowNode, 'id' | 'xPosition' | 'yPosition' | 'nodeWidth' | 'nodeHeight'>,
  config: PositionConfig = DEFAULT_POSITION_CONFIG
): FlowNode {
  const { xPosition, yPosition } = calculateNodePosition(
    data.sectionIndex,
    data.orderInSection,
    config
  );

  return {
    ...data,
    id: generateId('node'),
    xPosition,
    yPosition,
    nodeWidth: config.defaultNodeWidth,
    nodeHeight: config.defaultNodeHeight,
  };
}

export function getNextOrderInSection(nodes: FlowNode[], sectionIndex: number): number {
  const sectionNodes = nodes.filter((n) => n.sectionIndex === sectionIndex);
  if (sectionNodes.length === 0) return 0;
  return Math.max(...sectionNodes.map((n) => n.orderInSection)) + 1;
}

export function getNodesBySection(nodes: FlowNode[]): FlowNode[][] {
  const sections: FlowNode[][] = [[], [], [], []];
  nodes.forEach((node) => {
    if (node.sectionIndex >= 0 && node.sectionIndex <= 3) {
      sections[node.sectionIndex].push(node);
    }
  });
  return sections.map((section) =>
    [...section].sort((a, b) => a.orderInSection - b.orderInSection)
  );
}

// ============================================
// Connection Operations
// ============================================

export function createConnection(fromNodeId: string, toNodeId: string): FlowConnection {
  return {
    id: generateId('conn'),
    fromNodeId,
    toNodeId,
  };
}

export function isValidConnection(
  fromNodeId: string,
  toNodeId: string,
  existingConnections: FlowConnection[]
): { valid: boolean; reason?: string } {
  if (fromNodeId === toNodeId) {
    return { valid: false, reason: 'Cannot connect a node to itself' };
  }

  const exists = existingConnections.some(
    (c) => c.fromNodeId === fromNodeId && c.toNodeId === toNodeId
  );
  if (exists) {
    return { valid: false, reason: 'Connection already exists' };
  }

  return { valid: true };
}

export function removeOrphanedConnections(
  connections: FlowConnection[],
  nodeIds: Set<string>
): FlowConnection[] {
  return connections.filter(
    (c) => nodeIds.has(c.fromNodeId) && nodeIds.has(c.toNodeId)
  );
}

// ============================================
// Validation
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateConfiguration(config: Partial<FlowConfiguration>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.region) {
    errors.push('Region is required');
  }

  if (!config.sectionHeaders || config.sectionHeaders.some((h) => !h?.trim())) {
    errors.push('All section headers are required');
  }

  if (!config.nodes || config.nodes.length === 0) {
    errors.push('At least one node is required');
  }

  if (config.nodes) {
    const nodeIds = new Set(config.nodes.map((n) => n.id));
    if (nodeIds.size !== config.nodes.length) {
      errors.push('Duplicate node IDs detected');
    }

    config.nodes.forEach((node, index) => {
      if (!node.appId?.trim()) {
        errors.push(`Node ${index + 1}: App ID is required`);
      }
      if (!node.appName?.trim()) {
        errors.push(`Node ${index + 1}: App Name is required`);
      }
    });
  }

  if (config.connections && config.nodes) {
    const nodeIds = new Set(config.nodes.map((n) => n.id));
    config.connections.forEach((conn, index) => {
      if (!nodeIds.has(conn.fromNodeId) || !nodeIds.has(conn.toNodeId)) {
        warnings.push(`Connection ${index + 1}: References non-existent node`);
      }
    });
  }

  if (!config.connections || config.connections.length === 0) {
    warnings.push('No connections defined between nodes');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// Serialization
// ============================================

export function configurationToJSON(config: FlowConfiguration): string {
  return JSON.stringify(config, null, 2);
}

export function configurationFromJSON(json: string): FlowConfiguration | null {
  try {
    return JSON.parse(json) as FlowConfiguration;
  } catch {
    return null;
  }
}

// ============================================
// Database Record Mapping
// ============================================

export interface DatabaseNodeRecord {
  id?: number;
  Region: string;
  Area?: string;
  AppId: string;
  MappedAppId?: string;
  NodeWidth: number;
  NodeHeight: number;
  Descriptions?: string;
  XPosition: number;
  YPosition: number;
  CreatedUserId?: string;
  CreatedDateTime?: string;
  UpdatedUserId?: string;
  UpdatedDateTime?: string;
  AppName: string;
  Type?: 'External' | null;
}

export function nodeToDbRecord(
  node: FlowNode,
  region: string,
  area?: string,
  userId?: string
): DatabaseNodeRecord {
  const now = new Date().toISOString();
  return {
    Region: region,
    Area: area,
    AppId: node.appId,
    MappedAppId: node.mappedAppId,
    NodeWidth: node.nodeWidth,
    NodeHeight: node.nodeHeight,
    Descriptions: node.description,
    XPosition: node.xPosition,
    YPosition: node.yPosition,
    AppName: node.appName,
    Type: node.type === 'External' ? 'External' : null,
    CreatedUserId: userId,
    CreatedDateTime: now,
    UpdatedUserId: userId,
    UpdatedDateTime: now,
  };
}

export function dbRecordToNode(record: DatabaseNodeRecord, sectionIndex: number, orderInSection: number): FlowNode {
  return {
    id: generateId('node'),
    appId: record.AppId,
    appName: record.AppName,
    mappedAppId: record.MappedAppId,
    description: record.Descriptions ?? '',
    type: record.Type === 'External' ? 'External' : 'Internal',
    sectionIndex: sectionIndex as 0 | 1 | 2 | 3,
    orderInSection,
    nodeWidth: record.NodeWidth,
    nodeHeight: record.NodeHeight,
    xPosition: record.XPosition,
    yPosition: record.YPosition,
  };
}
