// Importa las librerías necesarias de Discord
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs'); // Para manipulación de archivos
const path = require('path'); // Para trabajar con rutas de archivos

// Define los roles permitidos que pueden usar este comando
const allowedRoles = [
    '976975431574110258',
    '1277192428205641759',
    '983140438158504006',
    '1175980404013027448',
    '1283983161067311175',
    '976616892460593173'
];

// Comando para enviar archivos .mpr
module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendmpr') // Nombre del comando
    .setDescription('Sends all .mpr files stored for this weekend.'), // Descripción del comando

  async execute(interaction) {
    // Ruta a la carpeta donde se almacenan los archivos .mpr para el fin de semana
    const weekendDir = path.join(__dirname, 'mpr_files', 'weekend');

    // Deferir la respuesta para dar tiempo al manejo de archivos
    await interaction.deferReply();

    // Verificar si la carpeta existe y contiene archivos .mpr
    if (!fs.existsSync(weekendDir)) {
      return interaction.editReply({ content: 'No .mpr files have been uploaded for this weekend.' });
    }

    // Leer los archivos .mpr (insensible a mayúsculas)
    const mprFiles = fs.readdirSync(weekendDir).filter(file => file.toLowerCase().endsWith('.mpr'));

    // Comprobar si hay archivos .mpr
    if (mprFiles.length === 0) {
      return interaction.editReply({ content: 'No .mpr files have been uploaded for this weekend.' });
    }

    // Crear un objeto para agrupar los archivos por sesión
    const groupedFiles = {
      FP1: [], // Free Practice 1
      FP2: [], // Free Practice 2
      QU1: [], // Qualifying 1
      QU2: [], // Qualifying 2
      QU3: [], // Qualifying 3
      RAC: []  // Race
    };

    // Agrupar archivos por su sesión basada en los nombres de los archivos (insensible a mayúsculas)
    mprFiles.forEach(file => {
      const session = file.substring(0, 3).toUpperCase(); // Extraer los primeros tres caracteres para la sesión
      console.log(`Processing file: ${file}, Session: ${session}`); // Registrar el archivo en procesamiento y su sesión
      
      // Agrupar según el tipo de sesión
      if (session === 'Q1') {
        groupedFiles.QU1.push(file);
      } else if (session === 'Q2') {
        groupedFiles.QU2.push(file);
      } else if (session === 'Q3') {
        groupedFiles.QU3.push(file);
      } else if (session === 'RAC') {
        groupedFiles.RAC.push(file);
      } else {
        // Registrar sesiones no reconocidas
        groupedFiles[session] ? groupedFiles[session].push(file) : console.log(`Warning: Unrecognized session - ${session}`);
      }
    });

    console.log('Grouped Files:', groupedFiles); // Registrar los archivos agrupados para depuración

    // Preparar mensajes para enviar
    const messages = [];

    // Crear mensajes para cada sesión con archivos
    for (const session in groupedFiles) {
      if (groupedFiles[session].length > 0) {
        const attachments = groupedFiles[session].map(file => {
          const filePath = path.join(weekendDir, file); // Ruta completa del archivo
          return { attachment: filePath, name: file }; // Preparar el archivo para el mensaje
        });

        messages.push({
          content: `Aqui esta el archivo mpr de la sesion  **${session}**:`, // Mensaje que se enviará
          files: attachments // Archivos adjuntos
        });
      }
    }

    // Enviar cada mensaje en orden
    for (const message of messages) {
      await interaction.followUp(message); // Enviar el mensaje
    }

    // Si no se prepararon mensajes, informar al usuario
    if (messages.length === 0) {
      await interaction.followUp({ content: 'No hay archivos .mpr para las sesiones especificadas.' });
    } else {
      await interaction.editReply({ content: 'Todos los archivos fueron enviados de manera correcta.', ephemeral: true }); // Confirmar el envío de archivos
    }
  },
};
