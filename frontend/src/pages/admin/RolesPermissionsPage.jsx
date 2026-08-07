import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaCrown, FaKey, FaRotateLeft, FaShieldHalved, FaUserGear, FaUsers } from "react-icons/fa6";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { routePaths } from "../../routes/routePaths.js";
import { accessService, accountService } from "../../services/backendServices.js";
import { readCollection } from "../../services/viewMappers.js";

const HERO = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1800&q=82";

export default function RolesPermissionsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useEffectiveSession();
  const [employees, setEmployees] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [defaultCodes, setDefaultCodes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const [roleResponse, usersResponse] = await Promise.all([accessService.roles(), accountService.users()]);
      const roleRows = roleResponse?.roles || [];
      const employeeRole = roleRows.find((role) => role.id === "empleado");
      const people = readCollection(usersResponse).filter((person) => person.role === "empleado" && person.is_active !== false);
      setCatalog(roleResponse?.permission_catalog || []);
      setDefaultCodes(employeeRole?.permission_codes || []);
      setEmployees(people);
      setSelectedId((current) => current || String(people[0]?.id || ""));
    } catch (err) { setError(err.message || "No pudimos cargar los accesos del equipo."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) return navigate(routePaths.account.login);
    if (!authLoading && isAuthenticated && getViewerIdForUser(user) !== "admin") return navigate(routePaths.support.unauthorized);
    if (!authLoading && isAuthenticated) load();
  }, [authLoading, isAuthenticated, load, navigate, user]);

  const selected = useMemo(() => employees.find((employee) => String(employee.id) === String(selectedId)), [employees, selectedId]);
  useEffect(() => {
    if (selected) setCodes(selected.operational_permission_codes ?? selected.effective_permission_codes ?? defaultCodes);
  }, [defaultCodes, selected]);

  const grouped = useMemo(() => catalog.reduce((groups, permission) => {
    (groups[permission.category] ||= []).push(permission);
    return groups;
  }, {}), [catalog]);

  function toggle(code) {
    setCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
    setNotice("");
  }

  async function save(override = codes) {
    if (!selected) return;
    try {
      setSaving(true); setError(""); setNotice("");
      const updated = await accountService.updateUser(selected.id, { operational_permission_codes: override });
      setEmployees((current) => current.map((employee) => employee.id === updated.id ? updated : employee));
      setCodes(updated.operational_permission_codes ?? updated.effective_permission_codes ?? defaultCodes);
      setNotice(override === null ? "Se restauró la plantilla general para este empleado." : "Los accesos individuales quedaron guardados.");
    } catch (err) { setError(err.message || "No fue posible guardar los accesos."); }
    finally { setSaving(false); }
  }

  return (
    <div className="home-page team-access-v2">
      <HomeHeader />
      <PageHero title="Accesos del equipo" eyebrow="Administración" image={HERO} current="Accesos" />
      <main className="team-access-v2__main">
        <section className="team-access-v2__intro">
          <div><p className="section-kicker">Control con sentido</p><h2>Permisos por empleado</h2><p>Los administradores conservan acceso completo. Aquí se ajusta únicamente lo que cada empleado puede consultar o modificar.</p></div>
          <article><FaCrown /><div><strong>Administrador</strong><span>Acceso completo y protegido; no se puede degradar desde esta pantalla.</span></div></article>
        </section>

        {error ? <div className="inline-notice inline-notice--error">{error}<button onClick={load}>Volver a cargar accesos</button></div> : null}
        {notice ? <div className="inline-notice inline-notice--success"><FaCheck /> {notice}</div> : null}

        {loading || authLoading ? <section className="state-card"><span className="state-card__icon"><FaShieldHalved /></span><h2>Cargando accesos</h2><p>Consultando empleados y permisos operativos.</p></section> : employees.length ? (
          <section className="team-access-v2__workspace">
            <aside>
              <header><FaUsers /><div><p>Equipo activo</p><h3>Selecciona una persona</h3></div></header>
              <div className="team-access-v2__people">{employees.map((employee) => { const name = `${employee.first_name || ""} ${employee.last_name || ""}`.trim() || employee.username || employee.email; return <button className={String(employee.id) === String(selectedId) ? "is-active" : ""} key={employee.id} onClick={() => setSelectedId(String(employee.id))}><span>{name.slice(0, 1).toUpperCase()}</span><div><strong>{name}</strong><small>{employee.email}</small></div></button>; })}</div>
            </aside>

            <div className="team-access-v2__permissions">
              <header><div><p className="section-kicker">Configuración individual</p><h3>{selected ? `${selected.first_name || ""} ${selected.last_name || ""}`.trim() || selected.email : "Empleado"}</h3><span>{selected?.operational_permission_codes == null ? "Usa la plantilla general de empleado" : "Tiene una configuración personalizada"}</span></div><div><button className="ghost-action" onClick={() => save(null)} disabled={saving}><FaRotateLeft /> Usar plantilla</button><button className="solid-action" onClick={() => save(codes)} disabled={saving}><FaKey /> {saving ? "Guardando..." : "Guardar accesos"}</button></div></header>
              <div className="team-access-v2__groups">{Object.entries(grouped).map(([category, permissions]) => <section key={category}><h4>{category}</h4>{permissions.map((permission) => <label key={permission.code} className={codes.includes(permission.code) ? "is-enabled" : ""}><input type="checkbox" checked={codes.includes(permission.code)} onChange={() => toggle(permission.code)} /><span className="team-access-v2__check"><FaCheck /></span><div><strong>{permission.label}</strong><small>{permission.description}</small></div></label>)}</section>)}</div>
            </div>
          </section>
        ) : <section className="state-card"><span className="state-card__icon"><FaUserGear /></span><h2>No hay empleados activos</h2><p>Crea o activa una cuenta de empleado para asignarle accesos individuales.</p><button onClick={() => navigate(routePaths.admin.rolesPermissions)}>Gestionar accesos</button></section>}
      </main>
      <HomeFooter />
    </div>
  );
}
