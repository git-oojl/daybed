import { useEffect, useMemo, useState } from "react";

function initialsFor(user, label) {
  const source = label || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || user?.email || "Daybed";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "D";
}

export default function Avatar({ user, src, label, size = "md", className = "" }) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = src || user?.avatar || user?.profile_image || "";
  const initials = useMemo(() => initialsFor(user, label), [label, user]);

  useEffect(() => {
    setFailed(false);
  }, [resolvedSrc]);

  return (
    <span
      className={`daybed-avatar daybed-avatar--${size}${className ? ` ${className}` : ""}`}
      aria-label={label || `Avatar de ${initials}`}
      role="img"
    >
      {resolvedSrc && !failed ? (
        <img alt="" src={resolvedSrc} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
