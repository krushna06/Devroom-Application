const fs = require('fs');
const { sequelize, Mute } = require('./models/database');
const path = require('path');
const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const { logToFile } = require('./utils/logger');
require('dotenv').config();

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

let chalk;
(async () => {
  chalk = await import('chalk');
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.commands = new Collection();
  const commands = [];
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  }

  const loadEvents = (client) => {
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
      const event = require(`./events/${file}`);
      client.on(event.name, (...args) => event.execute(...args));
    }
  };

  client.once('ready', async () => {
    logToFile(`Logged in as ${client.user.tag}!`, 'database');

    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

    try {
      logToFile(`Started refreshing ${commands.length} slash commands.`, 'command');

      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
      );

      logToFile(`Successfully reloaded ${commands.length} application slash commands.`, 'command');
    } catch (error) {
      logToFile(`Error deploying commands: ${error}`, 'error');
    }

    loadEvents(client);

    const guild = client.guilds.cache.get(GUILD_ID);
    const muteRole = guild.roles.cache.find(role => role.name === 'Muted');

    if (muteRole) {
      const activeMutes = await Mute.findAll();
      const currentTime = new Date();

      activeMutes.forEach(async mute => {
        const member = await guild.members.fetch(mute.userId);

        if (mute.muteEndTime <= currentTime) {
          await member.roles.remove(muteRole);
          await Mute.destroy({ where: { userId: mute.userId } });

          const logChannel = guild.channels.cache.find(channel => channel.name === 'mod-logs');
          if (logChannel) {
            logChannel.send(`${member.displayName} has been automatically unmuted.`);
          }
          logToFile(`Unmuted ${member.displayName} (ID: ${mute.userId}) after mute expired.`, 'command');
        } else {
          const remainingTime = mute.muteEndTime.getTime() - currentTime.getTime();
          setTimeout(async () => {
            await member.roles.remove(muteRole);
            await Mute.destroy({ where: { userId: mute.userId } });

            const logChannel = guild.channels.cache.find(channel => channel.name === 'mod-logs');
            if (logChannel) {
              logChannel.send(`${member.displayName} has been automatically unmuted.`);
            }
            logToFile(`Unmuted ${member.displayName} (ID: ${mute.userId}) after scheduled time.`, 'command');
          }, remainingTime);
        }
      });
    }
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      logToFile(`Executing command: ${interaction.commandName} by ${interaction.user.tag}`, 'command');
      await command.execute(interaction);
      logToFile(`Command executed successfully: ${interaction.commandName} by ${interaction.user.tag}`, 'command');
    } catch (error) {
      logToFile(`Error executing command: ${interaction.commandName} by ${interaction.user.tag}. Error: ${error}`, 'error');
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  });

  client.login(DISCORD_TOKEN);
})();
