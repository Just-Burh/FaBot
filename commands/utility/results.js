const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('results')
    .setDescription('Fetch the results of Formula Argentina Season 3 Awards'),

  async execute(interaction) {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwg6ICLZka4FdGJm8In0DdrvtBiiCFe9W1F4CFFGpl4ufZ9rdrRvHwPJmTnt_l4bwDcjw/exec'; // Replace with your script URL
    const logoURL = 'https://media.discordapp.net/attachments/1283987495297486972/1289757033058533416/image_2.png?ex=66f9fb57&is=66f8a9d7&hm=661fb947c0424362daffa7af1f7e8bf7b089c9eab230a7cf232a052fbe855e1e&=&format=webp&quality=lossless&width=497&height=497'; // Replace with your logo image URL

    async function fetchAndUpdateResults(message) {
      try {
        // Fetch the results from Google Apps Script
        const response = await fetch(scriptURL);
        const results = await response.json();

        // Create a rich embed to format results nicely
        const embed = new EmbedBuilder()
          .setColor(0xffcc00)
          .setTitle('Resultados de Nominaciones')
          .setDescription('Aquí están los resultados de las nominaciones para la Formula Argentina Season 3 Awards.')
          .setThumbnail(logoURL) // Logo image
          .setTimestamp(); // Add timestamp to embed

        // Loop through categories and add fields for each nominee and their votes
        for (const [category, nominees] of Object.entries(results)) {
          const nomineeText = nominees.map(nominee => `${nominee.name}: **${nominee.votes} votos**`).join('\n');
          embed.addFields({ name: category, value: nomineeText || 'No hay nominaciones en esta categoría.' });
        }

        // Edit the original message with the updated embed
        await message.edit({ embeds: [embed] });

      } catch (error) {
        console.error('Error fetching results:', error);
        await interaction.followUp('Ocurrió un error al intentar obtener los resultados. Inténtalo nuevamente más tarde.');
      }
    }

    // Send the initial message
    const message = await interaction.reply({ content: 'Fetching results...', fetchReply: true });

    // Fetch and display the results immediately
    await fetchAndUpdateResults(message);

    // Set an interval to auto-update every 2 minutes (120000 milliseconds)
    setInterval(async () => {
      await fetchAndUpdateResults(message);
    }, 120000); // 2 minutes = 120000 milliseconds
  }
};
