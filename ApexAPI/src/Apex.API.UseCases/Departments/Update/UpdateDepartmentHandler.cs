using MediatR;
using Microsoft.Extensions.Logging;
using Ardalis.Result;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.DepartmentAggregate;
using Apex.API.Core.Interfaces;

namespace Apex.API.UseCases.Departments.Update;

public class UpdateDepartmentHandler : IRequestHandler<UpdateDepartmentCommand, Result>
{
    private readonly IRepository<Department> _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ILogger<UpdateDepartmentHandler> _logger;

    public UpdateDepartmentHandler(
        IRepository<Department> repository,
        ITenantContext tenantContext,
        ILogger<UpdateDepartmentHandler> logger)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateDepartmentCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var department = await _repository.GetByIdAsync(command.DepartmentId, cancellationToken);

            if (department == null)
                return Result.NotFound("Department not found.");

            if (department.TenantId != _tenantContext.CurrentTenantId)
                return Result.Forbidden();

            department.Update(command.Name, command.Description);

            await _repository.UpdateAsync(department, cancellationToken);

            _logger.LogInformation(
                "Department updated: DepartmentId={DepartmentId}, Name={Name}",
                department.Id, department.Name);

            return Result.Success();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error updating department: {Message}", ex.Message);
            return Result.Error(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating department: DepartmentId={DepartmentId}", command.DepartmentId);
            return Result.Error("An error occurred while updating the department.");
        }
    }
}