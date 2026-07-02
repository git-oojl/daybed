import ErrorMessage from "../../components/support/ErrorMessage.jsx";
import SuccessMessage from "../../components/support/SuccessMessage.jsx";

function FeedbackMessagesPage() {
  return (
    <main>
      <h1>Mensajes de error y éxito</h1>
      <section aria-labelledby="mensajes-error">
        <h2 id="mensajes-error">Mensaje de error</h2>
        <ErrorMessage />
      </section>
      <section aria-labelledby="mensajes-exito">
        <h2 id="mensajes-exito">Mensaje de éxito</h2>
        <SuccessMessage />
      </section>
      <section aria-labelledby="mensajes-informativo">
        <h2 id="mensajes-informativo">Mensaje informativo</h2>
      </section>
    </main>
  );
}

export default FeedbackMessagesPage;
