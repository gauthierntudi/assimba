import { prisma } from '../lib/prisma.js';
import { parseSupporterPayload, toSupporterData, } from '../utils/payload.js';
import { normalizeStoragePhone, phoneLookupVariants } from '../utils/phone.js';
export async function upsertSupporter(input, options = {}) {
    const includeMemberType = options.includeMemberType ?? false;
    const normalizedPhone = normalizeStoragePhone(input.phone);
    const existing = await prisma.supporter.findFirst({
        where: { phone: { in: phoneLookupVariants(input.phone) } },
        select: { id: true },
    });
    const data = toSupporterData({ ...input, phone: normalizedPhone }, includeMemberType);
    if (existing) {
        await prisma.supporter.update({
            where: { id: existing.id },
            data: {
                ...data,
                phone: normalizedPhone,
            },
        });
        return existing.id;
    }
    const created = await prisma.supporter.create({
        data: {
            ...data,
            phone: normalizedPhone,
        },
    });
    return created.id;
}
export function parseBodyToSupporter(body) {
    return parseSupporterPayload(body);
}
export async function checkPhone(phone) {
    const supporter = await prisma.supporter.findFirst({
        where: { phone: { in: phoneLookupVariants(phone) } },
    });
    if (!supporter) {
        return { success: true, exists: false };
    }
    const paidInvoice = await prisma.invoice.findFirst({
        where: {
            supporterId: supporter.id,
            status: 'paid',
        },
        select: { id: true },
    });
    if (paidInvoice) {
        return {
            success: true,
            exists: true,
            is_paid: true,
            message: 'Ce numéro est déjà enregistré avec un paiement réussi.',
        };
    }
    return {
        success: true,
        exists: true,
        is_paid: false,
        data: {
            firstname: supporter.firstname,
            lastname: supporter.lastname,
            middlename: supporter.middlename,
            gender: supporter.gender,
            age: supporter.ageRange,
            age_range: supporter.ageRange,
            country_status: supporter.countryStatus,
            province: supporter.province,
            city: supporter.city,
            town: supporter.town,
            section: supporter.section,
            occupation: supporter.occupation,
            contribution: supporter.contribution,
            merch: supporter.merch,
            years: supporter.years,
            training_freq: supporter.trainingFreq,
            match_freq: supporter.matchFreq,
            follow_method: supporter.followMethod,
            social_fb: supporter.socialFb,
            social_x: supporter.socialX,
            social_ig: supporter.socialIg,
            social_tt: supporter.socialTt,
            member_type: supporter.memberType,
        },
    };
}
