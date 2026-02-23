namespace Apex.API.UseCases.DeploymentRequests.DTOs;

public record DeploymentRequestListItemDto(
    Guid Id,
    string Title,
    string Status,
    string Priority,
    string RiskLevel,
    string Environment,
    Guid CreatedByUserId,
    string? CreatedByUserName,
    Guid? ProjectId,
    Guid? ChangeRequestId,
    DateTime CreatedDate,
    DateTime? SubmittedDate,
    DateTime? ScheduledStartDate,
    DateTime? DeployedDate,
    bool IsOverdue);
