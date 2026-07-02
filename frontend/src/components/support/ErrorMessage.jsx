function ErrorMessage({ message = "Ocurrió un error." }) {
  return <p role="alert">{message}</p>;
}

export default ErrorMessage;
