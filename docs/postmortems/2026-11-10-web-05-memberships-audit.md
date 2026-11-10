# Post mortem de la auditoría WEB-05: `/memberships`

- **Fecha:** 2026-11-10
- **Estado del documento:** histórico
- **Estado de la auditoría:** cambios solicitados; validación Wix pendiente
- **Commit auditado:** `fce7a13` (`feat(memberships): align responsive page and CMS model`)
- **Entorno CMS:** Wix staging, sitio `26a062ff-2d9e-499e-9704-9fcd2907dc7e`
- **Procedimiento aplicable:** [Technical Review Playbook](../technical-review-playbook.md)

## Resumen ejecutivo

La auditoría verificó la implementación técnica, responsive, visual y CMS de
`/memberships`. La página funcionó con fixtures y superó las pruebas, el chequeo
de Astro, el build y la validación de activos. La primera ejecución contra Wix
staging devolvió HTTP 500 porque el CMS no contenía la sección obligatoria
`memberships.benefits`.

Con autorización expresa se ejecutó el seed aditivo de staging. La operación
creó 62 registros, conservó 81 existentes y verificó que ninguna de las 143
claves definidas por el seed quedara ausente. Esto corrigió la ausencia de
`memberships.benefits` y de sus seis elementos.

La validación posterior volvió a responder HTTP 500, esta vez porque el registro
preexistente `memberships.intro` carece de CTA principal. El seed no lo corrigió
porque su política es crear claves ausentes y omitir las existentes, no
actualizarlas. La auditoría permanece abierta hasta corregir ese registro y
repetir la validación en ejecución.

La ausencia del archivo de fuente PP Fragment Sans también fue detectada, pero
se difirió explícitamente para una tarea posterior y no forma parte del bloqueo
CMS tratado en este documento.

## Alcance

La revisión cubrió:

- El diff del commit `fce7a13`.
- La ruta `/memberships` con fixtures locales.
- La ruta `/memberships` con `CONTENT_SOURCE=wix`.
- Los viewports 320, 440, 1023, 1024 y 1440 px.
- La comparación móvil con el diseño de Figma.
- Pruebas, análisis estático, build y registro de activos Figma.
- Modelo, datos y relaciones del Wix CMS de staging.
- Aplicación autorizada del seed aditivo y validación posterior.

No se incluyeron despliegues, releases, indexación, escrituras en producción ni
commits de Git.

## Referencias técnicas

- La ruta consume `page.benefits` en
  [`src/pages/memberships/index.astro`](../../src/pages/memberships/index.astro).
- La sección visual se implementa en
  [`MembershipBenefits.astro`](../../src/components/sections/memberships/MembershipBenefits.astro).
- Wix transforma `memberships.benefits` y sus elementos en
  [`wix-cms.ts`](../../src/services/content/wix-cms.ts).
- La validación de página completa exige `seo`, `intro`, `benefits`, `hub`,
  `pricing`, `members`, `band` y `faq` en
  [`wix-cms.ts`](../../src/services/content/wix-cms.ts).
- El contenido versionado del seed está en
  [`staging-seed-data.mjs`](../../scripts/cms/staging-seed-data.mjs).
- La política aditiva se implementa en
  [`seed-wix-cms.mjs`](../../scripts/seed-wix-cms.mjs).

## Cronología de la auditoría

1. Se leyó el handoff del proyecto y se identificó `WEB-05 · Review
   /memberships` como la tarjeta en revisión.
2. Se leyó el playbook completo y se seleccionaron los niveles técnico, visual
   y Wix/CMS. No se ejecutó un gate de release.
3. Se inspeccionó el commit `fce7a13`; `git show --check` no encontró errores de
   whitespace.
4. Se ejecutó la aplicación con fixtures y se capturaron los cinco viewports.
   No se observaron desbordamientos horizontales ni superposiciones.
5. Se comparó el viewport móvil con Figma. La estructura general coincidió; la
   comparación directa de escritorio quedó bloqueada por el límite de peticiones
   del MCP de Figma.
6. Se ejecutaron pruebas, chequeo estático, build, validación de activos y
   auditoría CMS.
7. La primera validación real con Wix devolvió HTTP 500: faltaba
   `memberships.benefits`.
8. Se obtuvo autorización explícita para escribir en staging. Antes de escribir,
   `npm run cms:seed` confirmó el sitio protegido, 21 colecciones y 143 registros
   planificados.
9. `npm run cms:seed:staging` creó 62 registros y omitió 81 existentes. Su
   verificación posterior informó cero claves ausentes en todas las colecciones.
10. `npm run cms:audit` se ejecutó nuevamente. Terminó correctamente para las
    colecciones del proyecto; algunas colecciones privadas nativas de Wix
    devolvieron `fetch failed` al intentar contar elementos, sin intervenir en
    `/memberships`.
11. La segunda validación real de `/memberships` devolvió HTTP 500 por un nuevo
    requisito incumplido: `memberships.intro` no tiene CTA principal.
12. Se detuvo el servidor temporal. No se actualizó el registro existente porque
    esa acción excedía la autorización concedida al seed aditivo.

## Evidencia de los controles

| Control | Resultado | Evidencia |
| --- | --- | --- |
| `git show --check fce7a13` | Aprobado | Sin errores de whitespace en el commit auditado. |
| `npm test` | Aprobado | 6 archivos y 39 pruebas aprobadas. |
| `npm run check` | Aprobado | 104 archivos; 0 errores, 0 warnings y 0 hints. |
| `npm run build` con Node 24.22.1 | Aprobado con observación | Build completado; aviso por la fuente PP Fragment Sans ausente. |
| `npm run assets:check` | Aprobado | 16 activos Figma validados en un registro. |
| Responsive con fixtures | Aprobado | Revisados 320, 440, 1023, 1024 y 1440 px. |
| Comparación Figma móvil | Aprobado con limitaciones | Estructura consistente; imágenes reales reemplazadas deliberadamente por placeholders. |
| Comparación Figma escritorio | Bloqueado | Límite de peticiones del MCP de Figma. |
| `npm run cms:audit` antes del seed | Aprobado, cobertura insuficiente | No detectó que faltaba contenido requerido en runtime. |
| `/memberships` con Wix antes del seed | Fallido | HTTP 500: faltaba `memberships.benefits`. |
| `npm run cms:seed` | Aprobado | Dry run: sitio protegido, 21 colecciones, 143 registros. |
| `npm run cms:seed:staging` | Aprobado | 62 creados, 81 omitidos, 49 relaciones múltiples procesadas. |
| Verificación integrada del seed | Aprobado | Ninguna clave del seed quedó ausente. |
| `npm run cms:audit` después del seed | Aprobado con observaciones | 26 colecciones auditadas; fallos de lectura en colecciones privadas nativas de Wix. |
| `/memberships` con Wix después del seed | Fallido | HTTP 500: `memberships.intro` requiere CTA principal. |

El primer intento de build usó Node 22.23.4 y fue rechazado por el requisito de
Wix de Node 24.18 o superior. Se repitió con Node 24.22.1 y pasó; por tanto, no
se clasificó como defecto de la implementación.

El primer inicio del servidor fixture dentro del sandbox también falló. La misma
operación fuera del sandbox funcionó, por lo que se clasificó como restricción
del entorno de ejecución y no como defecto de la página.

## Registros creados en Wix staging

La ejecución aplicada procesó 143 registros planificados: 62 fueron creados y
81 ya existían y se omitieron. No se eliminó ni reemplazó ningún registro.

| Colección | Creados | Omitidos existentes |
| --- | ---: | ---: |
| `CHSiteSettings` | 0 | 1 |
| `CHInterfaceCopy` | 0 | 4 |
| `CHPages` | 2 | 11 |
| `CHAmenities` | 0 | 13 |
| `CHLocations` | 0 | 2 |
| `CHPeople` | 1 | 2 |
| `CHSocialLinks` | 0 | 3 |
| `CHNavigationItems` | 0 | 13 |
| `CHPageSections` | 19 | 11 |
| `CHSectionItems` | 25 | 1 |
| `CHPrograms` | 1 | 0 |
| `CHSpaces` | 3 | 4 |
| `CHRooms` | 0 | 7 |
| `CHEvents` | 3 | 0 |
| `CHNewsArticles` | 3 | 0 |
| `CHDeals` | 0 | 1 |
| `CHTestimonials` | 1 | 2 |
| `CHPartners` | 1 | 0 |
| `CHFaqs` | 2 | 2 |
| `CHMembershipPlans` | 1 | 0 |
| `CHLegalPages` | 0 | 4 |
| **Total** | **62** | **81** |

La verificación posterior observó las 143 claves esperadas. También procesó 49
relaciones múltiples. Los totales reales de algunas colecciones son superiores
a los del seed porque staging ya contenía registros editoriales adicionales;
esos registros se conservaron.

Para `memberships`, la carga incorporó, entre otros datos:

- La sección `memberships.benefits`.
- Seis elementos asociados a esa sección:
  - `Discounted price for every booking`.
  - `Entrepreneur’s Hub`.
  - `Priority in Bookings`.
  - `Access when opening a New Location`.
  - `Partners’ perks all over the world`.
  - `Exclusive Members only offers`.
- Un plan de membresía representativo.
- Un miembro representativo.
- Dos preguntas frecuentes de membresía.

La cifra de 62 corresponde a la operación completa del seed y no únicamente a
`/memberships`: el manifiesto versionado también completó datos faltantes de
otras rutas y colecciones de staging.

## Hallazgos y causas

### 1. Deriva entre el seed versionado y Wix staging

El código y el fixture ya contenían `memberships.benefits`, pero Wix staging no
tenía todos los registros del manifiesto actual. Como el runtime Wix no utiliza
el fixture, la sección no podía componerse y la página fallaba de forma
intencional en la validación de completitud.

### 2. Un seed aditivo no corrige registros incompletos existentes

`memberships.intro` existía antes de la carga. El seed lo omitió para preservar
contenido editorial, aunque el registro carece de la CTA que ahora exige el
runtime. La carga corrigió claves ausentes, pero no puede reconciliar contenido
antiguo sin una operación explícita de actualización.

### 3. `cms:audit` no valida la capacidad de renderizar cada página

La auditoría CMS enumera colecciones, campos, índices, permisos y conteos, pero
terminó correctamente incluso cuando `/memberships` no podía construirse. El
chequeo de modelo no sustituye una prueba de runtime contra la fuente real.

### 4. Fuente visual ausente

`global.css` declara `/fonts/PPFragment-SansRegular.woff2`, pero el archivo no
existe en `public/fonts`. El navegador utiliza una fuente alternativa. Esta
deuda es previa a `fce7a13` y se aplazó por decisión del usuario.

## Estado actual y acciones pendientes

`memberships.benefits` ya no es el bloqueo. La página se detiene ahora en la
validación inmediatamente posterior porque `memberships.intro` no contiene CTA
principal.

Para cerrar `WEB-05` todavía se requiere:

1. Autorizar y ejecutar una actualización controlada de
   `CHPageSections:memberships.intro` con:
   - etiqueta `Apply`;
   - URL `/api/auth/login`.
2. Ejecutar nuevamente `npm run cms:audit`.
3. Levantar el servidor con `CONTENT_SOURCE=wix` y comprobar que
   `/memberships` responde HTTP 200.
4. Repetir las comprobaciones funcionales y visuales afectadas con datos Wix.
5. Resolver o aceptar explícitamente cualquier requisito adicional que revele
   la validación progresiva.
6. Completar la comparación directa de escritorio con Figma cuando el servicio
   vuelva a permitir consultas.

Como mejoras del proceso, conviene añadir una comprobación automatizada que
intente componer las páginas obligatorias con Wix staging y preparar una
migración de actualización separada del seed aditivo para reconciliar registros
existentes sin convertir el seed en una sobrescritura general.

## Decisiones y límites de seguridad

- La escritura se realizó solo después de autorización explícita.
- El script verificó el `siteId` aprobado antes de escribir.
- La operación fue aditiva: no eliminó ni reemplazó registros.
- No se escribieron credenciales ni valores secretos en este documento.
- No se modificó producción.
- No se creó un commit ni se hizo push.
- Los servidores temporales se detuvieron después de cada validación.
- No se actualizó `memberships.intro` porque sobrescribir un registro existente
  requiere una autorización distinta y un plan de cambio explícito.
