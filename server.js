const express = require("express"); // Import Express
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const twilio = require("twilio"); // Import Twilio

const app = express();
app.use(express.json());
app.use(cors());

// Load Twilio credentials from .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !twilioNumber) {
  console.error("❌ Missing Twilio credentials in .env file!");
  process.exit(1);
}

const client = twilio(accountSid, authToken);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Booking API with WhatsApp notifications
app.post("/api/book", async (req, res) => {
  
  const { room, date, customer, clientPhone} = req.body;

  console.log("📩 Received booking request:", { room, date, customer, clientPhone });


  if (!room || !date || !customer || !clientPhone) {
    console.error("❌ Missing fields in request!");
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const message = await client.messages.create({
      from:  "whatsapp:+14155238886",
      to: process.env.TWILIO_ADMIN_WHATSAPP,
      body: `📢 New Booking! 📅\n\nRoom: ${room}\nDate: ${date}\nCustomer: ${customer}\n📞 Phone: ${clientPhone}\n\nCheck the admin panel for details.`,
    });

    console.log("✅ WhatsApp Message Sent:", message.sid);

    res.json({ success: true, message: "Booking successful!" });
    console.error("❌ Error sending WhatsApp:", error);
    res.status(500).json({ error: error.message });
  } catch (error) { // ✅ Added the missing `catch` block
    console.error("❌ Error sending WhatsApp:", error);
    res.status(500).json({ error: error.message });}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));