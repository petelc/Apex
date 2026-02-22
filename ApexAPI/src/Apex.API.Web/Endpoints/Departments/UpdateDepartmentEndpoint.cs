using FastEndpoints;
using MediatR;
using Apex.API.UseCases.Departments.Update;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.Departments;

public class UpdateDepartmentRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class UpdateDepartmentEndpoint : Endpoint<UpdateDepartmentRequest>
{
    private readonly IMediator _mediator;

    public UpdateDepartmentEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Put("/departments/{id}");
        Roles("TenantAdmin", "Administrator");
        Summary(s =>
        {
            s.Summary = "Update a department";
            s.Description = "Updates the name and description of an existing department";
        });
    }

    public override async Task HandleAsync(UpdateDepartmentRequest req, CancellationToken ct)
    {
        var id = Route<Guid>("id");

        var command = new UpdateDepartmentCommand(
            DepartmentId.From(id),
            req.Name,
            req.Description);

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