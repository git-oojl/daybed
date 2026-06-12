import EmptyState from '../../components/support/EmptyState.jsx'

function EmptyStatesPage() {
  return (
    <main>
      <h1>Estados vacíos</h1>
      <section aria-labelledby="estados-vacios-general">
        <h2 id="estados-vacios-general">Estado vacío general</h2>
        <EmptyState />
      </section>
      <section aria-labelledby="estados-vacios-busqueda">
        <h2 id="estados-vacios-busqueda">Estado vacío de búsqueda</h2>
      </section>
      <section aria-labelledby="estados-vacios-lista">
        <h2 id="estados-vacios-lista">Estado vacío de lista</h2>
      </section>
    </main>
  )
}

export default EmptyStatesPage
