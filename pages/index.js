import { useMemo, useState } from "react";
import { calcularPresupuesto } from "@/lib/calculo";
import SidebarParams, { defaultParams } from "@/components/SidebarParams";
import SummaryCard from "@/components/SummaryCard";

export default function Home() {
  const [params, setParams] = useState(defaultParams);
  const [input, setInput] = useState({
    // Cabecera
    tipoObra: "Reforma",
    ciudad: defaultParams.ciudadPorDefecto,
    calidad: "Basico",

    // Mano de obra
    m2: 0,
    precioBaseM2: 0,
    incluirDerribo: false,
    derribo_importe: 0,

    // Alicatados
    alic_suelo_m2: 0,  alic_suelo_apl: 0,  alic_suelo_mat: 0,
    alic_cocina_m2: 0, alic_cocina_apl: 0, alic_cocina_mat: 0,
    alic_bano_m2: 0,   alic_bano_apl: 0,   alic_bano_mat: 0,

    // Falso techo
    falsoTecho_m2: 0,
    falsoTechoTec_m2: 0,

    // Otros
    numHabitaciones: 0,
    tabiqueria_tipo: "Ninguna",
    tabiqueria_m2: 0,
    numBanos_info: 0,
    cocina: false,
    incluirFontaneria: false,
    incluirElectricidad: false
  });

  const resultado = useMemo(() => calcularPresupuesto(input, params), [input, params]);
  const update = (patch) => setInput((prev) => ({ ...prev, ...patch }));

  const setRefCiudad = () => {
    const ref = params.referenciaCiudad[input.ciudad] ?? 0;
    update({ precioBaseM2: ref });
  };

  const handlePDF = async () => {
    const { exportarPDF } = await import("@/lib/pdf");
    await exportarPDF({ input, resultado });
  };

  return (
    <>
      {/* Barra de acciones superior de la página (PDF SOLO AQUÍ) */}
      <div className="flex justify-end mb-4">
        <button className="btn btn-primary" onClick={handlePDF}>Generar PDF</button>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        {/* Columna principal */}
        <section className="space-y-6">
          {/* Cabecera + mano de obra / derribo */}
          <div className="card">
            <h2 className="font-semibold mb-2">Calculadora de Reformas</h2>
            <p className="muted mb-4">Introduce los datos de tu obra para estimar un presupuesto.</p>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Tipo de obra</label>
                    <select className="select" value={input.tipoObra} onChange={(e) => update({ tipoObra: e.target.value })}>
                      <option>Reforma</option>
                      <option>Obra nueva</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Precio derribo (si aplica)</label>
                    <input
                      className="input"
                      type="number"
                      value={input.derribo_importe}
                      onChange={(e) => update({ derribo_importe: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Metros cuadrados</label>
                    <input
                      className="input"
                      type="number"
                      value={input.m2}
                      onChange={(e) => update({ m2: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="label">Coste mano de obra (€/m²)</label>
                    <div className="flex gap-2">
                      <input
                        className="input flex-1"
                        type="number"
                        value={input.precioBaseM2}
                        onChange={(e) => update({ precioBaseM2: parseFloat(e.target.value) || 0 })}
                      />
                      <button className="btn btn-primary" onClick={setRefCiudad}>Referencia</button>
                    </div>
                    <p className="muted mt-1">
                      Ciudad: {input.ciudad} · {params.referenciaCiudad[input.ciudad] ?? 0} €/m² (editable)
                    </p>
                  </div>
                </div>
              </div>

              {/* KPI superior (estética v5) */}
              <div className="kpi">
                <div className="text-sm opacity-80 mb-2">Presupuesto estimado</div>
                <div className="text-4xl font-bold mb-1">
                  {new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2 }).format(resultado.total)} €
                </div>
                <div className="muted">Con parámetros actuales.</div>
              </div>
            </div>
          </div>

          {/* Alicatados */}
          <div className="card">
            <h3 className="font-semibold mb-3">Alicatados</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { t: "Alicatado suelo", k: "suelo" },
                { t: "Alicatado cocina", k: "cocina" },
                { t: "Alicatado baño", k: "bano" }
              ].map(({ t, k }) => (
                <div key={k} className="space-y-2">
                  <div className="text-sm font-medium">{t}</div>
                  <input
                    className="input"
                    placeholder="€/m² aplicación"
                    type="number"
                    value={input[`alic_${k}_apl`]}
                    onChange={(e) => update({ [`alic_${k}_apl`]: parseFloat(e.target.value) || 0 })}
                  />
                  <input
                    className="input"
                    placeholder="€/m² material"
                    type="number"
                    value={input[`alic_${k}_mat`]}
                    onChange={(e) => update({ [`alic_${k}_mat`]: parseFloat(e.target.value) || 0 })}
                  />
                  <input
                    className="input"
                    placeholder="m² a alicatar"
                    type="number"
                    value={input[`alic_${k}_m2`]}
                    onChange={(e) => update({ [`alic_${k}_m2`]: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Falso techo */}
          <div className="card">
            <h3 className="font-semibold mb-3">Falso techo</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">m² de falso techo</label>
                <input
                  className="input"
                  type="number"
                  value={input.falsoTecho_m2}
                  onChange={(e) => update({ falsoTecho_m2: parseFloat(e.target.value) || 0 })}
                />
                <p className="muted mt-1">{params.precios.falsoTecho_m2} €/m² (editable en parámetros)</p>
              </div>
              <div>
                <label className="label">m² falso techo técnico</label>
                <input
                  className="input"
                  type="number"
                  value={input.falsoTechoTec_m2}
                  onChange={(e) => update({ falsoTechoTec_m2: parseFloat(e.target.value) || 0 })}
                />
                <p className="muted mt-1">{params.precios.falsoTechoTecnico_m2} €/m² (editable en parámetros)</p>
              </div>
            </div>
          </div>

          {/* Otros */}
          <div className="card">
            <h3 className="font-semibold mb-3">Otros</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="label">Habitaciones</label>
                <input
                  className="input"
                  type="number"
                  value={input.numHabitaciones}
                  onChange={(e) => update({ numHabitaciones: parseInt(e.target.value) || 0 })}
                />
                <p className="muted mt-1">{params.precios.habitacion_fija} € / habitación (editable)</p>
              </div>

              <div>
                <label className="label">Tabiquería interior</label>
                <select
                  className="select"
                  value={input.tabiqueria_tipo}
                  onChange={(e) => update({ tabiqueria_tipo: e.target.value })}
                >
                  <option>Ninguna</option>
                  <option>Obra</option>
                  <option>Pladur</option>
                </select>
                <input
                  className="input mt-2"
                  type="number"
                  placeholder="m²"
                  value={input.tabiqueria_m2}
                  onChange={(e) => update({ tabiqueria_m2: parseFloat(e.target.value) || 0 })}
                />
                <p className="muted mt-1">
                  Obra {params.precios.tabiqueria_obra_m2} €/m², Pladur {params.precios.tabiqueria_pladur_m2} €/m² (editables)
                </p>
              </div>

              <div>
                <label className="label">Baños (informativo)</label>
                <input
                  className="input"
                  type="number"
                  value={input.numBanos_info}
                  onChange={(e) => update({ numBanos_info: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="label">Reforma de cocina</label>
                <select
                  className="select"
                  value={input.cocina ? "Sí" : "No"}
                  onChange={(e) => update({ cocina: e.target.value === "Sí" })}
                >
                  <option>No</option>
                  <option>Sí</option>
                </select>
              </div>

              <div>
                <label className="label">Incluir fontanería</label>
                <select
                  className="select"
                  value={input.incluirFontaneria ? "Sí" : "No"}
                  onChange={(e) => update({ incluirFontaneria: e.target.value === "Sí" })}
                >
                  <option>No</option>
                  <option>Sí</option>
                </select>
              </div>

              <div>
                <label className="label">Incluir electricidad</label>
                <select
                  className="select"
                  value={input.incluirElectricidad ? "Sí" : "No"}
                  onChange={(e) => update({ incluirElectricidad: e.target.value === "Sí" })}
                >
                  <option>No</option>
                  <option>Sí</option>
                </select>
              </div>

              <div>
                <label className="label">Calidad de acabados</label>
                <select className="select" value={input.calidad} onChange={(e) => update({ calidad: e.target.value })}>
                  {Object.keys(params.factorCalidad).map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Ciudad</label>
                <select className="select" value={input.ciudad} onChange={(e) => update({ ciudad: e.target.value })}>
                  {Object.keys(params.referenciaCiudad).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <SummaryCard resultado={resultado} />
        </section>

        {/* Columna lateral */}
        <SidebarParams params={params} setParams={setParams} />
      </div>
    </>
  );
}
