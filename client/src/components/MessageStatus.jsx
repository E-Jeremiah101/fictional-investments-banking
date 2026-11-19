import { Check, CheckCheck } from "lucide-react";

export default function MessageStatus({ read, sending, className = "" }) {
  if (sending) {
    return (
      <span
        className={`inline-flex items-center ${className}`}
        aria-label="Sending"
      >
        <Check size={13} className="opacity-40" />
      </span>
    );
  }

  if (read) {
    return (
      <span
        className={`inline-flex items-center ${className}`}
        aria-label="Read"
      >
        <CheckCheck size={15} className="text-sky-300" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center ${className}`}
      aria-label="Delivered"
    >
      <Check size={13} className="text-white/70" />
    </span>
  );
}
