using FastEndpoints;
using MediatR;
using Microsoft.AspNetCore.Http;
using Apex.API.UseCases.DeploymentRequests.Complete;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.DeploymentRequests;

public class CompleteDeploymentRequestRequest
{
    public string? DeploymentNotes { get; set; }
}

public class CompleteDeploymentRequestEndpoint : Endpoint<CompleteDeploymentRequestRequest>
{
    private readonly IMediator _mediator;

    public CompleteDeploymentRequestEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/deployment-requests/{id}/complete");
        Roles("Manager", "TenantAdmin");
        Summary(s =>
        {
            s.Summary = "Complete a deployment request";
            s.Description = "Transitions status from InProgress to Deployed";
            s.Response(200, "Deployment completed successfully");
            s.Response(400, "Cannot complete in current status");
            s.Response(404, "Not found");
            s.Response(403, "Forbidden");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(CompleteDeploymentRequestRequest req, CancellationToken ct)
    {
        var id = Route<Guid>("id");
        var command = new CompleteDeploymentRequestCommand(DeploymentRequestId.From(id), req.DeploymentNotes);

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await HttpContext.Response.WriteAsJsonAsync(new { Message = "Deployment request completed successfully." }, ct);
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
