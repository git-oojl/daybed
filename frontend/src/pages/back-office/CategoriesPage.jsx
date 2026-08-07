import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowDown,
  FaArrowUp,
  FaBoxOpen,
  FaEye,
  FaImage,
  FaPen,
  FaPlus,
  FaMagnifyingGlass,
  FaToggleOff,
  FaToggleOn,
  FaXmark,
} from "react-icons/fa6";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import FeatureState from "../../components/support/FeatureState.jsx";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { routePaths } from "../../routes/routePaths.js";
import { catalogService } from "../../services/backendServices.js";

const FILTER_OPTIONS = [
  ["room", "Espacio"],
  ["furniture_type", "Tipo de mueble"],
  ["material", "Material"],
  ["color", "Color"],
  ["style", "Estilo"],
  ["has_storage", "Almacenamiento"],
  ["is_sofa_bed", "Sofá cama"],
  ["availability", "Disponibilidad"],
  ["rating", "Calificación"],
];

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  display_order: 0,
  homepage_visible: false,
  active: true,
  filter_attributes: ["room", "material", "style"],
  attributes: "",
  image: null,
};

function collectionKey(label) {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function readCollection(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useEffectiveSession();
  const viewerId = getViewerIdForUser(user);
  const isAdmin = viewerId === "admin";
  const permissionCodes = user?.effective_permission_codes || [];
  const canView = isAdmin || permissionCodes.includes("products.view");
  const canEdit = isAdmin || permissionCodes.includes("products.update");
  const canCreate = isAdmin || permissionCodes.includes("products.create");

  const [collections, setCollections] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await catalogService.manageCategories({ page_size: 100, ordering: "display_order,name" });
      setCollections(readCollection(response));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate(routePaths.account.login, { replace: true });
      return;
    }
    if (!canView) {
      navigate(routePaths.support.unauthorized, { replace: true });
      return;
    }
    loadCollections();
  }, [authLoading, isAuthenticated, canView, navigate, loadCollections]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es");
    return [...collections]
      .filter((item) => !needle || `${item.name} ${item.slug} ${item.description || ""}`.toLocaleLowerCase("es").includes(needle))
      .filter((item) => status === "all" || (status === "active" ? item.active !== false : item.active === false))
      .sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0) || a.name.localeCompare(b.name, "es"));
  }, [collections, query, status]);

  function openEditor(collection = null) {
    setError(null);
    setEditing(collection);
    setIsEditorOpen(true);
    setForm(collection ? {
      name: collection.name || "",
      slug: collection.slug || "",
      description: collection.description || "",
      display_order: collection.display_order || 0,
      homepage_visible: Boolean(collection.homepage_visible),
      active: collection.active !== false,
      filter_attributes: collection.filter_attributes || [],
      attributes: (collection.specification_schema || []).map((item) => item.label || item.key).join(", "),
      image: null,
    } : { ...EMPTY_FORM, display_order: collections.length + 1, filter_attributes: [...EMPTY_FORM.filter_attributes] });
  }

  function closeEditor() {
    setEditing(null);
    setIsEditorOpen(false);
    setForm(EMPTY_FORM);
  }

  function toggleFilterAttribute(key) {
    setForm((current) => ({
      ...current,
      filter_attributes: current.filter_attributes.includes(key)
        ? current.filter_attributes.filter((item) => item !== key)
        : [...current.filter_attributes, key],
    }));
  }

  async function submit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const attributeLabels = form.attributes.split(",").map((item) => item.trim()).filter(Boolean);
      const payload = new FormData();
      payload.append("name", form.name.trim());
      if (form.slug.trim()) payload.append("slug", form.slug.trim());
      payload.append("description", form.description.trim());
      payload.append("display_order", String(Number(form.display_order || 0)));
      payload.append("homepage_visible", String(Boolean(form.homepage_visible)));
      payload.append("active", String(Boolean(form.active)));
      payload.append("filter_attributes", JSON.stringify(form.filter_attributes));
      payload.append("specification_schema", JSON.stringify(attributeLabels.map((label) => ({
        key: collectionKey(label),
        label,
        type: "text",
        filterable: true,
      }))));
      if (form.image) payload.append("image", form.image);

      if (editing) await catalogService.updateCategory(editing.slug || editing.id, payload);
      else await catalogService.createCategory(payload);
      setEditing(null);
      setIsEditorOpen(false);
      setForm(EMPTY_FORM);
      await loadCollections();
    } catch (requestError) {
      setError(requestError);
    } finally {
      setSaving(false);
    }
  }

  async function patchCollection(collection, changes) {
    try {
      setError(null);
      await catalogService.updateCategory(collection.slug || collection.id, changes);
      setCollections((current) => current.map((item) => item.id === collection.id ? { ...item, ...changes } : item));
    } catch (requestError) {
      setError(requestError);
    }
  }

  async function move(collection, direction) {
    const ordered = [...collections].sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0));
    const index = ordered.findIndex((item) => item.id === collection.id);
    const target = ordered[index + direction];
    if (!target) return;
    await Promise.all([
      catalogService.updateCategory(collection.slug || collection.id, { display_order: target.display_order }),
      catalogService.updateCategory(target.slug || target.id, { display_order: collection.display_order }),
    ]);
    await loadCollections();
  }

  return (
    <div className="home-page dashboard-page">
      <HomeHeader />
      <PageHero
        title="Colecciones del catálogo"
        eyebrow="Catálogo interno"
        image="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1800&q=82"
        current="Colecciones"
      />

      <main className="collection-manager dashboard-container">
        <header className="collection-manager__intro">
          <div>
            <p className="section-kicker">Inicio y catálogo</p>
            <h1>Manejo de colecciones</h1>
            <p>Aquí decides qué colecciones aparecen en la portada, en qué orden se muestran y qué filtros ayudan a encontrarlas.</p>
          </div>
          {canCreate ? <button className="btn-primary" type="button" onClick={() => openEditor()}><FaPlus /> Nueva colección</button> : null}
        </header>

        <section className="collection-manager__toolbar" aria-label="Filtros de colecciones">
          <label className="collection-manager__search"><FaMagnifyingGlass /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nombre, slug o descripción" /></label>
          <label>Estado<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option><option value="active">Activas</option><option value="inactive">Inactivas</option></select></label>
          <span>{filtered.length} {filtered.length === 1 ? "colección" : "colecciones"}</span>
        </section>

        {error ? <FeatureState tone="error" compact title="No pudimos completar la acción" message={error.message || "Revisa los datos e inténtalo de nuevo."} actionLabel="Volver a cargar" onAction={loadCollections} /> : null}
        {loading ? <FeatureState tone="loading" title="Cargando colecciones" message="Estamos preparando la estructura de catálogo." /> : filtered.length ? (
          <div className="collection-table-wrap">
            <table className="collection-table">
              <thead><tr><th>Orden</th><th>Colección</th><th>Productos</th><th>Inicio</th><th>Filtros asociados</th><th>Estado</th><th aria-label="Acciones" /></tr></thead>
              <tbody>{filtered.map((collection, index) => (
                <tr key={collection.id || collection.slug}>
                  <td><div className="collection-order"><strong>{Number(collection.display_order || index + 1)}</strong>{canEdit ? <span><button type="button" onClick={() => move(collection, -1)} disabled={index === 0} aria-label={`Subir ${collection.name}`}><FaArrowUp /></button><button type="button" onClick={() => move(collection, 1)} disabled={index === filtered.length - 1} aria-label={`Bajar ${collection.name}`}><FaArrowDown /></button></span> : null}</div></td>
                  <td><div className="collection-identity"><span className="collection-identity__fallback"><FaBoxOpen /></span>{collection.image ? <img src={collection.image} alt="" onError={(event) => { event.currentTarget.remove(); }} /> : null}<div><strong>{collection.name}</strong><code>/{collection.slug}</code><small>{collection.description || "Sin descripción pública."}</small></div></div></td>
                  <td><Link className="collection-count-link" to={`${routePaths.backOffice.products}?categoria=${collection.id}`}>{collection.product_count || 0}</Link></td>
                  <td>{canEdit ? <button className={`collection-toggle ${collection.homepage_visible ? "is-on" : ""}`} type="button" onClick={() => patchCollection(collection, { homepage_visible: !collection.homepage_visible })}>{collection.homepage_visible ? <FaToggleOn /> : <FaToggleOff />}<span>{collection.homepage_visible ? "Visible" : "Oculta"}</span></button> : collection.homepage_visible ? "Visible" : "Oculta"}</td>
                  <td><div className="collection-attributes">{(collection.filter_attributes || []).slice(0, 4).map((key) => <span key={key}>{FILTER_OPTIONS.find(([value]) => value === key)?.[1] || key}</span>)}{(collection.filter_attributes || []).length > 4 ? <span>+{collection.filter_attributes.length - 4}</span> : null}</div></td>
                  <td><span className={`status-pill ${collection.active === false ? "status-pill--muted" : "status-pill--success"}`}>{collection.active === false ? "Inactiva" : "Activa"}</span></td>
                  <td><div className="collection-actions"><Link to={`${routePaths.public.catalog}?category__slug=${encodeURIComponent(collection.slug)}`} title="Abrir catálogo filtrado"><FaEye /></Link>{canEdit ? <button type="button" onClick={() => openEditor(collection)} title="Editar colección"><FaPen /></button> : null}{canEdit ? <button type="button" onClick={() => patchCollection(collection, { active: collection.active === false })} title={collection.active === false ? "Activar" : "Desactivar"}>{collection.active === false ? <FaToggleOn /> : <FaToggleOff />}</button> : null}</div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <FeatureState tone="empty" title="No encontramos colecciones" message="Prueba otro término o crea una colección para organizar el catálogo." actionLabel={canCreate ? "Crear colección" : undefined} onAction={canCreate ? () => openEditor() : undefined} />}
      </main>

      {isEditorOpen ? (
        <div className="daybed-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeEditor()}>
          <section className="daybed-modal__panel" role="dialog" aria-modal="true" aria-labelledby="collection-editor-title">
            <header><div><p className="section-kicker">Merchandising</p><h2 id="collection-editor-title">{editing ? `Editar ${editing.name}` : "Nueva colección"}</h2></div><button type="button" onClick={closeEditor} aria-label="Cerrar"><FaXmark /></button></header>
            <form onSubmit={submit} className="collection-editor">
              <div className="collection-editor__grid"><label>Nombre<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Slug<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Se genera si se deja vacío" /></label><label>Orden<input type="number" min="0" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} /></label><label>Imagen opcional<span className="file-field"><FaImage /><input type="file" accept="image/*" onChange={(event) => setForm({ ...form, image: event.target.files?.[0] || null })} /></span></label></div>
              <label>Descripción<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="3" /></label>
              <fieldset><legend>Filtros relevantes</legend><p>Solo activa dimensiones que los productos de esta colección realmente utilizan.</p><div className="collection-filter-options">{FILTER_OPTIONS.map(([key, label]) => <label key={key}><input type="checkbox" checked={form.filter_attributes.includes(key)} onChange={() => toggleFilterAttribute(key)} />{label}</label>)}</div></fieldset>
              <label>Atributos propios<textarea value={form.attributes} onChange={(event) => setForm({ ...form, attributes: event.target.value })} rows="2" placeholder="Tipo de apertura, plazas, acabado (separados por comas)" /></label>
              <div className="collection-editor__switches"><label><input type="checkbox" checked={form.homepage_visible} onChange={(event) => setForm({ ...form, homepage_visible: event.target.checked })} />Mostrar en “Navega nuestras secciones”</label><label><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />Colección activa</label></div>
              <footer><button type="button" className="btn-secondary" onClick={closeEditor}>Cancelar</button><button type="submit" className="btn-primary" disabled={saving}>{saving ? "Guardando…" : "Guardar colección"}</button></footer>
            </form>
          </section>
        </div>
      ) : null}
      <HomeFooter />
    </div>
  );
}
