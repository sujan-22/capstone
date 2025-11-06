export interface IUserInfo {
    totalOrders: number;
    favoriteDesignsCount: number;
}

export type UserInfoRow = {
    user_id: string;
    total_orders: number;
    favorite_designs_count: number;
};
