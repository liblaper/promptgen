# Prompt Gen

Generador de prompts técnicos para proyectos con ESP32, Arduino y otras placas compatibles. La aplicación ayuda a convertir una idea de electrónica en una especificación clara, lista para pegar en [schematik.io](https://schematik.io/).

## Descripción

Prompt Gen crea prompts en español con la información necesaria para diseñar un proyecto de hardware de forma ordenada y segura. El resultado solicita componentes, conexiones pin a pin, firmware, lógica de funcionamiento, montaje, pruebas y advertencias de seguridad.

La aplicación funciona como una página estática: no necesita servidor, base de datos, Node.js ni un proceso de compilación.

## Funciones principales

- Formulario para describir el proyecto y su objetivo.
- Selección de placa, experiencia, conectividad y alimentación.
- Inclusión de componentes disponibles y restricciones de diseño.
- Plantillas iniciales para:
  - Estaciones climáticas.
  - Riego automático.
  - Alarmas IoT.
- Generación de prompts optimizados para Schematik.
- Tabla de conexiones pin a pin solicitada dentro del prompt.
- Recomendaciones sobre firmware, protecciones eléctricas y pruebas.
- Copia del prompt al portapapeles.
- Descarga del prompt como archivo `.txt`.
- Guardado, apertura y eliminación de proyectos.
- Persistencia local en el navegador cuando se ejecuta fuera de Miniapps.
- Interfaz adaptable para ordenador, tableta y móvil.
- Textos preparados para localización mediante `locales/es-419.json`.

## Uso

1. Abre la aplicación.
2. Elige una plantilla o completa el formulario manualmente.
3. Escribe el nombre del proyecto y describe qué debe hacer.
4. Selecciona la placa, la conectividad y la alimentación disponibles.
5. Añade los componentes y las restricciones que quieras tener en cuenta.
6. Pulsa **Generar prompt**.
7. Copia el resultado y pégalo en Schematik, o descárgalo como `.txt`.
8. Pulsa **Guardar proyecto** si quieres conservarlo en tu taller.

Los campos de nombre del proyecto y objetivo son obligatorios. Los demás ayudan a obtener una respuesta más precisa.

## Estructura del proyecto

```text
.
├── index.html              # Estructura principal de la aplicación
├── styles.css              # Estilos y diseño responsive
├── main.js                 # Generación, plantillas y almacenamiento
├── miniapp.i18n.json       # Configuración de localización de Miniapps
├── locales/
│   └── es-419.json         # Textos en español latinoamericano
└── README.md               # Documentación del proyecto
```

## Ejecutar localmente

No se requiere instalación.

Puedes abrir `index.html` directamente en el navegador. Para evitar restricciones del navegador relacionadas con la carga del archivo de traducciones, es recomendable usar un servidor estático local.

Por ejemplo, con Python:

```bash
python3 -m http.server 8000
```

Después visita:

```text
http://localhost:8000
```

## Publicar en GitHub Pages

1. Sube todos los archivos al repositorio.
2. Comprueba que `index.html` esté en la raíz.
3. En GitHub, abre **Settings → Pages**.
4. En **Source**, selecciona **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)`.
6. Guarda la configuración.

GitHub generará una dirección similar a:

```text
https://liblaper.github.io/promptgen/
```

## Publicar en Cloudflare Pages

1. Entra en el panel de Cloudflare.
2. Abre **Workers & Pages**.
3. Selecciona **Create application → Pages → Connect to Git**.
4. Autoriza GitHub y selecciona `liblaper/promptgen`.
5. Usa esta configuración:

   - **Framework preset:** None
   - **Production branch:** `main`
   - **Build command:** vacío
   - **Build output directory:** `/`
   - **Root directory:** `/`

6. Pulsa **Save and Deploy**.

## Acceso privado

GitHub Pages no debe considerarse un mecanismo de autenticación. Si la página solo debe ser visible para una persona, protege el proyecto desplegado en Cloudflare con **Cloudflare Access**:

1. Abre **Zero Trust → Access → Applications**.
2. Crea una aplicación **Self-hosted**.
3. Añade el dominio de Cloudflare Pages.
4. Crea una regla `Allow` para tu correo electrónico.
5. Selecciona autenticación por código de un solo uso o mediante Google.

No se recomienda añadir una contraseña dentro de JavaScript, porque el código enviado al navegador puede inspeccionarse.

## Almacenamiento de proyectos

Los proyectos guardados se almacenan en el almacenamiento disponible de la aplicación. En una página estática fuera de Miniapps se utiliza el almacenamiento local del navegador. Por ello:

- Los datos permanecen vinculados al navegador y al dispositivo.
- No se sincronizan automáticamente entre dispositivos.
- Borrar los datos del sitio puede eliminar los proyectos guardados.
- La autenticación de Cloudflare protege el acceso a la página, pero no convierte el almacenamiento local en una base de datos compartida.

## Personalización

- Edita los textos en `locales/es-419.json`.
- Modifica colores, tamaños y responsive design en `styles.css`.
- Añade o cambia plantillas en el objeto `templates` de `main.js`.
- Ajusta el contenido de los prompts en la sección `prompt` del catálogo de traducciones.

## Tecnologías

- HTML5 semántico.
- CSS3 responsive.
- JavaScript vanilla.
- API de almacenamiento del navegador como respaldo para despliegues estáticos.
- Sistema de localización integrado de Miniapps con catálogo local de respaldo.

## Seguridad de los proyectos electrónicos

Los prompts incluyen instrucciones para no conectar cargas inductivas directamente a un GPIO, revisar tensiones, utilizar alimentación externa cuando sea necesario y probar el circuito antes de energizarlo. La respuesta generada debe revisarse con la documentación de la placa y de cada componente antes de realizar el montaje.

## Licencia

Añade aquí la licencia que quieras utilizar para este repositorio. Si el proyecto es privado o de uso personal, también puedes mantenerlo sin una licencia pública.

