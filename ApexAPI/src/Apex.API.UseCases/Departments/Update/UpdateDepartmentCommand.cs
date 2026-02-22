using MediatR;
using Ardalis.Result;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UseCases.Departments.Update;

public record UpdateDepartmentCommand(
    DepartmentId DepartmentId,
    string Name,
    string Description
) : IRequest<Result>;