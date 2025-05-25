import { VercelRequest, VercelResponse } from '@vercel/node';
import { admin } from './utils/firebase';

export const handleCashfreeWebhook = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const data = req.body;

    if (data.order && data.order.status === 'PAID') {
      const orderId = data.order.order_id;
      const telegramId = data.order.customer_details.customer_id;

      await admin.database().ref(`/payments/${telegramId}`).set({
        orderId,
        status: 'PAID',
        timestamp: Date.now()
      });

      res.status(200).send('Payment stored');
    } else {
      res.status(400).send('Invalid payload');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Server error');
  }
};
