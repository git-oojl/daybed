import React, { useState } from 'react';
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
 // Grid,
  MenuItem,
} from '@mui/material';
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
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import registerBackground from '../../assets/RegisterPage.jpg';

// ============================================
// PALETA DE COLORES DAYBED (Terrosos/Beige)
// ============================================
const COLORS = {
  primary: '#977422',
  primaryDark: '#7a5d1a',
  primaryLight: '#8c6918',
  secondary: '#61470c',
  textSecondary: '#7A6B5A',
  background: '#FFF3E3',
  inputBg: '#FEFCF8',
  border: '#D4C5B2',
  error: '#C0392B',
  white: '#FFFFFF',
  label: '#5A4A3A',
};

// ============================================
// ESTILOS PERSONALIZADOS 
// ============================================

const RegisterContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  overflow: 'hidden',
  backgroundImage: `url(${registerBackground})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(67, 42, 3, 0.80)',
    zIndex: 0,
  },
  '@supports (-webkit-touch-callout: none)': {
    height: '-webkit-fill-available',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const RegisterPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4.5),
  maxWidth: 450,
  width: '100%',
  borderRadius: 20,
  boxShadow: '0 8px 40px rgba(74, 53, 32, 0.2)',
  backgroundColor: COLORS.background,
  position: 'relative',
  zIndex: 1,
  border: '1px solid #E8DCCC',
  backdropFilter: 'blur(2px)',
  maxHeight: '75vh',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: COLORS.border,
    borderRadius: '10px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    borderRadius: 16,
    maxWidth: '95%',
    margin: theme.spacing(1),
    maxHeight: '95vh',
  },
  [theme.breakpoints.down('xs')]: {
    padding: theme.spacing(2.5),
    borderRadius: 12,
    maxWidth: '96%',
    margin: theme.spacing(0.5),
    maxHeight: '96vh',
  },
}));

//BRAND SECTION 
const BrandSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(0.5),
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1),
  },
}));

const BrandIcon = styled(StoreIcon)(({ theme }) => ({
  fontSize: 36,
  color: COLORS.primaryLight,
  [theme.breakpoints.down('sm')]: {
    fontSize: 30,
  },
}));

const BrandTitle = styled(Typography)(({ theme }) => ({
  fontSize: 30,
  fontWeight: 700,
  color: COLORS.primaryLight,
  textAlign: 'center',
  letterSpacing: 1.5,
  fontFamily: '"Poppins", montserrat, sans-serif',
  [theme.breakpoints.down('sm')]: {
    fontSize: 26,
    letterSpacing: 1,
  },
  [theme.breakpoints.down('xs')]: {
    fontSize: 22,
  },
}));

//DIVIDER 
const DividerLine = styled(Box)(({ theme }) => ({
  width: '80px',
  height: '2px',
  backgroundColor: COLORS.border,
  margin: `${theme.spacing(1.5)} auto`,
  borderRadius: '2px',
  [theme.breakpoints.down('sm')]: {
    width: '60px',
    margin: `${theme.spacing(1)} auto`,
  },
}));

const RegisterTitle = styled(Typography)(({ theme }) => ({
  fontSize: 20,
  fontWeight: 600,
  color: COLORS.secondary,
  textAlign: 'center',
  fontFamily: '"Poppins", montserrat, sans-serif',
  [theme.breakpoints.down('sm')]: {
    fontSize: 18,
  },
}));

const RegisterSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  color: COLORS.textSecondary,
  textAlign: 'center',
  marginBottom: theme.spacing(2.5),
  fontWeight: 400,
  fontFamily: '"Poppins", montserrat, sans-serif',
  [theme.breakpoints.down('sm')]: {
    fontSize: 12,
    marginBottom: theme.spacing(2),
  },
}));

//FORM GROUP
const FormGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-of-type': {
    marginBottom: theme.spacing(1),
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1.5),
  },
}));

const FormLabel = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  fontWeight: 500,
  color: COLORS.label,
  fontFamily: '"Poppins", montserrat, sans-serif',
  marginBottom: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  [theme.breakpoints.down('sm')]: {
    fontSize: 12,
  },
}));

//STYLED TEXTFIELD
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 10,
    backgroundColor: COLORS.inputBg,
    transition: 'border-color 0.2s ease',
    '& fieldset': {
      borderColor: COLORS.border,
    },
    '&:hover fieldset': {
      borderColor: '#8B6B4C',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8B6B4C',
      borderWidth: 2,
    },
    '&.Mui-error fieldset': {
      borderColor: COLORS.error,
    },
  },
  '& .MuiInputLabel-root': {
    display: 'none', 
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginTop: 4,
    fontWeight: 400,
    fontSize: 11,
    color: COLORS.error,
    fontFamily: '"Poppins", montserrat, sans-serif',
  },
  '& .MuiInputBase-input': {
    fontFamily: '"Poppins", montserrat, sans-serif',
    fontSize: 14,
    padding: '12px 14px',
    '&::placeholder': {
      color: '#B3A088',
      opacity: 1,
    },
  },
  '& .MuiSelect-select': {
    padding: '12px 14px !important',
  },
  '& .MuiInputAdornment-root': {
    marginRight: 0,
  },
  '& .MuiInputAdornment-positionStart': {
    marginLeft: 4,
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiInputBase-input, & .MuiSelect-select': {
      fontSize: 13,
      padding: '10px 12px',
    },
  },
}));

// PASSWORD WRAPPER 
const PasswordWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  '& .MuiInputBase-root': {
    paddingRight: '48px',
  },
  '& .MuiInputAdornment-positionEnd': {
    position: 'absolute',
    right: 4,
    top: '50%',
    transform: 'translateY(-50%)',
  },
}));

const RegisterButton = styled(Button)(({ theme }) => ({
  backgroundColor: COLORS.primary,
  color: COLORS.white,
  padding: theme.spacing(1.4),
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: '"Poppins", montserrat, sans-serif',
  transition: 'background-color 0.3s ease, transform 0.2s ease',
  boxShadow: '0 4px 12px #b88f2f84',
  width: '100%',
  marginTop: theme.spacing(1.5),
  '&:hover': {
    backgroundColor: COLORS.primaryDark,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px #8b6b4c59',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    backgroundColor: '#D4C5B2',
    boxShadow: 'none',
    transform: 'none',
    color: '#A09080',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.2),
    fontSize: 14,
  },
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  '& .MuiCheckbox-root': {
    color: COLORS.border,
    padding: '6px',
    '&.Mui-checked': {
      color: COLORS.primary,
    },
  },
  '& .MuiFormControlLabel-label': {
    fontFamily: '"Poppins", montserrat, sans-serif',
    fontSize: 13,
    color: COLORS.secondary,
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
    },
  },
}));

const LoginLink = styled(Link)(({ theme }) => ({
  color: COLORS.primary,
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  fontFamily: '"Poppins", montserrat, sans-serif',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: COLORS.primaryDark,
    textDecoration: 'underline',
  },
}));

const FooterWrapper = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(2),
  '& .MuiTypography-root': {
    color: COLORS.secondary,
    fontSize: 14,
    fontFamily: '"Poppins", montserrat, sans-serif',
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
    },
  },
}));

const ErrorAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: 10,
  backgroundColor: '#FDF2F0',
  border: '1px solid #F5D0CC',
  '& .MuiAlert-icon': {
    color: COLORS.error,
  },
  '& .MuiAlert-message': {
    color: '#4A3520',
    fontFamily: '"Poppins", montserrat, sans-serif',
    fontSize: 13,
  },
}));

// ============================================
// DATOS - ESTADOS DE MÉXICO
// ============================================
const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur',
  'Campeche', 'Chiapas', 'Chihuahua', 'Ciudad de México',
  'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco',
  'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León',
  'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo',
  'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco',
  'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    estado: '',
    ciudad: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    return re.test(phone.replace(/\s/g, ''));
  };

  const isFormValid = () => {
    return (
      formData.nombre.trim() !== '' &&
      formData.apellido.trim() !== '' &&
      validateEmail(formData.email) &&
      validatePhone(formData.telefono) &&
      formData.estado !== '' &&
      formData.ciudad.trim() !== '' &&
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
    setError('');
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
    setError('');

    if (!aceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      console.log('Registro exitoso', formData);
      setLoading(false);
      window.location.href = '/login';
    }, 1500);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const showEmailError = touched.email && !validateEmail(formData.email) && formData.email !== '';
  const showPasswordError = touched.password && !validatePassword(formData.password) && formData.password !== '';
  const showConfirmError = touched.confirmPassword && formData.confirmPassword !== '' && formData.password !== formData.confirmPassword;
  const showPhoneError = touched.telefono && !validatePhone(formData.telefono) && formData.telefono !== '';

  return (
    <RegisterContainer>
      <RegisterPaper elevation={0}>
        {/* BRAND SECTION */}
        <BrandSection>
          <BrandIcon />
          <BrandTitle variant="h1">DayBed</BrandTitle>
        </BrandSection>

        {/* DIVIDER */}
        <DividerLine />

        {/* TÍTULOS */}
        <RegisterTitle variant="h2">Crear cuenta</RegisterTitle>

        {error && (
          <ErrorAlert severity="error">
            {error}
          </ErrorAlert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* NOMBRE - Label arriba del input */}
          <FormGroup>
            <FormLabel variant="body2">Nombre completo:</FormLabel>
            <StyledTextField
              fullWidth
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Juan Pérez"
              error={touched.nombre && formData.nombre === ''}
              helperText={touched.nombre && formData.nombre === '' ? 'Requerido' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: COLORS.secondary, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              required
            />
          </FormGroup>

          {/* CORREO ELECTRÓNICO */}
          <FormGroup>
            <FormLabel variant="body2">Correo electrónico:</FormLabel>
            <StyledTextField
              fullWidth
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="ejemplo@email.com"
              error={showEmailError}
              helperText={showEmailError ? 'Correo inválido' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: showEmailError ? COLORS.error : COLORS.secondary, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              required
              autoComplete="email"
            />
          </FormGroup>

          {/* TELÉFONO */}
          <FormGroup>
            <FormLabel variant="body2">Teléfono:</FormLabel>
            <StyledTextField
              fullWidth
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="5512345678"
              error={showPhoneError}
              helperText={showPhoneError ? '10 dígitos' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: showPhoneError ? COLORS.error : COLORS.secondary, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              required
              autoComplete="tel"
            />
          </FormGroup>

          {/* ESTADO */}
          <FormGroup>
            <FormLabel variant="body2">Estado:</FormLabel>
            <StyledTextField
              fullWidth
              select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.estado && formData.estado === ''}
              helperText={touched.estado && formData.estado === '' ? 'Selecciona' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PinDropIcon sx={{ color: COLORS.secondary, fontSize: 20 }} />
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
            </StyledTextField>
          </FormGroup>

          {/* CIUDAD */}
          <FormGroup>
            <FormLabel variant="body2">Ciudad:</FormLabel>
            <StyledTextField
              fullWidth
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Tijuana"
              error={touched.ciudad && formData.ciudad === ''}
              helperText={touched.ciudad && formData.ciudad === '' ? 'Requerida' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CityIcon sx={{ color: COLORS.secondary, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              required
            />
          </FormGroup>

          {/* CONTRASEÑA */}
          <FormGroup>
            <FormLabel variant="body2">Contraseña:</FormLabel>
            <PasswordWrapper>
              <StyledTextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Mínimo 6 caracteres"
                error={showPasswordError}
                helperText={showPasswordError ? 'Mínimo 6 caracteres' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: showPasswordError ? COLORS.error : COLORS.secondary, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        sx={{ color: COLORS.secondary }}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
                autoComplete="new-password"
              />
            </PasswordWrapper>
          </FormGroup>

          {/* CONFIRMAR CONTRASEÑA */}
          <FormGroup>
            <FormLabel variant="body2">Confirmar contraseña:</FormLabel>
            <PasswordWrapper>
              <StyledTextField
                fullWidth
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Repite tu contraseña"
                error={showConfirmError}
                helperText={showConfirmError ? 'No coinciden' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: showConfirmError ? COLORS.error : COLORS.secondary, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleToggleConfirmPassword}
                        edge="end"
                        sx={{ color: COLORS.secondary }}
                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
                autoComplete="new-password"
              />
            </PasswordWrapper>
          </FormGroup>

          {/* TÉRMINOS Y CONDICIONES */}
          <StyledFormControlLabel
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
          <RegisterButton
            type="submit"
            disabled={!isFormValid() || loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </RegisterButton>
        </form>

        {/* FOOTER */}
        <FooterWrapper>
          <Typography variant="body1">
            ¿Ya tienes una cuenta?{' '}
            <LoginLink href="/login" underline="hover">
              Inicia sesión
            </LoginLink>
          </Typography>
        </FooterWrapper>
      </RegisterPaper>
    </RegisterContainer>
  );
}

export default RegisterPage;