using Innovia.Api.Features.Chatbot;

namespace Innovia.Api.Tests.Features.ChatbotTests;

public class ChatbotValidationTests
{
    [Fact]
    public void Should_Accept_NonEmpty_Message()
    {
        Assert.True(OpenAiChatService.IsMessageValid("How do I make a booking?"));
    }

    [Fact]
    public void Should_Reject_Empty_Message()
    {
        Assert.False(OpenAiChatService.IsMessageValid("   "));
    }

    [Fact]
    public void Should_Reject_Message_Over_2000_Characters()
    {
        Assert.False(OpenAiChatService.IsMessageValid(new string('a', 2_001)));
    }
}
