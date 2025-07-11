import {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ButtonInteraction,
    REST,
    Routes,
    type ChatInputCommandInteraction,
  } from "discord.js"
  import dotenv from "dotenv"
  
  dotenv.config()
  
  // Types and Interfaces
  interface Vote {
    userId: string
    username: string
    timestamp: Date
    optionIndex: number
  }
  
  interface PollOption {
    text: string
    votes: Vote[]
  }
  
  interface HangoutPoll {
    id: string
    title: string
    options: PollOption[]
    createdBy: string
    createdAt: Date
    channelId: string
    messageId?: string
    guildId: string
    duration: number // in hours
    expiresAt: Date
    remindersSent: number
  }
  
  // Configuration
  const TOKEN = process.env.DISCORD_BOT_TOKEN!
  const CLIENT_ID = process.env.CLIENT_ID!
  const GUILD_ID = process.env.GUILD_ID!
  
  // Storage
  const hangouts = new Map<string, HangoutPoll>()
  
  // Create Discord client
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  })
  
  // Utility functions
  function generatePollId(): string {
    return Math.random().toString(36).substring(2, 15)
  }
  
  function createProgressBar(percentage: number, length = 10): string {
    const filled = Math.round((percentage / 100) * length)
    const empty = length - filled
    return "█".repeat(filled) + "░".repeat(empty)
  }
  
  function createHangoutEmbed(hangout: HangoutPoll): EmbedBuilder {
    const allVotes = hangout.options.flatMap((option) => option.votes)
    const totalVotes = allVotes.length
    const uniqueVoters = new Set(allVotes.map((vote) => vote.userId)).size
  
    const embed = new EmbedBuilder()
      .setTitle(`🎉 ${hangout.title}`)
      .setColor(0x5865f2)
      .setTimestamp(hangout.createdAt)
      .setFooter({
        text: `Poll ID: ${hangout.id} • ${totalVotes} votes • ${uniqueVoters} voters • Expires: ${hangout.expiresAt.toLocaleString()}`,
      })
  
    let description = "**When are you available?**\n\n"
  
    hangout.options.forEach((option, index) => {
      const voteCount = option.votes.length
      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
      const progressBar = createProgressBar(percentage)
  
      description += `**${index + 1}. ${option.text}**\n`
      description += `${progressBar} ${percentage}% (${voteCount} votes)\n\n`
    })
  
    // Show recent voters
    if (allVotes.length > 0) {
      const recentVotes = allVotes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5)
  
      description += "**Recent Votes:**\n"
      recentVotes.forEach((vote) => {
        const optionText = hangout.options[vote.optionIndex]?.text || "Unknown"
        description += `• ${vote.username} → ${optionText}\n`
      })
    }
  
    embed.setDescription(description)
  
    return embed
  }
  
  function createHangoutButtons(hangout: HangoutPoll): ActionRowBuilder<ButtonBuilder>[] {
    const rows: ActionRowBuilder<ButtonBuilder>[] = []
    let currentRow = new ActionRowBuilder<ButtonBuilder>()
  
    hangout.options.forEach((option, index) => {
      if (currentRow.components.length >= 5) {
        rows.push(currentRow)
        currentRow = new ActionRowBuilder<ButtonBuilder>()
      }
  
      const button = new ButtonBuilder()
        .setCustomId(`hangout_vote_${hangout.id}_${index}`)
        .setLabel(`${option.text}`)
        .setStyle(ButtonStyle.Primary)
  
      currentRow.addComponents(button)
    })
  
    if (currentRow.components.length > 0) {
      rows.push(currentRow)
    }
  
    // Add utility buttons
    const utilityRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`hangout_results_${hangout.id}`)
        .setLabel("📊 View Results")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`hangout_voters_${hangout.id}`)
        .setLabel("👥 View Voters")
        .setStyle(ButtonStyle.Secondary),
    )
  
    rows.push(utilityRow)
  
    return rows
  }
  
  function generateTimeOptions(days: string[], timeRange: string): string[] {
    const [startHour, endHour] = timeRange.split("-").map((t) => Number.parseInt(t))
    const timeOptions: string[] = []
  
    for (const day of days) {
      // Two hour intervals for time options
      for (let hour = startHour; hour <= endHour; hour += 2) {
        const timeString = hour >= 12 ? `${hour === 12 ? 12 : hour - 12}pm` : `${hour}am`
        timeOptions.push(`${day.trim()} @ ${timeString}`)
      }
    }
  
    timeOptions.push("Other")
    return timeOptions
  }
  
  async function getGuildMembers(guildId: string): Promise<Set<string>> {
    try {
      const guild = client.guilds.cache.get(guildId)
      if (!guild) return new Set()
  
      await guild.members.fetch()
      return new Set(guild.members.cache.filter((member) => !member.user.bot).map((member) => member.id))
    } catch (error) {
      console.error("Error fetching guild members:", error)
      return new Set()
    }
  }
  
  async function sendReminders(): Promise<void> {
    const now = new Date()
  
    for (const [pollId, hangout] of hangouts) {
      // Skip if poll has expired
      if (now > hangout.expiresAt) {
        hangouts.delete(pollId)
        continue
      }
  
      // Calculate time remaining
      const timeRemaining = hangout.expiresAt.getTime() - now.getTime()
      const hoursRemaining = timeRemaining / (1000 * 60 * 60)
  
      // Send reminders at 50% and 25% of duration remaining
      const shouldSendReminder =
        (hoursRemaining <= hangout.duration * 0.5 && hangout.remindersSent === 0) ||
        (hoursRemaining <= hangout.duration * 0.25 && hangout.remindersSent === 1)
  
      if (shouldSendReminder) {
        try {
          const channel = client.channels.cache.get(hangout.channelId)
  
          // Type guard to ensure channel exists and is sendable
          if (!channel || !channel.isTextBased() || channel.isDMBased()) {
            console.log(`Channel ${hangout.channelId} not found or not sendable`)
            continue
          }
  
          // Get all guild members
          const allMembers = await getGuildMembers(hangout.guildId)
          const voters = new Set(hangout.options.flatMap((option) => option.votes.map((vote) => vote.userId)))
          const nonVoters = Array.from(allMembers).filter((memberId) => !voters.has(memberId))
  
          if (nonVoters.length > 0) {
            const mentions = nonVoters.map((id) => `<@${id}>`).join(" ")
            const hoursLeft = Math.ceil(hoursRemaining)
  
            await channel.send({
              content: `⏰ **Reminder: "${hangout.title}" poll expires in ${hoursLeft} hours!**\n\n${mentions}\n\nPlease vote for your availability! 👆`,
              allowedMentions: { users: nonVoters },
            })
  
            hangout.remindersSent++
            console.log(`Sent reminder for hangout: ${hangout.title} (${nonVoters.length} non-voters)`)
          }
        } catch (error) {
          console.error(`Error sending reminder for hangout ${hangout.title}:`, error)
        }
      }
    }
  }
  
  // Event handlers
  client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user?.tag}`)
  })
  
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction)
    } else if (interaction.isButton()) {
      await handleButtonInteraction(interaction)
    }
  })
  
  async function handleSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      if (interaction.commandName === "hangout") {
        const title = interaction.options.getString("title", true)
        const days = interaction.options.getString("days", true).split(",")
        const timeRange = interaction.options.getString("times", true)
        const duration = interaction.options.getInteger("duration", true)
  
        const timeOptions = generateTimeOptions(days, timeRange)
  
        if (timeOptions.length > 25) {
          await interaction.reply({
            content: "❌ Too many time options generated. Please reduce the time range or number of days.",
            ephemeral: true,
          })
          return
        }
  
        const pollId = generatePollId()
        const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000) // duration in hours
  
        const hangout: HangoutPoll = {
          id: pollId,
          title,
          options: timeOptions.map((text) => ({ text, votes: [] })),
          createdBy: interaction.user.id,
          createdAt: new Date(),
          channelId: interaction.channelId,
          guildId: interaction.guildId || GUILD_ID,
          duration,
          expiresAt,
          remindersSent: 0,
        }
  
        hangouts.set(pollId, hangout)
  
        const embed = createHangoutEmbed(hangout)
        const buttons = createHangoutButtons(hangout)
  
        const response = await interaction.reply({
          embeds: [embed],
          components: buttons,
          fetchReply: true,
        })
  
        hangout.messageId = response.id
  
        console.log(`Created hangout poll: ${title} (ID: ${pollId})`)
      }
    } catch (error) {
      console.error("Error handling slash command:", error)
      await interaction.reply({
        content: "❌ An error occurred while creating the hangout poll.",
        ephemeral: true,
      })
    }
  }
  
  async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
    try {
      const [type, action, pollId, optionIndex] = interaction.customId.split("_")
  
      if (type !== "hangout") return
  
      const hangout = hangouts.get(pollId)
  
      if (!hangout) {
        await interaction.reply({
          content: "❌ This hangout poll no longer exists.",
          ephemeral: true,
        })
        return
      }
  
      // Check if poll has expired
      if (new Date() > hangout.expiresAt) {
        await interaction.reply({
          content: "❌ This hangout poll has expired.",
          ephemeral: true,
        })
        return
      }
  
      if (action === "vote") {
        const optionIdx = Number.parseInt(optionIndex)
        const option = hangout.options[optionIdx]
  
        if (!option) {
          await interaction.reply({
            content: "❌ Invalid option selected.",
            ephemeral: true,
          })
          return
        }
  
        // Check if user already voted for this option
        const existingVoteIndex = option.votes.findIndex((vote) => vote.userId === interaction.user.id)
  
        if (existingVoteIndex !== -1) {
          // Remove existing vote
          option.votes.splice(existingVoteIndex, 1)
          await interaction.reply({
            content: `✅ Removed your vote for "${option.text}"`,
            ephemeral: true,
          })
        } else {
          // Add new vote (allow multiple selections for hangouts)
          const vote: Vote = {
            userId: interaction.user.id,
            username: interaction.user.displayName || interaction.user.username,
            timestamp: new Date(),
            optionIndex: optionIdx,
          }
  
          option.votes.push(vote)
  
          await interaction.reply({
            content: `✅ Voted for "${option.text}"`,
            ephemeral: true,
          })
        }
  
        // Update the hangout message
        const embed = createHangoutEmbed(hangout)
        const buttons = createHangoutButtons(hangout)
  
        await interaction.editReply({
          embeds: [embed],
          components: buttons,
        })
      } else if (action === "results") {
        const allVotes = hangout.options.flatMap((option) => option.votes)
        const totalVotes = allVotes.length
        const uniqueVoters = new Set(allVotes.map((vote) => vote.userId)).size
  
        let resultsText = `**${hangout.title}**\n\n`
        hangout.options.forEach((option, index) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0
          resultsText += `${index + 1}. **${option.text}**: ${option.votes.length} votes (${percentage}%)\n`
        })
  
        resultsText += `\n📊 Total: ${totalVotes} votes from ${uniqueVoters} users`
        resultsText += `\n⏰ Expires: ${hangout.expiresAt.toLocaleString()}`
  
        await interaction.reply({
          content: resultsText,
          ephemeral: true,
        })
      } else if (action === "voters") {
        let votersText = `**Voters for: ${hangout.title}**\n\n`
  
        hangout.options.forEach((option, index) => {
          if (option.votes.length > 0) {
            votersText += `**${index + 1}. ${option.text}** (${option.votes.length} votes):\n`
            option.votes.forEach((vote) => {
              votersText += `• ${vote.username} - ${vote.timestamp.toLocaleString()}\n`
            })
            votersText += "\n"
          }
        })
  
        if (votersText.length > 2000) {
          votersText = votersText.substring(0, 1900) + "\n... (truncated)"
        }
  
        await interaction.reply({
          content: votersText || "No votes yet!",
          ephemeral: true,
        })
      }
    } catch (error) {
      console.error("Error handling button interaction:", error)
      await interaction.reply({
        content: "❌ An error occurred while processing your interaction.",
        ephemeral: true,
      })
    }
  }
  
  // Reminder system - check every 30 minutes
  setInterval(
    () => {
      console.log(`🔄 Checking for reminder notifications... (${hangouts.size} active hangouts)`)
      sendReminders()
    },
    1000 * 60 * 30,
  ) // every 30 minutes
  
  // Register slash commands
  const commands = [
    new SlashCommandBuilder()
      .setName("hangout")
      .setDescription("Create a group hangout availability poll")
      .addStringOption((option) => option.setName("title").setDescription("Title of the hangout").setRequired(true))
      .addStringOption((option) =>
        option.setName("days").setDescription("Comma-separated days (e.g., Friday,Saturday)").setRequired(true),
      )
      .addStringOption((option) =>
        option.setName("times").setDescription("Time range (e.g., 18-23 for 6pm-11pm)").setRequired(true),
      )
      .addIntegerOption((option) =>
        option.setName("duration").setDescription("How long the poll should run (in hours)").setRequired(true),
      ),
  ].map((command) => command.toJSON())
  
  const rest = new REST({ version: "10" }).setToken(TOKEN)
  
  async function registerCommands(): Promise<void> {
    try {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: commands,
      })
      console.log("✅ Slash command registered.")
    } catch (error) {
      console.error("❌ Error registering commands:", error)
    }
  }
  
  // Start the bot
  async function startBot(): Promise<void> {
    try {
      await registerCommands()
      await client.login(TOKEN)
    } catch (error) {
      console.error("❌ Error starting bot:", error)
      process.exit(1)
    }
  }
  
  startBot()
  