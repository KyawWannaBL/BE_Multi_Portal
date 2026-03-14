import React from "react";
import type { PhotoAssessment } from "./FieldOpsToolkit";

export default function PhotoReviewPanel({
  assessment,
  title = "Photo quality guidance",
}: {
  assessment?: PhotoAssessment | null;
  title?: string;
}) {
  if (!assessment) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#0B1220] p-5 text-sm text-white/60">
        Capture or upload a photo to see quality guidance.
      </div>
    );
  }

  const qualityTone =
    assessment.score >= 80
      ? "text-emerald-300 border-emerald-500/20 bg-emerald-500/10"
      : assessment.score >= 60
      ? "text-amber-300 border-amber-500/20 bg-amber-500/10"
      : "text-rose-300 border-rose-500/20 bg-rose-500/10";

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0B1220] p-5 shadow-xl">
      <div className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        {title}
      </div>

      <div className={`mb-4 rounded-2xl border px-4 py-3 ${qualityTone}`}>
        Score {assessment.score} / 100
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Width" value={assessment.width} />
        <Metric label="Height" value={assessment.height} />
        <Metric label="Brightness" value={assessment.brightness} />
        <Metric label="Sharpness" value={assessment.sharpness} />
      </div>

      {assessment.issues.length ? (
        <div className="mt-4">
          <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-rose-300">
            Issues
          </div>
          <div className="flex flex-wrap gap-2">
            {assessment.issues.map((issue) => (
              <span
                key={issue}
                className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs text-rose-300"
              >
                {issue}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
          Guidance
        </div>
        <ul className="space-y-2 text-sm text-white/75">
          {assessment.guidance.map((item, index) => (
            <li key={`${item}-${index}`} className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
