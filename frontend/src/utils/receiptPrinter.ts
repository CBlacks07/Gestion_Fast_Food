import type { Order } from '../types';

export const printReceipt = (order: Order) => {
  const receiptContent = generateReceiptHTML(order);

  // Ouvrir une nouvelle fenêtre pour l'impression
  const printWindow = window.open('', '', 'width=300,height=600');

  if (printWindow) {
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();

    // Imprimer automatiquement après un court délai
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
};

const generateReceiptHTML = (order: Order): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ticket - ${order.orderNumber}</title>
      <style>
        @media print {
          @page { margin: 0; }
          body { margin: 0.5cm; }
        }

        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          max-width: 80mm;
          margin: 0 auto;
          padding: 10px;
        }

        .header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }

        .title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .order-info {
          margin: 10px 0;
        }

        .items {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 10px 0;
          margin: 10px 0;
        }

        .item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        .item-name {
          flex: 1;
        }

        .item-price {
          text-align: right;
          min-width: 70px;
        }

        .option {
          font-size: 10px;
          margin-left: 15px;
          color: #666;
        }

        .totals {
          margin-top: 10px;
        }

        .total-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        .total-final {
          border-top: 2px solid #000;
          padding-top: 5px;
          font-size: 16px;
          font-weight: bold;
        }

        .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 2px dashed #000;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">🍔 GESTION FAST-FOOD</div>
        <div>Ticket de caisse</div>
      </div>

      <div class="order-info">
        <div><strong>N° Commande:</strong> ${order.orderNumber}</div>
        <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString('fr-FR')}</div>
        <div><strong>Type:</strong> ${
          order.type === 'DINE_IN' ? 'Sur place' :
          order.type === 'TAKEAWAY' ? 'À emporter' : 'Livraison'
        }</div>
        ${order.table ? `<div><strong>Table:</strong> ${order.table.number}</div>` : ''}
        ${order.customerName ? `<div><strong>Client:</strong> ${order.customerName}</div>` : ''}
      </div>

      <div class="items">
        ${order.items.map(item => `
          <div class="item">
            <div class="item-name">
              ${item.quantity}x ${item.product.name}
            </div>
            <div class="item-price">${Number(item.total).toLocaleString()} FCFA</div>
          </div>
          ${item.options && item.options.length > 0 ? item.options.map(opt => `
            <div class="option">+ ${opt.option.name}</div>
          `).join('') : ''}
          ${item.notes ? `<div class="option">Note: ${item.notes}</div>` : ''}
        `).join('')}
      </div>

      <div class="totals">
        <div class="total-line">
          <span>Sous-total:</span>
          <span>${Number(order.subtotal).toLocaleString()} FCFA</span>
        </div>

        ${Number(order.discount) > 0 ? `
          <div class="total-line">
            <span>Réduction:</span>
            <span>-${Number(order.discount).toLocaleString()} FCFA</span>
          </div>
        ` : ''}

        ${Number(order.tax) > 0 ? `
          <div class="total-line">
            <span>Taxes:</span>
            <span>${Number(order.tax).toLocaleString()} FCFA</span>
          </div>
        ` : ''}

        <div class="total-line total-final">
          <span>TOTAL:</span>
          <span>${Number(order.total).toLocaleString()} FCFA</span>
        </div>
      </div>

      ${order.payments && order.payments.length > 0 ? `
        <div class="totals">
          <div style="margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px;">
            <strong>Paiement(s):</strong>
            ${order.payments.map(payment => `
              <div class="total-line">
                <span>${
                  payment.method === 'CASH' ? '💵 Espèces' :
                  payment.method === 'TMONEY' ? '📱 TMoney' :
                  payment.method === 'FLOOZ' ? '📱 Flooz' :
                  payment.method === 'CARD' ? '💳 Carte' : '📲 Mobile'
                }</span>
                <span>${Number(payment.amount).toLocaleString()} FCFA</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="footer">
        <div>Merci de votre visite !</div>
        <div>À bientôt 😊</div>
        <div style="margin-top: 10px;">www.fast-food.com</div>
      </div>
    </body>
    </html>
  `;
};
