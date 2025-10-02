Read pasted-text.txtThought for 10s### Backend API Requirements - Based on Existing Data Model

## Flow Diagram Management System - C# .NET Core Web API

---

## 1. Data Model Analysis

Based on the provided backend response structure, the system manages payment processing flow diagrams with the following key components:

### 1.1 Core Data Entities

**Flow Diagram Root**

- `averageThruputTime30`: Overall flow performance metric
- `nodes`: Array of processing step nodes
- `processingSections`: Categorical groupings of nodes
- `systemConnections`: Relationships between nodes
- `layOutConfig`: Visual layout and positioning data


**Node Structure**

- Identity: `id`, `label`, `category`
- Metrics: `isTrafficFlowing`, `currentThruputTime30`, `averageThruputTime30`, `systemHealth`
- Analytics: `splunkDatas` array with detailed transaction metrics
- Positioning: `step` (layer/column in flow)


**Processing Section**

- Identity: `id`, `title`
- Metrics: `averageThroughputTime`
- Relationships: `aitNumber` array (node IDs)


**System Connection**

- Identity: `id` (matches source node label)
- Relationships: `source` (node ID), `target` (array of node IDs)


**Layout Configuration**

- Section positioning: `id`, `type`, `position`, `style`
- Node positioning: `sectionPositions` with coordinate arrays


---

## 2. API Endpoints Design

### 2.1 Save Complete Flow Diagram

```plaintext
PUT /api/v1/flows/{flowId}
Content-Type: application/json
Authorization: Bearer {jwt_token}
If-Match: "{etag}"
```

#### Request Payload Schema

```csharp
public class SaveFlowDiagramRequest
{
    [Range(0, double.MaxValue)]
    public double AverageThruputTime30 { get; set; }
    
    [Required]
    [MinLength(1)]
    [MaxLength(500)]
    public List<FlowNodeDto> Nodes { get; set; }
    
    [Required]
    [MinLength(1)]
    [MaxLength(20)]
    public List<ProcessingSectionDto> ProcessingSections { get; set; }
    
    [Required]
    public List<SystemConnectionDto> SystemConnections { get; set; }
    
    [Required]
    public List<LayoutConfigDto> LayoutConfig { get; set; }
    
    [Required]
    public string RowVersion { get; set; } // For concurrency control
}

public class FlowNodeDto
{
    [Required]
    public string Id { get; set; } // AIT Number (e.g., "11554", "41107")
    
    [Required]
    [StringLength(100)]
    public string Label { get; set; } // Display name (e.g., "SAG", "CPMobile")
    
    [Required]
    [StringLength(200)]
    public string Category { get; set; } // Section category
    
    public bool IsTrafficFlowing { get; set; }
    
    [Range(0, double.MaxValue)]
    public double CurrentThruputTime30 { get; set; }
    
    [Range(0, double.MaxValue)]
    public double AverageThruputTime30 { get; set; }
    
    [StringLength(50)]
    public string SystemHealth { get; set; } // "Healthy", "Unknown", ""
    
    public List<SplunkDataDto> SplunkDatas { get; set; }
    
    [Range(1, 10)]
    public int Step { get; set; } // Layer/column position
}

public class SplunkDataDto
{
    [Required]
    public string AiT_NUM { get; set; }
    
    [Required]
    public string AiT_NAME { get; set; }
    
    public string FloW_DIRECTION { get; set; } // "INBOUND FROM", "OUTBOUND TO", "Received", null
    
    public string FloW_AIT_NUM { get; set; }
    
    public string FloW_AIT_NAME { get; set; }
    
    public string IS_TRAFFIC_FLOWING { get; set; } // "Yes", "No"
    
    public string IS_TRAFFIC_ON_TREND { get; set; } // "On-Trend", "Off-Trend", "Approaching-Trend"
    
    public string AveragE_TRANSACTION_COUNT { get; set; }
    
    public string CurrenT_TRANSACTION_COUNT { get; set; }
    
    public string Historic_STD { get; set; }
    
    public string Historic_MEAN { get; set; }
    
    public string CurrenT_STD_VARIATION { get; set; }
}

public class ProcessingSectionDto
{
    [Required]
    public string Id { get; set; } // e.g., "bg-middleware", "bg-origination"
    
    [Required]
    [StringLength(200)]
    public string Title { get; set; }
    
    [Range(0, double.MaxValue)]
    public double AverageThroughputTime { get; set; }
    
    [Required]
    public List<string> AitNumber { get; set; } // Array of node IDs
}

public class SystemConnectionDto
{
    [Required]
    public string Id { get; set; } // Connection identifier (usually matches source label)
    
    [Required]
    public string Source { get; set; } // Source node ID
    
    [Required]
    public List<string> Target { get; set; } // Target node IDs
}

public class LayoutConfigDto
{
    [Required]
    public string Id { get; set; } // Section ID
    
    [Required]
    public string Type { get; set; } // "background"
    
    [Required]
    public PositionDto Position { get; set; }
    
    [Required]
    public LayoutDataDto Data { get; set; }
    
    public bool Draggable { get; set; } = false;
    
    public bool Selectable { get; set; } = false;
    
    public int ZIndex { get; set; } = -1;
    
    [Required]
    public StyleDto Style { get; set; }
    
    public SectionPositionsDto SectionPositions { get; set; }
}

public class PositionDto
{
    public double X { get; set; }
    public double Y { get; set; }
}

public class LayoutDataDto
{
    [Required]
    public string Title { get; set; }
}

public class StyleDto
{
    [Required]
    public string Width { get; set; } // e.g., "350px"
    
    [Required]
    public string Height { get; set; } // e.g., "960px"
}

public class SectionPositionsDto
{
    public Dictionary<string, SectionPositionDetailDto> Sections { get; set; }
}

public class SectionPositionDetailDto
{
    public double BaseX { get; set; }
    public List<PositionDto> Positions { get; set; }
}
```

#### Request Example

```json
PUT /api/v1/flows/payment-flow-2025
If-Match: "AAAAAAAAB9E="

{
  "averageThruputTime30": 63.68,
  "nodes": [
    {
      "id": "11554",
      "label": "SAG",
      "category": "Origination",
      "isTrafficFlowing": false,
      "currentThruputTime30": 0,
      "averageThruputTime30": 0,
      "systemHealth": "",
      "splunkDatas": [],
      "step": 1
    },
    {
      "id": "41107",
      "label": "CPMobile",
      "category": "Origination",
      "isTrafficFlowing": false,
      "currentThruputTime30": 0,
      "averageThruputTime30": 0,
      "systemHealth": "Healthy",
      "splunkDatas": [
        {
          "aiT_NUM": "41107",
          "aiT_NAME": "CPMOBILE",
          "floW_DIRECTION": null,
          "floW_AIT_NUM": "28950",
          "floW_AIT_NAME": "CPO Pay",
          "iS_TRAFFIC_FLOWING": "Yes",
          "iS_TRAFFIC_ON_TREND": "Trend (-24.99%)",
          "averagE_TRANSACTION_COUNT": "13.33",
          "currenT_TRANSACTION_COUNT": "10",
          "historic_STD": "4.01",
          "historic_MEAN": "6.56",
          "currenT_STD_VARIATION": "0.86"
        }
      ],
      "step": 1
    }
  ],
  "processingSections": [
    {
      "id": "bg-middleware",
      "title": "Middleware",
      "averageThroughputTime": 0,
      "aitNumber": ["4679", "60745"]
    },
    {
      "id": "bg-origination",
      "title": "Origination",
      "averageThroughputTime": 18.48,
      "aitNumber": ["11554", "41107", "48581", "54071", "71800"]
    }
  ],
  "systemConnections": [
    {
      "id": "SAG",
      "source": "11554",
      "target": ["512"]
    },
    {
      "id": "CPMobile",
      "source": "41107",
      "target": ["28960"]
    }
  ],
  "layoutConfig": [
    {
      "id": "bg-origination",
      "type": "background",
      "position": { "x": 0, "y": 0 },
      "data": { "title": "Origination" },
      "draggable": false,
      "selectable": false,
      "zIndex": -1,
      "style": { "width": "350px", "height": "960px" },
      "sectionPositions": {
        "sections": {
          "bg-origination": {
            "baseX": 50,
            "positions": [
              { "x": 50, "y": 0 },
              { "x": 50, "y": 192 }
            ]
          }
        }
      }
    }
  ],
  "rowVersion": "AAAAAAAAB9E="
}
```

#### Response Schema

```csharp
public class SaveFlowDiagramResponse
{
    public string FlowId { get; set; }
    public int Version { get; set; }
    public string RowVersion { get; set; }
    public DateTime LastModifiedAt { get; set; }
    public Guid LastModifiedBy { get; set; }
    public FlowMetricsDto Metrics { get; set; }
    public List<ValidationWarningDto> Warnings { get; set; }
}

public class FlowMetricsDto
{
    public int NodeCount { get; set; }
    public int ConnectionCount { get; set; }
    public int SectionCount { get; set; }
    public long PayloadSizeBytes { get; set; }
    public int ProcessingTimeMs { get; set; }
}
```

#### Success Response Example

```json
HTTP/1.1 200 OK
Content-Type: application/json
ETag: "AAAAAAAAB9I="

{
  "flowId": "payment-flow-2025",
  "version": 12,
  "rowVersion": "AAAAAAAAB9I=",
  "lastModifiedAt": "2025-02-10T14:30:00Z",
  "lastModifiedBy": "user-123",
  "metrics": {
    "nodeCount": 23,
    "connectionCount": 18,
    "sectionCount": 4,
    "payloadSizeBytes": 125678,
    "processingTimeMs": 234
  },
  "warnings": []
}
```

---

### 2.2 Retrieve Complete Flow Diagram

```plaintext
GET /api/v1/flows/{flowId}
Authorization: Bearer {jwt_token}
```

#### Query Parameters

- `includeMetrics` (bool, optional, default: true) - Include performance metrics
- `includeAnalytics` (bool, optional, default: true) - Include splunkDatas
- `version` (int, optional) - Retrieve specific version


#### Response Schema

```csharp
public class FlowDiagramResponse
{
    public string FlowId { get; set; }
    public int Version { get; set; }
    public string RowVersion { get; set; }
    public FlowStatus Status { get; set; }
    
    public double AverageThruputTime30 { get; set; }
    public List<FlowNodeDto> Nodes { get; set; }
    public List<ProcessingSectionDto> ProcessingSections { get; set; }
    public List<SystemConnectionDto> SystemConnections { get; set; }
    public List<LayoutConfigDto> LayoutConfig { get; set; }
    
    public FlowMetadataDto Metadata { get; set; }
}

public class FlowMetadataDto
{
    public Guid CreatedBy { get; set; }
    public string CreatedByName { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? LastModifiedBy { get; set; }
    public string LastModifiedByName { get; set; }
    public DateTime? LastModifiedAt { get; set; }
    public string Department { get; set; }
}

public enum FlowStatus
{
    Draft = 0,
    Published = 1,
    Archived = 2
}
```

#### Success Response Example

```json
HTTP/1.1 200 OK
Content-Type: application/json
ETag: "AAAAAAAAB9I="
Cache-Control: private, max-age=300

{
  "flowId": "payment-flow-2025",
  "version": 12,
  "rowVersion": "AAAAAAAAB9I=",
  "status": 1,
  "averageThruputTime30": 63.68,
  "nodes": [
    {
      "id": "11554",
      "label": "SAG",
      "category": "Origination",
      "isTrafficFlowing": false,
      "currentThruputTime30": 0,
      "averageThruputTime30": 0,
      "systemHealth": "",
      "splunkDatas": [],
      "step": 1
    }
  ],
  "processingSections": [
    {
      "id": "bg-middleware",
      "title": "Middleware",
      "averageThroughputTime": 0,
      "aitNumber": ["4679", "60745"]
    }
  ],
  "systemConnections": [
    {
      "id": "SAG",
      "source": "11554",
      "target": ["512"]
    }
  ],
  "layoutConfig": [
    {
      "id": "bg-origination",
      "type": "background",
      "position": { "x": 0, "y": 0 },
      "data": { "title": "Origination" },
      "draggable": false,
      "selectable": false,
      "zIndex": -1,
      "style": { "width": "350px", "height": "960px" },
      "sectionPositions": {
        "sections": {
          "bg-origination": {
            "baseX": 50,
            "positions": [
              { "x": 50, "y": 0 }
            ]
          }
        }
      }
    }
  ],
  "metadata": {
    "createdBy": "user-123",
    "createdByName": "John Doe",
    "createdAt": "2025-01-15T10:00:00Z",
    "lastModifiedBy": "user-123",
    "lastModifiedByName": "John Doe",
    "lastModifiedAt": "2025-02-10T14:30:00Z",
    "department": "Payments Operations"
  }
}
```

---

## 3. Database Schema Design

### 3.1 Core Tables

```sql
-- Main flow diagram table
CREATE TABLE FlowDiagrams (
    FlowId NVARCHAR(100) PRIMARY KEY,
    Version INT NOT NULL DEFAULT 1,
    Status INT NOT NULL DEFAULT 0, -- 0=Draft, 1=Published, 2=Archived
    AverageThruputTime30 FLOAT NOT NULL DEFAULT 0,
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LastModifiedBy UNIQUEIDENTIFIER,
    LastModifiedAt DATETIME2,
    Department NVARCHAR(100),
    RowVersion ROWVERSION NOT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_FlowDiagrams_Users_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id)
);

-- Flow nodes table
CREATE TABLE FlowNodes (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    FlowId NVARCHAR(100) NOT NULL,
    NodeId NVARCHAR(50) NOT NULL, -- AIT Number (e.g., "11554")
    Label NVARCHAR(100) NOT NULL,
    Category NVARCHAR(200) NOT NULL,
    IsTrafficFlowing BIT NOT NULL DEFAULT 0,
    CurrentThruputTime30 FLOAT NOT NULL DEFAULT 0,
    AverageThruputTime30 FLOAT NOT NULL DEFAULT 0,
    SystemHealth NVARCHAR(50),
    Step INT NOT NULL, -- Layer/column position
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_FlowNodes_FlowDiagrams FOREIGN KEY (FlowId) REFERENCES FlowDiagrams(FlowId) ON DELETE CASCADE,
    CONSTRAINT UQ_FlowNodes_FlowId_NodeId UNIQUE (FlowId, NodeId)
);

-- Splunk analytics data table
CREATE TABLE SplunkData (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    FlowNodeId BIGINT NOT NULL,
    AiT_NUM NVARCHAR(50) NOT NULL,
    AiT_NAME NVARCHAR(100) NOT NULL,
    FloW_DIRECTION NVARCHAR(50),
    FloW_AIT_NUM NVARCHAR(50),
    FloW_AIT_NAME NVARCHAR(200),
    IS_TRAFFIC_FLOWING NVARCHAR(10),
    IS_TRAFFIC_ON_TREND NVARCHAR(100),
    AveragE_TRANSACTION_COUNT NVARCHAR(50),
    CurrenT_TRANSACTION_COUNT NVARCHAR(50),
    Historic_STD NVARCHAR(50),
    Historic_MEAN NVARCHAR(50),
    CurrenT_STD_VARIATION NVARCHAR(50),
    CONSTRAINT FK_SplunkData_FlowNodes FOREIGN KEY (FlowNodeId) REFERENCES FlowNodes(Id) ON DELETE CASCADE
);

-- Processing sections table
CREATE TABLE ProcessingSections (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    FlowId NVARCHAR(100) NOT NULL,
    SectionId NVARCHAR(100) NOT NULL, -- e.g., "bg-middleware"
    Title NVARCHAR(200) NOT NULL,
    AverageThroughputTime FLOAT NOT NULL DEFAULT 0,
    CONSTRAINT FK_ProcessingSections_FlowDiagrams FOREIGN KEY (FlowId) REFERENCES FlowDiagrams(FlowId) ON DELETE CASCADE,
    CONSTRAINT UQ_ProcessingSections_FlowId_SectionId UNIQUE (FlowId, SectionId)
);

-- Section node assignments (many-to-many)
CREATE TABLE SectionNodeAssignments (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProcessingSectionId BIGINT NOT NULL,
    NodeId NVARCHAR(50) NOT NULL, -- AIT Number
    CONSTRAINT FK_SectionNodeAssignments_ProcessingSections FOREIGN KEY (ProcessingSectionId) REFERENCES ProcessingSections(Id) ON DELETE CASCADE
);

-- System connections table
CREATE TABLE SystemConnections (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    FlowId NVARCHAR(100) NOT NULL,
    ConnectionId NVARCHAR(100) NOT NULL,
    SourceNodeId NVARCHAR(50) NOT NULL,
    CONSTRAINT FK_SystemConnections_FlowDiagrams FOREIGN KEY (FlowId) REFERENCES FlowDiagrams(FlowId) ON DELETE CASCADE,
    CONSTRAINT UQ_SystemConnections_FlowId_ConnectionId UNIQUE (FlowId, ConnectionId)
);

-- Connection targets (one-to-many)
CREATE TABLE ConnectionTargets (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    SystemConnectionId BIGINT NOT NULL,
    TargetNodeId NVARCHAR(50) NOT NULL,
    CONSTRAINT FK_ConnectionTargets_SystemConnections FOREIGN KEY (SystemConnectionId) REFERENCES SystemConnections(Id) ON DELETE CASCADE
);

-- Layout configuration table
CREATE TABLE LayoutConfigurations (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    FlowId NVARCHAR(100) NOT NULL,
    SectionId NVARCHAR(100) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    PositionX FLOAT NOT NULL,
    PositionY FLOAT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Draggable BIT NOT NULL DEFAULT 0,
    Selectable BIT NOT NULL DEFAULT 0,
    ZIndex INT NOT NULL DEFAULT -1,
    Width NVARCHAR(50) NOT NULL,
    Height NVARCHAR(50) NOT NULL,
    SectionPositionsJson NVARCHAR(MAX), -- JSON for complex nested structure
    CONSTRAINT FK_LayoutConfigurations_FlowDiagrams FOREIGN KEY (FlowId) REFERENCES FlowDiagrams(FlowId) ON DELETE CASCADE,
    CONSTRAINT UQ_LayoutConfigurations_FlowId_SectionId UNIQUE (FlowId, SectionId)
);

-- Version history table
CREATE TABLE FlowVersions (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    FlowId NVARCHAR(100) NOT NULL,
    VersionNumber INT NOT NULL,
    SnapshotJson NVARCHAR(MAX) NOT NULL, -- Complete flow state as JSON
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_FlowVersions_FlowDiagrams FOREIGN KEY (FlowId) REFERENCES FlowDiagrams(FlowId) ON DELETE CASCADE,
    CONSTRAINT UQ_FlowVersions_FlowId_VersionNumber UNIQUE (FlowId, VersionNumber)
);
```

### 3.2 Indexes for Performance

```sql
-- Flow diagram queries
CREATE INDEX IX_FlowDiagrams_CreatedBy ON FlowDiagrams(CreatedBy);
CREATE INDEX IX_FlowDiagrams_Department ON FlowDiagrams(Department);
CREATE INDEX IX_FlowDiagrams_Status ON FlowDiagrams(Status);
CREATE INDEX IX_FlowDiagrams_LastModifiedAt ON FlowDiagrams(LastModifiedAt DESC);

-- Node queries
CREATE INDEX IX_FlowNodes_FlowId ON FlowNodes(FlowId);
CREATE INDEX IX_FlowNodes_NodeId ON FlowNodes(NodeId);
CREATE INDEX IX_FlowNodes_Category ON FlowNodes(Category);
CREATE INDEX IX_FlowNodes_Step ON FlowNodes(Step);

-- Splunk data queries
CREATE INDEX IX_SplunkData_FlowNodeId ON SplunkData(FlowNodeId);
CREATE INDEX IX_SplunkData_AiT_NUM ON SplunkData(AiT_NUM);

-- Section queries
CREATE INDEX IX_ProcessingSections_FlowId ON ProcessingSections(FlowId);
CREATE INDEX IX_SectionNodeAssignments_ProcessingSectionId ON SectionNodeAssignments(ProcessingSectionId);

-- Connection queries
CREATE INDEX IX_SystemConnections_FlowId ON SystemConnections(FlowId);
CREATE INDEX IX_SystemConnections_SourceNodeId ON SystemConnections(SourceNodeId);
CREATE INDEX IX_ConnectionTargets_SystemConnectionId ON ConnectionTargets(SystemConnectionId);
```

---

## 4. Controller Implementation

```csharp
[ApiController]
[Route("api/v1/flows")]
[Authorize]
public class FlowDiagramsController : ControllerBase
{
    private readonly IFlowDiagramService _flowService;
    private readonly IFlowValidator _validator;
    private readonly ILogger<FlowDiagramsController> _logger;

    [HttpPut("{flowId}")]
    [ProducesResponseType(typeof(SaveFlowDiagramResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> SaveFlowDiagram(
        [FromRoute] string flowId,
        [FromBody] SaveFlowDiagramRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            // 1. Validate request
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                return BadRequest(new ApiErrorResponse
                {
                    Error = "ValidationError",
                    Message = "One or more validation errors occurred",
                    ValidationErrors = validationResult.ToDictionary()
                });
            }

            // 2. Check authorization
            var existingFlow = await _flowService.GetByIdAsync(flowId, cancellationToken);
            if (existingFlow != null)
            {
                var authResult = await _authorizationService.AuthorizeAsync(User, existingFlow, "Update");
                if (!authResult.Succeeded)
                    return Forbid();
            }

            // 3. Validate concurrency
            if (existingFlow != null && existingFlow.RowVersion != request.RowVersion)
            {
                return Conflict(new ConcurrencyConflictResponse
                {
                    Error = "ConcurrencyConflict",
                    Message = "The flow has been modified by another user",
                    CurrentRowVersion = existingFlow.RowVersion,
                    AttemptedRowVersion = request.RowVersion
                });
            }

            // 4. Save flow with transaction
            var result = await _flowService.SaveFlowDiagramAsync(flowId, request, cancellationToken);

            // 5. Return response with new ETag
            Response.Headers.Add("ETag", $"\"{result.RowVersion}\"");
            
            return Ok(result);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency conflict while saving flow {FlowId}", flowId);
            return Conflict(new ApiErrorResponse
            {
                Error = "ConcurrencyConflict",
                Message = "The flow has been modified by another user"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving flow {FlowId}", flowId);
            return StatusCode(500, new ApiErrorResponse
            {
                Error = "InternalServerError",
                Message = "An error occurred while saving the flow"
            });
        }
    }

    [HttpGet("{flowId}")]
    [ProducesResponseType(typeof(FlowDiagramResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ResponseCache(Duration = 300, VaryByQueryKeys = new[] { "flowId", "version" })]
    public async Task<IActionResult> GetFlowDiagram(
        [FromRoute] string flowId,
        [FromQuery] bool includeMetrics = true,
        [FromQuery] bool includeAnalytics = true,
        [FromQuery] int? version = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var flow = await _flowService.GetFlowDiagramAsync(
                flowId, 
                includeMetrics, 
                includeAnalytics, 
                version, 
                cancellationToken);

            if (flow == null)
            {
                return NotFound(new ApiErrorResponse
                {
                    Error = "NotFound",
                    Message = $"Flow with ID {flowId} not found"
                });
            }

            // Check authorization
            var authResult = await _authorizationService.AuthorizeAsync(User, flow, "Read");
            if (!authResult.Succeeded)
                return Forbid();

            // Set ETag header
            Response.Headers.Add("ETag", $"\"{flow.RowVersion}\"");

            return Ok(flow);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving flow {FlowId}", flowId);
            return StatusCode(500, new ApiErrorResponse
            {
                Error = "InternalServerError",
                Message = "An error occurred while retrieving the flow"
            });
        }
    }
}
```

---

## 5. Service Layer Implementation

```csharp
public class FlowDiagramService : IFlowDiagramService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<FlowDiagramService> _logger;

    public async Task<SaveFlowDiagramResponse> SaveFlowDiagramAsync(
        string flowId,
        SaveFlowDiagramRequest request,
        CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();
        
        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        
        try
        {
            // 1. Load or create flow diagram
            var flow = await _context.FlowDiagrams
                .Include(f => f.Nodes).ThenInclude(n => n.SplunkDatas)
                .Include(f => f.ProcessingSections).ThenInclude(s => s.NodeAssignments)
                .Include(f => f.SystemConnections).ThenInclude(c => c.Targets)
                .Include(f => f.LayoutConfigurations)
                .FirstOrDefaultAsync(f => f.FlowId == flowId && !f.IsDeleted, cancellationToken);

            bool isNew = flow == null;
            
            if (isNew)
            {
                flow = new FlowDiagram
                {
                    FlowId = flowId,
                    CreatedBy = _currentUserService.UserId,
                    CreatedAt = DateTime.UtcNow,
                    Version = 1
                };
                _context.FlowDiagrams.Add(flow);
            }
            else
            {
                flow.LastModifiedBy = _currentUserService.UserId;
                flow.LastModifiedAt = DateTime.UtcNow;
                flow.Version++;
            }

            // 2. Update flow metadata
            flow.AverageThruputTime30 = request.AverageThruputTime30;

            // 3. Handle nodes (delete removed, update existing, add new)
            if (!isNew)
            {
                var requestNodeIds = request.Nodes.Select(n => n.Id).ToHashSet();
                var nodesToDelete = flow.Nodes.Where(n => !requestNodeIds.Contains(n.NodeId)).ToList();
                _context.FlowNodes.RemoveRange(nodesToDelete);
            }

            foreach (var nodeDto in request.Nodes)
            {
                var existingNode = flow.Nodes.FirstOrDefault(n => n.NodeId == nodeDto.Id);
                
                if (existingNode != null)
                {
                    // Update existing node
                    existingNode.Label = nodeDto.Label;
                    existingNode.Category = nodeDto.Category;
                    existingNode.IsTrafficFlowing = nodeDto.IsTrafficFlowing;
                    existingNode.CurrentThruputTime30 = nodeDto.CurrentThruputTime30;
                    existingNode.AverageThruputTime30 = nodeDto.AverageThruputTime30;
                    existingNode.SystemHealth = nodeDto.SystemHealth;
                    existingNode.Step = nodeDto.Step;
                    
                    // Update splunk data
                    _context.SplunkData.RemoveRange(existingNode.SplunkDatas);
                    existingNode.SplunkDatas = nodeDto.SplunkDatas.Select(sd => new SplunkData
                    {
                        AiT_NUM = sd.AiT_NUM,
                        AiT_NAME = sd.AiT_NAME,
                        FloW_DIRECTION = sd.FloW_DIRECTION,
                        FloW_AIT_NUM = sd.FloW_AIT_NUM,
                        FloW_AIT_NAME = sd.FloW_AIT_NAME,
                        IS_TRAFFIC_FLOWING = sd.IS_TRAFFIC_FLOWING,
                        IS_TRAFFIC_ON_TREND = sd.IS_TRAFFIC_ON_TREND,
                        AveragE_TRANSACTION_COUNT = sd.AveragE_TRANSACTION_COUNT,
                        CurrenT_TRANSACTION_COUNT = sd.CurrenT_TRANSACTION_COUNT,
                        Historic_STD = sd.Historic_STD,
                        Historic_MEAN = sd.Historic_MEAN,
                        CurrenT_STD_VARIATION = sd.CurrenT_STD_VARIATION
                    }).ToList();
                }
                else
                {
                    // Add new node
                    var newNode = new FlowNode
                    {
                        NodeId = nodeDto.Id,
                        Label = nodeDto.Label,
                        Category = nodeDto.Category,
                        IsTrafficFlowing = nodeDto.IsTrafficFlowing,
                        CurrentThruputTime30 = nodeDto.CurrentThruputTime30,
                        AverageThruputTime30 = nodeDto.AverageThruputTime30,
                        SystemHealth = nodeDto.SystemHealth,
                        Step = nodeDto.Step,
                        SplunkDatas = nodeDto.SplunkDatas.Select(sd => new SplunkData
                        {
                            AiT_NUM = sd.AiT_NUM,
                            AiT_NAME = sd.AiT_NAME,
                            FloW_DIRECTION = sd.FloW_DIRECTION,
                            FloW_AIT_NUM = sd.FloW_AIT_NUM,
                            FloW_AIT_NAME = sd.FloW_AIT_NAME,
                            IS_TRAFFIC_FLOWING = sd.IS_TRAFFIC_FLOWING,
                            IS_TRAFFIC_ON_TREND = sd.IS_TRAFFIC_ON_TREND,
                            AveragE_TRANSACTION_COUNT = sd.AveragE_TRANSACTION_COUNT,
                            CurrenT_TRANSACTION_COUNT = sd.CurrenT_TRANSACTION_COUNT,
                            Historic_STD = sd.Historic_STD,
                            Historic_MEAN = sd.Historic_MEAN,
                            CurrenT_STD_VARIATION = sd.CurrenT_STD_VARIATION
                        }).ToList()
                    };
                    flow.Nodes.Add(newNode);
                }
            }

            // 4. Handle processing sections (similar pattern)
            if (!isNew)
            {
                _context.ProcessingSections.RemoveRange(flow.ProcessingSections);
            }

            foreach (var sectionDto in request.ProcessingSections)
            {
                var section = new ProcessingSection
                {
                    SectionId = sectionDto.Id,
                    Title = sectionDto.Title,
                    AverageThroughputTime = sectionDto.AverageThroughputTime,
                    NodeAssignments = sectionDto.AitNumber.Select(aitNum => new SectionNodeAssignment
                    {
                        NodeId = aitNum
                    }).ToList()
                };
                flow.ProcessingSections.Add(section);
            }

            // 5. Handle system connections
            if (!isNew)
            {
                _context.SystemConnections.RemoveRange(flow.SystemConnections);
            }

            foreach (var connDto in request.SystemConnections)
            {
                var connection = new SystemConnection
                {
                    ConnectionId = connDto.Id,
                    SourceNodeId = connDto.Source,
                    Targets = connDto.Target.Select(t => new ConnectionTarget
                    {
                        TargetNodeId = t
                    }).ToList()
                };
                flow.SystemConnections.Add(connection);
            }

            // 6. Handle layout configurations
            if (!isNew)
            {
                _context.LayoutConfigurations.RemoveRange(flow.LayoutConfigurations);
            }

            foreach (var layoutDto in request.LayoutConfig)
            {
                var layout = new LayoutConfiguration
                {
                    SectionId = layoutDto.Id,
                    Type = layoutDto.Type,
                    PositionX = layoutDto.Position.X,
                    PositionY = layoutDto.Position.Y,
                    Title = layoutDto.Data.Title,
                    Draggable = layoutDto.Draggable,
                    Selectable = layoutDto.Selectable,
                    ZIndex = layoutDto.ZIndex,
                    Width = layoutDto.Style.Width,
                    Height = layoutDto.Style.Height,
                    SectionPositionsJson = JsonSerializer.Serialize(layoutDto.SectionPositions)
                };
                flow.LayoutConfigurations.Add(layout);
            }

            // 7. Save changes
            await _context.SaveChangesAsync(cancellationToken);
            
            // 8. Create version snapshot
            var versionSnapshot = new FlowVersion
            {
                FlowId = flowId,
                VersionNumber = flow.Version,
                SnapshotJson = JsonSerializer.Serialize(request),
                CreatedBy = _currentUserService.UserId,
                CreatedAt = DateTime.UtcNow
            };
            _context.FlowVersions.Add(versionSnapshot);
            await _context.SaveChangesAsync(cancellationToken);
            
            // 9. Commit transaction
            await transaction.CommitAsync(cancellationToken);
            
            stopwatch.Stop();

            // 10. Return response
            return new SaveFlowDiagramResponse
            {
                FlowId = flow.FlowId,
                Version = flow.Version,
                RowVersion = Convert.ToBase64String(flow.RowVersion),
                LastModifiedAt = flow.LastModifiedAt ?? flow.CreatedAt,
                LastModifiedBy = flow.LastModifiedBy ?? flow.CreatedBy,
                Metrics = new FlowMetricsDto
                {
                    NodeCount = flow.Nodes.Count,
                    ConnectionCount = flow.SystemConnections.Count,
                    SectionCount = flow.ProcessingSections.Count,
                    PayloadSizeBytes = Encoding.UTF8.GetByteCount(JsonSerializer.Serialize(request)),
                    ProcessingTimeMs = (int)stopwatch.ElapsedMilliseconds
                },
                Warnings = new List<ValidationWarningDto>()
            };
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
```

---

This comprehensive API design is fully compatible with the existing backend response structure, ensuring seamless integration with the payment processing flow monitoring system while following C# .NET Core best practices for data integrity, validation, concurrency control, security, and scalability.
