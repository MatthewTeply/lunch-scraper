import { ElementHandle } from 'puppeteer';
import { createPage } from '../createPage'
import { MealType, MenuItem, Restaurant } from '../types/output';

export const PAGE_URL = 'https://www.dvorekkarlin.com/denni-nabidka/';

const STOP_AT = 'TÝDENNÍ SPECIÁL';

export const scraperDvorek = async (): Promise<Restaurant | null> => {
    const page = await createPage(PAGE_URL);

    const menu = await page.$('div > div > div > div.et_pb_section.et_pb_section_3.et_section_regular > div.et_pb_row.et_pb_row_4 > div > div.et_pb_module.et_pb_text.et_pb_text_2.et_pb_text_align_left.et_pb_bg_layout_light > div');

    if (menu !== null) {
        return {
            name: '🍳 Dvorek',
            items: await getMenuItems(menu),
            url: PAGE_URL,
        };
    }

    return null;
}

const getMenuItems = async (menu: ElementHandle): Promise<MenuItem[]> => {
    const menuItems: MenuItem[] = [];

    const menuEls = await menu.$$('p');

    let menuItemIndex = 0;

    for (const menuEl of menuEls) {
        let textContent = await menuEl.evaluate(node => node.textContent);

        if (textContent!.length < 3) {
            menuItemIndex++;
        } else if (textContent !== null) {
            if (textContent.includes(STOP_AT)) {
                return menuItems;
            }
            
            if (menuItems[menuItemIndex] === undefined) {
                let mealType = MealType.MEAL;

                if (menuItemIndex === 0 || menuItemIndex === 1) {
                    mealType = MealType.SOUP;
                }

                menuItems[menuItemIndex] = {
                    name: '',
                    price: null,
                    mealType,
                }
            }

            if (textContent.includes(',-')) {
                menuItems[menuItemIndex].price = textContent;
            } else {
                if (menuItems[menuItemIndex].name.length !== 0) {
                    textContent = ` ${textContent}`;
                }

                menuItems[menuItemIndex].name += textContent;
            }
        }
    }

    return menuItems;
}
