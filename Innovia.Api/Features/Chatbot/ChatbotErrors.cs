using Innovia.Api.Common.Errors;

namespace Innovia.Api.Features.Chatbot;

public static class ChatbotErrors
{
    public static readonly Error Unavailable = Error.Failure(
        "The chatbot is temporarily unavailable. Please try again later."
    );
}
