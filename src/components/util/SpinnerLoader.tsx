import { Loader2 } from "lucide-react";

export default function SpinnerLoader() {
  return (
    <div className="flex justify-center items-center" role="status">
      <Loader2 className="animate-spin text-[#dc2626]" size={32} />
    </div>
  );
}
