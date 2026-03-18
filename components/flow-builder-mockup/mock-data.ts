// Mock Data for Flow Builder Mockup Screens

import { FlowNode, FlowConnection, FlowBuilderState, DEFAULT_SECTION_COUNT, generateDefaultHeaders } from './types';

export const MOCK_SECTION_HEADERS: string[] = [
  'Origination',
  'Processing',
  'Clearing',
  'Settlement',
];

export const MOCK_NODES: FlowNode[] = [
  // Section 1 - Origination
  {
    id: 'node-1',
    appId: 'APP001',
    appName: 'Payment Gateway',
    description: 'Entry point for wire transfer requests',
    type: 'Internal',
    sectionIndex: 0,
    orderInSection: 0,
    xPosition: 50,
    yPosition: 100,
  },
  {
    id: 'node-2',
    appId: 'APP002',
    appName: 'Validation Service',
    description: 'Validates payment data and credentials',
    type: 'Internal',
    sectionIndex: 0,
    orderInSection: 1,
    xPosition: 50,
    yPosition: 300,
  },
  // Section 2 - Processing
  {
    id: 'node-3',
    appId: 'APP003',
    appName: 'Payment Processor',
    description: 'Core payment processing engine',
    type: 'Internal',
    sectionIndex: 1,
    orderInSection: 0,
    xPosition: 450,
    yPosition: 100,
  },
  {
    id: 'node-4',
    appId: 'APP004',
    appName: 'Fraud Detection',
    description: 'Real-time fraud analysis',
    type: 'External',
    sectionIndex: 1,
    orderInSection: 1,
    xPosition: 450,
    yPosition: 300,
  },
  // Section 3 - Clearing
  {
    id: 'node-5',
    appId: 'APP005',
    appName: 'Clearing House',
    description: 'ACH clearing operations',
    type: 'External',
    sectionIndex: 2,
    orderInSection: 0,
    xPosition: 850,
    yPosition: 100,
  },
  {
    id: 'node-6',
    appId: 'APP006',
    appName: 'SWIFT Gateway',
    description: 'International wire messaging',
    type: 'External',
    sectionIndex: 2,
    orderInSection: 1,
    xPosition: 850,
    yPosition: 300,
  },
  // Section 4 - Settlement
  {
    id: 'node-7',
    appId: 'APP007',
    appName: 'Settlement Engine',
    description: 'Final settlement processing',
    type: 'Internal',
    sectionIndex: 3,
    orderInSection: 0,
    xPosition: 1250,
    yPosition: 100,
  },
  {
    id: 'node-8',
    appId: 'APP008',
    appName: 'Notification Service',
    description: 'Customer and bank notifications',
    type: 'Internal',
    sectionIndex: 3,
    orderInSection: 1,
    xPosition: 1250,
    yPosition: 300,
  },
];

export const MOCK_CONNECTIONS: FlowConnection[] = [
  { id: 'conn-1', fromNodeId: 'node-1', toNodeId: 'node-2' },
  { id: 'conn-2', fromNodeId: 'node-2', toNodeId: 'node-3' },
  { id: 'conn-3', fromNodeId: 'node-3', toNodeId: 'node-4' },
  { id: 'conn-4', fromNodeId: 'node-3', toNodeId: 'node-5' },
  { id: 'conn-5', fromNodeId: 'node-4', toNodeId: 'node-5' },
  { id: 'conn-6', fromNodeId: 'node-5', toNodeId: 'node-6' },
  { id: 'conn-7', fromNodeId: 'node-5', toNodeId: 'node-7' },
  { id: 'conn-8', fromNodeId: 'node-6', toNodeId: 'node-7' },
  { id: 'conn-9', fromNodeId: 'node-7', toNodeId: 'node-8' },
];

export const INITIAL_STATE: FlowBuilderState = {
  currentStep: 1,
  region: null,
  sectionCount: DEFAULT_SECTION_COUNT,
  sectionHeaders: generateDefaultHeaders(DEFAULT_SECTION_COUNT),
  nodes: [],
  connections: [],
  isGenerating: false,
};

export const MOCK_COMPLETE_STATE: FlowBuilderState = {
  currentStep: 6,
  region: 'US',
  sectionCount: 4,
  sectionHeaders: MOCK_SECTION_HEADERS,
  nodes: MOCK_NODES,
  connections: MOCK_CONNECTIONS,
  isGenerating: false,
};

// Helper to get nodes by section
export function getNodesBySection(nodes: FlowNode[], sectionIndex: number): FlowNode[] {
  return nodes
    .filter((node) => node.sectionIndex === sectionIndex)
    .sort((a, b) => a.orderInSection - b.orderInSection);
}

// Helper to get node by ID
export function getNodeById(nodes: FlowNode[], nodeId: string): FlowNode | undefined {
  return nodes.find((node) => node.id === nodeId);
}
