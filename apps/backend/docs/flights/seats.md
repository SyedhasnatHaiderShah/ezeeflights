# Seats Ancillaries EMDs

Seat map, book and cancel. Ancillary search, book, and cancel. EMD retrieve and void.

## Seat Map

- [POST /air/search/seat/catalogofferingsancillaries/seatavailabilities](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/createseatavailability.md): The Seat Map request returns seat availability for both free and paid seats. It is a reference payload that sends identifiers from a previous transaction or a booking. You can send the Seat Map request at several places in the JSON APIs workflow - after searching, after pricing, during booking, and after booking. The Seat Map request uses the same endpoint but a different message payload depending on where in the workflow it is sent. See the supported workflow options in the Seats Guide. All Seat Map requests allow you to request seat maps for any of the following: All flights within an offer (all flights on the itinerary). All flights within a product (all flights on one leg of an itinerary). One or more individual flights. Standalone Seat Map sends flight criteria including a booking code to return a view-only seat map. Unlike the Seat Map request, Standalone Seat Map does not send any identifiers from a previously searched or priced flight. It is instead a full payload request and can be sent entirely on its own, either within or outside of a workbench session.

## Ancillary Price (NDC only)

- [POST /air/ancillaryprice/offers/buildancillaryoffersfromcatalogofferings](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/buildancillaryoffersfromcatalogofferings.md): The Ancillary Price request confirms pricing request searches for a selected ancillary. You must first create a new or post-commit workbench and send an Ancillary Shop request. After pricing, add the selected ancillary to the workbench

## Ancillary Shop

- [POST /air/ancillaryshop/catalogofferingsancillaries](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/createancillarysearch.md): The Ancillary Shop request searches for ancillaries available for the Reservation. You must first create a new or post-commit workbench. After ancillary shop, send an ancillary price request (only for NDC), and then add the selected ancillary to the workbench.

## NDC Refund Quote and Seat/Ancillary cancel

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/canceloffer](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/cancelworkbenchoffer.md): The NDC Refund Quote API determines what if any refund value may be available on a ticket. It is part of the NDC cancel workflow: Create a workbench session, send Refund Quote as detailed here, and send Cancel to cancel the ticket and issue any refund. For supporting NDC carriers only, you can cancel only specified segments in Refund Quote instead of the entire itinerary. In this case, the ticket value is retained at Cancel.Refund Quote is mandatory when canceling a ticket outside the void period and there is any difference between a refund due and the purchase price. If Refund Quote is not sent, and a refund is not available for the exact amount of the purchase price, Cancel returns the error message OFFER CANNOT BE CANCELED WHEN REFUND AMOUNT DOES NOT EQUAL OFFER PRICE. PERFORM A REFUND QUOTE AND TRY AGAIN. The Ancillary Cancel API supports canceling baggage and/or paid seats for both GDS and NDC, and canceling non-baggage ancillaries for NDC. Canceling non-baggage ancillaries for GDS is not supported. Ancillary Cancel must be sent in a workbench session: Create a workbench, send Ancillary Cancel, and commit the workbench. You can cancel ancillaries booked in the same or a previous session. Seat and ancillary cancel support varies in the booking workflow. See the Seats Guide and Ancillary Guide for support details. Only one paid seat per workbench session can be canceled. To cancel multiple seats, send one cancel request, commit the workbench, and start a new workbench to cancel the next seat. For paid bags, you can send multiple cancel requests in a post-commit workbench session. You cannot cancel ancillaries or seats from a ticketed itinerary.

## Seat/Ancillary book

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildancillaryoffersfromcatalogofferings](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/workbenchbuildancillaryoffersfromcatalogofferings.md): The Ancillary Book request adds a selected ancillary or a paid seat to the new or post-commit workbench. For ancillaries, first send an Ancillary Shop request and an Ancillary Price request (NDC only). After adding an ancillary to the workbench, you must also issue an EMD for the selected ancillary per the Ancillary and EMD Guide. For paid seats, you must first create a workbench and send a Seat Map request.

## EMD retrieve

- [GET /air/emds/getbylocator](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/emdgetbylocator.md): Not currently implemented.

## EMD Display

- [GET /air/emds/{Identifier}](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/getemd.md): Display an EMD to retrieve EMD details such as the amount paid and agency ticketing information. EMD Display not supported for NDC. EMD details for NDC are returned in the Reservation Retrieve.

## EMD Void

- [PUT /air/emds/{Identifier}](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/updateemd.md): Void an EMD to cancel it. You can also use EMD void with the GDS exchange APIs to refund an EMD back to the original FOP. See the Exchange, Refund, and Void Guide. EMD Void not supported for NDC.

## NDC Refund Quote and Seat/Ancillary cancel

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/canceloffer](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/cancelworkbenchoffer.md): The NDC Refund Quote API determines what if any refund value may be available on a ticket. It is part of the NDC cancel workflow: Create a workbench session, send Refund Quote as detailed here, and send Cancel to cancel the ticket and issue any refund. For supporting NDC carriers only, you can cancel only specified segments in Refund Quote instead of the entire itinerary. In this case, the ticket value is retained at Cancel.Refund Quote is mandatory when canceling a ticket outside the void period and there is any difference between a refund due and the purchase price. If Refund Quote is not sent, and a refund is not available for the exact amount of the purchase price, Cancel returns the error message OFFER CANNOT BE CANCELED WHEN REFUND AMOUNT DOES NOT EQUAL OFFER PRICE. PERFORM A REFUND QUOTE AND TRY AGAIN. The Ancillary Cancel API supports canceling baggage and/or paid seats for both GDS and NDC, and canceling non-baggage ancillaries for NDC. Canceling non-baggage ancillaries for GDS is not supported. Ancillary Cancel must be sent in a workbench session: Create a workbench, send Ancillary Cancel, and commit the workbench. You can cancel ancillaries booked in the same or a previous session. Seat and ancillary cancel support varies in the booking workflow. See the Seats Guide and Ancillary Guide for support details. Only one paid seat per workbench session can be canceled. To cancel multiple seats, send one cancel request, commit the workbench, and start a new workbench to cancel the next seat. For paid bags, you can send multiple cancel requests in a post-commit workbench session. You cannot cancel ancillaries or seats from a ticketed itinerary.

# Seat Map

The Seat Map request returns seat availability for both free and paid seats. It is a reference payload that sends identifiers from a previous transaction or a booking. You can send the Seat Map request at several places in the JSON APIs workflow - after searching, after pricing, during booking, and after booking. The Seat Map request uses the same endpoint but a different message payload depending on where in the workflow it is sent. See the supported workflow options in the Seats Guide. All Seat Map requests allow you to request seat maps for any of the following: All flights within an offer (all flights on the itinerary). All flights within a product (all flights on one leg of an itinerary). One or more individual flights. Standalone Seat Map sends flight criteria including a booking code to return a view-only seat map. Unlike the Seat Map request, Standalone Seat Map does not send any identifiers from a previously searched or priced flight. It is instead a full payload request and can be sent entirely on its own, either within or outside of a workbench session.

Endpoint: POST /air/search/seat/catalogofferingsancillaries/seatavailabilities
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
  Discriminator class CatalogOfferingsQuerySeatAvailability only
  Example: "CatalogOfferingsQuerySeatAvailability"

- `SeatAvailabilityOfferings` (object, required)

- `SeatAvailabilityOfferings.@type` (string, required)
  Discriminator classes SeatAvailabilityOfferingsBuildFromCatalogOfferings, SeatAvailabilityOfferingsBuildFromCatalogProductOfferings, SeatAvailabilityOfferingsBuildFromOffer, SeatAvailabilityOfferingsBuildFromOfferList, SeatAvailabilityOfferingsBuildFromProducts, and SeatAvailabilityOfferingsBuildFromReservationWorkbench
  Example: "SeatAvailabilityOfferings"

- `SeatAvailabilityOfferings.CustomerLoyalty` (array)

- `SeatAvailabilityOfferings.CustomerLoyalty.value` (string, required)
  Number on loyalty card.
  Example: "132456"

- `SeatAvailabilityOfferings.CustomerLoyalty.id` (string)
  Optional Customer Loyalty Id. Not saved
  Example: "Loyalty_1"

- `SeatAvailabilityOfferings.CustomerLoyalty.priority` (integer)
  Optional Numeric Priority Code
  Example: 2

- `SeatAvailabilityOfferings.CustomerLoyalty.programId` (string)
  "Specifies an identifier to indicate the company owner of the loyalty program. Typically two characters.
  For frequent guest number, the hotel supplier or brand code.
  For frequent flyer number, the air supplier code of the loyalty program."
  Example: "United"

- `SeatAvailabilityOfferings.CustomerLoyalty.programName` (string)
  Supplier's loyalty program name.
  Example: "Frontier-EarlyReturns"

- `SeatAvailabilityOfferings.CustomerLoyalty.supplierType` (string)
  The type of supplier of a loyalty program. Uses 'hotel' for frequent guest number or 'air' for frequent flyer number.
  Example: "Airline"

- `SeatAvailabilityOfferings.CustomerLoyalty.supplier` (string, required)
  Supplier of a loyalty program (typically 2 characters representing the hotel, brand, or airline).
  Example: "UA"

- `SeatAvailabilityOfferings.CustomerLoyalty.tier` (string)
  Customer Loyalty tier
  Example: "Silver"

- `SeatAvailabilityOfferings.CustomerLoyalty.shareWithSupplier` (array)
  The list of suppliers that the CustomerLoyalty number is shared. Used for cross accrual.
  Example: ["LH"]

- `SeatAvailabilityOfferings.CustomerLoyalty.cardHolderName` (string)
  Customer loyalty member name; up to 128 characters are supported. In Air Search, for discounted offers to be returned, the name must be sent as LAST FIRST; e.g.,if SMITH is the last name and JORDAN the first name, send as SMITH JORDAN
  Example: "John Smith"

- `SeatAvailabilityOfferings.CustomerLoyalty.validatedInd` (boolean)
  Customer loyalty number has been validated by the supplier
  Example: true

- `SeatAvailabilityOfferings.CustomerLoyalty.prefix` (string)
  The cardholder name prefix title like Mr, Mrs, Dr
  Example: "Dr"

- `SeatAvailabilityOfferings.CustomerLoyalty.given` (string)
  The First Name of the Cardholder
  Example: "John"

- `SeatAvailabilityOfferings.CustomerLoyalty.middle` (string)
  Middle Name of the Cardholder
  Example: "Wilkinson"

- `SeatAvailabilityOfferings.CustomerLoyalty.surname` (string)
  Last Name of the Cardholder
  Example: "Smith"

## Response 200 fields (application/json):

- `CatalogOfferingsAncillaryListResponse` (object)
  "The response of a Catalog Offerings Ancillary list endpoint request. For Seats, the seat map response is nearly identical whether the request was sent after Search, after AirPrice, or in a workbench session. The only difference is that outside a workbench session, TravelerIdentifierRef returns only passengerTypeCode, as there are no traveler details at this point in the workflow. When Seat Map is sent for flight/s in a booking that already have seat assignments, the response inlcudes HeldAncillary to list the current SeatAssignment for each traveler on the flight/s. This supports modifying seats by holding the current seats until the new seats are successfully booked at workbench commit, ensuring those seats remain available in case of a booking failure. The Standalone Seat map response is the same as the reference payload seat map response, with the exception that a Result/Warning/Message is returned with the message 'The seatMap is view only'."

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID` (array)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.@type` (string, required)
  Example: "CatalogOfferings"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.id` (string)
  Local identifier within a given message for this object.
  Example: "CatalogOfferings_1"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.totalCatalogOffering` (integer)
  Total number of rates available for this request.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.catalogOfferingPerPage` (integer)
  Total number of rates returned per page.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.numberOfPages` (integer)
  Total number of pages created by this request.
  Example: 5

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering` (array, required)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.@type` (string, required)
  'Discriminator class for Hotel Availability is CatalogOfferingHospitality.
  Discriminator class for ExchangeSearch is CatalogOfferingModify.'
  Example: "CatalogOffering"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.id` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  For Hotel Availability, offers are cached for 30 minutes. If a Rules request or Reservation is not created within 30 minutes, a new Availability request must be sent."
  Example: "108c5875-c822-4d2e-bb9f-c96368100f4a:a709ffcdc1f681c5cf3f1d7da1a8ebfc"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.CatalogOfferingRef` (string)
  Used to reference another instance of this object in the same message
  Example: "co1"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ContentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ProductOptions` (array, required)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ProductOptions.@type` (string, required)
  Discriminator classes ProductOptionsID and ProductOptions.
  Example: "ProductOptions"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ProductOptions.id` (string)
  Local identifier within a given message for this object.
  Example: "ProductOptions_1"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ProductOptions.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ProductOptions.ProductOptionsRef` (string)
  Used to reference another instance of this object in the same message
  Example: "ProductOptions_1"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ProductOptions.sequence` (integer)
  NonnegativeInteger
  Example: 1

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ProductOptions.Product` (array, required)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price` (object, required)
  Child class of Price. This includes all of the Price object plus the Pricebreakdown which gives detailed Price information per PTC or Hotel offering.
  For a Hotels Create Reservation (Full Payload) request, find the values to send in the Price objects from either Availability (returned in CatalogOffering/Price) or Rules (returned in Offer/Price). Although you can send the price returned in either API, the Rules pricing may be more accurate. If you sent a Rules request, send the value from that response. You must include CurrencyCode, Base, TotalTaxes, and TotalPrice. When returned from the previous steps, additionally send TermsAndConditionsFull, ProductRateCodeInfo, and RateCodeInfo.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.@type` (string, required)
  Discriminator classes Price or PriceDetail
  Example: "PriceDetail"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.id` (string)
  Internally referenced id
  Example: "2"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.CurrencyCode.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.CurrencyCode.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.CurrencyCode.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.CurrencyCode.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.Base` (number)
  "Base price before taxes and fees.
  For Hotel, may not be returned by all suppliers."
  Example: 20.2

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.TotalTaxes` (number)
  "Total taxes applied to the base price.
  For Hotel, may not be returned by all suppliers."
  Example: 34.4

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.TotalFees` (number)
  Total fees included in Total Price.
  Example: 201

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.TotalPrice` (number)
  Total price of this offer including the base price and all taxes and fees.
  Example: 34

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.FlightPassCredits` (integer)
  The total number of flight pass credits consumed for this offer.
  Example: 2

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.PriceBreakdown` (array)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.PriceBreakdown.@type` (string, required)
  Discriminator. Air Search and Air Price APIs child classes are PriceBreakdownAir and PriceBreakdownAncillary.Search Ancillaries and Seat Availabilities child classes are PriceBreakdown, PriceBreakdownAncillary, and PriceBreakdownAncillaryAir. All Hotel API child classes are PriceBreakdownHospitality.Vehicle API child classes are PriceBreakdownVehicleCharges, PriceBreakdownVehicleDeposit, PriceBreakdownVehiclePrice, and PriceBreakdownAncillaryVehicle. Reservation and Reservation Workbench APIs are PriceBreakdownAir, PriceBreakdownAncillary, PriceBreakdownHospitality, PriceBreakdownVehicleCharges, PriceBreakdownVehicleDeposit, PriceBreakdownVehiclePrice, and PriceBreakdownAncillaryVehicle.
  Example: "PriceBreakdownAir"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.PriceBreakdown.Amount` (object)
  Amount represents the cost applied

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.PriceBreakdown.Commission` (object)
  Commission information. In Air Search commission is returned for GDS only; not supported for NDC. Any commission filed by an airline in a CAT35 fare is returned in PriceBreakdownAir/Commission. The amount is either a percent of the fare component (@type CommissionPercent and the Percent object) or an amount (@type CommissionAmount and the Amount object).

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal` (object)
  No longer used. Previously used to expose the local vendor currency when it is different to the purchased currency

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.@type` (string)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.currencySource` (string)
  The system requesting or returning the currency code specified in the attribute
  Enum: "Supplier", "Charged", "Requested"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Base` (number)
  The price prior to all applicable taxes of a product such as the rate for a room or fare for a flight.
  Example: 120.2

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Taxes` (object)
  Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Taxes.@type` (string, required)
  Discriminator. Child class is TaxesDetail
  Example: "TaxesDetail"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Taxes.TotalTaxes` (number)
  A monetary amount, representing the total of all taxes included in this offer. Supports up to 4 decimal places; decimal place must be included.
  Example: 330.1

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Taxes.TaxInfo` (array)
  Returned for TripChange APIS only.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Fees` (object)
  Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Fees.@type` (string, required)
  Discriminator. Child class FeesDetail
  Example: "FeesDetail"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Fees.TotalFees` (number)
  Total fees included in the TotalPrice. Supports up to 4 decimal places; decimal place needs to be included.
  Example: 111.11

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Fees.TotalAdditionalFeesPayableLocally` (number)
  Fees due separately at the property. Expected to be paid in local currency. These fees are not included in the Offer TotalPrice.
  Example: 2.1

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Total` (number)
  Specifies the total price including base + taxes + fees
  Example: 30.13

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.approximateInd` (boolean)
  True if this amount has been converted from the original amount
  Example: true

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions` (object)
  Terms And Conditions that apply to an offer.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.@type` (string, required)
  Discriminator. Air Search child classes are TermsAndConditionsAir and TermsAndConditionsAncillary. Exchange Search child class is TermsAndConditionsAirChange. Search Ancillaries and Seat Availabilities child classes are TermsAndConditions, TermsAndConditionsAncillary, and TermsAndConditionsAncillaryAir. Hotel Availability child class is TermsAndConditionsHospitality.
  Example: "TermsAndConditionsAir"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.id` (string)
  Local id within a given message to support referencing this object. For Air Search APIs, matches to the reference value in ProductBrandOffering/TermsAndConditions/termsAndConditionsRef in instances of ProductBrandOptions.
  Example: "TC_1"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.termsAndConditionsRef` (string)
  Reference id that corresponds to the TermsAndConditions 'id' in ReferenceListTermsAndConditions.TermsAndConditions.
  Example: "TC_1"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.ExpiryDate` (string)
  The date and time the offer will expire. Not returned in GDS Search. NDC generally allows 20 to 30 minutes to create a booking (the offer time limit). That time limit varies by airline and is returned here in the Search response.
  Example: "2022-08-07 12:12:00+00:00"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty` (array)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.AncillaryOffering` (array)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.AncillaryOffering.@type` (string, required)
  Discriminator classes AncillaryOfferingID and AncillaryOffering
  Example: "AncillaryOffering"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.AncillaryOffering.id` (string)
  Local identifier within a given message for this object.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.AncillaryOffering.CatalogOfferingRef` (string)
  Used to reference another instance of this object in the same message

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.AncillaryOffering.AncillaryOfferingRef` (string)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.AncillaryOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAncillaryListResponse.@type` (string)
  Example: "response"

- `CatalogOfferingsAncillaryListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `CatalogOfferingsAncillaryListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `CatalogOfferingsAncillaryListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `CatalogOfferingsAncillaryListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `CatalogOfferingsAncillaryListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `CatalogOfferingsAncillaryListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `CatalogOfferingsAncillaryListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `CatalogOfferingsAncillaryListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `CatalogOfferingsAncillaryListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `CatalogOfferingsAncillaryListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `CatalogOfferingsAncillaryListResponse.Result.Error.NameValuePair` (array)

- `CatalogOfferingsAncillaryListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `CatalogOfferingsAncillaryListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `CatalogOfferingsAncillaryListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `CatalogOfferingsAncillaryListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogOfferingsAncillaryListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `CatalogOfferingsAncillaryListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `CatalogOfferingsAncillaryListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `CatalogOfferingsAncillaryListResponse.Result.Warning.NameValuePair` (array)

- `CatalogOfferingsAncillaryListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogOfferingsAncillaryListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAncillaryListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `CatalogOfferingsAncillaryListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `CatalogOfferingsAncillaryListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `CatalogOfferingsAncillaryListResponse.NextSteps.NextStep` (array, required)

- `CatalogOfferingsAncillaryListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `CatalogOfferingsAncillaryListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `CatalogOfferingsAncillaryListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `CatalogOfferingsAncillaryListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `CatalogOfferingsAncillaryListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `CatalogOfferingsAncillaryListResponse.ReferenceList` (array)

- `CatalogOfferingsAncillaryListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `CatalogOfferingsAncillaryListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion` (array)

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion.@type` (string)

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `CatalogOfferingsAncillaryListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `CatalogOfferingsAncillaryListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `CatalogOfferingsAncillaryListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `CatalogOfferingsAncillaryListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `CatalogOfferingsAncillaryListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `CatalogOfferingsAncillaryListResponse.Pagination.totalItems` (integer, required)
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

# Ancillary Price (NDC only)

The Ancillary Price request confirms pricing request searches for a selected ancillary. You must first create a new or post-commit workbench and send an Ancillary Shop request. After pricing, add the selected ancillary to the workbench

Endpoint: POST /air/ancillaryprice/offers/buildancillaryoffersfromcatalogofferings
Version: 11.33.0
Security: bearerAuth

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

## Request fields (application/json):

- `@type` (string, required)
  Discriminator class OfferQueryBuildAncillaryOffersFromCatalogOfferings only
  Example: "OfferQueryBuildAncillaryOffersFromCatalogOfferings"

- `BuildAncillaryOffersFromCatalogOfferings` (array, required)

- `BuildAncillaryOffersFromCatalogOfferings.@type` (string, required)
  Discriminator classes BuildAncillaryOffersFromCatalogOfferings or BuildAncillaryOffersFromCatalogOfferingsAirSeat
  Example: "BuildAncillaryOffersFromCatalogOfferings"

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingsIdentifier` (object, required)
  Catalog offerings Identifier class.

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingsIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "CatalogOfferings_1"

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingsIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingsIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingsIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingIdentifier` (object, required)
  Catalog Offering Identifier class.

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "co1"

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingIdentifier.CatalogOfferingRef` (string)
  Used to reference another instance of this object in the same message
  Example: "co1"

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BuildAncillaryOffersFromCatalogOfferings.ProductIdentifier` (object)
  Product Identifier class

- `BuildAncillaryOffersFromCatalogOfferings.ProductIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "product_1"

- `BuildAncillaryOffersFromCatalogOfferings.ProductIdentifier.productRef` (string)
  Used to reference another instance of this object in the same payload.
  Example: "product_1"

- `BuildAncillaryOffersFromCatalogOfferings.ProductIdentifier.Identifier` (object)
  In next leg search Value from CatalogProductOffering/ProductBrandOptions/ProductBrandOffering/Product/productRef in the Search response for the product to select for the first leg of the itinerary. When sending a second Next Leg Search request in a multi-city search, this value should be the offer for the second leg of the itinerary, and so on for additional O&D pairs.

- `BuildAncillaryOffersFromCatalogOfferings.ProductIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `BuildAncillaryOffersFromCatalogOfferings.ProductIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `BuildAncillaryOffersFromCatalogOfferings.Quantity` (integer)
  The quantity of ancillaries to be included in the Offer
  Example: 3

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef` (object)
  Identifier references as object both within a message payload or an object held in cache that may be used for subsequent workflows

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.name` (string)
  Traveler identifier

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.passengerTypeCode` (string)
  Passenger Type code
  Example: "ADT"

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.ages` (array)
  The ages of the travelers associated to a particular ptc. For NDC, this value will be returned in PriceBreakdownAir if sent as part of the PassengerCriteria in the Air Search request.
  Example: [15]

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.passengerCriteriaRef` (string)
  Allows the user to associate passenger criteria information.
  Example: "passengerCriteria_1"

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.value` (string)

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.id` (string)
  A locally referenced ID

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.description` (string)
  Descriptive text used to identify the contents of a target object

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.uris` (array)
  Uniform Resource Identifier
  Example: ["google.com"]

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.age` (integer)
  Replaced with ages array. The age of the traveler.
  Example: 11

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingsAncillaryListIdentifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BuildAncillaryOffersFromCatalogOfferings.includeUnsellableAncillariesInd` (boolean)
  If true, the response will include unsellable ancillary options
  Example: true

- `BuildAncillaryOffersFromCatalogOfferings.Comments` (object)
  Comments object to relay text information

- `BuildAncillaryOffersFromCatalogOfferings.Comments.@type` (string)
  Example: "Comments"

- `BuildAncillaryOffersFromCatalogOfferings.Comments.Comment` (array)

- `BuildAncillaryOffersFromCatalogOfferings.Comments.Comment.value` (string)
  Actual text. May be restricted by character limits based on the type of comment (e.g. Notepad remarks limited to 87 characters).
  Example: "Additional comments"

- `BuildAncillaryOffersFromCatalogOfferings.Comments.Comment.id` (string)
  Local identifier within a given message for this object.
  Example: "comment_1"

- `BuildAncillaryOffersFromCatalogOfferings.Comments.Comment.name` (string)
  Title of comment or type of remark.
  Example: "Comment name"

- `BuildAncillaryOffersFromCatalogOfferings.Comments.Comment.language` (string)
  Language code using ISO-639 standard
  Example: "EN"

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

# Ancillary Shop

The Ancillary Shop request searches for ancillaries available for the Reservation. You must first create a new or post-commit workbench. After ancillary shop, send an ancillary price request (only for NDC), and then add the selected ancillary to the workbench.

Endpoint: POST /air/ancillaryshop/catalogofferingsancillaries
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
  Discriminator class CatalogOfferingsQueryAncillaries only
  Example: "CatalogOfferingsQueryAncillaries"

- `AncillaryOfferings` (object, required)

- `AncillaryOfferings.@type` (string, required)
  Discriminator classes AncillaryOfferingsBuildFromCatalogOfferings, AncillaryOfferingsBuildFromCatalogProductOfferings, AncillaryOfferingsBuildFromOfferList, AncillaryOfferingsBuildFromOffer, and AncillaryOfferingsBuildFromReservationWorkbench
  Example: "AncillaryOfferingsBuildFromReservationWorkbench"

- `AncillaryOfferings.includeUnsellableAncillariesInd` (boolean)
  If true, the response will include unsellable ancillary options
  Example: true

## Response 200 fields (application/json):

- `CatalogOfferingsAncillaryListResponse` (object)
  "The response of a Catalog Offerings Ancillary list endpoint request. For Seats, the seat map response is nearly identical whether the request was sent after Search, after AirPrice, or in a workbench session. The only difference is that outside a workbench session, TravelerIdentifierRef returns only passengerTypeCode, as there are no traveler details at this point in the workflow. When Seat Map is sent for flight/s in a booking that already have seat assignments, the response inlcudes HeldAncillary to list the current SeatAssignment for each traveler on the flight/s. This supports modifying seats by holding the current seats until the new seats are successfully booked at workbench commit, ensuring those seats remain available in case of a booking failure. The Standalone Seat map response is the same as the reference payload seat map response, with the exception that a Result/Warning/Message is returned with the message 'The seatMap is view only'."

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID` (array)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.@type` (string, required)
  Example: "CatalogOfferings"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.id` (string)
  Local identifier within a given message for this object.
  Example: "CatalogOfferings_1"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.totalCatalogOffering` (integer)
  Total number of rates available for this request.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.catalogOfferingPerPage` (integer)
  Total number of rates returned per page.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.numberOfPages` (integer)
  Total number of pages created by this request.
  Example: 5

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering` (array, required)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.@type` (string, required)
  'Discriminator class for Hotel Availability is CatalogOfferingHospitality.
  Discriminator class for ExchangeSearch is CatalogOfferingModify.'
  Example: "CatalogOffering"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.id` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  For Hotel Availability, offers are cached for 30 minutes. If a Rules request or Reservation is not created within 30 minutes, a new Availability request must be sent."
  Example: "108c5875-c822-4d2e-bb9f-c96368100f4a:a709ffcdc1f681c5cf3f1d7da1a8ebfc"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.CatalogOfferingRef` (string)
  Used to reference another instance of this object in the same message
  Example: "co1"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ContentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ProductOptions` (array, required)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ProductOptions.@type` (string, required)
  Discriminator classes ProductOptionsID and ProductOptions.
  Example: "ProductOptions"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ProductOptions.id` (string)
  Local identifier within a given message for this object.
  Example: "ProductOptions_1"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ProductOptions.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ProductOptions.ProductOptionsRef` (string)
  Used to reference another instance of this object in the same message
  Example: "ProductOptions_1"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ProductOptions.sequence` (integer)
  NonnegativeInteger
  Example: 1

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.ProductOptions.Product` (array, required)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price` (object, required)
  Child class of Price. This includes all of the Price object plus the Pricebreakdown which gives detailed Price information per PTC or Hotel offering.
  For a Hotels Create Reservation (Full Payload) request, find the values to send in the Price objects from either Availability (returned in CatalogOffering/Price) or Rules (returned in Offer/Price). Although you can send the price returned in either API, the Rules pricing may be more accurate. If you sent a Rules request, send the value from that response. You must include CurrencyCode, Base, TotalTaxes, and TotalPrice. When returned from the previous steps, additionally send TermsAndConditionsFull, ProductRateCodeInfo, and RateCodeInfo.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.@type` (string, required)
  Discriminator classes Price or PriceDetail
  Example: "PriceDetail"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.id` (string)
  Internally referenced id
  Example: "2"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.CurrencyCode.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.CurrencyCode.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.CurrencyCode.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.CurrencyCode.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.Base` (number)
  "Base price before taxes and fees.
  For Hotel, may not be returned by all suppliers."
  Example: 20.2

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.TotalTaxes` (number)
  "Total taxes applied to the base price.
  For Hotel, may not be returned by all suppliers."
  Example: 34.4

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.TotalFees` (number)
  Total fees included in Total Price.
  Example: 201

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.TotalPrice` (number)
  Total price of this offer including the base price and all taxes and fees.
  Example: 34

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.FlightPassCredits` (integer)
  The total number of flight pass credits consumed for this offer.
  Example: 2

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.PriceBreakdown` (array)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.PriceBreakdown.@type` (string, required)
  Discriminator. Air Search and Air Price APIs child classes are PriceBreakdownAir and PriceBreakdownAncillary.Search Ancillaries and Seat Availabilities child classes are PriceBreakdown, PriceBreakdownAncillary, and PriceBreakdownAncillaryAir. All Hotel API child classes are PriceBreakdownHospitality.Vehicle API child classes are PriceBreakdownVehicleCharges, PriceBreakdownVehicleDeposit, PriceBreakdownVehiclePrice, and PriceBreakdownAncillaryVehicle. Reservation and Reservation Workbench APIs are PriceBreakdownAir, PriceBreakdownAncillary, PriceBreakdownHospitality, PriceBreakdownVehicleCharges, PriceBreakdownVehicleDeposit, PriceBreakdownVehiclePrice, and PriceBreakdownAncillaryVehicle.
  Example: "PriceBreakdownAir"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.PriceBreakdown.Amount` (object)
  Amount represents the cost applied

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.PriceBreakdown.Commission` (object)
  Commission information. In Air Search commission is returned for GDS only; not supported for NDC. Any commission filed by an airline in a CAT35 fare is returned in PriceBreakdownAir/Commission. The amount is either a percent of the fare component (@type CommissionPercent and the Percent object) or an amount (@type CommissionAmount and the Amount object).

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal` (object)
  No longer used. Previously used to expose the local vendor currency when it is different to the purchased currency

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.@type` (string)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.currencySource` (string)
  The system requesting or returning the currency code specified in the attribute
  Enum: "Supplier", "Charged", "Requested"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Base` (number)
  The price prior to all applicable taxes of a product such as the rate for a room or fare for a flight.
  Example: 120.2

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Taxes` (object)
  Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Taxes.@type` (string, required)
  Discriminator. Child class is TaxesDetail
  Example: "TaxesDetail"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Taxes.TotalTaxes` (number)
  A monetary amount, representing the total of all taxes included in this offer. Supports up to 4 decimal places; decimal place must be included.
  Example: 330.1

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Taxes.TaxInfo` (array)
  Returned for TripChange APIS only.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Fees` (object)
  Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Fees.@type` (string, required)
  Discriminator. Child class FeesDetail
  Example: "FeesDetail"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Fees.TotalFees` (number)
  Total fees included in the TotalPrice. Supports up to 4 decimal places; decimal place needs to be included.
  Example: 111.11

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Fees.TotalAdditionalFeesPayableLocally` (number)
  Fees due separately at the property. Expected to be paid in local currency. These fees are not included in the Offer TotalPrice.
  Example: 2.1

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.Total` (number)
  Specifies the total price including base + taxes + fees
  Example: 30.13

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.Price.VendorCurrencyTotal.approximateInd` (boolean)
  True if this amount has been converted from the original amount
  Example: true

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions` (object)
  Terms And Conditions that apply to an offer.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.@type` (string, required)
  Discriminator. Air Search child classes are TermsAndConditionsAir and TermsAndConditionsAncillary. Exchange Search child class is TermsAndConditionsAirChange. Search Ancillaries and Seat Availabilities child classes are TermsAndConditions, TermsAndConditionsAncillary, and TermsAndConditionsAncillaryAir. Hotel Availability child class is TermsAndConditionsHospitality.
  Example: "TermsAndConditionsAir"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.id` (string)
  Local id within a given message to support referencing this object. For Air Search APIs, matches to the reference value in ProductBrandOffering/TermsAndConditions/termsAndConditionsRef in instances of ProductBrandOptions.
  Example: "TC_1"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.termsAndConditionsRef` (string)
  Reference id that corresponds to the TermsAndConditions 'id' in ReferenceListTermsAndConditions.TermsAndConditions.
  Example: "TC_1"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.ExpiryDate` (string)
  The date and time the offer will expire. Not returned in GDS Search. NDC generally allows 20 to 30 minutes to create a booking (the offer time limit). That time limit varies by airline and is returned here in the Search response.
  Example: "2022-08-07 12:12:00+00:00"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty` (array)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.value` (string, required)
  Number on loyalty card.
  Example: "132456"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.id` (string)
  Optional Customer Loyalty Id. Not saved
  Example: "Loyalty_1"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.priority` (integer)
  Optional Numeric Priority Code
  Example: 2

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.programId` (string)
  "Specifies an identifier to indicate the company owner of the loyalty program. Typically two characters.
  For frequent guest number, the hotel supplier or brand code.
  For frequent flyer number, the air supplier code of the loyalty program."
  Example: "United"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.programName` (string)
  Supplier's loyalty program name.
  Example: "Frontier-EarlyReturns"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.supplierType` (string)
  The type of supplier of a loyalty program. Uses 'hotel' for frequent guest number or 'air' for frequent flyer number.
  Example: "Airline"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.supplier` (string, required)
  Supplier of a loyalty program (typically 2 characters representing the hotel, brand, or airline).
  Example: "UA"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.tier` (string)
  Customer Loyalty tier
  Example: "Silver"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.shareWithSupplier` (array)
  The list of suppliers that the CustomerLoyalty number is shared. Used for cross accrual.
  Example: ["LH"]

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.cardHolderName` (string)
  Customer loyalty member name; up to 128 characters are supported. In Air Search, for discounted offers to be returned, the name must be sent as LAST FIRST; e.g.,if SMITH is the last name and JORDAN the first name, send as SMITH JORDAN
  Example: "John Smith"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.validatedInd` (boolean)
  Customer loyalty number has been validated by the supplier
  Example: true

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.prefix` (string)
  The cardholder name prefix title like Mr, Mrs, Dr
  Example: "Dr"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.given` (string)
  The First Name of the Cardholder
  Example: "John"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.middle` (string)
  Middle Name of the Cardholder
  Example: "Wilkinson"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.CatalogOffering.TermsAndConditions.CustomerLoyalty.surname` (string)
  Last Name of the Cardholder
  Example: "Smith"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.AncillaryOffering` (array)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.AncillaryOffering.@type` (string, required)
  Discriminator classes AncillaryOfferingID and AncillaryOffering
  Example: "AncillaryOffering"

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.AncillaryOffering.id` (string)
  Local identifier within a given message for this object.

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.AncillaryOffering.CatalogOfferingRef` (string)
  Used to reference another instance of this object in the same message

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.AncillaryOffering.AncillaryOfferingRef` (string)

- `CatalogOfferingsAncillaryListResponse.CatalogOfferingsID.AncillaryOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAncillaryListResponse.@type` (string)
  Example: "response"

- `CatalogOfferingsAncillaryListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `CatalogOfferingsAncillaryListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `CatalogOfferingsAncillaryListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `CatalogOfferingsAncillaryListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `CatalogOfferingsAncillaryListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `CatalogOfferingsAncillaryListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `CatalogOfferingsAncillaryListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `CatalogOfferingsAncillaryListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `CatalogOfferingsAncillaryListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `CatalogOfferingsAncillaryListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `CatalogOfferingsAncillaryListResponse.Result.Error.NameValuePair` (array)

- `CatalogOfferingsAncillaryListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `CatalogOfferingsAncillaryListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `CatalogOfferingsAncillaryListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `CatalogOfferingsAncillaryListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogOfferingsAncillaryListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `CatalogOfferingsAncillaryListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `CatalogOfferingsAncillaryListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `CatalogOfferingsAncillaryListResponse.Result.Warning.NameValuePair` (array)

- `CatalogOfferingsAncillaryListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogOfferingsAncillaryListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogOfferingsAncillaryListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `CatalogOfferingsAncillaryListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `CatalogOfferingsAncillaryListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `CatalogOfferingsAncillaryListResponse.NextSteps.NextStep` (array, required)

- `CatalogOfferingsAncillaryListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `CatalogOfferingsAncillaryListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `CatalogOfferingsAncillaryListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `CatalogOfferingsAncillaryListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `CatalogOfferingsAncillaryListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `CatalogOfferingsAncillaryListResponse.ReferenceList` (array)

- `CatalogOfferingsAncillaryListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `CatalogOfferingsAncillaryListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion` (array)

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion.@type` (string)

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CatalogOfferingsAncillaryListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `CatalogOfferingsAncillaryListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `CatalogOfferingsAncillaryListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `CatalogOfferingsAncillaryListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `CatalogOfferingsAncillaryListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `CatalogOfferingsAncillaryListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `CatalogOfferingsAncillaryListResponse.Pagination.totalItems` (integer, required)
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

# Seat/Ancillary book

The Ancillary Book request adds a selected ancillary or a paid seat to the new or post-commit workbench. For ancillaries, first send an Ancillary Shop request and an Ancillary Price request (NDC only). After adding an ancillary to the workbench, you must also issue an EMD for the selected ancillary per the Ancillary and EMD Guide. For paid seats, you must first create a workbench and send a Seat Map request.

Endpoint: POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildancillaryoffersfromcatalogofferings
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
  Discriminator class OfferQueryBuildAncillaryOffersFromCatalogOfferings only
  Example: "OfferQueryBuildAncillaryOffersFromCatalogOfferings"

- `BuildAncillaryOffersFromCatalogOfferings` (array, required)

- `BuildAncillaryOffersFromCatalogOfferings.@type` (string, required)
  Discriminator classes BuildAncillaryOffersFromCatalogOfferings or BuildAncillaryOffersFromCatalogOfferingsAirSeat
  Example: "BuildAncillaryOffersFromCatalogOfferings"

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingsIdentifier` (object, required)
  Catalog offerings Identifier class.

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingsIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "CatalogOfferings_1"

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingsIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingsIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingsIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingIdentifier` (object, required)
  Catalog Offering Identifier class.

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "co1"

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingIdentifier.CatalogOfferingRef` (string)
  Used to reference another instance of this object in the same message
  Example: "co1"

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BuildAncillaryOffersFromCatalogOfferings.ProductIdentifier` (object)
  Product Identifier class

- `BuildAncillaryOffersFromCatalogOfferings.ProductIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "product_1"

- `BuildAncillaryOffersFromCatalogOfferings.ProductIdentifier.productRef` (string)
  Used to reference another instance of this object in the same payload.
  Example: "product_1"

- `BuildAncillaryOffersFromCatalogOfferings.ProductIdentifier.Identifier` (object)
  In next leg search Value from CatalogProductOffering/ProductBrandOptions/ProductBrandOffering/Product/productRef in the Search response for the product to select for the first leg of the itinerary. When sending a second Next Leg Search request in a multi-city search, this value should be the offer for the second leg of the itinerary, and so on for additional O&D pairs.

- `BuildAncillaryOffersFromCatalogOfferings.ProductIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `BuildAncillaryOffersFromCatalogOfferings.ProductIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `BuildAncillaryOffersFromCatalogOfferings.Quantity` (integer)
  The quantity of ancillaries to be included in the Offer
  Example: 3

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef` (object)
  Identifier references as object both within a message payload or an object held in cache that may be used for subsequent workflows

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.name` (string)
  Traveler identifier

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.passengerTypeCode` (string)
  Passenger Type code
  Example: "ADT"

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.ages` (array)
  The ages of the travelers associated to a particular ptc. For NDC, this value will be returned in PriceBreakdownAir if sent as part of the PassengerCriteria in the Air Search request.
  Example: [15]

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.passengerCriteriaRef` (string)
  Allows the user to associate passenger criteria information.
  Example: "passengerCriteria_1"

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.value` (string)

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.id` (string)
  A locally referenced ID

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.description` (string)
  Descriptive text used to identify the contents of a target object

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.uris` (array)
  Uniform Resource Identifier
  Example: ["google.com"]

- `BuildAncillaryOffersFromCatalogOfferings.TravelerIdentifierRef.age` (integer)
  Replaced with ages array. The age of the traveler.
  Example: 11

- `BuildAncillaryOffersFromCatalogOfferings.CatalogOfferingsAncillaryListIdentifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BuildAncillaryOffersFromCatalogOfferings.includeUnsellableAncillariesInd` (boolean)
  If true, the response will include unsellable ancillary options
  Example: true

- `BuildAncillaryOffersFromCatalogOfferings.Comments` (object)
  Comments object to relay text information

- `BuildAncillaryOffersFromCatalogOfferings.Comments.@type` (string)
  Example: "Comments"

- `BuildAncillaryOffersFromCatalogOfferings.Comments.Comment` (array)

- `BuildAncillaryOffersFromCatalogOfferings.Comments.Comment.value` (string)
  Actual text. May be restricted by character limits based on the type of comment (e.g. Notepad remarks limited to 87 characters).
  Example: "Additional comments"

- `BuildAncillaryOffersFromCatalogOfferings.Comments.Comment.id` (string)
  Local identifier within a given message for this object.
  Example: "comment_1"

- `BuildAncillaryOffersFromCatalogOfferings.Comments.Comment.name` (string)
  Title of comment or type of remark.
  Example: "Comment name"

- `BuildAncillaryOffersFromCatalogOfferings.Comments.Comment.language` (string)
  Language code using ISO-639 standard
  Example: "EN"

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

# EMD retrieve

Not currently implemented.

Endpoint: GET /air/emds/getbylocator
Version: 11.33.0
Security: bearerAuth

## Query parameters:

- `Locator` (string, required)
  The booking locator code used to retrieve a Reservation
  Example: "ABC123"

- `creationDate` (string)
  PNR creation Date

- `locatorType` (string)
  Specifies the type of reservation ID
  Example: "GDS"

- `source` (string)
  Specifies a unique identifier to indicate the source system which generated the resId.
  Example: "1G"

- `sourceContext` (string)
  Specifies the context of the source.
  Example: "GDS"

- `otaType` (string)
  Used for codes in the OpenTravel Code tables. Possible values of this pattern are 1, 101, 101.EQP, or 101.EQP.X.
  Example: "31"

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

- `EMDListResponse` (object)
  The response of a EMD list endpoint request.

- `EMDListResponse.EMDID` (array)

- `EMDListResponse.EMDID.@type` (string, required)
  Discriminator classes EMDID, EMD or EMDSummary
  Example: "EMD"

- `EMDListResponse.EMDID.id` (string)
  EMD reference ID.

- `EMDListResponse.EMDID.EMDRef` (string)

- `EMDListResponse.EMDID.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `EMDListResponse.EMDID.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `EMDListResponse.EMDID.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `EMDListResponse.EMDID.PersonName` (object, required)
  Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

- `EMDListResponse.EMDID.PersonName.@type` (string, required)
  Discriminator classes PersonName or PersonNameDetail
  Example: "PersonNameDetail"

- `EMDListResponse.EMDID.PersonName.Prefix` (string)
  Salutation of honorific (e.g. Mr., Mrs., Ms., Miss, Dr.)
  Example: "Mr"

- `EMDListResponse.EMDID.PersonName.Given` (string)
  Given name, first name or names.
  Example: "John"

- `EMDListResponse.EMDID.PersonName.Middle` (string)
  The middle name of the person name.
  Example: "Erick"

- `EMDListResponse.EMDID.PersonName.Surname` (string, required)
  Family name, last name.
  Example: "Smith"

- `EMDListResponse.EMDID.ReservationLocator` (array)

- `EMDListResponse.EMDID.ReservationLocator.value` (string)
  Example: "WTR45G"

- `EMDListResponse.EMDID.ReservationLocator.supplierCode` (string)
  Supplier Code
  Example: "AA"

- `EMDListResponse.EMDID.ReservationLocator.supplierName` (string)
  Name of the supplier
  Example: "American Airlines"

- `EMDListResponse.EMDID.AgencyInfo` (object, required)
  Detail of the travel agency that issues the ticket

- `EMDListResponse.EMDID.AgencyInfo.ticketedDate` (string)
  Ticketed date
  Example: "2026-04-05"

- `EMDListResponse.EMDID.AgencyInfo.name` (string, required)
  Name of the Agency
  Example: "Alpha travel"

- `EMDListResponse.EMDID.AgencyInfo.place` (string)
  Place of the agency
  Example: "Marietta"

- `EMDListResponse.EMDID.AgencyInfo.ticketingPCC` (string)
  Ticketing PCC
  Example: "1CR"

- `EMDListResponse.EMDID.AgencyInfo.code` (string)
  Agency code
  Example: "12430870"

- `EMDListResponse.EMDID.AgencyInfo.salesType` (string)
  Sales type
  Example: "Ticketing"

- `EMDListResponse.EMDID.AgencyInfo.ticketingCountry` (string, required)
  Ticketing country
  Example: "US"

- `EMDListResponse.EMDID.AgencyInfo.ticketingCity` (string, required)
  Ticketing city
  Example: "NYC"

- `EMDListResponse.EMDID.EMDSegment` (array, required)

- `EMDListResponse.EMDID.EMDSegment.@type` (string, required)
  Example: "EMDSegment"

- `EMDListResponse.EMDID.EMDSegment.sequence` (integer, required)
  Sequence of EMDSegment

- `EMDListResponse.EMDID.EMDSegment.quantity` (integer)
  The quantity of the ancillary available on this EMDSegment

- `EMDListResponse.EMDID.EMDSegment.EMDDescription` (object)
  A description of the ancillary with two description codes

- `EMDListResponse.EMDID.EMDSegment.EMDDescription.value` (string)
  Example: "First checked bag"

- `EMDListResponse.EMDID.EMDSegment.EMDDescription.code` (string)
  A description of the ancillary with two description codes
  Example: "BG"

- `EMDListResponse.EMDID.EMDSegment.EMDDescription.subCode` (string)
  EMD number sub code
  Example: "02C"

- `EMDListResponse.EMDID.EMDSegment.EMDDescription.codeContext` (string)
  Code context
  Example: "ATPCO"

- `EMDListResponse.EMDID.EMDSegment.Amount` (object)
  Amount represents the cost applied

- `EMDListResponse.EMDID.EMDSegment.Amount.@type` (string)

- `EMDListResponse.EMDID.EMDSegment.Amount.currencySource` (string)
  The system requesting or returning the currency code specified in the attribute
  Enum: "Supplier", "Charged", "Requested"

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `EMDListResponse.EMDID.EMDSegment.Amount.Base` (number)
  The base price prior to all applicable taxes or fees of a product, such as the amount for a room or fare for a flight.
  Example: 120.2

- `EMDListResponse.EMDID.EMDSegment.Amount.Taxes` (object)
  Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

- `EMDListResponse.EMDID.EMDSegment.Amount.Taxes.@type` (string, required)
  Discriminator. Child class is TaxesDetail
  Example: "TaxesDetail"

- `EMDListResponse.EMDID.EMDSegment.Amount.Taxes.TotalTaxes` (number)
  A monetary amount, representing the total of all taxes included in this offer. Supports up to 4 decimal places; decimal place must be included.
  Example: 330.1

- `EMDListResponse.EMDID.EMDSegment.Amount.Taxes.TaxInfo` (array)
  Returned for TripChange APIS only.

- `EMDListResponse.EMDID.EMDSegment.Amount.Fees` (object)
  Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

- `EMDListResponse.EMDID.EMDSegment.Amount.Fees.@type` (string, required)
  Discriminator. Child class FeesDetail
  Example: "FeesDetail"

- `EMDListResponse.EMDID.EMDSegment.Amount.Fees.TotalFees` (number)
  Total fees included in the TotalPrice. Supports up to 4 decimal places; decimal place needs to be included.
  Example: 111.11

- `EMDListResponse.EMDID.EMDSegment.Amount.Fees.TotalAdditionalFeesPayableLocally` (number)
  Fees due separately at the property. Expected to be paid in local currency. These fees are not included in the Offer TotalPrice.
  Example: 2.1

- `EMDListResponse.EMDID.EMDSegment.Amount.Total` (number)
  "Specifies the total price including base + taxes + fees.
  In PriceBreakdownHospitality, this total is for a given group of nights.
  In PriceBreakdownAir this is the total for one passenger of this PTC type."
  Example: 230.13

- `EMDListResponse.EMDID.EMDSegment.Amount.approximateInd` (boolean)
  if true this amount has been converted from the original amount
  Example: true

- `EMDListResponse.EMDID.EMDSegment.Status` (string)
  The EMD status.
  Enum: "Open", "Refund", "Used", "Void"

- `EMDListResponse.EMDID.EMDSegment.DateOfService` (string)
  The date of service the service is available for

- `EMDListResponse.EMDID.EMDSegment.PresentTo` (string)
  The airline the EMD should be presented to to supply the service

- `EMDListResponse.EMDID.EMDSegment.PresentAt` (string)
  The location the EMD should be presented to to supply the service

- `EMDListResponse.EMDID.EMDSegment.Routing` (string)
  The routing the service is valid on

- `EMDListResponse.EMDID.TotalAmount` (object)
  Total Amount object

- `EMDListResponse.EMDID.TotalAmount.@type` (string)

- `EMDListResponse.EMDID.TotalAmount.currencySource` (string)
  The system requesting or returning the currency code specified in the attribute
  Enum: "Supplier", "Charged", "Requested"

- `EMDListResponse.EMDID.TotalAmount.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `EMDListResponse.EMDID.TotalAmount.Base` (number)
  The price prior to all applicable taxes of a product such as the rate for a room or fare for a flight.
  Example: 120.2

- `EMDListResponse.EMDID.TotalAmount.Taxes` (object)
  Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

- `EMDListResponse.EMDID.TotalAmount.Fees` (object)
  Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

- `EMDListResponse.EMDID.TotalAmount.Total` (number)
  Specifies the total price including base + taxes + fees
  Example: 30.13

- `EMDListResponse.EMDID.TotalAmount.approximateInd` (boolean)
  True if this amount has been converted from the original amount
  Example: true

- `EMDListResponse.EMDID.FormOfPayment` (object, required)

- `EMDListResponse.EMDID.FormOfPayment.value` (string)
  The list of valid forms of payment.
  Enum: "AgencyAccount", "BSP", "Cash", "Document", "Invoice", "PaymentCard", "WaiverCode"

- `EMDListResponse.EMDID.FormOfPayment.documentNumber` (string)
  Payment document number
  Example: "45"

- `EMDListResponse.EMDID.FormOfPayment.encryptedValue` (string)
  Encrypted value
  Example: "BNASJASJKASKJASHJKASK"

- `EMDListResponse.EMDID.FormOfPayment.documentIssuer` (string)
  Document issuer
  Example: "Alpha travel"

- `EMDListResponse.EMDID.FormOfPayment.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `EMDListResponse.EMDID.ESAC` (string)
  The BSP ESAC code assign for a void or refund transaction\nThe BSP E

- `EMDListResponse.EMDID.AssociatedTicketNumber` (object)
  The ticketNumber that will be used as partial payment for this Offer\/Offering

- `EMDListResponse.EMDID.AssociatedTicketNumber.value` (string)
  Ticket number
  Example: "1156"

- `EMDListResponse.EMDID.AssociatedTicketNumber.ticketIssuer` (string)
  Ticket issuer
  Example: "Cargo airways"

- `EMDListResponse.EMDID.AssociatedTicketNumber.contentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

- `EMDListResponse.EMDID.Restrictions` (array)

- `EMDListResponse.@type` (string)
  Example: "response"

- `EMDListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `EMDListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `EMDListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `EMDListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `EMDListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `EMDListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `EMDListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `EMDListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `EMDListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `EMDListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `EMDListResponse.Result.Error.NameValuePair` (array)

- `EMDListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `EMDListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `EMDListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `EMDListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `EMDListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `EMDListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `EMDListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `EMDListResponse.Result.Warning.NameValuePair` (array)

- `EMDListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `EMDListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `EMDListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `EMDListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `EMDListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `EMDListResponse.NextSteps.NextStep` (array, required)

- `EMDListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `EMDListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `EMDListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `EMDListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `EMDListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `EMDListResponse.ReferenceList` (array)

- `EMDListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `EMDListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `EMDListResponse.CurrencyRateConversion` (array)

- `EMDListResponse.CurrencyRateConversion.@type` (string)

- `EMDListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `EMDListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `EMDListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `EMDListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `EMDListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `EMDListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `EMDListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `EMDListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `EMDListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `EMDListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `EMDListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `EMDListResponse.Pagination.totalItems` (integer, required)
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

# EMD Display

Display an EMD to retrieve EMD details such as the amount paid and agency ticketing information. EMD Display not supported for NDC. EMD details for NDC are returned in the Reservation Retrieve.

Endpoint: GET /air/emds/{Identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `Identifier` (string, required)
  The EMD number you wish to retrieve
  Example: "1253300123456"

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

- `EMDListResponse` (object)
  The response of a EMD list endpoint request.

- `EMDListResponse.EMDID` (array)

- `EMDListResponse.EMDID.@type` (string, required)
  Discriminator classes EMDID, EMD or EMDSummary
  Example: "EMD"

- `EMDListResponse.EMDID.id` (string)
  EMD reference ID.

- `EMDListResponse.EMDID.EMDRef` (string)

- `EMDListResponse.EMDID.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `EMDListResponse.EMDID.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `EMDListResponse.EMDID.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `EMDListResponse.EMDID.PersonName` (object, required)
  Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

- `EMDListResponse.EMDID.PersonName.@type` (string, required)
  Discriminator classes PersonName or PersonNameDetail
  Example: "PersonNameDetail"

- `EMDListResponse.EMDID.PersonName.Prefix` (string)
  Salutation of honorific (e.g. Mr., Mrs., Ms., Miss, Dr.)
  Example: "Mr"

- `EMDListResponse.EMDID.PersonName.Given` (string)
  Given name, first name or names.
  Example: "John"

- `EMDListResponse.EMDID.PersonName.Middle` (string)
  The middle name of the person name.
  Example: "Erick"

- `EMDListResponse.EMDID.PersonName.Surname` (string, required)
  Family name, last name.
  Example: "Smith"

- `EMDListResponse.EMDID.ReservationLocator` (array)

- `EMDListResponse.EMDID.ReservationLocator.value` (string)
  Example: "WTR45G"

- `EMDListResponse.EMDID.ReservationLocator.supplierCode` (string)
  Supplier Code
  Example: "AA"

- `EMDListResponse.EMDID.ReservationLocator.supplierName` (string)
  Name of the supplier
  Example: "American Airlines"

- `EMDListResponse.EMDID.AgencyInfo` (object, required)
  Detail of the travel agency that issues the ticket

- `EMDListResponse.EMDID.AgencyInfo.ticketedDate` (string)
  Ticketed date
  Example: "2026-04-05"

- `EMDListResponse.EMDID.AgencyInfo.name` (string, required)
  Name of the Agency
  Example: "Alpha travel"

- `EMDListResponse.EMDID.AgencyInfo.place` (string)
  Place of the agency
  Example: "Marietta"

- `EMDListResponse.EMDID.AgencyInfo.ticketingPCC` (string)
  Ticketing PCC
  Example: "1CR"

- `EMDListResponse.EMDID.AgencyInfo.code` (string)
  Agency code
  Example: "12430870"

- `EMDListResponse.EMDID.AgencyInfo.salesType` (string)
  Sales type
  Example: "Ticketing"

- `EMDListResponse.EMDID.AgencyInfo.ticketingCountry` (string, required)
  Ticketing country
  Example: "US"

- `EMDListResponse.EMDID.AgencyInfo.ticketingCity` (string, required)
  Ticketing city
  Example: "NYC"

- `EMDListResponse.EMDID.EMDSegment` (array, required)

- `EMDListResponse.EMDID.EMDSegment.@type` (string, required)
  Example: "EMDSegment"

- `EMDListResponse.EMDID.EMDSegment.sequence` (integer, required)
  Sequence of EMDSegment

- `EMDListResponse.EMDID.EMDSegment.quantity` (integer)
  The quantity of the ancillary available on this EMDSegment

- `EMDListResponse.EMDID.EMDSegment.EMDDescription` (object)
  A description of the ancillary with two description codes

- `EMDListResponse.EMDID.EMDSegment.EMDDescription.value` (string)
  Example: "First checked bag"

- `EMDListResponse.EMDID.EMDSegment.EMDDescription.code` (string)
  A description of the ancillary with two description codes
  Example: "BG"

- `EMDListResponse.EMDID.EMDSegment.EMDDescription.subCode` (string)
  EMD number sub code
  Example: "02C"

- `EMDListResponse.EMDID.EMDSegment.EMDDescription.codeContext` (string)
  Code context
  Example: "ATPCO"

- `EMDListResponse.EMDID.EMDSegment.Amount` (object)
  Amount represents the cost applied

- `EMDListResponse.EMDID.EMDSegment.Amount.@type` (string)

- `EMDListResponse.EMDID.EMDSegment.Amount.currencySource` (string)
  The system requesting or returning the currency code specified in the attribute
  Enum: "Supplier", "Charged", "Requested"

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `EMDListResponse.EMDID.EMDSegment.Amount.Base` (number)
  The base price prior to all applicable taxes or fees of a product, such as the amount for a room or fare for a flight.
  Example: 120.2

- `EMDListResponse.EMDID.EMDSegment.Amount.Taxes` (object)
  Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

- `EMDListResponse.EMDID.EMDSegment.Amount.Taxes.@type` (string, required)
  Discriminator. Child class is TaxesDetail
  Example: "TaxesDetail"

- `EMDListResponse.EMDID.EMDSegment.Amount.Taxes.TotalTaxes` (number)
  A monetary amount, representing the total of all taxes included in this offer. Supports up to 4 decimal places; decimal place must be included.
  Example: 330.1

- `EMDListResponse.EMDID.EMDSegment.Amount.Taxes.TaxInfo` (array)
  Returned for TripChange APIS only.

- `EMDListResponse.EMDID.EMDSegment.Amount.Fees` (object)
  Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

- `EMDListResponse.EMDID.EMDSegment.Amount.Fees.@type` (string, required)
  Discriminator. Child class FeesDetail
  Example: "FeesDetail"

- `EMDListResponse.EMDID.EMDSegment.Amount.Fees.TotalFees` (number)
  Total fees included in the TotalPrice. Supports up to 4 decimal places; decimal place needs to be included.
  Example: 111.11

- `EMDListResponse.EMDID.EMDSegment.Amount.Fees.TotalAdditionalFeesPayableLocally` (number)
  Fees due separately at the property. Expected to be paid in local currency. These fees are not included in the Offer TotalPrice.
  Example: 2.1

- `EMDListResponse.EMDID.EMDSegment.Amount.Total` (number)
  "Specifies the total price including base + taxes + fees.
  In PriceBreakdownHospitality, this total is for a given group of nights.
  In PriceBreakdownAir this is the total for one passenger of this PTC type."
  Example: 230.13

- `EMDListResponse.EMDID.EMDSegment.Amount.approximateInd` (boolean)
  if true this amount has been converted from the original amount
  Example: true

- `EMDListResponse.EMDID.EMDSegment.Status` (string)
  The EMD status.
  Enum: "Open", "Refund", "Used", "Void"

- `EMDListResponse.EMDID.EMDSegment.DateOfService` (string)
  The date of service the service is available for

- `EMDListResponse.EMDID.EMDSegment.PresentTo` (string)
  The airline the EMD should be presented to to supply the service

- `EMDListResponse.EMDID.EMDSegment.PresentAt` (string)
  The location the EMD should be presented to to supply the service

- `EMDListResponse.EMDID.EMDSegment.Routing` (string)
  The routing the service is valid on

- `EMDListResponse.EMDID.TotalAmount` (object)
  Total Amount object

- `EMDListResponse.EMDID.TotalAmount.@type` (string)

- `EMDListResponse.EMDID.TotalAmount.currencySource` (string)
  The system requesting or returning the currency code specified in the attribute
  Enum: "Supplier", "Charged", "Requested"

- `EMDListResponse.EMDID.TotalAmount.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `EMDListResponse.EMDID.TotalAmount.Base` (number)
  The price prior to all applicable taxes of a product such as the rate for a room or fare for a flight.
  Example: 120.2

- `EMDListResponse.EMDID.TotalAmount.Taxes` (object)
  Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

- `EMDListResponse.EMDID.TotalAmount.Fees` (object)
  Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

- `EMDListResponse.EMDID.TotalAmount.Total` (number)
  Specifies the total price including base + taxes + fees
  Example: 30.13

- `EMDListResponse.EMDID.TotalAmount.approximateInd` (boolean)
  True if this amount has been converted from the original amount
  Example: true

- `EMDListResponse.EMDID.FormOfPayment` (object, required)

- `EMDListResponse.EMDID.FormOfPayment.value` (string)
  The list of valid forms of payment.
  Enum: "AgencyAccount", "BSP", "Cash", "Document", "Invoice", "PaymentCard", "WaiverCode"

- `EMDListResponse.EMDID.FormOfPayment.documentNumber` (string)
  Payment document number
  Example: "45"

- `EMDListResponse.EMDID.FormOfPayment.encryptedValue` (string)
  Encrypted value
  Example: "BNASJASJKASKJASHJKASK"

- `EMDListResponse.EMDID.FormOfPayment.documentIssuer` (string)
  Document issuer
  Example: "Alpha travel"

- `EMDListResponse.EMDID.FormOfPayment.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `EMDListResponse.EMDID.ESAC` (string)
  The BSP ESAC code assign for a void or refund transaction\nThe BSP E

- `EMDListResponse.EMDID.AssociatedTicketNumber` (object)
  The ticketNumber that will be used as partial payment for this Offer\/Offering

- `EMDListResponse.EMDID.AssociatedTicketNumber.value` (string)
  Ticket number
  Example: "1156"

- `EMDListResponse.EMDID.AssociatedTicketNumber.ticketIssuer` (string)
  Ticket issuer
  Example: "Cargo airways"

- `EMDListResponse.EMDID.AssociatedTicketNumber.contentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

- `EMDListResponse.EMDID.Restrictions` (array)

- `EMDListResponse.@type` (string)
  Example: "response"

- `EMDListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `EMDListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `EMDListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `EMDListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `EMDListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `EMDListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `EMDListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `EMDListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `EMDListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `EMDListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `EMDListResponse.Result.Error.NameValuePair` (array)

- `EMDListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `EMDListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `EMDListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `EMDListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `EMDListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `EMDListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `EMDListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `EMDListResponse.Result.Warning.NameValuePair` (array)

- `EMDListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `EMDListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `EMDListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `EMDListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `EMDListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `EMDListResponse.NextSteps.NextStep` (array, required)

- `EMDListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `EMDListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `EMDListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `EMDListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `EMDListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `EMDListResponse.ReferenceList` (array)

- `EMDListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `EMDListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `EMDListResponse.CurrencyRateConversion` (array)

- `EMDListResponse.CurrencyRateConversion.@type` (string)

- `EMDListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `EMDListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `EMDListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `EMDListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `EMDListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `EMDListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `EMDListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `EMDListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `EMDListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `EMDListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `EMDListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `EMDListResponse.Pagination.totalItems` (integer, required)
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

# EMD Void

Void an EMD to cancel it. You can also use EMD void with the GDS exchange APIs to refund an EMD back to the original FOP. See the Exchange, Refund, and Void Guide. EMD Void not supported for NDC.

Endpoint: PUT /air/emds/{Identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `Identifier` (string, required)
  The EMD number you wish to update
  Example: "1253303123456"

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
  Example: "EMDQueryUpdateEMD"

- `agencyCode` (string)
  The agency IATA code
  Example: "91219332"

- `status` (string, required)
  Status to update the EMD
  Example: "Void"

- `dateOfIssue` (string)
  The date the EMD was issued

## Response 200 fields (application/json):

- `EMDListResponse` (object)
  The response of a EMD list endpoint request.

- `EMDListResponse.EMDID` (array)

- `EMDListResponse.EMDID.@type` (string, required)
  Discriminator classes EMDID, EMD or EMDSummary
  Example: "EMD"

- `EMDListResponse.EMDID.id` (string)
  EMD reference ID.

- `EMDListResponse.EMDID.EMDRef` (string)

- `EMDListResponse.EMDID.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `EMDListResponse.EMDID.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `EMDListResponse.EMDID.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `EMDListResponse.EMDID.PersonName` (object, required)
  Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

- `EMDListResponse.EMDID.PersonName.@type` (string, required)
  Discriminator classes PersonName or PersonNameDetail
  Example: "PersonNameDetail"

- `EMDListResponse.EMDID.PersonName.Prefix` (string)
  Salutation of honorific (e.g. Mr., Mrs., Ms., Miss, Dr.)
  Example: "Mr"

- `EMDListResponse.EMDID.PersonName.Given` (string)
  Given name, first name or names.
  Example: "John"

- `EMDListResponse.EMDID.PersonName.Middle` (string)
  The middle name of the person name.
  Example: "Erick"

- `EMDListResponse.EMDID.PersonName.Surname` (string, required)
  Family name, last name.
  Example: "Smith"

- `EMDListResponse.EMDID.ReservationLocator` (array)

- `EMDListResponse.EMDID.ReservationLocator.value` (string)
  Example: "WTR45G"

- `EMDListResponse.EMDID.ReservationLocator.supplierCode` (string)
  Supplier Code
  Example: "AA"

- `EMDListResponse.EMDID.ReservationLocator.supplierName` (string)
  Name of the supplier
  Example: "American Airlines"

- `EMDListResponse.EMDID.AgencyInfo` (object, required)
  Detail of the travel agency that issues the ticket

- `EMDListResponse.EMDID.AgencyInfo.ticketedDate` (string)
  Ticketed date
  Example: "2026-04-05"

- `EMDListResponse.EMDID.AgencyInfo.name` (string, required)
  Name of the Agency
  Example: "Alpha travel"

- `EMDListResponse.EMDID.AgencyInfo.place` (string)
  Place of the agency
  Example: "Marietta"

- `EMDListResponse.EMDID.AgencyInfo.ticketingPCC` (string)
  Ticketing PCC
  Example: "1CR"

- `EMDListResponse.EMDID.AgencyInfo.code` (string)
  Agency code
  Example: "12430870"

- `EMDListResponse.EMDID.AgencyInfo.salesType` (string)
  Sales type
  Example: "Ticketing"

- `EMDListResponse.EMDID.AgencyInfo.ticketingCountry` (string, required)
  Ticketing country
  Example: "US"

- `EMDListResponse.EMDID.AgencyInfo.ticketingCity` (string, required)
  Ticketing city
  Example: "NYC"

- `EMDListResponse.EMDID.EMDSegment` (array, required)

- `EMDListResponse.EMDID.EMDSegment.@type` (string, required)
  Example: "EMDSegment"

- `EMDListResponse.EMDID.EMDSegment.sequence` (integer, required)
  Sequence of EMDSegment

- `EMDListResponse.EMDID.EMDSegment.quantity` (integer)
  The quantity of the ancillary available on this EMDSegment

- `EMDListResponse.EMDID.EMDSegment.EMDDescription` (object)
  A description of the ancillary with two description codes

- `EMDListResponse.EMDID.EMDSegment.EMDDescription.value` (string)
  Example: "First checked bag"

- `EMDListResponse.EMDID.EMDSegment.EMDDescription.code` (string)
  A description of the ancillary with two description codes
  Example: "BG"

- `EMDListResponse.EMDID.EMDSegment.EMDDescription.subCode` (string)
  EMD number sub code
  Example: "02C"

- `EMDListResponse.EMDID.EMDSegment.EMDDescription.codeContext` (string)
  Code context
  Example: "ATPCO"

- `EMDListResponse.EMDID.EMDSegment.Amount` (object)
  Amount represents the cost applied

- `EMDListResponse.EMDID.EMDSegment.Amount.@type` (string)

- `EMDListResponse.EMDID.EMDSegment.Amount.currencySource` (string)
  The system requesting or returning the currency code specified in the attribute
  Enum: "Supplier", "Charged", "Requested"

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `EMDListResponse.EMDID.EMDSegment.Amount.CurrencyCode.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `EMDListResponse.EMDID.EMDSegment.Amount.Base` (number)
  The base price prior to all applicable taxes or fees of a product, such as the amount for a room or fare for a flight.
  Example: 120.2

- `EMDListResponse.EMDID.EMDSegment.Amount.Taxes` (object)
  Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

- `EMDListResponse.EMDID.EMDSegment.Amount.Taxes.@type` (string, required)
  Discriminator. Child class is TaxesDetail
  Example: "TaxesDetail"

- `EMDListResponse.EMDID.EMDSegment.Amount.Taxes.TotalTaxes` (number)
  A monetary amount, representing the total of all taxes included in this offer. Supports up to 4 decimal places; decimal place must be included.
  Example: 330.1

- `EMDListResponse.EMDID.EMDSegment.Amount.Taxes.TaxInfo` (array)
  Returned for TripChange APIS only.

- `EMDListResponse.EMDID.EMDSegment.Amount.Fees` (object)
  Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

- `EMDListResponse.EMDID.EMDSegment.Amount.Fees.@type` (string, required)
  Discriminator. Child class FeesDetail
  Example: "FeesDetail"

- `EMDListResponse.EMDID.EMDSegment.Amount.Fees.TotalFees` (number)
  Total fees included in the TotalPrice. Supports up to 4 decimal places; decimal place needs to be included.
  Example: 111.11

- `EMDListResponse.EMDID.EMDSegment.Amount.Fees.TotalAdditionalFeesPayableLocally` (number)
  Fees due separately at the property. Expected to be paid in local currency. These fees are not included in the Offer TotalPrice.
  Example: 2.1

- `EMDListResponse.EMDID.EMDSegment.Amount.Total` (number)
  "Specifies the total price including base + taxes + fees.
  In PriceBreakdownHospitality, this total is for a given group of nights.
  In PriceBreakdownAir this is the total for one passenger of this PTC type."
  Example: 230.13

- `EMDListResponse.EMDID.EMDSegment.Amount.approximateInd` (boolean)
  if true this amount has been converted from the original amount
  Example: true

- `EMDListResponse.EMDID.EMDSegment.Status` (string)
  The EMD status.
  Enum: "Open", "Refund", "Used", "Void"

- `EMDListResponse.EMDID.EMDSegment.DateOfService` (string)
  The date of service the service is available for

- `EMDListResponse.EMDID.EMDSegment.PresentTo` (string)
  The airline the EMD should be presented to to supply the service

- `EMDListResponse.EMDID.EMDSegment.PresentAt` (string)
  The location the EMD should be presented to to supply the service

- `EMDListResponse.EMDID.EMDSegment.Routing` (string)
  The routing the service is valid on

- `EMDListResponse.EMDID.TotalAmount` (object)
  Total Amount object

- `EMDListResponse.EMDID.TotalAmount.@type` (string)

- `EMDListResponse.EMDID.TotalAmount.currencySource` (string)
  The system requesting or returning the currency code specified in the attribute
  Enum: "Supplier", "Charged", "Requested"

- `EMDListResponse.EMDID.TotalAmount.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `EMDListResponse.EMDID.TotalAmount.Base` (number)
  The price prior to all applicable taxes of a product such as the rate for a room or fare for a flight.
  Example: 120.2

- `EMDListResponse.EMDID.TotalAmount.Taxes` (object)
  Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

- `EMDListResponse.EMDID.TotalAmount.Fees` (object)
  Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

- `EMDListResponse.EMDID.TotalAmount.Total` (number)
  Specifies the total price including base + taxes + fees
  Example: 30.13

- `EMDListResponse.EMDID.TotalAmount.approximateInd` (boolean)
  True if this amount has been converted from the original amount
  Example: true

- `EMDListResponse.EMDID.FormOfPayment` (object, required)

- `EMDListResponse.EMDID.FormOfPayment.value` (string)
  The list of valid forms of payment.
  Enum: "AgencyAccount", "BSP", "Cash", "Document", "Invoice", "PaymentCard", "WaiverCode"

- `EMDListResponse.EMDID.FormOfPayment.documentNumber` (string)
  Payment document number
  Example: "45"

- `EMDListResponse.EMDID.FormOfPayment.encryptedValue` (string)
  Encrypted value
  Example: "BNASJASJKASKJASHJKASK"

- `EMDListResponse.EMDID.FormOfPayment.documentIssuer` (string)
  Document issuer
  Example: "Alpha travel"

- `EMDListResponse.EMDID.FormOfPayment.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `EMDListResponse.EMDID.ESAC` (string)
  The BSP ESAC code assign for a void or refund transaction\nThe BSP E

- `EMDListResponse.EMDID.AssociatedTicketNumber` (object)
  The ticketNumber that will be used as partial payment for this Offer\/Offering

- `EMDListResponse.EMDID.AssociatedTicketNumber.value` (string)
  Ticket number
  Example: "1156"

- `EMDListResponse.EMDID.AssociatedTicketNumber.ticketIssuer` (string)
  Ticket issuer
  Example: "Cargo airways"

- `EMDListResponse.EMDID.AssociatedTicketNumber.contentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

- `EMDListResponse.EMDID.Restrictions` (array)

- `EMDListResponse.@type` (string)
  Example: "response"

- `EMDListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `EMDListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `EMDListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `EMDListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `EMDListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `EMDListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `EMDListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `EMDListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `EMDListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `EMDListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `EMDListResponse.Result.Error.NameValuePair` (array)

- `EMDListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `EMDListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `EMDListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `EMDListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `EMDListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `EMDListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `EMDListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `EMDListResponse.Result.Warning.NameValuePair` (array)

- `EMDListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `EMDListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `EMDListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `EMDListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `EMDListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `EMDListResponse.NextSteps.NextStep` (array, required)

- `EMDListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `EMDListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `EMDListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `EMDListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `EMDListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `EMDListResponse.ReferenceList` (array)

- `EMDListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `EMDListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `EMDListResponse.CurrencyRateConversion` (array)

- `EMDListResponse.CurrencyRateConversion.@type` (string)

- `EMDListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `EMDListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `EMDListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `EMDListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `EMDListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `EMDListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `EMDListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `EMDListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `EMDListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `EMDListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `EMDListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `EMDListResponse.Pagination.totalItems` (integer, required)
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

# Workbench Actions

Create, manage, and commit workbench sessions.

## New workbench

- [POST /air/book/session/reservationworkbench](https://developer.travelport.com/apis/flights/workbench-actions/createreservationworkbench.md): Use this request to initiate a workbench for a new reservation. This prerequisite step for booking creates the workbench session in which all booking details are added together to create a PNR at commit.

## Post commit workbench

- [POST /air/book/session/reservationworkbench/buildfromlocator](https://developer.travelport.com/apis/flights/workbench-actions/createreservationworkbenchfromlocator.md): Initiate a post-commit workbench to create a session for ticketing or updating an existing reservation. This is a prerequisite step for any transaction that modifies, updates, or tickets any PNR.

## Cancel workbench items

- [POST /book/reservationworkbench/{ReservationResource_Identifier}/reservations/cancelitems](https://developer.travelport.com/apis/flights/workbench-actions/cancelworkbenchitems.md): Cancel one or more offers or unpriced segments within the workbench. Offer types including air, hotel, vehicle. Ancillaries associated to air segments will by default cancel when the air segment is cancelled. Some restrictions on NDC and non-GDS hotel content apply.

## Retrieve workbench.

- [GET /air/book/session/reservationworkbench/{Identifier}](https://developer.travelport.com/apis/flights/workbench-actions/retrievereservationworkbench.md): At any point in the booking session, you can retrieve the workbench. The response returns all details added to the workbench at that point.

## Discard workbench

- [DELETE /air/book/session/reservationworkbench/{Identifier}](https://developer.travelport.com/apis/flights/workbench-actions/ignorereservationworkbench.md): At any point in a booking or ticketing workflow, if necessary, you can discard the workbench and any information in it.

## Workbench commit

- [POST /air/book/reservation/reservations/{Identifier}](https://developer.travelport.com/apis/flights/workbench-actions/commitreservation.md): After all required and any optional steps in a booking workbench session, send a POST request with the workbench identifier to commit the workbench. The resulting actions depend on whether payment is present in the workbench. If no Add Payment request has been sent, committing the workbench books the itinerary and generates a PNR. If an Add Payment request has not been sent, committing the workbench tickets the itinerary and generates ticket number/s.

## Post commit workbench

- [POST /air/book/session/reservationworkbench/buildfromlocator](https://developer.travelport.com/apis/flights/ticketing/createreservationworkbenchfromlocator.md): Initiate a post-commit workbench to create a session for ticketing or updating an existing reservation. This is a prerequisite step for any transaction that modifies, updates, or tickets any PNR.

## Workbench commit

- [POST /air/book/reservation/reservations/{Identifier}](https://developer.travelport.com/apis/flights/ticketing/commitreservation.md): After all required and any optional steps in a booking workbench session, send a POST request with the workbench identifier to commit the workbench. The resulting actions depend on whether payment is present in the workbench. If no Add Payment request has been sent, committing the workbench books the itinerary and generates a PNR. If an Add Payment request has not been sent, committing the workbench tickets the itinerary and generates ticket number/s.
