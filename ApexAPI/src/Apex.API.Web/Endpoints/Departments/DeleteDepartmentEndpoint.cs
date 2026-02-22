using FastEndpoints;
using MediatR;
using Apex.API.UseCases.Departments.Delete;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.Departments;

public class DeleteDepartmentEndpoint : EndpointWithoutRequest
{
    private readonly IMediator _mediator;

    public DeleteDepartmentEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Delete("/departments/{id}");
        Roles("TenantAdmin", "Administrator");
        Summary(s =>
        {
            s.Summary = "Delete (deactivate) a department";
            s.Description = "Deactivates a department. Fails if the department has active members.";
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var id = Route<Guid>("id");

        var command = new DeleteDepartmentCommand(DepartmentId.From(id));

        var result = await _mediator.Send(command, ct);

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