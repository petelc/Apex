using FastEndpoints;
using MediatR;
using Microsoft.AspNetCore.Http;
using Apex.API.UseCases.DeploymentRequests.List;
using Apex.API.UseCases.Users.Interfaces;

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
    private readonly IUserLookupService _userLookupService;

    public ListDeploymentRequestsEndpoint(IMediator mediator, IUserLookupService userLookupService)
    {
        _mediator = mediator;
        _userLookupService = userLookupService;
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

        if (!result.IsSuccess)
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            await HttpContext.Response.WriteAsJsonAsync(new { Errors = result.Errors }, ct);
            return;
        }

        var items = result.Value;

        if (items.Count > 0)
        {
            var userIds = items.Select(i => i.CreatedByUserId).Distinct().ToList();
            var userLookup = await _userLookupService.GetUserSummariesByIdsAsync(userIds, ct);

            items = items.Select(item => item with
            {
                CreatedByUserName = userLookup.TryGetValue(item.CreatedByUserId, out var u) ? u.FullName : null
            }).ToList();
        }

        await HttpContext.Response.WriteAsJsonAsync(items, ct);
    }
}
