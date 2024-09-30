const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Define allowed roles
const allowedRoles = [
  '976975431574110258',
  '1277192428205641759',
  '983140438158504006',
  '1175980404013027448',
  '1283983161067311175',
  '976616892460593173'
];

// Command for uploading and storing .mpr files
module.exports = {
  data: new SlashCommandBuilder()
    .setName('uploadmpr')
    .setDescription('Upload .mpr files for a specific session (FP1, FP2, QU1, QU2, QU3, RAC).')
    .addStringOption(option =>
      option.setName('session')
        .setDescription('The session for the .mpr file (FP1, FP2, QU1, QU2, QU3, RAC)')
        .setRequired(true)
        .addChoices(
          { name: 'FP1', value: 'FP1' },
          { name: 'FP2', value: 'FP2' },
          { name: 'QU1', value: 'QU1' },
          { name: 'QU2', value: 'QU2' },
          { name: 'QU3', value: 'QU3' },
          { name: 'RAC', value: 'RAC' }
        )
    )
    .addAttachmentOption(option =>
      option.setName('file')
        .setDescription('The .mpr file to upload')
        .setRequired(true)),

  async execute(interaction) {
    // Check if the user has one of the allowed roles
    const userRoles = interaction.member.roles.cache.map(role => role.id);
    const hasRole = allowedRoles.some(roleId => userRoles.includes(roleId));

    if (!hasRole) {
      return interaction.reply({ content: 'You do not have the required role to use this command.', ephemeral: true });
    }

    const session = interaction.options.getString('session');
    const file = interaction.options.getAttachment('file');

    // Only allow .mpr files
    if (!file.name.endsWith('.mpr')) {
      return interaction.reply({ content: 'Please upload a valid `.mpr` file.', ephemeral: true });
    }

    // Defer the reply to give more time for file processing
    await interaction.deferReply({ ephemeral: true });

    // Path to the folder where .mpr files will be stored
    const weekendDir = path.join(__dirname, 'mpr_files', 'weekend');

    // Create the folder if it doesn't exist
    if (!fs.existsSync(weekendDir)) {
      fs.mkdirSync(weekendDir, { recursive: true });
    }

    // Define the file path for the uploaded file
    const filePath = path.join(weekendDir, `${session}.mpr`);

    // Check if a file for this session has already been uploaded
    if (fs.existsSync(filePath)) {
      return interaction.editReply({ content: `A file for the session ${session} has already been uploaded. You cannot upload another file for this session.` });
    }

    try {
      // Download and store the file locally
      const response = await axios.get(file.url, { responseType: 'stream' });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Edit the deferred reply to notify success
      await interaction.editReply({ content: `File ${file.name} for session ${session} uploaded and stored successfully!` });
    } catch (error) {
      console.error('Error storing file:', error);
      await interaction.editReply({ content: 'There was an error uploading the file.' });
    }
  },
};
