export type PaymentResultStatus = 'success' | 'failed';

export type PaymentResultData = {
  status: PaymentResultStatus;
  orderNumber?: string;
  memberNumber?: string;
  message?: string;
  cardDownloadUrl?: string;
};

export const PAYMENT_FAILURE_MESSAGES = {
  cancel:
    "Paiement annulé. Vous n'avez pas été débité. Vous pouvez réessayer maintenant ou choisir un autre moyen de paiement.",
  decline:
    'Paiement refusé. Vérifiez votre solde, les informations de la carte, puis réessayez. Si le problème persiste, contactez votre banque.',
  default:
    'La transaction a été refusée, annulée ou votre solde est insuffisant.',
} as const;
