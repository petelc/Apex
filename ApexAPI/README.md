# APEX Multi-Tenant SaaS Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/your-org/apex)
[![Test Coverage](https://img.shields.io/badge/coverage-0%25-red.svg)](https://github.com/your-org/apex)
[![.NET Version](https://img.shields.io/badge/.NET-10.0-512BD4.svg)](https://dotnet.microsoft.com/download)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> A production-ready, enterprise-grade multi-tenant SaaS platform built with Clean Architecture, Domain-Driven Design, and modern .NET practices.

---

## Executive Summary

APEX API is a .NET 10 backend designed for multi-tenant SaaS workloads with schema-level tenant isolation, FastEndpoints-based HTTP delivery, and clear separation across Core, UseCases, Infrastructure, and Web layers. The repository includes local Docker-based development support, test projects for multiple test scopes, and a practical monorepo workflow that integrates directly with the React frontend.

## Audience and Scope

- **Audience:** Backend developers, platform engineers, and contributors implementing API, domain, and infrastructure features.
- **Scope:** API architecture, local development setup, tenant behavior, operational configuration, and backend testing workflows.
- **Use this README when:** You are building, running, testing, or troubleshooting the backend service.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Monorepo Onboarding (Recommended)](#monorepo-onboarding-recommended)
- [Testing](#testing)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Development](#development)
- [Docker](#docker)
- [Security](#security)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

## Features

### Core Capabilities

- ✅ **Multi-Tenant Architecture** - Schema-per-tenant isolation for complete data separation
- ✅ **Clean Architecture** - Proper layering with dependency inversion
- ✅ **Domain-Driven Design** - Rich domain models with business logic encapsulation
- ✅ **CQRS Pattern** - Separated command and query responsibilities
- ✅ **FastEndpoints** - High-performance, organized API endpoints
- ✅ **Automated Provisioning** - Automatic tenant schema creation and configuration

### Multi-Tenancy

- 🔐 **Data Isolation** - Each tenant gets their own database schema
- 🌐 **Subdomain Routing** - Automatic tenant resolution from subdomain (e.g., `demo.apex.cloud`)
- 📊 **Subscription Tiers** - Trial, Starter, Professional, Enterprise
- 🚀 **Self-Service Signup** - Tenants can sign up and provision automatically
- ⚡ **Intelligent Caching** - 10-minute cache for tenant metadata
- 🔄 **Deployment Modes** - SaaS (multi-tenant) or Self-Hosted (single-tenant)

### Technical Excellence

- 🏗️ **Repository Pattern** - Clean data access abstraction
- 🎯 **Value Objects** - Strongly-typed domain primitives
- 📢 **Domain Events** - Event-driven architecture support
- 🔍 **Swagger/OpenAPI** - Auto-generated API documentation
- 🐳 **Docker Support** - Containerized SQL Server for development
- 📝 **Comprehensive Logging** - Structured logging with Serilog

---

## Project Structure

```
Apex.API/
├── src/
│   ├── Apex.API.Core/              # Domain Layer (no dependencies)
│   │   ├── Aggregates/             # DDD Aggregates (Tenant, Request, etc.)
│   │   ├── ValueObjects/           # Value Objects (TenantId, SubscriptionTier)
│   │   ├── Events/                 # Domain Events
│   │   └── Interfaces/             # Domain interfaces (ITenantContext)
│   │
│   ├── Apex.API.Infrastructure/    # Infrastructure Layer
│   │   ├── Data/                   # EF Core DbContext & Repositories
│   │   ├── Identity/               # Tenant resolution & context
│   │   ├── Services/               # Infrastructure services
│   │   └── Configurations/         # EF Core entity configurations
│   │
│   ├── Apex.API.UseCases/          # Application Layer (CQRS)
│   │   ├── Tenants/                # Tenant use cases
│   │   │   ├── Create/            # CreateTenantCommand & Handler
│   │   │   ├── Update/            # UpdateTenantCommand & Handler
│   │   │   └── Queries/           # Tenant queries
│   │   └── Common/                # Shared use case interfaces
│   │
│   ├── Apex.API.Web/               # Presentation Layer (API)
│   │   ├── Endpoints/             # FastEndpoints
│   │   │   └── Tenants/          # Tenant endpoints
│   │   ├── Configurations/        # App configuration
│   │   └── Program.cs            # Application entry point
│   │
│   └── Apex.API.ServiceDefaults/   # Shared configuration
│
├── tests/
│   ├── Apex.API.UnitTests/         # Unit tests
│   └── Apex.API.IntegrationTests/  # Integration tests
│
├── docker/
│   ├── docker-compose.yml          # Development database
│   └── sql-init/                   # Database initialization scripts
│       └── 001_InitialSetup.sql
│
└── docs/
    ├── architecture/               # Architecture documentation
    ├── api/                       # API documentation
    └── development/               # Development guides
```

---

## Quick Start

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/)
- IDE: [Visual Studio 2024](https://visualstudio.microsoft.com/), [Rider](https://www.jetbrains.com/rider/), or [VS Code](https://code.visualstudio.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/apex.git
   cd apex
   ```

2. **Set up environment variables**

   ```bash
   # Copy example environment file
   cp .env.example .env

   # Edit .env and set your values
   nano .env
   ```

3. **Start the database**

   ```bash
   docker-compose up -d
   ```

4. **Initialize the database**

   ```bash
   # Run the initialization script
   ./scripts/init-database.sh
   ```

5. **Configure local DNS (for subdomain testing)**

   ```bash
   sudo nano /etc/hosts
   # Add these lines:
   127.0.0.1 demo.localhost test.localhost acmecorp.localhost
   ```

6. **Run the API**

   ```bash
   dotnet run --project src/Apex.API.Web --urls "https://localhost:5000"
   ```

7. **Verify it's working**

   ```bash
   curl -k https://demo.localhost:5000/api/tenants/current
   ```

8. **Open Swagger UI**

   Navigate to: https://localhost:5000/swagger

---

## Monorepo Onboarding (Recommended)

If you're running this backend with the React frontend in this repository:

1. Start infrastructure/services first (if required), such as Docker SQL Server.
2. Start the API from `ApexAPI`.
3. Start the frontend from `../ApexApp` with `npm run dev`.
4. Verify connectivity from the UI and confirm authenticated API calls succeed.

Frontend API target examples (`ApexApp/.env`):

```bash
VITE_API_URL=https://acme.localhost:5000/api
VITE_API_URL=https://localhost:5000/api
```

For the shared startup checklist, troubleshooting, and smoke tests, see the root monorepo guide: `../README.md`.

---

## Testing

### Run All Tests

```bash
dotnet test
```

### Run Specific Test Project

```bash
dotnet test tests/Apex.API.UnitTests
dotnet test tests/Apex.API.IntegrationTests
```

### Test with Coverage

```bash
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

### Manual API Testing

#### Get Current Tenant

```bash
curl -k https://demo.localhost:5000/api/tenants/current
```

**Expected Response:**

```json
{
  "tenantId": "3cce6e0a-7628-426f-a31d-aa2c02f46821",
  "companyName": "Demo Company",
  "subdomain": "demo",
  "schemaName": "tenant_demo",
  "subscriptionTier": "Professional",
  "status": "Active",
  "isActive": true,
  "deploymentMode": "SaaS",
  "isMultiTenant": true
}
```

#### Create New Tenant

```bash
curl -k -X POST https://localhost:5000/api/tenants/signup \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "New Startup Inc",
    "subdomain": "newstartup",
    "adminEmail": "ceo@newstartup.com",
    "adminFirstName": "Jane",
    "adminLastName": "Doe"
  }'
```

#### Get Tenant by ID

```bash
curl -k https://localhost:5000/api/tenants/{tenant-id}
```

---

## Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────────┐
│            Web (Presentation)               │
│  FastEndpoints, DTOs, HTTP Concerns         │
└──────────────────┬──────────────────────────┘
                   │ depends on
┌──────────────────▼──────────────────────────┐
│         UseCases (Application)              │
│  Commands, Handlers, CQRS, Orchestration    │
└──────────────────┬──────────────────────────┘
                   │ depends on
       ┌───────────▼───────────┐
       │   Core (Domain)       │
       │  Aggregates, VOs,     │
       │  Domain Events        │
       └───────────┬───────────┘
                   │ implements
┌──────────────────▼──────────────────────────┐
│           Infrastructure                     │
│  DbContext, Repositories, External Services  │
└─────────────────────────────────────────────┘
```

### Multi-Tenancy Flow

```
1. HTTP Request arrives at Web layer
   └─> https://demo.apex.cloud/api/requests

2. TenantContext extracts subdomain ("demo")
   └─> Checks cache for tenant data
   └─> If not cached, queries shared.Tenants table
   └─> Returns Tenant object with schema name

3. Repository queries use tenant's schema
   └─> SELECT * FROM [tenant_demo].Requests

4. Complete data isolation per tenant
```

### Dependency Flow

```
Core ← Infrastructure ← UseCases ← Web

✓ Core has ZERO dependencies
✓ Infrastructure depends on Core only
✓ UseCases depends on Core only
✓ Web orchestrates everything
```

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

| Variable                               | Description                | Required  |
| -------------------------------------- | -------------------------- | --------- |
| `ASPNETCORE_ENVIRONMENT`               | Environment name           | Yes       |
| `ConnectionStrings__DefaultConnection` | Database connection string | Yes       |
| `Deployment__Mode`                     | SaaS or SelfHosted         | Yes       |
| `Deployment__BaseDomain`               | Base domain for subdomains | Yes       |
| `SQLSERVER_SA_PASSWORD`                | SQL Server SA password     | Yes (dev) |

### appsettings.json

The `appsettings.json` files are tracked in git with placeholder values.
**Never commit real secrets!** Use environment variables or Azure Key Vault for production.

See `appsettings.Development.json.example` for the template.

---

## API Documentation

### Tenant Endpoints

| Method   | Endpoint               | Description                       | Auth    |
| -------- | ---------------------- | --------------------------------- | ------- |
| `GET`    | `/api/tenants/current` | Get current tenant from subdomain | ❌      |
| `GET`    | `/api/tenants/{id}`    | Get tenant by ID                  | ❌      |
| `POST`   | `/api/tenants/signup`  | Create new tenant (signup)        | ❌      |
| `PUT`    | `/api/tenants/{id}`    | Update tenant                     | 🔒 Soon |
| `DELETE` | `/api/tenants/{id}`    | Delete tenant                     | 🔒 Soon |

### Request Endpoints (Coming Soon)

| Method   | Endpoint             | Description        | Auth |
| -------- | -------------------- | ------------------ | ---- |
| `GET`    | `/api/requests`      | List all requests  | 🔒   |
| `GET`    | `/api/requests/{id}` | Get request by ID  | 🔒   |
| `POST`   | `/api/requests`      | Create new request | 🔒   |
| `PUT`    | `/api/requests/{id}` | Update request     | 🔒   |
| `DELETE` | `/api/requests/{id}` | Delete request     | 🔒   |

Full API documentation available at `/swagger` when running the application.

---

## Database

### Schema Structure

#### Shared Schema (`shared`)

Contains tenant metadata available to all tenants:

- `shared.Tenants` - Tenant information and configuration

#### Tenant Schemas (`tenant_*`)

Each tenant gets their own schema for complete isolation:

- `tenant_demo.Requests` (future)
- `tenant_demo.Users` (future)
- `tenant_demo.Documents` (future)

### Migrations

```bash
# Create new migration
dotnet ef migrations add MigrationName --project src/Apex.API.Infrastructure --startup-project src/Apex.API.Web

# Apply migrations
dotnet ef database update --project src/Apex.API.Infrastructure --startup-project src/Apex.API.Web

# Rollback migration
dotnet ef database update PreviousMigrationName --project src/Apex.API.Infrastructure --startup-project src/Apex.API.Web
```

### Demo Data

The system comes with 3 pre-configured demo tenants:

| Subdomain  | Company          | Tier         | Status | Schema            |
| ---------- | ---------------- | ------------ | ------ | ----------------- |
| `demo`     | Demo Company     | Professional | Active | `tenant_demo`     |
| `test`     | Test Company     | Starter      | Active | `tenant_test`     |
| `acmecorp` | Acme Corporation | Trial        | Trial  | `tenant_acmecorp` |

---

## Development

### Building

```bash
# Build entire solution
dotnet build

# Build specific project
dotnet build src/Apex.API.Web

# Build in Release mode
dotnet build -c Release
```

### Running

```bash
# Run with hot reload
dotnet watch run --project src/Apex.API.Web

# Run on specific port
dotnet run --project src/Apex.API.Web --urls "https://localhost:5000"

# Run in production mode
dotnet run --project src/Apex.API.Web -c Release
```

### Code Quality

```bash
# Format code
dotnet format

# Analyze code
dotnet build /p:EnforceCodeStyleInBuild=true

# Security scan (requires tools)
dotnet list package --vulnerable
```

---

## Docker

### Development Database

```bash
# Start database
docker-compose up -d

# View logs
docker-compose logs -f sqlserver

# Stop database
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### SQL Server Access

See the initialization script in `scripts/init-database.sh` for database setup.

Connection details are configured via environment variables (see `.env.example`).

---

## Security

### Best Practices

- ✅ Never commit secrets to git
- ✅ Use environment variables for configuration
- ✅ Use Azure Key Vault for production secrets
- ✅ Rotate database passwords regularly
- ✅ Enable HTTPS in production
- ✅ Implement rate limiting
- ✅ Add authentication & authorization

### Secrets Management

**Development:**

- Use `.env` file (gitignored)
- Use User Secrets: `dotnet user-secrets set "Key" "Value"`

**Production:**

- Use Azure Key Vault
- Use environment variables from hosting platform
- Use managed identities when possible

---

## Roadmap

### ✅ Phase 1: Foundation (COMPLETE)

- [x] Clean Architecture setup
- [x] Multi-tenant infrastructure
- [x] Schema-per-tenant isolation
- [x] Tenant CRUD operations
- [x] Automated provisioning
- [x] FastEndpoints integration

### 🚧 Phase 2: Core Features (IN PROGRESS)

- [ ] Fix Mediator configuration
- [ ] Re-enable domain events
- [ ] FluentValidation integration
- [ ] Request aggregate implementation
- [ ] Authentication & Authorization
- [ ] Comprehensive logging

### 📋 Phase 3: Production Ready (PLANNED)

- [ ] Integration tests
- [ ] Performance optimization
- [ ] Monitoring & observability
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Kubernetes deployment

### 🔮 Phase 4: Advanced Features (FUTURE)

- [ ] Real-time notifications (SignalR)
- [ ] Background job processing
- [ ] File storage & management
- [ ] Audit logging
- [ ] Advanced analytics
- [ ] Multi-region support

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow Clean Architecture principles
- Write unit tests for business logic
- Document public APIs with XML comments
- Use meaningful commit messages
- Follow C# coding conventions

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Authors

- **Pete** - _Initial work_ - [GitHub Profile](https://github.com/yourusername)

---

## Acknowledgments

- Built with [FastEndpoints](https://fast-endpoints.com/)
- Powered by [.NET 10](https://dotnet.microsoft.com/)
- Architecture inspired by [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- DDD patterns from [Domain-Driven Design](https://www.domainlanguage.com/ddd/)
- Uses [Ardalis.Result](https://github.com/ardalis/Result) for railway-oriented programming
- Repository pattern with [Ardalis.Specification](https://github.com/ardalis/Specification)

---

## Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/your-org/apex/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/apex/discussions)

---

## Project Status

| Metric       | Status                                                                  |
| ------------ | ----------------------------------------------------------------------- |
| **Build**    | ![Passing](https://img.shields.io/badge/build-passing-brightgreen.svg)  |
| **Tests**    | ![0 tests](https://img.shields.io/badge/tests-0%20passing-yellow.svg)   |
| **Coverage** | ![0%](https://img.shields.io/badge/coverage-0%25-red.svg)               |
| **Issues**   | ![0 open](https://img.shields.io/badge/issues-0%20open-brightgreen.svg) |
| **PRs**      | ![0 open](https://img.shields.io/badge/PRs-0%20open-brightgreen.svg)    |
| **License**  | ![MIT](https://img.shields.io/badge/license-MIT-blue.svg)               |

---

## Current State

**Status:** ✅ Multi-tenant infrastructure working, ready for feature development

**Working:**

- Multi-tenant resolution via subdomain
- Schema-per-tenant isolation
- Tenant CRUD operations
- Automated provisioning
- Clean Architecture layers

**In Progress:**

- Mediator configuration fixes
- Domain event dispatching
- Request aggregate
- Authentication

**Next Steps:**

1. Fix temporary workarounds (see [Architecture Guide](docs/APEX-Architecture-Guide.md))
2. Build Request aggregate
3. Add authentication & authorization
4. Implement comprehensive testing

---

<div align="center">

**Built with ❤️ using Clean Architecture and Domain-Driven Design**

[Documentation](docs/) • [API Reference](https://localhost:5000/swagger) • [Contributing](CONTRIBUTING.md) • [License](LICENSE)

</div>
