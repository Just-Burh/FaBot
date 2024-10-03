// Carga las variables de entorno desde el archivo .env
require('dotenv').config(); 

// Importa módulos necesarios
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js');

// Crea una nueva instancia del cliente de Discord con los intents necesarios
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// Inicializa colecciones para almacenar comandos y cooldowns
client.cooldowns = new Collection();
client.commands = new Collection();

// Especifica la ruta de la carpeta que contiene los comandos
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath); // Lee las carpetas de comandos

// Bucle para cargar los comandos desde las carpetas
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')); // Filtra solo archivos .js

    // Carga cada archivo de comando
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath); // Requiere el comando desde el archivo
        
        // Comprueba si el comando tiene las propiedades "data" y "execute"
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command); // Agrega el comando a la colección
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Evento que se dispara cuando el cliente está listo
client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    // Establece la actividad del bot (jugando, escuchando, compitiendo, etc.)
    client.user.setActivity('Live For Speed', { type: ActivityType.Playing });
});

// Evento que se dispara para cualquier interacción
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) { // Comprueba si es un comando de entrada de chat
        const command = client.commands.get(interaction.commandName); // Obtiene el comando correspondiente

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        // Omite la verificación de roles para el comando 'momento-random'
        if (command.data.name === 'momento-random') {
            try {
                await command.execute(interaction); // Ejecuta el comando
            } catch (error) {
                console.error(error);
                // Maneja errores de ejecución
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } else {
            // Verifica si el usuario tiene los roles requeridos para el comando
            const allowedRoles = [
                '976975431574110258',
                '1277192428205641759',
                '983140438158504006',
                '1175980404013027448',
                '1283983161067311175',
                '976616892460593173'
            ];

            const userRoles = interaction.member.roles.cache.map(role => role.id);
            const hasRole = allowedRoles.some(roleId => userRoles.includes(roleId));
            if (!hasRole) {
                return interaction.reply({ content: 'You do not have the required role to use this command.', ephemeral: true });
            }

            // Maneja cooldowns de comandos
            const { cooldowns } = interaction.client;
            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const defaultCooldownDuration = 3; // Duración de cooldown por defecto en segundos
            const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000; // Tiempo de cooldown en milisegundos

            // Verifica si el usuario está en cooldown
            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000);
                    return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
                }
            }

            // Establece el nuevo timestamp de cooldown
            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            // Ejecuta el comando
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                // Maneja errores de ejecución
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        }
    } else if (interaction.isButton()) { // Maneja interacciones de botones
        const channelId = '1244379250501619873'; // ID del canal para interacciones específicas de botones
        const user = interaction.user;

        // Maneja el botón "run_gp"
        if (interaction.customId === 'run_gp') {
            await interaction.reply({ content: `(${user}) va a correr este GP`, ephemeral: true });
            const channel = client.channels.cache.get(channelId);
            if (channel) {
                await channel.send(`${user} va a correr este GP`); // Envía un mensaje al canal
            }
        } else if (interaction.customId === 'no_run_gp') { // Maneja el botón "no_run_gp"
            await interaction.reply({ content: `(${user}) no va a correr este GP`, ephemeral: true });
            const channel = client.channels.cache.get(channelId);
            if (channel) {
                await channel.send(`${user} no va a correr este GP`); // Envía un mensaje al canal
            }
        }
    }
});

// Inicia sesión en Discord usando el token de la variable de entorno
client.login(process.env.TOKEN); 
