using FastEndpoints;
using MediatR;
using Apex.API.Core.ValueObjects;
using Apex.API.UseCases.Common.Interfaces;
using Apex.API.UseCases.Projects.Reports;
using Apex.API.UseCases.Projects.Reports.GetProjectMetrics;

namespace Apex.API.Web.Endpoints.Projects.Reports;

public class GetProjectMetricsEndpoint : Endpoint<GetProjectMetricsRequest, ProjectMetricsResponse>
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public GetProjectMetricsEndpoint(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    public override void Configure()
    {
        Get("/reports/project-metrics");
        Roles("TenantAdmin", "Manager", "Project Manager");

        Description(b => b
            .WithTags("Reports")
            .WithSummary("Get project analytics metrics")
            .WithDescription("Returns project status breakdown, completion rates, duration metrics, and priority distribution."));
    }

    public override async Task HandleAsync(GetProjectMetricsRequest req, CancellationToken ct)
    {
        var query = new GetProjectMetricsQuery(
            TenantId.From(_currentUserService.TenantId),
            req.StartDate,
            req.EndDate);

        var result = await _mediator.Send(query, ct);
        await HttpContext.Response.WriteAsJsonAsync(result, ct);
    }
}

public class GetProjectMetricsRequest
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}