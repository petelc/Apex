using FastEndpoints;
using MediatR;
using Apex.API.Core.ValueObjects;
using Apex.API.UseCases.Common.Interfaces;
using Apex.API.UseCases.Tasks.Reports;
using Apex.API.UseCases.Tasks.Reports.GetTaskMetrics;

namespace Apex.API.Web.Endpoints.Tasks.Reports;

public class GetTaskMetricsEndpoint : Endpoint<GetTaskMetricsRequest, TaskMetricsResponse>
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public GetTaskMetricsEndpoint(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    public override void Configure()
    {
        Get("/reports/task-metrics");
        Roles("TenantAdmin", "Manager", "Project Manager");

        Description(b => b
            .WithTags("Reports")
            .WithSummary("Get task analytics metrics")
            .WithDescription("Returns task status breakdown, completion rates, time tracking variance, and assignment distribution."));
    }

    public override async Task HandleAsync(GetTaskMetricsRequest req, CancellationToken ct)
    {
        var query = new GetTaskMetricsQuery(
            TenantId.From(_currentUserService.TenantId),
            req.StartDate,
            req.EndDate);

        var result = await _mediator.Send(query, ct);
        await HttpContext.Response.WriteAsJsonAsync(result, ct);
    }
}

public class GetTaskMetricsRequest
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}