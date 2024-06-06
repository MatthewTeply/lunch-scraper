import { Client, CommandInteraction, SlashCommandBuilder, TextChannel, Utils } from 'discord.js';
import { scraperDiego } from '../scrapers/diego';
import { MealType, Restaurant } from '../scrapers/types/output';
import { scraperDvorek } from '../scrapers/dvorek';
import { scraperPeters } from '../scrapers/peters';
import { scraperPivo } from '../scrapers/pivo';

export const data = new SlashCommandBuilder()
    .setName('lunch')
    .setDescription('Shows today\'s lunch');

export const execute = async (interaction: CommandInteraction, client: Client) => {
    await interaction.deferReply();

    const restaurantChunks = []
    const scrapers = [
        await scraperPeters(),
        await scraperDiego(),
        await scraperDvorek(),
        await scraperPivo(),
    ];

    const channelId = interaction.channelId;

    let restaurantChunkIndex = 0;
    let scraperIndex = 0;
        
    while (restaurantChunkIndex < scrapers.length - 1) {
        restaurantChunks[restaurantChunkIndex] = [scrapers[scraperIndex]];

        if (scrapers[scraperIndex + 1] !== undefined) {
            restaurantChunks[restaurantChunkIndex].push(scrapers[scraperIndex + 1])

            scraperIndex += 2;
        } else {
            scraperIndex += 1;
        }

        restaurantChunkIndex++;
    }

    let displayIndex = 0;

    for (const restaurantChunk of restaurantChunks) {
        const result = restaurantChunk.length !== 0 
            ? await displayTextItems(restaurantChunk, displayIndex) 
            : 'No lunch items found!';
    
        if (result !== '') {
            await (client.channels.cache.get(channelId) as TextChannel).send(result)
        }

        displayIndex++;
    }

    await interaction.editReply('Enjoy!');
}

const displayTextItems = async (restaurants: (Restaurant | null)[], displayIndex = 0): Promise<string> => {
    let outputText = '';

    if (displayIndex === 0) {
        outputText += `# Jídla pro ${(new Date().toLocaleDateString('en-GB'))}`;
    }

    restaurants.map(restaurant => {
        if (restaurant === null || restaurant === undefined) {
            return;
        }

        outputText += `\n# ${restaurant.name}`;

        restaurant.items.map(item => {
            outputText += '\n- ';

            if (item.mealType === MealType.SOUP) {
                outputText += '**🍲 Polévka:** ';
            }

            if (item.mealType === MealType.DESSERT) {
                outputText += '**🧁 Dezert:** ';
            }

            outputText += `${item.name}`;

            if (item.price !== null) {
                outputText += ` - **${item.price.replace(/\D/g,'')} Kč**`
            }
        });
    });

    return outputText;
}