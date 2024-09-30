require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

// Specify the folder containing the commands (add other folders as needed)
const commandsFolder = path.join(__dirname, 'commands', 'utility');

(async () => {
    try {
        console.log('Deploying all commands...');

        // Read all command files from the directory
        const commandFiles = await fs.readdir(commandsFolder);
        const commands = [];

        for (const file of commandFiles) {
            if (file.endsWith('.js')) {  // Ensure it only processes .js files
                const filePath = path.join(commandsFolder, file);
                const command = require(filePath);
                
                if (command.data && command.execute) {
                    commands.push(command.data.toJSON());
                } else {
                    console.warn(`Skipping file ${file}, missing "data" or "execute" properties.`);
                }
            }
        }

        // Deploy commands to Discord
        const rest = new REST().setToken(token);

        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Deploy to the guild
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log(`Successfully reloaded ${commands.length} commands.`);

        // Fetch currently deployed commands
        const existingCommands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));

        // Store the names of the commands being deployed
        const commandNames = commands.map(cmd => cmd.name); // Use the names from the commands array

        console.log("Deployed Command Names:", commandNames);
        console.log("Existing Command Names:", existingCommands.map(cmd => cmd.name));

        // Delete commands that no longer have a corresponding file
        for (const cmd of existingCommands) {
            if (!commandNames.includes(cmd.name)) {
                console.log(`Deleting command: ${cmd.name}`);
                await rest.delete(Routes.applicationGuildCommand(clientId, guildId, cmd.id));
            } else {
                console.log(`Keeping command: ${cmd.name}`);
            }
        }

        console.log('Clean-up completed, non-existing commands removed.');

    } catch (error) {
        console.error('Error deploying commands:', error);
    }
})();
