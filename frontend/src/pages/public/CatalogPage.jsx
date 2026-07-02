function CatalogPage() {
  return (
    <main>
      <h1>Catálogo</h1>
      <section aria-labelledby="catalogo-buscador">
        <h2 id="catalogo-buscador">Buscador</h2>
      </section>
      <section aria-labelledby="catalogo-filtros">
        <h2 id="catalogo-filtros">Filtros</h2>
      </section>
      <section aria-labelledby="catalogo-lista-de-productos">
        <h2 id="catalogo-lista-de-productos">Lista de productos</h2>
      </section>
      <section aria-labelledby="catalogo-estado-vacio-si-no-hay-resultados">
        <h2 id="catalogo-estado-vacio-si-no-hay-resultados">
          Estado vacío si no hay resultados
        </h2>
      </section>
    </main>
  );
}

export default CatalogPage;
