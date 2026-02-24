using FastEndpoints;
using MediatR;
using Microsoft.AspNetCore.Http;
using Apex.API.UseCases.DeploymentRequests.MarkFailed;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.DeploymentRequests;

public class MarkFailedRequest
{
    public string? Reason { get; set; }
}

public class MarkFailedEndpoint : Endpoint<MarkFailedRequest>
{
    private readonly IMediator _mediator;

    public MarkFailedEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/deployment-requests/{id}/fail");
        Roles("Manager", "TenantAdmin");
        Summary(s =>
        {
            s.Summary = "Mark a deployment as failed";
            s.Description = "Transitions status from InProgress to Failed";
            s.Response(200, "Marked as failed");
            s.Response(400, "Cannot mark failed in current status");
            s.Response(404, "Not found");
            s.Response(403, "Forbidden");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(MarkFailedRequest req, CancellationToken ct)
    {
        var id = Route<Guid>("id");
        var command = new MarkFailedDeploymentRequestCommand(DeploymentRequestId.From(id), req.Reason);

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await HttpContext.Response.WriteAsJsonAsync(new { Message = "Deployment request marked as failed." }, ct);
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
