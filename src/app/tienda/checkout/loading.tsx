export default function CheckoutLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-4 w-32 rounded bg-neutral-800" />
      <div className="mb-8 h-9 w-48 rounded bg-neutral-800 md:h-10" />

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <div className="w-full lg:w-3/5">
          <div className="mb-6 h-5 w-44 rounded bg-neutral-800" />
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="h-11 rounded-lg bg-neutral-800" />
              <div className="h-11 rounded-lg bg-neutral-800" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="h-11 rounded-lg bg-neutral-800" />
              <div className="h-11 rounded-lg bg-neutral-800" />
            </div>
            <div className="h-11 rounded-lg bg-neutral-800" />
            <div className="mt-4 h-12 w-40 rounded-lg bg-neutral-800" />
          </div>
        </div>
        <div className="w-full lg:w-2/5">
          <div className="mb-6 h-5 w-44 rounded bg-neutral-800" />
          <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="h-16 rounded-md bg-neutral-800" />
            <div className="h-16 rounded-md bg-neutral-800" />
            <div className="border-t border-neutral-800 pt-4">
              <div className="h-4 rounded bg-neutral-800" />
              <div className="mt-3 h-4 rounded bg-neutral-800" />
              <div className="mt-4 border-t border-neutral-800 pt-4">
                <div className="h-5 rounded bg-neutral-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
