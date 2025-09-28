import { useMemo, useState } from "react";
import Link from "next/link";
import { calcularPresupuesto } from "@/lib/calculo";
import SummaryCard from "@/components/SummaryCard";
import SidebarParams, { defaultParams } from "@/components/SidebarParams";

const steps = [
  { key: "ciudad", label: "¿En qué ciudad es la reforma?", type: "select", optionsFrom: (params)=>Object.keys(params.referenciaCiudad) },
  { key: "calidad", label: "¿Qué nivel de calidad buscas?", type: "chips", options: ["Basico", "Estandar", "Premium"] },
  { key: "m2", label: "¿Cuántos m² tiene?", type: "number", placeholder: "Ej. 100" },
  { key: "incluirDerribo", label: "¿Incluimos derribo base?", type: "chips", options: ["Sí","No"], map: v=> v==="Sí" },
  { key: "tabiqueria_tipo", label: "¿Tabiquería de Obra o Pladur?", type: "chips", options: ["Obra","Pladur","Ninguna"] },
  { key: "tabiqueria_m2", label: "¿Cuántos m² de tabiquería?", type: "number", placeholder: "0 si no aplica" },
  { key: "cocina", label: "¿Incluye cocina fija?", type: "chips", options: ["Sí","No"], map: v=> v==="Sí" },
  { key: "numHabitaciones", label: "¿Número de habitaciones?", type: "number" },
  { key: "falsoTecho_m2", label: "¿m² de falso techo?", type: "number" }
];

export default function Chat(){
  const [params, setParams] = useState(defaultParams);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState({
    ciudad: defaultParams.ciudadPorDefecto,
    calidad: "Estandar",
    m2: 0,
    incluirDerribo: false,
    tabiqueria_tipo: "Ninguna",
    tabiqueria_m2: 0,
    cocina: false,
    numHabitaciones: 0,
    falsoTecho_m2: 0
  });

  const resultado = useMemo(()=>calcularPresupuesto({
    ...input,
    tabiqueria_tipo: input.tabiqueria_tipo==="Ninguna" ? "" : input.tabiqueria_tipo
  }, params), [input, params]);

  const step = steps[idx];
  const back = ()=> setIdx(i => Math.max(0, i-1));
  const next = ()=> setIdx(i => Math.min(steps.length-1, i+1));

  const setAnswer = (value)=>{
    if (step.key === "incluirDerribo"){
      setInput(prev=>({...prev, incluirDerribo: value==="Sí"}));
    } else if (step.key === "cocina"){
      setInput(prev=>({...prev, cocina: value==="Sí"}));
    } else if (step.key === "tabiqueria_tipo"){
      setInput(prev=>({...prev, tabiqueria_tipo: value==="Ninguna" ? "Ninguna" : value}));
    } else if (step.type === "number"){
      setInput(prev=>({...prev, [step.key]: Number(value)||0}));
    } else {
      setInput(prev=>({...prev, [step.key]: value}));
    }
    next();
  };

  const exportJSON = () => {
    const payload = { input, params, resultado };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat_calculo_reforma.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePDF = async () => {
    const { exportarPDF } = await import("@/lib/pdf");
    await exportarPDF({ input, resultado });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="dark-header">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="btn btn-ghost" onClick={back}>← Atrás</button>
            <h1 className="font-semibold">Chat asistido</h1>
          </div>
          <nav className="space-x-3 text-sm">
            <Link href="/" className="hover:underline">Formulario</Link>
            <a href="#" onClick={e=>{e.preventDefault(); exportJSON();}} className="btn btn-ghost">Export JSON</a>
            <button className="btn btn-primary" onClick={handlePDF}>Export PDF</button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-[1fr_320px] gap-6">
        <section className="space-y-4">
          <div className="card">
            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Paso {idx+1} de {steps.length}</div>
              <h2 className="text-lg font-semibold">{step.label}</h2>
            </div>

            {step.type === "chips" && (
              <div className="flex flex-wrap gap-2">
                {step.options.map(opt => (
                  <button key={opt} className="chip" onClick={()=>setAnswer(opt)}>{opt}</button>
                ))}
              </div>
            )}

            {step.type === "number" && (
              <div className="flex items-center gap-3">
                <input
                  className="input max-w-xs"
                  type="number"
                  placeholder={step.placeholder||""}
                  value={input[step.key]}
                  onChange={e=>setAnswer(e.target.value)}
                />
                <button className="btn btn-primary" onClick={next}>Continuar</button>
              </div>
            )}

            {step.type === "select" && (
              <select
                className="input max-w-xs"
                value={input[step.key]}
                onChange={e=>setAnswer(e.target.value)}
              >
                {(step.optionsFrom ? step.optionsFrom(params) : step.options).map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2">Edición puntual</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">m²</label>
                <input className="input" type="number" value={input.m2}
                  onChange={e=>setInput(prev=>({...prev, m2: parseFloat(e.target.value)||0}))} />
              </div>
              <div>
                <label className="label">Tabiquería m²</label>
                <input className="input" type="number" value={input.tabiqueria_m2}
                  onChange={e=>setInput(prev=>({...prev, tabiqueria_m2: parseFloat(e.target.value)||0}))} />
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <SummaryCard resultado={resultado} />
          <SidebarParams params={params} setParams={setParams} />
        </div>
      </main>
    </div>
  );
}
