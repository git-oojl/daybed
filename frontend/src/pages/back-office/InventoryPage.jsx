function InventoryPage() {
  return (
    <main>
      <h1>Inventario</h1>
      <section aria-labelledby="inventario-lista-de-productos-con-stock">
        <h2 id="inventario-lista-de-productos-con-stock">Lista de productos con stock</h2>
      </section>
      <section aria-labelledby="inventario-productos-con-bajo-inventario">
        <h2 id="inventario-productos-con-bajo-inventario">Productos con bajo inventario</h2>
      </section>
      <section aria-labelledby="inventario-actualizacion-de-cantidades">
        <h2 id="inventario-actualizacion-de-cantidades">Actualización de cantidades</h2>
      </section>
      <section aria-labelledby="inventario-stock-minimo">
        <h2 id="inventario-stock-minimo">Stock mínimo</h2>
      </section>
    </main>
  )
}

export default InventoryPage
