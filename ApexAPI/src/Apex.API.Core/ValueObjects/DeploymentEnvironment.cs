using Ardalis.SmartEnum;

namespace Apex.API.Core.ValueObjects;

/// <summary>
/// Target deployment environment
/// </summary>
public sealed class DeploymentEnvironment : SmartEnum<DeploymentEnvironment>
{
    public static readonly DeploymentEnvironment Development = new(nameof(Development), 0);
    public static readonly DeploymentEnvironment Staging = new(nameof(Staging), 1);
    public static readonly DeploymentEnvironment UAT = new(nameof(UAT), 2);
    public static readonly DeploymentEnvironment Production = new(nameof(Production), 3);

    private DeploymentEnvironment(string name, int value) : base(name, value) { }
}
