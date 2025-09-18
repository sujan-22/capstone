export interface IFavoriteDesign {
    id: string;
    imgSrc: string;
    caseName: string;
    modelName: string;
    color: string;
    material: string;
    finish: string;
    price: number;
    isFavorited: boolean;
    totalFavorites: number;
}

export type FavoriteDesignRow = {
    id: string;
    imgSrc: string;
    caseName: string;
    modelName: string;
    color: string;
    material: string;
    finish: string;
    price: number;
    favorited_by_user_ids: string[];
};
