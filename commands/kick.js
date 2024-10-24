const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a user from the server')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to kick')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('The reason for the kick')
        .setRequired(false)),
  
  async execute(interaction) {
    const member = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const botMember = await interaction.guild.members.fetchMe();

    if (!botMember.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: 'I do not have permission to kick members.', ephemeral: true });
    }

    if (!member.kickable) {
      return interaction.reply({ content: 'I cannot kick this member.', ephemeral: true });
    }

    await member.kick(reason);
    await interaction.reply(`${member.displayName} was kicked. Reason: ${reason}`);

    const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'mod-logs');
    if (logChannel) {
      logChannel.send(`${interaction.user.username} kicked ${member.displayName}. Reason: ${reason}`);
    }
  },
};
