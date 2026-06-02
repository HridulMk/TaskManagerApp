export function Timeline() {
  return (
    <div className="rounded-xl border p-6">
      <h3 className="font-semibold mb-4">
        Weekly Timeline
      </h3>

      <div className="grid grid-cols-7 gap-2">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => (
          <div
            key={day}
            className="h-24 rounded bg-muted flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}