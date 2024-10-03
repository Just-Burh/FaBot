// Carga las variables de entorno desde el archivo .env
require('dotenv').config();
const { REST, Routes } = require('discord.js'); // Importa los módulos necesarios para interactuar con la API de Discord
const fs = require('fs').promises; // Importa el módulo de fs con promesas para operaciones de archivos
const path = require('path'); // Importa el módulo para manejar rutas de archivos

// Carga las variables de entorno para el ID del cliente, ID del servidor y el token
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

// Especifica la carpeta que contiene los comandos (se pueden añadir otras carpetas según sea necesario)
const commandsFolder = path.join(__dirname, 'commands', 'utility');

// Función principal para desplegar comandos
(async () => {
    try {
        console.log('Deploying all commands...');

        // Lee todos los archivos de comandos desde el directorio
        const commandFiles = await fs.readdir(commandsFolder);
        const commands = []; // Inicializa un array para almacenar los comandos

        // Itera sobre los archivos de comandos
        for (const file of commandFiles) {
            if (file.endsWith('.js')) { // Asegúrate de procesar solo archivos .js
                const filePath = path.join(commandsFolder, file);
                const command = require(filePath); // Carga el comando desde el archivo
                
                // Comprueba si el comando tiene las propiedades "data" y "execute"
                if (command.data && command.execute) {
                    commands.push(command.data.toJSON()); // Agrega el comando al array en formato JSON
                } else {
                    console.warn(`Skipping file ${file}, missing "data" or "execute" properties.`); // Advertencia si falta alguna propiedad
                }
            }
        }

        // Crea una instancia del módulo REST y establece el token de autenticación
        const rest = new REST().setToken(token);

        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Despliega los comandos en el servidor de Discord
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands } // Envía el array de comandos
        );

        console.log(`Successfully reloaded ${commands.length} commands.`);

        // Obtiene los comandos actualmente desplegados
        const existingCommands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));

        // Almacena los nombres de los comandos que se están desplegando
        const commandNames = commands.map(cmd => cmd.name); // Usa los nombres del array de comandos

        // Muestra los nombres de los comandos desplegados
        console.log("Deployed Command Names:", commandNames);
        console.log("Existing Command Names:", existingCommands.map(cmd => cmd.name));

        // Elimina comandos que ya no tienen un archivo correspondiente
        for (const cmd of existingCommands) {
            if (!commandNames.includes(cmd.name)) { // Comprueba si el comando ya no existe
                console.log(`Deleting command: ${cmd.name}`); // Muestra el comando que se eliminará
                await rest.delete(Routes.applicationGuildCommand(clientId, guildId, cmd.id)); // Elimina el comando
            } else {
                console.log(`Keeping command: ${cmd.name}`); // Muestra el comando que se mantendrá
            }
        }

        console.log('Clean-up completed, non-existing commands removed.'); // Mensaje de confirmación de limpieza

    } catch (error) {
        console.error('Error deploying commands:', error); // Muestra cualquier error que ocurra durante el despliegue
    }
})();
