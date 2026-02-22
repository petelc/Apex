using FastEndpoints;
using MediatR;
using Apex.API.UseCases.ChangeRequests.Cancel;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.ChangeRequests;

/// <summary>
/// DELETE /change-requests/{id} — cancels a change request (frontend convention)
/// Delegates to the Cancel use case (Draft/Submitted → Cancelled).
/// </summary>
public class DeleteChangeRequestEndpoint : EndpointWithoutRequest
{
    private readonly IMediator _mediator;

    public DeleteChangeRequestEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Delete("/change-requests/{id}");
        Roles("Manager", "TenantAdmin", "Change Manager", "CAB Member");
        Summary(s =>
        {
            s.Summary = "Delete (cancel) a change request";
            s.Description = "Cancels a change request. Only allowed from Draft or Submitted status.";
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var id = Route<Guid>("id");

        var result = await _mediator.Send(new CancelChangeRequestCommand(ChangeRequestId.From(id)), ct);

        if (result.IsSuccess)
        {
            HttpContext.Response.StatusCode = StatusCodes.Status204NoContent;
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