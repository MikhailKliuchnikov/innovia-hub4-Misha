using Innovia.Api.Common.Result;

namespace Innovia.Api.Features.Chatbot.SendMessage;

public sealed class Handler
{
    private readonly OpenAiChatService _chatService;

    public Handler(OpenAiChatService chatService)
    {
        _chatService = chatService;
    }

    public async Task<Result<Response>> HandleAsync(Request request, CancellationToken ct)
    {
        var result = await _chatService.GenerateResponseAsync(request.Message.Trim(), ct);
        return result.IsSuccess
            ? Result<Response>.Ok(new Response(result.Value!))
            : Result<Response>.Fail(result.Error!);
    }
}
