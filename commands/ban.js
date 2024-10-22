const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user from the server')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('The reason for the ban')
        .setRequired(false)),

  async execute(interaction) {
    const member = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const botMember = await interaction.guild.members.fetchMe();

    if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: 'I do not have permission to ban members.', ephemeral: true });
    }

    if (!member.bannable) {
      return interaction.reply({ content: 'I cannot ban this member.', ephemeral: true });
    }

    await member.ban({ reason });
    await interaction.reply(`${member.displayName} was banned. Reason: ${reason}`);

    const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'mod-logs');
    if (logChannel) {
      logChannel.send(`${interaction.user.username} banned ${member.displayName}. Reason: ${reason}`);
    }
  },
};
