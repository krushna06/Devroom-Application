const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Repeats your message and counts words')
    .addStringOption(option => 
      option.setName('message')
        .setDescription('The message to echo')
        .setRequired(true)),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const wordCount = message.split(/\s+/).length;
    
    const sanitizedMessage = message.replace(/[*_`~]/g, '\\$&');
    
    await interaction.reply(`Echo: "${sanitizedMessage}" (Words: ${wordCount})`);
  },
};
