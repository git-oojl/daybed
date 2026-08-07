import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FaEnvelope as EmailIcon, FaStore as StoreIcon } from "react-icons/fa";
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

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await accountService.requestPasswordReset({ email });
      setMessage(response.detail);
    } catch (err) {
      setError(err.message || "No se pudo solicitar el restablecimiento.");
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
            Daybed
          </Typography>
        </Box>

        <Typography className="login-subtitle" variant="body1">
          Recuperar contraseña
        </Typography>

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
            label="Correo electrónico"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@ejemplo.com"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon style={{ color: "#61470c" }} />
                  </InputAdornment>
                ),
              },
            }}
            required
            autoComplete="email"
          />

          <PrimaryButton type="submit" disabled={loading || !email.trim()}>
            {loading ? "Enviando..." : "Enviar instrucciones"}
          </PrimaryButton>
        </form>

        <Box className="login-links-container">
          <Link
            component="button"
            type="button"
            onClick={() => navigate(routePaths.account.login)}
            underline="hover"
          >
            Volver a iniciar sesión
          </Link>
        </Box>
      </AccountPaper>
    </PageContainer>
  );
}

export default ForgotPasswordPage;
