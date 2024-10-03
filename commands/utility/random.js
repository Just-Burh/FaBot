const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Define el nombre y descipcion del comando.
    data: new SlashCommandBuilder()
        .setName('momento-random')
        .setDescription('Envía una imagen o video y mensaje aleatorios del hilo especificado.'),
    async execute(interaction) {
        // ID del hilo del que queremos obtener los mensajes
        const threadId = '1062200431956209694'; 
        // ID del canal donde se encuentra el hilo
        const channelId = '976610132978987100'; 

        try {
            // Obtener el canal donde está el hilo
            const channel = await interaction.client.channels.fetch(channelId);
            // Obtener el hilo usando el ID
            const thread = await channel.threads.fetch(threadId);
            // Obtener hasta 100 mensajes del hilo
            const messages = await thread.messages.fetch({ limit: 100 }); 

            // Filtrar los mensajes que contienen archivos adjuntos (imágenes o videos)
            const mediaMessages = messages.filter(msg => {
                const attachments = msg.attachments;
                return attachments.some(attachment => 
                    attachment.contentType.startsWith('image/') || attachment.contentType.startsWith('video/')
                );
            });

            // Si no hay mensajes con imágenes o videos, se responde al usuario
            if (mediaMessages.size === 0) {
                return interaction.reply('No se encontraron imágenes o videos en el hilo.');
            }

            // Elegir un mensaje aleatorio de los que tienen imágenes o videos
            const randomMessage = mediaMessages.random();
            const attachment = randomMessage.attachments.first();
            const mediaUrl = attachment.url; // URL del archivo (imagen o video)
            const mediaType = attachment.contentType.startsWith('image/') ? 'Imagen' : 'Video';
            const messageAuthor = randomMessage.author.username;
            const messageTimestamp = randomMessage.createdAt.toDateString(); 

            // Enviar el embed con el archivo (imagen o video), el contenido del mensaje, el autor y la fecha
            await interaction.reply({
                embeds: [
                    {
                        title: `Mensaje Random (${mediaType}) de https://discord.com/channels/976610132509196388/1062200431956209694`, // Enlace al hilo
                        description: randomMessage.content || 'Mensaje sin Contenido.', // Si el mensaje no tiene texto, se muestra este mensaje.
                        image: attachment.contentType.startsWith('image/') ? { url: mediaUrl } : undefined, // Solo se usa `image` si es una imagen
                        video: attachment.contentType.startsWith('video/') ? { url: mediaUrl } : undefined, // Solo se usa `video` si es un video
                        footer: {
                            // Mostramos información adicional en el footer del embed: ID del mensaje, autor y fecha de envío
                            text: `ID del Mensaje: ${randomMessage.id} | Enviado Por: ${messageAuthor} | Enviado el: ${messageTimestamp}`,
                        },
                    },
                ],
            });
        } catch (error) {
            // Manejo de errores en caso de fallos al obtener o enviar el mensaje
            console.error('Error al obtener o enviar un archivo aleatorio (imagen o video):', error);
            await interaction.reply('Hubo un error al obtener o enviar la imagen o video.');
        }
    },
};
