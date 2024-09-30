require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

// Specify the folder containing the commands
const commandsFolder = path.join(__dirname, 'commands', 'utility');

const commands = [];

// Define a delay function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create an interface for reading input from the terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const promptCommandName = () => {
    return new Promise((resolve) => {
        rl.question('Enter the command file name (without .js): ', (answer) => {
            resolve(answer.trim());
        });
    });
};

(async () => {
    try {
        console.log('Loading commands from utility folder...');

        // Read command files asynchronously
        const commandFiles = await fs.readdir(commandsFolder);
        console.log(`Found command files in utility: ${commandFiles.join(', ')}`);

        // Prompt user for the command file name
        const commandName = await promptCommandName();

        // Check if the specified command file exists
        const commandFile = `${commandName}.js`;
        if (!commandFiles.includes(commandFile)) {
            console.error(`Command file "${commandFile}" does not exist in the utility folder.`);
            rl.close();
            return;
        }

        const filePath = path.join(commandsFolder, commandFile);
        console.log(`Processing file: ${filePath}`);

        try {
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                rl.close();
                return;
            }
        } catch (err) {
            console.error(`Error loading command from ${filePath}:`, err);
            rl.close();
            return;
        }

        const rest = new REST().setToken(token);

        console.log('Updating specified command...');

        // Get existing commands
        const existingCommands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));

        // Create or update the specified command
        const existingCommand = existingCommands.find(cmd => cmd.name === commandName);
        if (existingCommand) {
            console.log(`Updating command: ${commandName}`);
            await rest.patch(Routes.applicationGuildCommand(clientId, guildId, existingCommand.id), { body: commands[0] });
        } else {
            console.log(`Creating command: ${commandName}`);
            await rest.post(Routes.applicationGuildCommands(clientId, guildId), { body: commands[0] });
        }

        // Delete commands that don't have a corresponding file
        for (const cmd of existingCommands) {
            const cmdFileName = `${cmd.name}.js`;
            if (!commandFiles.includes(cmdFileName)) {
                console.log(`Deleting command: ${cmd.name}`);
                await rest.delete(Routes.applicationGuildCommand(clientId, guildId, cmd.id));
            }
        }

        rl.close();
    } catch (error) {
        console.error('Error in deployment script:', error);
        rl.close();
    }
})();
