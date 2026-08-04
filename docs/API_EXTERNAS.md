# APIs externas

Daybed usa APIs externas únicamente para mejorar el flujo de checkout y entrega. El frontend no debe comunicarse directamente con estos proveedores; el backend actúa como capa de integración.

## Configuración local

Nominatim/OpenStreetMap no requiere API key para el uso previsto del MVP. OpenRouteService sí requiere key para calcular rutas reales:

```env
OPENROUTESERVICE_API_KEY=tu_api_key_de_openrouteservice
```

La key debe guardarse únicamente en `backend/.env`. No debe subirse al repositorio, ponerse en `frontend/.env` ni enviarse al navegador. Sin esta variable, el backend puede arrancar, pero la estimación real de distancia/duración devuelve un error controlado.

## Geocodificación: Nominatim / OpenStreetMap

Propósito:

- Convertir dirección de entrega en coordenadas.
- Validar o normalizar una dirección.
- Guardar dirección formateada y coordenadas en el pedido.

Endpoint interno:

```text
POST /api/delivery/geocode/
```

Request esperado:

```json
{
  "address": "Av. Reforma 123, Tijuana, Baja California, México"
}
```

Response esperada:

```json
{
  "original_address": "Av. Reforma 123, Tijuana, Baja California, México",
  "formatted_address": "...",
  "latitude": "32.51490000",
  "longitude": "-117.03820000",
  "provider": "nominatim"
}
```

## Distancia y duración: OpenRouteService

Propósito:

- Calcular distancia de ruta desde la tienda hasta el destino.
- Calcular duración estimada.
- Permitir que Daybed calcule una tarifa real usando la configuración activa de tienda.

Endpoint interno:

```text
POST /api/delivery/estimate/
```

Request con coordenadas:

```json
{
  "latitude": "32.51490000",
  "longitude": "-117.03820000",
  "order_subtotal": "6000.00"
}
```

Request alternativo con dirección:

```json
{
  "address": "Av. Reforma 123, Tijuana, Baja California, México"
}
```

Response esperada:

```json
{
  "origin_latitude": "32.51490000",
  "origin_longitude": "-117.03820000",
  "destination_latitude": "32.51490000",
  "destination_longitude": "-117.03820000",
  "distance_km": "12.400",
  "estimated_duration_minutes": "28.0",
  "delivery_fee": "180.00",
  "free_shipping_applied": false,
  "free_shipping_threshold": "5000.00",
  "delivery_zone": "standard",
  "distance_provider": "openrouteservice"
}
```

## Regla de tarifa

La API externa no define el precio de entrega. Daybed calcula la tarifa:

```text
delivery_fee = DELIVERY_BASE_FEE + (distance_km * DELIVERY_PRICE_PER_KM)
```

En producción la regla usa `StoreSettings` activo. Las variables `STORE_LATITUDE`,
`STORE_LONGITUDE`, `DELIVERY_BASE_FEE` y `DELIVERY_PRICE_PER_KM` son valores de
bootstrap/fallback para crear la primera configuración si no existe registro
persistente. Si `free_shipping_threshold` está configurado y `order_subtotal`
alcanza ese monto, `delivery_fee` es `0.00`.

## Variables relacionadas

```env
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=daybed-student-project/1.0
OPENROUTESERVICE_BASE_URL=https://api.openrouteservice.org
OPENROUTESERVICE_API_KEY=tu_api_key_de_openrouteservice
STORE_LATITUDE=32.5149
STORE_LONGITUDE=-117.0382
DELIVERY_BASE_FEE=80.00
DELIVERY_PRICE_PER_KM=8.00
```

## Manejo de errores

El backend debe devolver errores controlados cuando:

- No se encuentra la dirección.
- El proveedor externo falla.
- La API key no está configurada.
- La respuesta del proveedor tiene formato inesperado.

Las pruebas automatizadas deben mockear estas llamadas. No deben depender de proveedores vivos.
