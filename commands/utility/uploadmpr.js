const { SlashCommandBuilder } = require('@discordjs/builders'); // Importa el constructor de comandos de barra
const axios = require('axios'); // Importa Axios para realizar solicitudes HTTP
const fs = require('fs'); // Importa el módulo para trabajar con el sistema de archivos
const path = require('path'); // Importa el módulo para trabajar con rutas de archivos

// Define los roles permitidos
const allowedRoles = [
  '976975431574110258',
  '1277192428205641759',
  '983140438158504006',
  '1175980404013027448',
  '1283983161067311175',
  '976616892460593173'
];

// Comando para subir y almacenar archivos .mpr
module.exports = {
  data: new SlashCommandBuilder()
    .setName('uploadmpr') // Nombre del comando
    .setDescription('Upload .mpr files for a specific session (FP1, FP2, QU1, QU2, QU3, RAC).') // Descripción del comando
    .addStringOption(option =>
      option.setName('session') // Opción para la sesión del archivo .mpr
        .setDescription('The session for the .mpr file (FP1, FP2, QU1, QU2, QU3, RAC)') // Descripción de la opción
        .setRequired(true) // Esta opción es obligatoria
        .addChoices( // Opciones disponibles para la sesión
          { name: 'FP1', value: 'FP1' },
          { name: 'FP2', value: 'FP2' },
          { name: 'QU1', value: 'QU1' },
          { name: 'QU2', value: 'QU2' },
          { name: 'QU3', value: 'QU3' },
          { name: 'RAC', value: 'RAC' }
        )
    )
    .addAttachmentOption(option =>
      option.setName('file') // Opción para adjuntar el archivo
        .setDescription('The .mpr file to upload') // Descripción de la opción
        .setRequired(true)), // Esta opción es obligatoria

  async execute(interaction) {
    // Verifica si el usuario tiene uno de los roles permitidos
    const userRoles = interaction.member.roles.cache.map(role => role.id); // Obtiene los roles del usuario
    const hasRole = allowedRoles.some(roleId => userRoles.includes(roleId)); // Verifica si tiene un rol permitido

    if (!hasRole) {
      return interaction.reply({ content: 'You do not have the required role to use this command.', ephemeral: true }); // Respuesta si no tiene el rol
    }

    const session = interaction.options.getString('session'); // Obtiene la sesión seleccionada
    const file = interaction.options.getAttachment('file'); // Obtiene el archivo adjunto

    // Solo permite archivos .mpr
    if (!file.name.endsWith('.mpr')) {
      return interaction.reply({ content: 'Please upload a valid `.mpr` file.', ephemeral: true }); // Respuesta si el archivo no es válido
    }

    // Aplaza la respuesta para dar más tiempo para procesar el archivo
    await interaction.deferReply({ ephemeral: true });

    // Ruta a la carpeta donde se almacenarán los archivos .mpr
    const weekendDir = path.join(__dirname, 'mpr_files', 'weekend');

    // Crea la carpeta si no existe
    if (!fs.existsSync(weekendDir)) {
      fs.mkdirSync(weekendDir, { recursive: true }); // Crea la carpeta y las subcarpetas necesarias
    }

    // Define la ruta del archivo para el archivo subido
    const filePath = path.join(weekendDir, `${session}.mpr`);

    // Verifica si ya se ha subido un archivo para esta sesión
    if (fs.existsSync(filePath)) {
      return interaction.editReply({ content: `A file for the session ${session} has already been uploaded. You cannot upload another file for this session.` }); // Respuesta si ya existe un archivo
    }

    try {
      // Descarga y almacena el archivo localmente
      const response = await axios.get(file.url, { responseType: 'stream' }); // Realiza la solicitud para obtener el archivo
      const writer = fs.createWriteStream(filePath); // Crea un flujo de escritura para guardar el archivo
      response.data.pipe(writer); // Pasa los datos del archivo al flujo de escritura

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve); // Resuelve la promesa cuando se complete la escritura
        writer.on('error', reject); // Rechaza la promesa si ocurre un error
      });

      // Edita la respuesta diferida para notificar el éxito
      await interaction.editReply({ content: `File ${file.name} for session ${session} uploaded and stored successfully!` }); // Respuesta de éxito al usuario
    } catch (error) {
      console.error('Error storing file:', error); // Imprime el error en la consola
      await interaction.editReply({ content: 'There was an error uploading the file.' }); // Respuesta de error al usuario
    }
  },
};
