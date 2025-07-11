import { Client, GatewayIntentBits, Routes, REST, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder, TextChannel, PollAnswerData } from 'discord.js';
import dotenv from 'dotenv';

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

const hangouts = new Map();

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'hangout') {
      const title = interaction.options.getString('title', true);
      const days = interaction.options.getString('days', true).split(',');
      const timeRange = interaction.options.getString('times', true); // e.g., 6pm-11pm
      const duration = interaction.options.getInteger('duration', true);

      const [startHour, endHour] = timeRange.split('-').map((t) => parseInt(t));
      const timeOptions: PollAnswerData[] = [];

      for (const day of days) {
        // Two hour intervals for time options
        for (let hour = startHour; hour <= endHour; hour += 2) {
            timeOptions.push({text:`${day.trim()} @ ${hour}:00`});
          }
      }

      timeOptions.push({text: "Other"});

      if (interaction.channel?.isSendable()) {
        const res = interaction.channel.send({
          poll: {
            question: {text: title},
            answers: timeOptions,
            duration: duration,
            allowMultiselect: true,
            layoutType: 1
          }          
        })
      }


      hangouts.set(title, []);
    }
  } 
});

// Reminder pings (every X hours)
setInterval(() => {
  console.log("set Interval is doing something")
  console.log(hangouts);

  // Needs to ping out certain users
    // Eg: @everyone Pksnail is a poopoo bum who hasn't voted yet
    // @everyone big schno is a poopoo bum who hasn't voted yet (how to grab that?)


  // users that have voted
  // for (const [pollId, hangout] of Object.entries(hangouts)) {
  //   const pendingUsers = Object.keys(hangout.responses).length < 7; // customize if needed
  //   if (pendingUsers) {
  //     // as Textchannel = typecasting
  //     // : = declaring a type
  //     const channel = client.channels.cache.find((ch) =>
  //       (ch.isTextBased() && typeof hangout.messageId === 'string')
  //     ) as TextChannel;
  //     if (channel?.isTextBased()) {
  //       channel.send(`🔔 @everyone Reminder to respond to **${hangout.title}** availability!`);
  //     }
  //   }
  // }
}, 1000 * 20 * 1); // every 20 seocnds

// Register slash command
const commands = [
  new SlashCommandBuilder()
    .setName('hangout')
    .setDescription('Create a group hangout availability poll')
    .addStringOption((option) =>
      option.setName('title').setDescription('Title of the hangout').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('days').setDescription('Comma-separated days (e.g., Friday,Saturday)').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('times').setDescription('Time range (e.g., 18-23 for 6pm-11pm)').setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('duration').setDescription('how long do you want the poll to run for').setRequired(true)
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
