import { pool } from "@/lib/db"

export const dynamic = "force-dynamic"

type ResponseRow = {
  id: number
  answer: string
  chosen_day: string | null
  created_at: string
}

async function getResponses(): Promise<ResponseRow[]> {
  const { rows } = await pool.query(
    `SELECT id, answer, chosen_day, created_at
     FROM date_responses
     ORDER BY created_at DESC`,
  )
  return rows as ResponseRow[]
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default async function ResponsesPage() {
  const responses = await getResponses()
  const yesCount = responses.filter((r) => r.answer === "Ja").length
  const noCount = responses.filter((r) => r.answer === "Nein").length

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <header className="mb-10 space-y-2">
        <h1 className="font-serif text-3xl text-foreground text-balance">
          Antworten
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
          {yesCount} mal &quot;Ja&quot; &middot; {noCount} mal &quot;Nein&quot;
        </p>
      </header>

      {responses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Noch keine Antworten. Sobald sie reagiert, taucht es hier auf.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {responses.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border px-5 py-4"
            >
              <div className="flex flex-col gap-1">
                <span
                  className={`text-sm font-medium ${
                    r.answer === "Ja" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {r.answer}
                </span>
                {r.chosen_day && (
                  <span className="text-sm text-foreground">{r.chosen_day}</span>
                )}
              </div>
              <time className="text-xs text-muted-foreground">
                {formatDate(r.created_at)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
