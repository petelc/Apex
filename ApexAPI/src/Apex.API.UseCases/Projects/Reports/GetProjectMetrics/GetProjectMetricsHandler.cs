using MediatR;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.ProjectAggregate;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UseCases.Projects.Reports.GetProjectMetrics;

public record GetProjectMetricsQuery(
    TenantId TenantId,
    DateTime? StartDate = null,
    DateTime? EndDate = null) : IRequest<ProjectMetricsResponse>;

public class GetProjectMetricsHandler : IRequestHandler<GetProjectMetricsQuery, ProjectMetricsResponse>
{
    private readonly IReadRepository<Project> _repository;

    public GetProjectMetricsHandler(IReadRepository<Project> repository)
    {
        _repository = repository;
    }

    public async Task<ProjectMetricsResponse> Handle(GetProjectMetricsQuery request, CancellationToken cancellationToken)
    {
        var all = await _repository.ListAsync(cancellationToken);

        var projects = all
            .Where(p => p.TenantId == request.TenantId)
            .Where(p => !request.StartDate.HasValue || p.CreatedDate >= request.StartDate.Value)
            .Where(p => !request.EndDate.HasValue || p.CreatedDate <= request.EndDate.Value)
            .ToList();

        var total = projects.Count;
        if (total == 0)
            return new ProjectMetricsResponse();

        var planning   = projects.Count(p => p.Status == ProjectStatus.Planning);
        var active     = projects.Count(p => p.Status == ProjectStatus.Active);
        var onHold     = projects.Count(p => p.Status == ProjectStatus.OnHold);
        var completed  = projects.Count(p => p.Status == ProjectStatus.Completed);
        var cancelled  = projects.Count(p => p.Status == ProjectStatus.Cancelled);
        var overdue    = projects.Count(p => p.IsOverdue());

        // On-time = completed AND actualEndDate <= planned endDate
        var completedProjects = projects.Where(p => p.Status == ProjectStatus.Completed).ToList();
        var onTime = completedProjects.Count(p =>
            p.ActualEndDate.HasValue && p.EndDate.HasValue &&
            p.ActualEndDate.Value.Date <= p.EndDate.Value.Date);

        var completionRate    = total > 0 ? Math.Round((decimal)completed / total * 100, 2) : 0;
        var activeRate        = total > 0 ? Math.Round((decimal)active / total * 100, 2) : 0;
        var cancellationRate  = total > 0 ? Math.Round((decimal)cancelled / total * 100, 2) : 0;
        var onTimeRate        = completedProjects.Count > 0
            ? Math.Round((decimal)onTime / completedProjects.Count * 100, 2)
            : 0;

        // Average planned duration
        var withPlannedDuration = projects
            .Where(p => p.StartDate.HasValue && p.EndDate.HasValue)
            .ToList();
        var avgPlanned = withPlannedDuration.Any()
            ? withPlannedDuration.Average(p => (p.EndDate!.Value - p.StartDate!.Value).TotalDays)
            : 0;

        // Average actual duration
        var withActualDuration = completedProjects
            .Where(p => p.ActualStartDate.HasValue && p.ActualEndDate.HasValue)
            .ToList();
        var avgActual = withActualDuration.Any()
            ? withActualDuration.Average(p => (p.ActualEndDate!.Value - p.ActualStartDate!.Value).TotalDays)
            : 0;

        return new ProjectMetricsResponse
        {
            TotalProjects           = total,
            PlanningProjects        = planning,
            ActiveProjects          = active,
            OnHoldProjects          = onHold,
            CompletedProjects       = completed,
            CancelledProjects       = cancelled,
            OverdueProjects         = overdue,
            CompletionRate          = completionRate,
            ActiveRate              = activeRate,
            CancellationRate        = cancellationRate,
            OnTimeCompletionRate    = onTimeRate,
            AveragePlannedDurationDays = Math.Round(avgPlanned, 1),
            AverageActualDurationDays  = Math.Round(avgActual, 1),
            ByPriority = new ProjectsByPriorityBreakdown
            {
                Low    = projects.Count(p => p.Priority == RequestPriority.Low),
                Medium = projects.Count(p => p.Priority == RequestPriority.Medium),
                High   = projects.Count(p => p.Priority == RequestPriority.High),
                Urgent = projects.Count(p => p.Priority == RequestPriority.Urgent),
            }
        };
    }
}