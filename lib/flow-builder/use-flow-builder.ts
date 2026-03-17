/**
 * Flow Builder - React Hook
 * 
 * Custom hook for flow builder state management.
 * Framework-agnostic - works in any React application.
 */

import { useReducer, useCallback, useMemo } from 'react';
import {
  FlowBuilderState,
  FlowBuilderAction,
  FlowNode,
  FlowConnection,
  FlowConfiguration,
  FlowPersistenceAdapter,
  PositionConfig,
  RegionOption,
  WizardStep,
  DEFAULT_POSITION_CONFIG,
  DEFAULT_REGIONS,
} from './types';
import { createFlowBuilderReducer, createInitialState } from './reducer';
import { validateConfiguration, isValidConnection } from './utils';

// ============================================
// Hook Options
// ============================================

export interface UseFlowBuilderOptions {
  initialConfig?: Partial<FlowConfiguration>;
  positionConfig?: PositionConfig;
  regions?: RegionOption[];
  persistenceAdapter?: FlowPersistenceAdapter;
  onSave?: (config: FlowConfiguration) => void;
  onGenerate?: (config: FlowConfiguration) => void;
}

// ============================================
// Hook Return Type
// ============================================

export interface UseFlowBuilderReturn {
  // State
  state: FlowBuilderState;
  
  // Navigation
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;
  goNext: () => void;
  goBack: () => void;
  canProceed: boolean;
  
  // Region & Headers
  setRegion: (region: string) => void;
  setArea: (area: string) => void;
  setHeader: (index: number, value: string) => void;
  
  // Node Operations
  addNode: (node: Omit<FlowNode, 'id' | 'xPosition' | 'yPosition' | 'nodeWidth' | 'nodeHeight'>) => void;
  updateNode: (id: string, updates: Partial<FlowNode>) => void;
  deleteNode: (id: string) => void;
  
  // Connection Operations
  addConnection: (fromNodeId: string, toNodeId: string) => { success: boolean; error?: string };
  deleteConnection: (id: string) => void;
  
  // Actions
  generate: () => Promise<void>;
  save: () => Promise<{ success: boolean; error?: string }>;
  reset: () => void;
  loadConfiguration: (config: FlowConfiguration) => void;
  
  // Validation
  validation: ReturnType<typeof validateConfiguration>;
  
  // Configuration
  configuration: FlowConfiguration;
  regions: RegionOption[];
  positionConfig: PositionConfig;
}

// ============================================
// Hook Implementation
// ============================================

export function useFlowBuilder(options: UseFlowBuilderOptions = {}): UseFlowBuilderReturn {
  const {
    initialConfig,
    positionConfig = DEFAULT_POSITION_CONFIG,
    regions = DEFAULT_REGIONS,
    persistenceAdapter,
    onSave,
    onGenerate,
  } = options;

  // Create reducer with position config
  const reducer = useMemo(
    () => createFlowBuilderReducer(positionConfig),
    [positionConfig]
  );

  // Initialize state
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const initial = createInitialState(positionConfig);
    if (initialConfig) {
      return {
        ...initial,
        region: initialConfig.region ?? null,
        area: initialConfig.area ?? '',
        sectionHeaders: initialConfig.sectionHeaders ?? initial.sectionHeaders,
        nodes: initialConfig.nodes ?? [],
        connections: initialConfig.connections ?? [],
      };
    }
    return initial;
  });

  // ==========================================
  // Navigation
  // ==========================================

  const setStep = useCallback((step: WizardStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const canProceed = useMemo(() => {
    switch (state.currentStep) {
      case 1:
        return state.region !== null;
      case 2:
        return state.sectionHeaders.every((h) => h.trim().length > 0);
      case 3:
        return state.nodes.length > 0;
      case 4:
        return true; // Connections are optional
      case 5:
        return state.region !== null && state.nodes.length > 0;
      default:
        return true;
    }
  }, [state.currentStep, state.region, state.sectionHeaders, state.nodes]);

  const goNext = useCallback(() => {
    if (state.currentStep < 6 && canProceed) {
      dispatch({ type: 'SET_STEP', payload: (state.currentStep + 1) as WizardStep });
    }
  }, [state.currentStep, canProceed]);

  const goBack = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_STEP', payload: (state.currentStep - 1) as WizardStep });
    }
  }, [state.currentStep]);

  // ==========================================
  // Region & Headers
  // ==========================================

  const setRegion = useCallback((region: string) => {
    dispatch({ type: 'SET_REGION', payload: region });
  }, []);

  const setArea = useCallback((area: string) => {
    dispatch({ type: 'SET_AREA', payload: area });
  }, []);

  const setHeader = useCallback((index: number, value: string) => {
    dispatch({ type: 'SET_HEADER', payload: { index, value } });
  }, []);

  // ==========================================
  // Node Operations
  // ==========================================

  const addNode = useCallback(
    (node: Omit<FlowNode, 'id' | 'xPosition' | 'yPosition' | 'nodeWidth' | 'nodeHeight'>) => {
      dispatch({ type: 'ADD_NODE', payload: node });
    },
    []
  );

  const updateNode = useCallback((id: string, updates: Partial<FlowNode>) => {
    dispatch({ type: 'UPDATE_NODE', payload: { id, updates } });
  }, []);

  const deleteNode = useCallback((id: string) => {
    dispatch({ type: 'DELETE_NODE', payload: id });
  }, []);

  // ==========================================
  // Connection Operations
  // ==========================================

  const addConnection = useCallback(
    (fromNodeId: string, toNodeId: string): { success: boolean; error?: string } => {
      const validation = isValidConnection(fromNodeId, toNodeId, state.connections);
      if (!validation.valid) {
        return { success: false, error: validation.reason };
      }
      dispatch({ type: 'ADD_CONNECTION', payload: { fromNodeId, toNodeId } });
      return { success: true };
    },
    [state.connections]
  );

  const deleteConnection = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CONNECTION', payload: id });
  }, []);

  // ==========================================
  // Configuration
  // ==========================================

  const configuration = useMemo((): FlowConfiguration => ({
    region: state.region ?? '',
    area: state.area,
    sectionHeaders: state.sectionHeaders,
    nodes: state.nodes,
    connections: state.connections,
  }), [state.region, state.area, state.sectionHeaders, state.nodes, state.connections]);

  const validation = useMemo(
    () => validateConfiguration(configuration),
    [configuration]
  );

  // ==========================================
  // Actions
  // ==========================================

  const generate = useCallback(async () => {
    dispatch({ type: 'SET_GENERATING', payload: true });
    try {
      // Simulate generation delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      dispatch({ type: 'SET_STEP', payload: 6 });
      onGenerate?.(configuration);
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  }, [configuration, onGenerate]);

  const save = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!persistenceAdapter) {
      return { success: false, error: 'No persistence adapter configured' };
    }

    dispatch({ type: 'SET_SAVING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const result = await persistenceAdapter.saveConfiguration(configuration);
      if (result.success) {
        onSave?.(configuration);
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error ?? 'Failed to save' });
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [persistenceAdapter, configuration, onSave]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const loadConfiguration = useCallback((config: FlowConfiguration) => {
    dispatch({ type: 'LOAD_CONFIGURATION', payload: config });
  }, []);

  // ==========================================
  // Return
  // ==========================================

  return {
    state,
    currentStep: state.currentStep,
    setStep,
    goNext,
    goBack,
    canProceed,
    setRegion,
    setArea,
    setHeader,
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    deleteConnection,
    generate,
    save,
    reset,
    loadConfiguration,
    validation,
    configuration,
    regions,
    positionConfig,
  };
}
