const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('caracteristicas-circuitos')
        .setDescription('Set the characteristics for the circuit.')
        .addStringOption(option =>
            option.setName('numero-vueltas') // Opcion de vueltas (la que se leccione se mostrara en el embed) 
                .setDescription('Number of laps')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tipo-de-viento') // Opcion de viento (la que se leccione se mostrara en el embed)
                .setDescription('Type of wind')
                .setRequired(true)
                .addChoices(
                    { name: 'Sin Viento 🌬️', value: 'Sin Viento' },
                    { name: 'Viento Fuerte 🌪️', value: 'Viento Fuerte' },
                    { name: 'Viento Suave 🌫️', value: 'Viento Suave' }
                ))
        .addStringOption(option => // Opcion de desgaste de llantas (la que se leccione se mostrara en el embed)
            option.setName('desgaste')
                .setDescription('Tire wear')
                .setRequired(true)
                .addChoices(
                    { name: 'Desgaste Bajo 🚗', value: 'Desgaste Bajo' },
                    { name: 'Desgaste Medio 🚙', value: 'Desgaste Medio' },
                    { name: 'Desgaste Alto 🚕', value: 'Desgaste Alto' }
                ))
        .addStringOption(option =>  // Opcion de % de combustible (la que se leccione se mostrara en el embed) (tengo planeado cambiarla a que sea un string)
            option.setName('combustible')
                .setDescription('Fuel level')
                .setRequired(true)
                .addChoices(
                    { name: '1-10% ⛽', value: '1-10%' },
                    { name: '11-20% ⛽', value: '11-20%' },
                    { name: '21-30% ⛽', value: '21-30%' },
                    { name: '31-40% ⛽', value: '31-40%' },
                    { name: '41-50% ⛽', value: '41-50%' },
                    { name: '51-60% ⛽', value: '51-60%' },
                    { name: '61-70% ⛽', value: '61-70%' },
                    { name: '71-80% ⛽', value: '71-80%' },
                    { name: '81-90% ⛽', value: '81-90%' },
                    { name: '91-100% ⛽', value: '91-100%' }
                ))
        .addStringOption(option => // Opcion de linea de box (la que se seleccione saldra en el embed) 
            option.setName('lineas-de-box')
                .setDescription('Box lines')
                .setRequired(true)
                .addChoices(
                    { name: 'Sí ✅', value: 'Sí' },
                    { name: 'No ❌', value: 'No' }
                ))
        .addStringOption(option => // Opcion de linea de box (la que se seleccione saldra en el embed) (opcion string)
            option.setName('tiempo-permisible-maximo')
                .setDescription('Maximum allowable time')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('clima')
                .setDescription('Weather condition') // Opcion de clima (la que se seleccione se mostrara en el embed)
                .setRequired(true)
                .addChoices(
                    { name: 'Día Claro ☀️', value: 'Día Claro' },
                    { name: 'Parcialmente Nublado 🌤️', value: 'Parcialmente Nublado' },
                    { name: 'Nublado ☁️', value: 'Nublado' },
                    { name: 'Lluvia 🌧️', value: 'Lluvia' }
                ))
        .addStringOption(option => // Opcion de clima tiempo (la que se seleccione se mostrara en el texto)
            option.setName('tiempo')
                .setDescription('Time of day')
                .setRequired(true)
                .addChoices(
                    { name: 'Mañana 🌅', value: 'Mañana' },
                    { name: 'Medio día ☀️', value: 'Medio día' },
                    { name: 'Atardecer 🌇', value: 'Atardecer' }
                ))
        .addStringOption(option => // Opcion de nombre del circuito (Opcion de texto)
            option.setName('nombre-del-circuito')
                .setDescription('Name of the circuit')
                .setRequired(true)),

    
            // Obtiene las opciones dadas en el comando.
                async execute(interaction) {
        const numeroVueltas = interaction.options.getString('numero-vueltas');
        const tipoDeViento = interaction.options.getString('tipo-de-viento');
        const desgaste = interaction.options.getString('desgaste');
        const combustible = interaction.options.getString('combustible');
        const lineasDeBox = interaction.options.getString('lineas-de-box');
        const tiempoPermisibleMaximo = interaction.options.getString('tiempo-permisible-maximo');
        const clima = interaction.options.getString('clima');
        const tiempo = interaction.options.getString('tiempo');
        const nombreDelCircuito = interaction.options.getString('nombre-del-circuito');

        // Lista de roles permitidos
        const allowedRoles = [
            '976975431574110258',
            '1277192428205641759',
            '983140438158504006',
            '1175980404013027448',
            '1283983161067311175',
            '976616892460593173'
        ];


        //Verifica que el usuario tenga el rol permitido
        const userRoles = interaction.member.roles.cache.map(role => role.id);
        const hasRole = allowedRoles.some(roleId => userRoles.includes(roleId));
        if (!hasRole) {
            return interaction.reply({ content: 'You do not have the required role to use this command.', ephemeral: true });
        }

        // Reconocer la interacción inmediatamente
        await interaction.deferReply({ ephemeral: true });

        // Crear el Embed
        const embed = new EmbedBuilder()
            .setTitle('Características del Circuito')
            .addFields(
                { name: 'Número de Vueltas', value: numeroVueltas, inline: true },
                { name: 'Tipo de Viento', value: tipoDeViento, inline: true },
                { name: 'Desgaste', value: desgaste, inline: true },
                { name: 'Combustible', value: combustible, inline: true },
                { name: 'Líneas de Box', value: lineasDeBox, inline: true },
                { name: 'Tiempo Permisible Máximo', value: tiempoPermisibleMaximo, inline: true },
                { name: 'Clima', value: clima, inline: true },
                { name: 'Tiempo', value: tiempo, inline: true },
                { name: 'Nombre del Circuito', value: nombreDelCircuito, inline: true }
            )
            .setColor(0x00AE86)
            .setTimestamp()
            .setImage('https://media.discordapp.net/attachments/1047927779292880906/1229158848296648764/Fayfiabanner.png?ex=66e54222&is=66e3f0a2&hm=ca2be8f573369db3a295b1a7fb8c57fe0ee96dd59fcb2c730a5bad23aaeaddd2&=&format=webp&quality=lossless&width=885&height=498')
            .setFooter({ text: `Enviado por  ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() }); // Footer added here

        // Crear los botones
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('run_gp')
                    .setLabel('Voy a correr este GP 🚀') // en caso de dar click a este comando el bot enviara <@${interaction.user.id}>SI  corre este gp a un canal de administracion.
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('no_run_gp')
                    .setLabel('No voy a correr este GP ❌')// en caso de dar click a este comando el bot enviara <@${interaction.user.id}> NO corre este gp a un canal de administracion.
                    .setStyle(ButtonStyle.Danger)
            );

        try {
            // Enviar el Embed al canal de avisos-gps 
            const channel = interaction.client.channels.cache.get('1005988966346010634');
            if (!channel) {
                return await interaction.followUp({ content: 'Invalid channel ID provided!', ephemeral: true });
            }

            // Envia el embed al canal especificado
            const message = await channel.send({
                content: `\nEnviado por <@${interaction.user.id}> <@&1003352629893681235> <@&977752848555204638> <@&1003353273031475230>`, // Mention the user who sent the command
                embeds: [embed],
                components: [row]
            });

            // Envia un mensaje de respuesta confirmando que el embed fue enviado con exito
            await interaction.followUp({ content: 'Características del circuito enviadas exitosamente!', ephemeral: true });

            // Optionally set a timeout for periodic status updates
            setTimeout(async () => {
                await channel.send(`Las características del circuito han sido enviadas y están disponibles para revisión.`);
            }, 60000); // Envia un recordatorio cada 60 minutos.

        } catch (error) {  // Envia un texto efimero en caso de que haya un error en enviar el mensaje.
            console.error(error);
            await interaction.followUp({ content: 'Hubo un error al enviar las características del circuito.', ephemeral: true });
        }
    },
};
