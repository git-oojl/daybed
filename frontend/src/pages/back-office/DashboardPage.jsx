import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
} from "@mui/material";

const DashboardPage = () => {
  return (
    <Box sx={{ background: "#F7F5F2" }}>

      {/* HERO */}
      <Box
        sx={{
          height: 300,
          backgroundRepeat: "no-repeat",
          backgroundImage: "url('/hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography
          sx={{
            fontSize: 56,
            fontWeight: 700,
          }}
        >
          Dashboard
        </Typography>

        <Typography
              variant="body2"
              fontWeight="bold"
          >
          Inicio &gt; Dashboard
        </Typography>
      </Box>

      {/* CONTENIDO */}

      <Container
  maxWidth={false}
  sx={{
    width: "92%",
    maxWidth: "1400px",
    mx: "auto",
    py: 6,
  }}
>

        <Grid container spacing={3}>

          {/* IZQUIERDA */}

          <Grid item xs={12} lg={9}>

            <Grid container spacing={3}>

              {/* PEDIDOS */}

              <Grid item xs={12} lg={3}>
                <Paper elevation={0} sx={{
    background:"#F4F0EA",
    borderRadius:0,
    minHeight:260,
}}>
                  <Box sx={{background:"#D8BB87",p:1,textAlign:"center",fontWeight:"bold"}}>
                    Pedidos totales
                  </Box>

                  <Box
    sx={{
        p:3,
        minHeight:220,
    }}
>
                    <Box sx={{display:"flex",justifyContent:"space-between",mb:3}}>
                      <Typography>Pedidos mes actual</Typography>
                      <Typography>124</Typography>
                    </Box>

                    <Box sx={{display:"flex",justifyContent:"space-between"}}>
                      <Typography>Pedidos mes anterior</Typography>
                      <Typography>112</Typography>
                    </Box>

                    <Typography
                      sx={{
                        color:"#C6932E",
                        mt:6,
                        fontWeight:600
                      }}
                    >
                      +12 pedidos este mes
                    </Typography>

                  </Box>
                </Paper>
              </Grid>

              {/* VENTAS */}

              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ background:"#F4F0EA" }}>
                  <Box sx={{background:"#D8BB87",p:1,textAlign:"center",fontWeight:"bold"}}>
                    Ventas
                  </Box>

                  <Box sx={{p:3,minHeight:220}}>

                    <Box sx={{display:"flex",justifyContent:"space-between",mb:3}}>
                      <Typography>Ventas mes actual</Typography>
                      <Typography>$45,230 MX</Typography>
                    </Box>

                    <Box sx={{display:"flex",justifyContent:"space-between"}}>
                      <Typography>Ventas mes anterior</Typography>
                      <Typography>$41,611 MX</Typography>
                    </Box>

                    <Typography
                      sx={{
                        color:"#C6932E",
                        mt:6,
                        fontWeight:600
                      }}
                    >
                      +8% ventas este mes
                    </Typography>

                  </Box>

                </Paper>
              </Grid>

              {/* PRODUCTOS */}

              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ background:"#F4F0EA" }}>
                  <Box sx={{background:"#D8BB87",p:1,textAlign:"center",fontWeight:"bold"}}>
                    Productos bajos
                  </Box>

                  <Box sx={{p:4,minHeight:220}}>

                    <Box sx={{display:"flex",justifyContent:"space-between"}}>
                      <Typography>Stock total</Typography>
                      <Typography>8</Typography>
                    </Box>

                    <Typography
                      sx={{
                        color:"#C6932E",
                        mt:8,
                        fontWeight:600
                      }}
                    >
                      Necesitan reabastecer
                    </Typography>

                  </Box>

                </Paper>
              </Grid>

            </Grid>

          </Grid>

          {/* DERECHA */}

          <Grid item xs={12} md={4}>

         <Paper
            elevation={0}
            sx={{
             background:"#F4F0EA",
             height:"100%",
             borderRadius:0,
                  }}
              >

              <Box
                sx={{
                  background:"#D8BB87",
                  p:1,
                  textAlign:"center",
                  fontWeight:"bold"
                }}
              >
                Ventas por mes
              </Box>

              {[
                ["Enero","$5,000 MX"],
                ["Febrero","$8,000 MX"],
                ["Marzo","$12,000 MX"],
                ["Abril","$15,000 MX"],
                ["Mayo","$20,000 MX"],
              ].map((item)=>(
                <Box
                  key={item[0]}
                  sx={{
                    display:"flex",
                    justifyContent:"space-between",
                    p:2
                  }}
                >
                  <Typography>{item[0]}</Typography>
                  <Typography>{item[1]}</Typography>
                </Box>
              ))}

              <Box
                sx={{
                  background:"#D8BB87",
                  display:"flex",
                  justifyContent:"space-between",
                  p:2,
                  fontWeight:"bold"
                }}
              >
                <Typography fontWeight="bold">
                  Ventas del día
                </Typography>

                <Typography fontWeight="bold">
                  $1,250 MX
                </Typography>

              </Box>

            </Paper>

          </Grid>

        </Grid>

      </Container>

      {/* BENEFICIOS */}

      <Box
        sx={{
          background:"#EFE7DB",
          py:5
        }}
      >
        <Container
  maxWidth={false}
  sx={{
    width: "90%",
    maxWidth: "1400px",
    margin: "0 auto",
  }}
>
          <Grid
    container
    spacing={4}
    justifyContent="space-between"
    textAlign="center"
>

            <Grid item xs={12} sm={6} md={3}>
              <Typography fontWeight="bold">
                CALIDAD SUPERIOR
              </Typography>

              <Typography color="text.secondary">
                Fabricado con materiales de primera
              </Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography fontWeight="bold">
                Protección de garantía
              </Typography>

              <Typography color="text.secondary">
                garantía de 2 años
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography fontWeight="bold">
                Envío gratis
              </Typography>

              <Typography color="text.secondary">
                pedidos +$20,000
              </Typography>
            </Grid>

           <Grid item xs={12} sm={6} md={3}>
              <Typography fontWeight="bold">
                Soporte 24/7
              </Typography>

              <Typography color="text.secondary">
                Atención dedicada
              </Typography>
            </Grid>

          </Grid>

        </Container>
      </Box>

    </Box>
  );
};

export default DashboardPage;