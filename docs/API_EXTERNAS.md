# APIs externas

Daybed usa APIs externas únicamente para mejorar el flujo de checkout y entrega. El frontend no debe comunicarse directamente con estos proveedores; el backend actúa como capa de integración.

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
- Permitir que Daybed calcule una tarifa simulada.

Endpoint interno:

```text
POST /api/delivery/estimate/
```

Request con coordenadas:

```json
{
  "latitude": "32.51490000",
  "longitude": "-117.03820000"
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
  "delivery_zone": "standard",
  "distance_provider": "openrouteservice"
}
```

## Regla de tarifa

La API externa no define el precio de entrega. Daybed calcula la tarifa:

```text
delivery_fee = DELIVERY_BASE_FEE + (distance_km * DELIVERY_PRICE_PER_KM)
```

## Variables relacionadas

```env
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=daybed-student-project/1.0
OPENROUTESERVICE_BASE_URL=https://api.openrouteservice.org
OPENROUTESERVICE_API_KEY=
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
