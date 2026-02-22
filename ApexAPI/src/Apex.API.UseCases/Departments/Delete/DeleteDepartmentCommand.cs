using MediatR;
using Ardalis.Result;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UseCases.Departments.Delete;

public record DeleteDepartmentCommand(DepartmentId DepartmentId) : IRequest<Result>;