const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clima')
        .setDescription('Get the current weather information.')
        .addStringOption(option =>
            option.setName('ciudad')
                .setDescription('City to get the weather for')
                .setRequired(true)),
    async execute(interaction) {
        const city = interaction.options.getString('ciudad');
        const apiKey = process.env.OPENWEATHERMAP_API_KEY; // Make sure to set this in your .env file
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        try {
            const response = await axios.get(url);
            const weather = response.data;
            const temp = weather.main.temp;
            const description = weather.weather[0].description;
            const icon = weather.weather[0].icon;
            const emoji = getWeatherEmoji(description);
            
            // Check for rain information
            const rain = weather.rain ? weather.rain['1h'] : 0; // Rain volume in the last hour

            const embed = new EmbedBuilder()
                .setColor('#1E90FF')
                .setTitle(`Weather in ${city}`)
                .setDescription(`${emoji} ${description.charAt(0).toUpperCase() + description.slice(1)}`)
                .addFields(
                    { name: 'Temperature', value: `${temp}°C`, inline: true },
                    { name: 'Feels Like', value: `${weather.main.feels_like}°C`, inline: true },
                    { name: 'Humidity', value: `${weather.main.humidity}%`, inline: true },
                    { name: 'Chance of Rain (Last Hour)', value: `${rain > 0 ? `${rain} mm` : 'No rain'}`, inline: true }
                )
                .setThumbnail(`http://openweathermap.org/img/wn/${icon}.png`)
                .setTimestamp()
                .setFooter({ text: 'Weather information provided by OpenWeatherMap' });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Unable to retrieve weather information. Please try again later.', ephemeral: true });
        }
    },
};

// Function to map weather descriptions to emojis
function getWeatherEmoji(description) {
    if (description.includes('clear')) return '☀️';
    if (description.includes('cloud')) return '☁️';
    if (description.includes('rain')) return '🌧️';
    if (description.includes('snow')) return '❄️';
    if (description.includes('thunderstorm')) return '⛈️';
    if (description.includes('fog')) return '🌫️';
    return '🌈'; // Default emoji
}
