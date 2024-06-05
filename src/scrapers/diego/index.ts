import { createPage } from '../createPage';
import { MealType, MenuItem, Restaurant } from '../types/output';

export const PAGE_URL = 'https://www.menicka.cz/mobilni/7191-diego-pivni-bar.html'

export const scraperDiego = async (): Promise<Restaurant | null> => {
    const page = await createPage(PAGE_URL);

    const menuItems: MenuItem[] = [];

    const todaysItems = await page.$('.obsah .menicka:nth-child(1)')

    if (todaysItems !== null) {
        const orderEls = await todaysItems.$$('.poradi_1');
        const nameEls = await todaysItems.$$('.nabidka_1');
        const priceEls = await todaysItems.$$('.cena');

        let index = 0;

        for (const nameEl of nameEls) {
            const name = await nameEl.evaluate(node => node.textContent) ?? '';
            const price = await priceEls[index].evaluate(node => node.textContent) ?? '';
            const order = await orderEls[index].evaluate(node =>node.textContent) ?? '';

            let mealType = MealType.MEAL;

            if (order.length === 0) {
                mealType = MealType.SOUP;
            }
            
            menuItems.push({
                name,
                price,
                mealType
            })

            index++
        }

        return {
            name: '🌯 Diego',
            items: menuItems,
            url: PAGE_URL,
        };
    }

    return null;
}