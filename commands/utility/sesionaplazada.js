const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); // Importa los constructores de comandos y de embeds

module.exports = {
    // Define el comando 
    data: new SlashCommandBuilder()
        .setName('sesion-aplazada') // Nombre del comando
        .setDescription('Set a postponed session.') // Descripción del comando
        .addStringOption(option =>
            option.setName('sesion-aplazada') // Opción para el tipo de sesión aplazada
                .setDescription('Type of postponed session')
                .setRequired(true)
                .addChoices( // Opciones disponibles para la sesión
                    { name: 'Free Practice 1', value: 'Free Practice 1' },
                    { name: 'Free Practice 2', value: 'Free Practice 2' },
                    { name: 'Qualy', value: 'Qualy' },
                    { name: 'Race', value: 'Race' }
                ))
        .addStringOption(option =>
            option.setName('minutos-aplazados') // Opción para los minutos aplazados
                .setDescription('Minutes postponed')
                .setRequired(true)
                .addChoices( // Opciones disponibles para los minutos
                    { name: '5 minutes', value: '5' },
                    { name: '10 minutes', value: '10' },
                    { name: '15 minutes', value: '15' },
                    { name: '20 minutes', value: '20' },
                    { name: '25 minutes', value: '25' },
                    { name: '30 minutes', value: '30' }
                )),

    async execute(interaction) {
        // Obtiene las opciones elegidas por el usuario
        const sesionAplazada = interaction.options.getString('sesion-aplazada');
        const minutosAplazados = interaction.options.getString('minutos-aplazados');

        // IDs de roles permitidos
        const allowedRoles = [
            '976975431574110258',
            '1277192428205641759',
            '983140438158504006',
            '1175980404013027448',
            '1283983161067311175',
            '976616892460593173'
        ];

        // Verifica si el usuario tiene uno de los roles permitidos
        const userRoles = interaction.member.roles.cache.map(role => role.id);
        const hasRole = allowedRoles.some(roleId => userRoles.includes(roleId));
        if (!hasRole) {
            return interaction.reply({ content: 'You do not have the required role to use this command.', ephemeral: true }); // Respuesta si no tiene el rol
        }

        // Crea el embed para enviar la información de la sesión aplazada
        const embed = new EmbedBuilder()
            .setTitle('Sesión Aplazada') // Título del embed
            .addFields( // Agrega campos al embed
                { name: 'Tipo de Sesión', value: sesionAplazada, inline: true },
                { name: 'Minutos Aplazados', value: minutosAplazados, inline: true }
            )
            .setColor(0x00AE86) // Color del embed
            .setTimestamp() // Marca de tiempo
            .setImage('https://media.discordapp.net/attachments/1047927779292880906/1229158848296648764/Fayfiabanner.png?ex=66e54222&is=66e3f0a2&hm=ca2be8f573369db3a295b1a7fb8c57fe0ee96dd59fcb2c730a5bad23aaeaddd2&=&format=webp&quality=lossless&width=885&height=498') // Imagen del embed
            .setFooter({ text: `Enviado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() }); // Pie de página con el nombre del usuario que envió

        try {
            // Obtiene el canal por ID
            const channel = interaction.client.channels.cache.get('1020475879740166234');
            if (!channel) {
                return interaction.reply({ content: 'Invalid channel ID provided!', ephemeral: true }); // Respuesta si el ID del canal no es válido
            }

            // Envía el embed al canal especificado con menciones de roles
            await channel.send({
                content: '<@&1003352629893681235> <@&977752848555204638> <@&1003353273031475230>', // Menciones de roles
                embeds: [embed] // Embed que se envía
            });

            await interaction.reply({ content: 'Sesión aplazada enviada exitosamente!', ephemeral: true }); // Respuesta de éxito al usuario
        } catch (error) {
            console.error(error); // Imprime el error en la consola
            await interaction.reply({ content: 'Hubo un error al enviar la sesión aplazada.', ephemeral: true }); // Respuesta de error al usuario
        }
    },
};
