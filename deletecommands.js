require('dotenv').config();
const { REST, Routes } = require('discord.js');

// Load environment variables
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

// Create an instance of the REST module and set the token
const rest = new REST().setToken(token);

(async () => {
    try {
        console.log('Started deleting all application (/) commands.');

        // Delete all guild-specific commands
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
        console.log('Successfully deleted all guild-specific commands.');

        // Delete all global commands
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log('Successfully deleted all global commands.');

    } catch (error) {
        console.error(error);
    }
})();
