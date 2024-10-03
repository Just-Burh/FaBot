# Bot de Simracing Formula Argentina (WIP)

Este es un **bot en desarrollo (WIP)** diseñado para la administración del servidor de Discord de la comunidad de simracing de Formula Argentina. El bot incluye comandos administrativos, así como algunos comandos misceláneos como consultar el clima, entre otros.

## Funcionalidades

- **Comandos Administrativos**: Comandos clave como banear usuarios, expulsar y gestionar roles.
- **Comandos Misceláneos**: Utilidades como obtener el clima actual y otros comandos informativos.
- **Enfoque en Simracing**: Integración para guardar replays.

### Comandos Principales
- `/fban [usuario] [motivo]`: Banea a un usuario del servidor con un motivo especificado.
- `/clima [ubicación]`: Muestra las condiciones climáticas actuales para una ubicación especificada.
- **¡Más comandos próximamente!**

## Cómo Empezar

### Requisitos Previos

Asegúrate de tener instalado lo siguiente:

- [Node.js](https://nodejs.org/) (v14+ recomendado)
- Una cuenta de Discord con permisos para gestionar el servidor.
- Variables de entorno configuradas en un archivo `.env`.

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Just-Burh/DcBot.git
   cd DcBot
   ```

2. Instala las dependencias:
   ```bash
   npm install (dependencias mostradas abajo)
   ```

3. Crea un archivo `.env` con las siguientes claves:
   ```
   TOKEN=
   CLIENT_ID=
   GUILD_ID=
   OPENWEATHERMAP_API_KEY=
   ```

4. Inicia el bot:
   ```bash
   node index.js
   ```

## Dependencias

El bot utiliza las siguientes dependencias:

- **[axios](https://www.npmjs.com/package/axios)@1.7.7**: Usado para hacer solicitudes HTTP.
- **[cheerio](https://www.npmjs.com/package/cheerio)@1.0.0**: Para parsear y hacer scraping de HTML.
- **[discord.js](https://www.npmjs.com/package/discord.js)@14.16.3**: Librería principal para interactuar con la API de Discord.
- **[dotenv](https://www.npmjs.com/package/dotenv)@16.4.5**: Carga variables de entorno desde un archivo `.env`.
- **[groq-sdk](https://www.npmjs.com/package/groq-sdk)@0.7.0**: SDK del lenguaje de consultas GROQ.
- **[node-fetch](https://www.npmjs.com/package/node-fetch)@2.7.0**: Un módulo ligero para hacer solicitudes HTTP.
- **[node-insim](https://www.npmjs.com/package/node-insim)@4.2.1**: Librería de integración con el videojuego Live for Speed.
- **[puppeteer](https://www.npmjs.com/package/puppeteer)@23.4.1**: Automatización de navegadores para hacer scraping o interactuar con páginas web.

## Próximos Pasos

- **Mejora de la Integración con Simracing**: Expansión de comandos para incluir datos de carreras en vivo y estadísticas de los jugadores.
- **Herramientas Administrativas Adicionales**: Más funciones de moderación y gestión de la comunidad.
- **Comandos Personalizados para Simracing**: Herramientas dedicadas para la gestión durante días de carrera.

