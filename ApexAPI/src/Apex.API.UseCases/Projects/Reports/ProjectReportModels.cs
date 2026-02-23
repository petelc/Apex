namespace Apex.API.UseCases.Projects.Reports;

public class ProjectMetricsResponse
{
    public int TotalProjects { get; set; }

    // Status breakdown
    public int PlanningProjects { get; set; }
    public int ActiveProjects { get; set; }
    public int OnHoldProjects { get; set; }
    public int CompletedProjects { get; set; }
    public int CancelledProjects { get; set; }

    // Rates
    public decimal CompletionRate { get; set; }
    public decimal ActiveRate { get; set; }
    public decimal CancellationRate { get; set; }
    public decimal OnTimeCompletionRate { get; set; }

    // Counts
    public int OverdueProjects { get; set; }

    // Time metrics (days)
    public double AveragePlannedDurationDays { get; set; }
    public double AverageActualDurationDays { get; set; }

    // Priority breakdown
    public ProjectsByPriorityBreakdown ByPriority { get; set; } = new();
}

public class ProjectsByPriorityBreakdown
{
    public int Low { get; set; }
    public int Medium { get; set; }
    public int High { get; set; }
    public int Urgent { get; set; }
}

public class ProjectMonthlyTrendsResponse
{
    public List<ProjectMonthlyTrendData> Months { get; set; } = new();
}

public class ProjectMonthlyTrendData
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public int Created { get; set; }
    public int Completed { get; set; }
    public int Cancelled { get; set; }
    public decimal CompletionRate { get; set; }
}