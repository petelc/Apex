using FastEndpoints;
using MediatR;
using Microsoft.AspNetCore.Http;
using Apex.API.UseCases.DeploymentRequests.List;

namespace Apex.API.Web.Endpoints.DeploymentRequests;

public class ListDeploymentRequestsRequest
{
    public string? Status { get; set; }
    public string? Environment { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class ListDeploymentRequestsEndpoint : Endpoint<ListDeploymentRequestsRequest>
{
    private readonly IMediator _mediator;

    public ListDeploymentRequestsEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Get("/deployment-requests");
        Roles("User", "Manager", "TenantAdmin", "ReadOnly");
        Summary(s =>
        {
            s.Summary = "List deployment requests";
            s.Description = "Returns a paginated list of deployment requests for the current tenant";
            s.Response(200, "List of deployment requests");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(ListDeploymentRequestsRequest req, CancellationToken ct)
    {
        var query = new ListDeploymentRequestsQuery(
            req.Status,
            req.Environment,
            PageNumber: req.Page,
            PageSize: req.PageSize);

        var result = await _mediator.Send(query, ct);

        if (result.IsSuccess)
        {
            await HttpContext.Response.WriteAsJsonAsync(result.Value, ct);
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            await HttpContext.Response.WriteAsJsonAsync(new { Errors = result.Errors }, ct);
        }
    }
}
