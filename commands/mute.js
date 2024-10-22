const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Mute } = require('../models/database');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mutes a user for a specified duration')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to mute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('The duration of the mute (e.g., "10m", "1h")')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for the mute')
        .setRequired(false)),

  async execute(interaction) {
    const member = interaction.options.getMember('target');
    const duration = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const muteDurationMs = ms(duration);

    const botMember = await interaction.guild.members.fetchMe();
    if (!botMember.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return interaction.reply({ content: 'I do not have permission to mute members.', ephemeral: true });
    }

    if (!member.manageable) {
      return interaction.reply({ content: 'I cannot mute this member.', ephemeral: true });
    }

    const existingMute = await Mute.findOne({ where: { userId: member.id } });
    if (existingMute) {
      return interaction.reply({ content: 'This user is already muted.', ephemeral: true });
    }

    const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
    if (!muteRole) {
      return interaction.reply({ content: 'Muted role does not exist. Please create one.', ephemeral: true });
    }

    await member.roles.add(muteRole);

    const muteEndTime = new Date(Date.now() + muteDurationMs);
    await Mute.create({ userId: member.id, muteEndTime, reason });
    await interaction.reply(`${member.displayName} has been muted for ${duration}. Reason: ${reason}`);

    setTimeout(async () => {
      const mutedMember = await interaction.guild.members.fetch(member.id);
      await mutedMember.roles.remove(muteRole);

      await Mute.destroy({ where: { userId: member.id } });

      const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'mod-logs');
      if (logChannel) {
        logChannel.send(`${mutedMember.displayName} has been unmuted after serving a ${duration} mute.`);
      }
    }, muteDurationMs);
  },
};
