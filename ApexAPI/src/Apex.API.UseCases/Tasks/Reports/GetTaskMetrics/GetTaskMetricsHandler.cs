using MediatR;
using Traxs.SharedKernel;
using Apex.API.Core.ValueObjects;
using WorkTask = Apex.API.Core.Aggregates.TaskAggregate.Task;
using TaskStatus = Apex.API.Core.ValueObjects.TaskStatus;

namespace Apex.API.UseCases.Tasks.Reports.GetTaskMetrics;

public record GetTaskMetricsQuery(
    TenantId TenantId,
    DateTime? StartDate = null,
    DateTime? EndDate = null) : IRequest<TaskMetricsResponse>;

public class GetTaskMetricsHandler : IRequestHandler<GetTaskMetricsQuery, TaskMetricsResponse>
{
    private readonly IReadRepository<WorkTask> _repository;

    public GetTaskMetricsHandler(IReadRepository<WorkTask> repository)
    {
        _repository = repository;
    }

    public async Task<TaskMetricsResponse> Handle(GetTaskMetricsQuery request, CancellationToken cancellationToken)
    {
        var all = await _repository.ListAsync(cancellationToken);

        var tasks = all
            .Where(t => t.TenantId == request.TenantId)
            .Where(t => !request.StartDate.HasValue || t.CreatedDate >= request.StartDate.Value)
            .Where(t => !request.EndDate.HasValue || t.CreatedDate <= request.EndDate.Value)
            .ToList();

        var total = tasks.Count;
        if (total == 0)
            return new TaskMetricsResponse();

        var notStarted = tasks.Count(t => t.Status == TaskStatus.NotStarted);
        var inProgress = tasks.Count(t => t.Status == TaskStatus.InProgress);
        var blocked    = tasks.Count(t => t.Status == TaskStatus.Blocked);
        var completed  = tasks.Count(t => t.Status == TaskStatus.Completed);
        var cancelled  = tasks.Count(t => t.Status == TaskStatus.Cancelled);
        var overdue    = tasks.Count(t => t.IsOverdue());

        // On-time = completed AND completedDate <= dueDate
        var completedTasks = tasks.Where(t => t.Status == TaskStatus.Completed).ToList();
        var onTime = completedTasks.Count(t =>
            t.CompletedDate.HasValue && t.DueDate.HasValue &&
            t.CompletedDate.Value.Date <= t.DueDate.Value.Date);

        var completionRate    = total > 0 ? Math.Round((decimal)completed / total * 100, 2) : 0;
        var blockedRate       = total > 0 ? Math.Round((decimal)blocked / total * 100, 2) : 0;
        var onTimeRate        = completedTasks.Count > 0
            ? Math.Round((decimal)onTime / completedTasks.Count * 100, 2)
            : 0;

        // Time tracking metrics
        var withEstimate = tasks.Where(t => t.EstimatedHours.HasValue && t.EstimatedHours > 0).ToList();
        var avgEstimated = withEstimate.Any()
            ? withEstimate.Average(t => (double)t.EstimatedHours!.Value)
            : 0;

        var withActual = tasks.Where(t => t.ActualHours > 0).ToList();
        var avgActual = withActual.Any()
            ? withActual.Average(t => (double)t.ActualHours)
            : 0;

        // Variance: average of (actual - estimated) for tasks that have both
        var withBoth = tasks
            .Where(t => t.EstimatedHours.HasValue && t.EstimatedHours > 0)
            .ToList();
        var avgVariance = withBoth.Any()
            ? withBoth.Average(t => (double)(t.ActualHours - t.EstimatedHours!.Value))
            : 0;

        // Assignment breakdown
        var assignedToUser       = tasks.Count(t => t.AssignedToUserId.HasValue);
        var assignedToDepartment = tasks.Count(t => t.AssignedToDepartmentId.HasValue && !t.AssignedToUserId.HasValue);
        var unassigned           = tasks.Count(t => !t.AssignedToUserId.HasValue && !t.AssignedToDepartmentId.HasValue);

        return new TaskMetricsResponse
        {
            TotalTasks          = total,
            NotStartedTasks     = notStarted,
            InProgressTasks     = inProgress,
            BlockedTasks        = blocked,
            CompletedTasks      = completed,
            CancelledTasks      = cancelled,
            OverdueTasks        = overdue,
            CompletionRate      = completionRate,
            BlockedRate         = blockedRate,
            OnTimeCompletionRate = onTimeRate,
            AverageEstimatedHours = Math.Round(avgEstimated, 1),
            AverageActualHours    = Math.Round(avgActual, 1),
            AverageHoursVariance  = Math.Round(avgVariance, 1),
            AssignedToUserTasks       = assignedToUser,
            AssignedToDepartmentTasks = assignedToDepartment,
            UnassignedTasks           = unassigned,
            ByPriority = new TasksByPriorityBreakdown
            {
                Low    = tasks.Count(t => t.Priority == RequestPriority.Low),
                Medium = tasks.Count(t => t.Priority == RequestPriority.Medium),
                High   = tasks.Count(t => t.Priority == RequestPriority.High),
                Urgent = tasks.Count(t => t.Priority == RequestPriority.Urgent),
            }
        };
    }
}