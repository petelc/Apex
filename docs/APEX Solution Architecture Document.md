# APEX Solution Architecture Document

Status: draft
Last edited time: February 21, 2026 10:29 PM
Created time: January 18, 2026 9:59 PM
Projects: Apex - Application (https://www.notion.so/Apex-Application-2db1990d6930808eaa32c647b99f1476?pvs=21), APEX - Work Management System (https://www.notion.so/APEX-Work-Management-System-2d41990d69308000bccbd4c4c5bde2fd?pvs=21)
Archive: No
Classification: Project Documentation
Description: Solution Architecture Document v3.1

# APEX Solution Architecture Document

## Clean Architecture & Domain-Driven Design Implementation

**Project:** APEX - Multi-Tenant Work Management System

**Version:** 3.0

**Date:** January 2026

**Status:** Current

**Author:** Architecture Team

---

## Table of Contents

1. [Executive Summary](about:blank#1-executive-summary)
2. [Project Overview](about:blank#2-project-overview)
3. [Architecture Philosophy](about:blank#3-architecture-philosophy)
4. [Solution Structure](about:blank#4-solution-structure)
5. [Domain Model](about:blank#5-domain-model)
6. [Application Layer](about:blank#6-application-layer)
7. [Infrastructure Layer](about:blank#7-infrastructure-layer)
8. [Presentation Layer](about:blank#8-presentation-layer)
9. [Cross-Cutting Concerns](about:blank#9-cross-cutting-concerns)
10. [Technology Stack](about:blank#10-technology-stack)
11. [Multi-Tenancy Implementation](about:blank#11-multi-tenancy-implementation)
12. [Security Architecture](about:blank#12-security-architecture)
13. [API Design](about:blank#13-api-design)
14. [Frontend Architecture](about:blank#14-frontend-architecture)
15. [Implementation Patterns](about:blank#15-implementation-patterns)
16. [Testing Strategy](about:blank#16-testing-strategy)
17. [Deployment Architecture](about:blank#17-deployment-architecture)

---

## 1. Executive Summary

APEX is an enterprise-grade, multi-tenant work management system built using **Clean Architecture** principles and **Domain-Driven Design** (DDD) tactical patterns. The system streamlines project initiation, change management, task execution, and deployment workflows across organizations.

### Key Architectural Achievements

- **Clean Architecture Compliance**: Strict dependency rules with Domain layer having zero external dependencies
- **Multi-Tenancy**: Complete tenant isolation at all layers with tenant-aware queries and data segregation
- **CQRS Pattern**: Separation of read and write operations using MediatR
- **Domain-Driven Design**: Rich domain models with proper aggregate boundaries and invariant enforcement
- **Scalable Frontend**: React 19+ with Material UI v7 providing modern, responsive user experience
- **API-First Design**: RESTful API with comprehensive Swagger documentation

### Current Implementation Status

✅ **Completed:**
- Core Domain Layer (Projects, Tasks aggregates)
- CQRS with MediatR
- Multi-tenant data isolation
- User lookup and enrichment
- Dashboard analytics APIs
- React frontend with Material UI
- Change Management UI components

🔄 **In Progress:**
- Frontend-Backend Integration
- Advanced reporting features
- Deployment management workflows

---

## 2. Project Overview

### 2.1 Business Purpose

APEX provides a unified platform for:
- **Project Requests**: Submit and manage new project initiatives
- **Change Management**: Formal change request workflow with CMB approval
- **Task Management**: Create, assign, and track work items
- **Resource Requests**: Request equipment, tools, and services
- **Deployment Management**: Control deployment processes through governance
- **Analytics**: Real-time dashboards for management insights

### 2.2 Key Stakeholders

| Role | Responsibilities |
| --- | --- |
| **Executive Leadership** | Strategic oversight and budget approval |
| **Change Management Board (CMB)** | Review and approve/deny project and change requests |
| **Project Managers** | Submit requests, create tasks, manage assignments |
| **Development Teams** | Execute tasks, submit resource/deployment requests |
| **IT Operations** | Review and execute approved deployments |
| **Management** | Monitor metrics and analyze trends |
| **System Administrators** | Configure system, manage users and roles |

### 2.3 Core Capabilities

1. **Request Management**: Standardized submission and approval workflows
2. **Task Execution**: Assignment, tracking, and status management
3. **Governance**: CMB review processes with comprehensive audit trails
4. **Visibility**: Real-time dashboards and analytics
5. **Multi-Tenancy**: Complete isolation between organizational tenants
6. **Role-Based Access**: Granular permissions based on user roles

---

## 3. Architecture Philosophy

### 3.1 Clean Architecture Principles

APEX implements Clean Architecture with strict adherence to the **Dependency Rule**:

```
┌─────────────────────────────────────┐
│     Presentation Layer (Web)        │  ← Controllers, DTOs, Endpoints
│  Depends on: Application            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Application Layer               │  ← Use Cases, Commands, Queries
│  Depends on: Domain                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Domain Layer (Core)            │  ← Entities, Value Objects, Events
│  Depends on: NOTHING                 │  ← Zero external dependencies
└─────────────────────────────────────┘
              ↑ implements
┌─────────────────────────────────────┐
│    Infrastructure Layer              │  ← Database, External Services
│  Implements: Domain Interfaces       │
└─────────────────────────────────────┘
```

**Key Rules:**
- Domain layer has **ZERO** dependencies on other layers
- Application layer depends **ONLY** on Domain
- Infrastructure **implements** interfaces defined in Domain
- Presentation depends on Application (not directly on Domain or Infrastructure)
- All dependencies point **INWARD** toward the Domain

### 3.2 Domain-Driven Design Approach

**Tactical Patterns Applied:**

| Pattern | Implementation |
| --- | --- |
| **Aggregates** | Projects, Tasks, ChangeRequests with clear boundaries |
| **Entities** | Objects with identity (Project, Task, etc.) |
| **Value Objects** | Immutable concepts (ProjectNumber, TaskStatus, Priority) |
| **Domain Events** | ProjectCreated, TaskAssigned, ChangeRequestApproved |
| **Repository Pattern** | Abstraction for data access with specifications |
| **Specifications** | Reusable query logic (Ardalis pattern) |
| **Domain Services** | Cross-aggregate operations |

**Strategic Design:**
- **Bounded Contexts**: Clear boundaries around Project Management, Task Management, Change Management
- **Ubiquitous Language**: Consistent terminology throughout code and conversations
- **Anti-Corruption Layer**: Protection from external system complexities

### 3.3 CQRS Pattern

Commands and Queries are separated using **MediatR**:

**Commands** (Write Operations):
- Change system state
- Validated using FluentValidation
- Return success/failure indicators
- Examples: `CreateProjectCommand`, `AssignTaskCommand`

**Queries** (Read Operations):
- Return data without side effects
- Use specifications for complex filtering
- Return DTOs optimized for UI needs
- Examples: `GetProjectQuery`, `ListTasksQuery`

---

## 4. Solution Structure

### 4.1 Project Organization

```
APEX.sln
│
├── src/
│   ├── APEX.Core/                          # Domain Layer
│   │   ├── ProjectAggregate/
│   │   │   ├── Project.cs                  # Aggregate Root
│   │   │   ├── ProjectNumber.cs            # Value Object
│   │   │   ├── ProjectStatus.cs            # Enumeration
│   │   │   └── Events/
│   │   │       ├── ProjectCreatedEvent.cs
│   │   │       └── ProjectApprovedEvent.cs
│   │   │
│   │   ├── TaskAggregate/
│   │   │   ├── Task.cs
│   │   │   ├── TaskStatus.cs
│   │   │   └── Events/
│   │   │
│   │   ├── Interfaces/
│   │   │   ├── IRepository.cs
│   │   │   └── ISpecification.cs
│   │   │
│   │   └── SharedKernel/
│   │       ├── EntityBase.cs
│   │       ├── ValueObject.cs
│   │       └── DomainEvent.cs
│   │
│   ├── APEX.UseCases/                      # Application Layer
│   │   ├── Projects/
│   │   │   ├── Create/
│   │   │   │   ├── CreateProjectCommand.cs
│   │   │   │   ├── CreateProjectHandler.cs
│   │   │   │   └── CreateProjectValidator.cs
│   │   │   ├── List/
│   │   │   │   ├── ListProjectsQuery.cs
│   │   │   │   └── ListProjectsHandler.cs
│   │   │   └── DTOs/
│   │   │       ├── ProjectDto.cs
│   │   │       └── ProjectListDto.cs
│   │   │
│   │   ├── Tasks/
│   │   │   ├── Create/
│   │   │   ├── Assign/
│   │   │   ├── List/
│   │   │   └── DTOs/
│   │   │
│   │   ├── Dashboard/
│   │   │   ├── GetDashboardMetrics/
│   │   │   └── DTOs/
│   │   │
│   │   └── Contributors/
│   │       └── ContributorDto.cs           # Shared DTO
│   │
│   ├── APEX.Infrastructure/                # Infrastructure Layer
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── Config/
│   │   │   │   ├── ProjectConfiguration.cs
│   │   │   │   └── TaskConfiguration.cs
│   │   │   └── Migrations/
│   │   │
│   │   ├── Repositories/
│   │   │   ├── EfRepository.cs
│   │   │   └── Specifications/
│   │   │       ├── ProjectSpecs.cs
│   │   │       └── TaskSpecs.cs
│   │   │
│   │   └── Services/
│   │       ├── EmailService.cs
│   │       └── UserLookupService.cs
│   │
│   └── APEX.Web/                           # Presentation Layer
│       ├── Endpoints/                      # FastEndpoints
│       │   ├── Projects/
│       │   │   ├── CreateProjectEndpoint.cs
│       │   │   ├── ListProjectsEndpoint.cs
│       │   │   ├── GetProjectEndpoint.cs
│       │   │   ├── UpdateProjectEndpoint.cs
│       │   │   └── DeleteProjectEndpoint.cs
│       │   │
│       │   ├── Tasks/
│       │   │   ├── CreateTaskEndpoint.cs
│       │   │   ├── ListTasksEndpoint.cs
│       │   │   └── AssignTaskEndpoint.cs
│       │   │
│       │   └── Dashboard/
│       │       ├── GetMetricsEndpoint.cs
│       │       └── GetProjectsByStatusEndpoint.cs
│       │
│       ├── Models/                         # Request/Response models
│       │   ├── CreateProjectRequest.cs
│       │   └── UpdateProjectRequest.cs
│       │
│       ├── Extensions/
│       │   └── ClaimsPrincipalExtensions.cs
│       │
│       └── Program.cs                      # Application startup
│
├── client/                                 # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   ├── Projects/
│   │   │   ├── Tasks/
│   │   │   └── ChangeManagement/
│   │   │
│   │   ├── services/
│   │   │   └── api.ts
│   │   │
│   │   ├── hooks/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   └── package.json
│
└── tests/
    ├── APEX.UnitTests/
    ├── APEX.IntegrationTests/
    └── APEX.FunctionalTests/
```

### 4.2 Layer Responsibilities

**APEX.Core (Domain)**
- Business logic and rules
- Domain entities and aggregates
- Value objects
- Domain events
- Repository interfaces
- Specifications (following Ardalis pattern)
- **NO** framework dependencies

**APEX.UseCases (Application)**
- Use cases (Commands and Queries)
- Command/Query handlers
- Validation logic (FluentValidation)
- DTOs for data transfer
- Application-specific business rules
- Depends **ONLY** on APEX.Core

**APEX.Infrastructure**
- Database implementation (EF Core)
- Repository implementations
- External service integrations
- Caching, logging, messaging
- **Implements** interfaces from APEX.Core

**APEX.Web (Presentation)**
- API controllers/endpoints
- Request/Response models
- Authentication/Authorization
- API documentation (Swagger)
- Dependency injection configuration

---

## 5. Domain Model

### 5.1 Core Aggregates

### Project Aggregate

**Root Entity:** `Project`

```csharp
public class Project : EntityBase, IAggregateRoot
{
    public string Name { get; private set; }
    public ProjectNumber ProjectNumber { get; private set; }
    public string Description { get; private set; }
    public ProjectStatus Status { get; private set; }
    public int TenantId { get; private set; }
    public int CreatedById { get; private set; }
    public int? AssignedToId { get; private set; }
    public DateTime CreatedDate { get; private set; }
    public DateTime? ApprovedDate { get; private set; }

    // Business logic methods
    public void Approve(int approvedById)
    {
        if (Status != ProjectStatus.Pending)
            throw new InvalidOperationException("Only pending projects can be approved");

        Status = ProjectStatus.Approved;
        ApprovedDate = DateTime.UtcNow;

        // Raise domain event
        RegisterDomainEvent(new ProjectApprovedEvent(Id, approvedById));
    }

    public void Assign(int userId)
    {
        AssignedToId = userId;
        RegisterDomainEvent(new ProjectAssignedEvent(Id, userId));
    }
}
```

**Value Objects:**
- `ProjectNumber`: Unique identifier with format validation
- `ProjectStatus`: Enumeration (Pending, Approved, Rejected, InProgress, Completed)
- `Priority`: Enumeration (Low, Medium, High, Critical)

**Domain Events:**
- `ProjectCreatedEvent`
- `ProjectApprovedEvent`
- `ProjectRejectedEvent`
- `ProjectAssignedEvent`
- `ProjectCompletedEvent`

**Invariants:**
- Project name must be unique within tenant
- Project number follows specific format
- Only pending projects can be approved/rejected
- Approved projects can be assigned

### Task Aggregate

**Root Entity:** `Task`

```csharp
public class Task : EntityBase, IAggregateRoot
{
    public string Title { get; private set; }
    public string Description { get; private set; }
    public TaskStatus Status { get; private set; }
    public Priority Priority { get; private set; }
    public int TenantId { get; private set; }
    public int ProjectId { get; private set; }
    public int CreatedById { get; private set; }
    public int? AssignedToId { get; private set; }
    public DateTime DueDate { get; private set; }
    public DateTime? CompletedDate { get; private set; }

    public void AssignTo(int userId)
    {
        if (Status == TaskStatus.Completed)
            throw new InvalidOperationException("Cannot assign completed task");

        AssignedToId = userId;
        RegisterDomainEvent(new TaskAssignedEvent(Id, userId));
    }

    public void Complete(int completedById)
    {
        if (Status == TaskStatus.Completed)
            throw new InvalidOperationException("Task already completed");

        Status = TaskStatus.Completed;
        CompletedDate = DateTime.UtcNow;
        RegisterDomainEvent(new TaskCompletedEvent(Id, completedById));
    }
}
```

**Value Objects:**
- `TaskStatus`: Enumeration (NotStarted, InProgress, Blocked, Completed, Cancelled)
- `Priority`: Shared with Project

**Domain Events:**
- `TaskCreatedEvent`
- `TaskAssignedEvent`
- `TaskStatusChangedEvent`
- `TaskCompletedEvent`

**Invariants:**
- Task must belong to a project
- Due date must be in the future when created
- Completed tasks cannot be modified
- Task assignment limited to tenant members

### 5.2 Repository Interfaces

Following the **Ardalis Specification** pattern:

```csharp
// APEX.Core/Interfaces/IRepository.cs
public interface IRepository<T> where T : class, IAggregateRoot
{
    Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<T>> ListAsync(CancellationToken cancellationToken = default);
    Task<List<T>> ListAsync(ISpecification<T> spec, CancellationToken cancellationToken = default);
    Task<T?> FirstOrDefaultAsync(ISpecification<T> spec, CancellationToken cancellationToken = default);
    Task<int> CountAsync(ISpecification<T> spec, CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(T entity, CancellationToken cancellationToken = default);
}
```

### 5.3 Specifications

Reusable query logic kept in UseCases layer:

```csharp
// APEX.UseCases/Projects/Specifications/ProjectsByStatusSpec.cs
public class ProjectsByStatusSpec : Specification<Project>
{
    public ProjectsByStatusSpec(int tenantId, ProjectStatus status)
    {
        Query
            .Where(p => p.TenantId == tenantId && p.Status == status)
            .Include(p => p.CreatedBy)
            .OrderByDescending(p => p.CreatedDate);
    }
}

// APEX.UseCases/Projects/Specifications/ProjectsWithUserLookupSpec.cs
public class ProjectsWithUserLookupSpec : Specification<Project>
{
    public ProjectsWithUserLookupSpec(int tenantId)
    {
        Query
            .Where(p => p.TenantId == tenantId)
            .OrderByDescending(p => p.CreatedDate);
    }
}
```

---

## 6. Application Layer

### 6.1 CQRS Implementation

### Command Example

```csharp
// APEX.UseCases/Projects/Create/CreateProjectCommand.cs
public record CreateProjectCommand(
    string Name,
    string Description,
    int TenantId,
    int CreatedById
) : IRequest<Result<int>>;

// APEX.UseCases/Projects/Create/CreateProjectHandler.cs
public class CreateProjectHandler : IRequestHandler<CreateProjectCommand, Result<int>>
{
    private readonly IRepository<Project> _repository;

    public CreateProjectHandler(IRepository<Project> repository)
    {
        _repository = repository;
    }

    public async Task<Result<int>> Handle(
        CreateProjectCommand request,
        CancellationToken cancellationToken)
    {
        // Create domain entity
        var project = new Project(
            request.Name,
            request.Description,
            request.TenantId,
            request.CreatedById
        );

        // Persist
        var createdProject = await _repository.AddAsync(project, cancellationToken);

        return Result<int>.Success(createdProject.Id);
    }
}

// APEX.UseCases/Projects/Create/CreateProjectValidator.cs
public class CreateProjectValidator : AbstractValidator<CreateProjectCommand>
{
    public CreateProjectValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Description)
            .NotEmpty()
            .MaximumLength(2000);

        RuleFor(x => x.TenantId)
            .GreaterThan(0);
    }
}
```

### Query Example

```csharp
// APEX.UseCases/Projects/List/ListProjectsQuery.cs
public record ListProjectsQuery(int TenantId) : IRequest<Result<List<ProjectDto>>>;

// APEX.UseCases/Projects/List/ListProjectsHandler.cs
public class ListProjectsHandler : IRequestHandler<ListProjectsQuery, Result<List<ProjectDto>>>
{
    private readonly IRepository<Project> _repository;

    public ListProjectsHandler(IRepository<Project> repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<ProjectDto>>> Handle(
        ListProjectsQuery request,
        CancellationToken cancellationToken)
    {
        var spec = new ProjectsWithUserLookupSpec(request.TenantId);
        var projects = await _repository.ListAsync(spec, cancellationToken);

        // Map to DTOs
        var dtos = projects.Select(p => new ProjectDto
        {
            Id = p.Id,
            Name = p.Name,
            Status = p.Status.ToString(),
            CreatedDate = p.CreatedDate,
            CreatedById = p.CreatedById
        }).ToList();

        return Result<List<ProjectDto>>.Success(dtos);
    }
}
```

### 6.2 DTO Organization

All DTOs are consolidated in shared folders for consistency:

```
APEX.UseCases/
├── Projects/
│   └── DTOs/
│       ├── ProjectDto.cs
│       ├── ProjectListDto.cs
│       └── ProjectDetailDto.cs
│
├── Tasks/
│   └── DTOs/
│       ├── TaskDto.cs
│       └── TaskDetailDto.cs
│
├── Dashboard/
│   └── DTOs/
│       ├── DashboardMetricsDto.cs
│       └── StatusCountDto.cs
│
└── Contributors/
    └── ContributorDto.cs          # Shared across aggregates
```

**ContributorDto** pattern for user enrichment:

```csharp
public record ContributorDto(int UserId, string Name, string? Email);

public record ProjectDto
{
    public int Id { get; init; }
    public string Name { get; init; }
    public string Status { get; init; }
    public DateTime CreatedDate { get; init; }
    public ContributorDto? CreatedBy { get; set; }      // Enriched at Web layer
    public ContributorDto? AssignedTo { get; set; }     // Enriched at Web layer
}
```

### 6.3 User Enrichment Pattern

**Important Architectural Decision:** User lookup and enrichment is performed at the **Web layer**, not in handlers:

```csharp
// APEX.Web/Controllers/ProjectsController.cs
[HttpGet]
public async Task<ActionResult<List<ProjectDto>>> List([FromQuery] int tenantId)
{
    var result = await _mediator.Send(new ListProjectsQuery(tenantId));

    if (!result.IsSuccess)
        return BadRequest(result.Errors);

    // Batch user enrichment at Web layer
    var projects = result.Value;
    var userIds = projects
        .SelectMany(p => new[] { p.CreatedById, p.AssignedToId })
        .Where(id => id.HasValue)
        .Select(id => id!.Value)
        .Distinct()
        .ToList();

    var users = await _userLookupService.GetUsersByIdsAsync(userIds);
    var userDict = users.ToDictionary(u => u.UserId);

    // Enrich DTOs
    foreach (var project in projects)
    {
        project.CreatedBy = userDict.GetValueOrDefault(project.CreatedById);
        project.AssignedTo = project.AssignedToId.HasValue
            ? userDict.GetValueOrDefault(project.AssignedToId.Value)
            : null;
    }

    return Ok(projects);
}
```

---

## 7. Infrastructure Layer

### 7.1 Entity Framework Configuration

**DbContext:**

```csharp
public class AppDbContext : DbContext
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Task> Tasks => Set<Task>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Multi-tenant query filters
        modelBuilder.Entity<Project>()
            .HasQueryFilter(p => p.TenantId == _currentTenantId);

        modelBuilder.Entity<Task>()
            .HasQueryFilter(t => t.TenantId == _currentTenantId);
    }
}
```

**Entity Configuration:**

```csharp
public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("Projects");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .IsRequired()
            .HasMaxLength(2000);

        // Value object conversion
        builder.OwnsOne(p => p.ProjectNumber, pn =>
        {
            pn.Property(n => n.Value)
                .HasColumnName("ProjectNumber")
                .IsRequired()
                .HasMaxLength(20);
        });

        // Enum conversion
        builder.Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        // Indexes
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => new { p.TenantId, p.ProjectNumber })
            .IsUnique();
    }
}
```

### 7.2 Repository Implementation

```csharp
public class EfRepository<T> : IRepository<T> where T : class, IAggregateRoot
{
    private readonly AppDbContext _dbContext;
    private readonly ISpecificationEvaluator _specificationEvaluator;

    public EfRepository(AppDbContext dbContext, ISpecificationEvaluator specificationEvaluator)
    {
        _dbContext = dbContext;
        _specificationEvaluator = specificationEvaluator;
    }

    public async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<T>().FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<List<T>> ListAsync(ISpecification<T> spec, CancellationToken cancellationToken = default)
    {
        var query = _specificationEvaluator.GetQuery(_dbContext.Set<T>().AsQueryable(), spec);
        return await query.ToListAsync(cancellationToken);
    }

    public async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _dbContext.Set<T>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    // Additional methods...
}
```

---

## 8. Presentation Layer

### 8.1 FastEndpoints Pattern

APEX uses **FastEndpoints** for a cleaner, more performant alternative to traditional MVC controllers.

**Why FastEndpoints?**
- Better performance (no controller overhead)
- One endpoint per file (better organization)
- Built-in validation
- Easier to test
- Cleaner dependency injection

**Create Project Endpoint:**

```csharp
// APEX.Web/Endpoints/Projects/CreateProjectEndpoint.cs
public class CreateProjectEndpoint : Endpoint<CreateProjectRequest, int>
{
    private readonly IMediator _mediator;

    public CreateProjectEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/api/projects");
        Roles("ProjectManager", "Administrator");
        Summary(s =>
        {
            s.Summary = "Create a new project";
            s.Description = "Creates a new project in the system";
            s.Response<int>(201, "Project created successfully");
            s.Response(400, "Validation failed");
        });
    }

    public override async Task HandleAsync(CreateProjectRequest req, CancellationToken ct)
    {
        var tenantId = User.GetTenantId();
        var userId = User.GetUserId();

        var command = new CreateProjectCommand(
            req.Name,
            req.Description,
            tenantId,
            userId
        );

        var result = await _mediator.Send(command, ct);

        if (!result.IsSuccess)
        {
            ThrowError(result.Errors);
            return;
        }

        await SendCreatedAtAsync<GetProjectEndpoint>(
            new { id = result.Value },
            result.Value,
            cancellation: ct
        );
    }
}
```

**List Projects with User Enrichment:**

```csharp
// APEX.Web/Endpoints/Projects/ListProjectsEndpoint.cs
public class ListProjectsEndpoint : EndpointWithoutRequest<List<ProjectDto>>
{
    private readonly IMediator _mediator;
    private readonly IUserLookupService _userLookupService;

    public ListProjectsEndpoint(
        IMediator mediator,
        IUserLookupService userLookupService)
    {
        _mediator = mediator;
        _userLookupService = userLookupService;
    }

    public override void Configure()
    {
        Get("/api/projects");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var tenantId = User.GetTenantId();
        var query = new ListProjectsQuery(tenantId);
        var result = await _mediator.Send(query, ct);

        if (!result.IsSuccess)
        {
            await SendNotFoundAsync(ct);
            return;
        }

        // User enrichment at Web layer
        var projects = result.Value;
        await EnrichWithUserData(projects);

        await SendOkAsync(projects, ct);
    }

    private async Task EnrichWithUserData(List<ProjectDto> projects)
    {
        var userIds = projects
            .SelectMany(p => new[] { p.CreatedById, p.AssignedToId })
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();

        if (!userIds.Any()) return;

        var users = await _userLookupService.GetUsersByIdsAsync(userIds);
        var userDict = users.ToDictionary(u => u.UserId);

        foreach (var project in projects)
        {
            project.CreatedBy = userDict.GetValueOrDefault(project.CreatedById);
            project.AssignedTo = project.AssignedToId.HasValue
                ? userDict.GetValueOrDefault(project.AssignedToId.Value)
                : null;
        }
    }
}
```

**Extension Methods for User Claims:**

```csharp
// APEX.Web/Extensions/ClaimsPrincipalExtensions.cs
public static class ClaimsPrincipalExtensions
{
    public static int GetTenantId(this ClaimsPrincipal user)
    {
        return int.Parse(user.FindFirst("TenantId")?.Value ?? "0");
    }

    public static int GetUserId(this ClaimsPrincipal user)
    {
        return int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    }
}
```

### 8.2 Program.cs Configuration

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// FastEndpoints
builder.Services.AddFastEndpoints();

// MediatR for CQRS
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(CreateProjectCommand).Assembly);
});

// FluentValidation
builder.Services.AddValidatorsFromAssembly(typeof(CreateProjectValidator).Assembly);

// Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));

// Application services
builder.Services.AddScoped<IUserLookupService, UserLookupService>();

// Authentication & Authorization
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "APEX API",
        Version = "v1",
        Description = "Multi-Tenant Work Management System"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// FastEndpoints
app.UseFastEndpoints(c =>
{
    c.Endpoints.RoutePrefix = "api";
});

app.Run();
```

---

## 9. Cross-Cutting Concerns

### 9.1 Logging

Structured logging with Serilog:

```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "APEX")
    .WriteTo.Console()
    .WriteTo.File("logs/apex-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();
```

### 9.2 Exception Handling

Global exception middleware:

```csharp
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = exception switch
        {
            ValidationException => (StatusCodes.Status400BadRequest, "Validation failed"),
            NotFoundException => (StatusCodes.Status404NotFound, "Resource not found"),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            _ => (StatusCodes.Status500InternalServerError, "Internal server error")
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = response.Item1;

        return context.Response.WriteAsJsonAsync(new
        {
            error = response.Item2,
            detail = exception.Message
        });
    }
}
```

### 9.3 Validation Pipeline

MediatR behavior for automatic validation:

```csharp
public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
            return await next();

        var context = new ValidationContext<TRequest>(request);
        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Any())
            throw new ValidationException(failures);

        return await next();
    }
}
```

---

## 10. Technology Stack

| Component | Technology | Version | Justification |
| --- | --- | --- | --- |
| **Backend Framework** | ASP.NET Core | 9.0+ | Modern, cross-platform, excellent DDD support |
| **API Framework** | FastEndpoints | 5+ | High-performance, clean endpoints, better than controllers |
| **Frontend Framework** | React | 19+ | Component-based, excellent ecosystem |
| **UI Library** | Material UI | v7 | Professional components, accessibility |
| **Language (Backend)** | C# | 13 | Strong typing, modern features, records |
| **Language (Frontend)** | TypeScript | 5+ | Type safety for JavaScript |
| **ORM** | Entity Framework Core | 9.0+ | Rich mapping, migrations, specifications |
| **Database** | SQL Server | 2022+ | ACID compliance, strong tooling |
| **Mediator** | MediatR | 12+ | CQRS implementation, clean handlers |
| **Validation** | FluentValidation | 11+ | Expressive, testable validation |
| **Specification** | Ardalis.Specification | 8+ | Reusable query patterns |
| **API Documentation** | Swagger/OpenAPI | 3.0 | Interactive API documentation (via FastEndpoints) |
| **Logging** | Serilog | 4+ | Structured logging, multiple sinks |
| **Testing** | xUnit, FluentAssertions | Latest | Comprehensive testing |
| **Charts** | Recharts | 2+ | React-native charts, composable |
| **HTTP Client** | Axios | 1+ | Promise-based, interceptors |
| **State Management** | React Query | 5+ | Server state, caching, sync |

---

## 11. Multi-Tenancy Implementation

### 11.1 Tenant Isolation Strategy

APEX implements **data-level multi-tenancy** with:
- Single database, multi-schema approach
- TenantId on all domain entities
- Global query filters for automatic filtering
- Tenant context from JWT claims

### 11.2 Tenant Context

```csharp
public interface ITenantContext
{
    int TenantId { get; }
    string TenantName { get; }
}

public class TenantContext : ITenantContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public int TenantId => int.Parse(
        _httpContextAccessor.HttpContext?.User
            .FindFirst("TenantId")?.Value ?? "0");

    public string TenantName =>
        _httpContextAccessor.HttpContext?.User
            .FindFirst("TenantName")?.Value ?? "Unknown";
}
```

### 11.3 Query Filters

Automatic tenant filtering in DbContext:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // Apply to all ITenantEntity implementations
    foreach (var entityType in modelBuilder.Model.GetEntityTypes())
    {
        if (typeof(ITenantEntity).IsAssignableFrom(entityType.ClrType))
        {
            var parameter = Expression.Parameter(entityType.ClrType, "e");
            var property = Expression.Property(parameter, nameof(ITenantEntity.TenantId));
            var tenantId = Expression.Constant(_tenantContext.TenantId);
            var filter = Expression.Lambda(Expression.Equal(property, tenantId), parameter);

            modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filter);
        }
    }
}
```

---

## 12. Security Architecture

### 12.1 Authentication

JWT-based authentication with claims:

```json
{
  "sub": "12345",
  "email": "user@example.com",
  "name": "John Doe",
  "TenantId": "1",
  "TenantName": "Acme Corp",
  "role": "ProjectManager",
  "exp": 1234567890
}
```

### 12.2 Authorization

Role-based access control:

```csharp
public static class Roles
{
    public const string Administrator = "Administrator";
    public const string CMBMember = "CMBMember";
    public const string ProjectManager = "ProjectManager";
    public const string Developer = "Developer";
    public const string Viewer = "Viewer";
}

[Authorize(Roles = Roles.CMBMember)]
[HttpPost("{id}/approve")]
public async Task<ActionResult> ApproveProject(int id)
{
    // Only CMB members can approve
}
```

### 12.3 Data Protection

- All passwords hashed using BCrypt
- Sensitive data encrypted at rest
- TLS 1.3 for data in transit
- SQL injection prevention through parameterized queries
- XSS protection through React’s automatic escaping

---

## 13. API Design

### 13.1 RESTful Endpoints

**Projects:**

```
GET    /api/projects              - List all projects (tenant-filtered)
GET    /api/projects/{id}         - Get project by ID
POST   /api/projects              - Create new project
PUT    /api/projects/{id}         - Update project
DELETE /api/projects/{id}         - Delete project
POST   /api/projects/{id}/approve - Approve project (CMB only)
POST   /api/projects/{id}/reject  - Reject project (CMB only)
```

**Tasks:**

```
GET    /api/tasks                 - List all tasks
GET    /api/tasks/{id}            - Get task by ID
POST   /api/tasks                 - Create new task
PUT    /api/tasks/{id}            - Update task
PATCH  /api/tasks/{id}/assign     - Assign task
PATCH  /api/tasks/{id}/complete   - Complete task
```

**Dashboard:**

```
GET    /api/dashboard/metrics     - Get dashboard metrics
GET    /api/dashboard/projects/by-status - Projects grouped by status
GET    /api/dashboard/tasks/by-priority  - Tasks grouped by priority
```

### 13.2 Request/Response Examples

**Create Project:**

Request:

```json
POST /api/projects
{
  "name": "Website Redesign",
  "description": "Modernize company website with new branding",
  "priority": "High"
}
```

Response:

```json
201 Created
Location: /api/projects/123

{
  "id": 123,
  "projectNumber": "PRJ-2026-001",
  "name": "Website Redesign",
  "status": "Pending",
  "createdDate": "2026-01-19T10:30:00Z",
  "createdBy": {
    "userId": 456,
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

---

## 14. Frontend Architecture

### 14.1 Technology Stack

- **React 19+**: Latest React features including Server Components
- **TypeScript 5+**: Type safety throughout
- **Material UI v7**: Modern, accessible components
- **Recharts**: Composable charting library
- **React Query**: Server state management
- **Axios**: HTTP client with interceptors
- **React Router**: Client-side routing

### 14.2 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── DashboardMetrics.tsx
│   │   │   ├── StatusChart.tsx
│   │   │   └── TrendChart.tsx
│   │   │
│   │   ├── Projects/
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   └── ProjectCard.tsx
│   │   │
│   │   ├── Tasks/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskBoard.tsx
│   │   │   └── TaskForm.tsx
│   │   │
│   │   ├── ChangeManagement/
│   │   │   ├── ChangeRequestList.tsx
│   │   │   ├── ChangeRequestForm.tsx
│   │   │   └── ApprovalWorkflow.tsx
│   │   │
│   │   └── common/
│   │       ├── Layout.tsx
│   │       ├── Navigation.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── services/
│   │   ├── api.ts              # Axios configuration
│   │   ├── projectService.ts
│   │   ├── taskService.ts
│   │   └── authService.ts
│   │
│   ├── hooks/
│   │   ├── useProjects.ts
│   │   ├── useTasks.ts
│   │   ├── useAuth.ts
│   │   └── useDashboard.ts
│   │
│   ├── types/
│   │   ├── project.ts
│   │   ├── task.ts
│   │   └── user.ts
│   │
│   ├── utils/
│   │   ├── dateFormat.ts
│   │   └── validation.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
└── package.json
```

### 14.3 API Integration

```tsx
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

```tsx
// services/projectService.ts
import api from './api';
import { Project, CreateProjectDto } from '../types/project';

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  getById: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectDto): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  approve: async (id: number): Promise<void> => {
    await api.post(`/projects/${id}/approve`);
  },
};
```

### 14.4 React Query Integration

```tsx
// hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProject = (id: number) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectService.getById(id),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useApproveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectService.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
};
```

### 14.5 Component Example

```tsx
// components/Projects/ProjectList.tsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useProjects } from '../../hooks/useProjects';

export const ProjectList: React.FC = () => {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load projects: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>

      {projects?.map((project) => (
        <Card key={project.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{project.name}</Typography>
            <Chip
              label={project.status}
              color={getStatusColor(project.status)}
              size="small"
            />
            <Typography variant="body2" color="text.secondary" mt={1}>
              Created by: {project.createdBy?.name}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved': return 'success';
    case 'Pending': return 'warning';
    case 'Rejected': return 'error';
    default: return 'default';
  }
};
```

---

## 15. Implementation Patterns

### 15.1 Creating a New Aggregate

**Step-by-step process:**

1. **Define Entity in Core layer:**

```csharp
// APEX.Core/ChangeRequestAggregate/ChangeRequest.cs
public class ChangeRequest : EntityBase, IAggregateRoot
{
    public string Title { get; private set; }
    public string Justification { get; private set; }
    public ChangeRequestStatus Status { get; private set; }
    public int TenantId { get; private set; }
    public int ProjectId { get; private set; }

    private ChangeRequest() { } // EF

    public ChangeRequest(string title, string justification, int tenantId, int projectId)
    {
        Title = Guard.Against.NullOrEmpty(title);
        Justification = Guard.Against.NullOrEmpty(justification);
        TenantId = Guard.Against.NegativeOrZero(tenantId);
        ProjectId = Guard.Against.NegativeOrZero(projectId);
        Status = ChangeRequestStatus.Pending;

        RegisterDomainEvent(new ChangeRequestCreatedEvent(Id, projectId));
    }

    public void Approve(int approvedById)
    {
        if (Status != ChangeRequestStatus.Pending)
            throw new InvalidOperationException("Only pending requests can be approved");

        Status = ChangeRequestStatus.Approved;
        RegisterDomainEvent(new ChangeRequestApprovedEvent(Id, approvedById));
    }
}
```

1. **Create EF Configuration:**

```csharp
// APEX.Infrastructure/Data/Config/ChangeRequestConfiguration.cs
public class ChangeRequestConfiguration : IEntityTypeConfiguration<ChangeRequest>
{
    public void Configure(EntityTypeBuilder<ChangeRequest> builder)
    {
        builder.ToTable("ChangeRequests");
        builder.HasKey(cr => cr.Id);

        builder.Property(cr => cr.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(cr => cr.Status)
            .HasConversion<string>();

        builder.HasIndex(cr => cr.TenantId);
        builder.HasIndex(cr => cr.ProjectId);
    }
}
```

1. **Create Commands/Queries in UseCases:**

```csharp
// APEX.UseCases/ChangeRequests/Create/CreateChangeRequestCommand.cs
public record CreateChangeRequestCommand(
    string Title,
    string Justification,
    int ProjectId,
    int TenantId,
    int CreatedById
) : IRequest<Result<int>>;

// Handler, Validator, DTOs...
```

1. **Create Controller:**

```csharp
// APEX.Web/Controllers/ChangeRequestsController.cs
[ApiController]
[Route("api/change-requests")]
public class ChangeRequestsController : ControllerBase
{
    // CRUD endpoints
}
```

### 15.2 Adding a New Use Case

**Example: Add “Assign Project to Team Member”**

1. **Command:**

```csharp
// APEX.UseCases/Projects/Assign/AssignProjectCommand.cs
public record AssignProjectCommand(
    int ProjectId,
    int AssignedToId,
    int TenantId
) : IRequest<Result>;
```

1. **Handler:**

```csharp
// APEX.UseCases/Projects/Assign/AssignProjectHandler.cs
public class AssignProjectHandler : IRequestHandler<AssignProjectCommand, Result>
{
    private readonly IRepository<Project> _repository;

    public async Task<Result> Handle(AssignProjectCommand request, CancellationToken ct)
    {
        var project = await _repository.GetByIdAsync(request.ProjectId, ct);

        if (project == null)
            return Result.NotFound("Project not found");

        if (project.TenantId != request.TenantId)
            return Result.Forbidden();

        project.Assign(request.AssignedToId);
        await _repository.UpdateAsync(project, ct);

        return Result.Success();
    }
}
```

1. **Validator:**

```csharp
// APEX.UseCases/Projects/Assign/AssignProjectValidator.cs
public class AssignProjectValidator : AbstractValidator<AssignProjectCommand>
{
    public AssignProjectValidator()
    {
        RuleFor(x => x.ProjectId).GreaterThan(0);
        RuleFor(x => x.AssignedToId).GreaterThan(0);
    }
}
```

1. **Endpoint:**

```csharp
// APEX.Web/Controllers/ProjectsController.cs
[HttpPatch("{id}/assign")]
public async Task<ActionResult> Assign(int id, [FromBody] AssignRequest request)
{
    var command = new AssignProjectCommand(id, request.AssignedToId, GetTenantId());
    var result = await _mediator.Send(command);
    return result.IsSuccess ? NoContent() : BadRequest(result.Errors);
}
```

### 15.3 User Enrichment Pattern

**Always follow this pattern for user lookups:**

```csharp
// In Controller, NOT in Handler
private async Task EnrichWithUserData<T>(List<T> items) where T : IHasUserReferences
{
    var userIds = items
        .SelectMany(i => i.GetUserIds())
        .Distinct()
        .ToList();

    if (!userIds.Any()) return;

    var users = await _userLookupService.GetUsersByIdsAsync(userIds);
    var userDict = users.ToDictionary(u => u.UserId);

    foreach (var item in items)
    {
        item.EnrichWithUsers(userDict);
    }
}
```

---

## 16. Testing Strategy

### 16.1 Testing Pyramid

```
              /\
             /  \        E2E Tests (5%)
            /____\       - Full user flows
           /      \      - Selenium/Playwright
          /        \
         /__________\    Integration Tests (15%)
        /            \   - API tests
       /              \  - Database tests
      /________________\
     /                  \
    /   Unit Tests (80%) \
   /______________________\
```

### 16.2 Unit Tests

**Domain Entity Tests:**

```csharp
public class ProjectTests
{
    [Fact]
    public void Approve_WhenPending_ShouldChangeStatusToApproved()
    {
        // Arrange
        var project = CreateTestProject();
        var approvedById = 123;

        // Act
        project.Approve(approvedById);

        // Assert
        project.Status.Should().Be(ProjectStatus.Approved);
        project.ApprovedDate.Should().NotBeNull();
        project.DomainEvents.Should().ContainSingle(e => e is ProjectApprovedEvent);
    }

    [Fact]
    public void Approve_WhenAlreadyApproved_ShouldThrow()
    {
        // Arrange
        var project = CreateTestProject();
        project.Approve(123);

        // Act & Assert
        var act = () => project.Approve(456);
        act.Should().Throw<InvalidOperationException>();
    }
}
```

**Handler Tests:**

```csharp
public class CreateProjectHandlerTests
{
    private readonly Mock<IRepository<Project>> _mockRepo;
    private readonly CreateProjectHandler _handler;

    public CreateProjectHandlerTests()
    {
        _mockRepo = new Mock<IRepository<Project>>();
        _handler = new CreateProjectHandler(_mockRepo.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldCreateProject()
    {
        // Arrange
        var command = new CreateProjectCommand("Test", "Description", 1, 100);
        var createdProject = new Project("Test", "Description", 1, 100);
        _mockRepo.Setup(r => r.AddAsync(It.IsAny<Project>(), default))
            .ReturnsAsync(createdProject);

        // Act
        var result = await _handler.Handle(command, default);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _mockRepo.Verify(r => r.AddAsync(It.IsAny<Project>(), default), Times.Once);
    }
}
```

### 16.3 Integration Tests

```csharp
public class ProjectsControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ProjectsControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
        // Add auth token
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", GetTestToken());
    }

    [Fact]
    public async Task Create_ValidProject_ReturnsCreated()
    {
        // Arrange
        var request = new { name = "Test Project", description = "Test" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/projects", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var project = await response.Content.ReadFromJsonAsync<ProjectDto>();
        project.Should().NotBeNull();
        project!.Name.Should().Be("Test Project");
    }
}
```

### 16.4 Architecture Tests

```csharp
public class ArchitectureTests
{
    private const string CoreNamespace = "APEX.Core";
    private const string UseCasesNamespace = "APEX.UseCases";
    private const string InfraNamespace = "APEX.Infrastructure";
    private const string WebNamespace = "APEX.Web";

    [Fact]
    public void Core_ShouldNotDependOnOtherLayers()
    {
        var result = Types.InAssembly(typeof(Project).Assembly)
            .ShouldNot()
            .HaveDependencyOnAll(UseCasesNamespace, InfraNamespace, WebNamespace)
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void UseCases_ShouldOnlyDependOnCore()
    {
        var result = Types.InAssembly(typeof(CreateProjectCommand).Assembly)
            .ShouldNot()
            .HaveDependencyOnAll(InfraNamespace, WebNamespace)
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Specifications_ShouldBeInUseCasesLayer()
    {
        var specs = Types.InAssembly(typeof(CreateProjectCommand).Assembly)
            .That()
            .Inherit(typeof(Specification<>))
            .GetTypes();

        specs.Should().NotBeEmpty();
        specs.Should().AllSatisfy(s => s.Namespace.Should().StartWith(UseCasesNamespace));
    }
}
```

---

## 17. Deployment Architecture

### 17.1 Environment Strategy

```
Development → Staging → Production

Development:
- Local SQL Server
- No caching
- Detailed logging
- Swagger enabled

Staging:
- Azure SQL Database
- Redis cache
- Moderate logging
- Swagger enabled

Production:
- Azure SQL Database (HA)
- Redis cache cluster
- Error logging only
- Swagger disabled
```

### 17.2 Infrastructure as Code

**Azure Resources:**
- App Service (Web API)
- Azure SQL Database
- Azure Cache for Redis
- Application Insights
- Azure Key Vault (secrets)
- Azure Storage (file uploads)

### 17.3 CI/CD Pipeline

```yaml
# GitHub Actions example
name: APEX CI/CD

on:
push:
branches:[main, develop]
pull_request:
branches:[main]

jobs:
build-and-test:
runs-on: ubuntu-latest

steps:
-uses: actions/checkout@v3

-name: Setup .NET
uses: actions/setup-dotnet@v3
with:
dotnet-version:'9.0.x'

-name: Restore dependencies
run: dotnet restore

-name: Build
run: dotnet build --no-restore

-name: Test
run: dotnet test --no-build --verbosity normal

-name: Publish
run: dotnet publish -c Release -o ./publish

-name: Deploy to Azure
if: github.ref == 'refs/heads/main'
uses: azure/webapps-deploy@v2
with:
app-name: apex-api-prod
package: ./publish
```

---

## Appendices

### Appendix A: Current Implementation Status

| Feature | Status | Notes |
| --- | --- | --- |
| Project Management | ✅ Complete | CRUD, Approval workflow |
| Task Management | ✅ Complete | CRUD, Assignment, Status |
| User Lookup | ✅ Complete | Batch enrichment at Web layer |
| Dashboard APIs | ✅ Complete | Metrics, status counts |
| Multi-Tenancy | ✅ Complete | Query filters, tenant isolation |
| Authentication | ✅ Complete | JWT-based |
| React Frontend | 🔄 In Progress | Dashboard integration ongoing |
| Change Management | 🔄 In Progress | UI components done, integration pending |
| Deployment Workflows | ⏳ Planned | Not yet started |
| Advanced Reporting | ⏳ Planned | Not yet started |

### Appendix B: Key Architectural Decisions

| Decision | Rationale |
| --- | --- |
| **Specifications in UseCases** | Follows Ardalis pattern, keeps query logic with use cases |
| **User Enrichment at Web Layer** | Maintains architectural boundaries, prevents Core/UseCases from knowing about user lookup |
| **DTOs in Shared Folders** | Consistency across project, easier to locate |
| **Positional Record Constructors** | Modern C# idioms, immutability |
| **MediatR for CQRS** | Clear separation, pipeline behaviors for cross-cutting concerns |

### Appendix C: Future Enhancements

- **Advanced Search**: Full-text search with Elasticsearch
- **Real-time Updates**: SignalR for live notifications
- **File Attachments**: Azure Blob Storage integration
- **Audit Trail**: Comprehensive change tracking
- **Reporting**: Custom report builder
- **Mobile App**: Native iOS/Android apps
- **Email Integration**: Send/receive via email

---

**Document Version:** 3.0

**Last Updated:** January 19, 2026

**Next Review:** March 2026

**END OF DOCUMENT**