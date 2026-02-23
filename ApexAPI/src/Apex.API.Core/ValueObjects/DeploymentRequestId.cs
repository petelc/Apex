using Vogen;

namespace Apex.API.Core.ValueObjects;

/// <summary>
/// Strongly-typed identifier for DeploymentRequest aggregate
/// </summary>
[ValueObject<Guid>]
public readonly partial struct DeploymentRequestId
{
    /// <summary>
    /// Creates a new unique DeploymentRequestId
    /// </summary>
    public static DeploymentRequestId CreateUnique() => From(Guid.NewGuid());

    /// <summary>
    /// Empty/default DeploymentRequestId (for comparison)
    /// </summary>
    public static DeploymentRequestId Empty => From(Guid.Empty);
}
