const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sesion-aplazada')
        .setDescription('Set a postponed session.')
        .addStringOption(option =>
            option.setName('sesion-aplazada')
                .setDescription('Type of postponed session')
                .setRequired(true)
                .addChoices(
                    { name: 'Free Practice 1', value: 'Free Practice 1' },
                    { name: 'Free Practice 2', value: 'Free Practice 2' },
                    { name: 'Qualy', value: 'Qualy' },
                    { name: 'Race', value: 'Race' }
                ))
        .addStringOption(option =>
            option.setName('minutos-aplazados')
                .setDescription('Minutes postponed')
                .setRequired(true)
                .addChoices(
                    { name: '5 minutes', value: '5' },
                    { name: '10 minutes', value: '10' },
                    { name: '15 minutes', value: '15' },
                    { name: '20 minutes', value: '20' },
                    { name: '25 minutes', value: '25' },
                    { name: '30 minutes', value: '30' }
                )),

    async execute(interaction) {
        const sesionAplazada = interaction.options.getString('sesion-aplazada');
        const minutosAplazados = interaction.options.getString('minutos-aplazados');

        // Allowed role IDs
        const allowedRoles = [
            '976975431574110258',
            '1277192428205641759',
            '983140438158504006',
            '1175980404013027448',
            '1283983161067311175',
            '976616892460593173'
        ];

        // Check if the user has one of the allowed roles
        const userRoles = interaction.member.roles.cache.map(role => role.id);
        const hasRole = allowedRoles.some(roleId => userRoles.includes(roleId));
        if (!hasRole) {
            return interaction.reply({ content: 'You do not have the required role to use this command.', ephemeral: true });
        }

        // Create the embed
        const embed = new EmbedBuilder()
            .setTitle('Sesión Aplazada')
            .addFields(
                { name: 'Tipo de Sesión', value: sesionAplazada, inline: true },
                { name: 'Minutos Aplazados', value: minutosAplazados, inline: true }
            )
            .setColor(0x00AE86)
            .setTimestamp()
            .setImage('https://media.discordapp.net/attachments/1047927779292880906/1229158848296648764/Fayfiabanner.png?ex=66e54222&is=66e3f0a2&hm=ca2be8f573369db3a295b1a7fb8c57fe0ee96dd59fcb2c730a5bad23aaeaddd2&=&format=webp&quality=lossless&width=885&height=498');

        try {
            // Fetch the channel by ID
            const channel = interaction.client.channels.cache.get('1020475879740166234');
            if (!channel) {
                return interaction.reply({ content: 'Invalid channel ID provided!', ephemeral: true });
            }

            // Send the embed to the specified channel with role mentions
            await channel.send({
                content: '<@&1003352629893681235> <@&977752848555204638> <@&1003353273031475230>',
                embeds: [embed]
            });

            await interaction.reply({ content: 'Sesión aplazada enviada exitosamente!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Hubo un error al enviar la sesión aplazada.', ephemeral: true });
        }
    },
};
