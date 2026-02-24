using FastEndpoints;
using MediatR;
using Microsoft.AspNetCore.Http;
using Apex.API.UseCases.DeploymentRequests.Rollback;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.DeploymentRequests;

public class RollbackDeploymentRequestRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class RollbackDeploymentRequestEndpoint : Endpoint<RollbackDeploymentRequestRequest>
{
    private readonly IMediator _mediator;

    public RollbackDeploymentRequestEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/deployment-requests/{id}/rollback");
        Roles("Manager", "TenantAdmin");
        Summary(s =>
        {
            s.Summary = "Rollback a failed deployment";
            s.Description = "Transitions status from Failed to RolledBack";
            s.Response(200, "Rolled back successfully");
            s.Response(400, "Cannot rollback in current status");
            s.Response(404, "Not found");
            s.Response(403, "Forbidden");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(RollbackDeploymentRequestRequest req, CancellationToken ct)
    {
        var id = Route<Guid>("id");
        var command = new RollbackDeploymentRequestCommand(DeploymentRequestId.From(id), req.Reason);

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await HttpContext.Response.WriteAsJsonAsync(new { Message = "Deployment request rolled back." }, ct);
        }
        else
        {
            HttpContext.Response.StatusCode = result.Status switch
            {
                Ardalis.Result.ResultStatus.NotFound => StatusCodes.Status404NotFound,
                Ardalis.Result.ResultStatus.Forbidden => StatusCodes.Status403Forbidden,
                _ => StatusCodes.Status400BadRequest
            };
            await HttpContext.Response.WriteAsJsonAsync(new { Errors = result.Errors }, ct);
        }
    }
}
