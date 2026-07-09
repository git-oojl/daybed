// LoginPage.jsx
import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  // eslint-disable-next-line no-unused-vars
  Button,
  Link,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Storefront as StoreIcon,
} from "@mui/icons-material";
import "../../assets/CSS/account/login-page.css"; // ← Importar CSS
import loginBackground from "../../assets/LoginPage.jpg";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "ejemplo01@email.com",
    password: "12345",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 4;
  };

  const isEmailValid = validateEmail(formData.email);
  const isPasswordValid = validatePassword(formData.password);
  const isFormValid = isEmailValid && isPasswordValid && !loading;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(formData.email)) {
      setError("Por favor, ingresa un correo electrónico válido");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (
        formData.email === "ejemplo01@email.com" &&
        formData.password === "12345"
      ) {
        console.log("Login exitoso");
        window.location.href = "/dashboard";
      } else {
        setError("Correo o contraseña incorrectos");
      }
      setLoading(false);
    }, 1500);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const showEmailError =
    touched.email && !isEmailValid && formData.email !== "";
  const showPasswordError =
    touched.password && !isPasswordValid && formData.password !== "";

  return (
    <Box
      className="login-container"
      sx={{ backgroundImage: `url(${loginBackground})` }}
    >
      <Paper className="login-paper" elevation={0}>
        <Box className="login-logo-wrapper">
          <StoreIcon className="login-logo-icon" />
          <Typography className="login-logo-text" variant="h1">
            DayBed
          </Typography>
        </Box>

        <Typography className="login-subtitle" variant="body1">
          Iniciar sesión
        </Typography>

        {error && (
          <Alert className="login-alert" severity="error">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            className="login-text-field"
            fullWidth
            label="Correo electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="ejemplo01@email.com"
            error={showEmailError}
            helperText={showEmailError ? "Ingresa un correo válido" : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon
                    sx={{ color: showEmailError ? "#C0392B" : "#61470c" }}
                  />
                </InputAdornment>
              ),
            }}
            required
            autoComplete="email"
          />

          <TextField
            className="login-text-field"
            fullWidth
            label="Contraseña"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="12345"
            error={showPasswordError}
            helperText={
              showPasswordError
                ? "La contraseña debe tener al menos 4 caracteres"
                : ""
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon
                    sx={{ color: showPasswordError ? "#C0392B" : "#61470c" }}
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePassword}
                    edge="end"
                    sx={{ color: "#61470c" }}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            required
            autoComplete="current-password"
          />

          <button
            className="login-button"
            type="submit"
            disabled={!isFormValid}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <Box className="login-links-container">
          <Link className="login-forgot-link" href="#" underline="hover">
            ¿Olvidaste tu contraseña?
          </Link>
        </Box>

        <Divider className="login-divider">
          <Typography variant="body2" color="#7A6B5A">
            o
          </Typography>
        </Divider>

        <Box className="login-register-wrapper">
          <Typography variant="body1">
            ¿No tienes cuenta?{" "}
            <Link
              className="login-register-link"
              href="/crear-cuenta"
              underline="hover"
            >
              Regístrate
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginPage;
