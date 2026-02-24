using FastEndpoints;
using MediatR;
using Microsoft.AspNetCore.Http;
using Apex.API.UseCases.DeploymentRequests.GetById;
using Apex.API.UseCases.Users.Interfaces;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.DeploymentRequests;

public class GetDeploymentRequestEndpoint : EndpointWithoutRequest
{
    private readonly IMediator _mediator;
    private readonly IUserLookupService _userLookupService;

    public GetDeploymentRequestEndpoint(IMediator mediator, IUserLookupService userLookupService)
    {
        _mediator = mediator;
        _userLookupService = userLookupService;
    }

    public override void Configure()
    {
        Get("/deployment-requests/{id}");
        Roles("User", "Manager", "TenantAdmin", "ReadOnly");
        Summary(s =>
        {
            s.Summary = "Get a deployment request by ID";
            s.Response(200, "Deployment request details");
            s.Response(404, "Not found");
            s.Response(403, "Forbidden");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var id = Route<Guid>("id");
        var query = new GetDeploymentRequestByIdQuery(DeploymentRequestId.From(id));

        var result = await _mediator.Send(query, ct);

        if (!result.IsSuccess)
        {
            HttpContext.Response.StatusCode = result.Status switch
            {
                Ardalis.Result.ResultStatus.NotFound => StatusCodes.Status404NotFound,
                Ardalis.Result.ResultStatus.Forbidden => StatusCodes.Status403Forbidden,
                _ => StatusCodes.Status400BadRequest
            };
            await HttpContext.Response.WriteAsJsonAsync(new { Errors = result.Errors }, ct);
            return;
        }

        var dto = result.Value;

        // Batch lookup user names at the web layer
        var userIds = new List<Guid> { dto.CreatedByUserId };
        if (dto.ApprovedByUserId.HasValue) userIds.Add(dto.ApprovedByUserId.Value);

        var userLookup = await _userLookupService.GetUserSummariesByIdsAsync(userIds, ct);

        var enrichedDto = dto with
        {
            CreatedByUserName = userLookup.TryGetValue(dto.CreatedByUserId, out var creator) ? creator.FullName : null,
            ApprovedByUserName = dto.ApprovedByUserId.HasValue && userLookup.TryGetValue(dto.ApprovedByUserId.Value, out var approver)
                ? approver.FullName
                : null
        };

        await HttpContext.Response.WriteAsJsonAsync(enrichedDto, ct);
    }
}
