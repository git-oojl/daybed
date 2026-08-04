import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  FaEye as Visibility,
  FaEyeSlash as VisibilityOff,
  FaLock as LockIcon,
  FaStore as StoreIcon,
} from "react-icons/fa";
import "../../assets/CSS/account/login-page.css";
import loginBackground from "../../assets/LoginPage.webp";
import { routePaths } from "../../routes/routePaths.js";
import { accountService } from "../../services/backendServices.js";

const PageContainer = styled(Box)(({ theme }) => ({
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
}));

const AccountPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: 440,
  padding: theme.spacing(5),
  borderRadius: 20,
  boxShadow: "0 8px 40px rgba(74,53,32,0.2)",
  backgroundColor: "#FFF3E3",
  border: "1px solid #E8DCCC",
  position: "relative",
  zIndex: 1,
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#977422",
  color: "#FFFFFF",
  padding: theme.spacing(1.6),
  borderRadius: 12,
  fontSize: 16,
  fontWeight: 600,
  textTransform: "none",
  fontFamily: '"Poppins", montserrat, sans-serif',
  width: "100%",
  "&:hover": {
    backgroundColor: "#7a5d1a",
  },
}));

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const missingToken = !uid || !token;
  const passwordsMatch =
    formData.new_password &&
    formData.new_password === formData.confirm_password;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await accountService.confirmPasswordReset({
        uid,
        token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });
      setMessage("Contraseña actualizada. Ya puedes iniciar sesión.");
    } catch (err) {
      setError(err.message || "No se pudo restablecer la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <AccountPaper elevation={0}>
        <Box className="login-logo-wrapper">
          <StoreIcon className="login-logo-icon" />
          <Typography className="login-logo-text" variant="h1">
            DayBed
          </Typography>
        </Box>

        <Typography className="login-subtitle" variant="body1">
          Nueva contraseña
        </Typography>

        {missingToken && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            El enlace de restablecimiento no es válido.
          </Alert>
        )}
        {message && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            className="login-text-field"
            fullWidth
            label="Nueva contraseña"
            name="new_password"
            type={showPassword ? "text" : "password"}
            value={formData.new_password}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon style={{ color: "#61470c" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((current) => !current)}
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
            autoComplete="new-password"
          />

          <TextField
            className="login-text-field"
            fullWidth
            label="Confirmar contraseña"
            name="confirm_password"
            type={showPassword ? "text" : "password"}
            value={formData.confirm_password}
            onChange={handleChange}
            placeholder="Repite tu contraseña"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon style={{ color: "#61470c" }} />
                </InputAdornment>
              ),
            }}
            required
            autoComplete="new-password"
          />

          <PrimaryButton
            type="submit"
            disabled={loading || missingToken || !passwordsMatch}
          >
            {loading ? "Guardando..." : "Guardar contraseña"}
          </PrimaryButton>
        </form>

        <Box className="login-links-container">
          <Link
            component="button"
            type="button"
            onClick={() => navigate(routePaths.account.login)}
            underline="hover"
          >
            Ir a iniciar sesión
          </Link>
        </Box>
      </AccountPaper>
    </PageContainer>
  );
}

export default ResetPasswordPage;
