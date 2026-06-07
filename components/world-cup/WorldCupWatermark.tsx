import { WorldCupLogo } from "./WorldCupLogo";

export function WorldCupWatermark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="absolute -right-8 top-1/4 opacity-[0.04]">
        <WorldCupLogo size="xl" />
      </div>
      <div className="absolute -left-12 bottom-1/4 rotate-12 opacity-[0.03]">
        <WorldCupLogo size="lg" />
      </div>
    </div>
  );
}
