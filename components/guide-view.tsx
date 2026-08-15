import { CYCLE_EXPLAINER, FAQ, PROGRAM_SUMMARY } from "@/lib/faq";
import { FORM_GUIDES } from "@/lib/form";
import { FormulaTables } from "./formula-tables";

export function GuideView() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Guide</h1>
        <p>All-Pro Simple Beginner, the same structure as your old spreadsheet.</p>
      </header>

      <FormulaTables />

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{CYCLE_EXPLAINER.title}</h2>
        {CYCLE_EXPLAINER.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <ul className="list-disc pl-5">
          {CYCLE_EXPLAINER.oldLoads.map((row) => (
            <li key={row.label}>
              {row.label} ({row.note}): squat {row.squat}, bench {row.bench}, row {row.row},
              press {row.ohp}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">How it works</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          {PROGRAM_SUMMARY.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Form</h2>
        {FORM_GUIDES.map((guide) => (
          <article key={guide.id} id={guide.id} className="scroll-mt-4 border-t border-neutral-300 pt-3">
            <h3 className="font-semibold">{guide.title}</h3>
            <p className="mt-1">{guide.setup}</p>
            <p className="mt-1 text-sm text-neutral-700">{guide.equipment}</p>
            <p className="mt-1 text-sm">
              <a className="underline" href={guide.video} target="_blank" rel="noreferrer">
                Form video
              </a>
            </p>
            <ul className="mt-2 list-disc pl-5">
              {guide.cues.map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ul>
            <p className="mt-2 font-medium">Avoid</p>
            <ul className="list-disc pl-5">
              {guide.avoid.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">FAQ</h2>
        {FAQ.map((item) => (
          <details key={item.id} className="border-t border-neutral-300 pt-2">
            <summary className="cursor-pointer py-2 font-medium">{item.question}</summary>
            <p className="pb-3">{item.answer}</p>
          </details>
        ))}
      </section>

      <section className="pb-4 text-sm text-neutral-700">
        <h2 className="text-lg font-semibold text-black">On your phone</h2>
        <p className="mt-2">
          In Safari, tap Share → Add to Home Screen. It opens full-screen and keeps a local
          copy after the first load, then syncs when you are back online. Unlock with the
          code on a new phone to pick up the same log.
        </p>
      </section>

      <section className="pb-8 text-sm text-neutral-700">
        <h2 className="text-lg font-semibold text-black">Sources</h2>
        <ul className="mt-2 list-disc pl-5">
          <li>
            <a
              className="underline"
              href="https://forum.bodybuilding.com/showthread.php?t=160947761"
              target="_blank"
              rel="noreferrer"
            >
              All-Pro Simple Beginner, Bodybuilding.com part V
            </a>
          </li>
          <li>
            <a
              className="underline"
              href="https://www.youtube.com/playlist?list=PL8FAF74A332E11464"
              target="_blank"
              rel="noreferrer"
            >
              Official form playlist
            </a>
          </li>
          <li>
            <a
              className="underline"
              href="https://liftvault.com/programs/bodybuilding/all-pro-simple-beginner-routine-program-spreadsheet/"
              target="_blank"
              rel="noreferrer"
            >
              Lift Vault FAQ / spreadsheet notes
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
