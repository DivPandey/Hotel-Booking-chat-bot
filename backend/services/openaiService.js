const OpenAI = require('openai');
const { getRooms, bookRoom } = require('./roomService');

const dotenv = require('dotenv');
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const functions = [
  {
    name: "get_rooms",
    description: "Get available hotel rooms",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "book_room",
    description: "Book a hotel room",
    parameters: {
      type: "object",
      properties: {
        roomId: { type: "number" },
        guests: { 
          type: "array",
          items: { type: "object", properties: { name: { type: "string" }}}
        },
        mobile: { type: "string" },
        email: { type: "string" },
        nights: { type: "number" }
      },
      required: ["roomId", "guests", "mobile", "email", "nights"]
    }
  }
];

async function getChatCompletion(messages) {
  try {
    // Add system prompt to restrict the model's responses to hotel booking queries
    messages.unshift({
      role: "system",
      content: "You are a hotel booking assistant. Only respond to queries related to hotel room bookings and reservations."
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      functions: functions,
      function_call: "auto",
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name;
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);

      let functionResult;
      if (functionName === "get_rooms") {
        functionResult = await getRooms();
      } else if (functionName === "book_room") {
        functionResult = await bookRoom(
          functionArgs.roomId,
          functionArgs.guests,
          functionArgs.mobile,
          functionArgs.email,
          functionArgs.nights
        );
      }

      messages.push(responseMessage);
      messages.push({
        role: "function",
        name: functionName,
        content: JSON.stringify(functionResult)
      });

      return getChatCompletion(messages);
    }

    return responseMessage.content;
  } catch (error) {
    console.error("Error in OpenAI API call:", error);
    throw error;
  }
}

module.exports = { getChatCompletion };
