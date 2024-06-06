import { createPage } from '../createPage';
import { MealType, MenuItem, Restaurant } from '../types/output';

const PAGE_URL = 'https://www.pivokarlin.cz/';

export const scraperPivo = async (): Promise<Restaurant | null> => {
    const page = await createPage(PAGE_URL);

    const today = (new Date()).getDay();

    let todayGroupIndex = Math.ceil(today / 2);
    let todayDayIndex = today % 2 === 0 ? 2 : 1;

    const menuSelector = `#tab-poledni-nabidka .wpb_row:nth-child(${todayGroupIndex}) .wpb_column:nth-child(${todayDayIndex})`;

    const menuEl = await page.$(menuSelector);

    if (menuEl !== null) {
        const menuItemEls = await menuEl.$$('.nectar_food_menu_item');

        const menuItems: MenuItem[] = []

        for (const menuItemEl of menuItemEls) {
            const nameEl = await menuItemEl.$('.item_name');
            const priceEl = await menuItemEl.$('.item_price');

            if (nameEl !== null && priceEl !== null) {
                const name = await nameEl.evaluate(node => node.textContent) ?? '';
                const price = await priceEl.evaluate(node => node.textContent);

                let mealType = MealType.MEAL;

                menuItems.push({
                    name,
                    price,
                    mealType
                })
            }
        }

        menuItems[0].mealType = MealType.SOUP;
        menuItems[menuItems.length - 1].mealType = MealType.DESSERT;

        return {
            name: '🍺 Pivo',
            items: menuItems,
            url: PAGE_URL,
        }
    }

    return null;
}