const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const Mee6LevelsApi = require("mee6-levels-api");
var timeout =[]

module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription(`Level you want to see info relative to (max 150)`)
    .addIntegerOption((option) =>
    option.setName('level')
    .setDescription('The level you want the info of')
    .setMinValue(1)
    .setMaxValue(150)
    .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to get the info of")
    )
    .setDMPermission(false),
  async execute(interaction) {  
    if (timeout.includes(interaction.user.id)) return await interaction.reply({content: 'You are on command cooldown, try again later', ephemeral:true})
    const {options} = interaction  
    let sampleoutput = {"id":"849526087171571764","level":1,"username":"Fome","discriminator":"6462","avatarUrl":"https://cdn.discordapp.com/avatars/849526087171571764/cabfafc122b713031dcfaca35f1f8cf3","messageCount":8,"tag":"Fome#6462","xp":{"userXp":61,"levelXp":155,"totalXp":161},"rank":1}

    const user = interaction.user
    const unm = interaction.options.getUser("user") || user
    if(unm.bot){return interaction.reply(`Bot's can't be ranked!`)}
    const userId = unm.id
    const guildId = interaction.guild.id
    const level = options.getInteger('level')

    
    Mee6LevelsApi.getUserXp(guildId, userId).then(user => {
      if(!user){return interaction.reply(`User hasn't started sending messages yet.`)}
      if(level<= user.level) return interaction.reply(`${user.tag} has already reached that level`)

      function getTimeForXP(xp) {
        const averageXP = (Number(user.xp.totalXp)/Number(user.messageCount)).toFixed(2);
        const timeInMinutes = xp / averageXP;
        const ms = timeInMinutes * 60 * 1000;
        let seconds = ms /1000
        const hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
        seconds = seconds % 3600; // seconds remaining after extracting hours
        // 3- Extract minutes:
        const minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
        // 4- Keep only seconds not extracted to minutes:
        seconds = seconds % 60;
        return `${hours} Hours ${minutes} Minutes`
      }

      function timexp(xp){
        const averageXP = (Number(user.xp.totalXp)/Number(user.messageCount)).toFixed(2);
        const timeInMinutes = xp / averageXP;
        const ms = timeInMinutes * 60 * 1000;
        return ms

      }

      



      var desired_level = level
      var current_xp = user.xp.totalXp
      var xp_to_desired_level = 5 / 6 * desired_level * (2 * desired_level * desired_level + 27 * desired_level + 91);
      var xp_needed = xp_to_desired_level - current_xp;
      var avg_messages_needed_to_send = Math.ceil(xp_needed / (Number(user.xp.totalXp)/Number(user.messageCount)).toFixed(2));


        const embed = new EmbedBuilder()
        .setTitle(`MEE6 Level Information ${user.tag}`)
        .setDescription(`${user.tag} is currently level ${user.level}`)
        .addFields(
          
          {name: `Specified Level`, value: `${level}`, inline: true},
          {name: `Xp remaining to reach level ${level}`, value: `${(xp_to_desired_level-user.xp.totalXp).toFixed(0)}`, inline: true},
          {name: `Earliest possible time to reach level ${level}`, value: `<t:${Math.floor(Date.now()/1000)+Math.floor(timexp(xp_to_desired_level-user.xp.totalXp).toFixed(0)/1000)}:f>`, inline: true},
                  

        )
        .setFooter({text: `On average ${avg_messages_needed_to_send} messages / ${getTimeForXP(xp_needed)} of chatting are required to get to level ${level} `})

        interaction.reply({embeds: [embed]})


    });
    timeout.push(interaction.user.id)
    setTimeout(() =>{
      timeout.shift()
    }, 5000)

  },
};
