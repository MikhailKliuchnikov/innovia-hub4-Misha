using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Innovia.Api.Common.Result;

namespace Innovia.Api.Features.Chatbot;

public sealed class OpenAiChatService
{
    private const int MaxMessageLength = 2_000;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly string _faqContent;

    public OpenAiChatService(HttpClient httpClient, IConfiguration configuration, IWebHostEnvironment environment)
    {
        _httpClient = httpClient;
        _configuration = configuration;

        var faqPath = Path.Combine(
            environment.ContentRootPath,
            "Features",
            "Chatbot",
            "Knowledge",
            "innovia-hub-faq.md");

        _faqContent = File.Exists(faqPath)
            ? File.ReadAllText(faqPath)
            : throw new FileNotFoundException("The Innovia Hub chatbot FAQ could not be found.", faqPath);
    }

    public async Task<Result<string>> GenerateResponseAsync(string message, CancellationToken ct)
    {
        var apiKey = _configuration["OpenAI:ApiKey"] ?? _configuration["OPENAI_API_KEY"];
        var model = _configuration["OpenAI:Model"] ?? _configuration["OPENAI_MODEL"];

        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(model))
            return Result<string>.Fail(ChatbotErrors.Unavailable);

        using var request = new HttpRequestMessage(HttpMethod.Post, "v1/responses");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var payload = new
        {
            model,
            instructions = $"""
                You are the Innovia Hub help assistant.
                Answer questions about Innovia Hub using the FAQ below.
                Do not invent booking rules, resources, or system capabilities.
                If the FAQ does not contain enough information, say so clearly.
                Keep answers concise and helpful.

                FAQ:
                {_faqContent}
                """,
            input = message,
            max_output_tokens = 500
        };

        request.Content = new StringContent(
            JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json");

        try
        {
            using var response = await _httpClient.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
                return Result<string>.Fail(ChatbotErrors.Unavailable);

            await using var responseStream = await response.Content.ReadAsStreamAsync(ct);
            using var document = await JsonDocument.ParseAsync(responseStream, cancellationToken: ct);
            var answer = ExtractOutputText(document.RootElement);

            return string.IsNullOrWhiteSpace(answer)
                ? Result<string>.Fail(ChatbotErrors.Unavailable)
                : Result<string>.Ok(answer.Trim());
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            return Result<string>.Fail(ChatbotErrors.Unavailable);
        }
        catch (HttpRequestException)
        {
            return Result<string>.Fail(ChatbotErrors.Unavailable);
        }
        catch (JsonException)
        {
            return Result<string>.Fail(ChatbotErrors.Unavailable);
        }
    }

    private static string? ExtractOutputText(JsonElement root)
    {
        if (!root.TryGetProperty("output", out var output) || output.ValueKind != JsonValueKind.Array)
            return null;

        var text = new StringBuilder();
        foreach (var outputItem in output.EnumerateArray())
        {
            if (!outputItem.TryGetProperty("content", out var content) || content.ValueKind != JsonValueKind.Array)
                continue;

            foreach (var contentItem in content.EnumerateArray())
            {
                if (contentItem.TryGetProperty("type", out var type)
                    && type.GetString() == "output_text"
                    && contentItem.TryGetProperty("text", out var contentText))
                {
                    if (text.Length > 0)
                        text.AppendLine();
                    text.Append(contentText.GetString());
                }
            }
        }

        return text.Length == 0 ? null : text.ToString();
    }

    public static bool IsMessageValid(string message) =>
        !string.IsNullOrWhiteSpace(message) && message.Trim().Length <= MaxMessageLength;
}
