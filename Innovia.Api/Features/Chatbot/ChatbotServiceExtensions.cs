namespace Innovia.Api.Features.Chatbot;

public static class ChatbotServiceExtensions
{
    public static IServiceCollection AddChatbotFeature(this IServiceCollection services)
    {
        services.AddHttpClient<OpenAiChatService>(client =>
        {
            client.BaseAddress = new Uri("https://api.openai.com/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        services.AddScoped<SendMessage.Handler>();

        return services;
    }

    public static IEndpointRouteBuilder MapChatbotEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/chatbot")
            .WithTags("Chatbot")
            .RequireAuthorization();

        SendMessage.Endpoint.Map(group);

        return app;
    }
}
