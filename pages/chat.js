import { useEffect, useMemo, useRef, useState } from "react";
import { calcularPresupuesto } from "@/lib/calculo";
import SummaryCard from "@/components/SummaryCard";
import SidebarParams, { defaultParams } from "@/components/SidebarParams";

/** Pasos de conversación (formato chat) */
const steps = [
  { key: "ciudad", label: "¿En qué ciudad es la reforma?", type: "select", optionsFrom: (p)=>Object.keys(p.referenciaCiudad) },
  { key: "calidad", label: "¿Qué nivel de calidad buscas?", type: "chips", options: ["Basico", "Estandar", "Premium"] },
  { key: "m2", label: "¿Cuántos m² tiene?", type: "number", placeholder: "Ej. 100" },
  { key: "incluirDerribo", label: "¿Incluimos derribo base?", type: "chips", options: ["Sí","No"], map: v=> v==="Sí" },
  { key: "tabiqueria_tipo", label: "¿Tabiquería de Obra o Pladur?", type: "chips", options: ["Obra","Pladur","Ninguna"] },
  { key: "tabiqueria_m2", label: "¿Cuántos m² de tabiquería?", type: "number", placeholder: "0 si no aplica" },
  { key: "cocina", label: "¿Incluye cocina fija?", type: "chips", options: ["Sí","No"], map: v=> v==="Sí" },
  { key: "numHabitaciones", label: "¿Número de habitaciones?", type: "number" },
  { key: "falsoTecho_m2", label: "¿m² de falso techo?", type: "number" },
];

export default function Chat(){
  const [params, setParams] = useState(defaultParams);
  const [input, setInput] = useState({
    ciudad: defaultParams.ciudadPorDefecto,
    calidad: "Estandar",
    m2: 0,
    incluirDerribo: false,
    tabiqueria_tipo: "Ninguna",
    tabiqueria_m2: 0,
    cocina: false,
    numHabitaciones: 0,
    falsoTecho_m2: 0,
  });

  const [idx, setIdx] = useState(0);
  const [messages, setMessages] = useState([]);
  const endRef = useRef(null);

  const current = steps[idx];

  const resultado = useMemo(()=>calcularPresupuesto({
    ...input,
    tabiqueria_tipo: input.tabiqueria_tipo==="Ninguna" ? "" : input.tabiqueria_tipo
  }, params), [input, params]);

  useEffect(()=>{
    if (messages.length === 0) setMessages([{ role:"bot", text: steps[0].label }]);
  },[]);

  useEffect(()=>{
    endRef.current?.scrollIntoView({ behavior:"smooth" });
  },[messages]);

  const pushBot = (i) => {
    const s = steps[i];
    if (!s) return;
    setMessages(m => [...m, { role:"bot", text: s.label }]);
  };

  const handleAnswer = (raw) => {
    const s = steps[idx];
    if (!s) return;
    const value = s.type === "number" ? Number(raw)||0 : (s.map ? s.map(raw) : raw);

    setInput(prev => ({ ...prev, [s.key]: value }));
    setMessages(m => [...m, { role:"user", text: String(raw) }]);

    const next = idx + 1;
    setIdx(next);
    if (next < steps.length) pushBot(next);
    else setMessages(m => [...m, { role:"bot", text: "¡Listo! Ya tengo todo para calcular tu presupuesto." }]);
  };

  const goBack = () => {
    if (idx === 0) return;
    setMessages(m => {
      const copy = [...m];
      if (copy.at(-1)?.text?.startsWith("¡Listo!")) copy.pop();
      // quitar última respuesta del user
      while (copy.length && copy.at(-1).role !== "user") copy.pop();
      if (copy.length) copy.pop(); // quita user
      // quitar la última pregunta del bot
      while (copy.length && copy.at(-1).role !== "bot") copy.pop();
      if (copy.length) copy.pop(); // quita bot
      return copy;
    });
    setIdx(i => i - 1);
  };

  const handlePDF = async () => {
    const { exportarPDF } = await import("@/lib/pdf");
    await exportarPDF({ input, resultado });
  };

  // Composer según tipo
  const [numberVal, setNumberVal] = useState("");
  useEffect(()=>{ setNumberVal(""); }, [idx]);

  const Composer = () => {
    if (!current) return null;

    if (current.type === "chips") {
      return (
        <div className="flex flex-wrap gap-2">
          {current.options.map(opt => (
            <button key={opt} className="chip" onClick={()=>handleAnswer(opt)}>{opt}</button>
          ))}
        </div>
      );
    }

    if (current.type === "select") {
      const opts = current.optionsFrom ? current.optionsFrom(params) : current.options;
      return (
        <div className="flex gap-2">
          <select
            className="select max-w-xs"
            value={input[current.key]}
            onChange={e=>handleAnswer(e.target.value)}
          >
            {opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }

    // number
    return (
      <div className="flex gap-2">
        <input
          className="input max-w-xs"
          type="number"
          placeholder={current.placeholder || ""}
          value={numberVal}
          onChange={e=>setNumberVal(e.target.value)}
          onKeyDown={e=>{ if (e.key==="Enter") handleAnswer(numberVal); }}
        />
        <button className="btn btn-primary" onClick={()=>handleAnswer(numberVal)}>Enviar</button>
      </div>
    );
  };

  return (
    <>
      {/* Barra de acciones superior de la página: Atrás + PDF (solo arriba) */}
      <div className="flex items-center justify-between mb-4">
        <button className="btn" onClick={goBack} disabled={idx===0}>← Atrás</button>
        <button className="btn btn-primary" onClick={handlePDF}>Export PDF</button>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        {/* Chat */}
        <section className="space-y-4">
          <div className="card">
            <div className="h-[60vh] overflow-y-auto pr-2">
              {messages.map((m, i) => (
                <div key={i} className={`mb-2 flex ${m.role==="user" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-3 py-2 rounded-2xl max-w-[80%] ${
                    m.role==="user" ? "bg-black text-white" : "bg-gray-100"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="mt-3 border-t pt-3">
              <Composer />
            </div>
          </div>
        </section>

        {/* Resumen + parámetros */}
        <div className="space-y-4">
          <SummaryCard resultado={resultado} />
          <SidebarParams params={params} setParams={setParams} />
        </div>
      </div>
    </>
  );
}
