import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";
import { BillingAddress, ShippingAddress } from "@/lib/database/table_types";
import { formatPrice } from "@/lib/utils";

type Address = ShippingAddress | BillingAddress | null;

function AddressBlock({ address }: { address: Address }) {
    if (!address) return <p className="text-ink-soft">Not provided</p>;
    return (
        <address className="not-italic leading-relaxed">
            {address.name ? <span className="block font-medium">{address.name}</span> : null}
            <span className="block text-ink-soft">{address.street}</span>
            <span className="block text-ink-soft">
                {[address.city, address.state].filter(Boolean).join(", ")}{" "}
                {address.postal_code}
            </span>
            {address.country ? (
                <span className="block text-ink-soft">{address.country}</span>
            ) : null}
        </address>
    );
}

interface OrderReceiptProps {
    order: IUserOrderWithDesign;
    contact?: { name?: string | null; email?: string | null };
}

/** Addresses, delivery and totals, laid out like a work ticket. */
export default function OrderReceipt({ order, contact }: OrderReceiptProps) {
    const phone =
        order.shippingAddress?.phone_number ||
        order.billingAddress?.phone_number ||
        null;

    return (
        <section
            aria-label="Order summary"
            className="grid gap-px overflow-hidden rounded-md border border-rule bg-rule text-sm md:grid-cols-2 lg:grid-cols-12"
        >
            <div className="bg-paper-raised p-6 lg:col-span-3">
                <h3 className="type-label text-ink-soft">Shipping address</h3>
                <div className="mt-4">
                    <AddressBlock address={order.shippingAddress} />
                </div>
            </div>
            <div className="bg-paper-raised p-6 lg:col-span-3">
                <h3 className="type-label text-ink-soft">Billing address</h3>
                <div className="mt-4">
                    <AddressBlock address={order.billingAddress} />
                </div>
            </div>
            <div className="bg-paper-raised p-6 lg:col-span-3">
                <h3 className="type-label text-ink-soft">Delivery</h3>
                <dl className="mt-4 space-y-3">
                    <div>
                        <dt className="text-ink-soft">Payment</dt>
                        <dd className="font-medium">Paid</dd>
                    </div>
                    <div>
                        <dt className="text-ink-soft">Shipping method</dt>
                        <dd className="font-medium">
                            FedEx, up to 3 working days
                        </dd>
                    </div>
                    {order.trackingNumber ? (
                        <div>
                            <dt className="text-ink-soft">Tracking number</dt>
                            <dd className="font-mono font-medium">
                                {order.trackingNumber}
                            </dd>
                        </div>
                    ) : null}
                    {contact?.email || phone ? (
                        <div>
                            <dt className="text-ink-soft">Contact</dt>
                            <dd className="font-medium">
                                {contact?.email ? (
                                    <span className="block break-all">
                                        {contact.email}
                                    </span>
                                ) : null}
                                {phone ? <span className="block">{phone}</span> : null}
                            </dd>
                        </div>
                    ) : null}
                </dl>
            </div>
            <div className="bg-ink p-6 text-paper md:col-span-2 lg:col-span-3">
                <h3 className="type-label text-paper/60">Total paid</h3>
                <dl className="mt-4 space-y-2 font-mono">
                    <div className="flex justify-between gap-4">
                        <dt className="text-paper/70">Subtotal</dt>
                        <dd>{formatPrice(order.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="text-paper/70">Shipping</dt>
                        <dd>FREE</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="text-paper/70">Tax</dt>
                        <dd>{formatPrice(order.tax)}</dd>
                    </div>
                </dl>
                <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-paper/20 pt-4">
                    <span className="type-label text-paper/70">Total</span>
                    <span className="font-mono text-2xl font-medium tracking-[-0.03em]">
                        {formatPrice(order.totalAmount)}
                    </span>
                </div>
            </div>
        </section>
    );
}
