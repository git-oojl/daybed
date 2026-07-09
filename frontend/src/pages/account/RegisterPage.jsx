// RegisterPage.jsx - VERSIÓN CON CSS EXTERNO (CORREGIDO)
import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Checkbox,
  FormControlLabel,
  Alert,
  InputAdornment,
  IconButton,
  MenuItem,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Storefront as StoreIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationCity as CityIcon,
  PinDrop as PinDropIcon,
} from "@mui/icons-material";
import "../../assets/CSS/account/register-page.css"; // ← Importamos el CSS
import registerBackground from "../../assets/RegisterPage.jpg";

// ============================================
// PALETA DE COLORES DAYBED (Terrosos/Beige)
// ============================================
const COLORS = {
  primary: "#977422",
  primaryDark: "#7a5d1a",
  primaryLight: "#8c6918",
  secondary: "#61470c",
  textSecondary: "#7A6B5A",
  background: "#FFF3E3",
  inputBg: "#FEFCF8",
  border: "#D4C5B2",
  error: "#C0392B",
  white: "#FFFFFF",
  label: "#5A4A3A",
};

// ============================================
// DATOS - ESTADOS DE MÉXICO
// ============================================
const ESTADOS_MEXICO = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    estado: "",
    ciudad: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aceptTerms, setAceptTerms] = useState(false);
  const [touched, setTouched] = useState({});

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/\s/g, ""));
  };

  const isFormValid = () => {
    return (
      formData.nombre.trim() !== "" &&
      formData.apellido.trim() !== "" &&
      validateEmail(formData.email) &&
      validatePhone(formData.telefono) &&
      formData.estado !== "" &&
      formData.ciudad.trim() !== "" &&
      validatePassword(formData.password) &&
      formData.password === formData.confirmPassword &&
      aceptTerms
    );
  };

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

    if (!aceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      console.log("Registro exitoso", formData);
      setLoading(false);
      window.location.href = "/login";
    }, 1500);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const showEmailError =
    touched.email && !validateEmail(formData.email) && formData.email !== "";
  const showPasswordError =
    touched.password &&
    !validatePassword(formData.password) &&
    formData.password !== "";
  const showConfirmError =
    touched.confirmPassword &&
    formData.confirmPassword !== "" &&
    formData.password !== formData.confirmPassword;
  const showPhoneError =
    touched.telefono &&
    !validatePhone(formData.telefono) &&
    formData.telefono !== "";

  return (
    <Box
      className="register-container"
      sx={{ backgroundImage: `url(${registerBackground})` }}
    >
      <Paper className="register-paper" elevation={0}>
        {/* BRAND SECTION */}
        <Box className="register-brand">
          <StoreIcon className="register-brand-icon" />
          <Typography className="register-brand-title" variant="h1">
            DayBed
          </Typography>
        </Box>

        {/* DIVIDER */}
        <Box className="register-divider" />

        {/* TÍTULOS */}
        <Typography className="register-title" variant="h2">
          Crear cuenta
        </Typography>
        <Typography className="register-subtitle" variant="body2">
          Completa tus datos para registrarte
        </Typography>

        {error && (
          <Alert className="register-alert" severity="error">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* NOMBRE */}
          <Box className="register-form-group">
            <Typography className="register-form-label" variant="body2">
              Nombre completo:
            </Typography>
            <TextField
              className="register-text-field"
              fullWidth
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Juan Pérez"
              error={touched.nombre && formData.nombre === ""}
              helperText={
                touched.nombre && formData.nombre === "" ? "Requerido" : ""
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon
                      sx={{ color: COLORS.secondary, fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              }}
              required
            />
          </Box>

          {/* CORREO ELECTRÓNICO */}
          <Box className="register-form-group">
            <Typography className="register-form-label" variant="body2">
              Correo electrónico:
            </Typography>
            <TextField
              className="register-text-field"
              fullWidth
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="ejemplo@email.com"
              error={showEmailError}
              helperText={showEmailError ? "Correo inválido" : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon
                      sx={{
                        color: showEmailError ? COLORS.error : COLORS.secondary,
                        fontSize: 20,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              required
              autoComplete="email"
            />
          </Box>

          {/* TELÉFONO */}
          <Box className="register-form-group">
            <Typography className="register-form-label" variant="body2">
              Teléfono:
            </Typography>
            <TextField
              className="register-text-field"
              fullWidth
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="5512345678"
              error={showPhoneError}
              helperText={showPhoneError ? "10 dígitos" : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon
                      sx={{
                        color: showPhoneError ? COLORS.error : COLORS.secondary,
                        fontSize: 20,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              required
              autoComplete="tel"
            />
          </Box>

          {/* ESTADO */}
          <Box className="register-form-group">
            <Typography className="register-form-label" variant="body2">
              Estado:
            </Typography>
            <TextField
              className="register-text-field"
              fullWidth
              select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.estado && formData.estado === ""}
              helperText={
                touched.estado && formData.estado === "" ? "Selecciona" : ""
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PinDropIcon
                      sx={{ color: COLORS.secondary, fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              }}
              required
            >
              <MenuItem value="" disabled>
                Selecciona un estado
              </MenuItem>
              {ESTADOS_MEXICO.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* CIUDAD */}
          <Box className="register-form-group">
            <Typography className="register-form-label" variant="body2">
              Ciudad:
            </Typography>
            <TextField
              className="register-text-field"
              fullWidth
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Tijuana"
              error={touched.ciudad && formData.ciudad === ""}
              helperText={
                touched.ciudad && formData.ciudad === "" ? "Requerida" : ""
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CityIcon sx={{ color: COLORS.secondary, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              required
            />
          </Box>

          {/* CONTRASEÑA */}
          <Box className="register-form-group">
            <Typography className="register-form-label" variant="body2">
              Contraseña:
            </Typography>
            <Box className="register-password-wrapper">
              <TextField
                className="register-text-field"
                fullWidth
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Mínimo 6 caracteres"
                error={showPasswordError}
                helperText={showPasswordError ? "Mínimo 6 caracteres" : ""}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon
                        sx={{
                          color: showPasswordError
                            ? COLORS.error
                            : COLORS.secondary,
                          fontSize: 20,
                        }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        sx={{ color: COLORS.secondary }}
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
                autoComplete="new-password"
              />
            </Box>
          </Box>

          {/* CONFIRMAR CONTRASEÑA */}
          <Box className="register-form-group">
            <Typography className="register-form-label" variant="body2">
              Confirmar contraseña:
            </Typography>
            <Box className="register-password-wrapper">
              <TextField
                className="register-text-field"
                fullWidth
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Repite tu contraseña"
                error={showConfirmError}
                helperText={showConfirmError ? "No coinciden" : ""}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon
                        sx={{
                          color: showConfirmError
                            ? COLORS.error
                            : COLORS.secondary,
                          fontSize: 20,
                        }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleToggleConfirmPassword}
                        edge="end"
                        sx={{ color: COLORS.secondary }}
                        aria-label={
                          showConfirmPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
                autoComplete="new-password"
              />
            </Box>
          </Box>

          {/* TÉRMINOS Y CONDICIONES */}
          <FormControlLabel
            className="register-checkbox"
            control={
              <Checkbox
                checked={aceptTerms}
                onChange={(e) => setAceptTerms(e.target.checked)}
                required
              />
            }
            label="Acepto términos y condiciones"
          />

          {/* BOTÓN CREAR CUENTA */}
          <Button
            className="register-button"
            type="submit"
            disabled={!isFormValid() || loading}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>

        {/* FOOTER */}
        <Box className="register-footer">
          <Typography variant="body1">
            ¿Ya tienes una cuenta?{" "}
            <Link
              className="register-footer-link"
              href="/login"
              underline="hover"
            >
              Inicia sesión
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default RegisterPage;
