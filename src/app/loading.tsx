export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-[100vh] min-h-[540px] w-screen bg-neutral-900" />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="h-6 w-40 rounded bg-neutral-800" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="h-32 rounded-xl bg-neutral-900" />
          <div className="h-32 rounded-xl bg-neutral-900" />
        </div>
      </div>
    </div>
  );
}
