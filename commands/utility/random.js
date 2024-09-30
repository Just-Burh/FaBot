const { SlashCommandBuilder } = require('discord.js');
    
module.exports = {
    data: new SlashCommandBuilder()
        .setName('momento-random')
        .setDescription('Sends a random image and message from the specified thread.'),
    async execute(interaction) {
        const threadId = '1062200431956209694'; // Thread ID
        const channelId = '976610132978987100'; // Channel ID

        try {
            // Fetch the thread and messages
            const channel = await interaction.client.channels.fetch(channelId);
            const thread = await channel.threads.fetch(threadId);
            const messages = await thread.messages.fetch({ limit: 100 }); // Fetch up to 100 messages

            // Filter messages that contain attachments (images)
            const imageMessages = messages.filter(msg => msg.attachments.size > 0);

            if (imageMessages.size === 0) {
                return interaction.reply('No images found in the thread.');
            }

            // Pick a random message
            const randomMessage = imageMessages.random();
            const imageUrl = randomMessage.attachments.first().url;
            const messageAuthor = randomMessage.author.username;
            const messageTimestamp = randomMessage.createdAt.toDateString(); // Formats to a readable date string

            // Send the embed with the image, message, user, and timestamp
            await interaction.reply({
                embeds: [
                    {
                        title: 'Mensaje Random de https://discord.com/channels/976610132509196388/1062200431956209694',
                        description: randomMessage.content || 'Mensaje sin Contenido.',
                        image: {
                            url: imageUrl,
                        },
                        footer: {
                            text: `Message ID: ${randomMessage.id} | Enviado Por: ${messageAuthor} | Enviado el: ${messageTimestamp}`,
                        },
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching or sending random image:', error);
            await interaction.reply('There was an error while fetching or sending the image.');
        }
    },
};
