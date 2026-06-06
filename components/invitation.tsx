"use client"

import { useState } from "react"
import { submitResponse } from "@/app/actions/responses"

type Step = "ask" | "sweet" | "when" | "done"

const days = ["Samstag", "Sonntag"]
const times = ["Vormittag", "Nachmittag"]

export function Invitation() {
  const [step, setStep] = useState<Step>("ask")
  // how many times "Nein" was pressed (used to nudge the user)
  const [noCount, setNoCount] = useState(0)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [letYouChoose, setLetYouChoose] = useState(false)

  const chosenLabel = letYouChoose
    ? "Such du aus"
    : selectedDay && selectedTime
      ? `${selectedDay} ${selectedTime}`
      : null

  const canConfirm = letYouChoose || (selectedDay && selectedTime)

  function handleNo() {
    const next = noCount + 1
    setNoCount(next)
    // quietly record the playful "Nein" so it shows up in the dashboard
    void submitResponse("Nein", null)
  }

  function handleConfirm() {
    if (!canConfirm) return
    void submitResponse("Ja", chosenLabel)
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
              ? `${chosenLabel} also. Ich freue mich schon.`
              : "Wir finden bestimmt einen passenden Tag. Ich freue mich schon."}
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
              Lass uns herausfinden, welches Gemälde der beste Blickfang ist,
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

  // 3) When question — pick a day and a time of day on one page
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
                Tag
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {days.map((day) => {
                  const active = !letYouChoose && selectedDay === day
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setLetYouChoose(false)
                        setSelectedDay(day)
                      }}
                      className={`rounded-full border px-6 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tageszeit
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {times.map((time) => {
                  const active = !letYouChoose && selectedTime === time
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        setLetYouChoose(false)
                        setSelectedTime(time)
                      }}
                      className={`rounded-full border px-6 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setLetYouChoose(true)
                setSelectedDay(null)
                setSelectedTime(null)
              }}
              className={`mx-auto text-sm underline-offset-4 transition-colors hover:underline ${
                letYouChoose ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Oder: such du einfach aus
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="rounded-full bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {chosenLabel && chosenLabel !== "Such du aus"
              ? `${chosenLabel} — passt`
              : "Passt"}
          </button>
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
            Zeit. Das wäre doch einen gemeinsamen Besuch wert, oder?
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
