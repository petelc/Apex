using FastEndpoints;
using MediatR;
using Microsoft.AspNetCore.Http;
using Apex.API.UseCases.DeploymentRequests.Approve;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.DeploymentRequests;

public class ApproveDeploymentRequestRequest
{
    public string? Notes { get; set; }
}

public class ApproveDeploymentRequestEndpoint : Endpoint<ApproveDeploymentRequestRequest>
{
    private readonly IMediator _mediator;

    public ApproveDeploymentRequestEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/deployment-requests/{id}/approve");
        Roles("Manager", "TenantAdmin");
        Summary(s =>
        {
            s.Summary = "Approve a deployment request";
            s.Description = "Transitions status from PendingApproval to Approved";
            s.Response(200, "Approved successfully");
            s.Response(400, "Cannot approve in current status");
            s.Response(404, "Not found");
            s.Response(403, "Forbidden");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(ApproveDeploymentRequestRequest req, CancellationToken ct)
    {
        var id = Route<Guid>("id");
        var command = new ApproveDeploymentRequestCommand(DeploymentRequestId.From(id), req.Notes);

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await HttpContext.Response.WriteAsJsonAsync(new { Message = "Deployment request approved." }, ct);
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
