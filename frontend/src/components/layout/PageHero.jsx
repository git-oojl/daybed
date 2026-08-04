import { Link } from "react-router-dom";
import { routePaths } from "../../routes/routePaths.js";

export default function PageHero({
  title,
  current = title,
  image,
  eyebrow,
  className = "",
  children,
}) {
  return (
    <section
      className={`page-hero ${className}`.trim()}
      style={image ? { backgroundImage: `url(${image})` } : undefined}
      aria-label={title}
    >
      <div className="page-hero__veil" />
      <div className="page-hero__inner">
        {eyebrow ? <p className="page-hero__eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <nav className="page-hero__breadcrumb" aria-label="Miga de pan">
          <Link to={routePaths.public.home}>Inicio</Link>
          <span aria-hidden="true">/</span>
          <span>{current}</span>
        </nav>
        {children}
      </div>
    </section>
  );
}
