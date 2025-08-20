import { useState, useEffect } from "react";
import DatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/teal.css";
import gregorian_es from "./locales/gregorian/es"; // Asumiendo ya cuentas con tu locale
import "./App.css";

function App() {
  const [registros, setRegistros] = useState(() => {
    const data = localStorage.getItem("registros");
    return data ? JSON.parse(data) : [];
  });

  const [fechas, setFechas] = useState([]);
  const [tipoMovimiento, setTipoMovimiento] = useState("salida");
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");

  useEffect(() => {
    localStorage.setItem("registros", JSON.stringify(registros));
  }, [registros]);

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

    setFechas([]);
    setConcepto("");
    setMonto("");
    setTipoMovimiento("salida");
  }

  function eliminarRegistro(indice) {
    setRegistros(registros.filter((_, i) => i !== indice));
  }

  // Conversión segura de fecha (sin desfase UTC)
  function parseFechaLocal(fechaStr) {
    const [anio, mes, dia] = fechaStr.split("-").map(Number);
    return new Date(anio, mes - 1, dia);
  }

  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  const registrosMes = registros.filter((r) => {
    const fecha = parseFechaLocal(r.fecha);
    return (
      fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual
    );
  });

  const registrosMesOrdenados = [...registrosMes].sort(
    (a, b) => parseFechaLocal(b.fecha) - parseFechaLocal(a.fecha)
  );

  const ingresos = registrosMes
    .filter((r) => r.tipoMovimiento === "ingreso")
    .reduce((acc, r) => acc + r.monto, 0);

  const salidas = registrosMes
    .filter((r) => r.tipoMovimiento === "salida")
    .reduce((acc, r) => acc + r.monto, 0);

  const ahorrado = ingresos - salidas;
  const finDeMes = new Date(anioActual, mesActual + 1, 0).toLocaleDateString("es-PE");

  return (
    <div className="app-container">
      <h1 className="titulo">CuentasApp</h1>

      <form onSubmit={handleSubmit} className="formulario">
        <label>
          Fechas:
          <DatePicker
            multiple
            locale={gregorian_es}
            value={fechas}
            onChange={setFechas}
            format="YYYY-MM-DD"
            weekStartDayIndex={1}
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
          <div className="card ahorro">
            Ahorrado: {ahorrado < 0 ? "0.00" : ahorrado.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="lista">
        <h2>Registros ({registrosMes.length} este mes)</h2>
        <ul>
          {registrosMesOrdenados.map((r, i) => (
            <li key={i}>
              <span>{parseFechaLocal(r.fecha).toLocaleDateString("es-PE")}</span>
              <span className={r.tipoMovimiento === "ingreso" ? "ingreso" : "salida"}>
                {r.tipoMovimiento}
              </span>
              <span>{r.concepto}</span>
              <span>S/ {r.monto.toFixed(2)}</span>
              <button className="btn-eliminar" onClick={() => eliminarRegistro(i)}>
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
