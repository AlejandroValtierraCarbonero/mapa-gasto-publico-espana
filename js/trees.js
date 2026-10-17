/* Definición de las jerarquías. Cada hoja suma códigos de data.js (con signo opcional "-"). */
(function () {
  const leaf = (name, ...codes) => ({ name, codes });

  const INGRESOS = [
    { name: "Cotizaciones sociales", children: [
      { name: "Cotizaciones de empleadores", codes: ["D611REC"] },
      { name: "Cotizaciones de hogares", codes: ["D613REC"] },
      { name: "Otras (imputadas y voluntarias)", codes: ["D61REC", "-D611REC", "-D613REC"] }] },
    { name: "Impuestos sobre renta y patrimonio (IRPF, Sociedades…)", children: [
      leaf("IRPF, Sociedades, Patrimonio y otros", "D5REC")] },
    { name: "Impuestos sobre producción e importaciones", children: [
      leaf("IVA", "D211REC"),
      leaf("Especiales y otros sobre productos", "D2REC", "-D211REC", "-D29REC"),
      leaf("Otros sobre la producción", "D29REC")] },
    { name: "Ventas y producción propia", children: [
      leaf("Ventas, tasas y producción para uso propio", "P11_P12_P131")] },
    { name: "Transferencias de capital", children: [leaf("Transferencias de capital recibidas", "D9REC")] },
    { name: "Transferencias corrientes", children: [leaf("Transferencias corrientes recibidas", "D7REC")] },
    { name: "Rentas de la propiedad", children: [
      leaf("Intereses recibidos", "D41REC"),
      leaf("Dividendos y otras rentas", "D42_TO_D45REC")] }
  ];

  const GASTOS_TIPO = [
    { name: "Prestaciones sociales", children: [
      leaf("Prestaciones monetarias (pensiones, paro…)", "D62PAY"),
      leaf("Prestaciones en especie", "D632PAY")] },
    { name: "Remuneración de asalariados", children: [
      leaf("Sueldos y cotizaciones de empleados públicos", "D1PAY")] },
    { name: "Consumos intermedios", children: [leaf("Compras de bienes y servicios", "P2")] },
    { name: "Inversión", children: [leaf("Formación de capital y adquisiciones netas", "OP5ANP")] },
    { name: "Intereses de la deuda", children: [
      leaf("Intereses", "D41PAY"),
      leaf("Otras rentas de la propiedad", "D42_TO_D45PAY")] },
    { name: "Transferencias corrientes", children: [leaf("Transferencias corrientes pagadas", "D7PAY")] },
    { name: "Subvenciones", children: [leaf("Subvenciones a empresas", "D3PAY")] },
    { name: "Transferencias de capital", children: [leaf("Transferencias de capital pagadas", "D9PAY")] },
    { name: "Otros impuestos pagados", children: [leaf("Otros impuestos sobre la producción y renta", "D29PAY", "D5PAY")] }
  ];

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

  const GASTOS_FUNCION = Object.keys(FUNCIONES).filter(c => c.length === 4).map(top => ({
    name: FUNCIONES[top],
    children: Object.keys(FUNCIONES).filter(c => c.length === 6 && c.startsWith(top))
      .map(c => ({ name: FUNCIONES[c], codes: [c] }))
  }));

  window.TREES = {
    ingresos: { name: "Ingresos", children: INGRESOS, total: "TR" },
    gastosTipo: { name: "Gastos", children: GASTOS_TIPO, total: "TE" },
    gastosFuncion: { name: "Gastos", children: GASTOS_FUNCION, total: "TE", source: "cofog" }
  };
})();
