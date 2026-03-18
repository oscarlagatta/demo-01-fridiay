// Flow Builder Types

// Section count constraints
export const MIN_SECTIONS = 2;
export const MAX_SECTIONS = 8;
export const DEFAULT_SECTION_COUNT = 4;

export interface FlowNode {
  id: string;
  appId: string;
  appName: string;
  description: string;
  type: 'Internal' | 'External';
  sectionIndex: number;
  orderInSection: number;
  xPosition?: number;
  yPosition?: number;
}

export interface FlowConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}

export interface FlowBuilderState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  region: string | null;
  sectionCount: number;
  sectionHeaders: string[];
  nodes: FlowNode[];
  connections: FlowConnection[];
  isGenerating: boolean;
}

// Helper to generate default headers based on section count
export function generateDefaultHeaders(count: number): string[] {
  const defaultNames = [
    'Initiation',
    'Processing',
    'Clearing',
    'Settlement',
    'Confirmation',
    'Archival',
    'Audit',
    'Reporting',
  ];
  return Array.from({ length: count }, (_, i) => defaultNames[i] || `Section ${i + 1}`);
}

export interface SectionPosition {
  HEADER_Y: number;
  FIRST_NODE_Y: number;
  NODE_WIDTH: number;
  NODE_HEIGHT: number;
  NODE_GAP_Y: number;
  SECTION_GAP_X: number;
  CANVAS_PADDING: number;
}

export const SECTION_POSITIONS: SectionPosition = {
  HEADER_Y: 20,
  FIRST_NODE_Y: 100,
  NODE_WIDTH: 294,
  NODE_HEIGHT: 174,
  NODE_GAP_Y: 26,
  SECTION_GAP_X: 106,
  CANVAS_PADDING: 50,
};

// Calculate X position for a section based on index and total sections
export function getSectionXPosition(sectionIndex: number): number {
  const { NODE_WIDTH, SECTION_GAP_X, CANVAS_PADDING } = SECTION_POSITIONS;
  return CANVAS_PADDING + sectionIndex * (NODE_WIDTH + SECTION_GAP_X);
}

// Calculate canvas width based on section count
export function getCanvasWidth(sectionCount: number): number {
  const { NODE_WIDTH, SECTION_GAP_X, CANVAS_PADDING } = SECTION_POSITIONS;
  return CANVAS_PADDING * 2 + sectionCount * NODE_WIDTH + (sectionCount - 1) * SECTION_GAP_X;
}

export interface Region {
  id: string;
  name: string;
  description: string;
  isCustom?: boolean;
}

export const DEFAULT_REGIONS: Region[] = [
  { id: 'US', name: 'United States', description: 'US Wire Transfer Flow' },
  { id: 'INDIA', name: 'India', description: 'India Payment Flow' },
  { id: 'APAC', name: 'Asia Pacific', description: 'APAC Regional Flow' },
];

// Keep for backward compatibility
export const REGIONS = DEFAULT_REGIONS;

export type RegionId = string;
