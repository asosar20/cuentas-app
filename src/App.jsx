import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [registros, setRegistros] = useState(() => {
    const data = localStorage.getItem("registros");
    return data ? JSON.parse(data) : [];
  });

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());
    formJson.monto = parseFloat(formJson.monto);
    setRegistros((prev) => [...prev, formJson]);
    form.reset();
  }

  function eliminarRegistro(index) {
    const nuevos = registros.filter((_, i) => i !== index);
    setRegistros(nuevos);
  }

  useEffect(() => {
    localStorage.setItem("registros", JSON.stringify(registros));
  }, [registros]);

  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  const registrosMes = registros.filter((r) => {
    const fecha = new Date(r.fecha);
    return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
  });

  const registrosMesOrdenados = [...registrosMes].sort((a, b) => {
    return new Date(b.fecha) - new Date(a.fecha)
  })

  const ingresos = registrosMes
    .filter((r) => r.tipoMovimiento === "ingreso")
    .reduce((acc, r) => acc + r.monto, 0);

  const salidas = registrosMes
    .filter((r) => r.tipoMovimiento === "salida")
    .reduce((acc, r) => acc + r.monto, 0);

  const ahorrado = ingresos - salidas;
  const finDeMes = new Date(anioActual, mesActual + 1, 0).toLocaleDateString();

  return (
    <div className="app-container">
      <h1 className="titulo">CuentasApp</h1>

      <form method="post" onSubmit={handleSubmit} className="formulario">
        <label>
          Fecha:
          <input name="fecha" type="datetime-local" required />
        </label>
        <label>
          Tipo de movimiento:
          <div className="radio-group">
            <label><input type="radio" name="tipoMovimiento" value="ingreso" /> Ingreso</label>
            <label><input type="radio" name="tipoMovimiento" value="salida" defaultChecked /> Salida</label>
          </div>
        </label>
        <label>
          Concepto:
          <input name="concepto" type="text" placeholder="Pan..." required />
        </label>
        <label>
          Monto:
          <input name="monto" type="number" step="0.01" placeholder="247.49" required />
        </label>
        <div className="botones">
          <button type="reset" className="btn-secondary">Reiniciar</button>
          <button type="submit" className="btn-primary">Guardar</button>
        </div>
      </form>

      <div className="resumen">
        <p><strong>Proyección hasta fin de mes:</strong> {finDeMes}</p>
        <div className="cards">
          <div className="card ingreso">Ingresos: {ingresos.toFixed(2)}</div>
          <div className="card salida">Salidas: {salidas.toFixed(2)}</div>
          <div className="card ahorro">Ahorrado: {ahorrado.toFixed(2)}</div>
        </div>
      </div>

      <div className="lista">
        <h2>Registros ({registrosMes.length} este mes)</h2>
        <ul>
          {registrosMesOrdenados.map((r, i) => (
            <li key={i}>
              <span>{new Date(r.fecha).toLocaleDateString()}</span>
              <span className={r.tipoMovimiento === "ingreso" ? "ingreso" : "salida"}>
                {r.tipoMovimiento}
              </span>
              <span>{r.concepto}</span>
              <span>S/ {r.monto.toFixed(2)}</span>
              <button className="btn-eliminar" onClick={() => eliminarRegistro(i)}>❌</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
