import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { scraperDiego } from '../scrapers/diego';
import { MealType, Restaurant } from '../scrapers/types/output';
import { scraperDvorek } from '../scrapers/dvorek';

export const data = new SlashCommandBuilder()
    .setName('lunch')
    .setDescription('Shows today\'s lunch');

export const execute = async (interaction: CommandInteraction) => {
    await interaction.deferReply();

    const restaurants: Restaurant[] = []
    const scrapers = [
        await scraperDiego(),
        await scraperDvorek(),
    ];

    scrapers.map(scraperOutput => {
        if (scraperOutput !== null) {
            restaurants.push(scraperOutput);
        }
    });


    const result = restaurants.length !== 0 
        ? await displayTextItems(restaurants) 
        : 'No lunch items found!';

    await interaction.editReply(result);
}

const displayTextItems = async (restaurants: Restaurant[]): Promise<string> => {
    let outputText = `# Jídla pro ${(new Date().toLocaleDateString('en-GB'))}`;

    restaurants.map(restaurant => {
        outputText += `\n## [${restaurant.name}](<${restaurant.url}>)`;

        restaurant.items.map(item => {
            outputText += `\n- ${item.mealType === MealType.SOUP ? '**Polévka:** ' : ''} ${item.name} - ${item.price.replace(/\D/g,'')} Kč`;
        });
    });

    return outputText;
}