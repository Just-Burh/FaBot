require('dotenv').config(); // Load environment variables from .env file

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

client.cooldowns = new Collection();
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Loop through the commands folders to load the commands
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Event triggered when the client is ready
client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    // Set the bot's activity (Playing, Listening, Competing, etc.)
    client.user.setActivity('Live For Speed', { type: ActivityType.Playing });

    // Register commands
    const commands = client.commands.map(command => command.data.toJSON());
    try {
        await client.application.commands.set(commands);
        console.log('Successfully registered application commands');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

// Event triggered for any interaction
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        // Check if the user has the required roles for the command
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

        const { cooldowns } = interaction.client;

        // Manage command cooldowns
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        // Execute the command
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    } else if (interaction.isButton()) {
        const channelId = '1244379250501619873'; // The channel ID for specific button interactions
        const user = interaction.user;

        if (interaction.customId === 'run_gp') {
            await interaction.reply({ content: `(${user}) va a correr este GP`, ephemeral: true });
            const channel = client.channels.cache.get(channelId);
            if (channel) {
                await channel.send(`${user} va a correr este GP`);
            }
        } else if (interaction.customId === 'no_run_gp') {
            await interaction.reply({ content: `(${user}) no va a correr este GP`, ephemeral: true });
            const channel = client.channels.cache.get(channelId);
            if (channel) {
                await channel.send(`${user} no va a correr este GP`);
            }
        }
    }
});

client.login(process.env.TOKEN); // Use environment variable for the token
