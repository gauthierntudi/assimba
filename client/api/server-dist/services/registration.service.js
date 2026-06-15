import { prisma } from '../lib/prisma.js';
import { sendMemberSMS } from './sms.service.js';
async function generateUniqueMemberNumber() {
    for (let attempt = 0; attempt < 20; attempt += 1) {
        const number = String(Math.floor(Math.random() * 100_000_000)).padStart(8, '0');
        const existing = await prisma.supporter.count({
            where: { memberNumber: number },
        });
        if (existing === 0) {
            return number;
        }
    }
    throw new Error('Impossible de générer un numéro de membre unique.');
}
export async function finalizeRegistration(flexpayReference) {
    const invoice = await prisma.invoice.findFirst({
        where: { flexpayReference },
        include: { supporter: true },
    });
    const supporter = invoice?.supporter;
    if (!supporter || supporter.memberNumber) {
        return supporter?.memberNumber ?? false;
    }
    const memberNumber = await generateUniqueMemberNumber();
    await prisma.supporter.update({
        where: { id: supporter.id },
        data: { memberNumber },
    });
    if (supporter.phone) {
        await sendMemberSMS(supporter.phone, memberNumber, supporter.firstname ?? '');
    }
    return memberNumber;
}
