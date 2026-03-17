/**
 * Flow Builder - State Reducer
 * 
 * Pure reducer function for flow builder state management.
 * Works with React's useReducer hook.
 */

import {
  FlowBuilderState,
  FlowBuilderAction,
  PositionConfig,
  DEFAULT_POSITION_CONFIG,
  DEFAULT_SECTION_HEADERS,
} from './types';
import {
  createNode,
  createConnection,
  getNextOrderInSection,
  recalculateAllPositions,
  removeOrphanedConnections,
} from './utils';

// ============================================
// Initial State Factory
// ============================================

export function createInitialState(
  positionConfig: PositionConfig = DEFAULT_POSITION_CONFIG
): FlowBuilderState {
  return {
    currentStep: 1,
    region: null,
    area: '',
    sectionHeaders: [...DEFAULT_SECTION_HEADERS],
    nodes: [],
    connections: [],
    isGenerating: false,
    isSaving: false,
    error: null,
  };
}

// ============================================
// Reducer
// ============================================

export function flowBuilderReducer(
  state: FlowBuilderState,
  action: FlowBuilderAction,
  positionConfig: PositionConfig = DEFAULT_POSITION_CONFIG
): FlowBuilderState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload, error: null };

    case 'SET_REGION':
      return { ...state, region: action.payload };

    case 'SET_AREA':
      return { ...state, area: action.payload };

    case 'SET_HEADER': {
      const newHeaders = [...state.sectionHeaders] as [string, string, string, string];
      newHeaders[action.payload.index] = action.payload.value;
      return { ...state, sectionHeaders: newHeaders };
    }

    case 'ADD_NODE': {
      const orderInSection = getNextOrderInSection(state.nodes, action.payload.sectionIndex);
      const newNode = createNode(
        { ...action.payload, orderInSection },
        positionConfig
      );
      return { ...state, nodes: [...state.nodes, newNode] };
    }

    case 'UPDATE_NODE': {
      const updatedNodes = state.nodes.map((node) =>
        node.id === action.payload.id
          ? { ...node, ...action.payload.updates }
          : node
      );
      // Recalculate positions if section changed
      if (action.payload.updates.sectionIndex !== undefined) {
        return { ...state, nodes: recalculateAllPositions(updatedNodes, positionConfig) };
      }
      return { ...state, nodes: updatedNodes };
    }

    case 'DELETE_NODE': {
      const remainingNodes = state.nodes.filter((n) => n.id !== action.payload);
      const nodeIds = new Set(remainingNodes.map((n) => n.id));
      const cleanedConnections = removeOrphanedConnections(state.connections, nodeIds);
      const repositionedNodes = recalculateAllPositions(remainingNodes, positionConfig);
      return {
        ...state,
        nodes: repositionedNodes,
        connections: cleanedConnections,
      };
    }

    case 'ADD_CONNECTION': {
      const newConnection = createConnection(
        action.payload.fromNodeId,
        action.payload.toNodeId
      );
      return { ...state, connections: [...state.connections, newConnection] };
    }

    case 'DELETE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter((c) => c.id !== action.payload),
      };

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'RESET':
      return createInitialState(positionConfig);

    case 'LOAD_CONFIGURATION':
      return {
        ...state,
        region: action.payload.region,
        area: action.payload.area ?? '',
        sectionHeaders: action.payload.sectionHeaders,
        nodes: action.payload.nodes,
        connections: action.payload.connections,
        currentStep: 1,
        error: null,
      };

    default:
      return state;
  }
}

// ============================================
// Reducer Factory (with config binding)
// ============================================

export function createFlowBuilderReducer(positionConfig: PositionConfig = DEFAULT_POSITION_CONFIG) {
  return (state: FlowBuilderState, action: FlowBuilderAction): FlowBuilderState => {
    return flowBuilderReducer(state, action, positionConfig);
  };
}
