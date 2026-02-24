using FastEndpoints;
using MediatR;
using Microsoft.AspNetCore.Http;
using Apex.API.UseCases.DeploymentRequests.GetById;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.DeploymentRequests;

public class GetDeploymentRequestEndpoint : EndpointWithoutRequest
{
    private readonly IMediator _mediator;

    public GetDeploymentRequestEndpoint(IMediator mediator)
    {
        _mediator = mediator;
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

        if (result.IsSuccess)
        {
            await HttpContext.Response.WriteAsJsonAsync(result.Value, ct);
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
