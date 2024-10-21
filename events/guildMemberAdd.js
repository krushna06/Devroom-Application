const { WelcomeMessage } = require('../models/database');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    try {
      const welcomeMessageRecord = await WelcomeMessage.findOne();
      
      const welcomeMessage = welcomeMessageRecord ? welcomeMessageRecord.message : 'Welcome to the server!';
      const personalizedMessage = welcomeMessage.replace('{username}', member.user.username);

      const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'welcome');

      if (welcomeChannel) {
        welcomeChannel.send(personalizedMessage);
      }
    } catch (error) {
      console.error('Error fetching welcome message:', error);
    }
  },
};