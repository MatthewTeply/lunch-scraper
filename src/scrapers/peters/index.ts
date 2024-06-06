import { createWorker } from 'tesseract.js';
import { createPage } from '../createPage'
import { MealType, MenuItem, Restaurant } from '../types/output';

const PAGE_URL = 'https://www.facebook.com/petersburgerpub/';

const START_AT = 'VYMĚNÍME ZA SALÁTEK';

export const scraperPeters = async (): Promise<Restaurant | null> => {
    const page = await createPage(PAGE_URL);

    const menuImgEl = await page.$('img[height="794"]:nth-child(1)');

    if (menuImgEl !== null) {
        const menuItems: MenuItem[] = [];
        const menuImgSrc = await menuImgEl.evaluate(node => node.src);

        const worker = await createWorker('ces');

        const { data: { text } } = await worker.recognize(menuImgSrc);

        const lines = text.split(START_AT)[1].split('\n');

        let menuItemIndex = 0;

        for (let line of lines) {
            if (line === '') {
                continue;
            }

            if (menuItems[menuItemIndex] === undefined) {
                menuItems[menuItemIndex] = {
                    name: '',
                    price: null,
                    mealType: MealType.MEAL,
                }
            }

            if (!line.includes(',-')) {
                if (menuItems[menuItemIndex].name.length > 0) {
                    line = ` ${line}`;
                }

                menuItems[menuItemIndex].name += line;

                // Soup comes first and doesn't have a price
                if (menuItemIndex === 0) {
                    menuItems[menuItemIndex].mealType = MealType.SOUP;
                    menuItemIndex++;
                }
            } else {
                menuItems[menuItemIndex].price = line;
                menuItemIndex++;
            }
        }

        worker.terminate();

        return {
            name: '🍽️ Peter\'s',
            items: menuItems,
            url: PAGE_URL,
        }
    }

    return null;
}