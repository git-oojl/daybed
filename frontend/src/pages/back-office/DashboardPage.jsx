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
      { name: "Sofá Esquinero", price: 8999, quantity: 1 },
      { name: "Mesa de Centro", price: 2499, quantity: 2 },
    ],
    subtotal: 13997,
    shipping: 500,
    total: 14497,
    paymentMethod: "Tarjeta de crédito",
    address: "Calle 123, Colonia Centro, CP 12345",
    status: "Confirmado",
  };

  return (
    <Box sx={{ bgcolor: "#FDF5E6", minHeight: "100vh", py: 5 }}>
      <Container maxWidth="lg">
        <Typography variant="body2" sx={{ mb: 4, color: "#666" }}>
          Inicio &gt; Dashboard &gt; Checkout &gt; Confirmación de pedido
        </Typography>

        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: "bold",
            color: "#8B4513",
          }}
        >
          Confirmación de Pedido
        </Typography>

        <Paper
          sx={{
            p: 4,
            mb: 4,
            bgcolor: "white",
            textAlign: "center",
            borderRadius: 2,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 64, color: "#4CAF50", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
            ¡PEDIDO CON ÉXITO! 
          </Typography>
        </Paper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 4, mb: 3, bgcolor: "white", borderRadius: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#8B4513", mb: 3 }}>
                Resumen de pedido
              </Typography>

              {orderData.items.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1.5,
                    borderBottom: index < orderData.items.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <Typography variant="body2">
                    {item.name} {item.quantity}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${(item.price * item.quantity).toLocaleString()} MX
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2" fontWeight="bold">${orderData.subtotal.toLocaleString()} MX</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                <Typography variant="body2" color="text.secondary">Envío</Typography>
                <Typography variant="body2" fontWeight="bold">${orderData.shipping.toLocaleString()} MX</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                <Typography variant="body2" fontWeight="bold">Total</Typography>
                <Typography variant="body2" fontWeight="bold" color="#8B4513">
                  ${orderData.total.toLocaleString()} MX
                </Typography>
              </Box>
            </Paper>

            <Paper sx={{ p: 4, mb: 3, bgcolor: "white", borderRadius: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#333", mb: 1 }}>
                Método de pago
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
                {orderData.paymentMethod}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#333", mb: 1 }}>
                Dirección de envío
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                {orderData.address}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 4, mb: 3, bgcolor: "white", borderRadius: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#8B4513", mb: 3 }}>
                Detalles del pedido
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#666", mb: 1 }}>
                  Número de pedido
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
                  {orderData.id}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#666", mb: 1 }}>
                  Estado del pedido
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold", color: "#4CAF50" }}>
                  {orderData.status}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#666", mb: 1 }}>
                  Fecha estimada de entrega
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold", color: "#333" }}>
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
      </Container>
    </Box>
  );
};

export default OrderConfirmationPage;
