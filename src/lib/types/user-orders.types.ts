import { BillingAddress, ShippingAddress } from "../database/table_types";

export interface IUserOrder {
    id: string;
    userId: string;
    orderNumber: string;
    subtotal: number;
    tax: number;
    totalAmount: number;
    orderStatus: string;
    trackingNumber: string | null;
    billingAddress: BillingAddress | null;
    shippingAddress: ShippingAddress | null;
    createdAt: string;
    updatedAt: string;
}

export interface ICaseDesign {
    id: string;
    imgSrc: string;
    caseName: string;
    modelName: string;
    color: string;
    material: string;
    finish: string;
    price: number;
    isFavorited?: boolean;
    totalFavorites?: number;
    croppedImgUrl: string;
    colorHex: string;
    hasRequestedToSharePublicly: boolean;
    isSharedPublicly: boolean;
}

export type OrderRow = {
    order_id: string;
    user_id: string;
    order_number: string;
    sub_total: number;
    tax: number;
    total_amount: number;
    order_status: string;
    tracking_number: string | null;
    order_createdat: Date;
    order_updatedat: Date;
    is_paid: boolean;

    design_id: string;
    imgSrc: string;
    caseName: string;
    modelName: string;
    color: string;
    material: string;
    finish: string;
    price: number;
    isFavorited: boolean;
    totalFavorites: number;
    cropped_image_url: string;
    colorHex: string;
    hasRequestedToSharePublicly: boolean;
    isSharedPublicly: boolean;

    billing_id: string;
    billing_name: string;
    billing_street: string;
    billing_city: string;
    billing_postal_code: string;
    billing_country: string;
    billing_state: string;
    billing_phone_number: string;

    shipping_id: string;
    shipping_name: string;
    shipping_street: string;
    shipping_city: string;
    shipping_postal_code: string;
    shipping_country: string;
    shipping_state: string;
    shipping_phone_number: string;
};

export interface IUserOrderWithDesign extends IUserOrder {
    design: ICaseDesign;
}
