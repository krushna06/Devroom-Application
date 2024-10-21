const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Sends a greeting with your username and a random emoji'),
  async execute(interaction) {
    const emojis = ['😊', '👋', '😃', '🎉', '😎'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    await interaction.reply(`Hello, ${interaction.user.username}! ${randomEmoji}`);
  },
};
