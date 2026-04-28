# Reservations

Create, modify and cancel hotel reservations.

## Create Reservation (Full Payload) or Sync Hotel Reservation

 - [POST /hotel/book/reservations](https://developer.travelport.com/apis/stays/reservations/createhotelreservation.md): Use the Create Reservation Full Payload request to book a room by sending complete stay details and the booking code from the Availability response, along with traveler, form of payment, and payment information. NOTE: Availability results are stored in cache for 30 minutes. If the offers expire before you create a reservation, you must send a new request before booking. The Create Reservation Full Payload response uses the same format as the reference payload response. The only difference is that the Reference Payload response returns Reservation/id, which is the offer ID sent in that request. The full payload response does not return this information.
Note for Multi-room sell requests- when making a reservation, Travelport attempts to sell the number of rooms requested; however, the supplier may not be able to accommodate the total number of rooms. Each room sold creates a unique hotel segment on the Travelport reservation. A traveler name is associated with each room with these limitations: If the number of rooms requested is equal to the number of traveler names in the request, each room is associated with a unique traveler name. If the number of rooms requested is not equal to the number of traveler names in the request, all rooms are associated with the first traveler name.
Note for query parameters- Hotel APIs that create a new reservation or add to an existing one verify the reservation request with the guarantee type and price returned in preceding workflow steps. If there is any difference, the API does not yet create the reservation but instead returns an error to notify about the change.  To accept the change, send the request a second time with the applicable query parameter/s (acceptPriceChangeInd and/or acceptGuaranteeChangeInd). Do not send either of these query parameters in the initial request.  If you do not want to proceed with the booking because of the changes, you are not required to send a second booking request with the false value(s). You can simply let these offers expire.
Use the Sync Reservation request to synchronize a Booking.com hotel reservation to a Travelport PNR whenever specific sell failures occur. The Sync Reservation request is a scaled down re-try of a previous Create or Add Reservation request that adds to the original sell request the Traveler email address and the Booking.com booking information. The Sync message attempts to add the reservation information into a Travelport reservation as a standard aggregator segment but without re-selling the segment in the aggregator system. Booking.com requires the traveler email address in a hotel sell request. If the sell completes in the Booking.com system, the traveler receives a confirmation email containing information needed to synchronize the Travelport booking if the user receives one of two specific error messages on the original sell attempt. The Sync Reservation response returns all available data for the reservation using the same structure as the Create Reservation response.

## Create hotel reservation (Reference payload).

 - [POST /hotel/book/reservations/build](https://developer.travelport.com/apis/stays/reservations/buildhotelreservation.md): Use the Create Reservation Reference Payload request to book a room using a cached offer from either a preceding Availability or SearchComplete response. The reference payload request sends an offer ID plus traveler details and both form of payment and payment information. NOTE: Results from Availability and SearchComplete are stored in cache for 30 minutes. If the offers expire before you create a reservation, you must send a new request before booking. The Create Reservation Full Payload response uses the same format as the Reference Payload response. The only difference is that the reference payload response returns Reservation/id, which is the offer ID sent in that request. The full payload response does not return this information."
Note for query parameters- Hotel APIs that create a new reservation or add to an existing one verify the reservation request with the guarantee type and price returned in preceding workflow steps. If there is any difference, the API does not yet create the reservation but instead returns an error to notify about the change.  To accept the change, send the request a second time with the applicable query parameter/s (acceptPriceChangeInd and/or acceptGuaranteeChangeInd). Do not send either of these query parameters in the initial request.  If you do not want to proceed with the booking because of the changes, you are not required to send a second booking request with the false value(s). You can simply let these offers expire.

## Retrieve hotel reservation.

 - [GET /hotel/book/reservations/{Identifier}](https://developer.travelport.com/apis/stays/reservations/retrievehotelreservation.md): The Retrieve Hotel Reservation API returns all existing data on a reservation. You may retrieve details about a held booking or PNR. While a PNR refers to a held booking that has not been ticketed, the PNR code persists after ticketing to provide the booking records. Once a PNR has been ticketed, you can still use Retrieve to return both booking and ticketing details. A Ticket Display request can also be used to retrieve any ticketed itinerary.

## Modify existing hotel reservation.

 - [PUT /hotel/book/reservations/{Identifier}](https://developer.travelport.com/apis/stays/reservations/updatehotelreservation.md): Use Modify Hotel Reservation to modify specific data on an existing booking. Modify Hotel supports changes to the following data: 1) Dates of reservation, if allowed by supplier; note that a change in price may occur, 2) Form of payment details, 3) Specific details of the traveler associated with a booking as follows: a) Changing the given name and/or surname to that of another traveler currently on the reservation; other name changes are not supported, b) Telephone number, c) Email address, and/or d) Adding new comments. NOTE: Booking.com does not support modify capabilities. You cannot modify reservations made from Booking.com content. NOTE: When changing dates for a reservation sold through Travelport, best practice is to first send an Availability request for the new dates and look for the same booking code that is on the existing reservation. Although an Availability request is not mandatory, the Modify request will fail if the new dates are not available.  Add Hotel Reservation allows you to add another hotel room to an existing reservation. The full payload request sends complete offer details and the booking code from a preceding Availability request. Reference payload request sends a cached offer ID from a preceding Availability response. It requires both a preceding search (either by location or by ID) request and an Availability request, or a SearchComplete request.

## Cancel hotel reservation.

 - [PUT /hotel/book/reservations/{reservationIdentifier}/canceloffer](https://developer.travelport.com/apis/stays/reservations/cancelhoteloffer.md): The Cancel Hotel Reservation API cancels an existing hotel reservation.

## Create passive hotel reservation

 - [POST /hotel/book/reservations/passive](https://developer.travelport.com/apis/stays/reservations/createhotelpassivereservation.md): Create Passive Reservation creates a new booking with a hotel segment booked outside the Travelport GDS, called a passive segment. This allows the booking to include complete travel details. Passive hotel segments are confirmed with a status code of MK, which is returned in the response in Receipt/OfferStatus/code. A status code of AK is used for placeholder-only passive segments. A passive hotel segment is any segment that is booked using anything other than the JSON APIs or another product that uses the Travelport GDS. (A passive hotel segment is any segment that is booked using anything other than a product that uses the Travelport GDS. Passive segments are informational only. They do not result in a reservation or a change in inventory. Information on a passive segment is not received from or passed to the hotel supplier. Instead, passive segments provide a way to consolidate all booking information, including details from direct hotel bookings or even phone reservations.)

## Add passive reservation to a booking.

 - [PUT /hotel/book/reservations/{reservationIdentifier}/passive](https://developer.travelport.com/apis/stays/reservations/addpassiveoffer.md): Use the Add Passive Reservation request to add a passive hotel booking segment to an existing reservation. You can add either of two types of passive segments to an existing reservation: 1) Sending full details of the room in the request adds a single hotel segment with a status of MK (confirmed passive) to the reservation, or, 2) Sending only dates in the request, which adds a placeholder segment to the reservation. You may want to add a placeholder if you do not have all booking details. Or, you can send only dates to add a dummy or retention segment, which can be used to keep the reservation details active in the system after travel is complete, up to the dates on the passive segment. Placeholder segments return a status of AK. (A passive hotel segment is any segment that is booked using anything other than a product that uses the Travelport GDS. Passive segments are informational only. They do not result in a reservation or a change in inventory. Information on a passive segment is not received from or passed to the hotel supplier. Instead, passive segments provide a way to consolidate all booking information, including details from direct hotel bookings or even phone reservations.)

## Modify passive hotel reservation.

 - [PUT /hotel/book/reservations/{reservationIdentifier}/passiveupdate](https://developer.travelport.com/apis/stays/reservations/updatepassiveoffer.md): Use Modify Passive Reservation to update any parameter within an MK passive hotel booking segment of an existing reservation. MK designates a confirmed passive segment, while AK is used for placeholder-only segments. (A passive hotel segment is any segment that is booked using anything other than a product that uses the Travelport GDS. Passive segments are informational only. They do not result in a reservation or a change in inventory. Information on a passive segment is not received from or passed to the hotel supplier. Instead, passive segments provide a way to consolidate all booking information, including details from direct hotel bookings or even phone reservations.)

# Create Reservation (Full Payload) or Sync Hotel Reservation

Use the Create Reservation Full Payload request to book a room by sending complete stay details and the booking code from the Availability response, along with traveler, form of payment, and payment information. NOTE: Availability results are stored in cache for 30 minutes. If the offers expire before you create a reservation, you must send a new request before booking. The Create Reservation Full Payload response uses the same format as the reference payload response. The only difference is that the Reference Payload response returns Reservation/id, which is the offer ID sent in that request. The full payload response does not return this information.
Note for Multi-room sell requests- when making a reservation, Travelport attempts to sell the number of rooms requested; however, the supplier may not be able to accommodate the total number of rooms. Each room sold creates a unique hotel segment on the Travelport reservation. A traveler name is associated with each room with these limitations: If the number of rooms requested is equal to the number of traveler names in the request, each room is associated with a unique traveler name. If the number of rooms requested is not equal to the number of traveler names in the request, all rooms are associated with the first traveler name.
Note for query parameters- Hotel APIs that create a new reservation or add to an existing one verify the reservation request with the guarantee type and price returned in preceding workflow steps. If there is any difference, the API does not yet create the reservation but instead returns an error to notify about the change.  To accept the change, send the request a second time with the applicable query parameter/s (acceptPriceChangeInd and/or acceptGuaranteeChangeInd). Do not send either of these query parameters in the initial request.  If you do not want to proceed with the booking because of the changes, you are not required to send a second booking request with the false value(s). You can simply let these offers expire.
Use the Sync Reservation request to synchronize a Booking.com hotel reservation to a Travelport PNR whenever specific sell failures occur. The Sync Reservation request is a scaled down re-try of a previous Create or Add Reservation request that adds to the original sell request the Traveler email address and the Booking.com booking information. The Sync message attempts to add the reservation information into a Travelport reservation as a standard aggregator segment but without re-selling the segment in the aggregator system. Booking.com requires the traveler email address in a hotel sell request. If the sell completes in the Booking.com system, the traveler receives a confirmation email containing information needed to synchronize the Travelport booking if the user receives one of two specific error messages on the original sell attempt. The Sync Reservation response returns all available data for the reservation using the same structure as the Create Reservation response.

Endpoint: POST /hotel/book/reservations
Version: 11.33.0
Security: bearerAuth

## Query parameters:

  - `acceptPriceChangeInd` (boolean)
    Send with true to accept any difference in the current sell price from the total price returned in an earlier response. Default is false; terminates the sell process without booking. Create Reservation only.

  - `acceptGuaranteeChangeInd` (boolean)
    Send with true to accept any difference in the guarantee type from the guarantee type returned in an earlier response. (The guarantee types checked for differences are guarantee required, deposit required, prepay required.) Default is false; terminates the sell process without booking. Create Reservation only.

  - `applyStrictReservationCommentValidationInd` (boolean)
    If true, the user expects that the sell request will be failed if any of the requested reservation comments fail. If indicator is not sent the service will default to false.

  - `roomPerTravelerInd` (boolean)
    If true, the multi-room request will be sold as a separate reservation per traveler. If indicator is not sent the service will create a single reservation for all travelers. Default is false.

## Header parameters:

  - `TraceId` (string)
    Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response.
    Example: "TraceID_123456789"

  - `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
    Identifies the Travelport access group with which the caller is associated
    Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

  - `TVP-PCC-Core` (string)
    Allows user to pass PCC instead of Access Group ID
    Example: "DU7_1G"

  - `TVP-Correlation-Id` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.
    Example: "382c74c3-721d-4f34-80e5-57657b6cbc27"

  - `Accept-Encoding` (string, required)
    Comma-separated list of acceptable encodings like gzip and/or deflate
    Example: "gzip, deflate"

## Request fields (application/json):

  - `ReservationDetail` (object)
    Used for Hotel Reservation (Full Payload), Sync Reservation, and Passive Reservation requests. Defines the reservation details sent to create, add, modify, synchronize, or passively store a hotel booking segment.  In standard booking workflows, this request is typically sent after Hotel Availability, Rules, or SearchComplete.  In passive or sync workflows, it is used to store or synchronize hotel reservation information without performing a standard hotel sell. Additionally used for the response of Create Reservation (Reference Payload), Create Reservation (Full Payload), or Sync endpoint calls.

  - `ReservationDetail.@type` (string, required)
    Discriminator classes ReservationID, Reservation or ReservationDetail
    Example: "Reservation"

  - `ReservationDetail.id` (string)
    Internal identifier for the response.
    Example: "REF12873"

  - `ReservationDetail.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.Identifier.value` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
    Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

  - `ReservationDetail.Identifier.authority` (string)
    "Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
    Example: "TVPT"

  - `ReservationDetail.Offer` (array)

  - `ReservationDetail.Offer.@type` (string, required)
    "Discriminator classes for Air Price are OfferID, Offer, and OfferUpsell. 
Discriminator classes for Reservation and ReservationWorkbench are OfferID, Offer, OfferModify, and OfferUpsell. 
Discriminator classes for Hotel Rules are OfferID and Offer."
    Example: "Offer"

  - `ReservationDetail.Offer.id` (string)
    Offer identifier sent in the reference payload request to book that offer. Not returned in the full payload response; this is the only difference in the two responses.
    Example: "offer_1"

  - `ReservationDetail.Offer.offerRef` (string)
    Used to reference another instance of this object in the same message
    Example: "offer_1"

  - `ReservationDetail.Offer.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.Offer.ContentSource` (string)
    Indicates the owner the offer or document.
    Enum: "GDS", "NDC", "LCC", "API"

  - `ReservationDetail.Offer.parentOfferRef` (string)
    A reference to the Offer this offer is sold in conjunction with
    Example: "offer_1"

  - `ReservationDetail.Offer.offerModifyRef` (string)
    Reference to the new Offer created as a result of this Offer being subject to a schedule change.

  - `ReservationDetail.Offer.Product` (array, required)

  - `ReservationDetail.Offer.Product.@type` (string, required)
    Discriminator. Air Search child classes are ProductAir and ProductAncillary. Exchange Search child class is ProductAir. Ancillary Search is ProductAncillary. Seat Map child class isProductSeatAvailability. Air Price child classes are ProductAir and ProductAncillary. Hotel Availability child classes are ProductHospitality and ProductHospitalityOffer. Hotel Rules and HotelReservation child classes are ProductHospitality. All Vehicle APIs are ProductVehicle and ProductAncillaryVehicle. Reservation and Reservation Workbench child classes are ProductAir, ProductAncillary, ProductHospitality, ProductVehicle, and ProductAncillaryVehicle.
    Example: "ProductAir"

  - `ReservationDetail.Offer.Product.id` (string)
    Local id within a given message to support referencing this object.
    Example: "product_1"

  - `ReservationDetail.Offer.Product.productRef` (string)
    Reference id that corresponds to the product 'id' in ReferenceListProduct.Product. To find flight details for a product, use the ProductRef id to identify the product in ReferenceListProduct.Product, and use the Flight id's (e.g., s3, s4) to match to flight information in ReferenceListFlight.Flight.
    Example: "product_1"

  - `ReservationDetail.Offer.Product.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.Offer.Price` (object, required)
    Price includes a summary of the Base, Taxes, and Fees applicable to the offer in the currency indicated.

  - `ReservationDetail.Offer.Price.@type` (string, required)
    Discriminator classes Price or PriceDetail
    Example: "PriceDetail"

  - `ReservationDetail.Offer.Price.id` (string)
    Internally referenced id
    Example: "2"

  - `ReservationDetail.Offer.Price.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationDetail.Offer.Price.CurrencyCode.value` (string)
    An ISO 4217 currency code.
    Example: "USD"

  - `ReservationDetail.Offer.Price.CurrencyCode.codeAuthority` (string)
    Currency code authority
    Example: "ISO 4217"

  - `ReservationDetail.Offer.Price.CurrencyCode.decimalPlace` (integer)
    Number of decimal places for the currency.
    Example: 4

  - `ReservationDetail.Offer.Price.CurrencyCode.decimalAuthority` (string)
    Currency code decimal authority
    Example: "ISO 4217"

  - `ReservationDetail.Offer.Price.Base` (number)
    "Base price before taxes and fees. 
For Hotel, may not be returned by all suppliers."
    Example: 20.2

  - `ReservationDetail.Offer.Price.TotalTaxes` (number)
    "Total taxes applied to the base price. 
For Hotel, may not be returned by all suppliers."
    Example: 34.4

  - `ReservationDetail.Offer.Price.TotalFees` (number)
    Total fees included in Total Price.
    Example: 201

  - `ReservationDetail.Offer.Price.TotalPrice` (number)
    Total price of this offer including the base price and all taxes and fees.
    Example: 34

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal` (object)
    No longer used. Previously used to expose the local vendor currency when it is different to the purchased currency

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.@type` (string)

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.currencySource` (string)
    The system requesting or returning the currency code specified in the attribute
    Enum: "Supplier", "Charged", "Requested"

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Base` (number)
    The price prior to all applicable taxes of a product such as the rate for a room or fare for a flight.
    Example: 120.2

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Taxes` (object)
    Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Taxes.@type` (string, required)
    Discriminator. Child class is TaxesDetail
    Example: "TaxesDetail"

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Taxes.TotalTaxes` (number)
    A monetary amount, representing the total of all taxes included in this offer. Supports up to 4 decimal places; decimal place must be included.
    Example: 330.1

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo` (array)
    Returned for TripChange APIS only.

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.@type` (string)
    Example: "TaxInfo"

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.TaxCode` (string, required)
    The tax code
    Example: "XF"

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.Amount` (number, required)
    The amount of the tax applied

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.TaxBreakdown` (array, required)
    The breakdown of the tax for this tax code

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Fees` (object)
    Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Fees.@type` (string, required)
    Discriminator. Child class FeesDetail
    Example: "FeesDetail"

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Fees.TotalFees` (number)
    Total fees included in the TotalPrice. Supports up to 4 decimal places; decimal place needs to be included.
    Example: 111.11

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Fees.TotalAdditionalFeesPayableLocally` (number)
    Fees due separately at the property. Expected to be paid in local currency. These fees are not included in the Offer TotalPrice.
    Example: 2.1

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.Total` (number)
    Specifies the total price including base + taxes + fees
    Example: 30.13

  - `ReservationDetail.Offer.Price.VendorCurrencyTotal.approximateInd` (boolean)
    True if this amount has been converted from the original amount
    Example: true

  - `ReservationDetail.Offer.TermsAndConditionsFull` (array)

  - `ReservationDetail.Offer.TermsAndConditionsFull.@type` (string, required)
    'Discriminator classes for Air Price are TermsAndConditionsFullAir and TermsAndConditionsFullAncillary. 
Discriminator class for Hotel Rules and Reservation is TermsAndConditionsFullHospitality. 
Discriminator class for Vehicle Rules and Reservation is TermsAndConditionsFullVehicle. 
Discriminator classes for Reservation and Reservation Workbench APIs are TermsAndConditionsFullAir, TermsAndConditionsFullAncillary, TermsAndConditionsFullHospitality, TermsAndConditionsFullVehicle, TermsAndConditionsFullVehicle, and TermsAndConditionsFullScheduleChange.'
    Example: "TermsAndConditionsFullAir"

  - `ReservationDetail.Offer.TermsAndConditionsFull.id` (string)
    Local identifier within a given message for this object.
    Example: "TC_1"

  - `ReservationDetail.Offer.TermsAndConditionsFull.termsAndConditionsRef` (string)
    Used to reference another instance of this object in the same message.
    Example: "TC_1"

  - `ReservationDetail.Offer.TermsAndConditionsFull.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.Offer.passiveOfferInd` (boolean)
    Indicates aggregator segment built into PNR. Always send with true when using in a request. If returned true in a response, the Offer is passive for booking purposes.
    Example: true

  - `ReservationDetail.Offer.scheduleChangeInd` (boolean)
    If true, this Offer is subject to a schedule change.

  - `ReservationDetail.Traveler` (array)

  - `ReservationDetail.Traveler.@type` (string, required)
    Discriminator classes TravelerID or Traveler
    Example: "Traveler"

  - `ReservationDetail.Traveler.id` (string)

  - `ReservationDetail.Traveler.TravelerRef` (string)

  - `ReservationDetail.Traveler.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.Traveler.birthDate` (string)
    Date of Birth YYYY-MM-DD
    Example: "2021-06-05"

  - `ReservationDetail.Traveler.gender` (string)
    Gender Type Male, Female etc. This field is not used by Hotel APIs and will be ignored.
    Enum: "Male", "Female", "Unknown", "Undisclosed"

  - `ReservationDetail.Traveler.PersonName` (object, required)
    Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

  - `ReservationDetail.Traveler.PersonName.@type` (string, required)
    Discriminator classes PersonName or PersonNameDetail
    Example: "PersonNameDetail"

  - `ReservationDetail.Traveler.PersonName.Prefix` (string)
    Salutation of honorific (e.g. Mr., Mrs., Ms., Miss, Dr.)
    Example: "Mr"

  - `ReservationDetail.Traveler.PersonName.Given` (string)
    Given name, first name or names.
    Example: "John"

  - `ReservationDetail.Traveler.PersonName.Middle` (string)
    The middle name of the person name.
    Example: "Erick"

  - `ReservationDetail.Traveler.PersonName.Surname` (string, required)
    Family name, last name.
    Example: "Smith"

  - `ReservationDetail.Traveler.Address` (array)

  - `ReservationDetail.Traveler.Address.@type` (string, required)
    Discriminator classes include Address or AddressDetail
    Example: "AddressDetail"

  - `ReservationDetail.Traveler.Address.id` (string)
    unique address id
    Example: "Address_1"

  - `ReservationDetail.Traveler.Address.BldgRoom` (object)
    Address with building and room number

  - `ReservationDetail.Traveler.Address.BldgRoom.value` (string)
    Example: "Moore House"

  - `ReservationDetail.Traveler.Address.BldgRoom.buldingInd` (boolean)
    When true, the information is a building name. When false, it is an apartment or room #
    Example: true

  - `ReservationDetail.Traveler.Address.Number` (object)
    The street number alone is the numerical number that precedes the street name in the address.

  - `ReservationDetail.Traveler.Address.Number.value` (string)
    Street number value.
    Example: "23B"

  - `ReservationDetail.Traveler.Address.Number.streetNmbrSuffix` (string)
    Street Number Suffix
    Example: "B"

  - `ReservationDetail.Traveler.Address.Number.streetDirection` (string)
    Direction of the Street
    Example: "NW"

  - `ReservationDetail.Traveler.Address.Number.ruralRouteNmbr` (string)
    RuralRoute Number
    Example: "76"

  - `ReservationDetail.Traveler.Address.Number.po_Box` (string)
    PO Box Number
    Example: "1001"

  - `ReservationDetail.Traveler.Address.Street` (string)
    Street name. May also contain the street number when the Number element is missing.
    Example: "ABC Street"

  - `ReservationDetail.Traveler.Address.AddressLine` (array)
    Property street address. Used in place of Street and Number. Each element of the array represents an address line.
    Example: ["2035 S Havana street"]

  - `ReservationDetail.Traveler.Address.City` (string, required)
    Full name of the city, town, or postal station (i.e., a postal service territory, often used in a military address).
    Example: "Dublin"

  - `ReservationDetail.Traveler.Address.County` (string)
    County or Region Name.
    Example: "Berkshire"

  - `ReservationDetail.Traveler.Address.StateProv` (object)
    The standard code or abbreviation for the state, province, or region. May also include full length name.

  - `ReservationDetail.Traveler.Address.StateProv.value` (string)
    State, province, or region code needed to identify location (typically two characters).
    Example: "CA"

  - `ReservationDetail.Traveler.Address.StateProv.name` (string)
    State, province, or region name needed to identify location.
    Example: "California"

  - `ReservationDetail.Traveler.Address.Country` (object)
    Contains the information needed to identify a country.

  - `ReservationDetail.Traveler.Address.Country.value` (string)
    The ISO 3166 code for the property's address.
    Example: "US"

  - `ReservationDetail.Traveler.Address.Country.id` (string)
    Custom user-assigned identifier for the country.
    Example: "23"

  - `ReservationDetail.Traveler.Address.Country.name` (string)
    The full name of the country for the property's address.
    Example: "United States"

  - `ReservationDetail.Traveler.Address.Country.codeContext` (string)
    The source of a code, such as the organization that provided the id number
    Example: "IATA"

  - `ReservationDetail.Traveler.Address.PostalCode` (string)
    Postal code for the address.
    Example: "Sl6 1AB"

  - `ReservationDetail.Traveler.Address.Addressee` (string)
    The name of the company or person to be addressed
    Example: "ACME INC"

  - `ReservationDetail.Traveler.Address.role` (string)
    Defines the type of location the address is assigned to. For TravelAgency address leave blank or use "Other".
    Enum: "Home", "Business", "Mailing", "Delivery", "Destination", "Other", "Billing"

  - `ReservationDetail.Traveler.Telephone` (array)

  - `ReservationDetail.Traveler.Telephone.@type` (string, required)
    Discriminator classes Telephone or TelephoneDetail
    Example: "Telephone"

  - `ReservationDetail.Traveler.Telephone.countryAccessCode` (string)
    Phone country code
    Example: "1"

  - `ReservationDetail.Traveler.Telephone.areaCityCode` (string)
    Phone local area code
    Example: "972"

  - `ReservationDetail.Traveler.Telephone.phoneNumber` (string, required)
    Mobile/Telephone Number. Accepted characters are numeric, dash, space, and period.
    Example: "972-000-787"

  - `ReservationDetail.Traveler.Telephone.extension` (string)
    Telephone extension number
    Example: "234"

  - `ReservationDetail.Traveler.Telephone.id` (string)
    Optional internally referenced id
    Example: "3"

  - `ReservationDetail.Traveler.Telephone.cityCode` (string)
    IATA city code if referenced by phone number.
    Example: "DEN"

  - `ReservationDetail.Traveler.Telephone.role` (string)
    Defines the type of location the Telephone is assigned to. For Travel Agency telephone select "Other" or leave blank.
    Enum: "Mobile", "Home", "Work", "Office", "Fax", "Other"

  - `ReservationDetail.Traveler.Email` (array)

  - `ReservationDetail.Traveler.Email.value` (string)
    Example: "exampledomain@example.com"

  - `ReservationDetail.Traveler.Email.id` (string)
    Electronic email addresses, in IETF specified format.
    Example: "email_1"

  - `ReservationDetail.Traveler.Email.emailType` (string)
    Use email type to specify if the email is to be sent "TO" or sent "FROM"
    Example: "FROM"

  - `ReservationDetail.Traveler.Email.comment` (string)
    Comments associated to the email

  - `ReservationDetail.Traveler.Email.preferredFormat` (string)
    Mime media type
    Example: "text/html"

  - `ReservationDetail.Traveler.Email.shareMarketing` (string)
    Used to indicate marketing preferences, Yes, No, Inherit
    Enum: "Yes", "No", "Inherit"

  - `ReservationDetail.Traveler.Email.shareSync` (string)
    Used to indicate marketing preferences, Yes, No, Inherit
    Enum: "Yes", "No", "Inherit"

  - `ReservationDetail.Traveler.Email.optOutInd` (string)
    Used to indicate marketing preferences, Yes, No, Inherit
    Enum: "Yes", "No", "Inherit"

  - `ReservationDetail.Traveler.Email.optInStatus` (string)
    Used to indicate marketing preferences, OptIn, OptOut
    Enum: "OptedIn", "OptedOut", "Unknown"

  - `ReservationDetail.Traveler.Email.optInDate` (string)
    The datetime of receiving the opt in notice
    Example: "2026-03-03 11:11:00+00:00"

  - `ReservationDetail.Traveler.Email.optOutDate` (string)
    The datetime the opt out notice was received
    Example: "2026-03-03 11:11:00+00:00"

  - `ReservationDetail.Traveler.Email.validInd` (boolean)
    If true, this is a valid email address that has been system verified via a successful email transmission.
    Example: true

  - `ReservationDetail.Traveler.Email.provisionedInd` (boolean)
    If true then the email address came from the provisioning process
    Example: true

  - `ReservationDetail.Traveler.passengerTypeCode` (string)
    Passenger type code
    Example: "CHD"

  - `ReservationDetail.Traveler.nationality` (string)
    Nationality on country code ISO
    Example: "AL"

  - `ReservationDetail.Traveler.age` (integer)
    The age of the traveller at the time of travel
    Example: 13

  - `ReservationDetail.Traveler.CustomerLoyalty` (array)

  - `ReservationDetail.Traveler.CustomerLoyalty.value` (string, required)
    Number on loyalty card.
    Example: "132456"

  - `ReservationDetail.Traveler.CustomerLoyalty.id` (string)
    Optional Customer Loyalty Id. Not saved
    Example: "Loyalty_1"

  - `ReservationDetail.Traveler.CustomerLoyalty.priority` (integer)
    Optional Numeric Priority Code
    Example: 2

  - `ReservationDetail.Traveler.CustomerLoyalty.programId` (string)
    "Specifies an identifier to indicate the company owner of the loyalty program. Typically two characters.
For frequent guest number, the hotel supplier or brand code. 
For frequent flyer number, the air supplier code of the loyalty program."
    Example: "United"

  - `ReservationDetail.Traveler.CustomerLoyalty.programName` (string)
    Supplier's loyalty program name.
    Example: "Frontier-EarlyReturns"

  - `ReservationDetail.Traveler.CustomerLoyalty.supplierType` (string)
    The type of supplier of a loyalty program. Uses 'hotel' for frequent guest number or 'air' for frequent flyer number.
    Example: "Airline"

  - `ReservationDetail.Traveler.CustomerLoyalty.supplier` (string, required)
    Supplier of a loyalty program (typically 2 characters representing the hotel, brand, or airline).
    Example: "UA"

  - `ReservationDetail.Traveler.CustomerLoyalty.tier` (string)
    Customer Loyalty tier
    Example: "Silver"

  - `ReservationDetail.Traveler.CustomerLoyalty.shareWithSupplier` (array)
    The list of suppliers that the CustomerLoyalty number is shared. Used for cross accrual.
    Example: ["LH"]

  - `ReservationDetail.Traveler.CustomerLoyalty.cardHolderName` (string)
    Customer loyalty member name; up to 128 characters are supported. In Air Search, for discounted offers to be returned, the name must be sent as LAST FIRST; e.g.,if SMITH is the last name and JORDAN the first name, send as SMITH JORDAN
    Example: "John Smith"

  - `ReservationDetail.Traveler.CustomerLoyalty.validatedInd` (boolean)
    Customer loyalty number has been validated by the supplier
    Example: true

  - `ReservationDetail.Traveler.CustomerLoyalty.prefix` (string)
    The cardholder name prefix title like Mr, Mrs, Dr
    Example: "Dr"

  - `ReservationDetail.Traveler.CustomerLoyalty.given` (string)
    The First Name of the Cardholder
    Example: "John"

  - `ReservationDetail.Traveler.CustomerLoyalty.middle` (string)
    Middle Name of the Cardholder
    Example: "Wilkinson"

  - `ReservationDetail.Traveler.CustomerLoyalty.surname` (string)
    Last Name of the Cardholder
    Example: "Smith"

  - `ReservationDetail.Traveler.AlternateContact` (array)

  - `ReservationDetail.Traveler.AlternateContact.@type` (string)
    Example: "AlternateContact"

  - `ReservationDetail.Traveler.AlternateContact.id` (string)

  - `ReservationDetail.Traveler.AlternateContact.contactType` (string)
    Contact type value
    Example: "Relative"

  - `ReservationDetail.Traveler.AlternateContact.relation` (string)
    Relation value
    Example: "Mother"

  - `ReservationDetail.Traveler.AlternateContact.PersonName` (object, required)
    Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

  - `ReservationDetail.Traveler.AlternateContact.Address` (array)

  - `ReservationDetail.Traveler.AlternateContact.Telephone` (array)

  - `ReservationDetail.Traveler.AlternateContact.Email` (array)

  - `ReservationDetail.Traveler.AlternateContact.emergencyInd` (boolean)
    This is the contact in case of an emergency
    Example: true

  - `ReservationDetail.Traveler.AlternateContact.defaultInd` (boolean)
    This is the default contact
    Example: true

  - `ReservationDetail.Traveler.TravelDocument` (array)

  - `ReservationDetail.Traveler.TravelDocument.@type` (string, required)
    Discriminator classes TravelDocument or TravelDocumentDetail
    Example: "TravelDocumentDetail"

  - `ReservationDetail.Traveler.TravelDocument.docNumber` (string)
    Document number value
    Example: "B37201"

  - `ReservationDetail.Traveler.TravelDocument.docType` (string)
    Codes from OTA DOC - Document Type
    Enum: "Visa", "Passport", "MilitaryIdentification", "DriversLicense", "NationalIdentityDocument", "VaccinationCertificate", "AlienRegistrationNumber", "InsurancePolicyNumber", "TaxExemptionNumber", "VehicleRegistrationLicenseNumber", "BoderCrossingCard", "RefugeeTravelDocument", "PilotsLicense", "PermanentResidentCard", "RedressNumber", "KnownTravelerNumber", "Non-Standard", "MerchantNumber", "AirNexusCard", "CrewMemberCertificate", "PassportCard", "NaturalizationCertificate", "TicketNumber", "LargeFamilyDiscountCard", "IdentityCardTypeA", "IdentityCardTypeC", "IdentityCardTypeI"

  - `ReservationDetail.Traveler.TravelDocument.issueDate` (string)
    Date of Issue
    Example: "2002-10-13"

  - `ReservationDetail.Traveler.TravelDocument.expireDate` (string)
    Date of expiration
    Example: "2002-11-13"

  - `ReservationDetail.Traveler.TravelDocument.stateProvCode` (string)
    State Province Code value
    Example: "44"

  - `ReservationDetail.Traveler.TravelDocument.placeOfIssue` (string)
    Place of issue value
    Example: "Birmingham"

  - `ReservationDetail.Traveler.TravelDocument.issueCountry` (string)
    Issue country on Country Code ISO
    Example: "CA"

  - `ReservationDetail.Traveler.TravelDocument.birthDate` (string)
    The date of birth of the document holder
    Example: "1995-04-22"

  - `ReservationDetail.Traveler.TravelDocument.birthCountry` (string)
    Birth country on Country Code ISO value
    Example: "AR"

  - `ReservationDetail.Traveler.TravelDocument.birthPlace` (string)
    Birth place value
    Example: "Ontario"

  - `ReservationDetail.Traveler.TravelDocument.residence` (string)
    Residence value
    Example: "1st section 8th st"

  - `ReservationDetail.Traveler.TravelDocument.id` (string)
    Locally referenced id
    Example: "34"

  - `ReservationDetail.Traveler.TravelDocument.Gender` (string, required)
    Gender Type Male, Female etc. This field is not used by Hotel APIs and will be ignored.
    Enum: "Male", "Female", "Unknown", "Undisclosed"

  - `ReservationDetail.Traveler.TravelDocument.Nationality` (string)
    Specifies a 2 character country code as defined in ISO3166.
    Example: "BR"

  - `ReservationDetail.Traveler.TravelDocument.PersonName` (object, required)
    Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

  - `ReservationDetail.Traveler.Comments` (object)
    Comments object to relay text information

  - `ReservationDetail.Traveler.Comments.@type` (string)
    Example: "Comments"

  - `ReservationDetail.Traveler.Comments.Comment` (array)

  - `ReservationDetail.Traveler.Comments.Comment.value` (string)
    Actual text. May be restricted by character limits based on the type of comment (e.g. Notepad remarks limited to 87 characters).
    Example: "Additional comments"

  - `ReservationDetail.Traveler.Comments.Comment.id` (string)
    Local identifier within a given message for this object.
    Example: "comment_1"

  - `ReservationDetail.Traveler.Comments.Comment.name` (string)
    Title of comment or type of remark.
    Example: "Comment name"

  - `ReservationDetail.Traveler.Comments.Comment.language` (string)
    Language code using ISO-639 standard
    Example: "EN"

  - `ReservationDetail.Traveler.RailDiscountCard` (array)

  - `ReservationDetail.Traveler.RailDiscountCard.value` (string)
    Example: "Rail1234546"

  - `ReservationDetail.Traveler.RailDiscountCard.supplierCode` (string, required)
    Code of the Supplier
    Example: "Enco"

  - `ReservationDetail.Traveler.RailDiscountCard.referenceNumber` (string)
    ReferenceNumber
    Example: "134256"

  - `ReservationDetail.Traveler.accompaniedByInfantInd` (boolean)
    Example: true

  - `ReservationDetail.TravelerProduct` (array)

  - `ReservationDetail.TravelerProduct.@type` (string, required)
    Discriminator classes TravelerProductID or TravelerProduct
    Example: "TravelerProduct"

  - `ReservationDetail.TravelerProduct.id` (string)

  - `ReservationDetail.TravelerProduct.TravelerRef` (string)
    Traveler reference number associated with offer in OfferRef.

  - `ReservationDetail.TravelerProduct.OfferRef` (string)
    Offer reference number associated with traveler in TravelerRef.

  - `ReservationDetail.TravelerProduct.ProductRef` (string)
    A pointer to the product id

  - `ReservationDetail.TravelerProduct.ConfirmationStatusEnum` (string)
    Status returned in a response for a two or more phase commitment process
    Enum: "Pending", "Confirmed", "Cancelled", "Rejected", "Requested"

  - `ReservationDetail.TravelerProduct.UnpricedFlightSegmentRefs` (array)
    References the flight segment/s within UnpricedSegments that are associated to this Traveler.
    Example: ["unpricedFlightSegment_001","unpricedFlightSegment_002"]

  - `ReservationDetail.FormOfPayment` (array)

  - `ReservationDetail.FormOfPayment.@type` (string, required)
    Discriminator classes FormOfPaymentID, FormOfPaymentBSP, FormOfPaymentCash, FormOfPaymentCheck, FormOfPaymentDocument, FormOfPaymentFlightPass, FormOfPaymentForfeit, FormOfPaymentInvoice, FormOfPaymentPaymentCard, FormOfPaymentVirtualPaymentAccount, FormOfPaymentWaiverCode
    Example: "FormOfPaymentPaymentCard"

  - `ReservationDetail.FormOfPayment.id` (string)
    Form of Payment reference ID.

  - `ReservationDetail.FormOfPayment.FormOfPaymentRef` (string)

  - `ReservationDetail.FormOfPayment.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.Payment` (array)

  - `ReservationDetail.Payment.@type` (string, required)
    Discriminator classes PaymentID or Payment
    Example: "Payment"

  - `ReservationDetail.Payment.id` (string)
    Customer-assigned identifier for the payment.

  - `ReservationDetail.Payment.PaymentRef` (string)
    Customer-assigned name for the payment.

  - `ReservationDetail.Payment.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.Payment.Amount` (object, required)
    A monetary amount, up to 4 decimal places. Decimal place must be included.

  - `ReservationDetail.Payment.Amount.value` (number)
    The amount of a given currency.
    Example: 124.56

  - `ReservationDetail.Payment.Amount.code` (string)
    An ISO 4217 alpha character code (3 characters) that specifies a money unit.
    Example: "USD"

  - `ReservationDetail.Payment.Amount.minorUnit` (integer)
    Minor units are a mechanism for expressing the relationship between a major currency unit and its corresponding minor currency unit.
    Example: 2

  - `ReservationDetail.Payment.Amount.currencySource` (string)
    The system requesting or returning the currency code specified in the attribute
    Enum: "Supplier", "Charged", "Requested"

  - `ReservationDetail.Payment.Amount.approximateInd` (boolean)
    "If true, the currency amount has been converted from the original amount.
For Hotel Availability and Rules, true indicates this is a calculated value; false indicates this is the value returned by the property."
    Example: true

  - `ReservationDetail.Payment.FormOfPaymentIdentifier` (object)
    The Travelport-assigned identifier for the FOP used for purchase.

  - `ReservationDetail.Payment.FormOfPaymentIdentifier.@type` (string)
    Example: "FormOfPaymentPaymentCash"

  - `ReservationDetail.Payment.FormOfPaymentIdentifier.id` (string)
    Form of payment identifier reference ID.

  - `ReservationDetail.Payment.FormOfPaymentIdentifier.FormOfPaymentRef` (string)

  - `ReservationDetail.Payment.FormOfPaymentIdentifier.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.Payment.OfferIdentifier` (array)

  - `ReservationDetail.Payment.OfferIdentifier.id` (string)
    Local identifier within a given message for this object.
    Example: "offer_1"

  - `ReservationDetail.Payment.OfferIdentifier.offerRef` (string)
    Used to reference another instance of this object in the same message
    Example: "offer_1"

  - `ReservationDetail.Payment.OfferIdentifier.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.Payment.Fees` (object)
    Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

  - `ReservationDetail.Payment.Taxes` (object)
    Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

  - `ReservationDetail.Payment.TravelerIdentifierRef` (array)

  - `ReservationDetail.Payment.TravelerIdentifierRef.name` (string)
    Traveler identifier

  - `ReservationDetail.Payment.TravelerIdentifierRef.passengerTypeCode` (string)
    Passenger Type code
    Example: "ADT"

  - `ReservationDetail.Payment.TravelerIdentifierRef.ages` (array)
    The ages of the travelers associated to a particular ptc. For NDC, this value will be returned in PriceBreakdownAir if sent as part of the PassengerCriteria in the Air Search request.
    Example: [15]

  - `ReservationDetail.Payment.TravelerIdentifierRef.passengerCriteriaRef` (string)
    Allows the user to associate passenger criteria information.
    Example: "passengerCriteria_1"

  - `ReservationDetail.Payment.TravelerIdentifierRef.value` (string)

  - `ReservationDetail.Payment.TravelerIdentifierRef.id` (string)
    A locally referenced ID

  - `ReservationDetail.Payment.TravelerIdentifierRef.description` (string)
    Descriptive text used to identify the contents of a target object

  - `ReservationDetail.Payment.TravelerIdentifierRef.uris` (array)
    Uniform Resource Identifier
    Example: ["google.com"]

  - `ReservationDetail.Payment.TravelerIdentifierRef.age` (integer)
    Replaced with ages array. The age of the traveler.
    Example: 11

  - `ReservationDetail.Payment.BaseAmount` (object)
    A monetary amount, up to 4 decimal places. Decimal place must be included.

  - `ReservationDetail.Payment.depositInd` (boolean)
    If true, the payment is a deposit on the referenced Offer; at booking the provided card is charged for deposit or prepay rate.

  - `ReservationDetail.Payment.AgencyServiceFeeIdentifier` (array)

  - `ReservationDetail.Payment.AgencyServiceFeeIdentifier.id` (string)
    Unique id for this object within a message

  - `ReservationDetail.Payment.guaranteeInd` (boolean)
    If true, the payment is a guarantee for the referenced Offer; no amounts are charged at booking; the customer is to make payment in person upon arrival.

  - `ReservationDetail.Payment.ExtendedPayment` (object)
    Note this field is deprecated in Payment schema and should be passed in FormOfPaymentPaymentCardExtendPayment schema

  - `ReservationDetail.Payment.ExtendedPayment.NumberOfInstallments` (integer, required)
    The number of installment payments to be charged by the payment card provider
    Example: 6

  - `ReservationDetail.Payment.ExtendedPayment.FirstInstallment` (number)
    For Pagos Parceledos, specify the first installment amount. This will be the same currency as the payment
    Example: 100

  - `ReservationDetail.Payment.ExtendedPayment.RemainingAmount` (number)
    For Pagos Parceledos, specify the remaining amount to be charged that will be spread across the number of installments. This will be the same currency as the payment
    Example: 50

  - `ReservationDetail.Payment.ExtendedPayment.OTATOCode` (string)
    For Pagos Parceledos the OTATOCode

  - `ReservationDetail.Receipt` (array)

  - `ReservationDetail.Receipt.@type` (string, required)
    Discriminator classes ReceiptID, ReceiptConfirmation, ReceiptConfirmationDivide, ReceiptCancellation, ReceiptPayment
    Example: "ReceiptConfirmation"

  - `ReservationDetail.Receipt.id` (string)
    The verification number.
    Example: "3493289238"

  - `ReservationDetail.Receipt.ReceiptRef` (string)
    Example: "6773 2389 2239 2832"

  - `ReservationDetail.Receipt.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.Receipt.dateTime` (string)
    Receipt date time
    Example: "2022-08-07 12:12:00+00:00"

  - `ReservationDetail.Receipt.OfferRef` (array)
    List of offer reference ids for the offer(s) returned in the Reservation response.

  - `ReservationDetail.Receipt.ProductRef` (string)
    Reference of product

  - `ReservationDetail.OfferLink` (array)

  - `ReservationDetail.OfferLink.@type` (string, required)
    Example: "OfferLink"

  - `ReservationDetail.OfferLink.OfferRef` (string)

  - `ReservationDetail.OfferLink.ParentOffer` (object)

  - `ReservationDetail.OfferLink.ParentOffer.@type` (string, required)
    Discriminator class ParentOffer only
    Example: "ParentOffer"

  - `ReservationDetail.OfferLink.ParentOffer.OfferRef` (string)

  - `ReservationDetail.OfferLink.ParentOffer.ProductRef` (string)

  - `ReservationDetail.ReservationComment` (array)

  - `ReservationDetail.ReservationComment.@type` (string, required)
    Discriminator classes ReservationCommentID or ReservationComment
    Example: "ReservationComment"

  - `ReservationDetail.ReservationComment.id` (string)
    Local identifier within a given message for this object.

  - `ReservationDetail.ReservationComment.commentSource` (string)
    Originator of a comment.
    Enum: "Agency", "Supplier", "Traveler"

  - `ReservationDetail.ReservationComment.shareWith` (string)
    Designates the visibility of a remark.
    Enum: "Supplier", "Agency", "Traveler"

  - `ReservationDetail.ReservationComment.shareWithSupplier` (array)
    Reservation comment shared with supplier

  - `ReservationDetail.ReservationComment.Comment` (array)
    Defines the type of remark (name) and the remark itself (value).
Send the following in 'name' for each type of remark: Notepad remarks: Two-character code. Use asterisk for any placeholder. (HS, CR, R, *) Unassociated remarks: ITIN COMMENTS Special instruction remarks: SI
For remark text 'value', please note character limits for each type of remark: Notepad remarks: 87 Unassociated remarks: 70 Special instruction remarks: 50

  - `ReservationDetail.ReservationComment.AppliesTo` (array)

  - `ReservationDetail.ReservationComment.AppliesTo.@type` (string, required)
    Discriminator classes AppliesToOffer, AppliesToOfferProduct,and AppliesToOfferProductSegment
    Example: "AppliesToOffer"

  - `ReservationDetail.PrimaryContact` (array)

  - `ReservationDetail.PrimaryContact.@type` (string, required)
    Discriminator classes PrimaryContactID or PrimaryContact
    Example: "PrimaryContact"

  - `ReservationDetail.PrimaryContact.id` (string)

  - `ReservationDetail.PrimaryContact.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.PrimaryContact.shareWith` (string)
    Designates the visibility of a remark.
    Enum: "Supplier", "Agency", "Traveler"

  - `ReservationDetail.PrimaryContact.shareWithSupplier` (array)
    Primary contact shared with supplier

  - `ReservationDetail.PrimaryContact.Email` (object)
    Electronic email addresses, in IETF specified format.
Booking.com requires a traveler email address in the Hotel Create Reservation and Add Reservation requests. A system-generated confirmation email is sent to the traveler after the booking completes.

  - `ReservationDetail.PrimaryContact.Telephone` (object)

  - `ReservationDetail.PrimaryContact.TravelerIdentifier` (object)
    Traveler Identifier object.

  - `ReservationDetail.PrimaryContact.TravelerIdentifier.@type` (string)
    Example: "TravelerIdentifier"

  - `ReservationDetail.PrimaryContact.TravelerIdentifier.id` (string)

  - `ReservationDetail.PrimaryContact.TravelerIdentifier.TravelerRef` (string)

  - `ReservationDetail.PrimaryContact.TravelerIdentifier.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.PrimaryContact.contactInformationRefusedInd` (boolean)
    If true, the passenger has refused to provide emergency contact details
    Example: true

  - `ReservationDetail.TravelAgency` (object)
    An optional object to define travel agency information.

  - `ReservationDetail.TravelAgency.@type` (string, required)
    Discriminator classes TravelAgency, TravelAgencyID, or TravelAgencyDetail
    Example: "TravelAgencyDetail"

  - `ReservationDetail.TravelAgency.id` (string)
    Simple xsd id, not for external use
    Example: "2"

  - `ReservationDetail.TravelAgency.TravelOrganizationRef` (string)
    An organization that has a name and a structure and members and directly works in the travel industry
    Example: "TravelAgency_1"

  - `ReservationDetail.TravelAgency.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.TravelAgency.organizationType` (string)
    The type of organization such as an Agency, Branch, Company, Supplier, Provider
    Enum: "TravelAgency", "AgencyBranch", "LoyaltyProgram", "IdDocumentIssuer", "TravelSupplier", "TravelProvider", "Regulatory"

  - `ReservationDetail.TravelAgency.OrganizationName` (object, required)
    Identifies a company by name

  - `ReservationDetail.TravelAgency.OrganizationName.value` (string)

  - `ReservationDetail.TravelAgency.OrganizationName.id` (string)
    Use this id to internally identify this company in NextSteps
    Example: "2"

  - `ReservationDetail.TravelAgency.OrganizationName.division` (string)
    The division name or ID with which the contact is associated
    Example: "Travel Division"

  - `ReservationDetail.TravelAgency.OrganizationName.department` (string)
    The department name or ID with which the contact is associated
    Example: "Adventure department"

  - `ReservationDetail.TravelAgency.OrganizationName.shortName` (string)
    Used to provide the company common name
    Example: "Adventure Inc"

  - `ReservationDetail.TravelAgency.OrganizationName.code` (string)
    Identifies a company by the company code
    Example: "AI"

  - `ReservationDetail.TravelAgency.OrganizationName.codeContext` (string)
    Identifies the context of the identifying code, such as DUNS, IATA, or internal code
    Example: "ISO"

  - `ReservationDetail.TravelAgency.OrganizationName.systemOfRecord` (array)
    The system(s) that maintain the data
    Example: ["MB"]

  - `ReservationDetail.TravelAgency.CorporateCode` (string)
    A reference assigned by the Travel Agency to identify the corporate organization
    Example: "Air Agency"

  - `ReservationDetail.TravelAgency.ProfileName` (array)

  - `ReservationDetail.SpecialService` (array)
    Example: ["SpecialServiceMeal"]

  - `ReservationDetail.SpecialService.@type` (string, required)
    Discriminator classes SpecialServiceID, SpecialServiceBassinet, SpecialServiceBlind, SpecialServiceDeaf, SpecialServiceDPNA, SpecialServiceMeal, SpecialServiceUnaccompaniedMinor, SpecialServiceWheelchairAirlineSupplied, SpecialServiceWheelchairTravelerSupplied
    Example: "SpecialService"

  - `ReservationDetail.SpecialService.id` (string)
    Internal Id

  - `ReservationDetail.SpecialService.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.SpecialService.AppliesTo` (object)
    In a request, used to apply a feature to a specific Offer, Product, or Segment. In a response, returned for Special Instruction and Associated Remarks.

  - `ReservationDetail.SpecialService.Status` (object)

  - `ReservationDetail.SpecialService.Status.value` (string)
    Status returned in a response for a two or more phase commitment process
    Enum: "Pending", "Confirmed", "Cancelled", "Rejected", "Requested"

  - `ReservationDetail.SpecialService.Status.supplierText` (string)
    Supplier status text
    Example: "Active/In-active"

  - `ReservationDetail.SpecialService.Status.code` (string)
    Special service status code
    Example: "NN"

  - `ReservationDetail.SpecialService.ServiceAnimalType` (string)
    The type of service animal accompanying the Traveler. If no service animal leave blank.
    Example: "Horse"

  - `ReservationDetail.SpecialService.TravelerIdentifier` (object)
    Traveler Identifier object.

  - `ReservationDetail.SpecialService.Quantity` (integer)
    Example: 1

  - `ReservationDetail.SpecialService.FreeText` (string)
    Example: "NO SEAFOOD"

  - `ReservationDetail.SpecialService.SSRCode` (string)
    Example: "SPML"

  - `ReservationDetail.SpecialService.Carrier` (string)
    For unassociated SSRs use carrier to instruct which airline to send the service information to
    Example: "BA"

  - `ReservationDetail.Preference` (object)

  - `ReservationDetail.Preference.@type` (string, required)
    Discriminator classes PreferenceID, Preference, PreferenceAirSeat or PreferenceRailSeat
    Example: "Preference"

  - `ReservationDetail.Preference.id` (string)

  - `ReservationDetail.Preference.AppliesTo` (object)
    In a request, used to apply a feature to a specific Offer, Product, or Segment. In a response, returned for Special Instruction and Associated Remarks.

  - `ReservationDetail.Preference.TravelerIdentifier` (object)
    Traveler Identifier object.

  - `ReservationDetail.OrganizationLoyaltyProgram` (array)

  - `ReservationDetail.OrganizationLoyaltyProgram.@type` (string, required)
    Discriminator classes OrganizationLoyaltyProgramID or OrganizationLoyaltyProgram
    Example: "OrganizationLoyaltyProgramID"

  - `ReservationDetail.OrganizationLoyaltyProgram.id` (string)

  - `ReservationDetail.OrganizationLoyaltyProgram.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.OrganizationLoyaltyProgram.Supplier` (string, required)
    The supplier of the loyalty program
    Example: "Air Canada"

  - `ReservationDetail.OrganizationLoyaltyProgram.LoyaltyIdentifier` (string, required)
    Loyalty Identifier
    Example: "LP029381"

  - `ReservationDetail.ReservationDisplaySequence` (object)

  - `ReservationDetail.ReservationDisplaySequence.@type` (string, required)
    Discriminator classes ReservationDisplaySequence only
    Example: "ReservationDisplaySequence"

  - `ReservationDetail.ReservationDisplaySequence.DisplaySequence` (array)

  - `ReservationDetail.ReservationDisplaySequence.DisplaySequence.@type` (string, required)
    Discriminator
    Example: "DisplaySequence"

  - `ReservationDetail.ReservationDisplaySequence.DisplaySequence.displaySequence` (integer, required)
    The sequence the products are to be displayed for sequential date ordering. Data type has been corrected from string to integer in v11.24
    Example: 1

  - `ReservationDetail.ReservationDisplaySequence.DisplaySequence.OfferRef` (string, required)
    Offer reference

  - `ReservationDetail.ReservationDisplaySequence.DisplaySequence.ProductRef` (string)
    Product reference. If blank, display sequence applies to all products within the Offer.

  - `ReservationDetail.ReservationDisplaySequence.DisplaySequence.Sequence` (integer)
    Segment sequence, if blank, display sequence applies to all segments within the product
    Example: 1

  - `ReservationDetail.ReservationDisplaySequence.autoDeleteDateSequence` (integer)
    The sequence of the autoDeleteDate (retention segment) within the Reservation

  - `ReservationDetail.ReservationDisplaySequence.AuxiliaryDisplaySequence` (array)

  - `ReservationDetail.ReservationDisplaySequence.AuxiliaryDisplaySequence.@type` (string, required)
    Discriminator classes AuxillaryDisplaySequence only
    Example: "AuxiliaryDisplaySequence"

  - `ReservationDetail.ReservationDisplaySequence.AuxiliaryDisplaySequence.displaySequence` (integer, required)
    Example: 3

  - `ReservationDetail.ReservationDisplaySequence.AuxiliaryDisplaySequence.CustomAuxiliarySegmentRef` (string)
    Example: "aux_1"

  - `ReservationDetail.ReservationDisplaySequence.UnpricedSegmentDisplaySequence` (array)

  - `ReservationDetail.ReservationDisplaySequence.UnpricedSegmentDisplaySequence.@type` (string, required)
    Discriminator classes UnpricedSegmentDisplaySequence only
    Example: "UnpricedSegmentDisplaySequence"

  - `ReservationDetail.ReservationDisplaySequence.UnpricedSegmentDisplaySequence.displaySequence` (integer, required)
    The order for this segment to be displayed
    Example: 2

  - `ReservationDetail.ReservationDisplaySequence.UnpricedSegmentDisplaySequence.UnpricedFlightSegmentRef` (string, required)
    Reference to the Unpriced Flight Segment
    Example: "s1"

  - `ReservationDetail.AgencyServiceFee` (array)

  - `ReservationDetail.AgencyServiceFee.@type` (string, required)
    Discriminator classes AgencyServiceFeeID or AgencyServiceFee
    Example: "AgencyServiceFee"

  - `ReservationDetail.AgencyServiceFee.id` (string)
    Unique id for this object within a message
    Example: "AgencyServiceFee_1"

  - `ReservationDetail.AgencyServiceFee.ExpiryDate` (string)
    The service fee expiry date. Once expiry date has been reached, the service fee information will only be stored in the ReservationReceipt
    Example: "2022-08-07 12:12:00+00:00"

  - `ReservationDetail.AgencyServiceFee.Description` (string)
    The description of the service fee
    Example: "Flight reservation service fee"

  - `ReservationDetail.AgencyServiceFee.Amount` (object, required)
    A monetary amount, up to 4 decimal places. Decimal place must be included.

  - `ReservationDetail.AgencyServiceFee.Tax` (array)

  - `ReservationDetail.AgencyServiceFee.Tax.value` (number)
    Amount of the tax. Returned as 0 if a tax was marked as exempt with TaxExemption.
    Example: 12.2

  - `ReservationDetail.AgencyServiceFee.Tax.currencyCode` (string)
    A ISO 4217 currency code associated to the value.
    Example: "USD"

  - `ReservationDetail.AgencyServiceFee.Tax.taxCode` (string)
    "Code for the tax. 
For Hotels this is the OTA code."
    Example: "XF2"

  - `ReservationDetail.AgencyServiceFee.Tax.reportingAuthority` (string)
    Identifies the reporting authority such as airport code for XF taxes
    Example: "JFK1"

  - `ReservationDetail.AgencyServiceFee.Tax.purpose` (string)
    Supplier returned description of tax.
    Example: "Fuel surcharge"

  - `ReservationDetail.AgencyServiceFee.Tax.description` (string)
    "Short summary of the tax.
In Air workflows this is returned only for NDC. 
For Hotels this is the OTA tax description."
    Example: "Lodging tax"

  - `ReservationDetail.AgencyServiceFee.Tax.includedInBase` (string)
    Yes , No , Unknown
    Enum: "Yes", "No", "Unknown"

  - `ReservationDetail.AgencyServiceFee.Tax.codeAuthority` (string)
    Not used. Currency Code Authority
    Example: "ISO"

  - `ReservationDetail.AgencyServiceFee.Tax.decimalPlace` (integer)
    Permitted number of decimals. Associated to the currency value.
    Example: 2

  - `ReservationDetail.AgencyServiceFee.Tax.decimalAuthority` (string)
    Not used. Currency decimal authority
    Example: "ISO"

  - `ReservationDetail.AgencyServiceFee.Tax.exemptInd` (boolean)
    Returned if a tax was marked exempt in the Search request with the TaxExemption pricing modifer. GDS only; not supported for NDC. If true, this tax is exempt
    Example: true

  - `ReservationDetail.AgencyServiceFee.Tax.nonRefundableInd` (boolean)
    If true, the tax is non refundable. This indicator is only supported for exchange search and exchange price quote transactions.
    Example: true

  - `ReservationDetail.AgencyServiceFee.Tax.excludedFromTotalPriceInd` (boolean)
    Returned in Hotel APIs when a tax is not included in the TotalPrice. Default behavior is for taxes to be included in TotalPrice.
    Example: true

  - `ReservationDetail.AgencyServiceFee.RelatedDocumentNumber` (object)
    Document Number with additional attributes that the document represents

  - `ReservationDetail.AgencyServiceFee.RelatedDocumentNumber.value` (string)
    Example: "1259900123456"

  - `ReservationDetail.AgencyServiceFee.RelatedDocumentNumber.documentIssuer` (string)
    Document issuer
    Example: "BA"

  - `ReservationDetail.AgencyServiceFee.RelatedDocumentNumber.documentType` (string)
    Document type like EMD, MCO
    Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

  - `ReservationDetail.AgencyServiceFee.RelatedDocumentNumber.travelerIdentifierRef` (string)
    traveler identifier reference

  - `ReservationDetail.AgencyServiceFee.RelatedDocumentNumber.name` (string)
    The name of the Traveler being referenced.

  - `ReservationDetail.AgencyServiceFee.RelatedDocumentNumber.passengerTypeCode` (string)
    The passenger type code of the Traveler being referenced.
    Example: "ADT"

  - `ReservationDetail.AgencyServiceFee.RelatedDocumentNumber.id` (string)
    A locally referenced ID

  - `ReservationDetail.AgencyServiceFee.RelatedDocumentNumber.description` (string)
    Descriptive text used to identify the contents of a target object

  - `ReservationDetail.AgencyServiceFee.RelatedDocumentNumber.uris` (array)
    The URI used to GET the target object in another domain.

  - `ReservationDetail.AgencyServiceFee.TravelerRef` (string)
    Reference to a Traveler within the Reservation that this service fee applies to

  - `ReservationDetail.AgencyServiceFee.OfferRef` (string)
    Reference to an Offer within the Reservation that this service fee applies to

  - `ReservationDetail.autoDeleteDate` (string)
    The auto delete date represents the date that the Reservation will be kept active. Also known as retention segment or retention date.

  - `ReservationDetail.notificationDate` (string)
    The notification date represents the date that the Reservation should be reviewed. Also known as ticket time limit date.

  - `ReservationDetail.CustomAuxiliarySegment` (array)

  - `ReservationDetail.CustomAuxiliarySegment.@type` (string, required)
    Discriminator classes CustomAuxiliarySegmentID or CustomAuxiliarySegment
    Example: "CustomAuxiliarySegment"

  - `ReservationDetail.CustomAuxiliarySegment.id` (string)
    Custom Auxiliary segment reference ID.
    Example: "aux_001"

  - `ReservationDetail.CustomAuxiliarySegment.customAuxiliarySegmentRef` (string)

  - `ReservationDetail.CustomAuxiliarySegment.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.Group` (object)

  - `ReservationDetail.Group.@type` (string, required)
    Discriminator.
    Example: "Group"

  - `ReservationDetail.Group.id` (string)
    Example: "group_001"

  - `ReservationDetail.Group.GroupRef` (string)
    Example: "groupRef_001"

  - `ReservationDetail.Group.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.Group.unallocatedPlaces` (integer, required)
    The amount of unallocated places available which is the difference between the group size and the number of Travelers associated
    Example: 5

  - `ReservationDetail.Group.totalGroupPlaces` (integer, required)
    The total number of passenger places available for this group booking
    Example: 15

  - `ReservationDetail.Group.GroupName` (string, required)
    Example: "EUROPAGLOBALCONFERENCE"

  - `ReservationDetail.UnpricedSegments` (object)
    Top level object for request. Top level container object for response.

  - `ReservationDetail.UnpricedSegments.@type` (string, required)
    Discriminator. No child classes available.
    Example: "UnpricedSegments"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment` (array, required)

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.@type` (string, required)
    Example: "UnpricedFlightsegment"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.id` (string)
    Local identifier within a given message for this FlightSegment
    Example: "unpricedSegment_1"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.sequence` (integer, required)
    Sequence of the leg of the segment.
    Example: 1

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.connectionDuration` (string)
    The actual duration of the connecting FlightSegment
    Example: "PT2H30M"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.passengerQuantity` (integer)
    Number of passengers on this segment.
    Example: 2

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.cabin` (string)
    Specifies the cabin type (e.g. first, business, economy). If sent for Flight Specific Search, this field is ignored.
    Enum: "PremiumFirst", "First", "Business", "PremiumEconomy", "Economy"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.classOfService` (string)
    Class of service of the segment.
    Example: "Y"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.amenityRefs` (array)
    List of amenity references for this flight
    Example: ["amenity_1"]

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.universalProductAttributeRefs` (array)
    List of universal product attributes for this flight.
    Example: "upa_1"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.passiveSegmentStatus` (string)
    If the segment is to be sold as passive enter the passive segment status. AK supplier message sent upon cancel only, BK supplier message sent on book and cancel, YK Information only, no supplier message sent, segment cannot be priced or ticketed.
    Example: "AK"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.IntermediateStopAmenities` (array)

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.IntermediateStopAmenities.@type` (string, required)
    Discriminator. No child classes.
    Example: "IntermediateStopAmenities"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.IntermediateStopAmenities.departureLocation` (string, required)
    The departure location.
    Example: "NYC"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.IntermediateStopAmenities.arrivalLocation` (string, required)
    The arrival location.
    Example: "DEN"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.IntermediateStopAmenities.amenityRefs` (array)
    List of amenity references for this portion of the flight.
    Example: ["amenity_1"]

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.IntermediateStopAmenities.universalProductAttributeRefs` (array)
    List of UPA references for this portion of the flight.
    Example: ["upa_1"]

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.OperationalStatus` (object)
    The operational status of the flight

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.OperationalStatus.value` (string)
    List of operational flight status
    Enum: "FlightBoarding", "FlightCancelled", "FlightDeparted", "FlightPastScheduledDeparture", "NotAvailableUseSearch"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.Flight` (object, required)
    Flight common schema. Used across Air workflow.

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.Flight.@type` (string, required)
    Discriminator. Child classes Flight and FlightDetail.
    Example: "FlightDetail"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.Flight.id` (string)
    Local id within a given message to support referencing this object.
    Example: "126"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.Flight.FlightRef` (string)
    Reference id that corresponds to the flight 'id' in ReferenceListFlight.Flight.
    Example: "s1"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.Flight.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.Co2Actual` (object)
    The actual CO2 emissions of this flight. Measured in kilograms.

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.Co2Actual.value` (number)
    Example: 2.22

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.Co2Actual.measurementType` (string)
    The type of measurement such as width, height, weight
    Enum: "Width", "Height", "Depth", "Weight", "OverallDimension"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.Co2Actual.unit` (string)
    The unit of measure in a code format. Refer to OpenTravel Code List Unit of Measure Code (UOM).
    Enum: "Miles", "Kilometers", "Meters", "Millimeters", "Centimeters", "Yards", "Feet", "Inches", "Pixels", "Block", "Megabytes", "Gigabytes", "Square feet", "Square meters", "Pounds", "Kilograms", "Square inch", "Square yard", "Acre", "Square millimeter", "Square centimeter", "Hectare", "Ounce", "Gram", "Gallons", "Liters", "Kilowatts", "Cubic meters"

  - `ReservationDetail.UnpricedSegments.UnpricedFlightSegment.boundFlightInd` (boolean)
    If present and true, the Segments in this Connection are married.

  - `ReservationDetail.Accounting` (object)
    Defines Accounting information. Used for all DOCI remarks.

  - `ReservationDetail.Accounting.@type` (string, required)
    Discriminator classes AccountingID or Accounting
    Example: "Accounting"

  - `ReservationDetail.Accounting.id` (string)

  - `ReservationDetail.Accounting.AccountingRef` (string)
    Accounting reference

  - `ReservationDetail.Accounting.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.Accounting.dataType` (string)
    Accounting data type. When used as Accounting remark designator the accepted value is DOCI.
    Example: "DateTime"

  - `ReservationDetail.Accounting.template` (string)
    Accounting template
    Example: "Internal Finance template"

  - `ReservationDetail.Accounting.NameValuePair` (array)
    'Defines the type of accounting-specific remark (name) and the remark itself (value). 
Send the following in "name" for each type of remark: DYO - Design Your Own Itinerary FS - Fare Saver CR - Canned Remarks TK - Ticket Number Details AC - Agent, Account, or Branch Details AR - Replace Sign On Code X* - Back Office Accounting Details FT - Free Text
For remark text "value", please note character limits for each type of remark:  DYO - 2 digit, numeric FS - 9 characters total limit in format 1 (all numeric) or format 2 (numeric “–“ two alpha) CR - 42 characters total limit in format (two numeric "." two numeric "." etc) TK - 8 to 12 characters in format 1 (all numeric) or format 2 (numeric “-“ three numeric) AC - 42 characters, alphanumeric and some special characters AR - 10 characters, alphanumeric X* - 84 characters, alphanumeric and some special characters FT - 84 characters, alphanumeric and some special characters'

  - `ReservationDetail.Accounting.NameValuePair.value` (string)
    Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
    Example: "Sunday"

  - `ReservationDetail.Accounting.NameValuePair.id` (string)
    Optional internally referenced id
    Example: "6"

  - `ReservationDetail.Accounting.NameValuePair.name` (string, required)
    Key, categorizing the of type of remark or error.
    Example: "Day1"

  - `ReservationDetail.DocumentOverrides` (array)

  - `ReservationDetail.DocumentOverrides.@type` (string, required)
    Discriminator classes DocumentOverridesID or DocumentOverrides
    Example: "DocumentOverrides"

  - `ReservationDetail.DocumentOverrides.id` (string)
    The reporting number.
    Example: "documentoverrides_001"

  - `ReservationDetail.DocumentOverrides.DocumentOverridesRef` (string)

  - `ReservationDetail.DocumentOverrides.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.DocumentOverrides.OfferIdentifier` (object)
    Travelport-generated offer identifier number.

  - `ReservationDetail.DocumentOverrides.ProductIdentifier` (object)
    Product Identifier class

  - `ReservationDetail.DocumentOverrides.ProductIdentifier.id` (string)
    Local identifier within a given message for this object.
    Example: "product_1"

  - `ReservationDetail.DocumentOverrides.ProductIdentifier.productRef` (string)
    Used to reference another instance of this object in the same payload.
    Example: "product_1"

  - `ReservationDetail.DocumentOverrides.ProductIdentifier.Identifier` (object)
    In next leg search Value from CatalogProductOffering/ProductBrandOptions/ProductBrandOffering/Product/productRef in the Search response for the product to select for the first leg of the itinerary. When sending a second Next Leg Search request in a multi-city search, this value should be the offer for the second leg of the itinerary, and so on for additional O&D pairs.

  - `ReservationDetail.DocumentOverrides.ProductIdentifier.Identifier.value` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
    Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

  - `ReservationDetail.DocumentOverrides.ProductIdentifier.Identifier.authority` (string)
    "Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
    Example: "TVPT"

  - `ReservationDetail.DocumentOverrides.Commissions` (array)

  - `ReservationDetail.DocumentOverrides.Commissions.@type` (string)

  - `ReservationDetail.DocumentOverrides.Commissions.TravelerIdentifierRef` (array)

  - `ReservationDetail.DocumentOverrides.Commissions.Commission` (object, required)
    Commission information. In Air Search commission is returned for GDS only; not supported for NDC. Any commission filed by an airline in a CAT35 fare is returned in PriceBreakdownAir/Commission. The amount is either a percent of the fare component (@type CommissionPercent and the Percent object) or an amount (@type CommissionAmount and the Amount object).

  - `ReservationDetail.DocumentOverrides.Commissions.Commission.@type` (string, required)
    Discriminator. Child classes CommissionAmount or CommissionPercent
    Example: "CommissionAmount"

  - `ReservationDetail.DocumentOverrides.Commissions.Commission.application` (string)
    Type of commission
    Enum: "Full", "Partial", "Non-paying", "No-show", "Adjustment", "Commissionable"

  - `ReservationDetail.DocumentOverrides.Commissions.ApplyTo` (string)
    List of commission Apply
    Enum: "Base", "Fee"

  - `ReservationDetail.DocumentOverrides.DestinationPurpose` (array)

  - `ReservationDetail.DocumentOverrides.DestinationPurpose.@type` (string)
    Example: "DestinationPurpose"

  - `ReservationDetail.DocumentOverrides.DestinationPurpose.destination` (string, required)
    List of destinations
    Enum: "United States of America", "Mexico / Central America / Canal Zone/ Costa Rica", "Islands and Countries of the Caribbean", "South America", "Europe", "Africa", "Middle East / Western Asia", "Asia", "Australia / New Zealand / Pacific Islands", "Canada and Greenland"

  - `ReservationDetail.DocumentOverrides.DestinationPurpose.purpose` (string, required)
    The purpose exposed.
    Enum: "Business", "Pleasure", "Charter Service"

  - `ReservationDetail.DocumentOverrides.Restrictions` (array)

  - `ReservationDetail.DocumentOverrides.Restrictions.@type` (string)

  - `ReservationDetail.DocumentOverrides.Restrictions.TravelerIdentifierRef` (array)

  - `ReservationDetail.DocumentOverrides.Restrictions.Restriction` (array, required)
    Example: ["NON REFUNDABLE/NON ENDORSEABLE"]

  - `ReservationDetail.DocumentOverrides.Restrictions.DocumentType` (string)
    Document type like EMD, MCO
    Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

  - `ReservationDetail.DocumentOverrides.TourCodes` (array)

  - `ReservationDetail.DocumentOverrides.TourCodes.@type` (string)
    Discriminator. No child classes.
    Example: "TourCodes"

  - `ReservationDetail.DocumentOverrides.TourCodes.TravelerIdentifierRef` (array)
    Reference the traveler if the tour code is traveler specific. Leave blank to apply to all travelers.

  - `ReservationDetail.DocumentOverrides.TourCodes.TourCode` (object, required)
    Tour code

  - `ReservationDetail.DocumentOverrides.TourCodes.TourCode.value` (string)
    The actual value of the tour code.

  - `ReservationDetail.DocumentOverrides.TourCodes.TourCode.tourCodeType` (string)
    List of tour code types.
    Enum: "Bulk Tour", "Inclusive Tour"

  - `ReservationDetail.DocumentOverrides.ChangeFeeCollectionMethod` (object)

  - `ReservationDetail.DocumentOverrides.ChangeFeeCollectionMethod.value` (string)
    List of change fee method
    Enum: "EMD", "MCO", "Tax", "Unknown"

  - `ReservationDetail.DocumentOverrides.ChangeFeeCollectionMethod.code` (string, required)
    The code value
    Example: "f2142"

  - `ReservationDetail.DocumentOverrides.ChangeFeeCollectionMethod.subCode` (string)
    The subcode value
    Example: "631b"

  - `ReservationDetail.DocumentOverrides.ChangeFeeCollectionMethod.description` (string)
    The description value
    Example: "Change fee collection method"

  - `ReservationDetail.DocumentOverrides.ChangeFeeCollectionMethod.changeFeeIssuedSeparatelyInd` (boolean)
    if true, the change fee will be issued as a separate transaction to the residual amount
    Example: true

  - `ReservationDetail.DocumentOverrides.ChangeFeeCollectionMethod.taxIncludedInBaseAmountInd` (boolean)
    If true, the tax  on the fee will be included in the base fee amount and sent as a single value to the supplier for fulfilment
    Example: true

  - `ReservationDetail.DocumentOverrides.NetRemitInfo` (object)

  - `ReservationDetail.DocumentOverrides.NetRemitInfo.@type` (string)
    Example: "NetRemitInfo"

  - `ReservationDetail.DocumentOverrides.NetRemitInfo.CarCode` (string)
    The CAR code or deal code applied to this product for use in net remit.
    Example: "ACAR"

  - `ReservationDetail.DocumentOverrides.NetRemitInfo.ValueCode` (string)
    The Value code applied to this product for use in net remit
    Example: "D1000"

  - `ReservationDetail.DocumentOverrides.NetRemitInfo.ActualSellingFare` (number)
    The actual selling fare which will override the Offer base fare on the document
    Example: 100.5

  - `ReservationDetail.DocumentOverrides.NetRemitInfo.NetBaseAmount` (object)
    The base amount of a ticket price or net price that is filed in local currency

  - `ReservationDetail.DocumentOverrides.NetRemitInfo.NetBaseAmount.value` (number)
    Filed amount value
    Example: 43.3422

  - `ReservationDetail.DocumentOverrides.NetRemitInfo.NetBaseAmount.currencyCode` (string)
    Filed amount currency code
    Example: "USD"

  - `ReservationDetail.DocumentOverrides.NetRemitInfo.NetBaseAmount.codeAuthority` (string)
    Filed amount currency code authority
    Example: "Australian Dollar"

  - `ReservationDetail.DocumentOverrides.NetRemitInfo.NetBaseAmount.decimalPlace` (integer, required)
    ISO 4217 standard has a different number of decimals
    Example: 3

  - `ReservationDetail.DocumentOverrides.NetRemitInfo.NetBaseAmount.decimalAuthority` (string)
    ISO 4217 standard decimal authority
    Example: "ISO 4217"

  - `ReservationDetail.DocumentOverrides.NetRemitInfo.ClientDiscountCode` (string)
    The client discount code applied to this product for net remit.
    Example: "DEF456"

  - `ReservationDetail.DocumentOverrides.TicketDesignators` (array)

  - `ReservationDetail.DocumentOverrides.TicketDesignators.@type` (string, required)
    Discriminator class TicketDesignators only

  - `ReservationDetail.DocumentOverrides.TicketDesignators.TravelerIdentifierRef` (array)

  - `ReservationDetail.DocumentOverrides.TicketDesignators.TicketDesignator` (string, required)

  - `ReservationDetail.DocumentOverrides.InvoiceFareAmount` (object)
    A monetary amount, up to 4 decimal places. Decimal place must be included.

  - `ReservationDetail.DocumentOverrides.residualValueAsEvenExchangeMIRInd` (boolean)
    Report an exchange with residual value transaction as an Even exchange in the MIR.
    Example: true

  - `ReservationDetail.DocumentOverrides.obFeeExemptInd` (boolean)
    If true, the associated Offer is exempt from OB Payment Card Fees.
    Example: true

  - `ReservationDetail.CustomRule` (object)

  - `ReservationDetail.CustomRule.PseudoCityCode` (string)
    The PCC that the custom rule belongs to

  - `ReservationDetail.CustomRule.RuleRecord` (array)

  - `ReservationDetail.CustomRule.RuleRecord.@type` (string, required)
    Discriminator class RuleRecord only

  - `ReservationDetail.CustomRule.RuleRecord.sequence` (integer)
    The sequence of the RuleRecord line

  - `ReservationDetail.CustomRule.RuleRecord.RuleRecordName` (string, required)
    The name of the rule record
    Example: "CTCM"

  - `ReservationDetail.CustomRule.RuleRecord.RuleText` (array)

  - `ReservationDetail.CustomRule.RuleRecord.RuleText.@type` (string, required)
    Discriminator class RuleText only

  - `ReservationDetail.CustomRule.RuleRecord.RuleText.sequence` (integer, required)
    The sequence of the RuleText line

  - `ReservationDetail.CustomRule.RuleRecord.RuleText.StringText` (string, required)

  - `ReservationDetail.CustomRule.@type` (string, required)
    Discriminator classes CustomRuleID or CustomRule

  - `ReservationDetail.CustomRule.id` (string)
    Custom rule id reference ID.

  - `ReservationDetail.CustomRule.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.GroupName` (string)
    Group name will be passed in the new Group object

  - `ReservationDetail.ShoppingCart` (object)

  - `ReservationDetail.ShoppingCart.@type` (string)
    Example: "ShoppingCart"

  - `ReservationDetail.ShoppingCart.Product` (array)

  - `ReservationDetail.ShoppingCart.Product.@type` (string, required)
    Discriminator. Air Search child classes are ProductAir and ProductAncillary. Exchange Search child class is ProductAir. Ancillary Search is ProductAncillary. Seat Map child class isProductSeatAvailability. Air Price child classes are ProductAir and ProductAncillary. Hotel Availability child classes are ProductHospitality and ProductHospitalityOffer. Hotel Rules and HotelReservation child classes are ProductHospitality. All Vehicle APIs are ProductVehicle and ProductAncillaryVehicle. Reservation and Reservation Workbench child classes are ProductAir, ProductAncillary, ProductHospitality, ProductVehicle, and ProductAncillaryVehicle.
    Example: "ProductAir"

  - `ReservationDetail.ShoppingCart.Product.id` (string)
    Local id within a given message to support referencing this object.
    Example: "product_1"

  - `ReservationDetail.ShoppingCart.Product.productRef` (string)
    Reference id that corresponds to the product 'id' in ReferenceListProduct.Product. To find flight details for a product, use the ProductRef id to identify the product in ReferenceListProduct.Product, and use the Flight id's (e.g., s3, s4) to match to flight information in ReferenceListFlight.Flight.
    Example: "product_1"

  - `ReservationDetail.ShoppingCart.Product.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationDetail.ShoppingCart.Product.Quantity` (integer)
    "The quantity of the product. 
For Hotel Create Reservation (Full Payload) request, the number of rooms requested; 1-9 inclusive supported. If not provided, default is 1. For Hotel responses, the number of rooms currently available matching this rate.
In Air Search quantity represents the number of seats available for that Product. If the Product has connecting flights, Quantity returns the lowest number available. For example, if the first flight has 9 seats in Y class and the connecting flight has 4 seats in Y class, Quantity returns a value of 4."
    Example: 2

  - `ReservationDetail.ShoppingCart.Product.totalDuration` (string)
    Total duration of the combined segments in hours (H) and minutes (M). ISO 8601 format.
    Example: "PT2H40M"

  - `ReservationDetail.ShoppingCart.Product.FlightSegment` (array, required)
    One instance for each flight segment in the product.

  - `ReservationDetail.ShoppingCart.Product.FlightSegment.@type` (string)
    Discriminator. No child classes.
    Example: "FlightSegment"

  - `ReservationDetail.ShoppingCart.Product.FlightSegment.id` (string)
    Local identifier within a given message for this object.
    Example: "flightSegment_01"

  - `ReservationDetail.ShoppingCart.Product.FlightSegment.sequence` (integer, required)
    Order of the flight segment. e.g. 1 for the first segment on the leg.
    Example: 1

  - `ReservationDetail.ShoppingCart.Product.FlightSegment.connectionDuration` (string)
    When a flight connection exists, this is the lapsed time between the connecting flights (in minutes). ISO 8601 format.
    Example: "PT1H3M"

  - `ReservationDetail.ShoppingCart.Product.FlightSegment.amenityRefs` (array)
    If RouteHappy flight amenities were requested (includeFlightAmenitiesInd=true), amenityRefs is returned. Cross-reference the amenityRef with the Amenity 'id' in ReferenceListAmenity.Amenity for detailed information.
    Example: ["[\"amenity_1\",\"amenity_2\"]"]

  - `ReservationDetail.ShoppingCart.Product.FlightSegment.universalProductAttributeRefs` (array)
    If universal product attributes (UPAs) for RouteHappy data were requested (includeUniversalProductAttributesInd=true) along with RouteHappy flight amenities, universalProductAttributeRefs is returned. Cross-reference the universalProductAttributeRef with the universalProductAttribute 'id' in ReferenceListUniversalProductAttribute.UniversalProductAttribute. UPAs provide images, icons, and URLs as provided by ATPCO. RouteHappy data must have also been requested per amenityRefs above.
    Example: ["[\"upa_1\",\"upa_2\"]"]

  - `ReservationDetail.ShoppingCart.Product.FlightSegment.Flight` (object, required)
    Flight common schema. Used across Air workflow.

  - `ReservationDetail.ShoppingCart.Product.FlightSegment.IntermediateStopAmenities` (array)

  - `ReservationDetail.ShoppingCart.Product.FlightSegment.OperationalStatus` (object)
    The operational status of the flight

  - `ReservationDetail.ShoppingCart.Product.FlightSegment.boundFlightsInd` (boolean)
    Indicates flight segments are married/bound. When 'true', indicates the flight segments in a single or double connection must be sold together. When true, the indicator is returned for all leading segments on one leg of the flight, and not returned for the last segment of the bound flight leg journey, indicating where the bound flights end. For example, if an O&D pair has 3 flight segments, boundFlightsInd is returned for the first two segments on that leg. If the segments are not bound, boundFlightsInd is false and not returned. GDS only; not supported for NDC.
    Example: true

  - `ReservationDetail.ShoppingCart.Product.FlightSegment.CO2Actual` (object)
    Returned if requested 'includCo2EmissionsDataInd'. Actual carbon emissions for this specific flight. CO2 emissions are measured as a weight in kilograms.

  - `ReservationDetail.ShoppingCart.Product.FlightSegment.CO2Actual.value` (number)
    Example: 2.22

  - `ReservationDetail.ShoppingCart.Product.FlightSegment.CO2Actual.measurementType` (string)
    The type of measurement such as width, height, weight
    Enum: "Width", "Height", "Depth", "Weight", "OverallDimension"

  - `ReservationDetail.ShoppingCart.Product.FlightSegment.CO2Actual.unit` (string)
    The unit of measure in a code format. Refer to OpenTravel Code List Unit of Measure Code (UOM).
    Enum: "Miles", "Kilometers", "Meters", "Millimeters", "Centimeters", "Yards", "Feet", "Inches", "Pixels", "Block", "Megabytes", "Gigabytes", "Square feet", "Square meters", "Pounds", "Kilograms", "Square inch", "Square yard", "Acre", "Square millimeter", "Square centimeter", "Hectare", "Ounce", "Gram", "Gallons", "Liters", "Kilowatts", "Cubic meters"

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight` (array, required)

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.@type` (string)
    Discriminator. No child classes.
    Example: "PassengerFlight"

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.passengerQuantity` (integer)
    Number of passengers of the specified passenger type code.
    Example: 26

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.passengerTypeCode` (string)
    Passenger type code applicable to the offer/offering. This may be different to the requested passenger type code sent in PassengerCriteria.
    Example: "ADT"

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct` (array)

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.@type` (string)
    Discriminator. No child classes.
    Example: "FlightProduct"

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.segmentSequence` (array, required)
    The Segment sequence which correlates with the sequence in FlightSegment.
    Example: [1]

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.classOfService` (string)
    The class of service code.
    Example: "F"

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.cabin` (string)
    Specifies the cabin type (e.g. first, business, economy). If sent for Flight Specific Search, this field is ignored.
    Enum: "PremiumFirst", "First", "Business", "PremiumEconomy", "Economy"

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.fareBasisCode` (string)
    Fare basis code for the flight. For NDC, also returns the ticket designator after a slash (/) following the fare basis code. GDS ticket designators are returned in ticketDesignator per below.
    Example: "YEE1Y"

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.fareType` (string)
    Indicates the type of fare that applies to this Offer/Offering. NetFare is not supported for NDC.
    Enum: "PublicFare", "AgencyPrivateFare", "AirlinePrivateFare", "NetFare"

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.carCode` (string)
    The car code or deal code. Net remit.
    Example: "P1234"

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.valueCode` (string)
    The value code. Net remit.
    Example: "365"

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.Brand` (object)
    Brand ID parent class

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.CustomerLoyaltyCredit` (array)

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.ClassOfServiceAvailability` (array)

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.stopoverPriced` (string)
    Yes , No , Unknown
    Enum: "Yes", "No", "Unknown"

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.ticketDesignator` (string)
    Returns the ticket designator for GDS. The ticket designator is a code used by airlines to indicate the type of discount applied to a fare. An airline may have a specific ticket designator used to differentiate its fares, which may also signify anything from private fares, wholesale, promotion, or discounted fares. GDS only; not supported for NDC. (NDC ticket designators are returned in fareBasisCode per above.)
    Example: "BB5662Y"

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.fareTypeCode` (string)
    Provides the ATPCO defined fare type code for unbundled fares when the Search response includes unbundled fares.
    Example: "ERU"

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.FareQualifierString` (string)
    NDC only. Not supported for GDS. Fare qualifier of a private leisure fares.
    Example: "[\"Tour\"]"

  - `ReservationDetail.ShoppingCart.Product.PassengerFlight.FlightProduct.FareQualifier` (object)
    deprecated - do not use

## Response 200 fields (application/json):

  - `ReservationResponse` (object)
    The response of Create Reservation (Reference Payload), Create Reservation (Full Payload), Sync Reservation, Modify/Add Reservation, Create/Modify Passive Reservation, Retrieve Reservation, or Cancel Reservation endpoint requests.

  - `ReservationResponse.Reservation` (object)

  - `ReservationResponse.Reservation.@type` (string, required)
    Discriminator classes ReservationID, Reservation or ReservationDetail
    Example: "Reservation"

  - `ReservationResponse.Reservation.id` (string)
    Internal identifier for the response.
    Example: "REF12873"

  - `ReservationResponse.Reservation.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.@type` (string)
    Example: "response"

  - `ReservationResponse.transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `ReservationResponse.traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `ReservationResponse.correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `ReservationResponse.reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `ReservationResponse.Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `ReservationResponse.Result.@type` (string)
    Discriminator class Result only
    Example: "Result"

  - `ReservationResponse.Result.status` (string)
    The status of an error or warning
    Enum: "Not processed", "Incomplete", "Complete", "Unknown"

  - `ReservationResponse.Result.Error` (array)
    A list of error information returned at the provider level for a response.

  - `ReservationResponse.Result.Error.@type` (string, required)
    Discriminator classes Error or ErrorDetail
    Example: "ErrorDetail"

  - `ReservationResponse.Result.Error.Message` (string)
    The Travelport standardized error or warning message
    Example: "No flights found."

  - `ReservationResponse.Result.Error.NameValuePair` (array)

  - `ReservationResponse.Result.Error.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Result.Warning` (array)
    A list of warning information returned at the provider level for a response.

  - `ReservationResponse.Result.Warning.@type` (string, required)
    Discriminator classes Warning or WarningDetail
    Example: "WarningDetail"

  - `ReservationResponse.Result.Warning.Message` (string)
    The Travelport standardized error or warning message
    Example: "Customer Loyalty could not be applied."

  - `ReservationResponse.Result.Warning.NameValuePair` (array)

  - `ReservationResponse.Result.Warning.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReservationResponse.NextSteps.baseURI` (string, required)
    The base portion of the uri in order to shorten the uris in the individual steps

  - `ReservationResponse.NextSteps.id` (string)
    Optional internally referenced id
    Example: "5"

  - `ReservationResponse.NextSteps.NextStep` (array, required)

  - `ReservationResponse.NextSteps.NextStep.value` (string)
    Example: "www.resourcelocation.com"

  - `ReservationResponse.NextSteps.NextStep.id` (string)
    Identifier for the Next Step
    Example: "2"

  - `ReservationResponse.NextSteps.NextStep.action` (string, required)
    The action this next step is intended to achieve
    Example: "cancel"

  - `ReservationResponse.NextSteps.NextStep.method` (string, required)
    Describes the set of potential methods that can be taken after an operation.
    Enum: "GET", "DELETE", "PUT", "POST"

  - `ReservationResponse.NextSteps.NextStep.description` (string)
    Additional clarification for the next step
    Example: "remove offer from the order"

  - `ReservationResponse.ReferenceList` (array)

  - `ReservationResponse.ReferenceList.@type` (string, required)
    Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
    Example: "ReferenceListFlight"

  - `ReservationResponse.ReferenceList.id` (string)
    Uniquely identifies for the Reference List

  - `ReservationResponse.CurrencyRateConversion` (array)

  - `ReservationResponse.CurrencyRateConversion.@type` (string)

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.TargetCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate` (object, required)
    Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.value` (number)

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
    Contextual rate authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
    Rate as of
    Example: "2026-08-07 12:12:00+00:00"

  - `ReservationResponse.Pagination` (object)
    Pagination object used when result sets span across a number of pages.

  - `ReservationResponse.Pagination.@type` (string, required)
    Example: "Pagination"

  - `ReservationResponse.Pagination.page` (integer, required)
    The current page number of the full result set
    Example: 1

  - `ReservationResponse.Pagination.pageSize` (integer, required)
    The total number of items on this page
    Example: 20

  - `ReservationResponse.Pagination.totalPages` (integer, required)
    The total number of pages in this result set
    Example: 5

  - `ReservationResponse.Pagination.totalItems` (integer, required)
    The total number of pages in this result set
    Example: 100

## Response 400 fields (application/json):

  - `@type` (string)
    Example: "response"

  - `transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReferenceList` (array)

  - `CurrencyRateConversion` (array)

  - `Pagination` (object)
    Pagination object used when result sets span across a number of pages.


# Create hotel reservation (Reference payload).

Use the Create Reservation Reference Payload request to book a room using a cached offer from either a preceding Availability or SearchComplete response. The reference payload request sends an offer ID plus traveler details and both form of payment and payment information. NOTE: Results from Availability and SearchComplete are stored in cache for 30 minutes. If the offers expire before you create a reservation, you must send a new request before booking. The Create Reservation Full Payload response uses the same format as the Reference Payload response. The only difference is that the reference payload response returns Reservation/id, which is the offer ID sent in that request. The full payload response does not return this information."
Note for query parameters- Hotel APIs that create a new reservation or add to an existing one verify the reservation request with the guarantee type and price returned in preceding workflow steps. If there is any difference, the API does not yet create the reservation but instead returns an error to notify about the change.  To accept the change, send the request a second time with the applicable query parameter/s (acceptPriceChangeInd and/or acceptGuaranteeChangeInd). Do not send either of these query parameters in the initial request.  If you do not want to proceed with the booking because of the changes, you are not required to send a second booking request with the false value(s). You can simply let these offers expire.

Endpoint: POST /hotel/book/reservations/build
Version: 11.33.0
Security: bearerAuth

## Query parameters:

  - `acceptPriceChangeInd` (boolean)
    Send with true to accept any difference in the current sell price from the total price returned in an earlier response. Default is false; terminates the sell process without booking.

  - `acceptGuaranteeChangeInd` (boolean)
    Send with true to accept any difference in the guarantee type from the guarantee type returned in an earlier response. (The guarantee types checked for differences are guarantee required, deposit required, prepay required.) Default is false; terminates the sell process without booking.

  - `applyStrictReservationCommentValidationInd` (boolean)
    If true, the user expects that the sell request will be failed if any of the requested reservation comments fail.  If indicator is not sent the service will default to false.

  - `roomPerTravelerInd` (boolean)
    If true, the multi-room request will be sold as a separate reservation per Traveler. If indicator is not sent the service will create a single reservation for all travelers. Default is false.

## Header parameters:

  - `TraceId` (string)
    Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response.
    Example: "TraceID_123456789"

  - `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
    Identifies the Travelport access group with which the caller is associated
    Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

  - `TVP-PCC-Core` (string)
    Allows user to pass PCC instead of Access Group ID
    Example: "DU7_1G"

  - `TVP-Correlation-Id` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.
    Example: "382c74c3-721d-4f34-80e5-57657b6cbc27"

  - `Accept-Encoding` (string, required)
    Comma-separated list of acceptable encodings like gzip and/or deflate
    Example: "gzip, deflate"

## Request fields (application/json):

  - `ReservationQueryBuild` (object)
    Used for a Create Hotel Reservation (Reference Payload) request. Defines a request to create a hotel reservation using selected hotel offer data together with traveler and payment details. This request typically follows Hotel Availability, Rules, or SearchComplete and is sent to finalize a booking. If the price or guarantee type changes from the preceding response, the request may need to be sent again with the applicable acceptance indicator.

  - `ReservationQueryBuild.@type` (string, required)
    Discriminator classes ReservationQueryBuild only
    Example: "ReservationQueryBuild"

  - `ReservationQueryBuild.ReservationBuild` (object, required)
    Defines the reservation build details used to create a hotel reservation from a cached offer, including traveler, payment, and related booking details.

  - `ReservationQueryBuild.ReservationBuild.@type` (string, required)
    Discriminator classes ReservationBuildFromCatalogOffering, ReservationBuildFromCatalogOfferings, ReservationBuildfromCatalogOfferingsAir,  ReservationBuildFromCatalogProductOfferings, ReservationBuildFromProducts, ReservationBuildVehicle
    Example: "ReservationBuildFromProducts"

  - `ReservationQueryBuild.ReservationBuild.autoDeleteDate` (string)
    Creates a retention segment to keep the host PNR alive until this date.
    Example: "2011-01-24"

  - `ReservationQueryBuild.ReservationBuild.receivedFrom` (string)
    Allows the user to specify who the request was received from.
    Example: "TW"

  - `ReservationQueryBuild.ReservationBuild.issuance` (string)
    Mid/BackOffice instructions.
    Enum: "Ticket", "BackOffice", "All", "Invoice"

  - `ReservationQueryBuild.ReservationBuild.Traveler` (array, required)

  - `ReservationQueryBuild.ReservationBuild.Traveler.@type` (string, required)
    Discriminator classes TravelerID or Traveler
    Example: "Traveler"

  - `ReservationQueryBuild.ReservationBuild.Traveler.id` (string)

  - `ReservationQueryBuild.ReservationBuild.Traveler.TravelerRef` (string)

  - `ReservationQueryBuild.ReservationBuild.Traveler.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationQueryBuild.ReservationBuild.Traveler.Identifier.value` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
    Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

  - `ReservationQueryBuild.ReservationBuild.Traveler.Identifier.authority` (string)
    "Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
    Example: "TVPT"

  - `ReservationQueryBuild.ReservationBuild.FormOfPayment` (array)

  - `ReservationQueryBuild.ReservationBuild.FormOfPayment.@type` (string, required)
    Discriminator classes FormOfPaymentID, FormOfPaymentBSP, FormOfPaymentCash, FormOfPaymentCheck, FormOfPaymentDocument, FormOfPaymentFlightPass, FormOfPaymentForfeit, FormOfPaymentInvoice, FormOfPaymentPaymentCard, FormOfPaymentVirtualPaymentAccount, FormOfPaymentWaiverCode
    Example: "FormOfPaymentPaymentCard"

  - `ReservationQueryBuild.ReservationBuild.FormOfPayment.id` (string)
    Form of Payment reference ID.

  - `ReservationQueryBuild.ReservationBuild.FormOfPayment.FormOfPaymentRef` (string)

  - `ReservationQueryBuild.ReservationBuild.FormOfPayment.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationQueryBuild.ReservationBuild.Payment` (array)

  - `ReservationQueryBuild.ReservationBuild.Payment.@type` (string, required)
    Discriminator classes PaymentID or Payment
    Example: "Payment"

  - `ReservationQueryBuild.ReservationBuild.Payment.id` (string)
    Customer-assigned identifier for the payment.

  - `ReservationQueryBuild.ReservationBuild.Payment.PaymentRef` (string)
    Customer-assigned name for the payment.

  - `ReservationQueryBuild.ReservationBuild.Payment.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationQueryBuild.ReservationBuild.ReservationComment` (array)

  - `ReservationQueryBuild.ReservationBuild.ReservationComment.@type` (string, required)
    Discriminator classes ReservationCommentID or ReservationComment
    Example: "ReservationComment"

  - `ReservationQueryBuild.ReservationBuild.ReservationComment.id` (string)
    Local identifier within a given message for this object.

  - `ReservationQueryBuild.ReservationBuild.PrimaryContact` (array)

  - `ReservationQueryBuild.ReservationBuild.PrimaryContact.@type` (string, required)
    Discriminator classes PrimaryContactID or PrimaryContact
    Example: "PrimaryContact"

  - `ReservationQueryBuild.ReservationBuild.PrimaryContact.id` (string)

  - `ReservationQueryBuild.ReservationBuild.PrimaryContact.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationQueryBuild.ReservationBuild.SpecialService` (array)

  - `ReservationQueryBuild.ReservationBuild.SpecialService.@type` (string, required)
    Discriminator classes SpecialServiceID, SpecialServiceBassinet, SpecialServiceBlind, SpecialServiceDeaf, SpecialServiceDPNA, SpecialServiceMeal, SpecialServiceUnaccompaniedMinor, SpecialServiceWheelchairAirlineSupplied, SpecialServiceWheelchairTravelerSupplied
    Example: "SpecialService"

  - `ReservationQueryBuild.ReservationBuild.SpecialService.id` (string)
    Internal Id

  - `ReservationQueryBuild.ReservationBuild.SpecialService.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationQueryBuild.ReservationBuild.Accounting` (object)

  - `ReservationQueryBuild.ReservationBuild.Accounting.@type` (string, required)
    Discriminator classes AccountingID or Accounting
    Example: "Accounting"

  - `ReservationQueryBuild.ReservationBuild.Accounting.id` (string)

  - `ReservationQueryBuild.ReservationBuild.Accounting.AccountingRef` (string)
    Accounting reference

  - `ReservationQueryBuild.ReservationBuild.Accounting.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationQueryBuild.ReservationBuild.DocumentOverrides` (array)

  - `ReservationQueryBuild.ReservationBuild.DocumentOverrides.@type` (string, required)
    Discriminator classes DocumentOverridesID or DocumentOverrides
    Example: "DocumentOverrides"

  - `ReservationQueryBuild.ReservationBuild.DocumentOverrides.id` (string)
    The reporting number.
    Example: "documentoverrides_001"

  - `ReservationQueryBuild.ReservationBuild.DocumentOverrides.DocumentOverridesRef` (string)

  - `ReservationQueryBuild.ReservationBuild.DocumentOverrides.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationQueryBuild.ReservationBuild.Notification` (array)

  - `ReservationQueryBuild.ReservationBuild.Notification.QueueNumber` (array)

  - `ReservationQueryBuild.ReservationBuild.Notification.QueueNumber.value` (integer)
    Example: 10

  - `ReservationQueryBuild.ReservationBuild.Notification.QueueNumber.category` (string)
    The Queue Category
    Example: "CAE"

  - `ReservationQueryBuild.ReservationBuild.Notification.QueueNumber.subCategory` (string)
    Date range subCategory
    Example: "Date Range sub-category"

  - `ReservationQueryBuild.ReservationBuild.Notification.QueueNumber.overridePCC` (string)
    Use PCC to override to queue the Reservation to another PCC
    Example: "0XS4"

  - `ReservationQueryBuild.ReservationBuild.Notification.Date` (string)
    The notification date is equivalent to ticket time limit and will place the Reservation on the defined queue for the date specified. Sending a new notification date at commit step will update the existing notificationDate. Sending 000/00/00 will delete an existing notificationDate.

  - `ReservationQueryBuild.ReservationBuild.Notification.Comment` (string)
    Optional ticket time limit text string.
    Example: "Optional free text"

  - `ReservationQueryBuild.ReservationBuild.Preference` (array)

  - `ReservationQueryBuild.ReservationBuild.Preference.@type` (string, required)
    Discriminator classes PreferenceID, Preference, PreferenceAirSeat or PreferenceRailSeat
    Example: "Preference"

  - `ReservationQueryBuild.ReservationBuild.Preference.id` (string)

  - `ReservationQueryBuild.ReservationBuild.ReceiptConfirmation` (object)
    Specifies the payment or guarantee information for a reservation. If zero dollars and in the amount then the payment information acts as a guarantee.

  - `ReservationQueryBuild.ReservationBuild.ReceiptConfirmation.@type` (string, required)
    Discriminator classes ReceiptID, ReceiptConfirmation, ReceiptConfirmationDivide, ReceiptCancellation, ReceiptPayment
    Example: "ReceiptConfirmation"

  - `ReservationQueryBuild.ReservationBuild.ReceiptConfirmation.id` (string)
    The verification number.
    Example: "3493289238"

  - `ReservationQueryBuild.ReservationBuild.ReceiptConfirmation.ReceiptRef` (string)
    Example: "6773 2389 2239 2832"

  - `ReservationQueryBuild.ReservationBuild.ReceiptConfirmation.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationQueryBuild.ReservationBuild.ReceiptConfirmation.dateTime` (string)
    Receipt date time
    Example: "2022-08-07 12:12:00+00:00"

  - `ReservationQueryBuild.ReservationBuild.ReceiptConfirmation.OfferRef` (array)
    List of offer reference ids for the offer(s) returned in the Reservation response.

  - `ReservationQueryBuild.ReservationBuild.ReceiptConfirmation.ProductRef` (string)
    Reference of product

  - `ReservationQueryBuild.ReservationBuild.ReceiptConfirmation.Confirmation` (object)
    Confirmation details, such as those found in a Receipt.

  - `ReservationQueryBuild.ReservationBuild.ReceiptConfirmation.Confirmation.@type` (string, required)
    Discriminator classes ConfirmationHold or ConfirmationVehicle
    Example: "ConfirmationHold"

  - `ReservationQueryBuild.ReservationBuild.ReceiptConfirmation.SegmentSequenceList` (array)
    The segmentSequenceList the ReceiptConfirmation applies to

  - `ReservationQueryBuild.ReservationBuild.TravelAgency` (object)
    An optional object to define travel agency information.

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.@type` (string, required)
    Discriminator classes TravelAgency, TravelAgencyID, or TravelAgencyDetail
    Example: "TravelAgencyDetail"

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.id` (string)
    Simple xsd id, not for external use
    Example: "2"

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.TravelOrganizationRef` (string)
    An organization that has a name and a structure and members and directly works in the travel industry
    Example: "TravelAgency_1"

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.organizationType` (string)
    The type of organization such as an Agency, Branch, Company, Supplier, Provider
    Enum: "TravelAgency", "AgencyBranch", "LoyaltyProgram", "IdDocumentIssuer", "TravelSupplier", "TravelProvider", "Regulatory"

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.OrganizationName` (object, required)
    Identifies a company by name

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.OrganizationName.value` (string)

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.OrganizationName.id` (string)
    Use this id to internally identify this company in NextSteps
    Example: "2"

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.OrganizationName.division` (string)
    The division name or ID with which the contact is associated
    Example: "Travel Division"

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.OrganizationName.department` (string)
    The department name or ID with which the contact is associated
    Example: "Adventure department"

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.OrganizationName.shortName` (string)
    Used to provide the company common name
    Example: "Adventure Inc"

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.OrganizationName.code` (string)
    Identifies a company by the company code
    Example: "AI"

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.OrganizationName.codeContext` (string)
    Identifies the context of the identifying code, such as DUNS, IATA, or internal code
    Example: "ISO"

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.OrganizationName.systemOfRecord` (array)
    The system(s) that maintain the data
    Example: ["MB"]

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.CorporateCode` (string)
    A reference assigned by the Travel Agency to identify the corporate organization
    Example: "Air Agency"

  - `ReservationQueryBuild.ReservationBuild.TravelAgency.ProfileName` (array)

  - `ReservationQueryBuild.ReservationBuild.scheduleChangeAcceptedInd` (boolean)
    If true, the schedule change has been accepted.
    Example: true

  - `ReservationQueryBuild.ReservationBuild.overrideMCTInd` (boolean)
    If true, the minimum connection time warning will be ignored and the Reservation created.
    Example: true

  - `ReservationQueryBuild.ReservationBuild.errorWhenScheduleChangesInd` (boolean)
    If true, an error will be returned when the flight schedule changes during commit processing
    Example: true

  - `ReservationQueryBuild.ReservationBuild.errorWhenOfferPriceChangesInd` (boolean)
    If true, an error will be returned when the flight price changes during commit processing.
    Example: true

## Response 200 fields (application/json):

  - `ReservationResponse` (object)
    The response of Create Reservation (Reference Payload), Create Reservation (Full Payload), Sync Reservation, Modify/Add Reservation, Create/Modify Passive Reservation, Retrieve Reservation, or Cancel Reservation endpoint requests.

  - `ReservationResponse.Reservation` (object)

  - `ReservationResponse.Reservation.@type` (string, required)
    Discriminator classes ReservationID, Reservation or ReservationDetail
    Example: "Reservation"

  - `ReservationResponse.Reservation.id` (string)
    Internal identifier for the response.
    Example: "REF12873"

  - `ReservationResponse.Reservation.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.@type` (string)
    Example: "response"

  - `ReservationResponse.transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `ReservationResponse.traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `ReservationResponse.correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `ReservationResponse.reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `ReservationResponse.Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `ReservationResponse.Result.@type` (string)
    Discriminator class Result only
    Example: "Result"

  - `ReservationResponse.Result.status` (string)
    The status of an error or warning
    Enum: "Not processed", "Incomplete", "Complete", "Unknown"

  - `ReservationResponse.Result.Error` (array)
    A list of error information returned at the provider level for a response.

  - `ReservationResponse.Result.Error.@type` (string, required)
    Discriminator classes Error or ErrorDetail
    Example: "ErrorDetail"

  - `ReservationResponse.Result.Error.Message` (string)
    The Travelport standardized error or warning message
    Example: "No flights found."

  - `ReservationResponse.Result.Error.NameValuePair` (array)

  - `ReservationResponse.Result.Error.NameValuePair.value` (string)
    Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
    Example: "Sunday"

  - `ReservationResponse.Result.Error.NameValuePair.id` (string)
    Optional internally referenced id
    Example: "6"

  - `ReservationResponse.Result.Error.NameValuePair.name` (string, required)
    Key, categorizing the of type of remark or error.
    Example: "Day1"

  - `ReservationResponse.Result.Error.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Result.Warning` (array)
    A list of warning information returned at the provider level for a response.

  - `ReservationResponse.Result.Warning.@type` (string, required)
    Discriminator classes Warning or WarningDetail
    Example: "WarningDetail"

  - `ReservationResponse.Result.Warning.Message` (string)
    The Travelport standardized error or warning message
    Example: "Customer Loyalty could not be applied."

  - `ReservationResponse.Result.Warning.NameValuePair` (array)

  - `ReservationResponse.Result.Warning.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReservationResponse.NextSteps.baseURI` (string, required)
    The base portion of the uri in order to shorten the uris in the individual steps

  - `ReservationResponse.NextSteps.id` (string)
    Optional internally referenced id
    Example: "5"

  - `ReservationResponse.NextSteps.NextStep` (array, required)

  - `ReservationResponse.NextSteps.NextStep.value` (string)
    Example: "www.resourcelocation.com"

  - `ReservationResponse.NextSteps.NextStep.id` (string)
    Identifier for the Next Step
    Example: "2"

  - `ReservationResponse.NextSteps.NextStep.action` (string, required)
    The action this next step is intended to achieve
    Example: "cancel"

  - `ReservationResponse.NextSteps.NextStep.method` (string, required)
    Describes the set of potential methods that can be taken after an operation.
    Enum: "GET", "DELETE", "PUT", "POST"

  - `ReservationResponse.NextSteps.NextStep.description` (string)
    Additional clarification for the next step
    Example: "remove offer from the order"

  - `ReservationResponse.ReferenceList` (array)

  - `ReservationResponse.ReferenceList.@type` (string, required)
    Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
    Example: "ReferenceListFlight"

  - `ReservationResponse.ReferenceList.id` (string)
    Uniquely identifies for the Reference List

  - `ReservationResponse.CurrencyRateConversion` (array)

  - `ReservationResponse.CurrencyRateConversion.@type` (string)

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.value` (string)
    An ISO 4217 currency code.
    Example: "USD"

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
    Currency code authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
    Number of decimal places for the currency.
    Example: 4

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
    Currency code decimal authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.TargetCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate` (object, required)
    Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.value` (number)

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
    Contextual rate authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
    Rate as of
    Example: "2026-08-07 12:12:00+00:00"

  - `ReservationResponse.Pagination` (object)
    Pagination object used when result sets span across a number of pages.

  - `ReservationResponse.Pagination.@type` (string, required)
    Example: "Pagination"

  - `ReservationResponse.Pagination.page` (integer, required)
    The current page number of the full result set
    Example: 1

  - `ReservationResponse.Pagination.pageSize` (integer, required)
    The total number of items on this page
    Example: 20

  - `ReservationResponse.Pagination.totalPages` (integer, required)
    The total number of pages in this result set
    Example: 5

  - `ReservationResponse.Pagination.totalItems` (integer, required)
    The total number of pages in this result set
    Example: 100

## Response 400 fields (application/json):

  - `@type` (string)
    Example: "response"

  - `transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReferenceList` (array)

  - `CurrencyRateConversion` (array)

  - `Pagination` (object)
    Pagination object used when result sets span across a number of pages.


# Retrieve hotel reservation.

The Retrieve Hotel Reservation API returns all existing data on a reservation. You may retrieve details about a held booking or PNR. While a PNR refers to a held booking that has not been ticketed, the PNR code persists after ticketing to provide the booking records. Once a PNR has been ticketed, you can still use Retrieve to return both booking and ticketing details. A Ticket Display request can also be used to retrieve any ticketed itinerary.

Endpoint: GET /hotel/book/reservations/{Identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

  - `Identifier` (string, required)
    Identifier provides the ability to create a globally unique identifier. For the identifier to be globally unique it must have a system provided identifier and the system must be identified using a global naming authority. System identification uses the domain naming system (DNS) to assure they are globally unique and should be an URL. The system provided ID will typically be a primary or surrogate key in a database.

## Query parameters:

  - `detailViewInd` (boolean)
    If true, ReservationDetail will be returned.

  - `identifierType` (string)
    The type of identifier key used to retrieve the reservation
    Enum: "Reservation", "Locator", "SupplierLocator", "DocumentNumber"

## Header parameters:

  - `TraceId` (string)
    Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response.
    Example: "TraceID_123456789"

  - `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
    Identifies the Travelport access group with which the caller is associated
    Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

  - `TVP-PCC-Core` (string)
    Allows user to pass PCC instead of Access Group ID
    Example: "DU7_1G"

  - `TVP-Correlation-Id` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.
    Example: "382c74c3-721d-4f34-80e5-57657b6cbc27"

  - `Accept-Encoding` (string, required)
    Comma-separated list of acceptable encodings like gzip and/or deflate
    Example: "gzip, deflate"

## Response 200 fields (application/json):

  - `ReservationResponse` (object)
    The response of Create Reservation (Reference Payload), Create Reservation (Full Payload), Sync Reservation, Modify/Add Reservation, Create/Modify Passive Reservation, Retrieve Reservation, or Cancel Reservation endpoint requests.

  - `ReservationResponse.Reservation` (object)

  - `ReservationResponse.Reservation.@type` (string, required)
    Discriminator classes ReservationID, Reservation or ReservationDetail
    Example: "Reservation"

  - `ReservationResponse.Reservation.id` (string)
    Internal identifier for the response.
    Example: "REF12873"

  - `ReservationResponse.Reservation.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.Reservation.Identifier.value` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
    Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

  - `ReservationResponse.Reservation.Identifier.authority` (string)
    "Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
    Example: "TVPT"

  - `ReservationResponse.@type` (string)
    Example: "response"

  - `ReservationResponse.transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `ReservationResponse.traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `ReservationResponse.correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `ReservationResponse.reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `ReservationResponse.Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `ReservationResponse.Result.@type` (string)
    Discriminator class Result only
    Example: "Result"

  - `ReservationResponse.Result.status` (string)
    The status of an error or warning
    Enum: "Not processed", "Incomplete", "Complete", "Unknown"

  - `ReservationResponse.Result.Error` (array)
    A list of error information returned at the provider level for a response.

  - `ReservationResponse.Result.Error.@type` (string, required)
    Discriminator classes Error or ErrorDetail
    Example: "ErrorDetail"

  - `ReservationResponse.Result.Error.Message` (string)
    The Travelport standardized error or warning message
    Example: "No flights found."

  - `ReservationResponse.Result.Error.NameValuePair` (array)

  - `ReservationResponse.Result.Error.NameValuePair.value` (string)
    Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
    Example: "Sunday"

  - `ReservationResponse.Result.Error.NameValuePair.id` (string)
    Optional internally referenced id
    Example: "6"

  - `ReservationResponse.Result.Error.NameValuePair.name` (string, required)
    Key, categorizing the of type of remark or error.
    Example: "Day1"

  - `ReservationResponse.Result.Error.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Result.Warning` (array)
    A list of warning information returned at the provider level for a response.

  - `ReservationResponse.Result.Warning.@type` (string, required)
    Discriminator classes Warning or WarningDetail
    Example: "WarningDetail"

  - `ReservationResponse.Result.Warning.Message` (string)
    The Travelport standardized error or warning message
    Example: "Customer Loyalty could not be applied."

  - `ReservationResponse.Result.Warning.NameValuePair` (array)

  - `ReservationResponse.Result.Warning.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReservationResponse.NextSteps.baseURI` (string, required)
    The base portion of the uri in order to shorten the uris in the individual steps

  - `ReservationResponse.NextSteps.id` (string)
    Optional internally referenced id
    Example: "5"

  - `ReservationResponse.NextSteps.NextStep` (array, required)

  - `ReservationResponse.NextSteps.NextStep.value` (string)
    Example: "www.resourcelocation.com"

  - `ReservationResponse.NextSteps.NextStep.id` (string)
    Identifier for the Next Step
    Example: "2"

  - `ReservationResponse.NextSteps.NextStep.action` (string, required)
    The action this next step is intended to achieve
    Example: "cancel"

  - `ReservationResponse.NextSteps.NextStep.method` (string, required)
    Describes the set of potential methods that can be taken after an operation.
    Enum: "GET", "DELETE", "PUT", "POST"

  - `ReservationResponse.NextSteps.NextStep.description` (string)
    Additional clarification for the next step
    Example: "remove offer from the order"

  - `ReservationResponse.ReferenceList` (array)

  - `ReservationResponse.ReferenceList.@type` (string, required)
    Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
    Example: "ReferenceListFlight"

  - `ReservationResponse.ReferenceList.id` (string)
    Uniquely identifies for the Reference List

  - `ReservationResponse.CurrencyRateConversion` (array)

  - `ReservationResponse.CurrencyRateConversion.@type` (string)

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.value` (string)
    An ISO 4217 currency code.
    Example: "USD"

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
    Currency code authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
    Number of decimal places for the currency.
    Example: 4

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
    Currency code decimal authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.TargetCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate` (object, required)
    Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.value` (number)

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
    Contextual rate authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
    Rate as of
    Example: "2026-08-07 12:12:00+00:00"

  - `ReservationResponse.Pagination` (object)
    Pagination object used when result sets span across a number of pages.

  - `ReservationResponse.Pagination.@type` (string, required)
    Example: "Pagination"

  - `ReservationResponse.Pagination.page` (integer, required)
    The current page number of the full result set
    Example: 1

  - `ReservationResponse.Pagination.pageSize` (integer, required)
    The total number of items on this page
    Example: 20

  - `ReservationResponse.Pagination.totalPages` (integer, required)
    The total number of pages in this result set
    Example: 5

  - `ReservationResponse.Pagination.totalItems` (integer, required)
    The total number of pages in this result set
    Example: 100

## Response 400 fields (application/json):

  - `@type` (string)
    Example: "response"

  - `transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReferenceList` (array)

  - `CurrencyRateConversion` (array)

  - `Pagination` (object)
    Pagination object used when result sets span across a number of pages.

# Retrieve hotel reservation.

The Retrieve Hotel Reservation API returns all existing data on a reservation. You may retrieve details about a held booking or PNR. While a PNR refers to a held booking that has not been ticketed, the PNR code persists after ticketing to provide the booking records. Once a PNR has been ticketed, you can still use Retrieve to return both booking and ticketing details. A Ticket Display request can also be used to retrieve any ticketed itinerary.

Endpoint: GET /hotel/book/reservations/{Identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

  - `Identifier` (string, required)
    Identifier provides the ability to create a globally unique identifier. For the identifier to be globally unique it must have a system provided identifier and the system must be identified using a global naming authority. System identification uses the domain naming system (DNS) to assure they are globally unique and should be an URL. The system provided ID will typically be a primary or surrogate key in a database.

## Query parameters:

  - `detailViewInd` (boolean)
    If true, ReservationDetail will be returned.

  - `identifierType` (string)
    The type of identifier key used to retrieve the reservation
    Enum: "Reservation", "Locator", "SupplierLocator", "DocumentNumber"

## Header parameters:

  - `TraceId` (string)
    Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response.
    Example: "TraceID_123456789"

  - `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
    Identifies the Travelport access group with which the caller is associated
    Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

  - `TVP-PCC-Core` (string)
    Allows user to pass PCC instead of Access Group ID
    Example: "DU7_1G"

  - `TVP-Correlation-Id` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.
    Example: "382c74c3-721d-4f34-80e5-57657b6cbc27"

  - `Accept-Encoding` (string, required)
    Comma-separated list of acceptable encodings like gzip and/or deflate
    Example: "gzip, deflate"

## Response 200 fields (application/json):

  - `ReservationResponse` (object)
    The response of Create Reservation (Reference Payload), Create Reservation (Full Payload), Sync Reservation, Modify/Add Reservation, Create/Modify Passive Reservation, Retrieve Reservation, or Cancel Reservation endpoint requests.

  - `ReservationResponse.Reservation` (object)

  - `ReservationResponse.Reservation.@type` (string, required)
    Discriminator classes ReservationID, Reservation or ReservationDetail
    Example: "Reservation"

  - `ReservationResponse.Reservation.id` (string)
    Internal identifier for the response.
    Example: "REF12873"

  - `ReservationResponse.Reservation.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.Reservation.Identifier.value` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
    Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

  - `ReservationResponse.Reservation.Identifier.authority` (string)
    "Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
    Example: "TVPT"

  - `ReservationResponse.@type` (string)
    Example: "response"

  - `ReservationResponse.transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `ReservationResponse.traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `ReservationResponse.correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `ReservationResponse.reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `ReservationResponse.Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `ReservationResponse.Result.@type` (string)
    Discriminator class Result only
    Example: "Result"

  - `ReservationResponse.Result.status` (string)
    The status of an error or warning
    Enum: "Not processed", "Incomplete", "Complete", "Unknown"

  - `ReservationResponse.Result.Error` (array)
    A list of error information returned at the provider level for a response.

  - `ReservationResponse.Result.Error.@type` (string, required)
    Discriminator classes Error or ErrorDetail
    Example: "ErrorDetail"

  - `ReservationResponse.Result.Error.Message` (string)
    The Travelport standardized error or warning message
    Example: "No flights found."

  - `ReservationResponse.Result.Error.NameValuePair` (array)

  - `ReservationResponse.Result.Error.NameValuePair.value` (string)
    Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
    Example: "Sunday"

  - `ReservationResponse.Result.Error.NameValuePair.id` (string)
    Optional internally referenced id
    Example: "6"

  - `ReservationResponse.Result.Error.NameValuePair.name` (string, required)
    Key, categorizing the of type of remark or error.
    Example: "Day1"

  - `ReservationResponse.Result.Error.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Result.Warning` (array)
    A list of warning information returned at the provider level for a response.

  - `ReservationResponse.Result.Warning.@type` (string, required)
    Discriminator classes Warning or WarningDetail
    Example: "WarningDetail"

  - `ReservationResponse.Result.Warning.Message` (string)
    The Travelport standardized error or warning message
    Example: "Customer Loyalty could not be applied."

  - `ReservationResponse.Result.Warning.NameValuePair` (array)

  - `ReservationResponse.Result.Warning.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReservationResponse.NextSteps.baseURI` (string, required)
    The base portion of the uri in order to shorten the uris in the individual steps

  - `ReservationResponse.NextSteps.id` (string)
    Optional internally referenced id
    Example: "5"

  - `ReservationResponse.NextSteps.NextStep` (array, required)

  - `ReservationResponse.NextSteps.NextStep.value` (string)
    Example: "www.resourcelocation.com"

  - `ReservationResponse.NextSteps.NextStep.id` (string)
    Identifier for the Next Step
    Example: "2"

  - `ReservationResponse.NextSteps.NextStep.action` (string, required)
    The action this next step is intended to achieve
    Example: "cancel"

  - `ReservationResponse.NextSteps.NextStep.method` (string, required)
    Describes the set of potential methods that can be taken after an operation.
    Enum: "GET", "DELETE", "PUT", "POST"

  - `ReservationResponse.NextSteps.NextStep.description` (string)
    Additional clarification for the next step
    Example: "remove offer from the order"

  - `ReservationResponse.ReferenceList` (array)

  - `ReservationResponse.ReferenceList.@type` (string, required)
    Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
    Example: "ReferenceListFlight"

  - `ReservationResponse.ReferenceList.id` (string)
    Uniquely identifies for the Reference List

  - `ReservationResponse.CurrencyRateConversion` (array)

  - `ReservationResponse.CurrencyRateConversion.@type` (string)

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.value` (string)
    An ISO 4217 currency code.
    Example: "USD"

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
    Currency code authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
    Number of decimal places for the currency.
    Example: 4

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
    Currency code decimal authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.TargetCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate` (object, required)
    Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.value` (number)

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
    Contextual rate authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
    Rate as of
    Example: "2026-08-07 12:12:00+00:00"

  - `ReservationResponse.Pagination` (object)
    Pagination object used when result sets span across a number of pages.

  - `ReservationResponse.Pagination.@type` (string, required)
    Example: "Pagination"

  - `ReservationResponse.Pagination.page` (integer, required)
    The current page number of the full result set
    Example: 1

  - `ReservationResponse.Pagination.pageSize` (integer, required)
    The total number of items on this page
    Example: 20

  - `ReservationResponse.Pagination.totalPages` (integer, required)
    The total number of pages in this result set
    Example: 5

  - `ReservationResponse.Pagination.totalItems` (integer, required)
    The total number of pages in this result set
    Example: 100

## Response 400 fields (application/json):

  - `@type` (string)
    Example: "response"

  - `transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReferenceList` (array)

  - `CurrencyRateConversion` (array)

  - `Pagination` (object)
    Pagination object used when result sets span across a number of pages.


# Cancel hotel reservation.

The Cancel Hotel Reservation API cancels an existing hotel reservation.

Endpoint: PUT /hotel/book/reservations/{reservationIdentifier}/canceloffer
Version: 11.33.0
Security: bearerAuth

## Path parameters:

  - `reservationIdentifier` (string, required)

## Query parameters:

  - `supplierLocator` (string)

  - `offerID` (string)

## Header parameters:

  - `TraceId` (string)
    Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response.
    Example: "TraceID_123456789"

  - `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
    Identifies the Travelport access group with which the caller is associated
    Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

  - `TVP-PCC-Core` (string)
    Allows user to pass PCC instead of Access Group ID
    Example: "DU7_1G"

  - `TVP-Correlation-Id` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.
    Example: "382c74c3-721d-4f34-80e5-57657b6cbc27"

  - `Accept-Encoding` (string, required)
    Comma-separated list of acceptable encodings like gzip and/or deflate
    Example: "gzip, deflate"

## Response 200 fields (application/json):

  - `ReservationResponse` (object)
    The response of Create Reservation (Reference Payload), Create Reservation (Full Payload), Sync Reservation, Modify/Add Reservation, Create/Modify Passive Reservation, Retrieve Reservation, or Cancel Reservation endpoint requests.

  - `ReservationResponse.Reservation` (object)

  - `ReservationResponse.Reservation.@type` (string, required)
    Discriminator classes ReservationID, Reservation or ReservationDetail
    Example: "Reservation"

  - `ReservationResponse.Reservation.id` (string)
    Internal identifier for the response.
    Example: "REF12873"

  - `ReservationResponse.Reservation.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.Reservation.Identifier.value` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
    Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

  - `ReservationResponse.Reservation.Identifier.authority` (string)
    "Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
    Example: "TVPT"

  - `ReservationResponse.@type` (string)
    Example: "response"

  - `ReservationResponse.transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `ReservationResponse.traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `ReservationResponse.correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `ReservationResponse.reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `ReservationResponse.Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `ReservationResponse.Result.@type` (string)
    Discriminator class Result only
    Example: "Result"

  - `ReservationResponse.Result.status` (string)
    The status of an error or warning
    Enum: "Not processed", "Incomplete", "Complete", "Unknown"

  - `ReservationResponse.Result.Error` (array)
    A list of error information returned at the provider level for a response.

  - `ReservationResponse.Result.Error.@type` (string, required)
    Discriminator classes Error or ErrorDetail
    Example: "ErrorDetail"

  - `ReservationResponse.Result.Error.Message` (string)
    The Travelport standardized error or warning message
    Example: "No flights found."

  - `ReservationResponse.Result.Error.NameValuePair` (array)

  - `ReservationResponse.Result.Error.NameValuePair.value` (string)
    Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
    Example: "Sunday"

  - `ReservationResponse.Result.Error.NameValuePair.id` (string)
    Optional internally referenced id
    Example: "6"

  - `ReservationResponse.Result.Error.NameValuePair.name` (string, required)
    Key, categorizing the of type of remark or error.
    Example: "Day1"

  - `ReservationResponse.Result.Error.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Result.Warning` (array)
    A list of warning information returned at the provider level for a response.

  - `ReservationResponse.Result.Warning.@type` (string, required)
    Discriminator classes Warning or WarningDetail
    Example: "WarningDetail"

  - `ReservationResponse.Result.Warning.Message` (string)
    The Travelport standardized error or warning message
    Example: "Customer Loyalty could not be applied."

  - `ReservationResponse.Result.Warning.NameValuePair` (array)

  - `ReservationResponse.Result.Warning.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReservationResponse.NextSteps.baseURI` (string, required)
    The base portion of the uri in order to shorten the uris in the individual steps

  - `ReservationResponse.NextSteps.id` (string)
    Optional internally referenced id
    Example: "5"

  - `ReservationResponse.NextSteps.NextStep` (array, required)

  - `ReservationResponse.NextSteps.NextStep.value` (string)
    Example: "www.resourcelocation.com"

  - `ReservationResponse.NextSteps.NextStep.id` (string)
    Identifier for the Next Step
    Example: "2"

  - `ReservationResponse.NextSteps.NextStep.action` (string, required)
    The action this next step is intended to achieve
    Example: "cancel"

  - `ReservationResponse.NextSteps.NextStep.method` (string, required)
    Describes the set of potential methods that can be taken after an operation.
    Enum: "GET", "DELETE", "PUT", "POST"

  - `ReservationResponse.NextSteps.NextStep.description` (string)
    Additional clarification for the next step
    Example: "remove offer from the order"

  - `ReservationResponse.ReferenceList` (array)

  - `ReservationResponse.ReferenceList.@type` (string, required)
    Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
    Example: "ReferenceListFlight"

  - `ReservationResponse.ReferenceList.id` (string)
    Uniquely identifies for the Reference List

  - `ReservationResponse.CurrencyRateConversion` (array)

  - `ReservationResponse.CurrencyRateConversion.@type` (string)

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.value` (string)
    An ISO 4217 currency code.
    Example: "USD"

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
    Currency code authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
    Number of decimal places for the currency.
    Example: 4

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
    Currency code decimal authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.TargetCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate` (object, required)
    Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.value` (number)

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
    Contextual rate authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
    Rate as of
    Example: "2026-08-07 12:12:00+00:00"

  - `ReservationResponse.Pagination` (object)
    Pagination object used when result sets span across a number of pages.

  - `ReservationResponse.Pagination.@type` (string, required)
    Example: "Pagination"

  - `ReservationResponse.Pagination.page` (integer, required)
    The current page number of the full result set
    Example: 1

  - `ReservationResponse.Pagination.pageSize` (integer, required)
    The total number of items on this page
    Example: 20

  - `ReservationResponse.Pagination.totalPages` (integer, required)
    The total number of pages in this result set
    Example: 5

  - `ReservationResponse.Pagination.totalItems` (integer, required)
    The total number of pages in this result set
    Example: 100

## Response 400 fields (application/json):

  - `@type` (string)
    Example: "response"

  - `transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReferenceList` (array)

  - `CurrencyRateConversion` (array)

  - `Pagination` (object)
    Pagination object used when result sets span across a number of pages.

# Cancel hotel reservation.

The Cancel Hotel Reservation API cancels an existing hotel reservation.

Endpoint: PUT /hotel/book/reservations/{reservationIdentifier}/canceloffer
Version: 11.33.0
Security: bearerAuth

## Path parameters:

  - `reservationIdentifier` (string, required)

## Query parameters:

  - `supplierLocator` (string)

  - `offerID` (string)

## Header parameters:

  - `TraceId` (string)
    Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response.
    Example: "TraceID_123456789"

  - `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
    Identifies the Travelport access group with which the caller is associated
    Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

  - `TVP-PCC-Core` (string)
    Allows user to pass PCC instead of Access Group ID
    Example: "DU7_1G"

  - `TVP-Correlation-Id` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.
    Example: "382c74c3-721d-4f34-80e5-57657b6cbc27"

  - `Accept-Encoding` (string, required)
    Comma-separated list of acceptable encodings like gzip and/or deflate
    Example: "gzip, deflate"

## Response 200 fields (application/json):

  - `ReservationResponse` (object)
    The response of Create Reservation (Reference Payload), Create Reservation (Full Payload), Sync Reservation, Modify/Add Reservation, Create/Modify Passive Reservation, Retrieve Reservation, or Cancel Reservation endpoint requests.

  - `ReservationResponse.Reservation` (object)

  - `ReservationResponse.Reservation.@type` (string, required)
    Discriminator classes ReservationID, Reservation or ReservationDetail
    Example: "Reservation"

  - `ReservationResponse.Reservation.id` (string)
    Internal identifier for the response.
    Example: "REF12873"

  - `ReservationResponse.Reservation.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.Reservation.Identifier.value` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
    Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

  - `ReservationResponse.Reservation.Identifier.authority` (string)
    "Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
    Example: "TVPT"

  - `ReservationResponse.@type` (string)
    Example: "response"

  - `ReservationResponse.transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `ReservationResponse.traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `ReservationResponse.correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `ReservationResponse.reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `ReservationResponse.Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `ReservationResponse.Result.@type` (string)
    Discriminator class Result only
    Example: "Result"

  - `ReservationResponse.Result.status` (string)
    The status of an error or warning
    Enum: "Not processed", "Incomplete", "Complete", "Unknown"

  - `ReservationResponse.Result.Error` (array)
    A list of error information returned at the provider level for a response.

  - `ReservationResponse.Result.Error.@type` (string, required)
    Discriminator classes Error or ErrorDetail
    Example: "ErrorDetail"

  - `ReservationResponse.Result.Error.Message` (string)
    The Travelport standardized error or warning message
    Example: "No flights found."

  - `ReservationResponse.Result.Error.NameValuePair` (array)

  - `ReservationResponse.Result.Error.NameValuePair.value` (string)
    Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
    Example: "Sunday"

  - `ReservationResponse.Result.Error.NameValuePair.id` (string)
    Optional internally referenced id
    Example: "6"

  - `ReservationResponse.Result.Error.NameValuePair.name` (string, required)
    Key, categorizing the of type of remark or error.
    Example: "Day1"

  - `ReservationResponse.Result.Error.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Result.Warning` (array)
    A list of warning information returned at the provider level for a response.

  - `ReservationResponse.Result.Warning.@type` (string, required)
    Discriminator classes Warning or WarningDetail
    Example: "WarningDetail"

  - `ReservationResponse.Result.Warning.Message` (string)
    The Travelport standardized error or warning message
    Example: "Customer Loyalty could not be applied."

  - `ReservationResponse.Result.Warning.NameValuePair` (array)

  - `ReservationResponse.Result.Warning.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReservationResponse.NextSteps.baseURI` (string, required)
    The base portion of the uri in order to shorten the uris in the individual steps

  - `ReservationResponse.NextSteps.id` (string)
    Optional internally referenced id
    Example: "5"

  - `ReservationResponse.NextSteps.NextStep` (array, required)

  - `ReservationResponse.NextSteps.NextStep.value` (string)
    Example: "www.resourcelocation.com"

  - `ReservationResponse.NextSteps.NextStep.id` (string)
    Identifier for the Next Step
    Example: "2"

  - `ReservationResponse.NextSteps.NextStep.action` (string, required)
    The action this next step is intended to achieve
    Example: "cancel"

  - `ReservationResponse.NextSteps.NextStep.method` (string, required)
    Describes the set of potential methods that can be taken after an operation.
    Enum: "GET", "DELETE", "PUT", "POST"

  - `ReservationResponse.NextSteps.NextStep.description` (string)
    Additional clarification for the next step
    Example: "remove offer from the order"

  - `ReservationResponse.ReferenceList` (array)

  - `ReservationResponse.ReferenceList.@type` (string, required)
    Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
    Example: "ReferenceListFlight"

  - `ReservationResponse.ReferenceList.id` (string)
    Uniquely identifies for the Reference List

  - `ReservationResponse.CurrencyRateConversion` (array)

  - `ReservationResponse.CurrencyRateConversion.@type` (string)

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.value` (string)
    An ISO 4217 currency code.
    Example: "USD"

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
    Currency code authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
    Number of decimal places for the currency.
    Example: 4

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
    Currency code decimal authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.TargetCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate` (object, required)
    Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.value` (number)

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
    Contextual rate authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
    Rate as of
    Example: "2026-08-07 12:12:00+00:00"

  - `ReservationResponse.Pagination` (object)
    Pagination object used when result sets span across a number of pages.

  - `ReservationResponse.Pagination.@type` (string, required)
    Example: "Pagination"

  - `ReservationResponse.Pagination.page` (integer, required)
    The current page number of the full result set
    Example: 1

  - `ReservationResponse.Pagination.pageSize` (integer, required)
    The total number of items on this page
    Example: 20

  - `ReservationResponse.Pagination.totalPages` (integer, required)
    The total number of pages in this result set
    Example: 5

  - `ReservationResponse.Pagination.totalItems` (integer, required)
    The total number of pages in this result set
    Example: 100

## Response 400 fields (application/json):

  - `@type` (string)
    Example: "response"

  - `transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReferenceList` (array)

  - `CurrencyRateConversion` (array)

  - `Pagination` (object)
    Pagination object used when result sets span across a number of pages.

# Add passive reservation to a booking.

Use the Add Passive Reservation request to add a passive hotel booking segment to an existing reservation. You can add either of two types of passive segments to an existing reservation: 1) Sending full details of the room in the request adds a single hotel segment with a status of MK (confirmed passive) to the reservation, or, 2) Sending only dates in the request, which adds a placeholder segment to the reservation. You may want to add a placeholder if you do not have all booking details. Or, you can send only dates to add a dummy or retention segment, which can be used to keep the reservation details active in the system after travel is complete, up to the dates on the passive segment. Placeholder segments return a status of AK. (A passive hotel segment is any segment that is booked using anything other than a product that uses the Travelport GDS. Passive segments are informational only. They do not result in a reservation or a change in inventory. Information on a passive segment is not received from or passed to the hotel supplier. Instead, passive segments provide a way to consolidate all booking information, including details from direct hotel bookings or even phone reservations.)

Endpoint: PUT /hotel/book/reservations/{reservationIdentifier}/passive
Version: 11.33.0
Security: bearerAuth

## Path parameters:

  - `reservationIdentifier` (string, required)

## Query parameters:

  - `Locator` (string)

## Header parameters:

  - `TraceId` (string)
    Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response.
    Example: "TraceID_123456789"

  - `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
    Identifies the Travelport access group with which the caller is associated
    Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

  - `TVP-PCC-Core` (string)
    Allows user to pass PCC instead of Access Group ID
    Example: "DU7_1G"

  - `TVP-Correlation-Id` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.
    Example: "382c74c3-721d-4f34-80e5-57657b6cbc27"

  - `Accept-Encoding` (string, required)
    Comma-separated list of acceptable encodings like gzip and/or deflate
    Example: "gzip, deflate"

## Response 200 fields (application/json):

  - `ReservationResponse` (object)
    The response of Create Reservation (Reference Payload), Create Reservation (Full Payload), Sync Reservation, Modify/Add Reservation, Create/Modify Passive Reservation, Retrieve Reservation, or Cancel Reservation endpoint requests.

  - `ReservationResponse.Reservation` (object)

  - `ReservationResponse.Reservation.@type` (string, required)
    Discriminator classes ReservationID, Reservation or ReservationDetail
    Example: "Reservation"

  - `ReservationResponse.Reservation.id` (string)
    Internal identifier for the response.
    Example: "REF12873"

  - `ReservationResponse.Reservation.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.Reservation.Identifier.value` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
    Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

  - `ReservationResponse.Reservation.Identifier.authority` (string)
    "Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
    Example: "TVPT"

  - `ReservationResponse.@type` (string)
    Example: "response"

  - `ReservationResponse.transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `ReservationResponse.traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `ReservationResponse.correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `ReservationResponse.reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `ReservationResponse.Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `ReservationResponse.Result.@type` (string)
    Discriminator class Result only
    Example: "Result"

  - `ReservationResponse.Result.status` (string)
    The status of an error or warning
    Enum: "Not processed", "Incomplete", "Complete", "Unknown"

  - `ReservationResponse.Result.Error` (array)
    A list of error information returned at the provider level for a response.

  - `ReservationResponse.Result.Error.@type` (string, required)
    Discriminator classes Error or ErrorDetail
    Example: "ErrorDetail"

  - `ReservationResponse.Result.Error.Message` (string)
    The Travelport standardized error or warning message
    Example: "No flights found."

  - `ReservationResponse.Result.Error.NameValuePair` (array)

  - `ReservationResponse.Result.Error.NameValuePair.value` (string)
    Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
    Example: "Sunday"

  - `ReservationResponse.Result.Error.NameValuePair.id` (string)
    Optional internally referenced id
    Example: "6"

  - `ReservationResponse.Result.Error.NameValuePair.name` (string, required)
    Key, categorizing the of type of remark or error.
    Example: "Day1"

  - `ReservationResponse.Result.Error.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Result.Warning` (array)
    A list of warning information returned at the provider level for a response.

  - `ReservationResponse.Result.Warning.@type` (string, required)
    Discriminator classes Warning or WarningDetail
    Example: "WarningDetail"

  - `ReservationResponse.Result.Warning.Message` (string)
    The Travelport standardized error or warning message
    Example: "Customer Loyalty could not be applied."

  - `ReservationResponse.Result.Warning.NameValuePair` (array)

  - `ReservationResponse.Result.Warning.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReservationResponse.NextSteps.baseURI` (string, required)
    The base portion of the uri in order to shorten the uris in the individual steps

  - `ReservationResponse.NextSteps.id` (string)
    Optional internally referenced id
    Example: "5"

  - `ReservationResponse.NextSteps.NextStep` (array, required)

  - `ReservationResponse.NextSteps.NextStep.value` (string)
    Example: "www.resourcelocation.com"

  - `ReservationResponse.NextSteps.NextStep.id` (string)
    Identifier for the Next Step
    Example: "2"

  - `ReservationResponse.NextSteps.NextStep.action` (string, required)
    The action this next step is intended to achieve
    Example: "cancel"

  - `ReservationResponse.NextSteps.NextStep.method` (string, required)
    Describes the set of potential methods that can be taken after an operation.
    Enum: "GET", "DELETE", "PUT", "POST"

  - `ReservationResponse.NextSteps.NextStep.description` (string)
    Additional clarification for the next step
    Example: "remove offer from the order"

  - `ReservationResponse.ReferenceList` (array)

  - `ReservationResponse.ReferenceList.@type` (string, required)
    Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
    Example: "ReferenceListFlight"

  - `ReservationResponse.ReferenceList.id` (string)
    Uniquely identifies for the Reference List

  - `ReservationResponse.CurrencyRateConversion` (array)

  - `ReservationResponse.CurrencyRateConversion.@type` (string)

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.value` (string)
    An ISO 4217 currency code.
    Example: "USD"

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
    Currency code authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
    Number of decimal places for the currency.
    Example: 4

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
    Currency code decimal authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.TargetCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate` (object, required)
    Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.value` (number)

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
    Contextual rate authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
    Rate as of
    Example: "2026-08-07 12:12:00+00:00"

  - `ReservationResponse.Pagination` (object)
    Pagination object used when result sets span across a number of pages.

  - `ReservationResponse.Pagination.@type` (string, required)
    Example: "Pagination"

  - `ReservationResponse.Pagination.page` (integer, required)
    The current page number of the full result set
    Example: 1

  - `ReservationResponse.Pagination.pageSize` (integer, required)
    The total number of items on this page
    Example: 20

  - `ReservationResponse.Pagination.totalPages` (integer, required)
    The total number of pages in this result set
    Example: 5

  - `ReservationResponse.Pagination.totalItems` (integer, required)
    The total number of pages in this result set
    Example: 100

## Response 400 fields (application/json):

  - `@type` (string)
    Example: "response"

  - `transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReferenceList` (array)

  - `CurrencyRateConversion` (array)

  - `Pagination` (object)
    Pagination object used when result sets span across a number of pages.

# Modify passive hotel reservation.

Use Modify Passive Reservation to update any parameter within an MK passive hotel booking segment of an existing reservation. MK designates a confirmed passive segment, while AK is used for placeholder-only segments. (A passive hotel segment is any segment that is booked using anything other than a product that uses the Travelport GDS. Passive segments are informational only. They do not result in a reservation or a change in inventory. Information on a passive segment is not received from or passed to the hotel supplier. Instead, passive segments provide a way to consolidate all booking information, including details from direct hotel bookings or even phone reservations.)

Endpoint: PUT /hotel/book/reservations/{reservationIdentifier}/passiveupdate
Version: 11.33.0
Security: bearerAuth

## Path parameters:

  - `reservationIdentifier` (string, required)

## Query parameters:

  - `Locator` (string)

## Header parameters:

  - `TraceId` (string)
    Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response.
    Example: "TraceID_123456789"

  - `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
    Identifies the Travelport access group with which the caller is associated
    Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

  - `TVP-PCC-Core` (string)
    Allows user to pass PCC instead of Access Group ID
    Example: "DU7_1G"

  - `TVP-Correlation-Id` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.
    Example: "382c74c3-721d-4f34-80e5-57657b6cbc27"

  - `Accept-Encoding` (string, required)
    Comma-separated list of acceptable encodings like gzip and/or deflate
    Example: "gzip, deflate"

## Response 200 fields (application/json):

  - `ReservationResponse` (object)
    The response of Create Reservation (Reference Payload), Create Reservation (Full Payload), Sync Reservation, Modify/Add Reservation, Create/Modify Passive Reservation, Retrieve Reservation, or Cancel Reservation endpoint requests.

  - `ReservationResponse.Reservation` (object)

  - `ReservationResponse.Reservation.@type` (string, required)
    Discriminator classes ReservationID, Reservation or ReservationDetail
    Example: "Reservation"

  - `ReservationResponse.Reservation.id` (string)
    Internal identifier for the response.
    Example: "REF12873"

  - `ReservationResponse.Reservation.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.Reservation.Identifier.value` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
    Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

  - `ReservationResponse.Reservation.Identifier.authority` (string)
    "Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
    Example: "TVPT"

  - `ReservationResponse.@type` (string)
    Example: "response"

  - `ReservationResponse.transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `ReservationResponse.traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `ReservationResponse.correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `ReservationResponse.reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `ReservationResponse.Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `ReservationResponse.Result.@type` (string)
    Discriminator class Result only
    Example: "Result"

  - `ReservationResponse.Result.status` (string)
    The status of an error or warning
    Enum: "Not processed", "Incomplete", "Complete", "Unknown"

  - `ReservationResponse.Result.Error` (array)
    A list of error information returned at the provider level for a response.

  - `ReservationResponse.Result.Error.@type` (string, required)
    Discriminator classes Error or ErrorDetail
    Example: "ErrorDetail"

  - `ReservationResponse.Result.Error.Message` (string)
    The Travelport standardized error or warning message
    Example: "No flights found."

  - `ReservationResponse.Result.Error.NameValuePair` (array)

  - `ReservationResponse.Result.Error.NameValuePair.value` (string)
    Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
    Example: "Sunday"

  - `ReservationResponse.Result.Error.NameValuePair.id` (string)
    Optional internally referenced id
    Example: "6"

  - `ReservationResponse.Result.Error.NameValuePair.name` (string, required)
    Key, categorizing the of type of remark or error.
    Example: "Day1"

  - `ReservationResponse.Result.Error.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Result.Warning` (array)
    A list of warning information returned at the provider level for a response.

  - `ReservationResponse.Result.Warning.@type` (string, required)
    Discriminator classes Warning or WarningDetail
    Example: "WarningDetail"

  - `ReservationResponse.Result.Warning.Message` (string)
    The Travelport standardized error or warning message
    Example: "Customer Loyalty could not be applied."

  - `ReservationResponse.Result.Warning.NameValuePair` (array)

  - `ReservationResponse.Result.Warning.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `ReservationResponse.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `ReservationResponse.NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReservationResponse.NextSteps.baseURI` (string, required)
    The base portion of the uri in order to shorten the uris in the individual steps

  - `ReservationResponse.NextSteps.id` (string)
    Optional internally referenced id
    Example: "5"

  - `ReservationResponse.NextSteps.NextStep` (array, required)

  - `ReservationResponse.NextSteps.NextStep.value` (string)
    Example: "www.resourcelocation.com"

  - `ReservationResponse.NextSteps.NextStep.id` (string)
    Identifier for the Next Step
    Example: "2"

  - `ReservationResponse.NextSteps.NextStep.action` (string, required)
    The action this next step is intended to achieve
    Example: "cancel"

  - `ReservationResponse.NextSteps.NextStep.method` (string, required)
    Describes the set of potential methods that can be taken after an operation.
    Enum: "GET", "DELETE", "PUT", "POST"

  - `ReservationResponse.NextSteps.NextStep.description` (string)
    Additional clarification for the next step
    Example: "remove offer from the order"

  - `ReservationResponse.ReferenceList` (array)

  - `ReservationResponse.ReferenceList.@type` (string, required)
    Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
    Example: "ReferenceListFlight"

  - `ReservationResponse.ReferenceList.id` (string)
    Uniquely identifies for the Reference List

  - `ReservationResponse.CurrencyRateConversion` (array)

  - `ReservationResponse.CurrencyRateConversion.@type` (string)

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.value` (string)
    An ISO 4217 currency code.
    Example: "USD"

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
    Currency code authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
    Number of decimal places for the currency.
    Example: 4

  - `ReservationResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
    Currency code decimal authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.TargetCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate` (object, required)
    Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.value` (number)

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
    Contextual rate authority
    Example: "ISO 4217"

  - `ReservationResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
    Rate as of
    Example: "2026-08-07 12:12:00+00:00"

  - `ReservationResponse.Pagination` (object)
    Pagination object used when result sets span across a number of pages.

  - `ReservationResponse.Pagination.@type` (string, required)
    Example: "Pagination"

  - `ReservationResponse.Pagination.page` (integer, required)
    The current page number of the full result set
    Example: 1

  - `ReservationResponse.Pagination.pageSize` (integer, required)
    The total number of items on this page
    Example: 20

  - `ReservationResponse.Pagination.totalPages` (integer, required)
    The total number of pages in this result set
    Example: 5

  - `ReservationResponse.Pagination.totalItems` (integer, required)
    The total number of pages in this result set
    Example: 100

## Response 400 fields (application/json):

  - `@type` (string)
    Example: "response"

  - `transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReferenceList` (array)

  - `CurrencyRateConversion` (array)

  - `Pagination` (object)
    Pagination object used when result sets span across a number of pages.

