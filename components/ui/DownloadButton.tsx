interface DownloadButtonProps {
  slug: string;
  label?: string;
  /** "amber" (défaut) ou "primary" (blanc). */
  variant?: "amber" | "primary";
  className?: string;
}

export default function DownloadButton({
  slug,
  label = "Télécharger gratuitement",
  variant = "amber",
  className,
}: DownloadButtonProps) {
  return (
    <a
      href={`/api/download/${slug}`}
      className={["btn", variant === "amber" ? "btn-amber" : "btn-primary", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
      {label}
    </a>
  );
}
