using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Ardalis.Result;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.DepartmentAggregate;
using Apex.API.Core.Aggregates.UserAggregate;
using Apex.API.Core.Interfaces;

namespace Apex.API.UseCases.Departments.Delete;

public class DeleteDepartmentHandler : IRequestHandler<DeleteDepartmentCommand, Result>
{
    private readonly IRepository<Department> _repository;
    private readonly ITenantContext _tenantContext;
    private readonly UserManager<User> _userManager;
    private readonly ILogger<DeleteDepartmentHandler> _logger;

    public DeleteDepartmentHandler(
        IRepository<Department> repository,
        ITenantContext tenantContext,
        UserManager<User> userManager,
        ILogger<DeleteDepartmentHandler> logger)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteDepartmentCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var department = await _repository.GetByIdAsync(command.DepartmentId, cancellationToken);

            if (department == null)
                return Result.NotFound("Department not found.");

            if (department.TenantId != _tenantContext.CurrentTenantId)
                return Result.Forbidden();

            var memberCount = _userManager.Users
                .Count(u => u.DepartmentId == department.Id &&
                            u.TenantId == _tenantContext.CurrentTenantId);

            if (memberCount > 0)
                return Result.Error($"Cannot deactivate department with {memberCount} active member(s). Reassign users first.");

            department.Deactivate();

            await _repository.UpdateAsync(department, cancellationToken);

            _logger.LogInformation(
                "Department deactivated: DepartmentId={DepartmentId}, Name={Name}",
                department.Id, department.Name);

            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation deactivating department: {Message}", ex.Message);
            return Result.Error(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating department: DepartmentId={DepartmentId}", command.DepartmentId);
            return Result.Error("An error occurred while deactivating the department.");
        }
    }
}