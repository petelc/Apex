using FastEndpoints;
using MediatR;
using Microsoft.AspNetCore.Http;
using Apex.API.UseCases.DeploymentRequests.Schedule;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.DeploymentRequests;

public class ScheduleDeploymentRequestRequest
{
    public DateTime ScheduledStartDate { get; set; }
    public DateTime ScheduledEndDate { get; set; }
    public string? DeploymentWindow { get; set; }
}

public class ScheduleDeploymentRequestEndpoint : Endpoint<ScheduleDeploymentRequestRequest>
{
    private readonly IMediator _mediator;

    public ScheduleDeploymentRequestEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/deployment-requests/{id}/schedule");
        Roles("Manager", "TenantAdmin");
        Summary(s =>
        {
            s.Summary = "Schedule a deployment request";
            s.Description = "Transitions status from Approved to Scheduled with a deployment window";
            s.Response(200, "Scheduled successfully");
            s.Response(400, "Cannot schedule in current status or invalid dates");
            s.Response(404, "Not found");
            s.Response(403, "Forbidden");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(ScheduleDeploymentRequestRequest req, CancellationToken ct)
    {
        var id = Route<Guid>("id");
        var command = new ScheduleDeploymentRequestCommand(
            DeploymentRequestId.From(id),
            req.ScheduledStartDate,
            req.ScheduledEndDate,
            req.DeploymentWindow);

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await HttpContext.Response.WriteAsJsonAsync(new { Message = "Deployment request scheduled." }, ct);
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
