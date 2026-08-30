import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: 'apps/backend/.env' });

async function findWorkingCity() {
  const url = `${process.env.TRAVELPORT_URL}/HotelService`;
  const username = process.env.TRAVELPORT_USERNAME;
  const password = process.env.TRAVELPORT_PASSWORD;

  console.log('Testing with Specific Property ID G3375...');
  const payload = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <hotel:HotelSearchAvailabilityReq xmlns:hotel="http://www.travelport.com/schema/hotel_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH}">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI" PCC="${process.env.TRAVELPORT_PCC}"/>
            <hotel:HotelPropertyID HotelCode="G3375"/>
            <hotel:HotelStay>
                <hotel:CheckinDate>2026-06-15</hotel:CheckinDate>
                <hotel:CheckoutDate>2026-06-17</hotel:CheckoutDate>
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
      },
      timeout: 10000
    });
    
    if (res.data.includes('HotelSearchResult')) {
      console.log(`✅ SUCCESS for Property G3375!`);
    } else {
       const match = res.data.match(/<faultstring>(.*)<\/faultstring>/);
       console.log(`❌ FAILED: ${match ? match[1] : 'Unknown fault'}`);
    }
  } catch (err: any) {
    console.log(`🔥 ERROR:`, err.message);
  }
}

findWorkingCity();
