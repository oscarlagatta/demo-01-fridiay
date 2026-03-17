import { FlowBuilderWizard } from '@/components/flow-builder-mockup/flow-builder-wizard';

export default function FlowBuilderMockupPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container py-8">
        <FlowBuilderWizard useMockData={true} />
      </div>
    </main>
  );
}
