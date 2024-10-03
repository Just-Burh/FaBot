const { SlashCommandBuilder } = require('@discordjs/builders'); // Importa el constructor de comandos de barra
const fs = require('fs'); // Importa el módulo de sistema de archivos para manejar archivos
const path = require('path'); // Importa el módulo para manejar rutas de archivos

// Define los roles permitidos
const allowedRoles = [
  '976975431574110258',
  '1277192428205641759',
  '983140438158504006',
  '1175980404013027448',
  '1283983161067311175',
  '976616892460593173'
];

module.exports = {
  // Define el comando usando el constructor de comandos de barra
  data: new SlashCommandBuilder()
    .setName('cleanupmpr') // Nombre del comando
    .setDescription('Deletes all .mpr files for the past weekend.'), // Descripción del comando
  
  async execute(interaction) {
    // Verifica si el usuario tiene uno de los roles permitidos
    const userRoles = interaction.member.roles.cache.map(role => role.id); // Obtiene los IDs de los roles del usuario
    const hasRole = allowedRoles.some(roleId => userRoles.includes(roleId)); // Comprueba si el usuario tiene un rol permitido

    // Si el usuario no tiene el rol necesario, envía un mensaje de error
    if (!hasRole) {
      return interaction.reply({ content: 'You do not have the required role to use this command.', ephemeral: true });
    }

    // Ruta a la carpeta donde se almacenan los archivos .mpr del fin de semana
    const weekendDir = path.join(__dirname, 'mpr_files', 'weekend');

    // Verifica si la carpeta existe
    if (!fs.existsSync(weekendDir)) {
      return interaction.reply({ content: 'No .mpr files have been uploaded for this weekend.', ephemeral: true });
    }

    // Lee y filtra todos los archivos .mpr en la carpeta
    const mprFiles = fs.readdirSync(weekendDir).filter(file => file.endsWith('.mpr')); // Obtiene solo los archivos .mpr

    // Si no hay archivos .mpr para eliminar, envía un mensaje de notificación
    if (mprFiles.length === 0) {
      return interaction.reply({ content: 'No .mpr files found to delete.', ephemeral: true });
    }

    // Elimina cada archivo encontrado
    mprFiles.forEach(file => {
      const filePath = path.join(weekendDir, file); // Genera la ruta completa del archivo
      fs.unlinkSync(filePath); // Elimina el archivo de forma sincrónica
    });

    // Responde al usuario confirmando que los archivos han sido eliminados
    await interaction.reply({ content: 'All .mpr files for the past weekend have been deleted successfully.', ephemeral: true });
  },
};
