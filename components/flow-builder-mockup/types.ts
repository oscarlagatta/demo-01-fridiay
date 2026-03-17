// Flow Builder Types

export interface FlowNode {
  id: string;
  appId: string;
  appName: string;
  description: string;
  type: 'Internal' | 'External';
  sectionIndex: 0 | 1 | 2 | 3;
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
  sectionHeaders: [string, string, string, string];
  nodes: FlowNode[];
  connections: FlowConnection[];
  isGenerating: boolean;
}

export interface SectionPosition {
  SECTION_1_X: number;
  SECTION_2_X: number;
  SECTION_3_X: number;
  SECTION_4_X: number;
  HEADER_Y: number;
  FIRST_NODE_Y: number;
  NODE_WIDTH: number;
  NODE_HEIGHT: number;
  NODE_GAP_Y: number;
  SECTION_GAP_X: number;
}

export const SECTION_POSITIONS: SectionPosition = {
  SECTION_1_X: 50,
  SECTION_2_X: 450,
  SECTION_3_X: 850,
  SECTION_4_X: 1250,
  HEADER_Y: 20,
  FIRST_NODE_Y: 100,
  NODE_WIDTH: 294,
  NODE_HEIGHT: 174,
  NODE_GAP_Y: 26,
  SECTION_GAP_X: 106,
};

export const REGIONS = [
  { id: 'US', name: 'United States', description: 'US Wire Transfer Flow' },
  { id: 'INDIA', name: 'India', description: 'India Payment Flow' },
  { id: 'APAC', name: 'Asia Pacific', description: 'APAC Regional Flow' },
] as const;

export type RegionId = typeof REGIONS[number]['id'];
