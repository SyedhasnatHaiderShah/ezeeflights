import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: 'apps/backend/.env' });

async function verifyBackend() {
  const url = `${process.env.TRAVELPORT_URL}/HotelService`;
  const username = process.env.TRAVELPORT_USERNAME;
  const password = process.env.TRAVELPORT_PASSWORD;

  const payload = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <hotel:HotelSearchAvailabilityReq xmlns:hotel="http://www.travelport.com/schema/hotel_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH}">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            <hotel:HotelSearchLocation>
                <hotel:HotelLocation Location="LHR" LocationType="Airport"/>
            </hotel:HotelSearchLocation>
            <hotel:HotelSearchModifiers NumberOfAdults="1" NumberOfRooms="1" AvailableHotelsOnly="true">
                <com:PermittedProviders>
                    <com:Provider Code="1G"/>
                </com:PermittedProviders>
            </hotel:HotelSearchModifiers>
            <hotel:HotelStay>
                <hotel:CheckinDate>2026-06-15</hotel:CheckinDate>
                <hotel:CheckoutDate>2026-06-20</hotel:CheckoutDate>
            </hotel:HotelStay>
        </hotel:HotelSearchAvailabilityReq>
    </soap:Body>
</soap:Envelope>`;

  try {
    const res = await axios.post(url, payload, {
      auth: { username: username!, password: password! },
      headers: {
        'Content-Type': 'text/xml',
        'SOAPAction': 'http://www.travelport.com/service/hotel_v52_0/HotelService#HotelSearchAvailabilityReq'
      }
    });
    console.log('STATUS:', res.status);
    console.log('BODY START:', res.data.substring(0, 200));
  } catch (err: any) {
    console.log('ERROR STATUS:', err.response?.status);
    console.log('ERROR BODY:', err.response?.data);
  }
}

verifyBackend();
