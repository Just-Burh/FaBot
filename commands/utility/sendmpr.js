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

// Command for sending .mpr files
module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendmpr')
    .setDescription('Sends all .mpr files stored for this weekend.'),

  async execute(interaction) {
    // Path to the folder where .mpr files for the weekend are stored
    const weekendDir = path.join(__dirname, 'mpr_files', 'weekend');

    // Defer reply to give time for file handling
    await interaction.deferReply();

    // Check if the folder exists and contains any .mpr files
    if (!fs.existsSync(weekendDir)) {
      return interaction.editReply({ content: 'No .mpr files have been uploaded for this weekend.' });
    }

    // Read .mpr files (case insensitive)
    const mprFiles = fs.readdirSync(weekendDir).filter(file => file.toLowerCase().endsWith('.mpr'));

    if (mprFiles.length === 0) {
      return interaction.editReply({ content: 'No .mpr files have been uploaded for this weekend.' });
    }

    // Create an object to group files by session
    const groupedFiles = {
      FP1: [],
      FP2: [],
      QU1: [],
      QU2: [],
      QU3: [],
      RAC: []
    };

    // Group files by their session based on file names (case insensitive)
    mprFiles.forEach(file => {
      const session = file.substring(0, 3).toUpperCase(); // Extract the first three characters for the session
      console.log(`Processing file: ${file}, Session: ${session}`); // Log the processing file and its session
      
      if (session === 'Q1') {
        groupedFiles.QU1.push(file);
      } else if (session === 'Q2') {
        groupedFiles.QU2.push(file);
      } else if (session === 'Q3') {
        groupedFiles.QU3.push(file);
      } else if (session === 'RAC') {
        groupedFiles.RAC.push(file);
      } else {
        groupedFiles[session] ? groupedFiles[session].push(file) : console.log(`Warning: Unrecognized session - ${session}`); // Log unrecognized sessions
      }
    });

    console.log('Grouped Files:', groupedFiles); // Log the grouped files for debugging

    // Prepare messages to send
    const messages = [];

    for (const session in groupedFiles) {
      if (groupedFiles[session].length > 0) {
        const attachments = groupedFiles[session].map(file => {
          const filePath = path.join(weekendDir, file);
          return { attachment: filePath, name: file };
        });

        messages.push({
          content: `Here are the .mpr files for **${session}**:`,
          files: attachments
        });
      }
    }

    // Send each message in order
    for (const message of messages) {
      await interaction.followUp(message);
    }

    // If no messages were prepared, inform the user
    if (messages.length === 0) {
      await interaction.followUp({ content: 'No .mpr files available for the specified sessions.' });
    } else {
      await interaction.editReply({ content: 'Finished sending all .mpr files.', ephemeral: true });
    }
  },
};
