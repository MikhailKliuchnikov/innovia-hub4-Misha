using Innovia.Api.Common.Result;

namespace Innovia.Api.Features.Chatbot.SendMessage;

public static class Endpoint
{
    public static RouteHandlerBuilder Map(IEndpointRouteBuilder app)
    {
        return app.MapPost("/messages", async (
            Request request,
            Handler handler,
            CancellationToken ct) =>
        {
            if (!OpenAiChatService.IsMessageValid(request.Message))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.Message)] = ["Message is required and must be 2,000 characters or fewer."]
                });
            }

            var result = await handler.HandleAsync(request, ct);
            return result.ToHttpResponse();
        });
    }
}
