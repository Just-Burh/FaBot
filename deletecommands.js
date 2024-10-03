// Carga las variables de entorno desde el archivo .env
require('dotenv').config();
const { REST, Routes } = require('discord.js'); // Importa los módulos necesarios para interactuar con la API de Discord

// Carga las variables de entorno
const clientId = process.env.CLIENT_ID; // ID de la aplicación de Discord
const guildId = process.env.GUILD_ID; // ID del servidor (guild) donde se eliminarán los comandos
const token = process.env.TOKEN; // Token de autenticación de la aplicación

// Crea una instancia del módulo REST y establece el token de autenticación
const rest = new REST().setToken(token);

// Función autoejecutable para eliminar comandos
(async () => {
    try {
        console.log('Iniciando la eliminación de todos los comandos (/) de la aplicación.');

        // Elimina todos los comandos específicos del servidor (guild)
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
        console.log('Se han eliminado correctamente todos los comandos específicos del servidor.');

        // Elimina todos los comandos globales
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log('Se han eliminado correctamente todos los comandos globales.');

    } catch (error) {
        // Manejo de errores: si ocurre un error, se muestra en la consola
        console.error('Error al eliminar los comandos:', error);
    }
})();
