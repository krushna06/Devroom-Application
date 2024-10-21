const { SlashCommandBuilder } = require('discord.js');
const { UserData } = require('../models/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getpoints')
    .setDescription('Get the points of a user.')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to get points from')
        .setRequired(true)),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');

    try {
      const userRecord = await UserData.findOne({ where: { userId: targetUser.id } });

      if (!userRecord) {
        await interaction.reply(`${targetUser.username} has no points in the system.`);
      } else {
        await interaction.reply(`${targetUser.username} has ${userRecord.points} points.`);
      }
    } catch (error) {
      console.error('Error fetching points:', error);
      await interaction.reply({ content: 'There was an error fetching points.', ephemeral: true });
    }
  },
};
