import {
  PAYMENT_FAILURE_MESSAGES,
  type PaymentResultData,
} from '../types/paymentResult';

function readReturnStatus(search: string): string {
  const params = new URLSearchParams(search);
  const direct = params.get('status') ?? params.get('amp;status');
  if (direct) return direct.toLowerCase();

  const match = search.match(/(?:^|[?&])(?:amp;)?status=([^&]+)/i);
  return match ? decodeURIComponent(match[1]).toLowerCase() : '';
}

export function parsePaymentReturnFromUrl(search = window.location.search): PaymentResultData | null {
  const status = readReturnStatus(search);
  const params = new URLSearchParams(search);
  const orderNumber = params.get('order') ?? params.get('orderNumber') ?? undefined;
  const paymentReference = params.get('ref') ?? undefined;

  if (status === 'success') {
    return { status: 'success', orderNumber, paymentReference };
  }

  if (status === 'cancel') {
    return { status: 'failed', message: PAYMENT_FAILURE_MESSAGES.cancel };
  }

  if (status === 'decline' || status === 'failed') {
    return {
      status: 'failed',
      message:
        status === 'decline' ? PAYMENT_FAILURE_MESSAGES.decline : PAYMENT_FAILURE_MESSAGES.default,
    };
  }

  return null;
}

export function clearPaymentReturnParams(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('status');
  url.searchParams.delete('amp;status');
  url.searchParams.delete('order');
  url.searchParams.delete('orderNumber');
  url.searchParams.delete('ref');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}
