const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 5, // Establecer un tiempo de espera de 5 segundos para evitar spam del comando
    data: new SlashCommandBuilder()
        .setName('ping') // Nombre del comando
        .setDescription('Responde con Pong y muestra la latencia en ms.'),
    async execute(interaction) {
        // Guardar el tiempo antes de la respuesta
        const sent = await interaction.reply({ content: 'Pong!', fetchReply: true });
        // Calcular la latencia en ms restando el tiempo de envío con el actual
        const timeDifference = sent.createdTimestamp - interaction.createdTimestamp;
        
        // Editar la respuesta para incluir el tiempo de latencia en ms
        await interaction.editReply(`Pong! La latencia es de ${timeDifference}ms.`);
    },
};
