// LoginPage.jsx
import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  FaEnvelope as EmailIcon,
  FaEye as Visibility,
  FaEyeSlash as VisibilityOff,
  FaLock as LockIcon,
  FaStore as StoreIcon,
} from "react-icons/fa";
import { styled } from "@mui/material/styles";
import "../../assets/CSS/account/login-page.css";
import loginBackground from "../../assets/LoginPage.webp";
import { useAuthStore } from "../../auth/authStore.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { usePreviewSession } from "../../dev-preview/usePreviewSession.js";
import { routePaths } from "../../routes/routePaths.js";

// ============================================
// ESTILOS - SOLO LOS QUE SE USAN
// ============================================

// ✅ LoginContainer - SE USA en el JSX
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(4),
  boxSizing: "border-box",
  backgroundImage: `url(${loginBackground})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "fixed",
  right: 0,
  left: 0,
  top: 0,

  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(3),
  },

  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100dvh",
  },

  "@media (max-width:480px)": {
    padding: theme.spacing(2),
    alignItems: "center",
    justifyContent: "center",
  },
}));

// ✅ LoginPaper - SE USA en el JSX
const LoginPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: 440,
  padding: theme.spacing(5),
  borderRadius: 20,
  boxShadow: "0 8px 40px rgba(74,53,32,0.2)",
  backgroundColor: "#FFF3E3",
  border: "1px solid #E8DCCC",
  position: "relative",
  zIndex: 1,
  backdropFilter: "blur(2px)",

  [theme.breakpoints.down("md")]: {
    width: "85%",
    maxWidth: 430,
  },

  [theme.breakpoints.down("sm")]: {
    alignItems: "center",
    justifyContent: "center",
  },

  "@media (max-width:480px)": {
    width: "95%",
    maxWidth: 360,
    padding: theme.spacing(2.5),
    borderRadius: 16,
  },
}));

// ✅ LoginButton - SE USA en el JSX
const LoginButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#977422",
  color: "#FFFFFF",
  padding: theme.spacing(1.6),
  borderRadius: 12,
  fontSize: 16,
  fontWeight: 600,
  textTransform: "none",
  fontFamily: '"Poppins", montserrat, sans-serif',
  transition: "background-color 0.3s ease, transform 0.2s ease",
  boxShadow: "0 4px 12px #b88f2f84",
  width: "100%",

  "&:hover": {
    backgroundColor: "#7a5d1a",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px #8b6b4c59",
  },

  "&:active": {
    transform: "translateY(0)",
  },

  "&:disabled": {
    backgroundColor: "#D4C5B2",
    boxShadow: "none",
    transform: "none",
    color: "#A09080",
  },

  "@media (max-width:480px)": {
    padding: theme.spacing(1.2),
    fontSize: 14,
  },
}));

// ✅ ForgotLink - SE USA en el JSX
const ForgotLink = styled(Link)(({ theme }) => ({
  color: "#8B6B4C",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  textDecoration: "none",
  fontFamily: '"Poppins", montserrat, sans-serif !important',
  transition: "color 0.2s ease",
  padding: theme.spacing(0.5),

  "&:hover": {
    color: "#6B4F3A",
    textDecoration: "underline",
  },

  "@media (max-width:480px)": {
    fontSize: 13,
  },
}));

// ✅ RegisterLink - SE USA en el JSX
const RegisterLink = styled(Link)(({ theme }) => ({
  color: "#8B6B4C",
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
  fontFamily: '"Poppins", montserrat, sans-serif',
  padding: theme.spacing(0.5),
  transition: "color 0.2s ease",

  "&:hover": {
    color: "#6B4F3A",
    textDecoration: "underline",
  },
}));

// ✅ DividerStyled - SE USA en el JSX
const DividerStyled = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(3, 0),

  "&::before, &::after": {
    borderColor: "#D4C5B2",
  },

  "& .MuiDivider-wrapper": {
    color: "#61470c",
    fontSize: 14,
    fontWeight: 400,
    fontFamily: '"Poppins", montserrat, sans-serif',
  },

  "@media (max-width:480px)": {
    margin: theme.spacing(2, 0),
    "& .MuiDivider-wrapper": {
      fontSize: 12,
    },
  },
}));

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromLocation = location.state?.from;
  const intendedPath = fromLocation?.pathname
    ? `${fromLocation.pathname}${fromLocation.search || ""}`
    : null;
  const backPath = intendedPath || routePaths.public.home;
  const {
    login,
    isLoading,
    error: authError,
    isAuthenticated,
    user,
  } = useAuthStore();
  const previewSession = usePreviewSession();
  const previewAuthenticated =
    previewSession.isPreview && previewSession.isAuthenticated;
  const alreadyAuthenticated = isAuthenticated || previewAuthenticated;
  const activeUser = previewAuthenticated ? previewSession.user : user;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const isEmailValid = validateEmail(formData.email);
  const isPasswordValid = validatePassword(formData.password);
  const isFormDisabled =
    isLoading || previewSession.isPreview || isAuthenticated;
  const isFormValid = isEmailValid && isPasswordValid && !isFormDisabled;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setLocalError("");
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
  };

  // LoginPage.jsx - CORRECCIÓN DE REDIRECCIÓN
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!validateEmail(formData.email)) {
      setLocalError("Por favor, ingresa un correo electrónico válido");
      return;
    }

    if (!validatePassword(formData.password)) {
      setLocalError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      const session = await login(formData);
      const viewerId = getViewerIdForUser(session?.user);

      if (intendedPath && !intendedPath.startsWith(routePaths.account.login)) {
        navigate(intendedPath, { replace: true });
      } else if (viewerId === "admin") {
        navigate(routePaths.admin.businessMetrics, { replace: true });
      } else if (viewerId === "employee") {
        navigate(routePaths.backOffice.dashboard, { replace: true });
      } else {
        navigate(routePaths.public.home, { replace: true });
      }
    } catch (error) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        "Correo o contraseña incorrectos";
      setLocalError(errorMessage);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const showEmailError =
    touched.email && !isEmailValid && formData.email !== "";
  const showPasswordError =
    touched.password && !isPasswordValid && formData.password !== "";

  const displayError =
    localError || location.state?.sessionMessage || authError?.message;

  return (
    <LoginContainer className="login-container">
      <RouterLink className="auth-back-link" to={backPath}>
        ← Volver
      </RouterLink>
      <LoginPaper elevation={0}>
        {/* Logo - Usando clases CSS */}
        <Box className="login-logo-wrapper">
          <StoreIcon className="login-logo-icon" />
          <Typography className="login-logo-text" variant="h1">
            Daybed
          </Typography>
        </Box>

        <Typography className="login-subtitle" variant="body1">
          Iniciar sesión
        </Typography>

        {previewSession.isPreview && !alreadyAuthenticated && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              borderRadius: 12,
              backgroundColor: "#F7EFE5",
              border: "1px solid #E8DCCC",
              "& .MuiAlert-message": {
                color: "#4A3520",
                fontFamily: '"Poppins", montserrat, sans-serif',
              },
            }}
          >
            En preview, el selector de desarrollo controla la sesión. El
            formulario se muestra desactivado para que puedas revisar su diseño
            sin enviar credenciales.
          </Alert>
        )}

        {alreadyAuthenticated && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              borderRadius: 12,
              backgroundColor: "#F7EFE5",
              border: "1px solid #E8DCCC",
              "& .MuiAlert-message": {
                color: "#4A3520",
                fontFamily: '"Poppins", montserrat, sans-serif',
              },
            }}
          >
            Ya tienes una sesión activa
            {activeUser?.first_name ? ` como ${activeUser.first_name}` : ""}. El
            formulario permanece visible para que puedas revisar esta pantalla
            sin cerrar sesión.
          </Alert>
        )}

        {alreadyAuthenticated && (
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate(routePaths.account.profile)}
            sx={{
              mb: 2,
              borderRadius: 3,
              borderColor: "#8B6B4C",
              color: "#6B4F3A",
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Ir a mi cuenta
          </Button>
        )}

        {displayError && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 12,
              backgroundColor: "#FDF2F0",
              border: "1px solid #F5D0CC",
              "& .MuiAlert-icon": { color: "#C0392B" },
              "& .MuiAlert-message": {
                color: "#4A3520",
                fontFamily: '"Poppins", montserrat, sans-serif',
              },
            }}
          >
            {displayError}
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
            placeholder="correo@ejemplo.com"
            error={showEmailError}
            helperText={showEmailError ? "Ingresa un correo válido" : ""}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon
                      style={{ color: showEmailError ? "#C0392B" : "#61470c" }}
                    />
                  </InputAdornment>
                ),
              },
            }}
            required
            disabled={isFormDisabled}
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
            placeholder="••••••••"
            error={showPasswordError}
            helperText={
              showPasswordError
                ? "La contraseña debe tener al menos 8 caracteres"
                : ""
            }
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon
                      style={{
                        color: showPasswordError ? "#C0392B" : "#61470c",
                      }}
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
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            required
            disabled={isFormDisabled}
            autoComplete="current-password"
          />

          <LoginButton type="submit" disabled={!isFormValid}>
            {previewAuthenticated
              ? "Sesión preview activa"
              : isLoading
                ? "Iniciando sesión..."
                : "Iniciar sesión"}
          </LoginButton>
        </form>

        <Box className="login-links-container">
          <ForgotLink
            href={routePaths.account.forgotPassword}
            underline="hover"
          >
            ¿Olvidaste tu contraseña?
          </ForgotLink>
        </Box>

        <DividerStyled>
          <Typography variant="body2" color="#7A6B5A">
            o
          </Typography>
        </DividerStyled>

        <Box className="login-register-wrapper">
          <Typography variant="body1">
            ¿No tienes cuenta?{" "}
            <RegisterLink href={routePaths.account.register} underline="hover">
              Regístrate
            </RegisterLink>
          </Typography>
        </Box>
      </LoginPaper>
    </LoginContainer>
  );
}

export default LoginPage;
