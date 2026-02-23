namespace Apex.API.UseCases.Tasks.Reports;

public class TaskMetricsResponse
{
    public int TotalTasks { get; set; }

    // Status breakdown
    public int NotStartedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int BlockedTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int CancelledTasks { get; set; }

    // Rates
    public decimal CompletionRate { get; set; }
    public decimal BlockedRate { get; set; }
    public decimal OnTimeCompletionRate { get; set; }

    // Counts
    public int OverdueTasks { get; set; }

    // Time tracking
    public double AverageEstimatedHours { get; set; }
    public double AverageActualHours { get; set; }
    public double AverageHoursVariance { get; set; }

    // Assignment breakdown
    public int AssignedToUserTasks { get; set; }
    public int AssignedToDepartmentTasks { get; set; }
    public int UnassignedTasks { get; set; }

    // Priority breakdown
    public TasksByPriorityBreakdown ByPriority { get; set; } = new();
}

public class TasksByPriorityBreakdown
{
    public int Low { get; set; }
    public int Medium { get; set; }
    public int High { get; set; }
    public int Urgent { get; set; }
}