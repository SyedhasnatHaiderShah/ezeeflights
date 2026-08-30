import { redirect } from 'next/navigation';

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;

  // Check if we have search query params to trigger a deep link redirect
  const origin = params.origin || params.Org;
  const destination = params.destination || params.Des;
  const departureDate = params.departureDate || params.DDate;

  if (origin || destination || departureDate) {
    const newParams = new URLSearchParams();

    newParams.set('org', (origin || 'LHE').toUpperCase());
    newParams.set('des', (destination || 'DXB').toUpperCase());
    newParams.set('dDate', departureDate || new Date().toISOString().slice(0, 10));

    const returnDate = params.returnDate || params.RDate;
    if (returnDate) {
      newParams.set('rDate', returnDate);
    }

    const adults = params.adults || params.Adt || '1';
    newParams.set('adt', adults);

    const children = params.children || params.Chld || '0';
    newParams.set('chd', children);

    const infants = params.infants || params.Inf || '0';
    newParams.set('inf', infants);

    const cabin = params.cabinClass || params.Cabin;
    if (cabin) {
      newParams.set('class', cabin.toUpperCase());
    }

    // Forward UTM tags and reference codes for click attribution & analytics
    const utmSource = params.utmSource || params.utm_source;
    if (utmSource) newParams.set('utm_source', utmSource);

    const utmMedium = params.utmMedium || params.utm_medium;
    if (utmMedium) newParams.set('utm_medium', utmMedium);

    const utmCampaign = params.utmCampaign || params.utm_campaign;
    if (utmCampaign) newParams.set('utm_campaign', utmCampaign);

    const ref = params.ref || params.Ref;
    if (ref) newParams.set('ref', ref);

    const tCode = params.tCode || params.TCode;
    if (tCode) newParams.set('tCode', tCode);

    redirect(`/flights/result?${newParams.toString()}`);
  }

  // Fallback to homepage flights tab
  redirect('/?tab=flights');
}
