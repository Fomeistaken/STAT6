const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const Mee6LevelsApi = require("mee6-levels-api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("compare")
    .setDescription(`Compare MEE6 stats between 2 users`)
    .addUserOption((option) =>
    option.setName('user1')
    .setDescription('First user you want to compare')
    .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("user2")
        .setDescription("Second user you want to compare (defaults to you)")
    )
    .setDMPermission(false),
  async execute(interaction) {  
    const {options} = interaction  
    let sampleoutput = {"id":"849526087171571764","level":1,"username":"Fome","discriminator":"6462","avatarUrl":"https://cdn.discordapp.com/avatars/849526087171571764/cabfafc122b713031dcfaca35f1f8cf3","messageCount":8,"tag":"Fome#6462","xp":{"userXp":61,"levelXp":155,"totalXp":161},"rank":1}

    const users1 = options.getUser('user1')
    const users2 = options.getUser('user2') || interaction.user
    const guildId = interaction.guild.id

    
    Promise.all([
        Mee6LevelsApi.getUserXp(guildId, users1.id),
        Mee6LevelsApi.getUserXp(guildId, users2.id)
      ]).then(([user1, user2]) => {
        if (!user1 || user1.bot) {
          return interaction.reply(`User 1 hasn't started sending messages yet.`);
        }
        if (!user2 || user2.bot) {
            return interaction.reply(`User 2 hasn't started sending messages yet.`);
          }

        const embed = new EmbedBuilder()
        .setTitle(`MEE6 stats comparison between ${user1.tag} and ${user2.tag}`)
        .addFields(
            {name: `Level Comparison`, value:`${user1.username} Level: ${user1.level} | ${user2.username} Level: ${user2.level} \n\n${user1.level >= user2.level ? user1.username : user2.username} has ${Math.abs(user1.level - user2.level)} more levels than ${user1.level >= user2.level ? user2.username : user1.username}.`, inline:true},
            {name: `Xp Comparison`, value:`${user1.username} Has: ${user1.xp.totalXp}xp | ${user2.username} Has: ${user2.xp.totalXp}xp \n\n${user1.xp.totalXp >= user2.xp.totalXp ? user1.username : user2.username} has ${Math.abs(user1.xp.totalXp - user2.xp.totalXp)} more levels than ${user1.xp.totalXp >= user2.xp.totalXp ? user2.xp.totalXp : user1.xp.totalXp}.`, inline:true},
            {name: `MEE6 Message Comparison`, value:`${user1.username} Has: ${user1.messageCount} messages | ${user2.username} Has: ${user2.messageCount} messages \n\n${user1.messageCount >= user2.messageCount ? user1.username : user2.username} has ${Math.abs(user1.messageCount - user2.messageCount)} more levels than ${user1.messageCount >= user2.messageCount ? user2.username : user1.username}.`, inline:true},
        )

        interaction.reply({embeds: [embed]})

      });

  },
};
