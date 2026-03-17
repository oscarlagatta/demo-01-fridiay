'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { WizardStepIndicator } from './wizard-step-indicator';
import { StepRegionSelector } from './step-region-selector';
import { StepSectionHeaders } from './step-section-headers';
import { StepNodeConfiguration } from './step-node-configuration';
import { StepConnectionBuilder } from './step-connection-builder';
import { StepReviewSummary } from './step-review-summary';
import { FlowPreview } from './flow-preview';
import { FlowBuilderState, FlowNode, FlowConnection, RegionId, SECTION_POSITIONS } from './types';
import { INITIAL_STATE, MOCK_SECTION_HEADERS, MOCK_NODES, MOCK_CONNECTIONS } from './mock-data';

const STEP_LABELS = [
  'Region',
  'Headers',
  'Nodes',
  'Connections',
  'Review',
  'Preview',
];

function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function calculateNodePosition(
  sectionIndex: number,
  orderInSection: number
): { xPosition: number; yPosition: number } {
  const positions = [
    SECTION_POSITIONS.SECTION_1_X,
    SECTION_POSITIONS.SECTION_2_X,
    SECTION_POSITIONS.SECTION_3_X,
    SECTION_POSITIONS.SECTION_4_X,
  ];

  return {
    xPosition: positions[sectionIndex] || positions[0],
    yPosition:
      SECTION_POSITIONS.FIRST_NODE_Y +
      (SECTION_POSITIONS.NODE_HEIGHT + SECTION_POSITIONS.NODE_GAP_Y) * orderInSection,
  };
}

interface FlowBuilderWizardProps {
  useMockData?: boolean;
}

export function FlowBuilderWizard({ useMockData = false }: FlowBuilderWizardProps) {
  const [state, setState] = useState<FlowBuilderState>(() => {
    if (useMockData) {
      return {
        currentStep: 1,
        region: 'US',
        sectionHeaders: MOCK_SECTION_HEADERS,
        nodes: MOCK_NODES,
        connections: MOCK_CONNECTIONS,
        isGenerating: false,
      };
    }
    return INITIAL_STATE;
  });

  const setCurrentStep = (step: FlowBuilderState['currentStep']) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const handleRegionSelect = (regionId: RegionId) => {
    setState((prev) => ({ ...prev, region: regionId }));
  };

  const handleHeaderChange = (index: number, value: string) => {
    setState((prev) => {
      const newHeaders = [...prev.sectionHeaders] as [string, string, string, string];
      newHeaders[index] = value;
      return { ...prev, sectionHeaders: newHeaders };
    });
  };

  const handleAddNode = useCallback(
    (nodeData: Omit<FlowNode, 'id' | 'xPosition' | 'yPosition'>) => {
      const { xPosition, yPosition } = calculateNodePosition(
        nodeData.sectionIndex,
        nodeData.orderInSection
      );

      const newNode: FlowNode = {
        ...nodeData,
        id: generateId(),
        xPosition,
        yPosition,
      };

      setState((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    },
    []
  );

  const handleDeleteNode = useCallback((nodeId: string) => {
    setState((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      connections: prev.connections.filter(
        (c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
      ),
    }));
  }, []);

  const handleAddConnection = useCallback((fromNodeId: string, toNodeId: string) => {
    const newConnection: FlowConnection = {
      id: generateId(),
      fromNodeId,
      toNodeId,
    };
    setState((prev) => ({ ...prev, connections: [...prev.connections, newConnection] }));
  }, []);

  const handleDeleteConnection = useCallback((connectionId: string) => {
    setState((prev) => ({
      ...prev,
      connections: prev.connections.filter((c) => c.id !== connectionId),
    }));
  }, []);

  const handleGenerate = async () => {
    setState((prev) => ({ ...prev, isGenerating: true }));
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setState((prev) => ({ ...prev, isGenerating: false, currentStep: 6 }));
  };

  const canProceed = (): boolean => {
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
  };

  const goNext = () => {
    if (state.currentStep === 5) {
      handleGenerate();
    } else if (state.currentStep < 6) {
      setCurrentStep((state.currentStep + 1) as FlowBuilderState['currentStep']);
    }
  };

  const goBack = () => {
    if (state.currentStep > 1) {
      setCurrentStep((state.currentStep - 1) as FlowBuilderState['currentStep']);
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <StepRegionSelector
            selectedRegion={state.region}
            onRegionSelect={handleRegionSelect}
          />
        );
      case 2:
        return (
          <StepSectionHeaders
            sectionHeaders={state.sectionHeaders}
            onHeaderChange={handleHeaderChange}
          />
        );
      case 3:
        return (
          <StepNodeConfiguration
            sectionHeaders={state.sectionHeaders}
            nodes={state.nodes}
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
          />
        );
      case 4:
        return (
          <StepConnectionBuilder
            nodes={state.nodes}
            connections={state.connections}
            onAddConnection={handleAddConnection}
            onDeleteConnection={handleDeleteConnection}
          />
        );
      case 5:
        return (
          <StepReviewSummary
            region={state.region}
            sectionHeaders={state.sectionHeaders}
            nodes={state.nodes}
            connections={state.connections}
          />
        );
      case 6:
        return (
          <FlowPreview
            region={state.region}
            sectionHeaders={state.sectionHeaders}
            nodes={state.nodes}
            connections={state.connections}
            onEditConfiguration={() => setCurrentStep(1)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Flow Builder</h1>
        <p className="text-muted-foreground">
          Create and configure payment flow diagrams for your region
        </p>
      </div>

      {/* Step Indicator */}
      <Card className="p-4">
        <WizardStepIndicator
          currentStep={state.currentStep}
          totalSteps={6}
          stepLabels={STEP_LABELS}
        />
      </Card>

      {/* Step Content */}
      <Card className="p-6">{renderStep()}</Card>

      {/* Navigation */}
      {state.currentStep < 6 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={state.currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={goNext}
            disabled={!canProceed() || state.isGenerating}
          >
            {state.isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : state.currentStep === 5 ? (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Flow
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
