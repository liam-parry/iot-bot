const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { clientId, guildId} = require("./config.json");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const dotenv = require("dotenv");
dotenv.config();
const token = process.env.token
client.commands= new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}


const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}


const { getDatabase, ref, onValue } = require ("firebase/database");
client.once("ready", () => {
  console.log("Ready!");
  

  const db = getDatabase();
  onValue(ref(db, "intrusion"), (snapshot) => {

    if(snapshot.val()==1) {client.channels.cache
      .get("944108911613579284")
      .send(`Phát hiện xâm nhập trái phép lúc ${new Date()}!!!!`);}
    
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});







// const commands = [];
// const commandFile = fs
//   .readdirSync("./commands")
//   .filter((file) => file.endsWith(".js"));

// // Place your client and guild ids here

// for (const file of commandFile) {
//   const command = require(`./commands/${file}`);
//   commands.push(command.data.toJSON());
// }

// const rest = new REST({ version: "9" }).setToken(token);

// (async () => {
//   try {
//     console.log("Started refreshing application (/) commands.");

//     await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
//       body: commands,
//     });

//     console.log("Successfully reloaded application (/) commands.");
//   } catch (error) {
//     console.error(error);
//   }
// })();






client.login(token);
