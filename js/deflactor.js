/* Deflactación de importes según la guía metodológica (docs/metodologia/deflactacion.md). Los datos nominales no se modifican. */
(function () {
  const D = window.DEFLACTORES_DATA || {};
  const KEYS = {
    ipc: "IPC general (IPCA)",
    pib: "Deflactor del PIB",
    consumo: "Deflactor del consumo público",
    fbcf: "Deflactor de la FBCF (inversión)",
    laboral: "Coste laboral por asalariado público (proxy ICLH)"
  };
  const state = { on: false, key: "auto", base: 2024 };
  const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Partidas económicas: mandan sobre la función cuando aparecen en la ruta del nodo.
  const ECON = [
    [/remuneracion|gastos de personal/, "laboral"],
    [/formacion bruta de capital|^inversion$|inversiones reales/, "fbcf"],
    [/prestaciones|pensiones/, "ipc"],
    [/consumos? intermedios|bienes y servicios/, "consumo"]
  ];
  const SOCIAL = /proteccion social|vejez|supervivientes|desempleo|enfermedad e incapacidad|familia e hijos|exclusion social|promocion social/;
  const FINANCIAL = /deuda|transferencias a administraciones|regulacion financiera/;
  const CHAPTER = /^\d\. /;

  // names: ruta desde la raíz hasta el nodo; source: «eurostat» (COFOG) o «hacienda» (áreas y capítulos).
  function classify(names, source) {
    const path = names.map(norm).reverse();
    for (const n of path) for (const [re, key] of ECON) if (re.test(n)) return key;
    if (path.some(n => CHAPTER.test(n))) return "pib";
    for (const n of path) {
      if (SOCIAL.test(n)) return "ipc";
      if (FINANCIAL.test(n)) return "pib";
    }
    if (source === "hacienda") return path.length > 1 ? "consumo" : "pib";
    const cofog = new Set((window.FUNCIONES_COFOG || []).map(norm));
    return path.some(n => cofog.has(n)) ? "consumo" : "pib";
  }

  const index = (key, year) => (D[key] || {})[year] ?? null;
  const resolve = nodeKey => state.key === "auto" ? nodeKey : state.key;
  // Factor para expresar un importe de `year` en precios del año base; 1 si no se deflacta.
  function factor(nodeKey, year) {
    if (!state.on) return 1;
    const k = resolve(nodeKey), a = index(k, state.base), b = index(k, year);
    return a && b ? a / b : 1;
  }
  const suffix = () => state.on ? ` · € constantes de ${state.base}` : "";
  const years = () => Object.keys(D.pib || {}).map(Number).sort((a, b) => a - b);
  const describe = nodeKeys => {
    const ks = state.key === "auto" ? [...new Set(nodeKeys)] : [state.key];
    return ks.map(k => KEYS[k]).filter(Boolean).join("; ");
  };

  window.Deflactor = { KEYS, state, classify, index, resolve, factor, suffix, years, describe };
})();
