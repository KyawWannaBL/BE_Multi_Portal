import "dotenv/config";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { subjectFor, htmlFor } from "./emailTemplates.js";

const app = express();
app.use(cors()); app.use(express.json());

const PORT = process.env.PORT || 8787;
const NOTIFY_SECRET = process.env.NOTIFY_SECRET || "";

app.post("/notify", async (req, res) => {
  if (NOTIFY_SECRET && req.headers["x-notify-secret"] !== NOTIFY_SECRET) return res.status(401).send("Unauthorized");
  
  const { event, payload, actorEmail } = req.body;
  console.log(`[Event] ${event} from ${actorEmail}`);

  // Real SMTP logic would go here
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Notify server on :${PORT}`));
