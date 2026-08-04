const DEFAULT_STORE = {
  latitude: 32.5149,
  longitude: -116.9645,
  label: "Daybed · Blvd. Cucapah, Tijuana",
};

function buildBounds(latitude, longitude, span = 0.018) {
  return [longitude - span, latitude - span, longitude + span, latitude + span]
    .map((value) => value.toFixed(6))
    .join("%2C");
}

export default function OpenStreetMapEmbed({
  latitude = DEFAULT_STORE.latitude,
  longitude = DEFAULT_STORE.longitude,
  label = DEFAULT_STORE.label,
  title = "Ubicación en OpenStreetMap",
  compact = false,
}) {
  const lat = Number(latitude) || DEFAULT_STORE.latitude;
  const lon = Number(longitude) || DEFAULT_STORE.longitude;
  const marker = `${lat.toFixed(6)}%2C${lon.toFixed(6)}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${buildBounds(lat, lon)}&layer=mapnik&marker=${marker}`;
  const mapLink = `https://www.openstreetmap.org/?mlat=${lat.toFixed(6)}&mlon=${lon.toFixed(6)}#map=16/${lat.toFixed(6)}/${lon.toFixed(6)}`;

  return (
    <figure className={`osm-map${compact ? " osm-map--compact" : ""}`}>
      <iframe
        title={title}
        src={src}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <figcaption>
        <span>{label}</span>
        <a href={mapLink} target="_blank" rel="noreferrer">Abrir mapa</a>
      </figcaption>
    </figure>
  );
}
