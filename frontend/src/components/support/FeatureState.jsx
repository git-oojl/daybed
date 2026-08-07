import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCircleNotch,
  FaCloudArrowDown,
  FaLock,
  FaMapLocationDot,
  FaRegFolderOpen,
  FaTriangleExclamation,
} from "react-icons/fa6";

const ICONS = {
  loading: FaCircleNotch,
  empty: FaRegFolderOpen,
  auth: FaLock,
  map: FaMapLocationDot,
  network: FaCloudArrowDown,
  error: FaTriangleExclamation,
};

export default function FeatureState({
  tone = "empty",
  eyebrow,
  title,
  message,
  actionLabel,
  actionTo,
  onAction,
  secondaryLabel,
  secondaryTo,
  compact = false,
  children,
}) {
  const Icon = ICONS[tone] || ICONS.error;
  const action = actionTo ? (
    <Link className="feature-state__primary" to={actionTo}>{actionLabel}<FaArrowRight /></Link>
  ) : onAction ? (
    <button className="feature-state__primary" type="button" onClick={onAction}>{actionLabel}<FaArrowRight /></button>
  ) : null;

  return (
    <section className={`feature-state feature-state--${tone}${compact ? " feature-state--compact" : ""}`} role={tone === "error" || tone === "auth" ? "alert" : "status"}>
      <span className={`feature-state__icon${tone === "loading" ? " feature-state__icon--spin" : ""}`}><Icon /></span>
      <div className="feature-state__copy">
        {eyebrow ? <p>{eyebrow}</p> : null}
        <h2>{title}</h2>
        <div>{message}</div>
      </div>
      {children}
      {action || secondaryTo ? (
        <div className="feature-state__actions">
          {action}
          {secondaryTo ? <Link className="feature-state__secondary" to={secondaryTo}>{secondaryLabel}</Link> : null}
        </div>
      ) : null}
    </section>
  );
}
