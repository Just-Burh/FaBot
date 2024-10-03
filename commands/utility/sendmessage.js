const { SlashCommandBuilder, TextChannel, NewsChannel } = require('discord.js');

// Lista de roles permitidos para usar el comando
const allowedRoles = [
    '976975431574110258',
    '1277192428205641759',
    '983140438158504006',
    '1175980404013027448',
    '1283983161067311175',
    '976616892460593173'
];

module.exports = {
    // Definición del comando /send-message con las opciones de canal, mensaje y archivo adjunto
    data: new SlashCommandBuilder()
        .setName('send-message')
        .setDescription('Envía un mensaje y adjuntos opcionales a un canal específico.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('El canal al que se enviará el mensaje')
                .setRequired(true)) // Opción para seleccionar el canal
        .addStringOption(option =>
            option.setName('message')
                .setDescription('El mensaje a enviar')
                .setRequired(true)) // Opción para ingresar el mensaje
        .addAttachmentOption(option =>
            option.setName('attachment')
                .setDescription('El adjunto que se enviará')), // Opción para agregar un archivo adjunto opcional

    // Lógica de ejecución del comando
    async execute(interaction) {
        // Obtener los roles del miembro que ejecutó el comando
        const userRoles = interaction.member.roles.cache.map(role => role.id);
        const hasRole = allowedRoles.some(roleId => userRoles.includes(roleId)); // Verificar si el usuario tiene uno de los roles permitidos

        // Si el usuario no tiene los roles necesarios, responde con un mensaje de error
        if (!hasRole) {
            return interaction.reply({ content: 'No tienes el rol necesario para usar este comando.', ephemeral: true });
        }

        // Obtener el canal, mensaje y archivo adjunto de las opciones ingresadas por el usuario
        const channel = interaction.options.getChannel('channel');
        const messageContent = interaction.options.getString('message');
        const attachment = interaction.options.getAttachment('attachment');

        // Verificar si el canal es un canal de texto o de anuncios (anuncios = NewsChannel)
        if (!(channel instanceof TextChannel || channel instanceof NewsChannel)) {
            return interaction.reply({ content: 'Solo puedes enviar mensajes a canales de texto o de anuncios.', ephemeral: true });
        }

        try {
            // Enviar el mensaje al canal especificado junto con el archivo adjunto si se proporciona
            await channel.send({
                content: messageContent,
                files: attachment ? [attachment.url] : [], // Adjuntar el archivo si se proporciona
            });

            // Responder al usuario para confirmar que el mensaje fue enviado exitosamente
            await interaction.reply({ content: '¡Mensaje enviado exitosamente!', ephemeral: true });
        } catch (error) {
            // Manejo de errores si hay problemas al enviar el mensaje
            console.error('Error al enviar el mensaje:', error);
            await interaction.reply({ content: 'Hubo un error al enviar el mensaje.', ephemeral: true });
        }
    },
};
