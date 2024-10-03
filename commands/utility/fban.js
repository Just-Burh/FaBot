const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Definir los roles permitidos para usar el comando
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
        .setName('fban') // Nombre del comando
        .setDescription('Banear a un usuario con opción de ban real o falso.')
        .addUserOption(option =>
            option.setName('user') // Opción para seleccionar el usuario
                .setDescription('El usuario a banear')
                .setRequired(true)) // Es obligatorio
        .addStringOption(option =>
            option.setName('ban_type') // Opción para seleccionar el tipo de ban
                .setDescription('Especificar si el ban es real o falso')
                .addChoices(
                    { name: 'Real', value: 'real' }, // Opción para ban real
                    { name: 'Fake', value: 'fake' }  // Opción para ban falso
                )
                .setRequired(true)) // Obligatorio
        .addStringOption(option =>
            option.setName('reason') // Opción para ingresar la razón del ban
                .setDescription('Razón para el ban')
                .setRequired(false)), // No obligatorio

    async execute(interaction) {
        // Obtener los roles del usuario que ejecuta el comando
        const userRoles = interaction.member.roles.cache.map(role => role.id);
        const hasRole = allowedRoles.some(roleId => userRoles.includes(roleId));

        // Verificar si el usuario tiene un rol permitido
        if (!hasRole) {
            return interaction.reply({ content: 'No tienes el rol requerido para usar este comando.', ephemeral: true });
        }

        const user = interaction.options.getUser('user'); // Usuario seleccionado para el ban
        const reason = interaction.options.getString('reason') || 'No se proporcionó una razón'; // Razón del ban (si no se proporciona, usa el valor por defecto)
        const banType = interaction.options.getString('ban_type'); // Tipo de ban (real o falso)

        // Crear el embed para la respuesta del ban
        const embed = new EmbedBuilder()
            .setColor(banType === 'real' ? '#FF0000' : '#00FF00') // Rojo para ban real, verde para ban falso
            .setTitle(banType === 'real' ? 'Usuario Baneado' : 'Usuario Baneado')
            .setDescription(`🚫 ${user.tag} ha sido ${banType === 'real' ? 'baneado del servidor.' : 'baneado del servidor.'}`)
            .addFields(
                { name: 'Usuario', value: `${user.tag}`, inline: true },
                { name: 'ID', value: `${user.id}`, inline: true },
                { name: 'Razón', value: reason, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: banType === 'real' ? 'Este es un ban real.' : 'Este es un ban real.' });

        // Enviar el embed como respuesta al comando
        await interaction.reply({ embeds: [embed] });

        // Manejar el tipo de ban
        if (banType === 'real') {
            try {
                // Ban real al usuario
                await interaction.guild.members.ban(user.id, { reason });
                await interaction.followUp({ content: `${user.tag} ha sido baneado del servidor.`, ephemeral: true });
            } catch (error) {
                console.error(`No se pudo banear a ${user.tag}:`, error);
                await interaction.followUp({ content: `Error al banear a ${user.tag}.`, ephemeral: true });
            }
        } else {
            // Ban falso (simulado)
            try {
                // Enviar un DM al usuario simulado
                await user.send({ embeds: [embed] });
                // Opcionalmente, enviar un mensaje en un canal específico
                const channel = interaction.guild.channels.cache.find(ch => ch.name === 'general');
                if (channel) {
                    await channel.send(`🚨 : ${user.tag} ha sido baneado del servidor. Razón: ${reason}`);
                }
            } catch (error) {
                console.error(`No se pudo enviar un DM a ${user.tag}:`, error);
                await interaction.followUp({ content: `Error al enviar el mensaje de ban falso a ${user.tag}.`, ephemeral: true });
            }
        }
    },
};
