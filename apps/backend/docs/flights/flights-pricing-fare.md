# Pricing and Fare Rules

Air pricing, fare rules, and fare display.

## AirPrice reference payload

- [POST /air/price/offers/buildfromcatalogproductofferings](https://developer.travelport.com/apis/flights/pricing-and-fare-rules/offerbuildfromcatalogproductofferings.md): The AirPrice API confirms pricing on air search results. While air pricing is generally an optional but recommended step, it is required for low cost carriers and some NDC carriers. This API uses a reference payload request, which sends identifiers from the Search API response. To use the AirPrice reference payload request, your initial Search request must send offersPerPage to invoke caching if that Search was journey-based (leg-based search results are always cached).

## AirPrice full payload

- [POST /air/price/offers/buildfromproducts](https://developer.travelport.com/apis/flights/pricing-and-fare-rules/offerbuildfromproducts.md): The AirPrice API confirms pricing on air search results. While air pricing is generally an optional but recommended step, it is required for low cost carriers and some NDC carriers.

## Fare rules for existing reservation (after booking)

- [GET /air/farerule/farerules/fromreservation](https://developer.travelport.com/apis/flights/pricing-and-fare-rules/getrulesfromreservation.md): Fare rules are the conditions and restrictions that apply to any booking based on its fare type. These determine the price of the fare. Generally, less expensive fares have more restrictions and more expensive fares have fewer restrictions. Fare rules can include blackout dates, advanced reservation requirements, minimum and maximum stay requirements, and cancellation and change penalties.

## Fare rules after AirPrice

- [GET /air/farerule/farerules/fromoffer](https://developer.travelport.com/apis/flights/pricing-and-fare-rules/getrulesfromoffer.md): Fare rules are the conditions and restrictions that apply to any booking based on its fare type. These determine the price of the fare. Generally, less expensive fares have more restrictions and more expensive fares have fewer restrictions. Fare rules can include blackout dates, advanced reservation requirements, minimum and maximum stay requirements, and cancellation and change penalties.

## Fare rules after AirSearch

- [GET /air/farerule/farerules/fromcatalogproductofferings](https://developer.travelport.com/apis/flights/pricing-and-fare-rules/getrulesfromcatalogproductofferings.md): Fare rules are the conditions and restrictions that apply to any booking based on its fare type. These determine the price of the fare. Generally, less expensive fares have more restrictions and more expensive fares have fewer restrictions. Fare rules can include blackout dates, advanced reservation requirements, minimum and maximum stay requirements, and cancellation and change penalties.

## Fare rules after Fare Display

- [GET /air/farerule/farerules/fromfaredisplay](https://developer.travelport.com/apis/flights/pricing-and-fare-rules/getfromfaredisplay.md): Fare rules are the conditions and restrictions that apply to any booking based on its fare type. These determine the price of the fare. Generally, less expensive fares have more restrictions and more expensive fares have fewer restrictions. Fare rules can include blackout dates, advanced reservation requirements, minimum and maximum stay requirements, and cancellation and change penalties.

# AirPrice reference payload

The AirPrice API confirms pricing on air search results. While air pricing is generally an optional but recommended step, it is required for low cost carriers and some NDC carriers. This API uses a reference payload request, which sends identifiers from the Search API response. To use the AirPrice reference payload request, your initial Search request must send offersPerPage to invoke caching if that Search was journey-based (leg-based search results are always cached).

Endpoint: POST /air/price/offers/buildfromcatalogproductofferings
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
  Discriminator. No child classes
  Example: "OfferQueryBuildFromCatalogProductOfferings"

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

- `BuildFromCatalogProductOfferingsRequest` (object)
  Used to reference Air Search requests, such as for a Next Leg, reference-payload Price and Add Offer, or other reference-based calls. Defines the identifiers and selections needed to continue a workflow from a preceding Search response, including the cached search result id and the chosen offer and product to carry forward into the next request.

- `BuildFromCatalogProductOfferingsRequest.@type` (string, required)
  Discriminator. Child classes BuildFromCatalogProductOfferingsRequestAir, BuildFromCatalogProductOfferingsRequestAirSearch, and BuildFromCatalogProductOfferingsRequestAirChange
  Example: "BuildFromCatalogProductOfferingsRequestAir"

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingsIdentifier` (object, required)
  Used to identify a cached Air Search result for subsequent reference-payload requests. Defines the transaction identifier returned from Search that is sent in later steps (such as Next Leg Search and other workflows) to reference a prior search response.

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingsIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "cpo_1"

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingsIdentifier.Identifier` (object)
  The Search response does not return the CatalogProductOfferings/Identifier object if caching is not invoked with offersPerPage in the Search request. A subsequent reference payload request to those search results cannot be sent without caching and the CatalogProductOfferings/Identifier value.

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingsIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingsIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection` (array, required)

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.@type` (string)
  Discriminator. No child classes.
  Example: "CatalogProductOfferingSelection"

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.CatalogProductOfferingIdentifier` (object, required)
  Identifier class

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.CatalogProductOfferingIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "cpo_1"

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.CatalogProductOfferingIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.CatalogProductOfferingIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.CatalogProductOfferingIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.CatalogProductOfferingIdentifier.CatalogProductOfferingRef` (string)
  Not used. Allows referencing another instance of this object in the same message.
  Example: "cpo_1"

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.ProductBrandOfferingIdentifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.ProductIdentifier` (array, required)

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.ProductIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "product_1"

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.ProductIdentifier.productRef` (string)
  Used to reference another instance of this object in the same payload.
  Example: "product_1"

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.ProductIdentifier.Identifier` (object)
  In next leg search Value from CatalogProductOffering/ProductBrandOptions/ProductBrandOffering/Product/productRef in the Search response for the product to select for the first leg of the itinerary. When sending a second Next Leg Search request in a multi-city search, this value should be the offer for the second leg of the itinerary, and so on for additional O&D pairs.

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.ProductIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.ProductIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `BuildFromCatalogProductOfferingsRequest.CatalogProductOfferingSelection.SegmentSequence` (array)
  Example: [1,2]

- `BuildFromCatalogProductOfferingsRequest.UpsellOfferingIdentifier` (array)
  Will not implement.

- `BuildFromCatalogProductOfferingsRequest.UpsellOfferingIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "UpsellOffering"

- `BuildFromCatalogProductOfferingsRequest.UpsellOfferingIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BuildFromCatalogProductOfferingsRequest.UpsellOfferingIdentifier.CatalogProductOfferingRef` (string)
  Used to reference another instance of this object in the same message

- `MaxNumberOfUpsellsToReturn` (integer)
  NDC only; not supported for GDS. Supports values from 0 to 99 inclusive. Send to request upsell offers along with pricing for the requested class of service or cabin, returned in ascending price order. An upsell is the next highest fare in a different brand or cabin than requested. Upsells are returned as follows: If upsells not requested: Only the requested offer is returned. If one upsell requested: The lowest priced offer in the requested class of service or cabin plus one upsell offer are returned. If two or more upsells requested: The lowest priced offer in the requested class of service or cabin plus the requested number of upsell offers are returned.
  Example: 4

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

# AirPrice full payload

The AirPrice API confirms pricing on air search results. While air pricing is generally an optional but recommended step, it is required for low cost carriers and some NDC carriers.

Endpoint: POST /air/price/offers/buildfromproducts
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
  Discriminator. No child classes
  Example: "OfferQueryBuildFromProducts"

- `BuildFromProductsRequest` (object)
  Full payload itinerary request used in multiple work flows. Flight Specific Search, Full payload Price, Full payload Book. GDS only. Not supported for NDC

- `BuildFromProductsRequest.@type` (string, required)
  Discriminator. Child classes BuildFromProductsRequestAir (Next leg search and Price APIs), BuildFromProductsRequestAirSearch, and BuildFromProductsRequestAirChange (TripChange API)
  Example: "BuildFromProductsRequestAir"

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
  Not recommended to use. Invoke fare rule end points directly.
  Enum: "AdvanceReservationsTicketing", "MinimumStay", "MaximumStay", "Stopovers", "Penalties", "Eligibility", "DayTime", "Seasonality", "FlightApplication", "Transfers", "Combinations", "BlackoutDates", "Surcharges", "AccompaniedTravel", "TravelRestrictions", "SalesRestrictions", "HIPMileageExeptions", "TicketEndorsements", "ChildrenDiscounts", "TourConductorDiscounts", "AgentDiscounts", "AllOtherDiscounts", "MiscellaneousProvisions", "FareByRule", "Groups", "Tours", "VisitAnotherCountry", "Deposits", "VoluntaryChanges", "VoluntaryRefunds", "NegotiatedFares", "ApplicationAndOtherConditions"

- `lowFareFinderInd` (boolean)
  Provides pricing flexibility around class of service. If not sent, the response returns fares only in the requested class of service. If true, returns the lowest fares available in any class of service available, which may not be the same as the requested class. Note that if lowFareFinderInd is sent with true and CabinPreference is sent, the only supported value for CabinPreference/type is Permitted. When lowFareFindInd=true and brand attributes are not disabled (inhibitBrandContentInd), AirPrice uses only the brand tier (and any other pricing modifiers) to find the lowest fare within a brand tier regardless of class of service. GDS only; not supported for NDC.
  Example: true

- `returnBrandedFaresInd` (boolean)
  Use to request the return of branded fares, which by default are not returned for the AirPrice Full Payload request. See Branded Fares and Attributes in the Air Pricing Guide. If true, returns branded fares. For Air Price this is supported only in the full payload request.
  Example: true

- `reCheckInventoryInd` (boolean)
  If true, verifies availability for the requested number of passengers in a specific class of service at the time of the price request by booking and releasing seats. Because this indicator temporarily affects seat availability, the recommended best practice is to use validateInventoryInd instead. Some airlines monitor for high volumes of sell/ignore transactions. Regardless of pricing results, air fares and inventory are only guaranteed by airlines when ticketed and paid. Can help reduce sell failures at booking by alerting of insufficient availability. If any or all segments are not bookable, AirPrice does not return any offers and returns an error message. GDS only, not supported for NDC (NDC carriers always validate inventory at pricing).
  Example: true

- `validateInventoryInd` (boolean)
  Sets whether to validate inventory in the requested class of service. If true, checks for availability for the requested number of passengers in the requested class of service at the time of the price request. If there are fewer seats than requested passengers available in that class of service, AirPrice does not return any offers and instead returns an error message that the booking class or preference is not available. This reduces failures at the Add Offer and Workbench Commit steps. GDS only; not supported for NDC, as NDC carriers already validate inventory at pricing.
  Example: true

- `MaxNumberOfUpsellsToReturn` (integer)
  NDC only; not supported for GDS. Supports values from 0 to 99 inclusive. Send to request upsell offers along with pricing for the requested class of service or cabin, returned in ascending price order. An upsell is the next highest fare in a different brand or cabin than requested. Upsells are returned as follows: Upsells not requested: Only the requested offer is returned. One upsell requested: The lowest priced offer in the requested class of service or cabin plus one upsell offer are returned. Two upsells requested (and so on for x upsells requested): The lowest priced offer in the requested class of service or cabin plus two upsell offers are returned.
  Example: 4

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

- `OfferListResponse.OfferID.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `OfferListResponse.OfferID.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

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

# Fare rules for existing reservation (after booking)

Fare rules are the conditions and restrictions that apply to any booking based on its fare type. These determine the price of the fare. Generally, less expensive fares have more restrictions and more expensive fares have fewer restrictions. Fare rules can include blackout dates, advanced reservation requirements, minimum and maximum stay requirements, and cancellation and change penalties.

Endpoint: GET /air/farerule/farerules/fromreservation
Version: 11.33.0
Security: bearerAuth

## Query parameters:

- `reservationIdentifier` (string, required)
  Reservation locator code.
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `offerIDs` (array, required)
  The specific offer ID/s you wish to view fare rules for
  Example: ["[\"offer_1\"]"]

- `productIDs` (array)
  The specific product ID/s you wish to view fare rules for
  Example: ["[\"product_1\"]"]

- `flightIDs` (array)
  The specific flight ID/s you wish to view fare
  Example: ["[\"flight_1\"]"]

- `fareRuleCategories` (array)
  Send only if requesting structured fare rules. If fareRuleType=Structured and fareRuleCategories is not sent, all structured fare rules are returned. Supported values: AdvanceReservationTicketing (GDS only), MinimumStay (GDS only), MaximumStay (GDS only), Stopovers (GDS only), Penalties.
  Example: ["[\"Penalties\"]"]

- `fareRuleType` (string, required)
  The type of fare rules requested. Supported values: ShortText, LongText (GDS only), Structured. (For NDC, structured fare rules are supported only for Penalties. A warning message returned if no penalties are applicable to the fare).
  Example: "Structured"

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

- `FareRuleListResponse` (object)
  The response of a Fare rule list endpoint request.

- `FareRuleListResponse.@type` (string)
  Example: "FareRuleListResponse"

- `FareRuleListResponse.FareRule` (array)

- `FareRuleListResponse.FareRule.@type` (string, required)
  Discriminator.
  Example: "FareRuleText"

- `FareRuleListResponse.FareRule.id` (string)

- `FareRuleListResponse.FareRule.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FareRuleListResponse.FareRule.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `FareRuleListResponse.FareRule.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `FareRuleListResponse.FareRule.Flight` (array, required)

- `FareRuleListResponse.FareRule.Flight.@type` (string, required)
  Discriminator. Child classes Flight and FlightDetail.
  Example: "FlightDetail"

- `FareRuleListResponse.FareRule.Flight.id` (string)
  Local id within a given message to support referencing this object.
  Example: "126"

- `FareRuleListResponse.FareRule.Flight.FlightRef` (string)
  Reference id that corresponds to the flight 'id' in ReferenceListFlight.Flight.
  Example: "s1"

- `FareRuleListResponse.FareRule.Flight.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FareRuleListResponse.FareRule.ruleNumber` (string)
  The rule number of fare rule
  Example: "34"

- `FareRuleListResponse.FareRule.tariffNumber` (string)
  Fare rule tarrif number
  Example: "56"

- `FareRuleListResponse.transactionId` (string)
  Unique transaction, correlation or tracking id for a single request and reply i.e. for a single transaction. Should be a 128 bit GUID format. Also know as E2ETrackingId.
  Example: "6570ed7b-89fe-4334-9c78-af282a977ba6"

- `FareRuleListResponse.traceId` (string)
  Optional ID for internal child transactions created for processing a single request (single transaction). Should be a 128 bit GUID format. Also known as ChildTrackingId.
  Example: "c009a53c-48f6-4084-b7b6-3043fa9fec67"

- `FareRuleListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `FareRuleListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `FareRuleListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `FareRuleListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `FareRuleListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `FareRuleListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `FareRuleListResponse.Result.Error.NameValuePair` (array)

- `FareRuleListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `FareRuleListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `FareRuleListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `FareRuleListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `FareRuleListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `FareRuleListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `FareRuleListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `FareRuleListResponse.Result.Warning.NameValuePair` (array)

- `FareRuleListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `FareRuleListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FareRuleListResponse.ReferenceList` (array)

- `FareRuleListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `FareRuleListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

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

- `ErrorResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `ErrorResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `ErrorResponse.NextSteps.NextStep` (array, required)

- `ErrorResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `ErrorResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `ErrorResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `ErrorResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `ErrorResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ErrorResponse.ReferenceList` (array)

- `ErrorResponse.CurrencyRateConversion` (array)

- `ErrorResponse.CurrencyRateConversion.@type` (string)

- `ErrorResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `ErrorResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `ErrorResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `ErrorResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `ErrorResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `ErrorResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `ErrorResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `ErrorResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `ErrorResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `ErrorResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `ErrorResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `ErrorResponse.Pagination.totalItems` (integer, required)
  The total number of pages in this result set
  Example: 100

# Fare rules after AirPrice

Fare rules are the conditions and restrictions that apply to any booking based on its fare type. These determine the price of the fare. Generally, less expensive fares have more restrictions and more expensive fares have fewer restrictions. Fare rules can include blackout dates, advanced reservation requirements, minimum and maximum stay requirements, and cancellation and change penalties.

Endpoint: GET /air/farerule/farerules/fromoffer
Version: 11.33.0
Security: bearerAuth

## Query parameters:

- `offerIdentifier` (string, required)
  Identifier value from AirPrice response for the offer to return fare rules for.
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `productIDs` (array)
  Value from AirPrice response for the product to return fare rules for, if fare rules are desired for only one product (aka leg).
  Example: ["[\"product_1\"]"]

- `fareRuleCategories` (array)
  Send only if requesting structured fare rules. If fareRuleType=Structured and fareRuleCategories is not sent, all structured fare rules are returned. Supported values: AdvanceReservationTicketing (GDS only), MinimumStay (GDS only), MaximumStay (GDS only), Stopovers (GDS only), Penalties.
  Example: ["[\"Penalties\"]"]

- `fareRuleType` (string, required)
  The type of fare rules requested. Supported values: ShortText, LongText (GDS only), Structured. (For NDC, structured fare rules are supported only for Penalties. A warning message returned if no penalties are applicable to the fare).
  Example: "Structured"

- `flightIDs` (array)
  Not required. Use productIDs
  Example: ["[\"flight_1\"]"]

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

- `FareRuleListResponse` (object)
  The response of a Fare rule list endpoint request.

- `FareRuleListResponse.@type` (string)
  Example: "FareRuleListResponse"

- `FareRuleListResponse.FareRule` (array)

- `FareRuleListResponse.FareRule.@type` (string, required)
  Discriminator.
  Example: "FareRuleText"

- `FareRuleListResponse.FareRule.id` (string)

- `FareRuleListResponse.FareRule.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FareRuleListResponse.FareRule.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `FareRuleListResponse.FareRule.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `FareRuleListResponse.FareRule.Flight` (array, required)

- `FareRuleListResponse.FareRule.Flight.@type` (string, required)
  Discriminator. Child classes Flight and FlightDetail.
  Example: "FlightDetail"

- `FareRuleListResponse.FareRule.Flight.id` (string)
  Local id within a given message to support referencing this object.
  Example: "126"

- `FareRuleListResponse.FareRule.Flight.FlightRef` (string)
  Reference id that corresponds to the flight 'id' in ReferenceListFlight.Flight.
  Example: "s1"

- `FareRuleListResponse.FareRule.Flight.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FareRuleListResponse.FareRule.ruleNumber` (string)
  The rule number of fare rule
  Example: "34"

- `FareRuleListResponse.FareRule.tariffNumber` (string)
  Fare rule tarrif number
  Example: "56"

- `FareRuleListResponse.transactionId` (string)
  Unique transaction, correlation or tracking id for a single request and reply i.e. for a single transaction. Should be a 128 bit GUID format. Also know as E2ETrackingId.
  Example: "6570ed7b-89fe-4334-9c78-af282a977ba6"

- `FareRuleListResponse.traceId` (string)
  Optional ID for internal child transactions created for processing a single request (single transaction). Should be a 128 bit GUID format. Also known as ChildTrackingId.
  Example: "c009a53c-48f6-4084-b7b6-3043fa9fec67"

- `FareRuleListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `FareRuleListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `FareRuleListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `FareRuleListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `FareRuleListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `FareRuleListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `FareRuleListResponse.Result.Error.NameValuePair` (array)

- `FareRuleListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `FareRuleListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `FareRuleListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `FareRuleListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `FareRuleListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `FareRuleListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `FareRuleListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `FareRuleListResponse.Result.Warning.NameValuePair` (array)

- `FareRuleListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `FareRuleListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FareRuleListResponse.ReferenceList` (array)

- `FareRuleListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `FareRuleListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

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

- `ErrorResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `ErrorResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `ErrorResponse.NextSteps.NextStep` (array, required)

- `ErrorResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `ErrorResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `ErrorResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `ErrorResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `ErrorResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ErrorResponse.ReferenceList` (array)

- `ErrorResponse.CurrencyRateConversion` (array)

- `ErrorResponse.CurrencyRateConversion.@type` (string)

- `ErrorResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `ErrorResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `ErrorResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `ErrorResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `ErrorResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `ErrorResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `ErrorResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `ErrorResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `ErrorResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `ErrorResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `ErrorResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `ErrorResponse.Pagination.totalItems` (integer, required)
  The total number of pages in this result set
  Example: 100

# Fare rules after AirSearch

Fare rules are the conditions and restrictions that apply to any booking based on its fare type. These determine the price of the fare. Generally, less expensive fares have more restrictions and more expensive fares have fewer restrictions. Fare rules can include blackout dates, advanced reservation requirements, minimum and maximum stay requirements, and cancellation and change penalties.

Endpoint: GET /air/farerule/farerules/fromcatalogproductofferings
Version: 11.33.0
Security: bearerAuth

## Query parameters:

- `catalogProductOfferingsIdentifier` (string, required)
  Identifier value from Search response in CatalogProductOfferings.Identifier.value
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `catalogProductOfferingID` (string, required)
  Value from Search response in CatalogProductOffering.id for the offering to return fare rules for.
  Example: "cpo_01234"

- `productIDs` (array)
  Value from Search response in CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Product.productRef for the product to return fare rules for. Fare rules can be requested for one and only one product per request, using the productIDs query parameter. Multiple product IDs are not supported when requested after Search.
  Example: ["[\"product_1\"]"]

- `fareRuleCategories` (array)
  Send only if requesting structured fare rules. If fareRuleType=Structured and fareRuleCategories is not sent, all structured fare rules are returned. Supported values: AdvanceReservationTicketing (GDS only), MinimumStay (GDS only), MaximumStay (GDS only), Stopovers (GDS only), Penalties.
  Example: ["[\"Penalties\"]"]

- `fareRuleType` (string, required)
  The type of fare rules requested. Supported values: ShortText, LongText (GDS only), Structured. (For NDC, structured fare rules are supported only for Penalties. A warning message returned if no penalties are applicable to the fare).
  Example: "Structured"

- `productBrandOfferingIDs` (array)
  Not required. Use product id
  Example: ["49f58f5f-c443-43b4-9f5d-be405fd00a01"]

- `flightIDs` (array)
  Not required. Use productIDs
  Example: ["[\"flight_1\"]"]

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

- `FareRuleListResponse` (object)
  The response of a Fare rule list endpoint request.

- `FareRuleListResponse.@type` (string)
  Example: "FareRuleListResponse"

- `FareRuleListResponse.FareRule` (array)

- `FareRuleListResponse.FareRule.@type` (string, required)
  Discriminator.
  Example: "FareRuleText"

- `FareRuleListResponse.FareRule.id` (string)

- `FareRuleListResponse.FareRule.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FareRuleListResponse.FareRule.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `FareRuleListResponse.FareRule.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `FareRuleListResponse.FareRule.Flight` (array, required)

- `FareRuleListResponse.FareRule.Flight.@type` (string, required)
  Discriminator. Child classes Flight and FlightDetail.
  Example: "FlightDetail"

- `FareRuleListResponse.FareRule.Flight.id` (string)
  Local id within a given message to support referencing this object.
  Example: "126"

- `FareRuleListResponse.FareRule.Flight.FlightRef` (string)
  Reference id that corresponds to the flight 'id' in ReferenceListFlight.Flight.
  Example: "s1"

- `FareRuleListResponse.FareRule.Flight.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FareRuleListResponse.FareRule.ruleNumber` (string)
  The rule number of fare rule
  Example: "34"

- `FareRuleListResponse.FareRule.tariffNumber` (string)
  Fare rule tarrif number
  Example: "56"

- `FareRuleListResponse.transactionId` (string)
  Unique transaction, correlation or tracking id for a single request and reply i.e. for a single transaction. Should be a 128 bit GUID format. Also know as E2ETrackingId.
  Example: "6570ed7b-89fe-4334-9c78-af282a977ba6"

- `FareRuleListResponse.traceId` (string)
  Optional ID for internal child transactions created for processing a single request (single transaction). Should be a 128 bit GUID format. Also known as ChildTrackingId.
  Example: "c009a53c-48f6-4084-b7b6-3043fa9fec67"

- `FareRuleListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `FareRuleListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `FareRuleListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `FareRuleListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `FareRuleListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `FareRuleListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `FareRuleListResponse.Result.Error.NameValuePair` (array)

- `FareRuleListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `FareRuleListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `FareRuleListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `FareRuleListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `FareRuleListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `FareRuleListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `FareRuleListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `FareRuleListResponse.Result.Warning.NameValuePair` (array)

- `FareRuleListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `FareRuleListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FareRuleListResponse.ReferenceList` (array)

- `FareRuleListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `FareRuleListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

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

- `ErrorResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `ErrorResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `ErrorResponse.NextSteps.NextStep` (array, required)

- `ErrorResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `ErrorResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `ErrorResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `ErrorResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `ErrorResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ErrorResponse.ReferenceList` (array)

- `ErrorResponse.CurrencyRateConversion` (array)

- `ErrorResponse.CurrencyRateConversion.@type` (string)

- `ErrorResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `ErrorResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `ErrorResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `ErrorResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `ErrorResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `ErrorResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `ErrorResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `ErrorResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `ErrorResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `ErrorResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `ErrorResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `ErrorResponse.Pagination.totalItems` (integer, required)
  The total number of pages in this result set
  Example: 100

# Fare rules after Fare Display

Fare rules are the conditions and restrictions that apply to any booking based on its fare type. These determine the price of the fare. Generally, less expensive fares have more restrictions and more expensive fares have fewer restrictions. Fare rules can include blackout dates, advanced reservation requirements, minimum and maximum stay requirements, and cancellation and change penalties.

Endpoint: GET /air/farerule/farerules/fromfaredisplay
Version: 11.33.0
Security: bearerAuth

## Query parameters:

- `fareRuleIdentifier` (string)
  Send the value from FareDisplayResponse.Identifier from the Fare Display response.

- `fareID` (array)
  Send the value from fareDisplay.fare.sequence from the Fare Display response for the fare to request fare rules for.
  Example: "1"

- `fareRuleCategories` (array)
  List of fare rule categories required
  Example: ["[\"Penalties\"]"]

- `fareRuleType` (string, required)
  The type of fare rules requested. Supported values: ShortText, LongText
  Example: "LongText"

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

- `FareRuleListResponse` (object)
  The response of a Fare rule list endpoint request.

- `FareRuleListResponse.@type` (string)
  Example: "FareRuleListResponse"

- `FareRuleListResponse.FareRule` (array)

- `FareRuleListResponse.FareRule.@type` (string, required)
  Discriminator.
  Example: "FareRuleText"

- `FareRuleListResponse.FareRule.id` (string)

- `FareRuleListResponse.FareRule.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FareRuleListResponse.FareRule.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `FareRuleListResponse.FareRule.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `FareRuleListResponse.FareRule.Flight` (array, required)

- `FareRuleListResponse.FareRule.Flight.@type` (string, required)
  Discriminator. Child classes Flight and FlightDetail.
  Example: "FlightDetail"

- `FareRuleListResponse.FareRule.Flight.id` (string)
  Local id within a given message to support referencing this object.
  Example: "126"

- `FareRuleListResponse.FareRule.Flight.FlightRef` (string)
  Reference id that corresponds to the flight 'id' in ReferenceListFlight.Flight.
  Example: "s1"

- `FareRuleListResponse.FareRule.Flight.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FareRuleListResponse.FareRule.ruleNumber` (string)
  The rule number of fare rule
  Example: "34"

- `FareRuleListResponse.FareRule.tariffNumber` (string)
  Fare rule tarrif number
  Example: "56"

- `FareRuleListResponse.transactionId` (string)
  Unique transaction, correlation or tracking id for a single request and reply i.e. for a single transaction. Should be a 128 bit GUID format. Also know as E2ETrackingId.
  Example: "6570ed7b-89fe-4334-9c78-af282a977ba6"

- `FareRuleListResponse.traceId` (string)
  Optional ID for internal child transactions created for processing a single request (single transaction). Should be a 128 bit GUID format. Also known as ChildTrackingId.
  Example: "c009a53c-48f6-4084-b7b6-3043fa9fec67"

- `FareRuleListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `FareRuleListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `FareRuleListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `FareRuleListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `FareRuleListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `FareRuleListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `FareRuleListResponse.Result.Error.NameValuePair` (array)

- `FareRuleListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `FareRuleListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `FareRuleListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `FareRuleListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `FareRuleListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `FareRuleListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `FareRuleListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `FareRuleListResponse.Result.Warning.NameValuePair` (array)

- `FareRuleListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `FareRuleListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FareRuleListResponse.ReferenceList` (array)

- `FareRuleListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `FareRuleListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

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

- `ErrorResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `ErrorResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `ErrorResponse.NextSteps.NextStep` (array, required)

- `ErrorResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `ErrorResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `ErrorResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `ErrorResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `ErrorResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ErrorResponse.ReferenceList` (array)

- `ErrorResponse.CurrencyRateConversion` (array)

- `ErrorResponse.CurrencyRateConversion.@type` (string)

- `ErrorResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `ErrorResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `ErrorResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `ErrorResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `ErrorResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `ErrorResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `ErrorResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `ErrorResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `ErrorResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `ErrorResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `ErrorResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `ErrorResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `ErrorResponse.Pagination.totalItems` (integer, required)
  The total number of pages in this result set
  Example: 100
