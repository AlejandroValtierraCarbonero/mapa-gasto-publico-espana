/* Definición de las jerarquías.
   Nodo: { name, codes?, source?, children?, rest? }
   - codes: códigos de data.js (con signo opcional "-") que dan el valor propio del nodo; source: bloque de data.js
     ("main", "tax", "cofog" o "exp"; por defecto "main").
   - Si un nodo tiene codes y children, la app añade una hoja «Otros / no desglosado» (nombre en `rest`) con la diferencia.
   - Si no tiene codes, su valor es la suma de sus hijos. */
(function () {
  const L = (name, codes, source) => ({ name, codes: [].concat(codes), source });
  const N = (name, codes, children, rest, source) => ({ name, codes: codes && [].concat(codes), source, children, rest });
  const G = (name, children) => ({ name, children });

  const SUBSECTORES = { S1311: "Estado (Administración Central)", S1312: "Comunidades Autónomas", S1313: "Entes locales", S1314: "Seguridad Social" };

  /* ---------- INGRESOS ---------- */
  // detalle = true usa gov_10a_taxag (impuestos y cotizaciones por tipo)
  function ingresos(detalle) {
    const cotiz = detalle
      ? N("Cotizaciones sociales", "D61REC", [
        N("Cotizaciones de empleadores", "D611REC", [
          L("Obligatorias de empleadores", "D611C", "tax"), L("Voluntarias de empleadores", "D611V", "tax")], "Otras de empleadores"),
        L("Cotizaciones imputadas de empleadores", "D612", "tax"),
        N("Cotizaciones de hogares", "D613REC", [
          L("Asalariados", "D613CE", "tax"), L("Autónomos", "D613CS", "tax"),
          L("No ocupados", "D613CN", "tax"), L("Voluntarias de hogares", "D613V", "tax")], "Otras de hogares")], "Otras cotizaciones")
      : N("Cotizaciones sociales", "D61REC", [
        L("Cotizaciones de empleadores", "D611REC"), L("Cotizaciones de hogares", "D613REC")], "Imputadas y otras cotizaciones");

    const produccion = detalle
      ? N("Impuestos sobre producción e importaciones", "D2REC", [
        L("IVA", "D211REC"),
        N("Otros impuestos sobre productos", ["D21REC", "-D211REC"], [
          N("Aduanas e impuestos sobre importaciones", "D212", [
            L("Aranceles", "D2121", "tax"), L("Otros impuestos sobre importaciones", "D2122", "tax")], "Otros sobre importaciones", "tax"),
          L("Impuestos especiales (hidrocarburos, tabaco, alcohol…)", "D214A", "tax"),
          L("Operaciones financieras y patrimoniales (ITP, AJD…)", "D214C", "tax"),
          L("Matriculación de vehículos", "D214D", "tax"),
          L("Loterías, juego y apuestas", "D214F", "tax"),
          L("Primas de seguros", "D214G", "tax"),
          L("Otros servicios específicos", "D214H", "tax"),
          L("Ventas generales (IGIC, otros)", "D214I", "tax"),
          L("Otros impuestos sobre productos n.c.o.p.", "D214L", "tax")], "Otros sobre productos"),
        N("Otros impuestos sobre la producción", "D29REC", [
          L("Suelo, edificios y construcciones (IBI…)", "D29A", "tax"),
          L("Uso de activos fijos (circulación…)", "D29B", "tax"),
          L("Licencias y actividades profesionales (IAE…)", "D29E", "tax"),
          L("Contaminación", "D29F", "tax"),
          L("Otros sobre la producción n.c.o.p.", "D29H", "tax")], "Otros sobre la producción")], "Otros impuestos sobre producción")
      : N("Impuestos sobre producción e importaciones", "D2REC", [
        L("IVA", "D211REC"),
        L("Especiales y otros sobre productos", ["D21REC", "-D211REC"]),
        L("Otros sobre la producción", "D29REC")]);

    const renta = detalle
      ? N("Impuestos sobre renta y patrimonio", "D5REC", [
        N("Impuestos sobre la renta", "D51", [
          L("IRPF (hogares)", "D51A_C1", "tax"), L("Impuesto sobre Sociedades", "D51B_C2", "tax")], "Otros sobre la renta", "tax"),
        N("Otros impuestos corrientes", "D59", [
          L("Impuestos corrientes sobre el capital (patrimonio…)", "D59A", "tax"),
          L("Licencias pagadas por hogares", "D59D", "tax"),
          L("Otros impuestos corrientes n.c.o.p.", "D59F", "tax")], "Otros corrientes", "tax")], "Otros sobre renta y patrimonio")
      : L("IRPF, Sociedades, Patrimonio y otros", "D5REC");

    const capital = N("Transferencias de capital", "D9REC", detalle ? [
      N("Impuestos sobre el capital", "D91REC", [
        L("Sucesiones y donaciones", "D91A", "tax"), L("Gravámenes sobre el capital", "D91B", "tax")], "Otros impuestos de capital"),
      L("Ayudas a la inversión y otras transferencias de capital", "D92_D99REC")
    ] : [
      L("Impuestos sobre el capital", "D91REC"),
      L("Ayudas a la inversión y otras transferencias de capital", "D92_D99REC")], "Otras transferencias de capital");

    return [
      cotiz, renta, produccion,
      N("Ventas y producción propia", "P11_P12_P131", [
        L("Producción de mercado y para uso propio", "P11_P12"), L("Pagos por producción no de mercado", "P131")], "Otras ventas"),
      capital,
      N("Transferencias corrientes", "D7REC", [L("De instituciones de la UE", "D7REC_S212")], "Otras transferencias corrientes"),
      N("Rentas de la propiedad", "D4REC", [L("Intereses recibidos", "D41REC"), L("Dividendos y otras rentas", "D42_TO_D45REC")], "Otras rentas"),
      L("Otras subvenciones a la producción", "D39REC")
    ];
  }

  /* ---------- GASTOS POR TIPO ---------- */
  const entreAAPP = pre => Object.entries(SUBSECTORES).map(([s, n]) => L("A " + n, pre + "_" + s));
  const GASTOS_TIPO = [
    G("Prestaciones sociales", [L("Prestaciones monetarias (pensiones, paro…)", "D62PAY"), L("Prestaciones en especie", "D632PAY")]),
    L("Remuneración de asalariados", "D1PAY"),
    L("Consumos intermedios", "P2"),
    N("Inversión", "OP5ANP", [
      L("Formación bruta de capital fijo", "P51G"), L("Existencias y objetos de valor", "P52_P53"),
      L("Activos no producidos (terrenos…)", "NP")], "Otra inversión"),
    N("Intereses y rentas de la propiedad", "D4PAY", [L("Intereses", "D41PAY"), L("Otras rentas de la propiedad", "D42_TO_D45PAY")], "Otras rentas pagadas"),
    N("Transferencias corrientes", "D7PAY", [
      L("Recursos propios de la UE (IVA y RNB)", "D76PAY"), L("Cooperación internacional con la UE", "D74PAY_S212"),
      ...entreAAPP("D7PAY")], "Otras transferencias corrientes (resto del mundo, hogares…)"),
    N("Subvenciones", "D3PAY", [L("Subvenciones a productos", "D31PAY"), L("Otras subvenciones a la producción", "D39PAY")], "Otras subvenciones"),
    N("Transferencias de capital", "D9PAY", [
      L("A instituciones de la UE", "D9PAY_S212"), ...entreAAPP("D9PAY")], "Ayudas a la inversión y otras (sector privado y resto)"),
    L("Otros impuestos pagados", ["D29PAY", "D5PAY"])
  ];

  /* ---------- COFOG ---------- */
  const FUNCIONES = {
    GF01: "Servicios públicos generales", GF02: "Defensa", GF03: "Orden público y seguridad",
    GF04: "Asuntos económicos", GF05: "Protección del medio ambiente", GF06: "Vivienda y servicios comunitarios",
    GF07: "Sanidad", GF08: "Ocio, cultura y religión", GF09: "Educación", GF10: "Protección social",
    GF0101: "Órganos ejecutivos, legislativos y asuntos exteriores", GF0102: "Ayuda económica exterior",
    GF0103: "Servicios generales", GF0104: "Investigación básica", GF0105: "I+D servicios generales",
    GF0106: "Servicios públicos generales n.c.o.p.", GF0107: "Deuda pública", GF0108: "Transferencias entre administraciones",
    GF0201: "Defensa militar", GF0202: "Defensa civil", GF0203: "Ayuda militar exterior", GF0204: "I+D defensa", GF0205: "Defensa n.c.o.p.",
    GF0301: "Policía", GF0302: "Protección contra incendios", GF0303: "Tribunales de justicia", GF0304: "Prisiones",
    GF0305: "I+D orden público", GF0306: "Orden público n.c.o.p.",
    GF0401: "Asuntos económicos, comerciales y laborales", GF0402: "Agricultura, silvicultura, pesca y caza",
    GF0403: "Combustibles y energía", GF0404: "Minería, industria y construcción", GF0405: "Transporte",
    GF0406: "Comunicaciones", GF0407: "Otras ramas", GF0408: "I+D asuntos económicos", GF0409: "Asuntos económicos n.c.o.p.",
    GF0501: "Gestión de residuos", GF0502: "Aguas residuales", GF0503: "Reducción de la contaminación",
    GF0504: "Biodiversidad y paisaje", GF0505: "I+D medio ambiente", GF0506: "Medio ambiente n.c.o.p.",
    GF0601: "Urbanización", GF0602: "Desarrollo comunitario", GF0603: "Abastecimiento de agua",
    GF0604: "Alumbrado público", GF0605: "I+D vivienda", GF0606: "Vivienda n.c.o.p.",
    GF0701: "Productos y equipos médicos", GF0702: "Servicios ambulatorios", GF0703: "Servicios hospitalarios",
    GF0704: "Salud pública", GF0705: "I+D sanidad", GF0706: "Sanidad n.c.o.p.",
    GF0801: "Servicios recreativos y deportivos", GF0802: "Servicios culturales", GF0803: "Radiodifusión y editoriales",
    GF0804: "Servicios religiosos y comunitarios", GF0805: "I+D ocio y cultura", GF0806: "Ocio y cultura n.c.o.p.",
    GF0901: "Infantil y primaria", GF0902: "Secundaria", GF0903: "Postsecundaria no terciaria", GF0904: "Universidades y terciaria",
    GF0905: "Enseñanza sin nivel definido", GF0906: "Servicios auxiliares", GF0907: "I+D educación", GF0908: "Educación n.c.o.p.",
    GF1001: "Enfermedad e incapacidad", GF1002: "Vejez (pensiones)", GF1003: "Supervivientes", GF1004: "Familia e hijos",
    GF1005: "Desempleo", GF1006: "Vivienda (ayudas)", GF1007: "Exclusión social", GF1008: "I+D protección social",
    GF1009: "Protección social n.c.o.p."
  };
  const DIVS = Object.keys(FUNCIONES).filter(c => c.length === 4);
  const GRUPOS = d => Object.keys(FUNCIONES).filter(c => c.length === 6 && c.startsWith(d));

  // Tipos de gasto de gov_10a_exp (na_item) que, sumados, dan el total de cada función
  const TIPOS = [
    ["D62", "Prestaciones monetarias"], ["D632", "Prestaciones en especie"], ["D1", "Remuneración de asalariados"],
    ["P2", "Consumos intermedios"], ["OP5ANP", "Inversión"], ["D4", "Intereses y rentas de la propiedad"],
    ["D7", "Transferencias corrientes"], ["D3", "Subvenciones"], ["D9", "Transferencias de capital"],
    ["D29_D5_D8", "Otros impuestos y ajustes"]
  ];

  // Función → grupo → tipo de gasto
  const GASTOS_FUNCION = DIVS.map(d => N(FUNCIONES[d], d, GRUPOS(d).map(g =>
    N(FUNCIONES[g], g, TIPOS.map(([t, n]) => L(n, g + "|" + t, "exp")), "Otros tipos", "cofog")), "Otros grupos", "cofog"));

  // Tipo de gasto → función → grupo
  const GASTOS_TIPO_FUNCION = TIPOS.map(([t, n]) => G(n, DIVS.map(d =>
    N(FUNCIONES[d], d + "|" + t, GRUPOS(d).map(g => L(FUNCIONES[g], g + "|" + t, "exp")), "Otros grupos", "exp"))));

  const root = (name, total, children, needs) => ({ name, codes: [total], children, needs, rest: "Otros / no desglosado" });

  window.SUBSECTORES = SUBSECTORES;
  window.TREES = {
    ingresos: root("Ingresos", "TR", ingresos(false), "main"),
    ingresosDetalle: root("Ingresos", "TR", ingresos(true), "tax"),
    gastosTipo: root("Gastos", "TE", GASTOS_TIPO, "main"),
    gastosFuncion: root("Gastos", "TE", GASTOS_FUNCION, "exp"),
    gastosTipoFuncion: root("Gastos", "TE", GASTOS_TIPO_FUNCION, "exp")
  };
})();