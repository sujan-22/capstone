interface IOrderItem {
    id: string;
    name: string;
    image: string | null;
    model: string;
    material: string;
    finish: string;
    color: string;
    price: string;
}

interface IOrderEmailData {
    orderId: string;
    orderNumber: string;
    createdAt: string;
    items: IOrderItem[];
    subtotal: string;
    tax: string;
    total: string;
}

export function generateOrderConfirmationEmailHTML(
    order: IOrderEmailData,
    baseUrl: string
) {
    const brandBlue = "#005DE0";
    const textColor = "#1F2937";
    const subText = "#4B5563";
    const border = "#E5E7EB";
    const bg = "#F9FAFB";

    const orderDetailsUrl = `${baseUrl}/order-details/${encodeURIComponent(
        order.orderId
    )}`;

    const itemsHtml = order.items
        .map((item) => {
            const img = item.image
                ? `<img src="${item.image}" width="42" height="42" alt="" style="display:block;border-radius:6px;border:1px solid ${border};object-fit:cover;" />`
                : `<div style="width:42px;height:42px;border-radius:6px;border:1px solid ${border};background:#fff;"></div>`;

            return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${border};">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="54" valign="top" style="padding-right:10px;">${img}</td>
                <td valign="middle" style="font-size:15px;line-height:1.4;">
                  <div style="font-weight:600;color:${textColor};">
                    ${escapeHtml(item.name)}
                  </div>
                  <div style="color:${subText};font-size:12px;margin-top:2px;">
                    ${escapeHtml(item.model)} • ${escapeHtml(
                item.material
            )} • ${escapeHtml(item.finish)} • ${escapeHtml(item.color)}
                  </div>
                </td>
                <td align="right" valign="middle" style="font-size:14px;color:${textColor};white-space:nowrap;">
                  ${escapeHtml(item.price)}
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
        })
        .join("");

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Your DesignMyCase order is confirmed</title>
    <div style="display:none;visibility:hidden;overflow:hidden;opacity:0;color:transparent;height:0;width:0;max-height:0;max-width:0;">
      Thanks for your order from DesignMyCase – your custom phone case is now being prepared.
    </div>
  </head>
  <body style="margin:0;padding:0;background:${bg};">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${bg};padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;background:#ffffff;border:1px solid ${border};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 24px 8px 24px;">
                <div style="font-size:22px;line-height:1.2;color:${textColor};font-weight:700;margin:0 0 6px 0;">
                  Thanks for your order!
                </div>
                <div style="font-size:15px;line-height:1.6;color:${subText};">
                  Your custom phone case order has been received and is being processed.
                </div>
                <div style="font-size:13px;line-height:1.6;color:${subText};margin-top:8px;">
                  <strong>Order #:</strong> ${escapeHtml(
                      order.orderNumber
                  )}<br/>
                  <strong>Date:</strong> ${escapeHtml(order.createdAt)}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 24px 8px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  ${itemsHtml}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 24px 16px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;color:${textColor};">
                  <tr>
                    <td style="padding:4px 0;color:${subText};">Subtotal</td>
                    <td align="right" style="padding:4px 0;">${escapeHtml(
                        order.subtotal
                    )}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:${subText};">Shipping</td>
                    <td align="right" style="padding:4px 0;">FREE</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:${subText};">Tax</td>
                    <td align="right" style="padding:4px 0;">${escapeHtml(
                        order.tax
                    )}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;border-top:1px solid ${border};font-weight:600;">Total</td>
                    <td align="right" style="padding:8px 0;border-top:1px solid ${border};font-weight:600;">
                      ${escapeHtml(order.total)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="left" style="padding:8px 24px 24px 24px;">
                <a href="${orderDetailsUrl}"
                   style="display:inline-block;background:${brandBlue};color:#fff;text-decoration:none;
                          font-weight:600;font-size:14px;line-height:20px;padding:10px 16px;border-radius:8px;">
                  View your order
                </a>
                <div style="font-size:12px;color:${subText};margin-top:10px;">
                  You can review your order details and track its status from your account at any time.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 24px 28px 24px;border-top:1px solid ${border};">
                <div style="font-size:14px;color:${textColor};margin:0 0 10px 0;">Thanks again,</div>
                <div style="font-size:20px;font-weight:400;display:inline-block;color:${textColor};">
                  DESIGN<span style="color:${brandBlue};">MY</span>CASE
                </div>
                <strong style="margin-left:6px;color:${textColor};">Team</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

    function escapeHtml(s: string) {
        return s
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
