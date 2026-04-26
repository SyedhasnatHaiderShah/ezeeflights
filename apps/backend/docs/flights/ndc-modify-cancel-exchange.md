# NDC Modify Cancel Exchange

NDC modify and cancel flows.

## NDC Refund Quote and Seat/Ancillary cancel

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/canceloffer](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/cancelworkbenchoffer.md): The NDC Refund Quote API determines what if any refund value may be available on a ticket. It is part of the NDC cancel workflow: Create a workbench session, send Refund Quote as detailed here, and send Cancel to cancel the ticket and issue any refund. For supporting NDC carriers only, you can cancel only specified segments in Refund Quote instead of the entire itinerary. In this case, the ticket value is retained at Cancel.Refund Quote is mandatory when canceling a ticket outside the void period and there is any difference between a refund due and the purchase price. If Refund Quote is not sent, and a refund is not available for the exact amount of the purchase price, Cancel returns the error message OFFER CANNOT BE CANCELED WHEN REFUND AMOUNT DOES NOT EQUAL OFFER PRICE. PERFORM A REFUND QUOTE AND TRY AGAIN. The Ancillary Cancel API supports canceling baggage and/or paid seats for both GDS and NDC, and canceling non-baggage ancillaries for NDC. Canceling non-baggage ancillaries for GDS is not supported. Ancillary Cancel must be sent in a workbench session: Create a workbench, send Ancillary Cancel, and commit the workbench. You can cancel ancillaries booked in the same or a previous session. Seat and ancillary cancel support varies in the booking workflow. See the Seats Guide and Ancillary Guide for support details. Only one paid seat per workbench session can be canceled. To cancel multiple seats, send one cancel request, commit the workbench, and start a new workbench to cancel the next seat. For paid bags, you can send multiple cancel requests in a post-commit workbench session. You cannot cancel ancillaries or seats from a ticketed itinerary.

## Reservation Cancel

- [POST /air/receipt/reservations/{ReservationResource_Identifier}/receipts](https://developer.travelport.com/apis/flights/modify-bookings/cancelreservation.md): Create a set of offer cancellation receipts for every offer in the reservation.

## NDC Refund Quote and Seat/Ancillary cancel

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/canceloffer](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/cancelworkbenchoffer.md): The NDC Refund Quote API determines what if any refund value may be available on a ticket. It is part of the NDC cancel workflow: Create a workbench session, send Refund Quote as detailed here, and send Cancel to cancel the ticket and issue any refund. For supporting NDC carriers only, you can cancel only specified segments in Refund Quote instead of the entire itinerary. In this case, the ticket value is retained at Cancel.Refund Quote is mandatory when canceling a ticket outside the void period and there is any difference between a refund due and the purchase price. If Refund Quote is not sent, and a refund is not available for the exact amount of the purchase price, Cancel returns the error message OFFER CANNOT BE CANCELED WHEN REFUND AMOUNT DOES NOT EQUAL OFFER PRICE. PERFORM A REFUND QUOTE AND TRY AGAIN. The Ancillary Cancel API supports canceling baggage and/or paid seats for both GDS and NDC, and canceling non-baggage ancillaries for NDC. Canceling non-baggage ancillaries for GDS is not supported. Ancillary Cancel must be sent in a workbench session: Create a workbench, send Ancillary Cancel, and commit the workbench. You can cancel ancillaries booked in the same or a previous session. Seat and ancillary cancel support varies in the booking workflow. See the Seats Guide and Ancillary Guide for support details. Only one paid seat per workbench session can be canceled. To cancel multiple seats, send one cancel request, commit the workbench, and start a new workbench to cancel the next seat. For paid bags, you can send multiple cancel requests in a post-commit workbench session. You cannot cancel ancillaries or seats from a ticketed itinerary.

## NDC Reshop

- [POST /air/change/catalogofferingsairchange](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/createndcexchangesearch.md): NDC only; not supported for GDS. The Reshop API searches for a new itinerary when modifying a held booking or exchanging a ticket for NDC. Reshop is part of the NDC modify/exchange workflow. Create a post-commit workbench, Reshop as detailed here, Reprice to confirm pricing, and commit the workbench to confirm the changes.

## Modify

- [POST /air/modify/reservations/{Identifier}](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/ndcmodifyreservation.md): After all required changes any optional steps in a booking workbench session, send a POST request with the workbench identifier to commit the order changes in the workbench.

## Reservation Cancel

- [POST /air/receipt/reservations/{ReservationResource_Identifier}/receipts](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/cancelreservation.md): Create a set of offer cancellation receipts for every offer in the reservation.

## NDC reprice

- [POST /air/reprice/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromcatalogofferings](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/workbenchndcbuildfromcatalogofferings.md): Use the Add Offer reference payload request to add an offer to the reservation workbench as part of the booking workflow. The reference payload request sends identifiers from the Search response instead of full itinerary details. NDC supports only the reference payload. For GDS, you can send either a reference payload or a full payload.

## Standalone reprice

- [POST /air/reprice/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromoffer](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/repricebuildfromoffer.md): NDC only; not supported for GDS. Not supported for all NDC carriers. Use the Standalone Reprice API to reprice an itinerary on a held booking for NDC. Standalone Reprice can be sent before or after the price guarantee expires. This request would typically be used to check if the price has changed before issuing a ticket. You can then either ticket the itinerary or hold the booking again. Standalone Reprice must be sent in a workbench session. It must be followed by a Modify request to commit the workbench and either ticket or hold the itinerary. If you want to ticket at Modify, send Form of Payment and Payment before Modify. For supporting NDC carriers, see 'Reprice a Booking' in the Deferred Payment section in NDC capabilities by airline through JSON API in the Travelport Knowledge Base.

## Cancel payment

- [POST /air/paymentoffer/reservationworkbench/{ReservationResource_Identifier}/payments/{id}](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/cancelpayment.md): NDC only; not supported for GDS. Supported only for Qantas (QF). For NDC on supporting carriers only, you can use the Cancel Payment API to cancel the payment on a ticket. This refunds the payment, cancels the ticket but retains the itinerary, and creates a held booking for later fulfillment. For example, you might want to use this workflow to use a different payment method than was sent in ticketing. You must establish a workbench session before sending the Cancel Payment request detailed here. After sending Cancel Payment, you must commit the workbench to implement the change.

# NDC Refund Quote and Seat/Ancillary cancel

The NDC Refund Quote API determines what if any refund value may be available on a ticket. It is part of the NDC cancel workflow: Create a workbench session, send Refund Quote as detailed here, and send Cancel to cancel the ticket and issue any refund. For supporting NDC carriers only, you can cancel only specified segments in Refund Quote instead of the entire itinerary. In this case, the ticket value is retained at Cancel.Refund Quote is mandatory when canceling a ticket outside the void period and there is any difference between a refund due and the purchase price. If Refund Quote is not sent, and a refund is not available for the exact amount of the purchase price, Cancel returns the error message OFFER CANNOT BE CANCELED WHEN REFUND AMOUNT DOES NOT EQUAL OFFER PRICE. PERFORM A REFUND QUOTE AND TRY AGAIN. The Ancillary Cancel API supports canceling baggage and/or paid seats for both GDS and NDC, and canceling non-baggage ancillaries for NDC. Canceling non-baggage ancillaries for GDS is not supported. Ancillary Cancel must be sent in a workbench session: Create a workbench, send Ancillary Cancel, and commit the workbench. You can cancel ancillaries booked in the same or a previous session. Seat and ancillary cancel support varies in the booking workflow. See the Seats Guide and Ancillary Guide for support details. Only one paid seat per workbench session can be canceled. To cancel multiple seats, send one cancel request, commit the workbench, and start a new workbench to cancel the next seat. For paid bags, you can send multiple cancel requests in a post-commit workbench session. You cannot cancel ancillaries or seats from a ticketed itinerary.

Endpoint: POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/canceloffer
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

## Header parameters:

- `TraceId` (string)
  Identifier used to correlate Air API invocations across a multi-call business flows.
  Example: "TraceID_123456789"

- `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
  Identifies the Travelport access group with which the caller is associated
  Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

- `travelportPlusSessionIdentifier` (string)
  travelportPlusSessionIdentifier used to maintain an established agency session
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `TVP-PCC-Core` (string)
  Allows user to pass PCC instead of Access Group ID
  Example: "DU7_1G"

- `Accept-Encoding` (string, required)
  Comma-separated list of acceptable encodings like gzip and/or deflate
  Example: "gzip, deflate"

## Request fields (application/json):

- `@type` (string, required)
  Example: "OfferQueryCancelOffer"

- `BuildFromOffer` (object, required)

- `BuildFromOffer.@type` (string, required)
  Discriminator classes BuildFromOffer and BuildFromOfferAir
  Example: "BuildFromOffer"

- `BuildFromOffer.OfferIdentifier` (object, required)
  Travelport-generated offer identifier number.

- `BuildFromOffer.OfferIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "offer_1"

- `BuildFromOffer.OfferIdentifier.offerRef` (string)
  Used to reference another instance of this object in the same message
  Example: "offer_1"

- `BuildFromOffer.OfferIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BuildFromOffer.OfferIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `BuildFromOffer.OfferIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `BuildFromOffer.ProductIdentifier` (array)

- `BuildFromOffer.ProductIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "product_1"

- `BuildFromOffer.ProductIdentifier.productRef` (string)
  Used to reference another instance of this object in the same payload.
  Example: "product_1"

- `BuildFromOffer.ProductIdentifier.Identifier` (object)
  In next leg search Value from CatalogProductOffering/ProductBrandOptions/ProductBrandOffering/Product/productRef in the Search response for the product to select for the first leg of the itinerary. When sending a second Next Leg Search request in a multi-city search, this value should be the offer for the second leg of the itinerary, and so on for additional O&D pairs.

- `BuildFromOffer.ProductIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `BuildFromOffer.ProductIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `BuildFromOffer.PassengerCriteria` (array)
  Optional passenger criteria to associate request to a specific passenger.

- `BuildFromOffer.PassengerCriteria.@type` (string, required)
  Discriminator. No child classes.
  Example: "PassengerCriteria"

- `BuildFromOffer.PassengerCriteria.number` (integer, required)
  The amount of passengers associated with this passenger type code
  Example: 1

- `BuildFromOffer.PassengerCriteria.age` (integer)
  The age of the passenger. Travelport recommends sending age only with PTCs that require age for pricing. For child passengers, Travelport recommends sending the age of the child in the age attribute plus the PTC CNN. Travelport recommends against sending CNN without age, or the CHD PTC. Many fares cannot be quoted for CHD. The age for CNN is generally between 2 and 11 inclusive, with ADT fares returned for ages 12 and up; however, this can vary by airline and country. The age for INF must be either 0 or 1. During booking, date of birth is required for all child and infant PTCs (Add Traveler payload in Traveler/birthDate).
  Example: 26

- `BuildFromOffer.PassengerCriteria.passengerTypeCode` (string)
  Required field for Air Search and Flight specific search. The passenger type code for the passengers on the itinerary. Common PTCs are: ADT: adult CHD: child of unknown age (see Notes on PTC and age below) CNN: child when age is known INF: infant without a seat INS: infant with a seat UNN: unaccompanied child. See API guides to download a full list of PTCs. NDC carriers BA, SQ, AV, AA, and AF/KLM offer teen/young adult tax exemptions from the UK Air Passenger Duty (GB tax). Send PTC with the value YTH and send the passengers age per below. The PTC may be returned as ADT, or Cxx in which xx is the age, but the tax exemption is applied in the pricing on these NDC carriers. When running a multiple passenger search for NDC on Qantas, Qantas supports only these PTCs: ADT, CHD, CNN, INF. Sending any other PTC may result in an error at ticketing.
  Example: "ADT"

- `BuildFromOffer.PassengerCriteria.birthDate` (string)
  The date of birth of the passenger. May be used in age validation for fares with age restrictions.
  Example: "2020-01-16"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty` (array)
  Optional object for sending customer loyalty information, such as for a frequent flyer program. If CustomerLoyalty is sent in the Search request, it must also be sent in the Air Price request and the Add Traveler request. Some carriers validate frequent traveler data through the workflow, failing to send the same CustomerLoyalty details, even if invalid, may cause a booking failure. If an invalid number is sent, the response returns a warning message that the FQTV is invalid, and the invalid number is cached to prevent a potential booking failure. In Search API CustomerLoyalty is only sent to NDC carriers. Ignored for GDS Search.

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.value` (string, required)
  Number on loyalty card.
  Example: "132456"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.id` (string)
  Optional Customer Loyalty Id. Not saved
  Example: "Loyalty_1"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.priority` (integer)
  Optional Numeric Priority Code
  Example: 2

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.programId` (string)
  "Specifies an identifier to indicate the company owner of the loyalty program. Typically two characters.
  For frequent guest number, the hotel supplier or brand code.
  For frequent flyer number, the air supplier code of the loyalty program."
  Example: "United"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.programName` (string)
  Supplier's loyalty program name.
  Example: "Frontier-EarlyReturns"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.supplierType` (string)
  The type of supplier of a loyalty program. Uses 'hotel' for frequent guest number or 'air' for frequent flyer number.
  Example: "Airline"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.supplier` (string, required)
  Supplier of a loyalty program (typically 2 characters representing the hotel, brand, or airline).
  Example: "UA"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.tier` (string)
  Customer Loyalty tier
  Example: "Silver"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.shareWithSupplier` (array)
  The list of suppliers that the CustomerLoyalty number is shared. Used for cross accrual.
  Example: ["LH"]

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.cardHolderName` (string)
  Customer loyalty member name; up to 128 characters are supported. In Air Search, for discounted offers to be returned, the name must be sent as LAST FIRST; e.g.,if SMITH is the last name and JORDAN the first name, send as SMITH JORDAN
  Example: "John Smith"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.validatedInd` (boolean)
  Customer loyalty number has been validated by the supplier
  Example: true

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.prefix` (string)
  The cardholder name prefix title like Mr, Mrs, Dr
  Example: "Dr"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.given` (string)
  The First Name of the Cardholder
  Example: "John"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.middle` (string)
  Middle Name of the Cardholder
  Example: "Wilkinson"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.surname` (string)
  Last Name of the Cardholder
  Example: "Smith"

- `BuildFromOffer.PassengerCriteria.TravelerGeographicLocation` (object)
  Optional object for requesting local citizen/local resident fares for Spain and associated islands. You must also send a PTC relevant to the local resident fares; e.g., ADR for adult resident, CHR for child resident. Any discount applied through TravelerGeographicLocation applies to all travelers, not only to the traveler in this instance of PassengerCriteria. If the discount must apply only to an individual traveler, that traveler requires a separate search and book workflow.

- `BuildFromOffer.PassengerCriteria.TravelerGeographicLocation.value` (string)
  IATA code for the city, country, or state/province relevant to the local citizen//local resident fare.
  Example: "PMI"

- `BuildFromOffer.PassengerCriteria.TravelerGeographicLocation.travelerGeographicLocationType` (string)
  The geographic type of the location value
  Enum: "Country", "StateProvince", "City"

- `BuildFromOffer.PassengerCriteria.TravelerGeographicLocation.residentGeographicCode` (string)
  Resident code for Spanish residency fares for NDC. Any discount will apply to all travelers, not only to the traveler in this instance of PassengerCriteria. Supported/validated only for NDC to support local citizen fares.

- `BuildFromOffer.PassengerCriteria.TravelerGeographicLocation.generalLargeFamilyResidentDiscountInd` (boolean)
  Send only if true and request qualifies for general large family resident discount, defined as general large families (up to three children) from Spain, from the EU/EEA, or of any other nationality whose residency in Spain is recognized and who are in possession of a large-family certificate issued by the autonomous community in which they live. Supported/validated only for NDC to support local citizen fares.
  Example: true

- `BuildFromOffer.PassengerCriteria.TravelerGeographicLocation.specialLargeFamilyResidentDiscountInd` (boolean)
  Send only if true and request qualifies for special large family resident discount, defined as special large families (four or more children) from Spain, from the EU/EEA, or of any other nationality whose residency in Spain is recognized and who are in possession of a large-family certificate issued by the autonomous community in which they live. Supported/validated only for NDC to support local citizen fares.
  Example: true

- `BuildFromOffer.PassengerCriteria.specifiedPassengerTypeCodeOnlyInd` (boolean)
  If true, returns only offers for the specified PTC. If no offers for that PTC are available, an error message that offers were found is returned. GDS only; not supported for NDC. Default is false.
  Example: true

- `BuildFromOffer.PaymentCriteria` (object)
  Used to provide optional payment-card criteria in an Air Search request by sending the IssuerIdentifierNumber/BIN of the credit card to be used for payment. Sending the BIN returns OB fees in the response, which are ticketing and form of payment (FOP) fees, including credit card fees. Returned in an instance of Price/PriceBreakdown/Fees/Fee with a feeCode of OB.

- `BuildFromOffer.PaymentCriteria.@type` (string, required)
  discriminator
  Example: "PaymentCriteria"

- `BuildFromOffer.PaymentCriteria.IssuerIdentificationNumber` (string)
  6 to 11 digit number. The BIN/IIN of the credit card to be used for payment
  Example: "123456"

- `BuildFromOffer.PaymentCriteria.PaymentCardCode` (string)
  A two character code for a credit card
  Example: "VI"

- `BuildFromOffer.PaymentCriteria.DocumentNumber` (array)

- `BuildFromOffer.PaymentCriteria.DocumentNumber.value` (string)
  Example: "1259900123456"

- `BuildFromOffer.PaymentCriteria.DocumentNumber.documentIssuer` (string)
  Document issuer
  Example: "BA"

- `BuildFromOffer.PaymentCriteria.DocumentNumber.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `BuildFromOffer.PaymentCriteria.DocumentNumber.travelerIdentifierRef` (string)
  traveler identifier reference

- `BuildFromOffer.PaymentCriteria.DocumentNumber.name` (string)
  The name of the Traveler being referenced.

- `BuildFromOffer.PaymentCriteria.DocumentNumber.passengerTypeCode` (string)
  The passenger type code of the Traveler being referenced.
  Example: "ADT"

- `BuildFromOffer.PaymentCriteria.DocumentNumber.id` (string)
  A locally referenced ID

- `BuildFromOffer.PaymentCriteria.DocumentNumber.description` (string)
  Descriptive text used to identify the contents of a target object

- `BuildFromOffer.PaymentCriteria.DocumentNumber.uris` (array)
  The URI used to GET the target object in another domain.

- `BuildFromOffer.PaymentCriteria.FlightPass` (array)
  In Search API, for NDC flight pass bookings this is a required field and must reference the owner in PassengerCriteria. Only one permitted per Search request.

- `BuildFromOffer.PaymentCriteria.FlightPass.@type` (string, required)
  Discriminator. No child classes
  Example: "FlightPass"

- `BuildFromOffer.PaymentCriteria.FlightPass.accountNumber` (string, required)
  The flight pass account number
  Example: 140851633093

- `BuildFromOffer.PaymentCriteria.FlightPass.supplier` (string, required)
  The flight pass supplier code
  Example: "AC"

- `BuildFromOffer.PaymentCriteria.FlightPass.Description` (array)
  Example: ["FlightPass"]

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef` (array)
  In Search, use the passengerCriteriaRef to reference the owner of the flightpass. This is a mandatory field for Search API.

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.name` (string)
  Traveler identifier

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.passengerTypeCode` (string)
  Passenger Type code
  Example: "ADT"

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.ages` (array)
  The ages of the travelers associated to a particular ptc. For NDC, this value will be returned in PriceBreakdownAir if sent as part of the PassengerCriteria in the Air Search request.
  Example: [15]

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.passengerCriteriaRef` (string)
  Allows the user to associate passenger criteria information.
  Example: "passengerCriteria_1"

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.value` (string)

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.id` (string)
  A locally referenced ID

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.description` (string)
  Descriptive text used to identify the contents of a target object

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.uris` (array)
  Uniform Resource Identifier
  Example: ["google.com"]

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.age` (integer)
  Replaced with ages array. The age of the traveler.
  Example: 11

- `BuildFromOffer.PaymentCriteria.agencyAccountInd` (boolean)
  If true, payment will be made by agency account
  Example: true

- `BuildFromOffer.PaymentCriteria.bspInd` (boolean)
  If true, payment will be made by BSP
  Example: true

- `BuildFromOffer.PaymentCriteria.cashInd` (boolean)
  If true, payment will be made by cash
  Example: true

- `BuildFromOffer.PaymentCriteria.invoiceInd` (boolean)
  If true, payment will be made by invoice
  Example: true

- `TravelerIdentifier` (array)

## Response 200 fields (application/json):

- `OfferListResponse` (object)
  The response of an Offer list endpoint request.

- `OfferListResponse.OfferID` (array)

- `OfferListResponse.OfferID.@type` (string, required)
  "Discriminator classes for Air Price are OfferID, Offer, and OfferUpsell.
  Discriminator classes for Reservation and ReservationWorkbench are OfferID, Offer, OfferModify, and OfferUpsell.
  Discriminator classes for Hotel Rules are OfferID and Offer."
  Example: "Offer"

- `OfferListResponse.OfferID.id` (string)
  Offer identifier sent in the reference payload request to book that offer. Not returned in the full payload response; this is the only difference in the two responses.
  Example: "offer_1"

- `OfferListResponse.OfferID.offerRef` (string)
  Used to reference another instance of this object in the same message
  Example: "offer_1"

- `OfferListResponse.OfferID.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `OfferListResponse.OfferID.ContentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

- `OfferListResponse.@type` (string)
  Example: "response"

- `OfferListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `OfferListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `OfferListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `OfferListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `OfferListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `OfferListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `OfferListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `OfferListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `OfferListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `OfferListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `OfferListResponse.Result.Error.NameValuePair` (array)

- `OfferListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `OfferListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `OfferListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `OfferListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `OfferListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `OfferListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `OfferListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `OfferListResponse.Result.Warning.NameValuePair` (array)

- `OfferListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `OfferListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `OfferListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `OfferListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `OfferListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `OfferListResponse.NextSteps.NextStep` (array, required)

- `OfferListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `OfferListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `OfferListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `OfferListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `OfferListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `OfferListResponse.ReferenceList` (array)

- `OfferListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `OfferListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `OfferListResponse.CurrencyRateConversion` (array)

- `OfferListResponse.CurrencyRateConversion.@type` (string)

- `OfferListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `OfferListResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `OfferListResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `OfferListResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `OfferListResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `OfferListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `OfferListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `OfferListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `OfferListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `OfferListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `OfferListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `OfferListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `OfferListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `OfferListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `OfferListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `OfferListResponse.Pagination.totalItems` (integer, required)
  The total number of pages in this result set
  Example: 100

## Response 400 fields (application/json):

- `ErrorResponse` (object)
  Base common error response

- `ErrorResponse.@type` (string)
  Example: "response"

- `ErrorResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `ErrorResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `ErrorResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `ErrorResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `ErrorResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `ErrorResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `ErrorResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `ErrorResponse.ReferenceList` (array)

- `ErrorResponse.CurrencyRateConversion` (array)

- `ErrorResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

# NDC Reshop

NDC only; not supported for GDS. The Reshop API searches for a new itinerary when modifying a held booking or exchanging a ticket for NDC. Reshop is part of the NDC modify/exchange workflow. Create a post-commit workbench, Reshop as detailed here, Reprice to confirm pricing, and commit the workbench to confirm the changes.

Endpoint: POST /air/change/catalogofferingsairchange
Version: 11.33.0
Security: bearerAuth

## Header parameters:

- `TraceId` (string)
  Identifier used to correlate Air API invocations across a multi-call business flows.
  Example: "TraceID_123456789"

- `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
  Identifies the Travelport access group with which the caller is associated
  Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

- `travelportPlusSessionIdentifier` (string)
  travelportPlusSessionIdentifier used to maintain an established agency session
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `TVP-PCC-Core` (string)
  Allows user to pass PCC instead of Access Group ID
  Example: "DU7_1G"

- `Accept-Encoding` (string, required)
  Comma-separated list of acceptable encodings like gzip and/or deflate
  Example: "gzip, deflate"

## Request fields (application/json):

- `@type` (string, required)
  Example: "CatalogOfferingsQueryAirChange"

- `CatalogOfferingsAirChangeRequest` (object, required)
  Discriminator classes CatalogOfferingsAirChangeRequestReservation or CatalogOfferingsAirChangeRequestDocumentNumber

- `CatalogOfferingsAirChangeRequest.@type` (string, required)
  Example: "CatalogOfferingsAirChangeRequestReservation"

- `CatalogOfferingsAirChangeRequest.catalogOfferingsPerPage` (integer)
  Catalog Offerings per page value
  Example: 5

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight` (array, required)

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.departureDate` (string)
  Preferred local departure date in YYYY-MM-DD format. For GDS, send either departureDate or arrivalDate. If both departureDate and arrivalDate are sent, departureDate is ignored. For NDC, departureDate is required. For GDS content, departureDate is not required when sending arrivalDate.

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.daysBeforeDeparture` (integer)
  Available for flex search only. Return flight options within a number of days from specified departure date. Maximum of 3 days can be selected.
  Example: 1

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.daysAfterDeparture` (integer)
  Available for flex search only. Return flight options within a number of days from specified departure date. Maximum of 3 days can be selected.
  Example: 2

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.departureTime` (string)
  Returns NDC offers with flights between two hours before and two hours after the departure time; for example, for departureTime of 10:00:00, Search returns available flights between 8:00 and 12:00. Do not use for GDS; instead, use DepartureTimeRange. For NDC content, if multiple time options are sent in the same instance of SearchCriteriaFlight, they are applied in the order DepartureTimeRange, departureTime, and arrivalTime.
  Example: "07:00:00"

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.arrivalDate` (string)
  Date of arrival in YYYY-MM-DD format. For GDS, send either arrivalDate or departureDate. If both departureDate and arrivalDate are sent, departureDate is ignored. For NDC, arrivalDate is optional and departureDate is always required; if sent, offers returned are filtered by both arrivalDate and departureDate.

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.arrivalTime` (string)
  Returns NDC offers with flights between two hours before and two hours after the arrival time; for example, for arrivalTime of 10:00:00, Search returns available flights between 8:00 and 12:00. Do not use for GDS; instead, use ArrivalTimeRange. Supported only by specific NDC carriers. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC Resources if you need login assistance).
  Example: "09:15:00"

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.legSequence` (integer)
  Recommended to send when requesting cabin, class of service, and/or connection preferences at the leg level. See example in Air Search guide. Do not send if requesting preferences at itinerary level.

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.From` (object, required)
  Origin Destination Information

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.From.value` (string)
  The IATA airport or city code for the departure or arrival airport/city for this leg.
  Example: "MEX"

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.From.cityOrAirport` (string)
  Optional enumeration specifying whether to restrict the search based on the city/airport code sent in From/value. Possible options and behavior are as follows. These behaviors are for availability selection only. Actual content may vary based on calculated price and diversity. Not all NDC carriers may support all options. Airport code with no cityOrAirport value expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. This behavior also applies to: city code with Airport Only, City code with City Only, City or airport code with City or Airport. Airport code with cityOrAirport value Airport Only returns content only from the specified airport. For example, LGA will return content from only LGA. Airport code with cityOrAirport value City expands the availability selection to the city without giving preference to the requested airport. This behavior is equivalent to searching with the airport's city code. For example, LGA would instead be treated as NYC and would return flights for LGA, EWR, and JFK with no preference.
  Enum: "Airport Only", "City or Airport", "City Only", "Use Default"

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.From.radius` (integer)
  Available for flex search only. Return offers from airports within a specified distance from the origin and/or destination.
  Example: 50

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.From.radiusMeasurement` (string)
  For Hotels: Optional object to request either miles or kilometers for the search radius from the specified location. If unitOfDistance is not specified, the search defaults to miles for properties in the United States, Myanmar, and Liberia. The search defaults to kilometers in all other countries.
  Enum: "Miles", "Kilometers"

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.To` (object, required)
  Origin Destination Information

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.AdditionalFrom` (array)
  Available for flex search only. Select additional origin cities to expand your flight options.

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.AdditionalFrom.value` (string)
  The additional IATA airport or city codes for the departure or arrival airport/city for this leg.
  Example: "LGW"

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.AdditionalFrom.cityOrAirport` (string)
  Optional enumeration specifying whether to restrict the search based on the city/airport code sent in From/value. Possible options and behavior are as follows. These behaviors are for availability selection only. Actual content may vary based on calculated price and diversity. Not all NDC carriers may support all options. Airport code with no cityOrAirport value expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. This behavior also applies to: city code with Airport Only, City code with City Only, City or airport code with City or Airport. Airport code with cityOrAirport value Airport Only returns content only from the specified airport. For example, LGA will return content from only LGA. Airport code with cityOrAirport value City expands the availability selection to the city without giving preference to the requested airport. This behavior is equivalent to searching with the airport's city code. For example, LGA would instead be treated as NYC and would return flights for LGA, EWR, and JFK with no preference.
  Enum: "Airport Only", "City or Airport", "City Only", "Use Default"

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.AdditionalTo` (array)
  Available for flex search only. Select additional destination cities to expand your flight options.

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.DepartureTimeRange` (object)
  In Air Search API supports searching by a departure or arrival time window for any leg of the itinerary. For NDC, supported only by specific NDC carriers. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC Resources if you need login assistance).

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.DepartureTimeRange.start` (string)
  The start time of the departure or arrival time window to search. Either start or end is required.
  Example: "06:15:00"

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.DepartureTimeRange.end` (string)
  The end time of the departure or arrival time window to search. Either start or end is required.
  Example: "09:15:00"

- `CatalogOfferingsAirChangeRequest.SearchCriteriaFlight.ArrivalTimeRange` (object)
  In Air Search API supports searching by a departure or arrival time window for any leg of the itinerary. For NDC, supported only by specific NDC carriers. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC Resources if you need login assistance).

- `CatalogOfferingsAirChangeRequest.PassengerCriteria` (array, required)

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.@type` (string, required)
  Discriminator. No child classes.
  Example: "PassengerCriteria"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.number` (integer, required)
  The amount of passengers associated with this passenger type code
  Example: 1

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.age` (integer)
  The age of the passenger. Travelport recommends sending age only with PTCs that require age for pricing. For child passengers, Travelport recommends sending the age of the child in the age attribute plus the PTC CNN. Travelport recommends against sending CNN without age, or the CHD PTC. Many fares cannot be quoted for CHD. The age for CNN is generally between 2 and 11 inclusive, with ADT fares returned for ages 12 and up; however, this can vary by airline and country. The age for INF must be either 0 or 1. During booking, date of birth is required for all child and infant PTCs (Add Traveler payload in Traveler/birthDate).
  Example: 26

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.passengerTypeCode` (string)
  Required field for Air Search and Flight specific search. The passenger type code for the passengers on the itinerary. Common PTCs are: ADT: adult CHD: child of unknown age (see Notes on PTC and age below) CNN: child when age is known INF: infant without a seat INS: infant with a seat UNN: unaccompanied child. See API guides to download a full list of PTCs. NDC carriers BA, SQ, AV, AA, and AF/KLM offer teen/young adult tax exemptions from the UK Air Passenger Duty (GB tax). Send PTC with the value YTH and send the passengers age per below. The PTC may be returned as ADT, or Cxx in which xx is the age, but the tax exemption is applied in the pricing on these NDC carriers. When running a multiple passenger search for NDC on Qantas, Qantas supports only these PTCs: ADT, CHD, CNN, INF. Sending any other PTC may result in an error at ticketing.
  Example: "ADT"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.birthDate` (string)
  The date of birth of the passenger. May be used in age validation for fares with age restrictions.
  Example: "2020-01-16"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty` (array)
  Optional object for sending customer loyalty information, such as for a frequent flyer program. If CustomerLoyalty is sent in the Search request, it must also be sent in the Air Price request and the Add Traveler request. Some carriers validate frequent traveler data through the workflow, failing to send the same CustomerLoyalty details, even if invalid, may cause a booking failure. If an invalid number is sent, the response returns a warning message that the FQTV is invalid, and the invalid number is cached to prevent a potential booking failure. In Search API CustomerLoyalty is only sent to NDC carriers. Ignored for GDS Search.

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.value` (string, required)
  Number on loyalty card.
  Example: "132456"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.id` (string)
  Optional Customer Loyalty Id. Not saved
  Example: "Loyalty_1"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.priority` (integer)
  Optional Numeric Priority Code
  Example: 2

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.programId` (string)
  "Specifies an identifier to indicate the company owner of the loyalty program. Typically two characters.
  For frequent guest number, the hotel supplier or brand code.
  For frequent flyer number, the air supplier code of the loyalty program."
  Example: "United"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.programName` (string)
  Supplier's loyalty program name.
  Example: "Frontier-EarlyReturns"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.supplierType` (string)
  The type of supplier of a loyalty program. Uses 'hotel' for frequent guest number or 'air' for frequent flyer number.
  Example: "Airline"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.supplier` (string, required)
  Supplier of a loyalty program (typically 2 characters representing the hotel, brand, or airline).
  Example: "UA"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.tier` (string)
  Customer Loyalty tier
  Example: "Silver"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.shareWithSupplier` (array)
  The list of suppliers that the CustomerLoyalty number is shared. Used for cross accrual.
  Example: ["LH"]

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.cardHolderName` (string)
  Customer loyalty member name; up to 128 characters are supported. In Air Search, for discounted offers to be returned, the name must be sent as LAST FIRST; e.g.,if SMITH is the last name and JORDAN the first name, send as SMITH JORDAN
  Example: "John Smith"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.validatedInd` (boolean)
  Customer loyalty number has been validated by the supplier
  Example: true

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.prefix` (string)
  The cardholder name prefix title like Mr, Mrs, Dr
  Example: "Dr"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.given` (string)
  The First Name of the Cardholder
  Example: "John"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.middle` (string)
  Middle Name of the Cardholder
  Example: "Wilkinson"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.CustomerLoyalty.surname` (string)
  Last Name of the Cardholder
  Example: "Smith"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.TravelerGeographicLocation` (object)
  Optional object for requesting local citizen/local resident fares for Spain and associated islands. You must also send a PTC relevant to the local resident fares; e.g., ADR for adult resident, CHR for child resident. Any discount applied through TravelerGeographicLocation applies to all travelers, not only to the traveler in this instance of PassengerCriteria. If the discount must apply only to an individual traveler, that traveler requires a separate search and book workflow.

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.TravelerGeographicLocation.value` (string)
  IATA code for the city, country, or state/province relevant to the local citizen//local resident fare.
  Example: "PMI"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.TravelerGeographicLocation.travelerGeographicLocationType` (string)
  The geographic type of the location value
  Enum: "Country", "StateProvince", "City"

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.TravelerGeographicLocation.residentGeographicCode` (string)
  Resident code for Spanish residency fares for NDC. Any discount will apply to all travelers, not only to the traveler in this instance of PassengerCriteria. Supported/validated only for NDC to support local citizen fares.

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.TravelerGeographicLocation.generalLargeFamilyResidentDiscountInd` (boolean)
  Send only if true and request qualifies for general large family resident discount, defined as general large families (up to three children) from Spain, from the EU/EEA, or of any other nationality whose residency in Spain is recognized and who are in possession of a large-family certificate issued by the autonomous community in which they live. Supported/validated only for NDC to support local citizen fares.
  Example: true

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.TravelerGeographicLocation.specialLargeFamilyResidentDiscountInd` (boolean)
  Send only if true and request qualifies for special large family resident discount, defined as special large families (four or more children) from Spain, from the EU/EEA, or of any other nationality whose residency in Spain is recognized and who are in possession of a large-family certificate issued by the autonomous community in which they live. Supported/validated only for NDC to support local citizen fares.
  Example: true

- `CatalogOfferingsAirChangeRequest.PassengerCriteria.specifiedPassengerTypeCodeOnlyInd` (boolean)
  If true, returns only offers for the specified PTC. If no offers for that PTC are available, an error message that offers were found is returned. GDS only; not supported for NDC. Default is false.
  Example: true

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir` (object)
  Add one or more optional modifiers to filter search results by criteria related to the journey itself. All journey modifiers are in CatalogProductOfferingsQueryRequest/CatalogProductOfferingsRequest/SearchModifiersAir. Any modifiers sent in the initial Search request are applied to any subsequent Next Leg Search request. All modifiers apply to the entire itinerary, not at the leg level, unless otherwise specified with legSequence per below.

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.@type` (string, required)
  discriminator
  Example: "SearchModifiersAir"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.excludeGround` (string)
  Excludes certain ground transportation from the response. By default, the response may return ground transportation options such as trains and buses, depending on the routing. In the response, ground transportation options are identified in ReferenceList/Flight by the TRN, TRS, or BUS equipment codes.GDS only, not supported for NDC.
  Enum: "Train", "All"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.CarrierPreference` (array)

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.CarrierPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "CarrierPreference"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.CarrierPreference.preferenceType` (string, required)
  The type of carrier preference
  Enum: "Preferred", "Permitted", "Prohibited"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.CarrierPreference.carriers` (array, required)
  One or more carrier codes to permit, prohibit, or prefer. Preferred alliances are also supported; send the alliance code (e.g., /\*A) instead of the carrier code.
  Example: ["BA"]

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.CarrierPreference.legSequence` (array)
  Applies the carrier/alliance preference to only specific legs of the itinerar referencing legSequence sent in SearchCriteriaFlight. Do not send if requesting preference at itinerary level. GDS only, not supported for NDC.
  Example: [1,2]

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.CabinPreference` (array)

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.CabinPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "CabinPreference"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.CabinPreference.preferenceType` (string)
  Sending a mix of preferenceType values is not supported. For example, you cannot send an instance of CabinPreference with a preferenceType of Permitted and another instance with preferenceType of Prohibited. In this case the results default to the Preferred preference.
  Enum: "Preferred", "Permitted", "PreferredWithUpgrade", "Prohibited"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.CabinPreference.cabins` (array)
  A space-delimited list of cabins.
  Enum: "PremiumFirst", "First", "Business", "PremiumEconomy", "Economy"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.CabinPreference.legSequence` (array)
  Limits preference to the specified leg referenced in SearchCriteriaFlight. You can apply the preference to only some legs of the itinerary, or different preferences to different legs. To apply preference to the entire itinerary, do not send legSequence. GDS only, not supported for NDC. Not supported at Price or Book.
  Example: [1,2]

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ClassOfServicePreference` (array)

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ClassOfServicePreference.@type` (string)
  Discriminator. No child classes exist
  Example: "ClassOfServicePreference"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ClassOfServicePreference.legSequence` (array)
  Applies preference to specified leg/s of the itinerary, referencing the leg sequence in SearchCriteriaFlight. Do not send if requesting preference at itinerary level.
  Example: [1,2]

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ClassOfServicePreference.ClassesOfService` (array, required)
  One or more classes of service to permit or prohibit.
  Example: ["F"]

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ClassOfServicePreference.PreferenceType` (string)
  Class of Service preference options.
  Enum: "Preferred", "Permitted", "Prohibited"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ProductInclusionPreference` (array)

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ProductInclusionPreference.@type` (string)
  Discriminator. No child classes exist
  Example: "ProductInclusionPreference"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ProductInclusionPreference.Classification` (array, required)
  Send one or more of the enumerated values to return only fares that include those attributes in the price. For example, sending CarryOn returns only fares that include a carry-on bag in the price.
  Enum: "CheckedBag", "CarryOn", "PersonalItem", "Rebooking", "Refund", "SeatAssignment", "PremiumSeat", "LieFlatSeat", "Meals", "WiFi", "Other"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ProductInclusionPreference.AdditionalClassification` (array)
  Currently unused. Only items enumerated in BrandClassificationENUM are currently supported. Any additional items sent are ignored and the lowest fares are returned regardless of associated brand attributes.
  Example: ["PremiumDrinks"]

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ProductInclusionPreference.legSequence` (array)
  Leg sequence is not supported for ProductInclusionPreference. Preference will be applied to the whole journey.
  Example: [1,2]

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ProductInclusionPreference.exactMatchInd` (boolean)
  Will not implement. The default behavior will be to provide an exact match to the product inclusion preferences.
  Example: true

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ProductInclusionPreference.bestMatchInd` (boolean)
  Will not implement. The default behavior will be to provide an exact match to the product inclusion preferences.
  Example: true

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ConnectionPreferences` (array)

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ConnectionPreferences.@type` (string)
  Discriminator classes ConnectionPreferences or ConnectionPreferencesAir. Must send â€œConnectionPreferencesAirâ€ when sending FlightType. If the @type value is not sent, FlightType is ignored for GDS; for NDC, a time out error is returned.

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ConnectionPreferences.legSequence` (array)
  Applies preference to only specific leg/s of the itinerary referencing legSequence sent in SearchCriteriaFlight. Do not send for preference at itinerary level.
  Example: [1,2,4]

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ConnectionPreferences.maxConnectionDuration` (string)
  Limits results to itineraries that do not exceed a set length of time between flights on the same leg. Applies to all connections on the itinerary. Use the format PT{x}H, in which P is the duration designator, T is the time designator, and {x}H is the number of hours the connection should not exceed . For minutes use {x}H{x}M. GDS only, not supported for NDC.
  Example: "PT3H30M"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ConnectionPreferences.maxOvernightDuration` (string)
  Limits results to itineraries that do not exceed a set length of time for any overnight connection. If the first flight in the connection arrives on one calendar date and the connecting flight arrives on another calendar date, this constitutes an overnight connection. Use the format PT{x}H, in which P is the duration designator, T is the time designator, and {x}H is the number of hours the connection should not exceed. For minutes use {x}H{x}M. GDS only, not supported for NDC.
  Example: "PT6H30M"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ConnectionPreferences.preferenceType` (string, required)
  The type of connection preference. Only one preference type can be requested for an O&D pair.
  Enum: "Preferred", "Permitted", "Prohibited"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ConnectionPreferences.ConnectionPoint` (array, required)
  IATA code for the connecting location/s for this preference. For example, if you specify three locations, any flights connecting in any one of those locations will be permitted/preferred/prohibited per the specified preferenceType.

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ConnectionPreferences.cityOrAirport` (string)
  Optional enumeration specifying whether to restrict the search based on the city/airport code sent in From/value. Possible options and behavior are as follows. These behaviors are for availability selection only. Actual content may vary based on calculated price and diversity. Not all NDC carriers may support all options. Airport code with no cityOrAirport value expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. This behavior also applies to: city code with Airport Only, City code with City Only, City or airport code with City or Airport. Airport code with cityOrAirport value Airport Only returns content only from the specified airport. For example, LGA will return content from only LGA. Airport code with cityOrAirport value City expands the availability selection to the city without giving preference to the requested airport. This behavior is equivalent to searching with the airport's city code. For example, LGA would instead be treated as NYC and would return flights for LGA, EWR, and JFK with no preference.
  Enum: "Airport Only", "City or Airport", "City Only", "Use Default"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ConnectionPreferences.FlightType` (object)
  The type of flight connection

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ConnectionPreferences.FlightType.@type` (string, required)
  Discriminator. No child classes.
  Example: "FlightType"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ConnectionPreferences.FlightType.connectionType` (string)
  Limits the connection type returned. Each value returns the specified type and all higher types. For example, StopDirect could return both flights that stop without a change of planes (StopDirect) and non-stop direct flights (NonStopDirect). SingleConnection or DoubleConnection will not exclude StopDirect flights from the journey. For example, SingleConnection could return an itinerary with two flight numbers, and either of these flights could have intermediate stops.
  Enum: "NonStopDirect", "StopDirect", "SingleConnection", "DoubleConnection", "TripleConnection"

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.ConnectionPreferences.FlightType.excludeInterlineConnectionsInd` (boolean)
  Excludes interline connectionsClosed from results. If true, does not return offers with interline connections. If false or omitted, may return interline connections in results. Default is false. GDS only, not supported for NDC. When a product contains multiple interline air segments, brand details return only the brand of the significant carrier, not the validating/plating carrier brand information. The IATA rules for determining the significant carrier on an itinerary are based on the areas in which the transportation takes place.
  Example: true

- `CatalogOfferingsAirChangeRequest.SearchModifiersAir.prohibitChangeOfAirportInd` (boolean)
  Suppresses return of offers that require a change of airport at connection. If true, excludes itineraries that require changing airports during connections. If false or omitted, may return itineraries that require change of airport. Default is false.
  Example: true

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange` (object)
  Pricing Modifiers that can be used to influence the Price of an Exchanged Offer

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.@type` (string)
  Example: "PricingModifiersAirChange"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.currencyCode` (string)
  ISO 4217 currency code
  Example: "USD"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection` (object)
  May include FareSelectionDetail, RefundOptions, ChangeOptions objects.

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.@type` (string, required)
  Discriminator. Child class FareSelectionDetail.
  Example: "FareSelection"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.fareType` (string)
  Defines the type of fares to return (Only public fares, Only private fares, Only agency private fares, Only
  Enum: "PublicFaresOnly", "PrivateFaresOnly", "AgencyPrivateFaresOnly", "AirlinePrivateFaresOnly", "PublicAndPrivateFares", "NetFaresOnly", "AllFares"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.RefundOptions` (object)
  Supports requesting only fares that meet certain refund criteria. GDS only; not supported for NDC. Search supports sending up to 12 refundability options. The following combinations are mutually exclusive; if sent, Search ignores them and returns a warning message: NonRefundable cannot also be sent with PartialRefund. Refundable cannot also be sent with ChangeOptions/changeTypes=PenaltyToChange

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.RefundOptions.@type` (string, required)
  Discriminator. No child classes.
  Example: "RefundOptions"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.RefundOptions.refundTypes` (array, required)
  Enum: "Refundable", "NonRefundable", "PartialRefund"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.RefundOptions.RefundPenaltyRange` (object)
  Not currently supported. User can express a minimum and maximum Refund penalty range that will be included in the result set.

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.RefundOptions.RefundPenaltyRange.@type` (string)
  Example: "RefundPenaltyRange"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.RefundOptions.RefundPenaltyRange.Minimum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.RefundOptions.RefundPenaltyRange.Minimum.@type` (string, required)
  Discriminator classes AmountPercentAmount or AmountPercentPercent
  Example: "AmountPercentAmount"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.RefundOptions.RefundPenaltyRange.Minimum.application` (string)
  Type of commission
  Enum: "Full", "Partial", "Non-paying", "No-show", "Adjustment", "Commissionable"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.RefundOptions.RefundPenaltyRange.Maximum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.ChangeOptions` (object)
  Supports requesting only fares that meet certain change criteria. GDS only; not supported for NDC. Search supports sending up to 12 changeability options. ChangeOptions.changeTypes=PenaltyToChange cannot be sent with RefundOptions.Refundable. If sent, Search ignores them and returns a warning message

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.ChangeOptions.@type` (string)
  Discriminator. No child classes.
  Example: "ChangeOptions"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.ChangeOptions.changeTypes` (array, required)
  Enum: "Changeable", "NonChangeable", "PenaltyToChange"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.ChangeOptions.ChangePenaltyRange` (object)
  Not currently supported. User can express a minimum and maximum Change penalty range that will be included in the result set

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.ChangeOptions.ChangePenaltyRange.@type` (string)
  Example: "ChangePenaltyRange"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.ChangeOptions.ChangePenaltyRange.Minimum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.ChangeOptions.ChangePenaltyRange.Maximum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.FareQualiferString` (array)
  Request specific private leisure fares. Supported values vary by NDC carrier. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API in the guide section. This value is returned in FlightProduct.FareQualifierString if supplied by the airline. (Note the misspelling in request parameter)
  Example: ["Tour"]

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.FareQualifier` (array)

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.FareSelection.FareQualifier.value` (string)
  Deprecated - do not use. Replaced by FareQualiferString
  Enum: "Consolidator", "Government", "Marine", "Military", "Reward", "StandBy", "Staff", "Student", "Tour", "Youth", "VistFriendsAndRelatives"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation` (object)
  In search API sends account code/s to request negotiated fares. For NDC supports corporate loyalty program and GST Information. This information is returned in TermsAndConditions.OrganizationInformation.

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.@type` (string, required)
  Discriminator. No child classes
  Example: "OrganizationInformation"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.OrganizationIdentifier` (array)

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.OrganizationIdentifier.value` (string)
  The value of the code type.
  Example: "JBD123456"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.OrganizationIdentifier.supplier` (string)
  The IATA code for the airline on which the code type is applicable.
  Example: "AA"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.OrganizationIdentifier.organizationCodeType` (string)
  Sends a description for the OrganizationIdentifer value
  Enum: "Account", "OrganizationLoyaltyProgram", "Tour", "TicketDesignator"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.OrganizationIdentifier.segmentSequenceList` (array)
  Returned in response when the code is applicable to a specified segment sequence
  Example: [1,2,3]

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.OrganizationIdentifier.productRef` (array)
  Returned in response when the code is applicable to a specified product
  Example: ["product_1"]

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.OrganizationIdentifier.accountCodeFaresOnlyInd` (boolean)
  Indicator to limit the fares returned to only fares filed for the specified account code. If true, returns only fares filed for the account code/s in OrganizationIdentifier/value. If sending multiple account codes, send with each instance of OrganizationIdentifier. If false or omitted, returns account fares and other fares. Default is false. If an account code is sent without accountCodeFaresOnlyInd=true, the response includes any fares filed for that account code plus fares that are not specific to the account code. If accountCodeFaresOnlyInd=true and no account code is sent, the indicator is ignored and the response returns all fares and a warning message that the request must include an account code. GDS only; not supported for NDC.
  Example: true

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.GSTRegistrationNumber` (array)
  NDC only. Supported during book 'Add Offer' workflow.

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.GSTRegistrationNumber.value` (string, required)
  The GST registered number for the business.
  Example: "07AAGFF2194N1Z1"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.GSTRegistrationNumber.telephone` (string, required)
  Business telephone number
  Example: "222-222-222"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.GSTRegistrationNumber.address` (string, required)
  Business address
  Example: "1122 sample trail, CO, USA, 21232"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.GSTRegistrationNumber.country` (string, required)
  IATA country code of the business.
  Example: "IND"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.GSTRegistrationNumber.companyName` (string, required)
  Business name
  Example: "Adecco"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.OrganizationInformation.GSTRegistrationNumber.email` (string, required)
  Business E-Mail
  Example: "sample@adecco.com"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.WaiverCode` (object)
  A code assigned by an airline to support waiver of fees or ticket value as a result of disruption to the passenger.

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.WaiverCode.value` (string)

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.WaiverCode.reasonCode` (integer)
  A code assigned to identify the reason for disruption
  Example: 2

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.WaiverCode.waiverType` (string)
  List of waiver types.
  Enum: "ChangePenalty", "PriceDifference", "ChangePenaltyAndPriceDifference", "RefundPenalty", "NameChangePenalty"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.TaxExemption` (object)
  GDS only, not supported for NDC. Marks as tax exempt either all taxes, only specific tax codes, or all taxes in specific countries. Send either allTaxesExemptInd OR countries and taxCodes per below. TaxExemption supports up to nine values for countries, for taxCodes, or for countries and taxCodes combined. The response returns any exempt taxes with exemptInd=true and a zero value.

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.TaxExemption.@type` (string)
  Discriminator. No child classes.
  Example: "TaxExemption"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.TaxExemption.countries` (array)
  ISO country code. One or more two-letter alphanumeric codes for the countries in which the taxCodes sent are tax exempt.
  Example: ["GB","MX"]

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.TaxExemption.taxCodes` (array)
  One or more two-letter alphanumeric tax codes to mark as exempt.
  Example: ["US"]

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.TaxExemption.allTaxesExemptInd` (boolean)
  Marks all taxes as exempt. If true, marks all taxes in the response as exempt. Do not send if false; instead, use countries and taxCodes to specify which taxes to exempt.
  Example: true

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.PromotionalCode` (object)
  NDC only. Not supported for GDS. Any NDC airline designated promotional code.

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.PromotionalCode.value` (string)
  The promotional code to apply
  Example: "CDFRT"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.PromotionalCode.supplierCode` (string, required)
  The IATA code for the airline on which the promotional code is applicable.
  Example: "AA"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.SellCity` (string)
  Overrides the sell city of the requestor
  Example: "MEX"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.TicketCity` (string)
  Overrides the ticket city of the requestor
  Example: "MEX"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.PricingPCC` (string)
  Overrides the pricing PCC of the requestor
  Example: "0XS4"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.TicketingPCC` (string)
  Overrides the ticketing PCC of the requestor
  Example: "0XCD"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.CalculatedFareAdjustment` (object)
  Used in Exchange Search to modify the Price of the Fare. Discriminator classes CalculatedFareAdjustmentDiscount or CalculatedFareAdjustmentIncrease

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.CalculatedFareAdjustment.@type` (string, required)
  Example: "CalculatedFareAdjustmentDiscount"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.BrandPreference` (array)

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.BrandPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "BrandPreference"

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.BrandPreference.brandTier` (integer)
  The brand tier you want to override
  Example: 1

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.BrandPreference.legSequence` (array)
  Correlates with legSequence in SearchCriteriaFlight
  Example: [1,2]

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.keepToBrandInd` (boolean)
  If true, the offerings returned will be of the same brand as the original Offer
  Example: true

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.returnMostRestrictiveBrandInd` (boolean)
  if true, the most restrictive brand will be returned in the response when there are different brands present in the Offering
  Example: true

- `CatalogOfferingsAirChangeRequest.PricingModifiersAirChange.doNotNetInd` (boolean)
  If true, this exchange will not net any residual/refundable amounts against due amounts.

- `CatalogOfferingsAirChangeRequest.SearchControlConsoleChannelID` (object)
  The Search API supports the Travelport Content Optimizer (formerly known as Search Control Console/SCC) for GDS content only. Send either the value or the sccType. If both values are sent, the sccType is applied. Travel agency administrators use Content Optimizer to create business rules for filtering certain air shopping results. If your client's application does not use Content Optimizer, do not use these attributes. Contact your Travelport representative if you would like additional information.

- `CatalogOfferingsAirChangeRequest.SearchControlConsoleChannelID.value` (string)
  String for the Content Optimizer channel ID.
  Example: "IBM"

- `CatalogOfferingsAirChangeRequest.SearchControlConsoleChannelID.sccType` (string)
  String for the Content Optimizer type.
  Example: "999"

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir` (object)
  Modifiers to customize the result set. Includes SearchRepresentation and optional indicators for returning or excluding selected response content. Values sent here can carry forward into the Next Leg Search request and are not re-sent.

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.@type` (string, required)
  discriminator
  Example: "CustomResponseModifiersAir"

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.BrandAttributeInclusion` (array)
  Supported in Search and Price.

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.BrandAttributeInclusion.@type` (string)
  Example: "BrandAttributeInclusion"

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.BrandAttributeInclusion.Classification` (array)
  Send one or more of the following values to return information about only the specified attributes. Fares may include other attributes but information about them is not returned
  Enum: "CheckedBag", "CarryOn", "PersonalItem", "Rebooking", "Refund", "SeatAssignment", "PremiumSeat", "LieFlatSeat", "Meals", "WiFi", "Other"

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.BrandAttributeInclusion.AdditionalClassification` (array)
  Send one or more of the following values to return information about only the specified additional attributes. Supported values ChauffeurTransfer, ExtraLegroom, InFlightEntertainment, LoungeAccess, PriorityBaggage, PriorityBoarding, PriorityCheckIn, PrioritySecurity, PriorityServices, MileageAccrual, Upgrades, USB.

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.BrandAttributeInclusion.legSequence` (array)
  Leg sequence not supported for BrandAttributeInclusion.
  Example: [1,2]

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.SearchRepresentation` (string)
  Specifies either a journey or leg-based response. Journey returns offers for all legs of the itinerary. Journey is the default. Leg returns offers for only the first leg of the itinerary. Must be followed with a Next Leg Search to select an offer for the first leg and return offers on the subsequent leg to combine with it.Customize search result set as leg or journey based. Next Leg Search requests, and Flight Specific Search requests for less than the full itinerary, are supported only after a leg-based Search, not a journey-based Search. If these requests follow a journey-based Search request, an error message is returned.
  Enum: "Leg", "Journey", "LegWithJourneyData"

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.excludePenaltiesInd` (boolean)
  Indicator to omit change and cancel penalties. If true, omits all penalty information from the response. If false or omitted returns any change and penalty details provided by carrier for each offer in TermsAndConditionsFullAir/Penalties. Default is false. GDS only; not supported for NDC. excludePenaltiesInd can also be sent in the AirPrice request. If sent in Search but not in AirPrice, the value sent in Search is cached and applied to the AirPrice results. However, you can override the value sent in Search by sending excludePenaltiesInd in the AirPrice request with the opposite value. For example, if the Search request sends excludePenaltiesInd=true and the AirPrice request sends excludePenaltiesInd=false, the Search response does not return penalties and the AirPrice response does return penalties.If true, Penalties will be excluded from the response.
  Example: true

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.excludeBaggageFeesInd` (boolean)
  Indicator to exclude baggage details. If true, excludes baggage fees, carry on fees, and embargo information from the response. Baggage quantity or weight is returned instead. If false or omitted, baggage details returned in response. Default is false. GDS only; not supported for NDC.
  Example: true

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.includeFareCalculationInd` (boolean)
  Indicator to request the return of the fare calculation ladder. If true, returns the fare calculation ladder in BestCombinablePrice.PriceBreakdownAir.FareCalculation. If false or omitted, fare calculation ladder is not returned. Default is false. GDS only; not supported for NDC or in the Flight Specific Search full payload request.
  Example: true

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.excludeSurchargesInd` (boolean)
  Indicator to exclude a surcharge breakdown. If true, excludes a surcharge breakdown from the response. Baggage quantity or kilos is returned instead. If false or omitted, surcharge breakdown returned in response. Default is false. GDS only; not supported for NDC.
  Example: true

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.excludeUnbundledFaresInd` (boolean)
  Supported in Search and Price. Sets whether to return unbundled fares. If true, does not return unbundled fares. If false or omitted, returns unbundled and bundled fares as available. Default is false. GDS only, not supported for NDC.If true, unbundled fares will not be returned in the response
  Example: true

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.includeCO2EmissionsDataInd` (boolean)
  Indicator to return CO2 emission data in the Search and Next Leg Search responses. If true, returns CO2 emission data. If false or omitted CO2 emission data not returned. Default is false.
  Example: true

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.includeFlightAmenitiesInd` (boolean)
  Indicator to return flight amenities from ATPCO RouteHappy data. If true, includes amenities in the response if available. If false or omitted, amenities are not returned in response. Default is false.
  Example: true

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.includeUniversalProductAttributesInd` (boolean)
  Indicator to return universal product attributes (UPAs), which include images, icons, and URLs as provided by ATPCO. Must also send includeFlightAmenitiesInd=true. If true, returns universal product attributes if available. If false or omitted, Universal product attributes not returned. Default is false. UPAs are not returned for direct flights with intermediate stops, non-flight segments such as trains, or for Premium Business class.
  Example: true

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.includeBundledAncillariesInd` (boolean)
  NDC only. If true, the search and price response will include bundled air and ancillary offerings/offers. Search and Price response will contain both ProductAir and ProductAncillary plus a new child class of PriceBreakdown: PriceBreakdownAncillaryAir to define the ancillary inclusion and pricing.
  Example: true

- `CatalogOfferingsAirChangeRequest.CustomResponseModifiersAir.includeFullPenaltyDisclosureInd` (boolean)
  If true, penalty information sourced from ATPCO Cat 31 and 33 will be disclosed. Penalties may be exposed at fare component level and include time windows.

- `CatalogOfferingsAirChangeRequest.returnBrandedFaresInd` (boolean)
  Example: true

- `CatalogOfferingsAirChangeRequest.upsellInd` (boolean)
  Example: true

- `CatalogOfferingsAirChangeRequest.detailViewInd` (boolean)
  Example: true

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench` (object, required)

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.@type` (string, required)
  Discriminator.
  Example: "BuildFromReservationWorkbench"

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.ReservationIdentifier` (object)
  Reservation Identifier object.

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.ReservationIdentifier.id` (string)
  Internal ID

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.ReservationIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.ReservationIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.ReservationIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.ReservationIdentifier.IdentifierType` (string)
  Enum: "Reservation", "Locator", "SupplierLocator", "DocumentNumber"

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.ReservationIdentifier.@type` (string)
  Example: "Reservation"

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.OfferIdentifier` (object)
  Travelport-generated offer identifier number.

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.OfferIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "offer_1"

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.OfferIdentifier.offerRef` (string)
  Used to reference another instance of this object in the same message
  Example: "offer_1"

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.OfferIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.ProductIdentifier` (array)

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.ProductIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "product_1"

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.ProductIdentifier.productRef` (string)
  Used to reference another instance of this object in the same payload.
  Example: "product_1"

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.ProductIdentifier.Identifier` (object)
  In next leg search Value from CatalogProductOffering/ProductBrandOptions/ProductBrandOffering/Product/productRef in the Search response for the product to select for the first leg of the itinerary. When sending a second Next Leg Search request in a multi-city search, this value should be the offer for the second leg of the itinerary, and so on for additional O&D pairs.

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.ProductIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.ProductIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.SegmentSequenceList` (array)
  The segmentSequence within the product the action is being requested for. Used when multiple flights exist within a product. Only one product may be selected with this option.

- `CatalogOfferingsAirChangeRequest.BuildFromReservationWorkbench.TravelerRefs` (array)
  A list of Traveler references.
  Example: ["traveler_1"]

## Response 200 fields (application/json):

- `CatalogOfferingsAirChangeResponse` (object)
  The response of a Catalog offerings air change endpoint request.

- `CatalogOfferingsAirChangeResponse.CatalogOfferings` (object)

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.@type` (string, required)
  Example: "CatalogOfferings"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.id` (string)
  Local identifier within a given message for this object.
  Example: "CatalogOfferings_1"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.totalCatalogOffering` (integer)
  Total number of rates available for this request.

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.catalogOfferingPerPage` (integer)
  Total number of rates returned per page.

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.numberOfPages` (integer)
  Total number of pages created by this request.
  Example: 5

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering` (array, required)

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.@type` (string, required)
  'Discriminator class for Hotel Availability is CatalogOfferingHospitality.
  Discriminator class for ExchangeSearch is CatalogOfferingModify.'
  Example: "CatalogOffering"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.id` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  For Hotel Availability, offers are cached for 30 minutes. If a Rules request or Reservation is not created within 30 minutes, a new Availability request must be sent."
  Example: "108c5875-c822-4d2e-bb9f-c96368100f4a:a709ffcdc1f681c5cf3f1d7da1a8ebfc"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.CatalogOfferingRef` (string)
  Used to reference another instance of this object in the same message
  Example: "co1"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.ContentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.ProductOptions` (array, required)

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.ProductOptions.@type` (string, required)
  Discriminator classes ProductOptionsID and ProductOptions.
  Example: "ProductOptions"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.ProductOptions.id` (string)
  Local identifier within a given message for this object.
  Example: "ProductOptions_1"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.ProductOptions.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.ProductOptions.ProductOptionsRef` (string)
  Used to reference another instance of this object in the same message
  Example: "ProductOptions_1"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.ProductOptions.sequence` (integer)
  NonnegativeInteger
  Example: 1

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product` (array, required)

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product.@type` (string, required)
  Discriminator. Air Search child classes are ProductAir and ProductAncillary. Exchange Search child class is ProductAir. Ancillary Search is ProductAncillary. Seat Map child class isProductSeatAvailability. Air Price child classes are ProductAir and ProductAncillary. Hotel Availability child classes are ProductHospitality and ProductHospitalityOffer. Hotel Rules and HotelReservation child classes are ProductHospitality. All Vehicle APIs are ProductVehicle and ProductAncillaryVehicle. Reservation and Reservation Workbench child classes are ProductAir, ProductAncillary, ProductHospitality, ProductVehicle, and ProductAncillaryVehicle.
  Example: "ProductAir"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product.id` (string)
  Local id within a given message to support referencing this object.
  Example: "product_1"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product.productRef` (string)
  Reference id that corresponds to the product 'id' in ReferenceListProduct.Product. To find flight details for a product, use the ProductRef id to identify the product in ReferenceListProduct.Product, and use the Flight id's (e.g., s3, s4) to match to flight information in ReferenceListFlight.Flight.
  Example: "product_1"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price` (object, required)
  Child class of Price. This includes all of the Price object plus the Pricebreakdown which gives detailed Price information per PTC or Hotel offering.
  For a Hotels Create Reservation (Full Payload) request, find the values to send in the Price objects from either Availability (returned in CatalogOffering/Price) or Rules (returned in Offer/Price). Although you can send the price returned in either API, the Rules pricing may be more accurate. If you sent a Rules request, send the value from that response. You must include CurrencyCode, Base, TotalTaxes, and TotalPrice. When returned from the previous steps, additionally send TermsAndConditionsFull, ProductRateCodeInfo, and RateCodeInfo.

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.@type` (string, required)
  Discriminator classes Price or PriceDetail
  Example: "PriceDetail"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.id` (string)
  Internally referenced id
  Example: "2"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.Base` (number)
  "Base price before taxes and fees.
  For Hotel, may not be returned by all suppliers."
  Example: 20.2

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.TotalTaxes` (number)
  "Total taxes applied to the base price.
  For Hotel, may not be returned by all suppliers."
  Example: 34.4

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.TotalFees` (number)
  Total fees included in Total Price.
  Example: 201

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.TotalPrice` (number)
  Total price of this offer including the base price and all taxes and fees.
  Example: 34

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.FlightPassCredits` (integer)
  The total number of flight pass credits consumed for this offer.
  Example: 2

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown` (array)

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.@type` (string, required)
  Discriminator. Air Search and Air Price APIs child classes are PriceBreakdownAir and PriceBreakdownAncillary.Search Ancillaries and Seat Availabilities child classes are PriceBreakdown, PriceBreakdownAncillary, and PriceBreakdownAncillaryAir. All Hotel API child classes are PriceBreakdownHospitality.Vehicle API child classes are PriceBreakdownVehicleCharges, PriceBreakdownVehicleDeposit, PriceBreakdownVehiclePrice, and PriceBreakdownAncillaryVehicle. Reservation and Reservation Workbench APIs are PriceBreakdownAir, PriceBreakdownAncillary, PriceBreakdownHospitality, PriceBreakdownVehicleCharges, PriceBreakdownVehicleDeposit, PriceBreakdownVehiclePrice, and PriceBreakdownAncillaryVehicle.
  Example: "PriceBreakdownAir"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount` (object)
  Amount represents the cost applied

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.@type` (string)

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.currencySource` (string)
  The system requesting or returning the currency code specified in the attribute
  Enum: "Supplier", "Charged", "Requested"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.Base` (number)
  The base price prior to all applicable taxes or fees of a product, such as the amount for a room or fare for a flight.
  Example: 120.2

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.Taxes` (object)
  Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.Fees` (object)
  Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.Total` (number)
  "Specifies the total price including base + taxes + fees.
  In PriceBreakdownHospitality, this total is for a given group of nights.
  In PriceBreakdownAir this is the total for one passenger of this PTC type."
  Example: 230.13

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.approximateInd` (boolean)
  if true this amount has been converted from the original amount
  Example: true

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Commission` (object)
  Commission information. In Air Search commission is returned for GDS only; not supported for NDC. Any commission filed by an airline in a CAT35 fare is returned in PriceBreakdownAir/Commission. The amount is either a percent of the fare component (@type CommissionPercent and the Percent object) or an amount (@type CommissionAmount and the Amount object).

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Commission.@type` (string, required)
  Discriminator. Child classes CommissionAmount or CommissionPercent
  Example: "CommissionAmount"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Commission.application` (string)
  Type of commission
  Enum: "Full", "Partial", "Non-paying", "No-show", "Adjustment", "Commissionable"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal` (object)
  No longer used. Previously used to expose the local vendor currency when it is different to the purchased currency

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.@type` (string)

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.currencySource` (string)
  The system requesting or returning the currency code specified in the attribute
  Enum: "Supplier", "Charged", "Requested"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.Base` (number)
  The price prior to all applicable taxes of a product such as the rate for a room or fare for a flight.
  Example: 120.2

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.Taxes` (object)
  Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.Fees` (object)
  Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.Total` (number)
  Specifies the total price including base + taxes + fees
  Example: 30.13

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.approximateInd` (boolean)
  True if this amount has been converted from the original amount
  Example: true

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.TermsAndConditions` (object)
  Terms And Conditions that apply to an offer.

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.@type` (string, required)
  Discriminator. Air Search child classes are TermsAndConditionsAir and TermsAndConditionsAncillary. Exchange Search child class is TermsAndConditionsAirChange. Search Ancillaries and Seat Availabilities child classes are TermsAndConditions, TermsAndConditionsAncillary, and TermsAndConditionsAncillaryAir. Hotel Availability child class is TermsAndConditionsHospitality.
  Example: "TermsAndConditionsAir"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.id` (string)
  Local id within a given message to support referencing this object. For Air Search APIs, matches to the reference value in ProductBrandOffering/TermsAndConditions/termsAndConditionsRef in instances of ProductBrandOptions.
  Example: "TC_1"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.termsAndConditionsRef` (string)
  Reference id that corresponds to the TermsAndConditions 'id' in ReferenceListTermsAndConditions.TermsAndConditions.
  Example: "TC_1"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.ExpiryDate` (string)
  The date and time the offer will expire. Not returned in GDS Search. NDC generally allows 20 to 30 minutes to create a booking (the offer time limit). That time limit varies by airline and is returned here in the Search response.
  Example: "2022-08-07 12:12:00+00:00"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty` (array)

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.AncillaryOffering` (array)

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.AncillaryOffering.@type` (string, required)
  Discriminator classes AncillaryOfferingID and AncillaryOffering
  Example: "AncillaryOffering"

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.AncillaryOffering.id` (string)
  Local identifier within a given message for this object.

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.AncillaryOffering.CatalogOfferingRef` (string)
  Used to reference another instance of this object in the same message

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.AncillaryOffering.AncillaryOfferingRef` (string)

- `CatalogOfferingsAirChangeResponse.CatalogOfferings.AncillaryOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAirChangeResponse.@type` (string)
  Example: "response"

- `CatalogOfferingsAirChangeResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `CatalogOfferingsAirChangeResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `CatalogOfferingsAirChangeResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `CatalogOfferingsAirChangeResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `CatalogOfferingsAirChangeResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `CatalogOfferingsAirChangeResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `CatalogOfferingsAirChangeResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `CatalogOfferingsAirChangeResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `CatalogOfferingsAirChangeResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `CatalogOfferingsAirChangeResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `CatalogOfferingsAirChangeResponse.Result.Error.NameValuePair` (array)

- `CatalogOfferingsAirChangeResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `CatalogOfferingsAirChangeResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `CatalogOfferingsAirChangeResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `CatalogOfferingsAirChangeResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogOfferingsAirChangeResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `CatalogOfferingsAirChangeResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `CatalogOfferingsAirChangeResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `CatalogOfferingsAirChangeResponse.Result.Warning.NameValuePair` (array)

- `CatalogOfferingsAirChangeResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogOfferingsAirChangeResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAirChangeResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `CatalogOfferingsAirChangeResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `CatalogOfferingsAirChangeResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `CatalogOfferingsAirChangeResponse.NextSteps.NextStep` (array, required)

- `CatalogOfferingsAirChangeResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `CatalogOfferingsAirChangeResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `CatalogOfferingsAirChangeResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `CatalogOfferingsAirChangeResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `CatalogOfferingsAirChangeResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `CatalogOfferingsAirChangeResponse.ReferenceList` (array)

- `CatalogOfferingsAirChangeResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `CatalogOfferingsAirChangeResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CatalogOfferingsAirChangeResponse.CurrencyRateConversion` (array)

- `CatalogOfferingsAirChangeResponse.CurrencyRateConversion.@type` (string)

- `CatalogOfferingsAirChangeResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogOfferingsAirChangeResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogOfferingsAirChangeResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CatalogOfferingsAirChangeResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `CatalogOfferingsAirChangeResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CatalogOfferingsAirChangeResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `CatalogOfferingsAirChangeResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `CatalogOfferingsAirChangeResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `CatalogOfferingsAirChangeResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `CatalogOfferingsAirChangeResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `CatalogOfferingsAirChangeResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `CatalogOfferingsAirChangeResponse.Pagination.totalItems` (integer, required)
  The total number of pages in this result set
  Example: 100

## Response 400 fields (application/json):

- `ErrorResponse` (object)
  Base common error response

- `ErrorResponse.@type` (string)
  Example: "response"

- `ErrorResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `ErrorResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `ErrorResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `ErrorResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `ErrorResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `ErrorResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `ErrorResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `ErrorResponse.ReferenceList` (array)

- `ErrorResponse.CurrencyRateConversion` (array)

- `ErrorResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

# Modify

After all required changes any optional steps in a booking workbench session, send a POST request with the workbench identifier to commit the order changes in the workbench.

Endpoint: POST /air/modify/reservations/{Identifier}
Version: 11.33.0
Security: bearerAuth

## Query parameters:

- `autoDeleteDate` (string)
  Acts as a retention segment to hold the reservation open past the last date of travel purge date. Sending a new autoDeleteDate at commit step will update the existing autoDeleteDate. Sending 000/00/00 will delete an existing autoDeleteDate.

- `Issuance` (string)
  Indicates the type of issuance that should be performed at commit. (Ticket, BackOffice (MIR\/TAIR))
  Enum: "Ticket", "BackOffice", "All", "Invoice"

- `DocumentValue` (string)
  Indicates of the value of the document should be refunded or retained following a CancelOffer action
  Enum: "Retain", "Refund", "Forfeit", "Void"

- `payLaterInd` (boolean)
  If true, the Reservation will be fulfilled at a later date

## Path parameters:

- `Identifier` (string, required)
  The Reservation Workbench Identifier you wish to modify NDC content
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

## Header parameters:

- `TraceId` (string)
  Identifier used to correlate Air API invocations across a multi-call business flows.
  Example: "TraceID_123456789"

- `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
  Identifies the Travelport access group with which the caller is associated
  Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

- `travelportPlusSessionIdentifier` (string)
  travelportPlusSessionIdentifier used to maintain an established agency session
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `TVP-PCC-Core` (string)
  Allows user to pass PCC instead of Access Group ID
  Example: "DU7_1G"

- `Accept-Encoding` (string, required)
  Comma-separated list of acceptable encodings like gzip and/or deflate
  Example: "gzip, deflate"

## Request fields (application/json):

- `Notification` (array)

- `Notification.QueueNumber` (array)

- `Notification.QueueNumber.value` (integer)
  Example: 10

- `Notification.QueueNumber.category` (string)
  The Queue Category
  Example: "CAE"

- `Notification.QueueNumber.subCategory` (string)
  Date range subCategory
  Example: "Date Range sub-category"

- `Notification.QueueNumber.overridePCC` (string)
  Use PCC to override to queue the Reservation to another PCC
  Example: "0XS4"

- `Notification.Date` (string)
  The notification date is equivalent to ticket time limit and will place the Reservation on the defined queue for the date specified. Sending a new notification date at commit step will update the existing notificationDate. Sending 000/00/00 will delete an existing notificationDate.

- `Notification.Comment` (string)
  Optional ticket time limit text string.
  Example: "Optional free text"

- `scheduleChangeAcceptedInd` (boolean)
  If true, the schedule change is accepted by the consumer.

- `inhibitResidualDocumentIssuanceInd` (boolean)
  If true, any residual value will not be applied to an MCO or EMD.
  Example: true

- `enableTwoStepCommitInd` (boolean)
  If true, reservation warnings such as minimum connection time will be returned to the user for review and a second commit will be required to proceed with creating the reservation.
  Example: true

- `overrideMCTInd` (boolean)
  If true, the minimum connection time warning will be ignored and the Reservation created.
  Example: true

- `errorWhenScheduleChangesInd` (boolean)
  If true, an error will be returned when the flight schedule changes during commit processing
  Example: true

- `scheduleChangeReprice` (string)
  Enum: "RetainOfferPrice", "AcceptOfferPriceDifference"

- `ReceivedFrom` (string)
  Override the received from field with custom data. Field is stored in Reservation history.
  Example: "TW"

- `errorWhenOfferPriceChangesInd` (boolean)
  If true, an error will be returned when the flight price changes during commit processing.
  Example: true

- `errorWhenOfferPriceCancelledInd` (boolean)

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

- `ErrorResponse` (object)
  Base common error response

- `ErrorResponse.@type` (string)
  Example: "response"

- `ErrorResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `ErrorResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `ErrorResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `ErrorResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `ErrorResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `ErrorResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `ErrorResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `ErrorResponse.ReferenceList` (array)

- `ErrorResponse.CurrencyRateConversion` (array)

- `ErrorResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

# Reservation Cancel

Create a set of offer cancellation receipts for every offer in the reservation.

Endpoint: POST /air/receipt/reservations/{ReservationResource_Identifier}/receipts
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to cancel
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

## Query parameters:

- `OfferIdentifier` (string)
  The Offer Identifier you wish you cancel
  Example: "offer_1"

- `agencySettlementNotReportedInd` (boolean)
  If true, this refund is settled by the agency directly with the traveler. Transaction is not reported to BSP or ARC. Ticket coupon is updated to RFND status

## Header parameters:

- `TraceId` (string)
  Identifier used to correlate Air API invocations across a multi-call business flows.
  Example: "TraceID_123456789"

- `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
  Identifies the Travelport access group with which the caller is associated
  Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

- `travelportPlusSessionIdentifier` (string)
  travelportPlusSessionIdentifier used to maintain an established agency session
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `TVP-PCC-Core` (string)
  Allows user to pass PCC instead of Access Group ID
  Example: "DU7_1G"

- `Accept-Encoding` (string, required)
  Comma-separated list of acceptable encodings like gzip and/or deflate
  Example: "gzip, deflate"

## Response 200 fields (application/json):

- `ReceiptListResponse` (object)
  The response of an ReceiptList endpoint request.

- `ReceiptListResponse.ReceiptID` (array)

- `ReceiptListResponse.ReceiptID.@type` (string, required)
  Discriminator classes ReceiptID, ReceiptConfirmation, ReceiptConfirmationDivide, ReceiptCancellation, ReceiptPayment
  Example: "ReceiptConfirmation"

- `ReceiptListResponse.ReceiptID.id` (string)
  The verification number.
  Example: "3493289238"

- `ReceiptListResponse.ReceiptID.ReceiptRef` (string)
  Example: "6773 2389 2239 2832"

- `ReceiptListResponse.ReceiptID.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `ReceiptListResponse.ReceiptID.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `ReceiptListResponse.ReceiptID.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `ReceiptListResponse.ReceiptID.dateTime` (string)
  Receipt date time
  Example: "2022-08-07 12:12:00+00:00"

- `ReceiptListResponse.ReceiptID.OfferRef` (array)
  List of offer reference ids for the offer(s) returned in the Reservation response.

- `ReceiptListResponse.ReceiptID.ProductRef` (string)
  Reference of product

- `ReceiptListResponse.@type` (string)
  Example: "response"

- `ReceiptListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `ReceiptListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `ReceiptListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `ReceiptListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `ReceiptListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `ReceiptListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `ReceiptListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `ReceiptListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `ReceiptListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `ReceiptListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `ReceiptListResponse.Result.Error.NameValuePair` (array)

- `ReceiptListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `ReceiptListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `ReceiptListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `ReceiptListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `ReceiptListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `ReceiptListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `ReceiptListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `ReceiptListResponse.Result.Warning.NameValuePair` (array)

- `ReceiptListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `ReceiptListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `ReceiptListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `ReceiptListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `ReceiptListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `ReceiptListResponse.NextSteps.NextStep` (array, required)

- `ReceiptListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `ReceiptListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `ReceiptListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `ReceiptListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `ReceiptListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ReceiptListResponse.ReferenceList` (array)

- `ReceiptListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ReceiptListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `ReceiptListResponse.CurrencyRateConversion` (array)

- `ReceiptListResponse.CurrencyRateConversion.@type` (string)

- `ReceiptListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `ReceiptListResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `ReceiptListResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `ReceiptListResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `ReceiptListResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `ReceiptListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `ReceiptListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `ReceiptListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `ReceiptListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `ReceiptListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `ReceiptListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `ReceiptListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `ReceiptListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `ReceiptListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `ReceiptListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `ReceiptListResponse.Pagination.totalItems` (integer, required)
  The total number of pages in this result set
  Example: 100

## Response 400 fields (application/json):

- `ErrorResponse` (object)
  Base common error response

- `ErrorResponse.@type` (string)
  Example: "response"

- `ErrorResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `ErrorResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `ErrorResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `ErrorResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `ErrorResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `ErrorResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `ErrorResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `ErrorResponse.ReferenceList` (array)

- `ErrorResponse.CurrencyRateConversion` (array)

- `ErrorResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

# NDC reprice

Use the Add Offer reference payload request to add an offer to the reservation workbench as part of the booking workflow. The reference payload request sends identifiers from the Search response instead of full itinerary details. NDC supports only the reference payload. For GDS, you can send either a reference payload or a full payload.

Endpoint: POST /air/reprice/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromcatalogofferings
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

## Header parameters:

- `TraceId` (string)
  Identifier used to correlate Air API invocations across a multi-call business flows.
  Example: "TraceID_123456789"

- `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
  Identifies the Travelport access group with which the caller is associated
  Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

- `travelportPlusSessionIdentifier` (string)
  travelportPlusSessionIdentifier used to maintain an established agency session
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `TVP-PCC-Core` (string)
  Allows user to pass PCC instead of Access Group ID
  Example: "DU7_1G"

- `Accept-Encoding` (string, required)
  Comma-separated list of acceptable encodings like gzip and/or deflate
  Example: "gzip, deflate"

## Request fields (application/json):

- `@type` (string, required)
  Example: "OfferQueryBuildFromCatalogOfferings"

- `BuildFromCatalogOfferingsRequest` (object)

- `BuildFromCatalogOfferingsRequest.@type` (string, required)
  Discriminator classes BuildFromCatalogOfferingsRequest, BuildFromCatalogOfferingsRequestAir, and BuildFromCatalogOfferingsRequestAirChange
  Example: "BuildFromCatalogOfferingsRequestAir"

- `BuildFromCatalogOfferingsRequest.CatalogOfferingsIdentifier` (object, required)
  Catalog offerings Identifier class.

- `BuildFromCatalogOfferingsRequest.CatalogOfferingsIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "CatalogOfferings_1"

- `BuildFromCatalogOfferingsRequest.CatalogOfferingsIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BuildFromCatalogOfferingsRequest.CatalogOfferingsIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `BuildFromCatalogOfferingsRequest.CatalogOfferingsIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `BuildFromCatalogOfferingsRequest.CatalogOfferingIdentifier` (object, required)
  Catalog Offering Identifier class.

- `BuildFromCatalogOfferingsRequest.CatalogOfferingIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "co1"

- `BuildFromCatalogOfferingsRequest.CatalogOfferingIdentifier.CatalogOfferingRef` (string)
  Used to reference another instance of this object in the same message
  Example: "co1"

- `BuildFromCatalogOfferingsRequest.CatalogOfferingIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BuildFromCatalogOfferingsRequest.ProductIdentifier` (array)
  Example: ["p1","p2"]

- `BuildFromCatalogOfferingsRequest.ProductIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "product_1"

- `BuildFromCatalogOfferingsRequest.ProductIdentifier.productRef` (string)
  Used to reference another instance of this object in the same payload.
  Example: "product_1"

- `BuildFromCatalogOfferingsRequest.ProductIdentifier.Identifier` (object)
  In next leg search Value from CatalogProductOffering/ProductBrandOptions/ProductBrandOffering/Product/productRef in the Search response for the product to select for the first leg of the itinerary. When sending a second Next Leg Search request in a multi-city search, this value should be the offer for the second leg of the itinerary, and so on for additional O&D pairs.

- `BuildFromCatalogOfferingsRequest.ProductIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `BuildFromCatalogOfferingsRequest.ProductIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `BuildFromCatalogOfferingsRequest.AncillaryOfferingIdentifier` (array)

- `BuildFromCatalogOfferingsRequest.AncillaryOfferingIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "AN1"

- `BuildFromCatalogOfferingsRequest.AncillaryOfferingIdentifier.CatalogOfferingRef` (string)
  Used to reference another instance of this object in the same message
  Example: "CO1"

- `BuildFromCatalogOfferingsRequest.AncillaryOfferingIdentifier.AncillaryOfferingRef` (string)
  Example: "AN1"

- `BuildFromCatalogOfferingsRequest.AncillaryOfferingIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CabinPreference` (object)
  Requests a fare based on the cabin class. Only one cabin preferenceType (Permitted, Preferred, PreferredWithUpgrade) is allowed per request, but there is no limit to the number of cabins that can be sent. Any CabinPreference in the initial Search request is applied to any subsequent Next Leg Search and reference Flight Specific Search requests. In Air Price and Book only one cabin preference type is allowed per request, but there is no limit to the number of cabins that can be sent. If CabinPreference was sent in the Search request, it is cached and sent with the AirPrice reference payload request. If you send CabinPreference in the AirPrice request, all cached modifiers are discarded and only the modifiers sent in the AirPrice request are used. Can combine with lowFareFinderInd=true to return lowest fare in the requested cabin or cabins. When using CabinPreference and lowFareFindInd, if both CabinPreference and a class of service are sent, class of service is ignored. If CabinPreference is sent without a class of service, the response returns the lowest fare in the cabin requested. If that cabin is not available, the response may upgrade or downgrade to a different cabin. If a different cabin than requested is returned, the response returns the message that the cabin class may differ from the class requested. If lowFareFinderInd=false and CabinPreference are sent in the request, AirPrice ignores the preferred cabin and returns a message that the preferred cabin was ignored. If CabinPreference is set to All, no cabin preference is applied.

- `CabinPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "CabinPreference"

- `CabinPreference.preferenceType` (string)
  Sending a mix of preferenceType values is not supported. For example, you cannot send an instance of CabinPreference with a preferenceType of Permitted and another instance with preferenceType of Prohibited. In this case the results default to the Preferred preference.
  Enum: "Preferred", "Permitted", "PreferredWithUpgrade", "Prohibited"

- `CabinPreference.cabins` (array)
  A space-delimited list of cabins.
  Enum: "PremiumFirst", "First", "Business", "PremiumEconomy", "Economy"

- `CabinPreference.legSequence` (array)
  Limits preference to the specified leg referenced in SearchCriteriaFlight. You can apply the preference to only some legs of the itinerary, or different preferences to different legs. To apply preference to the entire itinerary, do not send legSequence. GDS only, not supported for NDC. Not supported at Price or Book.
  Example: [1,2]

- `PaymentCriteria` (object)
  Used to provide optional payment-card criteria in an Air Search request by sending the IssuerIdentifierNumber/BIN of the credit card to be used for payment. Sending the BIN returns OB fees in the response, which are ticketing and form of payment (FOP) fees, including credit card fees. Returned in an instance of Price/PriceBreakdown/Fees/Fee with a feeCode of OB.

- `PaymentCriteria.@type` (string, required)
  discriminator
  Example: "PaymentCriteria"

- `PaymentCriteria.IssuerIdentificationNumber` (string)
  6 to 11 digit number. The BIN/IIN of the credit card to be used for payment
  Example: "123456"

- `PaymentCriteria.PaymentCardCode` (string)
  A two character code for a credit card
  Example: "VI"

- `PaymentCriteria.DocumentNumber` (array)

- `PaymentCriteria.DocumentNumber.value` (string)
  Example: "1259900123456"

- `PaymentCriteria.DocumentNumber.documentIssuer` (string)
  Document issuer
  Example: "BA"

- `PaymentCriteria.DocumentNumber.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `PaymentCriteria.DocumentNumber.travelerIdentifierRef` (string)
  traveler identifier reference

- `PaymentCriteria.DocumentNumber.name` (string)
  The name of the Traveler being referenced.

- `PaymentCriteria.DocumentNumber.passengerTypeCode` (string)
  The passenger type code of the Traveler being referenced.
  Example: "ADT"

- `PaymentCriteria.DocumentNumber.id` (string)
  A locally referenced ID

- `PaymentCriteria.DocumentNumber.description` (string)
  Descriptive text used to identify the contents of a target object

- `PaymentCriteria.DocumentNumber.uris` (array)
  The URI used to GET the target object in another domain.

- `PaymentCriteria.FlightPass` (array)
  In Search API, for NDC flight pass bookings this is a required field and must reference the owner in PassengerCriteria. Only one permitted per Search request.

- `PaymentCriteria.FlightPass.@type` (string, required)
  Discriminator. No child classes
  Example: "FlightPass"

- `PaymentCriteria.FlightPass.accountNumber` (string, required)
  The flight pass account number
  Example: 140851633093

- `PaymentCriteria.FlightPass.supplier` (string, required)
  The flight pass supplier code
  Example: "AC"

- `PaymentCriteria.FlightPass.Description` (array)
  Example: ["FlightPass"]

- `PaymentCriteria.FlightPass.TravelerIdentifierRef` (array)
  In Search, use the passengerCriteriaRef to reference the owner of the flightpass. This is a mandatory field for Search API.

- `PaymentCriteria.FlightPass.TravelerIdentifierRef.name` (string)
  Traveler identifier

- `PaymentCriteria.FlightPass.TravelerIdentifierRef.passengerTypeCode` (string)
  Passenger Type code
  Example: "ADT"

- `PaymentCriteria.FlightPass.TravelerIdentifierRef.ages` (array)
  The ages of the travelers associated to a particular ptc. For NDC, this value will be returned in PriceBreakdownAir if sent as part of the PassengerCriteria in the Air Search request.
  Example: [15]

- `PaymentCriteria.FlightPass.TravelerIdentifierRef.passengerCriteriaRef` (string)
  Allows the user to associate passenger criteria information.
  Example: "passengerCriteria_1"

- `PaymentCriteria.FlightPass.TravelerIdentifierRef.value` (string)

- `PaymentCriteria.FlightPass.TravelerIdentifierRef.id` (string)
  A locally referenced ID

- `PaymentCriteria.FlightPass.TravelerIdentifierRef.description` (string)
  Descriptive text used to identify the contents of a target object

- `PaymentCriteria.FlightPass.TravelerIdentifierRef.uris` (array)
  Uniform Resource Identifier
  Example: ["google.com"]

- `PaymentCriteria.FlightPass.TravelerIdentifierRef.age` (integer)
  Replaced with ages array. The age of the traveler.
  Example: 11

- `PaymentCriteria.agencyAccountInd` (boolean)
  If true, payment will be made by agency account
  Example: true

- `PaymentCriteria.bspInd` (boolean)
  If true, payment will be made by BSP
  Example: true

- `PaymentCriteria.cashInd` (boolean)
  If true, payment will be made by cash
  Example: true

- `PaymentCriteria.invoiceInd` (boolean)
  If true, payment will be made by invoice
  Example: true

- `FareRuleType` (string)
  Returns fare rules in the offer response. Use not recommended; request fare rules using the fare rule endpoints. Structured rules limit the rules returned to one or more of these categories: advance reservation/ticketing requirements, minimum/maximum stay, stopovers, penalties, voluntary exchanges and refunds. GDS supports all categories; NDC supports only penalties. See the Fare Rules Guide for details. Note that even if fare rules are not requested, for GDS only, change and cancel penalties are returned unless suppressed by sending CustomResponseModifiersAir/excludePenaltiesInd (see below) set to true. Not supported in BuildOptions (FlightSpecificSearch).
  Enum: "Structured", "ShortText", "LongText"

- `FareRuleCategory` (array)
  Enum: "AdvanceReservationsTicketing", "MinimumStay", "MaximumStay", "Stopovers", "Penalties", "Eligibility", "DayTime", "Seasonality", "FlightApplication", "Transfers", "Combinations", "BlackoutDates", "Surcharges", "AccompaniedTravel", "TravelRestrictions", "SalesRestrictions", "HIPMileageExeptions", "TicketEndorsements", "ChildrenDiscounts", "TourConductorDiscounts", "AgentDiscounts", "AllOtherDiscounts", "MiscellaneousProvisions", "FareByRule", "Groups", "Tours", "VisitAnotherCountry", "Deposits", "VoluntaryChanges", "VoluntaryRefunds", "NegotiatedFares", "ApplicationAndOtherConditions"

- `lowFareFinderInd` (boolean)
  Provides pricing flexibility around class of service. If not sent, the response returns fares only in the requested class of service. If true, returns the lowest fares available in any class of service available, which may not be the same as the requested class. Note that if lowFareFinderInd is sent with true and CabinPreference is sent, the only supported value for CabinPreference/type is Permitted. When lowFareFindInd=true and brand attributes are not disabled (inhibitBrandContentInd), AirPrice uses only the brand tier (and any other pricing modifiers) to find the lowest fare within a brand tier regardless of class of service. GDS only; not supported for NDC.
  Example: true

- `returnBrandedFaresInd` (boolean)
  If true, branded fares are returned.
  Example: true

- `reCheckInventoryInd` (boolean)
  If true, verifies availability for the requested number of passengers in a specific class of service at the time of the price request by booking and releasing seats. Because this indicator temporarily affects seat availability, the recommended best practice is to use validateInventoryInd instead. Some airlines monitor for high volumes of sell/ignore transactions. Regardless of pricing results, air fares and inventory are only guaranteed by airlines when ticketed and paid. Can help reduce sell failures at booking by alerting of insufficient availability. If any or all segments are not bookable, AirPrice does not return any offers and returns an error message. GDS only, not supported for NDC (NDC carriers always validate inventory at pricing).
  Example: true

- `validateInventoryInd` (boolean)
  Sets whether to validate inventory in the requested class of service. If true, checks for availability for the requested number of passengers in the requested class of service at the time of the price request. If there are fewer seats than requested passengers available in that class of service, AirPrice does not return any offers and instead returns an error message that the booking class or preference is not available. This reduces failures at the Add Offer and Workbench Commit steps. GDS only; not supported for NDC, as NDC carriers already validate inventory at pricing.
  Example: true

- `lowFareFindAndRebookInd` (boolean)
  If true, the original flights in the reservation will be rebooked or replaced with the new exchanged flights.

## Response 200 fields (application/json):

- `OfferListResponse` (object)
  The response of an Offer list endpoint request.

- `OfferListResponse.OfferID` (array)

- `OfferListResponse.OfferID.@type` (string, required)
  "Discriminator classes for Air Price are OfferID, Offer, and OfferUpsell.
  Discriminator classes for Reservation and ReservationWorkbench are OfferID, Offer, OfferModify, and OfferUpsell.
  Discriminator classes for Hotel Rules are OfferID and Offer."
  Example: "Offer"

- `OfferListResponse.OfferID.id` (string)
  Offer identifier sent in the reference payload request to book that offer. Not returned in the full payload response; this is the only difference in the two responses.
  Example: "offer_1"

- `OfferListResponse.OfferID.offerRef` (string)
  Used to reference another instance of this object in the same message
  Example: "offer_1"

- `OfferListResponse.OfferID.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `OfferListResponse.OfferID.ContentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

- `OfferListResponse.@type` (string)
  Example: "response"

- `OfferListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `OfferListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `OfferListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `OfferListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `OfferListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `OfferListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `OfferListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `OfferListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `OfferListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `OfferListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `OfferListResponse.Result.Error.NameValuePair` (array)

- `OfferListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `OfferListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `OfferListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `OfferListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `OfferListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `OfferListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `OfferListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `OfferListResponse.Result.Warning.NameValuePair` (array)

- `OfferListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `OfferListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `OfferListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `OfferListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `OfferListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `OfferListResponse.NextSteps.NextStep` (array, required)

- `OfferListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `OfferListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `OfferListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `OfferListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `OfferListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `OfferListResponse.ReferenceList` (array)

- `OfferListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `OfferListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `OfferListResponse.CurrencyRateConversion` (array)

- `OfferListResponse.CurrencyRateConversion.@type` (string)

- `OfferListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `OfferListResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `OfferListResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `OfferListResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `OfferListResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `OfferListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `OfferListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `OfferListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `OfferListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `OfferListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `OfferListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `OfferListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `OfferListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `OfferListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `OfferListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `OfferListResponse.Pagination.totalItems` (integer, required)
  The total number of pages in this result set
  Example: 100

## Response 400 fields (application/json):

- `ErrorResponse` (object)
  Base common error response

- `ErrorResponse.@type` (string)
  Example: "response"

- `ErrorResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `ErrorResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `ErrorResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `ErrorResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `ErrorResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `ErrorResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `ErrorResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `ErrorResponse.ReferenceList` (array)

- `ErrorResponse.CurrencyRateConversion` (array)

- `ErrorResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

# Standalone reprice

NDC only; not supported for GDS. Not supported for all NDC carriers. Use the Standalone Reprice API to reprice an itinerary on a held booking for NDC. Standalone Reprice can be sent before or after the price guarantee expires. This request would typically be used to check if the price has changed before issuing a ticket. You can then either ticket the itinerary or hold the booking again. Standalone Reprice must be sent in a workbench session. It must be followed by a Modify request to commit the workbench and either ticket or hold the itinerary. If you want to ticket at Modify, send Form of Payment and Payment before Modify. For supporting NDC carriers, see 'Reprice a Booking' in the Deferred Payment section in NDC capabilities by airline through JSON API in the Travelport Knowledge Base.

Endpoint: POST /air/reprice/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromoffer
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

## Header parameters:

- `TraceId` (string)
  Identifier used to correlate Air API invocations across a multi-call business flows.
  Example: "TraceID_123456789"

- `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
  Identifies the Travelport access group with which the caller is associated
  Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

- `travelportPlusSessionIdentifier` (string)
  travelportPlusSessionIdentifier used to maintain an established agency session
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `TVP-PCC-Core` (string)
  Allows user to pass PCC instead of Access Group ID
  Example: "DU7_1G"

- `Accept-Encoding` (string, required)
  Comma-separated list of acceptable encodings like gzip and/or deflate
  Example: "gzip, deflate"

## Request fields (application/json):

- `@type` (string, required)
  Example: "OfferQueryBuildFromOffer"

- `BuildFromOffer` (object, required)

- `BuildFromOffer.@type` (string, required)
  Discriminator classes BuildFromOffer and BuildFromOfferAir
  Example: "BuildFromOffer"

- `BuildFromOffer.OfferIdentifier` (object, required)
  Travelport-generated offer identifier number.

- `BuildFromOffer.OfferIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "offer_1"

- `BuildFromOffer.OfferIdentifier.offerRef` (string)
  Used to reference another instance of this object in the same message
  Example: "offer_1"

- `BuildFromOffer.OfferIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BuildFromOffer.OfferIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `BuildFromOffer.OfferIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `BuildFromOffer.ProductIdentifier` (array)

- `BuildFromOffer.ProductIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "product_1"

- `BuildFromOffer.ProductIdentifier.productRef` (string)
  Used to reference another instance of this object in the same payload.
  Example: "product_1"

- `BuildFromOffer.ProductIdentifier.Identifier` (object)
  In next leg search Value from CatalogProductOffering/ProductBrandOptions/ProductBrandOffering/Product/productRef in the Search response for the product to select for the first leg of the itinerary. When sending a second Next Leg Search request in a multi-city search, this value should be the offer for the second leg of the itinerary, and so on for additional O&D pairs.

- `BuildFromOffer.ProductIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `BuildFromOffer.ProductIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `BuildFromOffer.PassengerCriteria` (array)
  Optional passenger criteria to associate request to a specific passenger.

- `BuildFromOffer.PassengerCriteria.@type` (string, required)
  Discriminator. No child classes.
  Example: "PassengerCriteria"

- `BuildFromOffer.PassengerCriteria.number` (integer, required)
  The amount of passengers associated with this passenger type code
  Example: 1

- `BuildFromOffer.PassengerCriteria.age` (integer)
  The age of the passenger. Travelport recommends sending age only with PTCs that require age for pricing. For child passengers, Travelport recommends sending the age of the child in the age attribute plus the PTC CNN. Travelport recommends against sending CNN without age, or the CHD PTC. Many fares cannot be quoted for CHD. The age for CNN is generally between 2 and 11 inclusive, with ADT fares returned for ages 12 and up; however, this can vary by airline and country. The age for INF must be either 0 or 1. During booking, date of birth is required for all child and infant PTCs (Add Traveler payload in Traveler/birthDate).
  Example: 26

- `BuildFromOffer.PassengerCriteria.passengerTypeCode` (string)
  Required field for Air Search and Flight specific search. The passenger type code for the passengers on the itinerary. Common PTCs are: ADT: adult CHD: child of unknown age (see Notes on PTC and age below) CNN: child when age is known INF: infant without a seat INS: infant with a seat UNN: unaccompanied child. See API guides to download a full list of PTCs. NDC carriers BA, SQ, AV, AA, and AF/KLM offer teen/young adult tax exemptions from the UK Air Passenger Duty (GB tax). Send PTC with the value YTH and send the passengers age per below. The PTC may be returned as ADT, or Cxx in which xx is the age, but the tax exemption is applied in the pricing on these NDC carriers. When running a multiple passenger search for NDC on Qantas, Qantas supports only these PTCs: ADT, CHD, CNN, INF. Sending any other PTC may result in an error at ticketing.
  Example: "ADT"

- `BuildFromOffer.PassengerCriteria.birthDate` (string)
  The date of birth of the passenger. May be used in age validation for fares with age restrictions.
  Example: "2020-01-16"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty` (array)
  Optional object for sending customer loyalty information, such as for a frequent flyer program. If CustomerLoyalty is sent in the Search request, it must also be sent in the Air Price request and the Add Traveler request. Some carriers validate frequent traveler data through the workflow, failing to send the same CustomerLoyalty details, even if invalid, may cause a booking failure. If an invalid number is sent, the response returns a warning message that the FQTV is invalid, and the invalid number is cached to prevent a potential booking failure. In Search API CustomerLoyalty is only sent to NDC carriers. Ignored for GDS Search.

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.value` (string, required)
  Number on loyalty card.
  Example: "132456"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.id` (string)
  Optional Customer Loyalty Id. Not saved
  Example: "Loyalty_1"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.priority` (integer)
  Optional Numeric Priority Code
  Example: 2

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.programId` (string)
  "Specifies an identifier to indicate the company owner of the loyalty program. Typically two characters.
  For frequent guest number, the hotel supplier or brand code.
  For frequent flyer number, the air supplier code of the loyalty program."
  Example: "United"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.programName` (string)
  Supplier's loyalty program name.
  Example: "Frontier-EarlyReturns"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.supplierType` (string)
  The type of supplier of a loyalty program. Uses 'hotel' for frequent guest number or 'air' for frequent flyer number.
  Example: "Airline"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.supplier` (string, required)
  Supplier of a loyalty program (typically 2 characters representing the hotel, brand, or airline).
  Example: "UA"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.tier` (string)
  Customer Loyalty tier
  Example: "Silver"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.shareWithSupplier` (array)
  The list of suppliers that the CustomerLoyalty number is shared. Used for cross accrual.
  Example: ["LH"]

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.cardHolderName` (string)
  Customer loyalty member name; up to 128 characters are supported. In Air Search, for discounted offers to be returned, the name must be sent as LAST FIRST; e.g.,if SMITH is the last name and JORDAN the first name, send as SMITH JORDAN
  Example: "John Smith"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.validatedInd` (boolean)
  Customer loyalty number has been validated by the supplier
  Example: true

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.prefix` (string)
  The cardholder name prefix title like Mr, Mrs, Dr
  Example: "Dr"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.given` (string)
  The First Name of the Cardholder
  Example: "John"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.middle` (string)
  Middle Name of the Cardholder
  Example: "Wilkinson"

- `BuildFromOffer.PassengerCriteria.CustomerLoyalty.surname` (string)
  Last Name of the Cardholder
  Example: "Smith"

- `BuildFromOffer.PassengerCriteria.TravelerGeographicLocation` (object)
  Optional object for requesting local citizen/local resident fares for Spain and associated islands. You must also send a PTC relevant to the local resident fares; e.g., ADR for adult resident, CHR for child resident. Any discount applied through TravelerGeographicLocation applies to all travelers, not only to the traveler in this instance of PassengerCriteria. If the discount must apply only to an individual traveler, that traveler requires a separate search and book workflow.

- `BuildFromOffer.PassengerCriteria.TravelerGeographicLocation.value` (string)
  IATA code for the city, country, or state/province relevant to the local citizen//local resident fare.
  Example: "PMI"

- `BuildFromOffer.PassengerCriteria.TravelerGeographicLocation.travelerGeographicLocationType` (string)
  The geographic type of the location value
  Enum: "Country", "StateProvince", "City"

- `BuildFromOffer.PassengerCriteria.TravelerGeographicLocation.residentGeographicCode` (string)
  Resident code for Spanish residency fares for NDC. Any discount will apply to all travelers, not only to the traveler in this instance of PassengerCriteria. Supported/validated only for NDC to support local citizen fares.

- `BuildFromOffer.PassengerCriteria.TravelerGeographicLocation.generalLargeFamilyResidentDiscountInd` (boolean)
  Send only if true and request qualifies for general large family resident discount, defined as general large families (up to three children) from Spain, from the EU/EEA, or of any other nationality whose residency in Spain is recognized and who are in possession of a large-family certificate issued by the autonomous community in which they live. Supported/validated only for NDC to support local citizen fares.
  Example: true

- `BuildFromOffer.PassengerCriteria.TravelerGeographicLocation.specialLargeFamilyResidentDiscountInd` (boolean)
  Send only if true and request qualifies for special large family resident discount, defined as special large families (four or more children) from Spain, from the EU/EEA, or of any other nationality whose residency in Spain is recognized and who are in possession of a large-family certificate issued by the autonomous community in which they live. Supported/validated only for NDC to support local citizen fares.
  Example: true

- `BuildFromOffer.PassengerCriteria.specifiedPassengerTypeCodeOnlyInd` (boolean)
  If true, returns only offers for the specified PTC. If no offers for that PTC are available, an error message that offers were found is returned. GDS only; not supported for NDC. Default is false.
  Example: true

- `BuildFromOffer.PaymentCriteria` (object)
  Used to provide optional payment-card criteria in an Air Search request by sending the IssuerIdentifierNumber/BIN of the credit card to be used for payment. Sending the BIN returns OB fees in the response, which are ticketing and form of payment (FOP) fees, including credit card fees. Returned in an instance of Price/PriceBreakdown/Fees/Fee with a feeCode of OB.

- `BuildFromOffer.PaymentCriteria.@type` (string, required)
  discriminator
  Example: "PaymentCriteria"

- `BuildFromOffer.PaymentCriteria.IssuerIdentificationNumber` (string)
  6 to 11 digit number. The BIN/IIN of the credit card to be used for payment
  Example: "123456"

- `BuildFromOffer.PaymentCriteria.PaymentCardCode` (string)
  A two character code for a credit card
  Example: "VI"

- `BuildFromOffer.PaymentCriteria.DocumentNumber` (array)

- `BuildFromOffer.PaymentCriteria.DocumentNumber.value` (string)
  Example: "1259900123456"

- `BuildFromOffer.PaymentCriteria.DocumentNumber.documentIssuer` (string)
  Document issuer
  Example: "BA"

- `BuildFromOffer.PaymentCriteria.DocumentNumber.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `BuildFromOffer.PaymentCriteria.DocumentNumber.travelerIdentifierRef` (string)
  traveler identifier reference

- `BuildFromOffer.PaymentCriteria.DocumentNumber.name` (string)
  The name of the Traveler being referenced.

- `BuildFromOffer.PaymentCriteria.DocumentNumber.passengerTypeCode` (string)
  The passenger type code of the Traveler being referenced.
  Example: "ADT"

- `BuildFromOffer.PaymentCriteria.DocumentNumber.id` (string)
  A locally referenced ID

- `BuildFromOffer.PaymentCriteria.DocumentNumber.description` (string)
  Descriptive text used to identify the contents of a target object

- `BuildFromOffer.PaymentCriteria.DocumentNumber.uris` (array)
  The URI used to GET the target object in another domain.

- `BuildFromOffer.PaymentCriteria.FlightPass` (array)
  In Search API, for NDC flight pass bookings this is a required field and must reference the owner in PassengerCriteria. Only one permitted per Search request.

- `BuildFromOffer.PaymentCriteria.FlightPass.@type` (string, required)
  Discriminator. No child classes
  Example: "FlightPass"

- `BuildFromOffer.PaymentCriteria.FlightPass.accountNumber` (string, required)
  The flight pass account number
  Example: 140851633093

- `BuildFromOffer.PaymentCriteria.FlightPass.supplier` (string, required)
  The flight pass supplier code
  Example: "AC"

- `BuildFromOffer.PaymentCriteria.FlightPass.Description` (array)
  Example: ["FlightPass"]

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef` (array)
  In Search, use the passengerCriteriaRef to reference the owner of the flightpass. This is a mandatory field for Search API.

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.name` (string)
  Traveler identifier

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.passengerTypeCode` (string)
  Passenger Type code
  Example: "ADT"

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.ages` (array)
  The ages of the travelers associated to a particular ptc. For NDC, this value will be returned in PriceBreakdownAir if sent as part of the PassengerCriteria in the Air Search request.
  Example: [15]

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.passengerCriteriaRef` (string)
  Allows the user to associate passenger criteria information.
  Example: "passengerCriteria_1"

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.value` (string)

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.id` (string)
  A locally referenced ID

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.description` (string)
  Descriptive text used to identify the contents of a target object

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.uris` (array)
  Uniform Resource Identifier
  Example: ["google.com"]

- `BuildFromOffer.PaymentCriteria.FlightPass.TravelerIdentifierRef.age` (integer)
  Replaced with ages array. The age of the traveler.
  Example: 11

- `BuildFromOffer.PaymentCriteria.agencyAccountInd` (boolean)
  If true, payment will be made by agency account
  Example: true

- `BuildFromOffer.PaymentCriteria.bspInd` (boolean)
  If true, payment will be made by BSP
  Example: true

- `BuildFromOffer.PaymentCriteria.cashInd` (boolean)
  If true, payment will be made by cash
  Example: true

- `BuildFromOffer.PaymentCriteria.invoiceInd` (boolean)
  If true, payment will be made by invoice
  Example: true

- `CabinPreference` (object)
  Requests a fare based on the cabin class. Only one cabin preferenceType (Permitted, Preferred, PreferredWithUpgrade) is allowed per request, but there is no limit to the number of cabins that can be sent. Any CabinPreference in the initial Search request is applied to any subsequent Next Leg Search and reference Flight Specific Search requests. In Air Price and Book only one cabin preference type is allowed per request, but there is no limit to the number of cabins that can be sent. If CabinPreference was sent in the Search request, it is cached and sent with the AirPrice reference payload request. If you send CabinPreference in the AirPrice request, all cached modifiers are discarded and only the modifiers sent in the AirPrice request are used. Can combine with lowFareFinderInd=true to return lowest fare in the requested cabin or cabins. When using CabinPreference and lowFareFindInd, if both CabinPreference and a class of service are sent, class of service is ignored. If CabinPreference is sent without a class of service, the response returns the lowest fare in the cabin requested. If that cabin is not available, the response may upgrade or downgrade to a different cabin. If a different cabin than requested is returned, the response returns the message that the cabin class may differ from the class requested. If lowFareFinderInd=false and CabinPreference are sent in the request, AirPrice ignores the preferred cabin and returns a message that the preferred cabin was ignored. If CabinPreference is set to All, no cabin preference is applied.

- `CabinPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "CabinPreference"

- `CabinPreference.preferenceType` (string)
  Sending a mix of preferenceType values is not supported. For example, you cannot send an instance of CabinPreference with a preferenceType of Permitted and another instance with preferenceType of Prohibited. In this case the results default to the Preferred preference.
  Enum: "Preferred", "Permitted", "PreferredWithUpgrade", "Prohibited"

- `CabinPreference.cabins` (array)
  A space-delimited list of cabins.
  Enum: "PremiumFirst", "First", "Business", "PremiumEconomy", "Economy"

- `CabinPreference.legSequence` (array)
  Limits preference to the specified leg referenced in SearchCriteriaFlight. You can apply the preference to only some legs of the itinerary, or different preferences to different legs. To apply preference to the entire itinerary, do not send legSequence. GDS only, not supported for NDC. Not supported at Price or Book.
  Example: [1,2]

- `CustomResponseModifiersAir` (object)
  Modifiers to customize the result set. Includes SearchRepresentation and optional indicators for returning or excluding selected response content. Values sent here can carry forward into the Next Leg Search request and are not re-sent.

- `CustomResponseModifiersAir.@type` (string, required)
  discriminator
  Example: "CustomResponseModifiersAir"

- `CustomResponseModifiersAir.BrandAttributeInclusion` (array)
  Supported in Search and Price.

- `CustomResponseModifiersAir.BrandAttributeInclusion.@type` (string)
  Example: "BrandAttributeInclusion"

- `CustomResponseModifiersAir.BrandAttributeInclusion.Classification` (array)
  Send one or more of the following values to return information about only the specified attributes. Fares may include other attributes but information about them is not returned
  Enum: "CheckedBag", "CarryOn", "PersonalItem", "Rebooking", "Refund", "SeatAssignment", "PremiumSeat", "LieFlatSeat", "Meals", "WiFi", "Other"

- `CustomResponseModifiersAir.BrandAttributeInclusion.AdditionalClassification` (array)
  Send one or more of the following values to return information about only the specified additional attributes. Supported values ChauffeurTransfer, ExtraLegroom, InFlightEntertainment, LoungeAccess, PriorityBaggage, PriorityBoarding, PriorityCheckIn, PrioritySecurity, PriorityServices, MileageAccrual, Upgrades, USB.

- `CustomResponseModifiersAir.BrandAttributeInclusion.legSequence` (array)
  Leg sequence not supported for BrandAttributeInclusion.
  Example: [1,2]

- `CustomResponseModifiersAir.SearchRepresentation` (string)
  Specifies either a journey or leg-based response. Journey returns offers for all legs of the itinerary. Journey is the default. Leg returns offers for only the first leg of the itinerary. Must be followed with a Next Leg Search to select an offer for the first leg and return offers on the subsequent leg to combine with it.Customize search result set as leg or journey based. Next Leg Search requests, and Flight Specific Search requests for less than the full itinerary, are supported only after a leg-based Search, not a journey-based Search. If these requests follow a journey-based Search request, an error message is returned.
  Enum: "Leg", "Journey", "LegWithJourneyData"

- `CustomResponseModifiersAir.excludePenaltiesInd` (boolean)
  Indicator to omit change and cancel penalties. If true, omits all penalty information from the response. If false or omitted returns any change and penalty details provided by carrier for each offer in TermsAndConditionsFullAir/Penalties. Default is false. GDS only; not supported for NDC. excludePenaltiesInd can also be sent in the AirPrice request. If sent in Search but not in AirPrice, the value sent in Search is cached and applied to the AirPrice results. However, you can override the value sent in Search by sending excludePenaltiesInd in the AirPrice request with the opposite value. For example, if the Search request sends excludePenaltiesInd=true and the AirPrice request sends excludePenaltiesInd=false, the Search response does not return penalties and the AirPrice response does return penalties.If true, Penalties will be excluded from the response.
  Example: true

- `CustomResponseModifiersAir.excludeBaggageFeesInd` (boolean)
  Indicator to exclude baggage details. If true, excludes baggage fees, carry on fees, and embargo information from the response. Baggage quantity or weight is returned instead. If false or omitted, baggage details returned in response. Default is false. GDS only; not supported for NDC.
  Example: true

- `CustomResponseModifiersAir.includeFareCalculationInd` (boolean)
  Indicator to request the return of the fare calculation ladder. If true, returns the fare calculation ladder in BestCombinablePrice.PriceBreakdownAir.FareCalculation. If false or omitted, fare calculation ladder is not returned. Default is false. GDS only; not supported for NDC or in the Flight Specific Search full payload request.
  Example: true

- `CustomResponseModifiersAir.excludeSurchargesInd` (boolean)
  Indicator to exclude a surcharge breakdown. If true, excludes a surcharge breakdown from the response. Baggage quantity or kilos is returned instead. If false or omitted, surcharge breakdown returned in response. Default is false. GDS only; not supported for NDC.
  Example: true

- `CustomResponseModifiersAir.excludeUnbundledFaresInd` (boolean)
  Supported in Search and Price. Sets whether to return unbundled fares. If true, does not return unbundled fares. If false or omitted, returns unbundled and bundled fares as available. Default is false. GDS only, not supported for NDC.If true, unbundled fares will not be returned in the response
  Example: true

- `CustomResponseModifiersAir.includeCO2EmissionsDataInd` (boolean)
  Indicator to return CO2 emission data in the Search and Next Leg Search responses. If true, returns CO2 emission data. If false or omitted CO2 emission data not returned. Default is false.
  Example: true

- `CustomResponseModifiersAir.includeFlightAmenitiesInd` (boolean)
  Indicator to return flight amenities from ATPCO RouteHappy data. If true, includes amenities in the response if available. If false or omitted, amenities are not returned in response. Default is false.
  Example: true

- `CustomResponseModifiersAir.includeUniversalProductAttributesInd` (boolean)
  Indicator to return universal product attributes (UPAs), which include images, icons, and URLs as provided by ATPCO. Must also send includeFlightAmenitiesInd=true. If true, returns universal product attributes if available. If false or omitted, Universal product attributes not returned. Default is false. UPAs are not returned for direct flights with intermediate stops, non-flight segments such as trains, or for Premium Business class.
  Example: true

- `CustomResponseModifiersAir.includeBundledAncillariesInd` (boolean)
  NDC only. If true, the search and price response will include bundled air and ancillary offerings/offers. Search and Price response will contain both ProductAir and ProductAncillary plus a new child class of PriceBreakdown: PriceBreakdownAncillaryAir to define the ancillary inclusion and pricing.
  Example: true

- `CustomResponseModifiersAir.includeFullPenaltyDisclosureInd` (boolean)
  If true, penalty information sourced from ATPCO Cat 31 and 33 will be disclosed. Penalties may be exposed at fare component level and include time windows.

- `PricingModifiersAir` (object)
  A selection of Pricing Modifiers that can be used to influence the Price of an Offer. Discriminator classes PricingModifiersAir and PricingModifersAirDetail

- `PricingModifiersAir.@type` (string, required)
  Discriminator. Child class PricingModifiersAirDetail.
  Example: "PricingModifiersAir"

- `PricingModifiersAir.currencyCode` (string)
  In the Search API, send the currency type to return if you want to override the default currency specified with your PCC.
  Example: "GBP"

- `PricingModifiersAir.FareSelection` (object)
  May include FareSelectionDetail, RefundOptions, ChangeOptions objects.

- `PricingModifiersAir.FareSelection.@type` (string, required)
  Discriminator. Child class FareSelectionDetail.
  Example: "FareSelection"

- `PricingModifiersAir.FareSelection.fareType` (string)
  Defines the type of fares to return (Only public fares, Only private fares, Only agency private fares, Only
  Enum: "PublicFaresOnly", "PrivateFaresOnly", "AgencyPrivateFaresOnly", "AirlinePrivateFaresOnly", "PublicAndPrivateFares", "NetFaresOnly", "AllFares"

- `PricingModifiersAir.FareSelection.RefundOptions` (object)
  Supports requesting only fares that meet certain refund criteria. GDS only; not supported for NDC. Search supports sending up to 12 refundability options. The following combinations are mutually exclusive; if sent, Search ignores them and returns a warning message: NonRefundable cannot also be sent with PartialRefund. Refundable cannot also be sent with ChangeOptions/changeTypes=PenaltyToChange

- `PricingModifiersAir.FareSelection.RefundOptions.@type` (string, required)
  Discriminator. No child classes.
  Example: "RefundOptions"

- `PricingModifiersAir.FareSelection.RefundOptions.refundTypes` (array, required)
  Enum: "Refundable", "NonRefundable", "PartialRefund"

- `PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange` (object)
  Not currently supported. User can express a minimum and maximum Refund penalty range that will be included in the result set.

- `PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.@type` (string)
  Example: "RefundPenaltyRange"

- `PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Minimum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Minimum.@type` (string, required)
  Discriminator classes AmountPercentAmount or AmountPercentPercent
  Example: "AmountPercentAmount"

- `PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Minimum.application` (string)
  Type of commission
  Enum: "Full", "Partial", "Non-paying", "No-show", "Adjustment", "Commissionable"

- `PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Maximum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `PricingModifiersAir.FareSelection.ChangeOptions` (object)
  Supports requesting only fares that meet certain change criteria. GDS only; not supported for NDC. Search supports sending up to 12 changeability options. ChangeOptions.changeTypes=PenaltyToChange cannot be sent with RefundOptions.Refundable. If sent, Search ignores them and returns a warning message

- `PricingModifiersAir.FareSelection.ChangeOptions.@type` (string)
  Discriminator. No child classes.
  Example: "ChangeOptions"

- `PricingModifiersAir.FareSelection.ChangeOptions.changeTypes` (array, required)
  Enum: "Changeable", "NonChangeable", "PenaltyToChange"

- `PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange` (object)
  Not currently supported. User can express a minimum and maximum Change penalty range that will be included in the result set

- `PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange.@type` (string)
  Example: "ChangePenaltyRange"

- `PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange.Minimum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange.Maximum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `PricingModifiersAir.FareSelection.FareQualiferString` (array)
  Request specific private leisure fares. Supported values vary by NDC carrier. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API in the guide section. This value is returned in FlightProduct.FareQualifierString if supplied by the airline. (Note the misspelling in request parameter)
  Example: ["Tour"]

- `PricingModifiersAir.FareSelection.FareQualifier` (array)

- `PricingModifiersAir.FareSelection.FareQualifier.value` (string)
  Deprecated - do not use. Replaced by FareQualiferString
  Enum: "Consolidator", "Government", "Marine", "Military", "Reward", "StandBy", "Staff", "Student", "Tour", "Youth", "VistFriendsAndRelatives"

- `PricingModifiersAir.OrganizationInformation` (object)
  In search API sends account code/s to request negotiated fares. For NDC supports corporate loyalty program and GST Information. This information is returned in TermsAndConditions.OrganizationInformation.

- `PricingModifiersAir.OrganizationInformation.@type` (string, required)
  Discriminator. No child classes
  Example: "OrganizationInformation"

- `PricingModifiersAir.OrganizationInformation.OrganizationIdentifier` (array)

- `PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.value` (string)
  The value of the code type.
  Example: "JBD123456"

- `PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.supplier` (string)
  The IATA code for the airline on which the code type is applicable.
  Example: "AA"

- `PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.organizationCodeType` (string)
  Sends a description for the OrganizationIdentifer value
  Enum: "Account", "OrganizationLoyaltyProgram", "Tour", "TicketDesignator"

- `PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.segmentSequenceList` (array)
  Returned in response when the code is applicable to a specified segment sequence
  Example: [1,2,3]

- `PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.productRef` (array)
  Returned in response when the code is applicable to a specified product
  Example: ["product_1"]

- `PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.accountCodeFaresOnlyInd` (boolean)
  Indicator to limit the fares returned to only fares filed for the specified account code. If true, returns only fares filed for the account code/s in OrganizationIdentifier/value. If sending multiple account codes, send with each instance of OrganizationIdentifier. If false or omitted, returns account fares and other fares. Default is false. If an account code is sent without accountCodeFaresOnlyInd=true, the response includes any fares filed for that account code plus fares that are not specific to the account code. If accountCodeFaresOnlyInd=true and no account code is sent, the indicator is ignored and the response returns all fares and a warning message that the request must include an account code. GDS only; not supported for NDC.
  Example: true

- `PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber` (array)
  NDC only. Supported during book 'Add Offer' workflow.

- `PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.value` (string, required)
  The GST registered number for the business.
  Example: "07AAGFF2194N1Z1"

- `PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.telephone` (string, required)
  Business telephone number
  Example: "222-222-222"

- `PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.address` (string, required)
  Business address
  Example: "1122 sample trail, CO, USA, 21232"

- `PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.country` (string, required)
  IATA country code of the business.
  Example: "IND"

- `PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.companyName` (string, required)
  Business name
  Example: "Adecco"

- `PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.email` (string, required)
  Business E-Mail
  Example: "sample@adecco.com"

- `PricingModifiersAir.TaxExemption` (object)
  GDS only, not supported for NDC. Marks as tax exempt either all taxes, only specific tax codes, or all taxes in specific countries. Send either allTaxesExemptInd OR countries and taxCodes per below. TaxExemption supports up to nine values for countries, for taxCodes, or for countries and taxCodes combined. The response returns any exempt taxes with exemptInd=true and a zero value.

- `PricingModifiersAir.TaxExemption.@type` (string)
  Discriminator. No child classes.
  Example: "TaxExemption"

- `PricingModifiersAir.TaxExemption.countries` (array)
  ISO country code. One or more two-letter alphanumeric codes for the countries in which the taxCodes sent are tax exempt.
  Example: ["GB","MX"]

- `PricingModifiersAir.TaxExemption.taxCodes` (array)
  One or more two-letter alphanumeric tax codes to mark as exempt.
  Example: ["US"]

- `PricingModifiersAir.TaxExemption.allTaxesExemptInd` (boolean)
  Marks all taxes as exempt. If true, marks all taxes in the response as exempt. Do not send if false; instead, use countries and taxCodes to specify which taxes to exempt.
  Example: true

- `PricingModifiersAir.PromotionalCode` (array)

- `PricingModifiersAir.PromotionalCode.value` (string)
  The promotional code to apply
  Example: "CDFRT"

- `PricingModifiersAir.PromotionalCode.supplierCode` (string, required)
  The IATA code for the airline on which the promotional code is applicable.
  Example: "AA"

- `PricingModifiersAir.SellCity` (string)
  The IATA location code for the city. Overrides the sell city of the requester to specify an alternate sale location and return fares based on that location. GDS only, not supported for NDC.
  Example: "NYC"

- `PricingModifiersAir.TicketCity` (string)
  The IATA location code for the city. Overrides the ticketing city of the requester to specify an alternate ticket location and return fares based on that location. GDS only, not supported for NDC.
  Example: "NYC"

- `PricingModifiersAir.PricingPCC` (string)
  Use to send a faring PCC for which a selective access or code group agreement exists between that PCC and the PCC associated with your account. The following combinations of PricingPCC and FareSelection/fareType=PrivateFaresOnly return results as follows: PricingPCC sent and PrivateFaresOnly not requested: If a selective access or group agreement exists, both public and private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly not requested: If no selective access or group agreement exists, only public fares are returned. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists that allows private fare access, private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists but does not allow private fares access, or if no agreement exists, an error is returned. GDS only, not supported for NDC.
  Example: "0Bx3"

- `PricingModifiersAir.FareBasisCodeOverride` (array)

- `PricingModifiersAir.FareBasisCodeOverride.value` (string)

- `PricingModifiersAir.FareBasisCodeOverride.specificFlightCriteriaRefs` (array)
  Reference the specificFlightCriteria you want to override. If blank, all segments will be overridden.
  Example: "s1, s2"

- `PricingModifiersAir.FareBasisCodeOverride.unpricedFlightSegmentRefs` (array)
  Reference the unpricedFlightSegment you want to override. If blank, all segments will be overridden.
  Example: "up1, up2"

- `PricingModifiersAir.MultiPricingAgency` (array)
  Return offers from multiple point of sale agencys.
  Example: ["[\"0XS4\",\"0YBZ\",\"J80K\"]"]

- `PricingModifiersAir.TicketingPCC` (string)
  In Search API, overrides the ticketing PCC associated with your account to specify an alternate PCC and return fares based on that PCC. GDS only, not supported for NDC.
  Example: "0XS4"

- `PricingModifiersAir.CalculatedFareAdjustment` (object)
  Used in Exchange Search to modify the Price of the Fare. Discriminator classes CalculatedFareAdjustmentDiscount or CalculatedFareAdjustmentIncrease

- `PricingModifiersAir.CalculatedFareAdjustment.@type` (string, required)
  Example: "CalculatedFareAdjustmentDiscount"

- `PricingModifiersAir.ManualFareAdjustment` (array)

- `PricingModifiersAir.ManualFareAdjustment.@type` (string, required)
  Discriminator. Child classes ManualFareAdjustmentIncrease or ManualFareAdjustmentDiscount
  Example: "ManualFareAdjustmentIncrease"

- `PricingModifiersAir.ManualFareAdjustment.passengerTypeCodes` (array)
  Send the PTC/s to be increased or discount. This increases or discounts the fare for all passengers with the PTC/s. If not sent, ManualFareAdjustment applies to all PTCs.
  Example: ["ADT","CHD"]

- `PricingModifiersAir.BrandPreference` (array)

- `PricingModifiersAir.BrandPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "BrandPreference"

- `PricingModifiersAir.BrandPreference.brandTier` (integer)
  The brand tier you want to override
  Example: 1

- `PricingModifiersAir.BrandPreference.legSequence` (array)
  Correlates with legSequence in SearchCriteriaFlight
  Example: [1,2]

- `PricingModifiersAir.includeSplitPaymentInd` (boolean)
  Requests request split ticketing, which returns outbound and inbound one-way fares in addition to round trip options in the Search API response. This may result in lower fares than the same or similar round-trip itinerary. If true, requests split ticketing. If false or omitted split ticketing options are not returned. Default is false. GDS only, not supported for NDC. When split ticketing is requested, the Search response returns offers in the following order: Outbound one-way offers, Inbound one-way offers, Round trip offers. The response identifies all one-way outbound and inbound offers with CombinabilityCode j0. CombinabilityCode values for round trip offers start at j1 and increment by one for each offer. Only the following are in scope for split ticketing: Search (not supported for Next Leg Search or Flight Specific Search), Round-trip journey-based offerings ( isJourney header not sent or sent as true, or CustomResponseModifiersAir/SearchRepresentation not sent or sent with value Journey ) Upsells. Split ticketing is not supported for round-trip leg-based searches, virtual interlining, or NDC. Split ticketing is available only for customers specifically provisioned for split ticketing. Split ticketing returns one-way outbound and one-way inbound fares in addition to round-trip offers. Split ticket offers are identified with CombinabilityCode j0. If your account is not configured for split ticketing, sending includeSplitPaymentInd returns a response without split ticket offers and a warning message. GDS only, not supported for NDC. In Air Price, For split ticketing, the request must send offers that are identified in the Search response with CombinabilityCode j0, which identifies those offers as one-way outbound and one-way inbound split ticketing offers. A combination of j0 and any non-j0 value offer returns an error message that split pricing is not supported

- `PricingModifiersAir.returnMostRestrictiveBrandInd` (boolean)
  In Search API, when there are different brands on a connecting flight, return information for either the most restrictive brand or the brand on the most significant segment on the itinerary. If true, return the offer brand of the most restrictive brand. If false or omitted, return the offer brand of the most significant segment of the itinerary. GDS only, not supported for NDC.

- `PricingModifiersAir.splitPaymentOfferings` (number)
  Number between 0 and 99. Send with includeSplitPaymentInd to configure the percentage of round trip offers to return in a split ticketing response. By default, Search divides the split ticketing response into 34% round-trip offerings and the remainder as split ticketing offers, which are combined outbound and inbound one-way fares. To change this percentage, send SplitPaymentOfferings with the percentage value of round trip offers to return.
  Example: 25

- `priceHistoricalOfferInd` (boolean)
  If true, the new Offer should be priced using the original Offer create date.
  Example: true

- `priceHistoricalTaxInd` (boolean)
  if true, the taxes in the new Offer should be priced using the original Offer create date.
  Example: true

- `priceHistoricalFeeInd` (boolean)
  if true, the fees in the new Offer should be priced using the original Offer create date.
  Example: true

- `inhibitBrandContentInd` (boolean)
  If true, brand information will not be returned
  Example: true

- `lowFareFinderInd` (any)
  Provides pricing flexibility around class of service. If not sent, the response returns fares only in the requested class of service. If true, returns the lowest fares available in any class of service available, which may not be the same as the requested class. Note that if lowFareFinderInd is sent with true and CabinPreference is sent, the only supported value for CabinPreference/type is Permitted. When lowFareFindInd=true and brand attributes are not disabled (inhibitBrandContentInd), AirPrice uses only the brand tier (and any other pricing modifiers) to find the lowest fare within a brand tier regardless of class of service. GDS only; not supported for NDC.
  Example: true

- `lowFareFindAndRebookInd` (boolean)
  If true, a new Offer will replace the referenced Offer with the lowest available fare. Flight products are rebooked.
  Example: true

- `validateInventoryInd` (boolean)
  Sets whether to validate inventory in the requested class of service. If true, checks for availability for the requested number of passengers in the requested class of service at the time of the price request. If there are fewer seats than requested passengers available in that class of service, AirPrice does not return any offers and instead returns an error message that the booking class or preference is not available. This reduces failures at the Add Offer and Workbench Commit steps. GDS only; not supported for NDC, as NDC carriers already validate inventory at pricing.
  Example: true

- `MaxNumberOfUpsellsToReturn` (integer)
  Example: 4

## Response 201 fields (application/json):

- `OfferResponse` (object)
  The response of an Offer endpoint request.

- `OfferResponse.Offer` (object)

- `OfferResponse.Offer.@type` (string, required)
  "Discriminator classes for Air Price are OfferID, Offer, and OfferUpsell.
  Discriminator classes for Reservation and ReservationWorkbench are OfferID, Offer, OfferModify, and OfferUpsell.
  Discriminator classes for Hotel Rules are OfferID and Offer."
  Example: "Offer"

- `OfferResponse.Offer.id` (string)
  Offer identifier sent in the reference payload request to book that offer. Not returned in the full payload response; this is the only difference in the two responses.
  Example: "offer_1"

- `OfferResponse.Offer.offerRef` (string)
  Used to reference another instance of this object in the same message
  Example: "offer_1"

- `OfferResponse.Offer.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `OfferResponse.Offer.ContentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

- `OfferResponse.@type` (string)
  Example: "response"

- `OfferResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `OfferResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `OfferResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `OfferResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `OfferResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `OfferResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `OfferResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `OfferResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `OfferResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `OfferResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `OfferResponse.Result.Error.NameValuePair` (array)

- `OfferResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `OfferResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `OfferResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `OfferResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `OfferResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `OfferResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `OfferResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `OfferResponse.Result.Warning.NameValuePair` (array)

- `OfferResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `OfferResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `OfferResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `OfferResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `OfferResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `OfferResponse.NextSteps.NextStep` (array, required)

- `OfferResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `OfferResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `OfferResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `OfferResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `OfferResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `OfferResponse.ReferenceList` (array)

- `OfferResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `OfferResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `OfferResponse.CurrencyRateConversion` (array)

- `OfferResponse.CurrencyRateConversion.@type` (string)

- `OfferResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `OfferResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `OfferResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `OfferResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `OfferResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `OfferResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `OfferResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `OfferResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `OfferResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `OfferResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `OfferResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `OfferResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `OfferResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `OfferResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `OfferResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `OfferResponse.Pagination.totalItems` (integer, required)
  The total number of pages in this result set
  Example: 100

## Response 400 fields (application/json):

- `ErrorResponse` (object)
  Base common error response

- `ErrorResponse.@type` (string)
  Example: "response"

- `ErrorResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `ErrorResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `ErrorResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `ErrorResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `ErrorResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `ErrorResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `ErrorResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `ErrorResponse.ReferenceList` (array)

- `ErrorResponse.CurrencyRateConversion` (array)

- `ErrorResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

# Cancel payment

NDC only; not supported for GDS. Supported only for Qantas (QF). For NDC on supporting carriers only, you can use the Cancel Payment API to cancel the payment on a ticket. This refunds the payment, cancels the ticket but retains the itinerary, and creates a held booking for later fulfillment. For example, you might want to use this workflow to use a different payment method than was sent in ticketing. You must establish a workbench session before sending the Cancel Payment request detailed here. After sending Cancel Payment, you must commit the workbench to implement the change.

Endpoint: POST /air/paymentoffer/reservationworkbench/{ReservationResource_Identifier}/payments/{id}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to cancel or void the payment
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `id` (string, required)
  The Payment ID you wish to cancel or void
  Example: "payment_1"

## Header parameters:

- `travelportPlusSessionIdentifier` (string)
  travelportPlusSessionIdentifier used to maintain an established agency session
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `TraceId` (string)
  Identifier used to correlate Air API invocations across a multi-call business flows.
  Example: "TraceID_123456789"

- `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
  Identifies the Travelport access group with which the caller is associated
  Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

- `TVP-PCC-Core` (string)
  Allows user to pass PCC instead of Access Group ID
  Example: "DU7_1G"

- `Accept-Encoding` (string, required)
  Comma-separated list of acceptable encodings like gzip and/or deflate
  Example: "gzip, deflate"

## Response 200 fields (application/json):

- `PaymentResponse` (object)
  The response of a Payment endpoint request.

- `PaymentResponse.Payment` (object)
  Payment Identifier object.

- `PaymentResponse.Payment.@type` (string)
  Example: "Payment"

- `PaymentResponse.Payment.id` (string)

- `PaymentResponse.Payment.PaymentRef` (string)

- `PaymentResponse.Payment.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `PaymentResponse.Payment.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `PaymentResponse.Payment.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `PaymentResponse.@type` (string)
  Example: "response"

- `PaymentResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `PaymentResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `PaymentResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `PaymentResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `PaymentResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `PaymentResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `PaymentResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `PaymentResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `PaymentResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `PaymentResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `PaymentResponse.Result.Error.NameValuePair` (array)

- `PaymentResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `PaymentResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `PaymentResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `PaymentResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `PaymentResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `PaymentResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `PaymentResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `PaymentResponse.Result.Warning.NameValuePair` (array)

- `PaymentResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `PaymentResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `PaymentResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `PaymentResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `PaymentResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `PaymentResponse.NextSteps.NextStep` (array, required)

- `PaymentResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `PaymentResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `PaymentResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `PaymentResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `PaymentResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `PaymentResponse.ReferenceList` (array)

- `PaymentResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `PaymentResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `PaymentResponse.CurrencyRateConversion` (array)

- `PaymentResponse.CurrencyRateConversion.@type` (string)

- `PaymentResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `PaymentResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `PaymentResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `PaymentResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `PaymentResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `PaymentResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `PaymentResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `PaymentResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `PaymentResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `PaymentResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `PaymentResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `PaymentResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `PaymentResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `PaymentResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `PaymentResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `PaymentResponse.Pagination.totalItems` (integer, required)
  The total number of pages in this result set
  Example: 100

## Response 400 fields (application/json):

- `ErrorResponse` (object)
  Base common error response

- `ErrorResponse.@type` (string)
  Example: "response"

- `ErrorResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `ErrorResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `ErrorResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `ErrorResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `ErrorResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `ErrorResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `ErrorResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `ErrorResponse.ReferenceList` (array)

- `ErrorResponse.CurrencyRateConversion` (array)

- `ErrorResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.
