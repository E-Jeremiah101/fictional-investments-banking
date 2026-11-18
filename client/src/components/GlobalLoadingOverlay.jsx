import { useSyncExternalStore } from "react";
import { LoaderCircle, } from "lucide-react";
import {
  getIsLoading,
  subscribeToLoading,
} from "../services/loadingTracker.js";

export default function GlobalLoadingOverlay() {
  const isLoading = useSyncExternalStore(
    subscribeToLoading,
    getIsLoading,
    getIsLoading,
  );

  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      aria-busy="true"
      className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-white"
    >
      <LoaderCircle
        aria-hidden="true"
        size={56}
        strokeWidth={2}
        className="animate-spin text-[#0b3b8c]"
      />
    </div>
  );
}
