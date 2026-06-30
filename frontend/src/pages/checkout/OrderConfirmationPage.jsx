import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const OrderConfirmationPage = () => {
  const orderData = {
    id: "#DAY-001",
    estimatedDate: "30 de junio, 2028",
    items: [
      { name: "Sofa Esquinero", price: 8999, quantity: 1 },
      { name: "Mesa de Centro", price: 2499, quantity: 2 },
    ],
    subtotal: 13997,
    shipping: 500,
    total: 14497,
    paymentMethod: "Tarjeta de crédito",
    address: "Calle 123, Colonia Centro, CP 12345",
  };

  return (
    <Box sx={{ bgcolor: "#FDF5E6", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Ruta */}
        <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
          Inicio &gt; Dashboard &gt; Checkout &gt; Confirmación de pedido
        </Typography>

        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: "bold",
            color: "#8B4513",
            fontFamily: "Playfair Display, serif",
          }}
        >
          Confirmación de Pedido
        </Typography>

        {/* Mensaje de éxito */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            bgcolor: "white",
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 64, color: "#4CAF50", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
            ¡PEDIDO CON ÉXITO! ✅
          </Typography>
        </Paper>

        <Grid container spacing={4}>
          {/* Columna izquierda */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, mb: 3, bgcolor: "white", borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#8B4513", mb: 2 }}>
                Resumen de pedido
              </Typography>

              {orderData.items.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                    borderBottom: index < orderData.items.length - 1 ? "1px solid #eee" : "none",
                  }}
                >
                  <Typography>
                    {item.name} x {item.quantity}
                  </Typography>
                  <Typography>${(item.price * item.quantity).toLocaleString()} MX</Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                <Typography>Subtotal</Typography>
                <Typography>${orderData.subtotal.toLocaleString()} MX</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                <Typography>Envío</Typography>
                <Typography>${orderData.shipping.toLocaleString()} MX</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 1,
                  fontWeight: "bold",
                  borderTop: "2px solid #8B4513",
                  mt: 1,
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>Total</Typography>
                <Typography sx={{ fontWeight: "bold", color: "#8B4513" }}>
                  ${orderData.total.toLocaleString()} MX
                </Typography>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, mb: 3, bgcolor: "white", borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                💳 Método de pago
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
                {orderData.paymentMethod}
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                📍 Dirección de envío
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                {orderData.address}
              </Typography>
            </Paper>
          </Grid>

          {/* Columna derecha */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, mb: 3, bgcolor: "white", borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#8B4513", mb: 2 }}>
                Detalles del pedido
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#666" }}>
                  Número de pedido
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
                  {orderData.id}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#666" }}>
                  Fecha estimada de entrega
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
                  {orderData.estimatedDate}
                </Typography>
              </Box>
            </Paper>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                component={Link}
                to="/cuenta/pedidos"
                sx={{
                  bgcolor: "#8B4513",
                  "&:hover": { bgcolor: "#5C2E0B" },
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                Ver mis pedidos
              </Button>

              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to="/catalogo"
                sx={{
                  borderColor: "#8B4513",
                  color: "#8B4513",
                  "&:hover": { bgcolor: "#8B4513", color: "white" },
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                Seguir comprando
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Beneficios */}
        <Grid container spacing={3} sx={{ mt: 6 }}>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                CALIDAD SUPERIOR
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Fabricado con materiales de primera calidad.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                Protección de garantía
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                garantía de 2 años.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                Envío gratis
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                pedidos +$20,000.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                Soporte 24/7
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Atención dedicada.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default OrderConfirmationPage;