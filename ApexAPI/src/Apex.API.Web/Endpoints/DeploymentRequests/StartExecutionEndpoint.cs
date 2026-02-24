using FastEndpoints;
using MediatR;
using Microsoft.AspNetCore.Http;
using Apex.API.UseCases.DeploymentRequests.StartExecution;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.DeploymentRequests;

public class StartExecutionEndpoint : EndpointWithoutRequest
{
    private readonly IMediator _mediator;

    public StartExecutionEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/deployment-requests/{id}/start");
        Roles("Manager", "TenantAdmin");
        Summary(s =>
        {
            s.Summary = "Start deployment execution";
            s.Description = "Transitions status from Scheduled to InProgress";
            s.Response(200, "Execution started");
            s.Response(400, "Cannot start in current status");
            s.Response(404, "Not found");
            s.Response(403, "Forbidden");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var id = Route<Guid>("id");
        var command = new StartExecutionCommand(DeploymentRequestId.From(id));

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await HttpContext.Response.WriteAsJsonAsync(new { Message = "Deployment execution started." }, ct);
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
