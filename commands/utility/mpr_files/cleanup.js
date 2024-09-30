const { SlashCommandBuilder } = require('@discordjs/builders');
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cleanupmpr')
    .setDescription('Deletes all .mpr files for the past weekend.'),
  
  async execute(interaction) {
    // Check if the user has one of the allowed roles
    const userRoles = interaction.member.roles.cache.map(role => role.id);
    const hasRole = allowedRoles.some(roleId => userRoles.includes(roleId));

    if (!hasRole) {
      return interaction.reply({ content: 'You do not have the required role to use this command.', ephemeral: true });
    }

    // Path to the folder where .mpr files for the weekend are stored
    const weekendDir = path.join(__dirname, 'mpr_files', 'weekend');

    // Check if the folder exists
    if (!fs.existsSync(weekendDir)) {
      return interaction.reply({ content: 'No .mpr files have been uploaded for this weekend.', ephemeral: true });
    }

    // Read and delete all .mpr files
    const mprFiles = fs.readdirSync(weekendDir).filter(file => file.endsWith('.mpr'));

    if (mprFiles.length === 0) {
      return interaction.reply({ content: 'No .mpr files found to delete.', ephemeral: true });
    }

    // Delete each file
    mprFiles.forEach(file => {
      const filePath = path.join(weekendDir, file);
      fs.unlinkSync(filePath); // Delete the file
    });

    // Reply to the user
    await interaction.reply({ content: 'All .mpr files for the past weekend have been deleted successfully.', ephemeral: true });
  },
};
