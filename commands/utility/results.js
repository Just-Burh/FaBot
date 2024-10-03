const { SlashCommandBuilder } = require('@discordjs/builders'); // Importa SlashCommandBuilder para crear comandos en Discord
const { EmbedBuilder } = require('discord.js'); // Importa EmbedBuilder para crear mensajes embebidos en Discord
const fetch = require('node-fetch'); // Importa fetch para realizar solicitudes HTTP

module.exports = {
  // Define el comando /results para obtener los resultados
  data: new SlashCommandBuilder()
    .setName('results')
    .setDescription('Obtiene los resultados de la Formula Argentina Season 3 Awards'),

  async execute(interaction) {
    // URL del script de Google Apps Script que proporciona los resultados
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwg6ICLZka4FdGJm8In0DdrvtBiiCFe9W1F4CFFGpl4ufZ9rdrRvHwPJmTnt_l4bwDcjw/exec'; 
    // URL del logo que se mostrará en el embed
    const logoURL = 'https://media.discordapp.net/attachments/1283987495297486972/1289757033058533416/image_2.png?ex=66f9fb57&is=66f8a9d7&hm=661fb947c0424362daffa7af1f7e8bf7b089c9eab230a7cf232a052fbe855e1e&=&format=webp&quality=lossless&width=497&height=497'; 

    // Función para obtener los resultados y actualizar el mensaje
    async function fetchAndUpdateResults(message) {
      try {
        // Realiza una solicitud HTTP al Google Apps Script para obtener los resultados
        const response = await fetch(scriptURL);
        const results = await response.json(); // Convierte la respuesta a JSON

        // Crea un embed con los resultados
        const embed = new EmbedBuilder()
          .setColor(0xffcc00) // Color del embed
          .setTitle('Resultados de Nominaciones') // Título del embed
          .setDescription('Aquí están los resultados de las nominaciones para la Formula Argentina Season 3 Awards.') // Descripción del embed
          .setThumbnail(logoURL) // Agrega una imagen miniatura (logo)
          .setTimestamp(); // Agrega la hora actual

        // Recorre las categorías y añade campos para cada categoría con sus nominados y votos
        for (const [category, nominees] of Object.entries(results)) {
          const nomineeText = nominees.map(nominee => `${nominee.name}: **${nominee.votes} votos**`).join('\n'); // Formatea cada nominado con su número de votos
          embed.addFields({ name: category, value: nomineeText || 'No hay nominaciones en esta categoría.' }); // Añade el campo para la categoría y sus nominados
        }

        // Edita el mensaje original con el embed que contiene los resultados
        await message.edit({ embeds: [embed] });

      } catch (error) {
        // Si hay un error al obtener los resultados, lo muestra en consola y notifica al usuario
        console.error('Error fetching results:', error);
        await interaction.followUp('Ocurrió un error al intentar obtener los resultados. Inténtalo nuevamente más tarde.');
      }
    }

    // Envía un mensaje inicial indicando que los resultados están siendo cargados
    const message = await interaction.reply({ content: 'Obteniendo resultados...', fetchReply: true });

    // Obtiene y muestra los resultados inmediatamente después de enviar el mensaje
    await fetchAndUpdateResults(message);

    // Establece una espera  para actualizar los resultados automáticamente cada 2 minutos
    setInterval(async () => {
      await fetchAndUpdateResults(message); // Actualiza el mensaje con nuevos resultados
    }, 120000); // 2 minutos = 120000 milisegundos
  }
};
