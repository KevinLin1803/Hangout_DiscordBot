import { Client, GatewayIntentBits, Routes, REST, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder, TextChannel, PollAnswerData } from 'discord.js';
import dotenv from 'dotenv';
import {v4 as uuidv4} from 'uuid';
import { createEvent } from './backend/functions';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessagePolls],
});

const TOKEN = process.env.DISCORD_BOT_TOKEN!;
const CLIENT_ID = process.env.CLIENT_ID!;
const GUILD_ID = process.env.GUILD_ID!;
const WEBSITE = process.env.WEBSITE_LINK;

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'hangout') {
      const title = interaction.options.getString('title', true);
      const dates = interaction.options.getString('dates', true).split('-');
      const duration = interaction.options.getString('duration', true); // e.g., 6pm-11pm
      const ping_duration = interaction.options.getInteger('ping-duration', true);

      var eventId = uuidv4();

      if (interaction.channel?.isSendable()) {
        interaction.channel.send(`Add availabilities:${WEBSITE}/${eventId}`);
        createEvent(eventId, Number(duration), dates[0], dates[1]);        
      }
    }
  } 
});

// Reminder pings (every X hours)
// setInterval(() => {
//   console.log("set Interval is doing something")
//   console.log(hangouts);
//   // Needs to ping out certain users
//     // Eg: @everyone Pksnail is a poopoo bum who hasn't voted yet
//     // @everyone big schno is a poopoo bum who hasn't voted yet (how to grab that?)


//   // users that have voted
//   // for (const [pollId, hangout] of Object.entries(hangouts)) {
//   //   const pendingUsers = Object.keys(hangout.responses).length < 7; // customize if needed
//   //   if (pendingUsers) {
//   //     // as Textchannel = typecasting
//   //     // : = declaring a type
//   //     const channel = client.channels.cache.find((ch) =>
//   //       (ch.isTextBased() && typeof hangout.messageId === 'string')
//   //     ) as TextChannel;
//   //     if (channel?.isTextBased()) {
//   //       channel.send(`🔔 @everyone Reminder to respond to **${hangout.title}** availability!`);
//   //     }
//   //   }
//   // }
// }, 1000 * 20 * 1); // every 20 seocnds

// Register slash command
const commands = [
  new SlashCommandBuilder()
    .setName('hangout')
    .setDescription('Create a group hangout availability poll')
    .addStringOption((option) =>
      option.setName('title').setDescription('What we doing?').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('dates').setDescription('Which dates do you want to collect availabilities for? eg: 18/06-24/06').setRequired(true)
    ) // Add units here as well
    .addStringOption((option) =>
      option.setName('duration').setDescription('How many days you wanna run the poll for?').setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('ping-duration').setDescription('How often do you want the bot to send reminders? eg: every 1 or 2 hours').setRequired(true)
    )
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log('✅ Slash command registered.');
  } catch (error) {
    console.error(error);
  }
})();

client.login(TOKEN);
