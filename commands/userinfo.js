const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Gets information about a user')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to get information about')
        .setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    const roles = member.roles.cache.map(role => role.name).join(', ');

    await interaction.reply(`
      **Username**: ${user.username}
      **ID**: ${user.id}
      **Join Date**: ${member.joinedAt}
      **Roles**: ${roles}
      **Is Bot**: ${user.bot ? 'Yes' : 'No'}
    `);
  },
};
