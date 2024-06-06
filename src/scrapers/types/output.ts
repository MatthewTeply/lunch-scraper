export enum MealType {
    MEAL,
    SOUP,
    DESSERT,
}

export type MenuItem = {
    name: string,
    price: string | null,
    mealType: MealType,
}

export type Restaurant = {
    name: string,
    items: MenuItem[],
    url: string,
}