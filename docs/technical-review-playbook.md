# Playbook de auditoría técnica

Status: active
Owner: Website Lead
Last reviewed: 2026-11-10
Scope: revisión reproducible de cambios técnicos, visuales, funcionales y de contenido antes de aprobarlos.
Does not cover: implementación de correcciones, carga editorial ordinaria, publicación en producción ni cambios al modelo CMS.

## 1. Objetivo

Este documento permite que una persona nueva pueda tomar un cambio terminado y responder con evidencia:

> ¿El cambio cumple lo solicitado, coincide con el diseño aplicable y no rompe el comportamiento existente?

Una auditoría no consiste solamente en ejecutar tests. Reúne seis comprobaciones:

1. **Requisitos:** está claro qué resultado debía conseguirse.
2. **Alcance:** se identifica exactamente qué código se revisa.
3. **Implementación:** el diff es coherente, seguro y limitado al objetivo.
4. **Resultado:** la interfaz y el comportamiento cumplen los requisitos.
5. **Integración:** las fuentes de contenido y servicios reales funcionan cuando aplican.
6. **Regresión:** los controles automáticos y manuales no detectan roturas.

La salida de la auditoría es una decisión trazable: **aprobado**, **cambios solicitados** o **bloqueado**.

## 2. Conceptos básicos

| Concepto | Significado en este documento |
|---|---|
| Tarea o ticket | Unidad de trabajo que contiene resultado esperado, alcance y criterios de aceptación. |
| Criterio de aceptación | Condición observable que debe cumplirse para aprobar. |
| Commit | Registro identificado de un conjunto de cambios en Git. |
| Diff | Diferencia entre dos estados del código. Es el cambio que se inspecciona. |
| Working tree | Archivos presentes actualmente en el directorio de trabajo. Pueden incluir cambios sin commit. |
| Fixture | Contenido local controlado para desarrollar sin depender de Wix. |
| CMS | Sistema de contenido Wix usado por la aplicación real. |
| Frame | Pantalla o composición de referencia en Figma. |
| Breakpoint | Ancho en el que el layout cambia de una composición a otra. |
| Gate | Conjunto de controles obligatorios antes de avanzar a otra etapa. |
| Evidencia | Comando, captura, enlace o resultado que permite repetir o verificar una conclusión. |

## 3. Qué puede y qué no puede demostrar cada control

Ningún control cubre todo el sistema:

| Control | Demuestra | No demuestra |
|---|---|---|
| Inspección del diff | qué se modificó y si el cambio parece coherente | que el resultado funcione en ejecución |
| `npm test` | que pasan los escenarios automatizados existentes | fidelidad visual ni cobertura de escenarios no escritos |
| `npm run check` | tipos y plantillas detectables por Astro/TypeScript | comportamiento real del navegador |
| `npm run build` | que la aplicación puede construirse en esa configuración | que el sitio se vea bien o tenga datos correctos |
| Comparación con Figma | fidelidad visual en los tamaños revisados | comportamiento, CMS o anchos no revisados |
| Prueba manual | comportamiento de los escenarios ejecutados | ausencia de fallos en escenarios no probados |
| `npm run cms:audit` | estado verificable del modelo y los datos CMS auditados | fidelidad visual o aprobación editorial |
| `npm run assets:check` | consistencia del registro local de assets de Figma | comparación visual con los frames |

La aprobación requiere combinar todos los controles aplicables al riesgo del cambio.

## 4. Autoridad y fuentes de verdad

Cada pregunta tiene una fuente diferente:

| Pregunta | Fuente autoritativa |
|---|---|
| ¿Qué resultado se espera? | criterios de aceptación de la tarea o ticket |
| ¿Qué decisiones y restricciones deben respetarse? | ADRs aceptados en `docs/decisions/` |
| ¿Cómo funciona el sistema actualmente? | código y pruebas actuales del repositorio |
| ¿Cómo debe verse o qué contenido está aprobado? | referencia de diseño o contenido identificada por la tarea |
| ¿Quién revisa y cómo cambia el estado? | workflow activo |
| ¿Cómo se obtiene la evidencia técnica? | este playbook |
| ¿Cómo se desarrolla, previsualiza o publica? | `README.md` |

Si dos fuentes se contradicen, no resolver la contradicción por memoria ni asumir que el código existente siempre es correcto. Registrar el conflicto y obtener una decisión antes de aprobar.

Este playbook explica **cómo auditar**. No inventa requisitos ni reemplaza los criterios de aceptación.

## 5. Niveles de auditoría

### Nivel A: cambio técnico

Se aplica a todo cambio de código:

- delimitar e inspeccionar el diff;
- ejecutar los controles automáticos mínimos;
- probar manualmente el comportamiento afectado;
- registrar evidencia y decisión.

### Nivel B: interfaz visual

Se agrega cuando cambia una página, componente, estilo o contenido visible:

- ejecutar la aplicación;
- comparar con el diseño aprobado;
- revisar mobile, desktop y anchos intermedios;
- probar interacciones, teclado y errores del navegador.

### Nivel C: Wix CMS o integraciones

Se agrega cuando cambia contenido, consultas, mapeadores, relaciones, composición, rutas CMS o integraciones externas:

- comprobar fixtures y fuente real por separado;
- ejecutar la auditoría CMS aplicable;
- verificar errores, fallbacks y seguridad de datos;
- confirmar que la auditoría no escribió en producción.

### Nivel D: preview o release

Se usa antes de crear una preview o versión Wix:

- completar todos los niveles aplicables;
- ejecutar el gate completo;
- exigir un árbol Git limpio;
- seguir el runbook del `README.md`.

Un cambio puede requerir varios niveles. Por ejemplo, una página que obtiene datos nuevos de Wix requiere A, B y C.

## 6. Reglas del auditor

- Revisar contra criterios escritos, no contra el recuerdo de la implementación.
- Identificar el cambio exacto antes de ejecutar la aplicación.
- No aprobar controles omitidos sin indicar por qué no aplican.
- No convertir una limitación bloqueante en “seguimiento” para cerrar la tarea.
- No modificar producción, ejecutar seeds, publicar versiones ni activar indexación como parte de una auditoría ordinaria.
- No exponer secretos, tokens o valores de entorno en comandos, capturas o informes.
- No borrar, resetear ni guardar cambios ajenos sin autorización.
- Si el auditor también implementó el cambio, separar deliberadamente implementación y revisión.
- Si aparece un defecto, detener la aprobación, registrar el hallazgo y corregirlo fuera del estado de revisión.

## 7. Flujo completo

```text
1. Entender el resultado esperado
              ↓
2. Preparar el entorno
              ↓
3. Delimitar e inspeccionar el cambio
              ↓
4. Ejecutar la aplicación
              ↓
5. Auditar la interfaz visual
              ↓
6. Auditar comportamiento y accesibilidad
              ↓
7. Auditar CMS/integraciones si aplica
              ↓
8. Ejecutar controles automáticos
              ↓
9. Confirmar el estado final de Git
              ↓
10. Registrar evidencia y decidir
```

Las secciones siguientes describen cada paso.

## 8. Paso 1: definir el contrato de revisión

Antes de abrir el código, reunir:

- resultado esperado;
- criterios de aceptación verificables;
- rutas, componentes o servicios afectados;
- referencia visual o funcional aprobada;
- contenido provisional permitido;
- comportamiento que queda fuera del alcance;
- commit o rango de commits candidato;
- riesgos conocidos y dependencias externas.

Convertir los criterios en una lista comprobable:

| ID | Criterio | Cómo se verificará | Evidencia esperada |
|---|---|---|---|
| AC-01 | Describir un resultado observable | revisión visual, prueba manual o comando | captura, resultado o enlace |

No iniciar una aprobación si el resultado es ambiguo. “Mejorar la página” no es verificable; “la página reproduce las secciones y el orden del frame aprobado en mobile y desktop” sí lo es.

## 9. Paso 2: preparar el entorno

### 9.1 Requisitos locales

- Node.js 24.22.1 o posterior.
- npm y dependencias instaladas.
- Acceso a Figma cuando haya revisión visual.
- Cuenta Wix autenticada solamente cuando la validación requiera Wix.
- Criterios de aceptación y referencias accesibles.

Comprobar:

```bash
node --version
npm --version
git status --short --branch
git log -10 --oneline
```

En una instalación nueva, seguir primero `README.md`. No sobrescribir un archivo `.env` existente ni incluirlo en Git.

### 9.2 Confirmar el estado del repositorio

Antes de revisar, registrar:

- rama actual;
- commit actual (`HEAD`);
- archivos modificados o sin seguimiento;
- cambios previos que no pertenecen a la auditoría.

Para una aprobación reproducible se prefiere un working tree limpio. Si existen cambios no relacionados:

1. no borrarlos ni guardarlos sin autorización;
2. identificar a quién pertenecen;
3. usar otro worktree o esperar a que se separen si pueden afectar la ejecución;
4. no afirmar que se probó un commit aislado cuando el servidor cargó además cambios locales.

## 10. Paso 3: delimitar e inspeccionar el cambio

### 10.1 Elegir el objeto de revisión

Usar una sola modalidad y registrarla:

**Un commit:**

```bash
git show --stat <commit>
git show --check <commit>
git show --no-ext-diff <commit>
```

**Un rango de commits:**

```bash
git diff --stat <base>..<final>
git diff --check <base>..<final>
git diff <base>..<final>
```

**Cambios todavía sin commit:**

```bash
git diff --stat
git diff --check
git diff
git diff --cached --stat
git diff --cached --check
git diff --cached
```

No usar `origin/main..HEAD` automáticamente. Elegir `<base>` como el último commit anterior al trabajo que se quiere auditar.

### 10.2 Inspeccionar el diff

Comprobar:

- cada archivo corresponde al objetivo;
- no hay cambios accidentales o sin explicación;
- no hay secretos, tokens ni archivos de entorno;
- nombres, tipos y comentarios reflejan el comportamiento;
- errores y estados vacíos están tratados;
- no se duplicó lógica innecesariamente;
- rutas, enlaces e identificadores siguen las decisiones aceptadas;
- Wix nunca se completa silenciosamente con fixtures;
- los cambios de contenido provisional están identificados;
- existen pruebas para la lógica nueva o se explica la brecha;
- `git show --check` o `git diff --check` no reportan problemas.

Si el cambio contiene varios objetivos independientes, solicitar que se separen. Una auditoría debe poder explicar con una frase qué resultado está aprobando.

## 11. Paso 4: ejecutar la aplicación

### 11.1 Perfil local con fixtures

Para una revisión reproducible de la interfaz sin depender de Wix:

```bash
npm run dev:local
```

Abrir la URL que Astro imprime en la terminal y navegar a todas las rutas incluidas en el alcance. La dirección suele ser `http://localhost:4321`, pero debe usarse la URL realmente mostrada.

Los fixtures permiten revisar layout y comportamiento local. No demuestran que Wix tenga datos correctos.

Mantener esa terminal abierta durante la prueba y pulsar `Ctrl+C` para detener el servidor al terminar.

Para probar desde un teléfono en la misma red:

```bash
npm run dev:local -- --host
```

La opción `--host` expone el servidor a la red local; no publica el sitio.

### 11.2 Perfil con Wix

Usarlo cuando el cambio afecta consultas, mapeadores, colecciones, relaciones, publicación o composición:

1. confirmar que el archivo de entorno local no versionado usa `CONTENT_SOURCE=wix`;
2. ejecutar:

```bash
npm run dev
```

3. abrir las mismas rutas probadas con fixtures;
4. confirmar que el contenido procede de Wix;
5. confirmar que un dato obligatorio ausente falla visiblemente en lugar de usar fixtures;
6. registrar el entorno consultado sin copiar credenciales;
7. restaurar el perfil local habitual al terminar si fue cambiado.

Levantar el servidor con Wix es una operación de lectura. No ejecutar seeds, importaciones o escrituras como parte de esta revisión.

## 12. Paso 5: auditoría visual

Esta sección se aplica cuando cambia algo visible. La suite actual no contiene regresión visual automática; la comparación debe hacerse manualmente y quedar documentada.

### 12.1 Preparar Figma y navegador

1. Abrir los frames aprobados que correspondan al alcance.
2. Registrar archivo, página, nombre del frame, identificador y dimensiones.
3. Abrir las herramientas de desarrollo del navegador.
4. Configurar el viewport con el ancho exacto del frame.
5. Mantener el zoom del navegador en 100 %.
6. Esperar a que terminen de cargar fuentes, estilos, imágenes y datos.
7. Usar un navegador y versión identificables en la evidencia.

No redimensionar una captura para forzar coincidencia. Diseño y navegador deben compararse al mismo ancho.

### 12.2 Matriz mínima de anchos

Si los requisitos no definen otra matriz, revisar:

| Ancho | Motivo |
|---|---|
| 320 px | móvil estrecho y detección de overflow |
| ancho exacto del frame mobile | fidelidad con el diseño mobile |
| 768 px | composición intermedia/tablet |
| 1023 px | estado inmediatamente anterior a `lg` |
| 1024 px | entrada al layout `lg` |
| ancho exacto del frame desktop | fidelidad con el diseño desktop |
| 1440 px | expansión en pantalla grande |

No repetir un ancho si coincide con el frame exacto. Si el cambio usa otro breakpoint, agregar un valor justo antes y otro justo después.

### 12.3 Comparar de arriba abajo

Para cada sección comprobar:

- existencia, orden y visibilidad;
- ancho, columnas, alineación y ritmo vertical;
- tipografía, tamaño, peso, interlineado y saltos de línea;
- colores, fondos, bordes, radios y sombras;
- proporción, recorte y posición de imágenes o placeholders;
- espaciado entre textos, medios y controles;
- contenido y orden específicos de mobile o desktop;
- header, navegación y footer;
- ausencia de scroll horizontal, solapamientos y elementos cortados;
- estados vacíos, textos largos y contenido provisional;
- estabilidad durante la carga.

Comparar lado a lado. Si la diferencia es difícil de detectar, tomar capturas con el mismo tamaño y superponerlas con transparencia. “Se ve bien” no es evidencia suficiente.

### 12.4 Clasificar hallazgos visuales

| Severidad | Ejemplo | Tratamiento |
|---|---|---|
| Bloqueante | contenido inaccesible, layout inutilizable, control oculto | no aprobar |
| Importante | estructura, jerarquía o espaciado claramente incorrectos | corregir antes de aprobar |
| Menor | desviación pequeña sin impacto funcional | documentar y decidir según tolerancia acordada |
| Intencional | placeholder o diferencia previamente aprobada | registrar como decisión, no ocultarla |

Una diferencia menor solo puede quedar como seguimiento si los criterios permiten aprobarla.

## 13. Paso 6: auditoría funcional y accesibilidad básica

Probar lo que una captura no demuestra:

- navegación principal y mobile;
- enlaces internos y recarga directa de las rutas;
- enlaces externos y destinos permitidos;
- botones, CTAs, accordions, FAQ, carruseles, filtros y formularios;
- estados inicial, loading, vacío, éxito y error cuando existan;
- retroceso y avance del navegador cuando corresponda;
- teclado, orden de foco y foco visible;
- zoom del navegador al 200 % en interfaces críticas;
- títulos, jerarquía de encabezados y textos alternativos aplicables;
- ausencia de errores relevantes en la consola;
- ausencia de solicitudes fallidas inesperadas en Network;
- metadatos, canonical y `noindex` cuando entren en el alcance.

Para rutas dinámicas, filtros o variantes, probar como mínimo:

1. un caso válido;
2. un caso vacío cuando sea posible;
3. un caso inválido o inexistente;
4. el límite más relevante del componente.

Registrar exactamente qué escenarios se ejecutaron. No declarar “todo funciona” si solo se abrió una ruta.

## 14. Paso 7: auditoría de contenido, CMS e integraciones

Aplicar cuando el cambio dependa de Wix o de servicios externos.

### 14.1 Wix CMS

Comprobar:

- colección y campos correctos;
- referencias y multi-referencias correctas;
- significado correcto de `published`, `enabled` y estados de negocio;
- slugs, route keys y relaciones canónicas;
- orden de secciones e items;
- tratamiento visible de datos obligatorios ausentes;
- ausencia de mezcla Wix → fixtures;
- contenido provisional claramente identificado;
- URLs y valores comerciales pendientes documentados;
- cero escrituras en producción durante la auditoría.

Ejecutar cuando aplique:

```bash
npm run cms:audit
```

Un resultado correcto con fixtures no sustituye esta validación.

### 14.2 Integraciones externas

Para reservas, formularios, autenticación, analytics u otros proveedores:

- usar el entorno de prueba o destino autorizado;
- no enviar datos personales reales;
- comprobar URLs, parámetros y allowlists;
- verificar éxito, error y cancelación cuando sea posible;
- registrar cualquier dependencia que no pudo verificarse;
- solicitar revisión adicional para pagos, privacidad, permisos o acciones destructivas.

## 15. Paso 8: controles automáticos

### 15.1 Matriz de comandos

| Comando | Cuándo es obligatorio |
|---|---|
| `git diff --check` o `git show --check` | siempre, usando el objeto de revisión correcto |
| `npm test` | todo cambio de código o configuración |
| `npm run check` | todo cambio de Astro, TypeScript, contenido tipado o configuración |
| `npm run build` | páginas, rutas, layouts, middleware, Wix, renderizado, hosting o gate de preview/release |
| `npm run assets:check` | cambios en assets o gate de preview/release |
| `npm run cms:audit` | cambios CMS/Wix o gate de preview/release |

Para un cambio exclusivamente documental, normalmente basta con revisar enlaces, comandos, coherencia y ejecutar `git diff --check`. Registrar por qué los controles de aplicación no aplican.

### 15.2 Mínimo para código

```bash
npm test
npm run check
```

Todo fallo debe resolverse o clasificarse antes de aprobar. No asumir que un fallo “ya existía”: demostrarlo comparando con la base o registrar que no pudo verificarse.

### 15.3 Gate completo antes de preview o release

```bash
npm test
npm run check
npm run build
npm run assets:check
npm run cms:audit
git status --short
```

No avanzar si falla un comando, el CMS no puede auditarse o aparecen cambios Git inesperados. Este gate no autoriza por sí mismo a crear una preview o release.

## 16. Paso 9: comprobar el estado final

Repetir la inspección del objeto auditado:

```bash
git status --short --branch
git show --stat <commit>
git show --check <commit>
```

Para un rango o working tree, usar los comandos equivalentes de la sección 10.

Confirmar:

- el código ejecutado coincide con el cambio inspeccionado;
- no quedaron correcciones locales fuera del objeto auditado;
- los comandos no generaron archivos inesperados;
- el cambio conserva un único objetivo lógico;
- no aparecieron secretos ni datos sensibles;
- todas las limitaciones están registradas;
- cada criterio de aceptación tiene un resultado.

Si el cambio se modifica después de un hallazgo, la aprobación anterior deja de ser válida. Repetir al menos la inspección del diff, los controles afectados y las pruebas manuales relacionadas.

## 17. Paso 10: registrar evidencia

La evidencia debe permitir que otra persona entienda qué se revisó sin reconstruir la sesión.

### Plantilla

```text
DECISIÓN: APPROVED / CHANGES REQUESTED / BLOCKED

ALCANCE
- Resultado esperado:
- Rutas/componentes/servicios:
- Commit, rango o working tree:
- Incluido:
- Excluido:

CRITERIOS DE ACEPTACIÓN
- AC-01: PASS / FAIL / BLOCKED — evidencia
- AC-02: PASS / FAIL / BLOCKED — evidencia

ENTORNO
- Rama y HEAD:
- Node/npm:
- Navegador y versión:
- Fuente de contenido: fixtures / Wix / ambas
- Entorno externo consultado:

VISUAL Y RESPONSIVE
- Referencias de diseño:
- Viewports revisados:
- Resultado desktop:
- Resultado mobile:
- Anchos intermedios:
- Diferencias y severidad:

FUNCIONAL
- Escenarios ejecutados:
- Navegación, enlaces e interacciones:
- Teclado/accesibilidad básica:
- Consola y Network:

CONTROLES AUTOMÁTICOS
- diff/check:
- npm test:
- npm run check:
- npm run build: resultado / no aplicable + motivo
- npm run assets:check: resultado / no aplicable + motivo
- npm run cms:audit: resultado / no aplicable + motivo

CMS E INTEGRACIONES
- Datos/relaciones verificados:
- Fallback Wix → fixtures:
- Integraciones verificadas:
- Escrituras en producción: No

HALLAZGOS
- Bloqueantes:
- Importantes:
- Menores:
- Limitaciones conocidas:
- Seguimientos creados:

CONCLUSIÓN
- Decisión:
- Motivo:
```

Adjuntar o enlazar solamente evidencia útil: capturas comparables, salida resumida de comandos, preview autorizada, referencia de Figma y hallazgos reproducibles. No adjuntar secretos ni logs irrelevantes completos.

## 18. Tomar la decisión

### APPROVED o SELF-REVIEW APPROVED

Se permite cuando:

- todos los criterios aplicables están en `PASS`;
- el diff fue inspeccionado;
- pasaron los comandos obligatorios;
- la interfaz fue revisada en los tamaños requeridos;
- el comportamiento afectado funciona;
- CMS e integraciones fueron comprobados cuando aplicaban;
- no quedan hallazgos bloqueantes o importantes;
- las limitaciones menores permitidas están explícitas.

### CHANGES REQUESTED

Usar cuando existen defectos corregibles. Cada hallazgo debe indicar:

- comportamiento actual;
- comportamiento esperado;
- pasos para reproducirlo;
- severidad;
- evidencia.

El cambio vuelve a implementación y debe auditarse otra vez después de la corrección.

### BLOCKED

Usar cuando una condición externa impide decidir, por ejemplo:

- requisitos contradictorios;
- referencia de diseño inaccesible;
- credenciales o entorno de prueba no disponibles;
- CMS sin los datos necesarios;
- proveedor externo caído.

Registrar la dependencia, responsable y siguiente acción. Una auditoría bloqueada no está aprobada.

## 19. Qué hacer ante problemas frecuentes

### El servidor no inicia

1. leer el primer error relevante;
2. comprobar versión de Node y dependencias;
3. confirmar el perfil de contenido usado;
4. determinar si el fallo pertenece al cambio o al entorno;
5. registrar `BLOCKED` si no puede resolverse sin una dependencia externa.

### Un test o check falla

No aprobar. Registrar comando, prueba y error. Si se afirma que el fallo era previo, reproducirlo sobre la base del cambio o dejar la afirmación sin confirmar.

### Figma es ambiguo o contradice los requisitos

No elegir silenciosamente una interpretación. Registrar la contradicción y solicitar una decisión de producto/diseño.

### Wix no está disponible

La revisión con fixtures puede continuar, pero la parte CMS permanece bloqueada si era obligatoria.

### El working tree contiene cambios ajenos

No borrarlos ni ocultarlos. Aislar la revisión en otro worktree o esperar una separación acordada.

### Se encuentra un defecto pequeño durante la revisión

No corregirlo silenciosamente manteniendo la aprobación. Registrar el hallazgo, volver a implementación y repetir los controles afectados.

## 20. Limitaciones actuales

El repositorio dispone de tests Vitest y comprobación estática de Astro/TypeScript, pero actualmente no incluye:

- pruebas end-to-end con Playwright o Cypress;
- regresión visual automática;
- comparación automática de capturas con Figma;
- cobertura automática de todos los breakpoints e integraciones.

Por eso la inspección visual, funcional y de CMS sigue siendo obligatoria cuando aplica. Si se incorpora automatización, este documento debe indicar qué parte reemplaza y qué comprobaciones manuales permanecen.

## 21. Mantenimiento

Actualizar este playbook cuando cambien:

- scripts de `package.json`;
- requisitos de Node o configuración local;
- herramientas y versiones de diseño;
- breakpoints o navegadores soportados;
- estrategia de pruebas;
- modelo o integración Wix;
- workflow y evidencia exigida.

Una revisión del playbook debe comprobar que todos los comandos existen, que sus descripciones siguen siendo correctas y que una persona nueva puede completar el flujo sin depender de conocimiento oral.
