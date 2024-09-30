const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-oficial')
        .setDescription('Send an embed with provided IP and session to a specific channel.')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('The IP address')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('session')
                .setDescription('The session type')
                .setRequired(true)
                .addChoices(
                    { name: 'Free Practice 1', value: 'Free Practice 1' },
                    { name: 'Free Practice 2', value: 'Free Practice 2' },
                    { name: 'Qualy', value: 'Qualy' },
                    { name: 'Race', value: 'Race' }
                )),

    async execute(interaction) {
        const ip = interaction.options.getString('ip');
        const session = interaction.options.getString('session');
        const channelId = '1020475879740166234'; // Fixed channel ID

        // Check if the user has the required roles
        const allowedRoles = [
            '976975431574110258',
            '1277192428205641759',
            '983140438158504006',
            '1175980404013027448',
            '1283983161067311175',
            '976616892460593173'
        ];

        const userRoles = interaction.member.roles.cache.map(role => role.id);

        const hasRole = allowedRoles.some(roleId => userRoles.includes(roleId));
        if (!hasRole) {
            return interaction.reply({ content: 'You do not have the required role to use this command.', ephemeral: true });
        }

        // Create the embed with the session and IP
        const embed = new EmbedBuilder()
            .setTitle('Nueva Sesion')
            .setDescription(`La direccion IP es: ${ip}\nLa Sesion es: ${session}`)
            .setImage('https://media.discordapp.net/attachments/1047927779292880906/1229158848296648764/Fayfiabanner.png?ex=66e54222&is=66e3f0a2&hm=ca2be8f573369db3a295b1a7fb8c57fe0ee96dd59fcb2c730a5bad23aaeaddd2&=&format=webp&quality=lossless&width=885&height=498')
            .setColor(0x00AE86)
            .setTimestamp();

        try {
            // Fetch the channel by ID
            const channel = interaction.client.channels.cache.get(channelId);
            if (!channel) {
                return interaction.reply({ content: 'Invalid channel ID provided!', ephemeral: true });
            }

            // Send the embed to the specified channel
            await channel.send({
                embeds: [embed],
                content: '<@&1003352629893681235> <@&977752848555204638> <@&1003353273031475230>'
            });

            await interaction.reply({ content: 'Embed sent successfully!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error sending the embed.', ephemeral: true });
        }
    },
};
