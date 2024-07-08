const Conversation = require('../models/conversation');
const { getChatCompletion } = require('../services/openaiService');
const { sendConfirmationEmail } = require('../services/emailService');

async function chat(req, res) {
  try {
    const { userId, message } = req.body;

    let conversation = await Conversation.findOne({ where: { userId } });
    if (!conversation) {
      conversation = await Conversation.create({ userId, messages: [] });
    }

    const messages = conversation.messages;
    messages.push({ role: 'user', content: message });

    const botResponse = await getChatCompletion(messages);
    messages.push({ role: 'assistant', content: botResponse });

    await conversation.update({ messages });

    // Check if a booking was made
    const bookingMatch = botResponse.match(/Booking confirmed! Your booking ID is (\w+)/);
    if (bookingMatch) {
      const bookingId = bookingMatch[1];
      const emailMatch = message.match(/email: (\S+@\S+\.\S+)/);
      const mobileMatch = message.match(/mobile: (\d+)/);
      const guestsMatch = message.match(/guests: (.*)/);

      if (emailMatch && mobileMatch && guestsMatch) {
        const userEmail = emailMatch[1];
        const userMobile = mobileMatch[1];
        const guests = guestsMatch[1].split(',').map(name => name.trim());

        await sendConfirmationEmail(userEmail, { bookingId, guests, userMobile });
      }
    }

    res.json({ response: botResponse });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
}

module.exports = { chat };