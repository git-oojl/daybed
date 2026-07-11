/* eslint-disable no-unused-vars */
import { useState } from "react";
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
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Storefront as StoreIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import "../../assets/CSS/account/login-page.css";
import loginBackground from "../../assets/LoginPage.jpg";

// ============================================
// ESTILOS - FUSIÓN DE AMBOS CÓDIGOS
// ============================================

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

const LogoWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    gap: theme.spacing(1),
  },
  "@media (max-width:480px)": {
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
}));

const LogoIcon = styled(StoreIcon)(({ theme }) => ({
  fontSize: 40,
  color: "#7B5D15",
  [theme.breakpoints.down("sm")]: {
    fontSize: 32,
  },
  "@media (max-width:480px)": {
    fontSize: 28,
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontSize: 34,
  fontWeight: 700,
  color: "#8c6918",
  textAlign: "center",
  letterSpacing: 1.5,
  fontFamily: '"Poppins", montserrat, sans-serif',
  [theme.breakpoints.down("sm")]: {
    fontSize: 28,
    letterSpacing: 1,
  },
  "@media (max-width:480px)": {
    fontSize: 22,
    letterSpacing: 0.5,
  },
}));

const SubtitleText = styled(Typography)(({ theme }) => ({
  fontSize: 16,
  color: "#61470c",
  textAlign: "center",
  marginBottom: theme.spacing(4),
  fontWeight: 400,
  fontFamily: '"Poppins", montserrat, sans-serif',
  [theme.breakpoints.down("sm")]: {
    fontSize: 14,
    marginBottom: theme.spacing(3),
  },
  "@media (max-width:480px)": {
    fontSize: 13,
    marginBottom: theme.spacing(2),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),

  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    backgroundColor: "#FEFCF8",
    transition: "border-color 0.2s ease",
    "& fieldset": {
      borderColor: "#D4C5B2",
    },
    "&:hover fieldset": {
      borderColor: "#8B6B4C",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#8B6B4C",
      borderWidth: 2,
    },
    "&.Mui-error fieldset": {
      borderColor: "#C0392B",
    },
  },

  "& .MuiInputLabel-root": {
    color: "#61470c",
    fontWeight: 500,
    fontFamily: '"Poppins", montserrat, sans-serif',
    "&.Mui-focused": {
      color: "#8B6B4C",
    },
    "&.Mui-error": {
      color: "#C0392B",
    },
  },

  "& .MuiInputLabel-shrink": {
    fontWeight: 600,
  },

  "& .MuiFormHelperText-root": {
    marginLeft: 0,
    fontWeight: 400,
    color: "#C0392B",
    fontFamily: '"Poppins", montserrat, sans-serif',
  },

  "& .MuiInputBase-input": {
    fontFamily: '"Poppins", montserrat, sans-serif',
  },

  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  "@media (max-width:480px)": {
    marginBottom: theme.spacing(1.5),

    "& .MuiInputBase-input": {
      fontSize: 15,
      padding: "13px",
    },

    "& .MuiInputLabel-root": {
      fontSize: 14,
    },

    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
    },
  },
}));

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

const LinksContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  flexWrap: "wrap",
  gap: theme.spacing(1),

  "@media (max-width:480px)": {
    flexDirection: "column",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
  },
}));

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

const RegisterWrapper = styled(Box)(({ theme }) => ({
  textAlign: "center",

  "& .MuiTypography-root": {
    color: "#61470c",
    fontSize: 15,
    fontFamily: '"Poppins", montserrat, sans-serif',

    "@media (max-width:480px)": {
      fontSize: 13,
    },
  },
}));

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

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

          <LoginButton type="submit" disabled={!isFormValid}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </LoginButton>
        </form>

        <LinksContainer>
          <ForgotLink href="#" underline="hover">
            ¿Olvidaste tu contraseña?
          </ForgotLink>
        </LinksContainer>

        <DividerStyled>
          <Typography variant="body2" color="#7A6B5A">
            o
          </Typography>
        </DividerStyled>

        <RegisterWrapper>
          <Typography variant="body1">
            ¿No tienes cuenta?{" "}
            <RegisterLink href="/crear-cuenta" underline="hover">
              Regístrate
            </RegisterLink>
          </Typography>
        </RegisterWrapper>
      </Paper>
    </Box>
  );
}

export default LoginPage;