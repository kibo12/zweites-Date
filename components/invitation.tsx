"use client"

import { useState } from "react"
import { submitResponse } from "@/app/actions/responses"

type Step = "ask" | "sweet" | "when" | "food" | "done"

export function Invitation() {
  const [step, setStep] = useState<Step>("ask")
  // how many times "Nein" was pressed (used to nudge the user)
  const [noCount, setNoCount] = useState(0)
  const [selectedDateTime, setSelectedDateTime] = useState<string>("")
  const [letYouChoose, setLetYouChoose] = useState(false)
  const [wantsFood, setWantsFood] = useState<boolean | null>(null)

  // Hilfsfunktion zur Formatierung des Datums in ein schönes deutsches Format
  function formatGermanDateTime(dateTimeString: string): string {
    if (!dateTimeString) return ""
    const dateObj = new Date(dateTimeString)
    
    // Prüfen, ob das Datum gültig ist
    if (isNaN(dateObj.getTime())) return ""

    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    
    return dateObj.toLocaleDateString("de-DE", options) + " Uhr"
  }

  const formattedLabel = selectedDateTime ? formatGermanDateTime(selectedDateTime) : null

  const chosenLabel = letYouChoose
    ? "Such du aus"
    : formattedLabel
      ? formattedLabel
      : null

  const canConfirm = letYouChoose || selectedDateTime !== ""

  function handleNo() {
    const next = noCount + 1
    setNoCount(next)
    // quietly record the playful "Nein" so it shows up in the dashboard
    void submitResponse("Nein", null)
  }

  // Schaltet von der Zeitauswahl weiter zur Essensfrage
  function handleGoToFood() {
    if (!canConfirm) return
    setStep("food")
  }

  // Sendet am Ende alle gesammelten Antworten ab
  function handleFinalConfirm() {
    if (wantsFood === null) return
    
    const foodSuffix = wantsFood ? " (Danach noch was essen 🍕)" : " (Nur Museum 🏛️)"
    const finalResponseLabel = chosenLabel ? `${chosenLabel}${foodSuffix}` : `Datum offen${foodSuffix}`
    
    void submitResponse("Ja", finalResponseLabel)
    setStep("done")
  }

  // 1) Final confirmation
  if (step === "done") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
        <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 text-center">
          <p className="font-serif text-2xl leading-relaxed text-foreground text-balance">
            Wunderbar. Dann sehen wir uns dort.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            {chosenLabel && chosenLabel !== "Such du aus"
              ? `Am ${chosenLabel} also. Ich freue mich schon.`
              : "Wir finden bestimmt einen passenden Tag. Ich freue mich schon."}
          </p>
          <p className="text-sm font-medium text-primary">
            {wantsFood ? "Und Hunger bringen wir auch mit! 🍕" : "🏛️"}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
            Wallraf-Richartz-Museum &middot; bevor es schließt.
          </p>
        </div>
      </main>
    )
  }

  // 2) Sweet little interlude after "Ja"
  if (step === "sweet") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16">
        <PaintingBackdrop />
        <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-10 text-center">
          <div className="space-y-5">
            <p className="font-serif text-2xl leading-relaxed text-foreground text-balance">
              Wusste ich&apos;s doch.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground text-pretty">
              Lass uns herausfinden, welches Kunstwerk der beste Blickfang ist,
              auch wenn ich schon weiß, dass es nicht an der Wand hängen wird. ;)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStep("when")}
            className="rounded-full bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Weiter
          </button>
        </div>
      </main>
    )
  }

  // 3) When question — pick a precise date and time via calendar
  if (step === "when") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16">
        <PaintingBackdrop />
        <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-10 text-center">
          <div className="space-y-5">
            <p className="font-serif text-2xl leading-relaxed text-foreground text-balance">
              Und wann passt es dir?
            </p>
            <p className="text-base leading-relaxed text-muted-foreground text-pretty">
              Am besten, bevor das Museum seine Türen für längere Zeit schließt.
            </p>
          </div>

          <div className="flex w-full flex-col gap-6">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Datum & Uhrzeit wählen
              </p>
              <div className="flex justify-center w-full">
                <input
                  type="datetime-local"
                  value={selectedDateTime}
                  disabled={letYouChoose}
                  onChange={(e) => {
                    setLetYouChoose(false)
                    setSelectedDateTime(e.target.value)
                  }}
                  className="w-full max-w-xs rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setLetYouChoose(!letYouChoose)
                setSelectedDateTime("")
              }}
              className={`mx-auto text-sm underline-offset-4 transition-colors hover:underline ${
                letYouChoose ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {letYouChoose ? "Oder: Ich wähle doch selbst ein Datum" : "Oder: Lass Ibo aussuchen"}
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoToFood}
            disabled={!canConfirm}
            className="rounded-full bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Weiter
          </button>
        </div>
      </main>
    )
  }

  // 4) NEW: Food question page
  if (step === "food") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16">
        <PaintingBackdrop />
        <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-10 text-center">
          <div className="space-y-5">
            <p className="font-serif text-2xl leading-relaxed text-foreground text-balance">
              Lust danach noch was essen zu gehen? 🍕
            </p>
            <p className="text-base leading-relaxed text-muted-foreground text-pretty">
              Der perfekte Abschluss für den Museumsbesuch.
            </p>
          </div>

          <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => setWantsFood(true)}
              className={`rounded-full px-8 py-3 text-sm font-medium border transition-all ${
                wantsFood === true
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              Ja, voll gerne!
            </button>
            <button
              type="button"
              onClick={() => setWantsFood(false)}
              className={`rounded-full px-8 py-3 text-sm font-medium border transition-all ${
                wantsFood === false
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              Lieber nur Museum
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 w-full">
            <button
              type="button"
              onClick={() => setStep("when")}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Zurück zur Zeitauswahl
            </button>

            <button
              type="button"
              onClick={handleFinalConfirm}
              disabled={wantsFood === null}
              className="rounded-full bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 w-full max-w-xs"
            >
              Einladung abschicken
            </button>
          </div>
        </div>
      </main>
    )
  }

  // 0) Initial question
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16">
      <PaintingBackdrop />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-10 text-center">
        <div className="space-y-5">
          <p className="font-serif text-2xl leading-relaxed text-foreground text-balance">
            Ich hab gehört, du magst alte Gemälde.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground text-pretty">
            Das Wallraf-Richartz-Museum schließt nächsten Monat für längere
            zeit. Das wäre doch einen gemeinsamen Besuch wert, oder?
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setStep("sweet")}
              className="rounded-full bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ja
            </button>
            <button
              type="button"
              onClick={handleNo}
              className="rounded-full border border-border px-8 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Nein
            </button>
          </div>

          {noCount > 0 && (
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              Da hast du dich bestimmt nur vertippt. Probier&apos;s nochmal.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

function PaintingBackdrop() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 opacity-15">
        <img
          src="/painting.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-background/70" />
    </>
  )
}
