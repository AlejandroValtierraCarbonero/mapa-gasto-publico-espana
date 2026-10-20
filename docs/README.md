# Documentación del proyecto

Documentación de diseño del mapa de gasto público (web estática). Se organiza en tres áreas, cada una con su índice:

| Área | Contenido | Índice |
|---|---|---|
| UX | Hallazgos y recomendaciones de experiencia de usuario (`UX-NNN`) | [ux/README.md](ux/README.md) |
| Accesibilidad | Auditoría WCAG 2.2 AA (`A11Y-NNN`) | [accesibilidad/README.md](accesibilidad/README.md) |
| Técnico | Diseño técnico para aplicar lo anterior (`TEC-NNN`) | [tecnico/README.md](tecnico/README.md) |
| Metodología | Criterios de medición de los datos | [metodologia/deflactacion.md](metodologia/deflactacion.md) |

## Convención

- **Documentos granulares**: un tema por archivo, con hallazgo, recomendación y criterios de aceptación (UX y accesibilidad) o con origen, aplicación técnica, ficheros y pruebas (técnico).
- **IDs estables**: `UX-001…`, `A11Y-001…` y `TEC-001…`. El ID no cambia aunque se renombre el archivo; los índices muestran la correspondencia.
- **Referencias cruzadas**: enlaces markdown relativos. Cada TEC tiene secciones **Origen** (UX/A11Y que implementa) y **Relacionados** (otros TEC); los índices UX y accesibilidad tienen una sección «Implementación técnica» y cada documento enlaza de vuelta a sus TEC.
- **Trazabilidad**: [tecnico/trazabilidad.md](tecnico/trazabilidad.md) cruza cada recomendación con los TEC que la aplican.
- **Flujo recomendado**: UX/accesibilidad definen *qué* y los criterios de aceptación; técnico define *cómo* y las pruebas ([TEC-011](tecnico/TEC-011-fases-implementacion.md) ordena las fases).
