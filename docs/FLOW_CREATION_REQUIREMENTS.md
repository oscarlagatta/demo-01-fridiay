# Flow Creation System - Requirements Document

## 1. Executive Summary

This document outlines the requirements for a user-guided flow creation system that replaces the current Excel-based process. The system enables users to create payment flow configurations through an intuitive UI, automatically generating visual flow diagrams based on user inputs.

---

## 2. Objectives

### 2.1 Primary Objectives
- Provide a guided, form-based UI for creating payment flow configurations
- Eliminate dependency on Excel-based flow management
- Automatically generate properly positioned flow diagrams from user inputs
- Support multiple regions with separate flow configurations
- Enable easy modifications when generated flows don't meet expectations

### 2.2 Success Criteria
- Users can create a complete flow configuration without technical knowledge
- Generated flows display correctly with proper node positioning
- System supports all existing regions (US, India, APAC, etc.)
- Configuration time reduced compared to Excel-based process

---

## 3. Database Schema

### 3.1 Existing Table: E2ED_WireFlow

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key, auto-increment |
| Region | VARCHAR | Region identifier (US, India, APAC) |
| Area | VARCHAR | Area/section the node belongs to |
| AppId | VARCHAR | Application identifier |
| MappedAppId | VARCHAR | Mapped application identifier for connections |
| NodeWidth | INT | Width of the node (default: 294) |
| NodeHeight | INT | Height of the node (default: 174) |
| Descriptions | VARCHAR | Node description text |
| XPosition | INT | Horizontal position on canvas |
| YPosition | INT | Vertical position on canvas |
| CreatedUserId | VARCHAR | User who created the record |
| CreatedDateTime | DATETIME | Creation timestamp |
| UpdatedUserId | VARCHAR | User who last updated the record |
| UpdatedDateTime | DATETIME | Last update timestamp |
| AppName | VARCHAR | Display name for the application |
| Type | VARCHAR | Node type (NULL or "External") |

### 3.2 Default Values
- **NodeWidth**: 294 pixels
- **NodeHeight**: 174 pixels
- **Number of Sections**: 4 (fixed)

---

## 4. System Architecture

### 4.1 Flow Generation Logic

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FLOW CANVAS                                     │
│                                                                             │
│  Section 1          Section 2          Section 3          Section 4        │
│  X: 0-400          X: 450-850         X: 900-1300        X: 1350-1750      │
│  ┌──────────┐      ┌──────────┐       ┌──────────┐       ┌──────────┐      │
│  │  Header  │      │  Header  │       │  Header  │       │  Header  │      │
│  │    1     │      │    2     │       │    3     │       │    4     │      │
│  └──────────┘      └──────────┘       └──────────┘       └──────────┘      │
│                                                                             │
│  ┌──────────┐      ┌──────────┐       ┌──────────┐       ┌──────────┐      │
│  │  Node 1  │ ───► │  Node 3  │ ───►  │  Node 5  │ ───►  │  Node 7  │      │
│  │  Y: 100  │      │  Y: 100  │       │  Y: 100  │       │  Y: 100  │      │
│  └──────────┘      └──────────┘       └──────────┘       └──────────┘      │
│                                                                             │
│  ┌──────────┐      ┌──────────┐       ┌──────────┐       ┌──────────┐      │
│  │  Node 2  │      │  Node 4  │       │  Node 6  │       │  Node 8  │      │
│  │  Y: 300  │      │  Y: 300  │       │  Y: 300  │       │  Y: 300  │      │
│  └──────────┘      └──────────┘       └──────────┘       └──────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Auto-Positioning Algorithm

**X Position Calculation (by Section):**
| Section | X Position Start | Calculation |
|---------|------------------|-------------|
| Section 1 | 50 | Base position |
| Section 2 | 450 | 50 + (294 + 106) × 1 |
| Section 3 | 850 | 50 + (294 + 106) × 2 |
| Section 4 | 1250 | 50 + (294 + 106) × 3 |

**Y Position Calculation (by Node Order within Section):**
| Node Order | Y Position | Calculation |
|------------|------------|-------------|
| 1st node | 100 | Header height + padding |
| 2nd node | 300 | 100 + (174 + 26) × 1 |
| 3rd node | 500 | 100 + (174 + 26) × 2 |
| nth node | Variable | 100 + (174 + 26) × (n-1) |

---

## 5. User Interface Requirements

### 5.1 Guided Creation Wizard

The UI should present a step-by-step guided process:

#### Step 1: Region Selection
**Purpose**: Select the target region for the flow configuration

**UI Elements**:
- Radio buttons or dropdown for region selection
- Options: US, India, APAC (extensible for future regions)
- Validation: Required field

**User Action**: Select one region and proceed

---

#### Step 2: Section Header Configuration
**Purpose**: Define names for the 4 fixed section headers

**UI Elements**:
- 4 text input fields, one for each section header
- Default placeholder values (e.g., "Section 1", "Section 2", etc.)
- Character limit: 50 characters per header

**Validation**:
- All 4 headers must have names
- Names should be unique within the flow

**Example**:
```
Section 1 Header: [Origination          ]
Section 2 Header: [Processing           ]
Section 3 Header: [Clearing             ]
Section 4 Header: [Settlement           ]
```

---

#### Step 3: Node Configuration
**Purpose**: Add and configure nodes for each section

**UI Elements**:
- Section tabs or accordion panels (one per section)
- "Add Node" button for each section
- Node configuration form with fields:
  - AppId (required, text input)
  - AppName (required, text input - display name)
  - MappedAppId (optional, for connections)
  - Description (optional, textarea)
  - Type (dropdown: "Internal" or "External")
- Drag-and-drop reordering within sections
- Delete node button

**Node Form Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| AppId | Text | Yes | Unique application identifier |
| AppName | Text | Yes | Display name shown on node |
| Description | Textarea | No | Additional node description |
| Type | Dropdown | No | NULL (Internal) or "External" |

**Auto-assigned Values** (not editable by user):
- NodeWidth: 294
- NodeHeight: 174
- XPosition: Calculated based on section
- YPosition: Calculated based on order within section

---

#### Step 4: Connection Configuration
**Purpose**: Define connections (edges) between nodes

**UI Elements**:
- Connection list with "Add Connection" button
- Each connection row contains:
  - "From Node" dropdown (lists all configured nodes)
  - "To Node" dropdown (lists all configured nodes)
  - Delete connection button
- Visual indicator showing connection count

**Validation**:
- Cannot connect a node to itself
- Duplicate connections not allowed
- Warning for nodes without any connections

**Example**:
```
Connection 1: [Node: APP001 - Gateway] ──► [Node: APP002 - Processor]
Connection 2: [Node: APP002 - Processor] ──► [Node: APP003 - Clearing]
[+ Add Connection]
```

---

#### Step 5: Review & Generate
**Purpose**: Review configuration and generate the flow

**UI Elements**:
- Summary panel showing:
  - Selected region
  - Section headers with node counts
  - Total nodes configured
  - Total connections defined
- "Generate Flow" button
- "Back" button to make changes

**Summary Display**:
```
┌─────────────────────────────────────────┐
│ Flow Configuration Summary              │
├─────────────────────────────────────────┤
│ Region: US                              │
│                                         │
│ Sections:                               │
│ ├─ Origination (3 nodes)                │
│ ├─ Processing (2 nodes)                 │
│ ├─ Clearing (2 nodes)                   │
│ └─ Settlement (1 node)                  │
│                                         │
│ Total Nodes: 8                          │
│ Total Connections: 7                    │
│                                         │
│ [Back]              [Generate Flow]     │
└─────────────────────────────────────────┘
```

---

#### Step 6: View & Modify
**Purpose**: View generated flow and make adjustments

**UI Elements**:
- Full flow diagram display (read-only canvas)
- "Edit Configuration" button (returns to wizard)
- "Save Flow" button (persists to database)
- "Export" option (optional, for documentation)
- Node position adjustment panel (if manual tweaks needed):
  - Select node from dropdown
  - X Position input (numeric)
  - Y Position input (numeric)
  - "Update Position" button

**Modification Options**:
- Return to any previous step to change inputs
- Manual position override for individual nodes
- Re-generate flow after changes

---

## 6. Data Management

### 6.1 Data Flow

```
User Input → Validation → Position Calculation → Database Insert → Flow Render
```

### 6.2 CRUD Operations

| Operation | Description | API Endpoint |
|-----------|-------------|--------------|
| Create | Save new flow configuration | POST /api/flows |
| Read | Retrieve existing flow by region | GET /api/flows/{region} |
| Update | Modify existing flow configuration | PUT /api/flows/{region} |
| Delete | Remove flow configuration | DELETE /api/flows/{region} |

### 6.3 Data Validation Rules

| Field | Validation Rule |
|-------|-----------------|
| Region | Required, must be valid region code |
| Area | Required, must match one of 4 section headers |
| AppId | Required, unique within region |
| AppName | Required, max 100 characters |
| Description | Optional, max 500 characters |
| Type | NULL or "External" only |
| XPosition | Auto-calculated, 0-2000 range |
| YPosition | Auto-calculated, 0-2000 range |

---

## 7. User Interactions

### 7.1 Primary User Flows

**Flow 1: Create New Flow**
1. User navigates to Flow Builder
2. Selects "Create New Flow"
3. Chooses region
4. Configures section headers
5. Adds nodes to each section
6. Defines connections between nodes
7. Reviews summary
8. Generates and previews flow
9. Saves flow to database

**Flow 2: Modify Existing Flow**
1. User navigates to Flow Builder
2. Selects "Edit Existing Flow"
3. Chooses region to edit
4. System loads existing configuration
5. User makes changes through wizard steps
6. Regenerates flow
7. Saves updated flow

**Flow 3: Adjust Node Positions**
1. User views generated flow
2. Identifies positioning issues
3. Selects node to adjust
4. Enters new X/Y coordinates
5. Updates position
6. Saves changes

### 7.2 Error Handling

| Scenario | User Feedback |
|----------|---------------|
| Missing required field | Highlight field, show inline error |
| Duplicate AppId | "AppId already exists in this region" |
| Invalid connection | "Cannot connect node to itself" |
| Database save failure | "Failed to save. Please try again." |
| Generation failure | "Unable to generate flow. Check configuration." |

---

## 8. Acceptance Criteria

### 8.1 Functional Requirements

- [ ] User can select from available regions
- [ ] User can configure 4 section header names
- [ ] User can add unlimited nodes to each section
- [ ] Nodes are assigned default size (294 x 174)
- [ ] X position is auto-calculated based on section (1-4)
- [ ] Y position is auto-calculated based on node order within section
- [ ] User can define connections between any two nodes
- [ ] User can review complete configuration before generation
- [ ] Flow diagram renders correctly with all nodes and connections
- [ ] User can manually adjust node positions if needed
- [ ] Configuration saves to E2ED_WireFlow database table
- [ ] User can edit existing flow configurations
- [ ] All form validations work correctly

### 8.2 Non-Functional Requirements

- [ ] Wizard completes in under 5 minutes for typical flow (8-12 nodes)
- [ ] Flow generation completes in under 3 seconds
- [ ] UI is responsive on desktop (1280px+)
- [ ] All form fields are keyboard accessible
- [ ] Error messages are clear and actionable

### 8.3 Edge Cases

- [ ] Empty sections (0 nodes) display correctly
- [ ] Single node flows work correctly
- [ ] Maximum nodes per section (10+) position correctly
- [ ] Long node names truncate appropriately
- [ ] Special characters in names handled correctly

---

## 9. Future Enhancements (Out of Scope)

The following features are not included in the initial release but may be considered for future iterations:

1. **Drag-and-drop node positioning** on the flow canvas
2. **Import/Export** flow configurations as JSON/CSV
3. **Flow versioning** and history tracking
4. **Flow templates** for common configurations
5. **Collaborative editing** with multiple users
6. **Flow comparison** between regions
7. **Automated validation** against business rules

---

## 10. Technical Implementation Notes

### 10.1 Recommended Component Structure

```
/app/flow-builder/
  page.tsx                    # Main wizard page
  
/components/flow-builder/
  flow-wizard.tsx             # Main wizard container
  region-selector.tsx         # Step 1: Region selection
  section-header-config.tsx   # Step 2: Header configuration
  node-configuration.tsx      # Step 3: Node management
  connection-builder.tsx      # Step 4: Connection definition
  flow-summary.tsx            # Step 5: Review summary
  flow-preview.tsx            # Step 6: View and modify
  position-adjuster.tsx       # Manual position override

/hooks/
  use-flow-builder.tsx        # State management for wizard

/lib/
  flow-position-calculator.ts # Auto-positioning logic

/types/
  flow-builder.ts             # TypeScript interfaces
```

### 10.2 State Management

The wizard should maintain state across all steps:

```typescript
interface FlowBuilderState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  region: string | null;
  sectionHeaders: [string, string, string, string];
  nodes: FlowNode[];
  connections: FlowConnection[];
  isGenerating: boolean;
  generatedFlow: GeneratedFlow | null;
}

interface FlowNode {
  id: string;
  appId: string;
  appName: string;
  description: string;
  type: 'Internal' | 'External';
  sectionIndex: 0 | 1 | 2 | 3;
  orderInSection: number;
  // Auto-calculated:
  xPosition?: number;
  yPosition?: number;
}

interface FlowConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}
```

---

## 11. Appendix

### A. Section Position Constants

```typescript
const SECTION_POSITIONS = {
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
```

### B. Y Position Calculator

```typescript
function calculateYPosition(orderInSection: number): number {
  const { FIRST_NODE_Y, NODE_HEIGHT, NODE_GAP_Y } = SECTION_POSITIONS;
  return FIRST_NODE_Y + (NODE_HEIGHT + NODE_GAP_Y) * orderInSection;
}
```

### C. X Position Calculator

```typescript
function calculateXPosition(sectionIndex: number): number {
  const positions = [
    SECTION_POSITIONS.SECTION_1_X,
    SECTION_POSITIONS.SECTION_2_X,
    SECTION_POSITIONS.SECTION_3_X,
    SECTION_POSITIONS.SECTION_4_X,
  ];
  return positions[sectionIndex] || positions[0];
}
```

---

*Document Version: 1.0*
*Last Updated: March 2026*
