using FastEndpoints;
using MediatR;
using Microsoft.AspNetCore.Http;
using Apex.API.UseCases.DeploymentRequests.Reject;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.DeploymentRequests;

public class RejectDeploymentRequestRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class RejectDeploymentRequestEndpoint : Endpoint<RejectDeploymentRequestRequest>
{
    private readonly IMediator _mediator;

    public RejectDeploymentRequestEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/deployment-requests/{id}/reject");
        Roles("Manager", "TenantAdmin");
        Summary(s =>
        {
            s.Summary = "Reject a deployment request";
            s.Description = "Transitions status from PendingApproval to Rejected";
            s.Response(200, "Rejected successfully");
            s.Response(400, "Cannot reject in current status");
            s.Response(404, "Not found");
            s.Response(403, "Forbidden");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(RejectDeploymentRequestRequest req, CancellationToken ct)
    {
        var id = Route<Guid>("id");
        var command = new RejectDeploymentRequestCommand(DeploymentRequestId.From(id), req.Reason);

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await HttpContext.Response.WriteAsJsonAsync(new { Message = "Deployment request rejected." }, ct);
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
