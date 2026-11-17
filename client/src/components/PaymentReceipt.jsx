import { useEffect, useState } from "react";
import { FileText, LoaderCircle } from "lucide-react";
import api from "../services/axios.js";

export default function PaymentReceipt({ endpoint, fileName, contentType }) {
  const [receiptUrl, setReceiptUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrl = "";

    api
      .get(endpoint, { responseType: "blob" })
      .then(({ data }) => {
        if (active) {
          objectUrl = URL.createObjectURL(data);
          setReceiptUrl(objectUrl);
        }
      })
      .catch(() => {
        if (active) setError("Unable to load the payment receipt.");
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [endpoint]);

  if (error) {
    return <p className="mt-2 text-sm text-rose-700">{error}</p>;
  }
  if (!receiptUrl) {
    return (
      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
        <LoaderCircle size={14} className="animate-spin" />
        Loading receipt…
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      {contentType?.startsWith("image/") && (
        <a href={receiptUrl} target="_blank" rel="noreferrer">
          <img
            src={receiptUrl}
            alt="Uploaded payment receipt"
            className="max-h-96 max-w-full rounded-lg border border-slate-200 object-contain"
          />
        </a>
      )}
      <a
        href={receiptUrl}
        download={fileName || "payment-receipt"}
        target={contentType === "application/pdf" ? "_blank" : undefined}
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 underline"
      >
        <FileText size={14} />
        {contentType === "application/pdf" ? "Open receipt PDF" : fileName}
      </a>
    </div>
  );
}
