import { Client } from 'discord.js';
import { deployCommands } from './deployCommands';
import { commands } from './commands';
import { config } from './config';
import { scraperPivo } from './scrapers/pivo';

const client = new Client({
    intents: ['Guilds', 'GuildMessages', 'DirectMessages'],
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user!.tag}!`);
});

client.on('guildCreate', async (guild) => {
    await deployCommands({ guildId: guild.id });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    
    const { commandName } = interaction;

    if (commands[commandName as keyof typeof commands]) {
        commands[commandName as keyof typeof commands].execute(interaction, client);
    }
});

client.login(config.DISCORD_TOKEN);