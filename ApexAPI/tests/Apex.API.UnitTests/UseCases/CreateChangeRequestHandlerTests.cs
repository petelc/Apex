using Apex.API.Core.Aggregates.ChangeRequestAggregate;
using Apex.API.Core.Interfaces;
using Apex.API.Core.ValueObjects;
using Apex.API.UseCases.ChangeRequests.Create;
using Apex.API.UseCases.Common.Interfaces;

namespace Apex.API.UnitTests.UseCases;

public class CreateChangeRequestHandlerTests
{
    // ─── Fixtures ─────────────────────────────────────────────────────────────

    private readonly IRepository<ChangeRequest> _repo = Substitute.For<IRepository<ChangeRequest>>();
    private readonly ITenantContext _tenantContext = Substitute.For<ITenantContext>();
    private readonly ICurrentUserService _currentUser = Substitute.For<ICurrentUserService>();
    private readonly ILogger<CreateChangeRequestHandler> _logger = Substitute.For<ILogger<CreateChangeRequestHandler>>();

    private readonly TenantId _tenantId = TenantId.From(Guid.NewGuid());
    private readonly Guid _userId = Guid.NewGuid();

    private CreateChangeRequestHandler CreateHandler() =>
        new(_repo, _tenantContext, _currentUser, _logger);

    private static CreateChangeRequestCommand ValidCommand(
        string changeType = "Normal",
        string priority = "Medium",
        string riskLevel = "Medium") =>
        new(
            Title: "Deploy auth service",
            Description: "Update auth service to v2.1",
            ChangeType: changeType,
            Priority: priority,
            RiskLevel: riskLevel,
            ImpactAssessment: "Users will re-authenticate",
            RollbackPlan: "Revert to v2.0",
            AffectedSystems: "AuthService");

    public CreateChangeRequestHandlerTests()
    {
        _tenantContext.CurrentTenantId.Returns(_tenantId);
        _currentUser.UserId.Returns(_userId);
        _repo.AddAsync(Arg.Any<ChangeRequest>(), Arg.Any<CancellationToken>())
             .Returns(ci => ci.Arg<ChangeRequest>());
    }

    // ─── Happy path ───────────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WithValidCommand_ReturnsSuccessWithId()
    {
        var result = await CreateHandler().Handle(ValidCommand(), CancellationToken.None);

        result.IsSuccess.ShouldBeTrue();
        result.Value.Value.ShouldNotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_WithValidCommand_CallsAddAsync()
    {
        await CreateHandler().Handle(ValidCommand(), CancellationToken.None);

        await _repo.Received(1).AddAsync(Arg.Any<ChangeRequest>(), Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData("Normal")]
    [InlineData("Standard")]
    [InlineData("Emergency")]
    public async Task Handle_WithValidChangeType_Succeeds(string changeType)
    {
        var result = await CreateHandler().Handle(ValidCommand(changeType: changeType), CancellationToken.None);

        result.IsSuccess.ShouldBeTrue();
    }

    // ─── Invalid inputs ───────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WithInvalidChangeType_ReturnsError()
    {
        var result = await CreateHandler().Handle(ValidCommand(changeType: "Bogus"), CancellationToken.None);

        result.IsSuccess.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.Contains("Invalid change type"));
    }

    [Fact]
    public async Task Handle_WithInvalidPriority_ReturnsError()
    {
        var result = await CreateHandler().Handle(ValidCommand(priority: "SuperUrgent"), CancellationToken.None);

        result.IsSuccess.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.Contains("Invalid priority"));
    }

    [Fact]
    public async Task Handle_WithInvalidRiskLevel_ReturnsError()
    {
        var result = await CreateHandler().Handle(ValidCommand(riskLevel: "Extreme"), CancellationToken.None);

        result.IsSuccess.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.Contains("Invalid risk level"));
    }

    [Fact]
    public async Task Handle_WithBlankTitle_ReturnsError()
    {
        var cmd = ValidCommand() with { Title = "" };

        var result = await CreateHandler().Handle(cmd, CancellationToken.None);

        result.IsSuccess.ShouldBeFalse();
    }
}