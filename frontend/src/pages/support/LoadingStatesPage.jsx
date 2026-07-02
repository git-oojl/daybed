import LoadingState from "../../components/support/LoadingState.jsx";

function LoadingStatesPage() {
  return (
    <main>
      <h1>Estados de carga</h1>
      <section aria-labelledby="estados-de-carga-general">
        <h2 id="estados-de-carga-general">Estado de carga general</h2>
        <LoadingState />
      </section>
      <section aria-labelledby="estados-de-carga-lista">
        <h2 id="estados-de-carga-lista">Estado de carga de lista</h2>
      </section>
      <section aria-labelledby="estados-de-carga-formulario">
        <h2 id="estados-de-carga-formulario">Estado de carga de formulario</h2>
      </section>
    </main>
  );
}

export default LoadingStatesPage;
