const { SlashCommandBuilder } = require('discord.js');
const { UserData } = require('../models/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addpoints')
    .setDescription('Add points to a user.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to give points to')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('points')
        .setDescription('The number of points to add')
        .setRequired(true)),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const points = interaction.options.getInteger('points');

    try {
      let userRecord = await UserData.findOne({ where: { userId: targetUser.id } });

      if (!userRecord) {
        userRecord = await UserData.create({
          userId: targetUser.id,
          points: points,
        });
      } else {
        userRecord.points += points;
        await userRecord.save();
      }

      await interaction.reply(`${points} points have been added to ${targetUser.username}. They now have ${userRecord.points} points.`);
    } catch (error) {
      console.error('Error adding points:', error);
      await interaction.reply({ content: 'There was an error adding points.', ephemeral: true });
    }
  },
};
