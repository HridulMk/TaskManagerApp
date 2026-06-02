export function ProjectStreams() {
  return (
    <div className="rounded-xl border p-6">
      <h3 className="font-semibold mb-4">
        Project Streams
      </h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between">
            <span>Frontend</span>
            <span>80%</span>
          </div>

          <div className="h-2 bg-muted rounded">
            <div className="h-2 w-4/5 bg-primary rounded" />
          </div>
        </div>

        <div>
          <div className="flex justify-between">
            <span>Backend</span>
            <span>55%</span>
          </div>

          <div className="h-2 bg-muted rounded">
            <div className="h-2 w-[55%] bg-primary rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}