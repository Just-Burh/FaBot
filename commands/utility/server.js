const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
		// Obtiene el creador del servidor
		const owner = await interaction.guild.fetchOwner();
		
		// Calcula la edad del servidor
		const createdAt = interaction.guild.createdAt; // Fecha de creación
		const now = new Date(); // Fecha actual
		const age = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)); // Edad en días

		// Obtiene el número de canales (texto y voz)
		const textChannels = interaction.guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT').size;
		const voiceChannels = interaction.guild.channels.cache.filter(channel => channel.type === 'GUILD_VOICE').size;

		// Prepara la respuesta con la información del servidor
		const serverInfo = `
			**Servidor:** ${interaction.guild.name}
			**Creador:** ${owner.user.tag}
			**Edad del servidor:** ${age} días
			**Miembros:** ${interaction.guild.memberCount}
			**Canales de texto:** ${textChannels}
			**Canales de voz:** ${voiceChannels}
		`;

		await interaction.reply(serverInfo); // Responde con la información del servidor
	},
};
