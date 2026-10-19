import { parseWhatsAppNumber } from './whatsapp';
import { parsePhoneNumber } from './phone';

export const whatsappContact = parseWhatsAppNumber(
  import.meta.env.PUBLIC_WHATSAPP_NUMBER,
);
export const phoneContact = parsePhoneNumber(
  import.meta.env.PUBLIC_CONTACT_PHONE,
);

if (whatsappContact.status === 'invalid') {
  console.warn('PUBLIC_WHATSAPP_NUMBER must be 8–15 digits in international format.');
}
if (phoneContact.status === 'invalid') {
  console.warn('PUBLIC_CONTACT_PHONE must be an international phone number.');
}

export function getPrimaryContactAction(
  whatsapp = whatsappContact,
  phone = phoneContact,
): { href: string; label: string } {
  if (whatsapp.status === 'ready') {
    return { href: whatsapp.href, label: 'Chat on WhatsApp' };
  }
  if (phone.status === 'ready') {
    return { href: phone.href, label: 'Call us' };
  }
  return { href: '/contact#contact-options', label: 'Contact us' };
}

export function getPublicContactActions(
  business?: { phone: string; whatsapp: string },
): {
  phone: ReturnType<typeof parsePhoneNumber>;
  whatsapp: ReturnType<typeof parseWhatsAppNumber>;
  primary: { href: string; label: string };
} {
  const phone = business ? parsePhoneNumber(business.phone) : phoneContact;
  const whatsapp = business ? parseWhatsAppNumber(business.whatsapp) : whatsappContact;
  return {
    phone,
    whatsapp,
    primary: getPrimaryContactAction(whatsapp, phone),
  };
}

export const primaryContactAction = getPrimaryContactAction();
