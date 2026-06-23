export type OrangeDeliveryReceipt = {
  receivedAt: string;
  body: unknown;
  deliveryStatus?: string;
  address?: string;
  resourceId?: string;
};

const receipts: OrangeDeliveryReceipt[] = [];
const MAX_RECEIPTS = 50;

export function storeOrangeDeliveryReceipt(body: unknown): OrangeDeliveryReceipt {
  const deliveryInfo = (body as { deliveryInfoNotification?: { deliveryInfo?: { deliveryStatus?: string; address?: string }; callbackData?: string } })
    ?.deliveryInfoNotification;

  const entry: OrangeDeliveryReceipt = {
    receivedAt: new Date().toISOString(),
    body,
    deliveryStatus: deliveryInfo?.deliveryInfo?.deliveryStatus,
    address: deliveryInfo?.deliveryInfo?.address,
    resourceId: deliveryInfo?.callbackData,
  };

  receipts.unshift(entry);
  if (receipts.length > MAX_RECEIPTS) {
    receipts.length = MAX_RECEIPTS;
  }

  return entry;
}

export function listOrangeDeliveryReceipts(): OrangeDeliveryReceipt[] {
  return [...receipts];
}
