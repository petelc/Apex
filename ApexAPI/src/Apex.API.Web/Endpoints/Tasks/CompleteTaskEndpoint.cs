using FastEndpoints;
using MediatR;
using Apex.API.UseCases.Tasks.Complete;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.Tasks;

/// <summary>
/// Request DTO for completing task
/// </summary>
public class CompleteTaskRequest
{
    public string? ResolutionNotes { get; set; }
}

/// <summary>
/// Endpoint for completing a task with optional resolution notes
/// </summary>
public class CompleteTaskEndpoint : Endpoint<CompleteTaskRequest>
{
    private readonly IMediator _mediator;

    public CompleteTaskEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/tasks/{id}/complete");
        Roles("TenantAdmin", "Manager", "Project Manager", "Change Implementer", "Change Manager", "CAB Member", "CAB Manager");
        
        Description(b => b
            .WithTags("Tasks")
            .WithSummary("Complete a task")
            .WithDescription("Changes task status from InProgress to Completed with optional resolution notes"));
    }

    public override async Task HandleAsync(CompleteTaskRequest req, CancellationToken ct)
    {
        var id = Route<Guid>("id");
        var command = new CompleteTaskCommand(
            TaskId.From(id),
            req.ResolutionNotes);

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await HttpContext.Response.WriteAsJsonAsync(new { Message = "Task completed successfully." }, ct);
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
