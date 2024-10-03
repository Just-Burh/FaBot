const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); // Importamos las utilidades necesarias de discord.js

module.exports = {
    // Definimos el comando /server-oficial con opciones de IP y tipo de sesión
    data: new SlashCommandBuilder()
        .setName('server-oficial')
        .setDescription('Envía un embed con la IP y sesión proporcionada a un canal específico.')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('La dirección IP') // Añade la opción de IP como obligatoria
                .setRequired(true))
        .addStringOption(option =>
            option.setName('session')
                .setDescription('El tipo de sesión') // Añade la opción de sesión como obligatoria con opciones específicas
                .setRequired(true)
                .addChoices(
                    { name: 'Free Practice 1', value: 'Free Practice 1' },
                    { name: 'Free Practice 2', value: 'Free Practice 2' },
                    { name: 'Qualy', value: 'Qualy' },
                    { name: 'Race', value: 'Race' }
                )),
    
    // Lógica de ejecución del comando
    async execute(interaction) {
        const ip = interaction.options.getString('ip'); // Obtiene la IP del comando
        const session = interaction.options.getString('session'); // Obtiene la sesión seleccionada del comando
        const channelId = '1020475879740166234'; // Canal donde se enviará el embed (ID fijo)

        //  los roles que pueden usar este comando
        const allowedRoles = [
            '976975431574110258',
            '1277192428205641759',
            '983140438158504006',
            '1175980404013027448',
            '1283983161067311175',
            '976616892460593173'
        ];

        // Obtenemos los roles del miembro que ejecutó el comando
        const userRoles = interaction.member.roles.cache.map(role => role.id);

        // Verificamos si el usuario tiene al menos uno de los roles permitidos
        const hasRole = allowedRoles.some(roleId => userRoles.includes(roleId));
        if (!hasRole) {
            // Si el usuario no tiene los roles requeridos, se envía un mensaje y se detiene la ejecución
            return interaction.reply({ content: 'No tienes el rol necesario para usar este comando.', ephemeral: true });
        }

        // Creamos el embed con la IP y sesión proporcionada
        const embed = new EmbedBuilder()
            .setTitle('Nueva Sesion') // Título del embed
            .setDescription(`La dirección IP es: ${ip}\nLa Sesión es: ${session}`) // Descripción con la IP y la sesión
            .setImage('https://media.discordapp.net/attachments/1047927779292880906/1229158848296648764/Fayfiabanner.png?ex=66e54222&is=66e3f0a2&hm=ca2be8f573369db3a295b1a7fb8c57fe0ee96dd59fcb2c730a5bad23aaeaddd2&=&format=webp&quality=lossless&width=885&height=498') // Imagen del banner
            .setColor(0x00AE86) // Color del borde del embed
            .setTimestamp() // Añadimos un timestamp con la hora actual
            .setFooter({ text: `Enviado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() }); // Añadimos un pie de página con el nombre y avatar del usuario

        try {
            // Obtenemos el canal donde se enviará el embed usando el ID del canal
            const channel = interaction.client.channels.cache.get(channelId);
            if (!channel) {
                // Si el canal no existe, se muestra un mensaje de error
                return interaction.reply({ content: 'ID de canal no válido proporcionado!', ephemeral: true });
            }

            // Enviamos el embed al canal especificado, con menciones a roles y al usuario
            await channel.send({
                embeds: [embed],
                content: `<@${interaction.user.id}> <@&1003352629893681235> <@&977752848555204638> <@&1003353273031475230>` // Menciones a los roles y al usuario
            });

            // Respuesta confirmando que el embed fue enviado
            await interaction.reply({ content: 'Embed enviado exitosamente!', ephemeral: true });
        } catch (error) {
            // Manejo de errores al intentar enviar el embed 
            console.error(error);
            await interaction.reply({ content: 'Hubo un error al enviar el embed.', ephemeral: true });
        }
    },
};
