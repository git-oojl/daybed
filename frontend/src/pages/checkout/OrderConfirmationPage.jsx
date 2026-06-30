import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LinearProgress from "@mui/material/LinearProgress";

const OrderConfirmationPage = () => {

  const orderData = {
    id: "#DAY-001",
    estimatedDate: "30 de junio, 2028",
    subtotal: "$13,997 MX",
    shipping: "$500 MX",
    total: "$14,497 MX",
  };

  return (
    <Box
      sx={{
        background: "#F8F4EC",
        minHeight: "100vh",
      }}
    >

      {/* Header lo agregará Jenny */}

      <Container
        maxWidth={false}
        sx={{
          width: "90%",
          maxWidth: "1350px",
          py: 5,
        }}
      >

        {/* Ruta */}

        <Typography
          sx={{
            fontSize: 14,
            color: "#666",
            mb: 2,
          }}
        >
          Inicio &gt; Dashboard &gt; Checkout &gt; Confirmación de pedido
        </Typography>

        {/* Título */}

        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 700,
            color: "#8A4B08",
            fontFamily: "Georgia",
            mb: 4,
          }}
        >
          Confirmación de Pedido
        </Typography>

        {/* Mensaje */}

        <Paper
          elevation={1}
          sx={{
            borderRadius: 2,
            py: 5,
            mb: 5,
            textAlign: "center",
          }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: 60,
              color: "#4CAF50",
              mb: 2,
            }}
          />

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 24,
            }}
          >
            ¡PEDIDO CON ÉXITO! ✅
          </Typography>

        </Paper>

        {/* CONTENIDO */}

        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="flex-start"
        >
                  {/* COLUMNA IZQUIERDA */}

          <Grid item xs={12} md={3}>

            <Paper
              elevation={1}
              sx={{
                background: "#F8F2E8",
                border: "1px solid #B78B47",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  background: "#E6C894",
                  textAlign: "center",
                  py: 1,
                  fontWeight: "bold",
                }}
              >
                Número de pedido
              </Box>

              <Box
                sx={{
                  py: 3,
                  textAlign: "center",
                }}
              >
                <Typography fontWeight="bold">
                  {orderData.id}
                </Typography>
              </Box>

            </Paper>

            <Paper
              elevation={1}
              sx={{
                background: "#F8F2E8",
                border: "1px solid #B78B47",
              }}
            >
              <Box
                sx={{
                  background: "#E6C894",
                  textAlign: "center",
                  py: 1,
                  fontWeight: "bold",
                }}
              >
                Fecha estimada de entrega
              </Box>

              <Box
                sx={{
                  py: 3,
                  textAlign: "center",
                }}
              >
                <Typography>
                  {orderData.estimatedDate}
                </Typography>
              </Box>

            </Paper>

          </Grid>

          {/* COLUMNA CENTRO */}

          <Grid item xs={12} md={4}>

            <Paper
              elevation={1}
              sx={{
                background: "#F8F2E8",
                border: "1px solid #B78B47",
              }}
            >

              <Box
                sx={{
                  background: "#E6C894",
                  textAlign: "center",
                  py: 1,
                  fontWeight: "bold",
                }}
              >
                Resumen de pedido
              </Box>

              <Box sx={{ p: 3 }}>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography>Sofá Esquinero</Typography>
                  <Typography>1</Typography>
                  <Typography>$8,999 MX</Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography>Mesa de Centro</Typography>
                  <Typography>2</Typography>
                  <Typography>$4,998 MX</Typography>
                </Box>

                <Box
                  sx={{
                    borderTop: "1px solid #CCC",
                    pt: 2,
                  }}
                >

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography>Subtotal</Typography>
                    <Typography>{orderData.subtotal}</Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography>Envío</Typography>
                    <Typography>{orderData.shipping}</Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderTop: "2px solid #B78B47",
                      pt: 1,
                    }}
                  >
                    <Typography fontWeight="bold">
                      Total
                    </Typography>

                    <Typography
                      fontWeight="bold"
                      color="#8A4B08"
                    >
                      {orderData.total}
                    </Typography>

                  </Box>

                </Box>

              </Box>

            </Paper>

          </Grid>

          {/* COLUMNA DERECHA */}

          <Grid item xs={12} md={3}>

            <Paper
              elevation={1}
              sx={{
                background: "#FFF",
                p: 3,
                mb: 3,
              }}
            >

              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#8A4B08",
                  mb: 3,
                }}
              >
                Método de pago
              </Typography>

              <Typography sx={{ mb: 4 }}>
                Tarjeta de crédito
              </Typography>

              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#8A4B08",
                  mb: 2,
                }}
              >
                Dirección de envío
              </Typography>

              <Typography>
                Calle 123, Colonia Centro, CP 12345
              </Typography>

            </Paper>

            <Button
              fullWidth
              component={Link}
              to="/cuenta/pedidos"
              variant="contained"
              sx={{
                mb: 2,
                py: 1.5,
                bgcolor: "#8A4B08",
                "&:hover": {
                  bgcolor: "#6F3905",
                },
              }}
            >
              VER MIS PEDIDOS
            </Button>

            <Button
              fullWidth
              component={Link}
              to="/catalogo"
              variant="outlined"
              sx={{
                py: 1.5,
                borderColor: "#8A4B08",
                color: "#8A4B08",
              }}
            >
              SEGUIR COMPRANDO
            </Button>
                      </Grid>

        </Grid>

      </Container>

      {/* Beneficios */}

      <Box
        sx={{
          mt: 6,
          py: 5,
          background: "#EFE7DB",
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            width: "90%",
            maxWidth: "1350px",
          }}
        >
          <Grid container spacing={4} textAlign="center">
            <Grid item xs={6} md={3}>
              <Typography fontWeight="bold">
                CALIDAD SUPERIOR
              </Typography>

              <Typography color="text.secondary">
                Fabricado con materiales de primera calidad.
              </Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography fontWeight="bold">
                Protección de garantía
              </Typography>

              <Typography color="text.secondary">
                Garantía de 2 años.
              </Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography fontWeight="bold">
                Envío gratis
              </Typography>

              <Typography color="text.secondary">
                Pedidos mayores a $20,000.
              </Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography fontWeight="bold">
                Soporte 24/7
              </Typography>

              <Typography color="text.secondary">
                Atención dedicada.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

    </Box>
  );
};

export default OrderConfirmationPage;

                 