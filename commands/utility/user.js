const { SlashCommandBuilder } = require('discord.js'); // Importa el constructor de comandos de barra

module.exports = {
	cooldown: 5, // Define el tiempo de espera para volver a usar el comando
	data: new SlashCommandBuilder()
		.setName('user') // Nombre del comando
		.setDescription('Provides information about the user.'), // Descripción del comando
	async execute(interaction) {
		// Recopila información del usuario
		const username = interaction.user.username; // Nombre de usuario
		const userId = interaction.user.id; // ID del usuario
		const joinedAt = interaction.member.joinedAt.toDateString(); // Fecha en que se unió al servidor
		const userAvatar = interaction.user.displayAvatarURL(); // URL del avatar del usuario
		const userRoles = interaction.member.roles.cache.map(role => role.name).join(', '); // Nombres de los roles del usuario

		// Prepara la respuesta con información adicional del usuario
		const response = `
			**Nombre de usuario:** ${username} 
			**ID de usuario:** ${userId} 
			**Fecha de ingreso al servidor:** ${joinedAt} 
			**Roles:** ${userRoles || 'Sin roles'} 
			**Avatar:** [Ver Avatar](${userAvatar})
		`;

		// Responde al comando con la información del usuario
		await interaction.reply(response);
	},
};
