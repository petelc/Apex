using FastEndpoints;
using MediatR;
using Microsoft.AspNetCore.Http;
using Apex.API.UseCases.DeploymentRequests.Create;

namespace Apex.API.Web.Endpoints.DeploymentRequests;

public class CreateDeploymentRequestRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public string AffectedSystems { get; set; } = string.Empty;
    public string RollbackPlan { get; set; } = string.Empty;
    public Guid? ProjectId { get; set; }
    public Guid? ChangeRequestId { get; set; }
    public DateTime? ScheduledStartDate { get; set; }
    public DateTime? ScheduledEndDate { get; set; }
    public string? DeploymentWindow { get; set; }
}

public class CreateDeploymentRequestEndpoint : Endpoint<CreateDeploymentRequestRequest>
{
    private readonly IMediator _mediator;

    public CreateDeploymentRequestEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/deployment-requests");
        Roles("User", "Manager", "TenantAdmin");
        Summary(s =>
        {
            s.Summary = "Create a deployment request";
            s.Description = "Creates a new deployment request in Draft status";
            s.Response(201, "Deployment request created successfully");
            s.Response(400, "Validation errors");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(CreateDeploymentRequestRequest req, CancellationToken ct)
    {
        var command = new CreateDeploymentRequestCommand(
            req.Title,
            req.Description,
            req.Priority,
            req.RiskLevel,
            req.Environment,
            req.AffectedSystems,
            req.RollbackPlan,
            req.ProjectId,
            req.ChangeRequestId,
            req.ScheduledStartDate,
            req.ScheduledEndDate,
            req.DeploymentWindow);

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            HttpContext.Response.StatusCode = StatusCodes.Status201Created;
            HttpContext.Response.Headers.Location = $"/api/deployment-requests/{result.Value.Value}";
            await HttpContext.Response.WriteAsJsonAsync(new { id = result.Value.Value }, ct);
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            if (result.ValidationErrors.Any())
                await HttpContext.Response.WriteAsJsonAsync(new { Errors = result.ValidationErrors.Select(e => new { e.Identifier, e.ErrorMessage }) }, ct);
            else
                await HttpContext.Response.WriteAsJsonAsync(new { Errors = result.Errors }, ct);
        }
    }
}
