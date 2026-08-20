interface VerificationBadgeProps {
  status:
    | "VALID"
    | "REVOKED"
    | "TAMPERED"
    | "NOT_FOUND";
}

const config = {
  VALID: {
    label: "Verified",
    className:
      "bg-green-100 text-green-700",
  },

  REVOKED: {
    label: "Revoked",
    className:
      "bg-orange-100 text-orange-700",
  },

  TAMPERED: {
    label: "Integrity Failed",
    className:
      "bg-red-100 text-red-700",
  },

  NOT_FOUND: {
    label: "Not Found",
    className:
      "bg-gray-100 text-gray-700",
  },
};

export default function VerificationBadge({
  status,
}: VerificationBadgeProps) {
  const item = config[status];

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.className}`}
    >
      {item.label}
    </span>
  );
}