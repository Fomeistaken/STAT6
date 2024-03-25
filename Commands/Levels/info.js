const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const Mee6LevelsApi = require("mee6-levels-api");
var timeout =[]

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription(`Get someone's MEE6 info`)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to get the info of")
    )
    .setDMPermission(false),
  async execute(interaction) { 
      if (timeout.includes(interaction.user.id)) return await interaction.reply({content: 'You are on command cooldown, try again later', ephemeral:true})   
    const user = interaction.user
    const unm = interaction.options.getUser("user") || user
    if(unm.bot){return interaction.reply(`Bot's can't be ranked!`)}
    const userId = unm.id
    const guildId = interaction.guild.id
    
    Mee6LevelsApi.getUserXp(guildId, userId).then(user => {
      if(!user){return interaction.reply(`User hasn't started sending messages yet.`)}
      
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

        const level = user.level

        // Thanks to https://github.com/PsKramer/mee6calc/blob/master/calc.js
        var desired_level = level +1
        var current_xp = user.xp.totalXp
        var xp_to_desired_level = 5 / 6 * desired_level * (2 * desired_level * desired_level + 27 * desired_level + 91);
        var xp_needed = xp_to_desired_level - current_xp;
        var avg_messages_needed_to_send = Math.ceil(xp_needed / (Number(user.xp.totalXp)/Number(user.messageCount)).toFixed(2));
        

        const embed = new EmbedBuilder()
        .setTitle(`MEE6 information for ${user.tag}`)
        .setDescription(`${user.tag} is currently rank ${user.rank}`)
        .addFields(
          { name: 'Level', value: `${level}`, inline:true },
          { name: 'MEE6 messages', value: `${user.messageCount}`, inline:true },
          { name: 'Current XP', value: `${user.xp.totalXp}`, inline:true },
          { name: 'Average XP per Minute', value: `${(Number(user.xp.totalXp)/Number(user.messageCount)).toFixed(2)}`, inline:true },
          { name: `XP to level ${Number(level)+1}`, value: `${xp_needed.toFixed(2)}`, inline:true },
          { name: `Percent leveled up`, value: `${((user.xp.userXp / user.xp.levelXp)*100).toFixed(2)}%`, inline:true },
          
        ).setFooter({text: `On average ${avg_messages_needed_to_send} messages / ${getTimeForXP(xp_needed)} of chatting is required to get to level ${level+1} `})

        interaction.reply({embeds: [embed]})
    });
     timeout.push(interaction.user.id)
      setTimeout(() =>{
        timeout.shift()
      }, 5000)

  },
};
