const { SlashCommandBuilder, TextChannel, NewsChannel } = require('discord.js');

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
        .setName('send-message')
        .setDescription('Send a message and optional attachments to a specified channel.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('attachment')
                .setDescription('The attachment to send')),

    async execute(interaction) {
        const userRoles = interaction.member.roles.cache.map(role => role.id);
        const hasRole = allowedRoles.some(roleId => userRoles.includes(roleId));

        // Check if the user has one of the allowed roles
        if (!hasRole) {
            return interaction.reply({ content: 'You do not have the required role to use this command.', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        const messageContent = interaction.options.getString('message');
        const attachment = interaction.options.getAttachment('attachment');

        // Check if the channel is a text channel or an announcement channel
        if (!(channel instanceof TextChannel || channel instanceof NewsChannel)) {
            return interaction.reply({ content: 'You can only send messages to text channels or announcement channels.', ephemeral: true });
        }

        try {
            await channel.send({
                content: messageContent,
                files: attachment ? [attachment.url] : [],
            });

            // Reply to the interaction to confirm the message was sent
            await interaction.reply({ content: 'Message sent successfully!', ephemeral: true });
        } catch (error) {
            console.error('Error sending message:', error);
            await interaction.reply({ content: 'There was an error while sending the message.', ephemeral: true });
        }
    },
};
