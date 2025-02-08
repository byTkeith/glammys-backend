require("dotenv").config();

console.log("🔍 TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("🔍 TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN);
console.log("🔍 TWILIO_WHATSAPP_NUMBER:", process.env.TWILIO_WHATSAPP_NUMBER);
console.log("🔍 TWILIO_ADMIN_WHATSAPP:", process.env.TWILIO_ADMIN_WHATSAPP);
const express = require("express"); // Import Express
const cors = require("cors");
//require("dotenv").config(); // Load environment variables

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
  try {
    const { room, date, customer, clientPhone } = req.body;

    console.log("📩 Received booking request:", { room, date, customer, clientPhone });

    if (!room || !date || !customer || !clientPhone) {
      console.error("❌ Missing fields in request!");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Ensure Twilio numbers are correctly formatted
    const fromNumber = "whatsapp:+14155238886"; // ✅ Twilio Sandbox WhatsApp Number
    const toNumber = process.env.TWILIO_ADMIN_WHATSAPP.startsWith("whatsapp:")
  ? process.env.TWILIO_ADMIN_WHATSAPP
  : `whatsapp:${process.env.TWILIO_ADMIN_WHATSAPP}`;

    console.log("📨 Sending WhatsApp message from:", fromNumber, "to:", toNumber);

    // ✅ FIX: Use correct variable name (`messageResponse`) instead of `message`
    const messageResponse = await client.messages.create({
      from: fromNumber,
      to: toNumber,
      body: `📢 New Booking! 📅\n\nRoom: ${room}\nDate: ${date}\nCustomer: ${customer}\n📞 Phone: ${clientPhone}\n\nCheck the admin panel for details.`,
    });

    console.log("✅ WhatsApp Message Sent:", messageResponse.sid);
    res.json({ success: true, message: "Booking successful!" });

  } catch (error) {
    console.error("❌ Error sending WhatsApp:", error);

    // ✅ FIX: Ensure error messages are properly sent to frontend
    res.status(500).json({ error: error.message || "Unknown error occurred" });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));