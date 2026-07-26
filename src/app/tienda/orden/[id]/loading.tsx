export default function OrderLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse">
      <div className="mb-6 h-4 w-48 rounded bg-neutral-800" />
      <div className="rounded-lg border border-neutral-800 bg-[#111]">
        <div className="flex flex-col items-center gap-4 border-b border-neutral-800 px-6 py-12">
          <div className="h-16 w-16 rounded-full bg-neutral-800" />
          <div className="h-7 w-52 rounded bg-neutral-800" />
          <div className="h-4 w-32 rounded bg-neutral-800" />
        </div>
        <div className="space-y-4 px-6 py-6">
          <div className="h-4 w-full rounded bg-neutral-800" />
          <div className="h-4 w-3/4 rounded bg-neutral-800" />
          <div className="h-4 w-full rounded bg-neutral-800" />
        </div>
        <div className="border-t border-neutral-800 px-6 py-6">
          <div className="mb-4 h-5 w-32 rounded bg-neutral-800" />
          <div className="space-y-4">
            <div className="h-14 rounded-md bg-neutral-800" />
            <div className="h-14 rounded-md bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  )
}
