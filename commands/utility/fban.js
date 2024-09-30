const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
        .setName('fban')
        .setDescription('Ban a user with an optional reason and option for real or fake ban.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('ban_type')
                .setDescription('Specify if the ban is real or fake')
                .addChoices(
                    { name: 'Real', value: 'real' },
                    { name: 'Fake', value: 'fake' }
                )
                .setRequired(true)) // Make ban_type required
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban')
                .setRequired(false)), // Make reason optional

    async execute(interaction) {
        const userRoles = interaction.member.roles.cache.map(role => role.id);
        const hasRole = allowedRoles.some(roleId => userRoles.includes(roleId));

        // Check if the user has one of the allowed roles
        if (!hasRole) {
            return interaction.reply({ content: 'You do not have the required role to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided'; // Default reason if none is given
        const banType = interaction.options.getString('ban_type'); // Get the selected ban type

        // Create the embed
        const embed = new EmbedBuilder()
            .setColor(banType === 'real' ? '#FF0000' : '#00FF00') // Red for real, green for fake
            .setTitle(banType === 'real' ? 'User Banned' : 'Banned')
            .setDescription(`🚫 ${user.tag} has been ${banType === 'real' ? 'banned from the server.' : 'faked banned from the server.'}`)
            .addFields(
                { name: 'User', value: `${user.tag}`, inline: true },
                { name: 'ID', value: `${user.id}`, inline: true },
                { name: 'Reason', value: reason, inline: false } // Add the reason field
            )
            .setTimestamp()
            .setFooter({ text: banType === 'real' ? 'This is a real ban.' : 'This is a fake ban.' });

        // Reply with the embed
        await interaction.reply({ embeds: [embed] });

        // Handle the ban type
        if (banType === 'real') {
            try {
                await interaction.guild.members.ban(user.id, { reason }); // Real ban
                await interaction.followUp({ content: `${user.tag} has been banned from the server.`, ephemeral: true });
            } catch (error) {
                console.error(`Could not ban ${user.tag}:`, error);
                await interaction.followUp({ content: `Failed to ban ${user.tag}.`, ephemeral: true });
            }
        } else {
            // Fake ban (simulated)
            try {
                // Send the embed to the user via DM
                await user.send({ embeds: [embed] });
                // Optionally, send a message to a specific channel in the server
                const channel = interaction.guild.channels.cache.find(ch => ch.name === 'general'); // Adjust the channel name as needed
                if (channel) {
                    await channel.send(`🚨 : ${user.tag} has been faked banned from the server. Reason: ${reason}`);
                }
            } catch (error) {
                console.error(`Could not send DM to ${user.tag}:`, error);
                await interaction.followUp({ content: `Failed to send the fake ban message to ${user.tag}.`, ephemeral: true });
            }
        }
    },
};
