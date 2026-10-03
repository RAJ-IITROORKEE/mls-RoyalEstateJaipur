// Adapted from Aceternity UI's free Spotlight New composition:
// https://ui.aceternity.com/components/spotlight-new
// CSS transforms allow pause/resume without resetting the light.
export function ArchitecturalSpotlight({ running }: { running: boolean }) {
  return (
    <div
      className="architectural-spotlight"
      data-running={running ? "true" : "false"}
    >
      <div
        className="architectural-spotlight__side architectural-spotlight__side--left"
        data-spotlight-moving
      >
        <div className="architectural-spotlight__ray" />
        <div className="architectural-spotlight__ray architectural-spotlight__ray--narrow" />
      </div>
      <div
        className="architectural-spotlight__side architectural-spotlight__side--right"
        data-spotlight-moving
      >
        <div className="architectural-spotlight__ray" />
        <div className="architectural-spotlight__ray architectural-spotlight__ray--narrow" />
      </div>
    </div>
  );
}
