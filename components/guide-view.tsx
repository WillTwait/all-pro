import { FAQ, PROGRAM_SUMMARY } from "@/lib/faq";
import { FORM_GUIDES } from "@/lib/form";

export function GuideView() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Guide</h1>
        <p>All-Pro Simple Beginner, the same structure as your old spreadsheet.</p>
      </header>

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
          In Safari, tap Share → Add to Home Screen. It opens full-screen and keeps working
          offline after the first load. Logs never leave the device unless you export them.
        </p>
      </section>
    </div>
  );
}
