"use server"

import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"

// Geheimes ntfy-Thema. Abonniere es kostenlos in der ntfy-App oder im Browser:
// https://ntfy.sh/gemaelde-date-7f3a9c2e
const NTFY_TOPIC = process.env.NTFY_TOPIC ?? "gemaelde-date-7f3a9c2e"

async function sendNotification(answer: string, chosenDay: string | null) {
  try {
    const title = answer === "Ja" ? "Sie hat JA gesagt!" : "Antwort: Nein"
    const body =
      answer === "Ja"
        ? chosenDay && chosenDay !== "Such du aus"
          ? `Wann: ${chosenDay}`
          : "Sie überlässt dir die Wahl des Termins."
        : "Sie hat (noch) auf Nein getippt."

    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",
      headers: {
        Title: title,
        Tags: answer === "Ja" ? "tada" : "thinking",
        Priority: answer === "Ja" ? "high" : "default",
      },
      body,
    })
  } catch (err) {
    console.log("[v0] ntfy notification failed:", err)
  }
}

export async function submitResponse(answer: string, chosenDay: string | null) {
  await pool.query(
    `INSERT INTO date_responses (answer, chosen_day) VALUES ($1, $2)`,
    [answer, chosenDay],
  )
  await sendNotification(answer, chosenDay)
  revalidatePath("/antworten")
}
