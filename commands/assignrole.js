const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('assignrole')
    .setDescription('Assigns a role to a user')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to assign the role to')
        .setRequired(true))
    .addRoleOption(option => 
      option.setName('role')
        .setDescription('The role to assign')
        .setRequired(true)),
  async execute(interaction) {
    const targetUser = interaction.options.getMember('target');
    const role = interaction.options.getRole('role');

    if (!interaction.guild.members.me.permissions.has('MANAGE_ROLES')) {
      return interaction.reply({ content: 'I do not have permission to manage roles.', ephemeral: true });
    }

    if (interaction.guild.members.me.roles.highest.comparePositionTo(role) <= 0) {
      return interaction.reply({ content: 'I cannot assign a role that is equal to or higher than my highest role.', ephemeral: true });
    }

    if (targetUser.roles.cache.has(role.id)) {
      return interaction.reply({ content: `${targetUser.displayName} already has the ${role.name} role.`, ephemeral: true });
    }

    try {
      await targetUser.roles.add(role);
      await interaction.reply({ content: `${role.name} role has been assigned to ${targetUser.displayName}.` });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: `Failed to assign the role.`, ephemeral: true });
    }
  },
};
