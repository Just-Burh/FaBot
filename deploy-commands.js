// Carga las variables de entorno desde el archivo .env
require('dotenv').config();
const { REST, Routes } = require('discord.js'); // Importa los módulos necesarios para interactuar con la API de Discord
const fs = require('fs').promises; // Importa el módulo de fs con promesas para operaciones de archivos
const path = require('path'); // Importa el módulo para manejar rutas de archivos
const readline = require('readline'); // Importa el módulo para leer entradas de la consola

// Carga las variables de entorno para el ID del cliente, ID del servidor y el token
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

// Especifica la carpeta que contiene los comandos
const commandsFolder = path.join(__dirname, 'commands', 'utility');

const commands = []; // Inicializa un array para almacenar los comandos

// Función que define un retraso
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Crea una interfaz para leer la entrada desde la terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para pedir al usuario el nombre del archivo del comando
const promptCommandName = () => {
    return new Promise((resolve) => {
        rl.question('Enter the command file name (without .js): ', (answer) => {
            resolve(answer.trim()); // Elimina espacios en blanco
        });
    });
};

// Función principal para cargar y actualizar comandos
(async () => {
    try {
        console.log('Loading commands from utility folder...');

        // Lee los archivos de comando de manera asíncrona
        const commandFiles = await fs.readdir(commandsFolder);
        console.log(`Found command files in utility: ${commandFiles.join(', ')}`);

        // Solicita al usuario el nombre del archivo del comando
        const commandName = await promptCommandName();

        // Comprueba si el archivo del comando especificado existe
        const commandFile = `${commandName}.js`;
        if (!commandFiles.includes(commandFile)) {
            console.error(`Command file "${commandFile}" does not exist in the utility folder.`);
            rl.close(); // Cierra la interfaz de lectura
            return; // Sale de la función
        }

        const filePath = path.join(commandsFolder, commandFile);
        console.log(`Processing file: ${filePath}`);

        try {
            // Carga el comando desde el archivo
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON()); // Agrega el comando al array en formato JSON
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                rl.close(); // Cierra la interfaz de lectura
                return; // Sale de la función
            }
        } catch (err) {
            console.error(`Error loading command from ${filePath}:`, err);
            rl.close(); // Cierra la interfaz de lectura
            return; // Sale de la función
        }

        const rest = new REST().setToken(token); // Crea una instancia del módulo REST y establece el token de autenticación

        console.log('Updating specified command...');

        // Obtiene los comandos existentes en el servidor
        const existingCommands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));

        // Busca el comando existente por nombre
        const existingCommand = existingCommands.find(cmd => cmd.name === commandName);
        if (existingCommand) {
            console.log(`Updating command: ${commandName}`);
            // Actualiza el comando existente
            await rest.patch(Routes.applicationGuildCommand(clientId, guildId, existingCommand.id), { body: commands[0] });
        } else {
            console.log(`Creating command: ${commandName}`);
            // Crea un nuevo comando
            await rest.post(Routes.applicationGuildCommands(clientId, guildId), { body: commands[0] });
        }

        // Elimina comandos que no tienen un archivo correspondiente
        for (const cmd of existingCommands) {
            const cmdFileName = `${cmd.name}.js`;
            if (!commandFiles.includes(cmdFileName)) {
                console.log(`Deleting command: ${cmd.name}`);
                await rest.delete(Routes.applicationGuildCommand(clientId, guildId, cmd.id)); // Elimina el comando
            }
        }

        rl.close(); // Cierra la interfaz de lectura
    } catch (error) {
        console.error('Error in deployment script:', error);
        rl.close(); // Cierra la interfaz de lectura en caso de error
    }
})();
