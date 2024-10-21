const { SlashCommandBuilder } = require('discord.js');
const { sequelize } = require('../models/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Set a welcome message for new users.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The welcome message to send')
        .setRequired(true)),
  
  async execute(interaction) {
    const welcomeMessage = interaction.options.getString('message');

    try {
      await interaction.reply(`Welcome message set to: "${welcomeMessage}"`);

    } catch (error) {
      console.error('Error setting welcome message:', error);
      await interaction.reply({ content: 'There was an error setting the welcome message.', ephemeral: true });
    }
  },
};
