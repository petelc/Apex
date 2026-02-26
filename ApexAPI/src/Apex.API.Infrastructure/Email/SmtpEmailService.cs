using Apex.API.Core.Interfaces;
using MailKit.Security;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Apex.API.Infrastructure.Email;

/// <summary>
/// SMTP email service using MailKit. Works with Mailtrap, Gmail, or any SMTP server.
/// Configure via Email:Smtp in appsettings.
/// </summary>
public class SmtpEmailService : IEmailService
{
    private readonly EmailOptions _options;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IOptions<EmailOptions> options, ILogger<SmtpEmailService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendEmailAsync(
        string toEmail,
        string toName,
        string subject,
        string htmlBody,
        string? plainTextBody = null,
        CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            _logger.LogInformation("Email disabled. Would send to {Email}: {Subject}", toEmail, subject);
            return;
        }

        var message = BuildMessage(
            new[] { (toEmail, toName) },
            subject,
            htmlBody,
            plainTextBody);

        await SendAsync(message, toEmail, subject, cancellationToken);
    }

    public async Task SendEmailAsync(
        IEnumerable<(string Email, string Name)> recipients,
        string subject,
        string htmlBody,
        string? plainTextBody = null,
        CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled) return;

        var recipientList = recipients.ToList();
        var message = BuildMessage(recipientList, subject, htmlBody, plainTextBody);
        var toList = string.Join(", ", recipientList.Select(r => r.Email));
        await SendAsync(message, toList, subject, cancellationToken);
    }

    public Task SendTemplatedEmailAsync<TModel>(
        string toEmail,
        string toName,
        string templateName,
        TModel model,
        CancellationToken cancellationToken = default) where TModel : class
        => throw new NotSupportedException("Use IEmailTemplateService to render templates first.");

    public Task SendTemplatedEmailAsync<TModel>(
        IEnumerable<(string Email, string Name)> recipients,
        string templateName,
        TModel model,
        CancellationToken cancellationToken = default) where TModel : class
        => throw new NotSupportedException("Use IEmailTemplateService to render templates first.");

    // -------------------------------------------------------------------------

    private MimeMessage BuildMessage(
        IEnumerable<(string Email, string Name)> recipients,
        string subject,
        string htmlBody,
        string? plainTextBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.FromName, _options.FromEmail));

        foreach (var (email, name) in recipients)
            message.To.Add(new MailboxAddress(name, email));

        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = htmlBody,
            TextBody = plainTextBody ?? StripHtml(htmlBody)
        };

        message.Body = bodyBuilder.ToMessageBody();
        return message;
    }

    private async Task SendAsync(MimeMessage message, string toDescription, string subject, CancellationToken ct)
    {
        var smtp = _options.Smtp;

        try
        {
            using var client = new SmtpClient();

            // SecureSocketOptions.StartTls works for Mailtrap (port 587), Gmail, etc.
            // Auto will negotiate the best option for the server.
            await client.ConnectAsync(smtp.Host, smtp.Port, SecureSocketOptions.StartTlsWhenAvailable, ct);

            if (!string.IsNullOrEmpty(smtp.Username))
                await client.AuthenticateAsync(smtp.Username, smtp.Password, ct);

            await client.SendAsync(message, ct);
            await client.DisconnectAsync(quit: true, ct);

            _logger.LogInformation("Email sent via SMTP to {To}: {Subject}", toDescription, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email via SMTP to {To}: {Subject}", toDescription, subject);
            throw;
        }
    }

    private static string StripHtml(string html) =>
        System.Text.RegularExpressions.Regex.Replace(html, "<.*?>", string.Empty);
}
