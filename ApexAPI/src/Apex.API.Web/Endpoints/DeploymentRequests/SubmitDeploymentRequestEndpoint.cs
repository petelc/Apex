using FastEndpoints;
using MediatR;
using Microsoft.AspNetCore.Http;
using Apex.API.UseCases.DeploymentRequests.Submit;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.DeploymentRequests;

public class SubmitDeploymentRequestEndpoint : EndpointWithoutRequest
{
    private readonly IMediator _mediator;

    public SubmitDeploymentRequestEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/deployment-requests/{id}/submit");
        Roles("User", "Manager", "TenantAdmin");
        Summary(s =>
        {
            s.Summary = "Submit a deployment request for approval";
            s.Description = "Transitions status from Draft to PendingApproval";
            s.Response(200, "Submitted successfully");
            s.Response(400, "Cannot submit in current status");
            s.Response(404, "Not found");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var id = Route<Guid>("id");
        var command = new SubmitDeploymentRequestCommand(DeploymentRequestId.From(id));

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await HttpContext.Response.WriteAsJsonAsync(new { Message = "Deployment request submitted for approval." }, ct);
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
