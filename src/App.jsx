import { useState, useEffect } from "react";
import DatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/teal.css";
import "./App.css";

function App() {
  const [registros, setRegistros] = useState(() => {
    const data = localStorage.getItem("registros");
    return data ? JSON.parse(data) : [];
  });

  const [fechas, setFechas] = useState([]); // múltiples fechas seleccionadas
  const [tipoMovimiento, setTipoMovimiento] = useState("salida");
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");

  // === Guardar en localStorage ===
  useEffect(() => {
    localStorage.setItem("registros", JSON.stringify(registros));
  }, [registros]);

  // === Agregar registros con múltiples fechas ===
  function handleSubmit(e) {
    e.preventDefault();

    if (!concepto || !monto || fechas.length === 0) {
      alert("Completa todos los campos y selecciona al menos una fecha");
      return;
    }

    const nuevos = fechas.map((f) => ({
      fecha: f.format("YYYY-MM-DD"),
      tipoMovimiento,
      concepto,
      monto: parseFloat(monto),
    }));

    setRegistros((prev) => [...prev, ...nuevos]);

    // limpiar formulario
    setFechas([]);
    setConcepto("");
    setMonto("");
    setTipoMovimiento("salida");
  }

  function eliminarRegistro(indexGlobal) {
    const nuevos = registros.filter((_, i) => i !== indexGlobal);
    setRegistros(nuevos);
  }

  // === FILTRADO POR MES ACTUAL ===
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  const registrosMes = registros.filter((r) => {
    const fecha = new Date(r.fecha);
    return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
  });

  // ordenar de más reciente a más antiguo
  const registrosMesOrdenados = [...registrosMes].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  // === Totales ===
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
          Fechas:
          <DatePicker
            multiple
            value={fechas}
            onChange={setFechas}
            format="YYYY-MM-DD"
            className="teal"
            placeholder="Selecciona una o varias fechas"
          />
        </label>
        <label>
          Tipo de movimiento:
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="tipoMovimiento"
                value="ingreso"
                checked={tipoMovimiento === "ingreso"}
                onChange={(e) => setTipoMovimiento(e.target.value)}
              />{" "}
              Ingreso
            </label>
            <label>
              <input
                type="radio"
                name="tipoMovimiento"
                value="salida"
                checked={tipoMovimiento === "salida"}
                onChange={(e) => setTipoMovimiento(e.target.value)}
              />{" "}
              Salida
            </label>
          </div>
        </label>
        <label>
          Concepto:
          <input
            type="text"
            placeholder="Pan..."
            required
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
          />
        </label>
        <label>
          Monto:
          <input
            type="number"
            step="0.01"
            placeholder="247.49"
            required
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
        </label>
        <div className="botones">
          <button type="reset" className="btn-secondary">
            Reiniciar
          </button>
          <button type="submit" className="btn-primary">
            Guardar
          </button>
        </div>
      </form>

      <div className="resumen">
        <p>
          <strong>Proyección hasta fin de mes:</strong> {finDeMes}
        </p>
        <div className="cards">
          <div className="card ingreso">Ingresos: {ingresos.toFixed(2)}</div>
          <div className="card salida">Salidas: {salidas.toFixed(2)}</div>
          <div className="card ahorro">Ahorrado: {ahorrado.toFixed(2) < 0 ? '0' : ahorrado.toFixed(2)}</div>
        </div>
      </div>

      <div className="lista">
        <h2>Registros ({registrosMes.length} este mes)</h2>
        <ul>
          {registrosMesOrdenados.map((r, i) => (
            <li key={i}>
              <span>{new Date(r.fecha).toLocaleDateString()}</span>
              <span
                className={
                  r.tipoMovimiento === "ingreso" ? "ingreso" : "salida"
                }
              >
                {r.tipoMovimiento}
              </span>
              <span>{r.concepto}</span>
              <span>S/ {r.monto.toFixed(2)}</span>
              <button
                className="btn-eliminar"
                onClick={() => eliminarRegistro(i)}
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
