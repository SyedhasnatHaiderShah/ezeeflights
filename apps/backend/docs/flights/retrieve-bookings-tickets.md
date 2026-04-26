# Retrieve Bookings and Tickets

Retrieve bookings, tickets, and document histories.

## Ticket Retrieve

- [POST /air/ticket/tickets/getbylocator](https://developer.travelport.com/apis/flights/ticketing/ticketgetbylocator.md)

## Ticket display

- [GET /air/ticket/tickets/{Identifier}](https://developer.travelport.com/apis/flights/ticketing/getticket.md): GDS only. To retrieve an NDC ticket use the Ticket Retrieve API. This API duplicates functionality available in the more recently released Ticket Retrieve API, which for GDS can retrieve a single or multiple tickets.

## Reservation retrieve

- [GET /air/book/reservation/reservations/{Identifier}](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/retrievereservation.md): Retrieve details about a held booking, or PNR. While a PNR refers to a held booking that has not been ticketed, the PNR code persists after ticketing to provide the booking records. Once a PNR has been ticketed, you can still use PNR Retrieve to return both booking and ticketing details. A Ticket Display request can also be used to retrieve any ticketed itinerary.

## Retrieve a reservation by locator

- [GET /air/book/reservation/reservations/getbylocator](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/getreservationbylocator.md): To be deprecated and replaced by Get by Identifier using identifier Type "Locator"

## Ticket list

- [GET /air/receipt/reservations/{ReservationResource_Identifier}/receipts](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/getreceipts.md): Get a list of ticket receipts for a reservation.

## Ticket Retrieve

- [POST /air/ticket/tickets/getbylocator](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/ticketgetbylocator.md)

## Ticket display

- [GET /air/ticket/tickets/{Identifier}](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/getticket.md): GDS only. To retrieve an NDC ticket use the Ticket Retrieve API. This API duplicates functionality available in the more recently released Ticket Retrieve API, which for GDS can retrieve a single or multiple tickets.

## Document list

- [GET /documents/documentlist/{identifier}](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/documenthistorylist.md)

## Document history

- [POST /documents/history](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/documenthistory.md)

# Reservation retrieve

Retrieve details about a held booking, or PNR. While a PNR refers to a held booking that has not been ticketed, the PNR code persists after ticketing to provide the booking records. Once a PNR has been ticketed, you can still use PNR Retrieve to return both booking and ticketing details. A Ticket Display request can also be used to retrieve any ticketed itinerary.

Endpoint: GET /air/book/reservation/reservations/{Identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `Identifier` (string, required)
  The Reservation Identifier or Record Locator for the Reservation you wish to retrieve
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

## Query parameters:

- `authority` (string)
  The authorising entity creating the identifier
  Example: "TVPT"

- `detailViewInd` (boolean)
  If true, ReservationDetail will be returned.

- `viewBrandCompleteInfoInd` (boolean)
  If true, Brand complete information will be returned in Reservation Response

- `viewBaggageDetailInd` (boolean)
  if true, full baggage information will be returned in Reservation Response

- `identifierType` (string)
  The type of identifier key used to retrieve the reservation
  Enum: "Reservation", "Locator", "SupplierLocator", "DocumentNumber"

- `documentType` (string)
  When document is selected in IdentifierType, use documentType to identify the type of document
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `includeFlightAmenitiesInd` (boolean)
  If true, flight amenities will be included in the response

- `retrieveNonGDSSourceReservationInd` (boolean)
  if true, reservation information will be retrieved directly from the source supplier

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

# Retrieve a reservation by locator

To be deprecated and replaced by Get by Identifier using identifier Type "Locator"

Endpoint: GET /air/book/reservation/reservations/getbylocator
Version: 11.33.0
Security: bearerAuth

## Query parameters:

- `Locator` (string)
  The booking locator code used to retrieve a Reservation
  Example: "ABC123"

- `creationDate` (string)
  PNR creation Date

- `detailViewInd` (boolean)
  If true, ReservationDetail will be returned

- `viewBrandCompleteInfoInd` (boolean)
  If true, Brand complete information will be returned in Reservation Response

- `viewBaggageDetailInd` (boolean)
  if true, full baggage information will be returned in Reservation Response

- `includeFlightAmenitiesInd` (boolean)
  If true, flight amenities will be included in the response

- `retrieveNonGDSSourceReservationInd` (boolean)
  if true, reservation information will be retrieved directly from the source supplier

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

# Ticket list

Get a list of ticket receipts for a reservation.

Endpoint: GET /air/receipt/reservations/{ReservationResource_Identifier}/receipts
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier

## Query parameters:

- `ReceiptType` (string)
  The type of receipt you wish to view
  Enum: "Cancellation", "Payment", "ConfirmationHold", "ConfirmationTicket", "ConfirmationVehicle"

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

# Ticket Retrieve

Endpoint: POST /air/ticket/tickets/getbylocator
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
  Example: "TicketQueryGetByLocator"

- `detailViewInd` (boolean)
  If true, TicketDetail will be returned
  Example: true

- `Locator` (object, required)
  Locator information for the reservation. Contains the locator (PNR or external locator) or cancellation number for the reservation, order, or offer.

- `Locator.value` (string)
  "Reference number for locatorType.
  Booking.com returns a PIN number along with the confirmation number for each sold hotel segment. If the agent/traveler needs to reconcile the booking with Booking.com, Booking.com requires both the PIN number and confirmation number to locate the segment in their system."
  Example: "ZXG25P"

- `Locator.locatorType` (string)
  Specifies the type of reservation ID
  Travelport - Confirmation number; PNR locator Agency - IATA Number Booking.com - Confirmation number; PIN number
  In Document History, may return the content source (e.g. GDS or NDC)
  Example: "Confirmation Number"

- `Locator.source` (string)
  "Content source. Typically a two-character Supplier code that indicates the source system which generated the resid.
  For Hotels, if source matches chain code, the offer is directly with the supplier. If source is 'BO', the offer is with Booking.com."
  Example: "1G"

- `Locator.sourceContext` (string)
  Specifies the context of the source. Either Travelport, Agency, or Supplier.
  Example: "Travelport"

- `Locator.otaType` (string)
  Used for codes
  Example: "14.UIT"

- `Locator.creationDate` (string)
  Date created in Travelport or supplier system in YYYY-MM-DD format.
  Example: "2026-03-01"

- `Locator.lastUpdated` (string)
  The date and time stamp the Reservation was last updated.
  Example: "2026-08-07 12:12:00+00:00"

- `TicketNumber` (array)

- `TicketNumber.value` (string)
  Ticket number
  Example: "1156"

- `TicketNumber.ticketIssuer` (string)
  Ticket issuer
  Example: "Cargo airways"

- `TicketNumber.contentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

## Response 200 fields (application/json):

- `TicketListResponse` (object)
  The response of a Ticket list endpoint request.

- `TicketListResponse.TicketID` (array)

- `TicketListResponse.TicketID.@type` (string, required)
  Discriminator classes TicketID, Ticket, TicketSummary or TicketDetail
  Example: "Ticket"

- `TicketListResponse.TicketID.objID` (string)

- `TicketListResponse.TicketID.TicketRef` (string)

- `TicketListResponse.TicketID.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TicketListResponse.TicketID.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TicketListResponse.TicketID.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `TicketListResponse.TicketID.numberOfTicketsIssued` (integer, required)
  The total number of tickets issued for the collection of flight segments example: 5

- `TicketListResponse.TicketID.settlementAuthorizationCode` (string)
  Electronic Settlement Authorization Code - A unique number generated by a Carrier to authorize or approve a transaction
  Example: "REA"

- `TicketListResponse.TicketID.tourCode` (string)
  A Tour Code on a flight ticket is a special code arranged between the Travel Agency and the Airlines
  Example: "LHR"

- `TicketListResponse.TicketID.accountCode` (string)
  The Account Code used to classify financial activities
  Example: "Pcard, travel"

- `TicketListResponse.TicketID.ticketDesignator` (string)
  A code on airline tickets to indicate what type of discount is applied
  Example: "infant"

- `TicketListResponse.TicketID.PersonName` (object, required)
  Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

- `TicketListResponse.TicketID.PersonName.@type` (string, required)
  Discriminator classes PersonName or PersonNameDetail
  Example: "PersonNameDetail"

- `TicketListResponse.TicketID.PersonName.Prefix` (string)
  Salutation of honorific (e.g. Mr., Mrs., Ms., Miss, Dr.)
  Example: "Mr"

- `TicketListResponse.TicketID.PersonName.Given` (string)
  Given name, first name or names.
  Example: "John"

- `TicketListResponse.TicketID.PersonName.Middle` (string)
  The middle name of the person name.
  Example: "Erick"

- `TicketListResponse.TicketID.PersonName.Surname` (string, required)
  Family name, last name.
  Example: "Smith"

- `TicketListResponse.TicketID.ReservationLocator` (object)
  The supplier and the supplier's locator code for a product

- `TicketListResponse.TicketID.ReservationLocator.value` (string)
  Example: "WTR45G"

- `TicketListResponse.TicketID.ReservationLocator.supplierCode` (string)
  Supplier Code
  Example: "AA"

- `TicketListResponse.TicketID.ReservationLocator.supplierName` (string)
  Name of the supplier
  Example: "American Airlines"

- `TicketListResponse.TicketID.FormOfPayment` (array, required)

- `TicketListResponse.TicketID.FormOfPayment.value` (string)
  The list of valid forms of payment.
  Enum: "AgencyAccount", "BSP", "Cash", "Document", "Invoice", "PaymentCard", "WaiverCode"

- `TicketListResponse.TicketID.FormOfPayment.documentNumber` (string)
  Payment document number
  Example: "45"

- `TicketListResponse.TicketID.FormOfPayment.encryptedValue` (string)
  Encrypted value
  Example: "BNASJASJKASKJASHJKASK"

- `TicketListResponse.TicketID.FormOfPayment.documentIssuer` (string)
  Document issuer
  Example: "Alpha travel"

- `TicketListResponse.TicketID.FormOfPayment.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `TicketListResponse.TicketID.TicketSegment` (array, required)

- `TicketListResponse.TicketID.TicketSegment.@type` (string)
  Example: "TicketSegment"

- `TicketListResponse.TicketID.TicketSegment.sequence` (integer)
  The sequence of the coupon within the ticket
  Example: 1

- `TicketListResponse.TicketID.TicketSegment.ClassOfService` (string)
  The booking class of service. segment
  Example: "Y"

- `TicketListResponse.TicketID.TicketSegment.FareBasisCode` (string)
  The Fare Basis code for this ticket segment.
  Example: "YEE1Y"

- `TicketListResponse.TicketID.TicketSegment.Status` (string)
  Enum: "CheckedIn", "Closed", "Exchanged", "InfoOnly", "Lifted/Boarded", "OpenForUse", "OtherAirlineControl", "Void", "Refund", "Suspended", "Unavailable", "Used"

- `TicketListResponse.TicketID.TicketSegment.Carrier` (string, required)
  The marketing carrier of the flight on this ticket segment.
  Example: "DL"

- `TicketListResponse.TicketID.TicketSegment.Number` (string, required)
  The flight number.
  Example: "2490"

- `TicketListResponse.TicketID.TicketSegment.Departure` (object, required)

- `TicketListResponse.TicketID.TicketSegment.Departure.@type` (string, required)
  Discriminator classes Departure or DepartureDetail
  Example: "DepartureDetail"

- `TicketListResponse.TicketID.TicketSegment.Departure.location` (string, required)
  Location of departure or arrival
  Example: "AMS"

- `TicketListResponse.TicketID.TicketSegment.Departure.date` (string, required)
  Local date of for arrival or departure
  Example: "0011-10-17"

- `TicketListResponse.TicketID.TicketSegment.Departure.time` (string, required)
  Local time Date of for arrival or departure
  Example: "04:45:00"

- `TicketListResponse.TicketID.TicketSegment.Arrival` (object, required)

- `TicketListResponse.TicketID.TicketSegment.Arrival.@type` (string, required)
  Discriminator classes Arrival or ArrivalDetail
  Example: "ArrivalDetail"

- `TicketListResponse.TicketID.TicketSegment.Arrival.location` (string, required)
  Location of departure or arrival
  Example: "MAD"

- `TicketListResponse.TicketID.TicketSegment.Arrival.date` (string, required)
  Local date of for arrival or departure
  Example: "0011-10-17"

- `TicketListResponse.TicketID.TicketSegment.Arrival.time` (string)
  Local time Date of for arrival or departure
  Example: "04:45:00"

- `TicketListResponse.TicketID.TicketSegment.FlightStatusCode` (string, required)
  A status code indicates the status of an air segment
  Example: "HK"

- `TicketListResponse.TicketID.TicketSegment.ValidDateRange` (object)
  Specifies the begin and end date of an event, such as check-in and check-out dates.

- `TicketListResponse.TicketID.TicketSegment.ValidDateRange.start` (string, required)
  Specifies the start date for an event, such as a booking or check-in date in YYYY-MM-DD format.
  Example: "2026-03-03"

- `TicketListResponse.TicketID.TicketSegment.ValidDateRange.end` (string, required)
  Specifies the end date an event, such as a booking or check-out date in YYYY-MM-DD format.
  Example: "2026-03-03"

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage` (object, required)

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.@type` (string)
  Example: "TicketBaggage"

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.quantity` (integer)
  How many baggage allowed
  Example: 2

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.Measurement` (array)
  The total dimensions of baggage

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.Measurement.value` (number)
  Example: 2.22

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.Measurement.measurementType` (string)
  The type of measurement such as width, height, weight
  Enum: "Width", "Height", "Depth", "Weight", "OverallDimension"

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.Measurement.unit` (string)
  The unit of measure in a code format. Refer to OpenTravel Code List Unit of Measure Code (UOM).
  Enum: "Miles", "Kilometers", "Meters", "Millimeters", "Centimeters", "Yards", "Feet", "Inches", "Pixels", "Block", "Megabytes", "Gigabytes", "Square feet", "Square meters", "Pounds", "Kilograms", "Square inch", "Square yard", "Acre", "Square millimeter", "Square centimeter", "Hectare", "Ounce", "Gram", "Gallons", "Liters", "Kilowatts", "Cubic meters"

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.soldByPieceInd` (boolean)
  If true, the baggage item is sold as a piece allowance. Weight restrictions may also apply.

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.soldByWeightInd` (boolean)
  If true, the baggage item is sold as a weight allowance. Number of item restrictions may also apply.

- `TicketListResponse.TicketID.TicketSegment.connectionInd` (boolean)
  If true, the ticketSegment is a connecting segment
  Example: true

- `TicketListResponse.TicketID.TicketPrice` (object, required)

- `TicketListResponse.TicketID.TicketPrice.@type` (string)
  Example: "TicketPrice"

- `TicketListResponse.TicketID.TicketPrice.fareCalculation` (string)
  Calculation of applicable fare
  Example: "LON BA SIN R235.00YEE1Y BA LON R235.00YEE1Y END ROE0.645487"

- `TicketListResponse.TicketID.TicketPrice.fareBreakdown` (string)
  An itinerary used as the start and finish of a particular fare

- `TicketListResponse.TicketID.TicketPrice.CurrencyCode` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TicketListResponse.TicketID.TicketPrice.CurrencyCode.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `TicketListResponse.TicketID.TicketPrice.CurrencyCode.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `TicketListResponse.TicketID.TicketPrice.CurrencyCode.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `TicketListResponse.TicketID.TicketPrice.CurrencyCode.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `TicketListResponse.TicketID.TicketPrice.Base` (number, required)

- `TicketListResponse.TicketID.TicketPrice.Taxes` (object)
  Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

- `TicketListResponse.TicketID.TicketPrice.Taxes.@type` (string, required)
  Discriminator. Child class is TaxesDetail
  Example: "TaxesDetail"

- `TicketListResponse.TicketID.TicketPrice.Taxes.TotalTaxes` (number)
  A monetary amount, representing the total of all taxes included in this offer. Supports up to 4 decimal places; decimal place must be included.
  Example: 330.1

- `TicketListResponse.TicketID.TicketPrice.Taxes.TaxInfo` (array)
  Returned for TripChange APIS only.

- `TicketListResponse.TicketID.TicketPrice.Taxes.TaxInfo.@type` (string)
  Example: "TaxInfo"

- `TicketListResponse.TicketID.TicketPrice.Taxes.TaxInfo.TaxCode` (string, required)
  The tax code
  Example: "XF"

- `TicketListResponse.TicketID.TicketPrice.Taxes.TaxInfo.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TicketListResponse.TicketID.TicketPrice.Taxes.TaxInfo.Amount` (number, required)
  The amount of the tax applied

- `TicketListResponse.TicketID.TicketPrice.Taxes.TaxInfo.TaxBreakdown` (array, required)
  The breakdown of the tax for this tax code

- `TicketListResponse.TicketID.TicketPrice.Fees` (object)
  Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

- `TicketListResponse.TicketID.TicketPrice.Fees.@type` (string, required)
  Discriminator. Child class FeesDetail
  Example: "FeesDetail"

- `TicketListResponse.TicketID.TicketPrice.Fees.TotalFees` (number)
  Total fees included in the TotalPrice. Supports up to 4 decimal places; decimal place needs to be included.
  Example: 111.11

- `TicketListResponse.TicketID.TicketPrice.Fees.TotalAdditionalFeesPayableLocally` (number)
  Fees due separately at the property. Expected to be paid in local currency. These fees are not included in the Offer TotalPrice.
  Example: 2.1

- `TicketListResponse.TicketID.TicketPrice.Total` (number, required)

- `TicketListResponse.TicketID.TicketPrice.Commission` (object)
  Commission information. In Air Search commission is returned for GDS only; not supported for NDC. Any commission filed by an airline in a CAT35 fare is returned in PriceBreakdownAir/Commission. The amount is either a percent of the fare component (@type CommissionPercent and the Percent object) or an amount (@type CommissionAmount and the Amount object).

- `TicketListResponse.TicketID.TicketPrice.Commission.@type` (string, required)
  Discriminator. Child classes CommissionAmount or CommissionPercent
  Example: "CommissionAmount"

- `TicketListResponse.TicketID.TicketPrice.Commission.application` (string)
  Type of commission
  Enum: "Full", "Partial", "Non-paying", "No-show", "Adjustment", "Commissionable"

- `TicketListResponse.TicketID.TicketPrice.FiledAmount` (object)
  The base amount of a ticket price or net price that is filed in local currency

- `TicketListResponse.TicketID.TicketPrice.FiledAmount.value` (number)
  Filed amount value
  Example: 43.3422

- `TicketListResponse.TicketID.TicketPrice.FiledAmount.currencyCode` (string)
  Filed amount currency code
  Example: "USD"

- `TicketListResponse.TicketID.TicketPrice.FiledAmount.codeAuthority` (string)
  Filed amount currency code authority
  Example: "Australian Dollar"

- `TicketListResponse.TicketID.TicketPrice.FiledAmount.decimalPlace` (integer, required)
  ISO 4217 standard has a different number of decimals
  Example: 3

- `TicketListResponse.TicketID.TicketPrice.FiledAmount.decimalAuthority` (string)
  ISO 4217 standard decimal authority
  Example: "ISO 4217"

- `TicketListResponse.TicketID.TicketPrice.PaidTaxes` (object)
  Summary Taxes object

- `TicketListResponse.TicketID.TicketPrice.PaidTaxes.@type` (string, required)
  Discriminator classes PaidTaxes or PaidTaxesDetail
  Example: "PaidTaxesDetail"

- `TicketListResponse.TicketID.TicketPrice.PaidTaxes.TotalTaxes` (number)
  A monetary amount, up to 4 decimal places. Decimal place needs to be included.
  Example: 220.12

- `TicketListResponse.TicketID.TicketPrice.iTFareInd` (boolean)
  if true, this is an IT fare and the base amount is not exposed
  Example: true

- `TicketListResponse.TicketID.TicketPrice.bTFareInd` (boolean)
  if true, this is a BT fare and the base amount is not exposed

- `TicketListResponse.TicketID.TicketPrice.AdditionalCollection` (object)
  The base amount of a ticket price or net price that is filed in local currency

- `TicketListResponse.TicketID.TicketPrice.NetAmount` (object)

- `TicketListResponse.TicketID.TicketPrice.NetAmount.amount` (number, required)
  The base amount
  Example: 43.3422

- `TicketListResponse.TicketID.TicketPrice.NetAmount.currencyCode` (string, required)
  Amount currency code
  Example: "USD"

- `TicketListResponse.TicketID.TicketPrice.NetAmount.decimalPlace` (integer, required)
  ISO 4217 decimal standard
  Example: 3

- `TicketListResponse.TicketID.TicketPrice.NetAmount.fareCalculation` (string)
  the fare calculation string
  Example: "LON BA SIN R 234.00 BA LON R 234.00NUC468.00END"

- `TicketListResponse.TicketID.TicketPrice.NetAmount.rateOfExchange` (number)
  The rate of exchange used to convert the fare calculation
  Example: 1.234562

- `TicketListResponse.TicketID.PassengerTypeCode` (string)
  Code used to identify Passengers according to various
  Example: "PTC"

- `TicketListResponse.TicketID.ValidatingCarrier` (string)
  The plating carrier of the ticket
  Example: "ticket prefix is 001, while United Airlines' prefix is 016."

- `TicketListResponse.TicketID.PricingType` (string)
  How the price was created
  Enum: "Auto Priced", "Manually Price"

- `TicketListResponse.TicketID.Restrictions` (array)
  restrictions associated with a particular fare
  Example: ["VALID BA ONLY/ NON REF","NON REF"]

- `TicketListResponse.TicketID.AgencyInfo` (object)
  Detail of the travel agency that issues the ticket

- `TicketListResponse.TicketID.AgencyInfo.ticketedDate` (string)
  Ticketed date
  Example: "2026-04-05"

- `TicketListResponse.TicketID.AgencyInfo.name` (string, required)
  Name of the Agency
  Example: "Alpha travel"

- `TicketListResponse.TicketID.AgencyInfo.place` (string)
  Place of the agency
  Example: "Marietta"

- `TicketListResponse.TicketID.AgencyInfo.ticketingPCC` (string)
  Ticketing PCC
  Example: "1CR"

- `TicketListResponse.TicketID.AgencyInfo.code` (string)
  Agency code
  Example: "12430870"

- `TicketListResponse.TicketID.AgencyInfo.salesType` (string)
  Sales type
  Example: "Ticketing"

- `TicketListResponse.TicketID.AgencyInfo.ticketingCountry` (string, required)
  Ticketing country
  Example: "US"

- `TicketListResponse.TicketID.AgencyInfo.ticketingCity` (string, required)
  Ticketing city
  Example: "NYC"

- `TicketListResponse.TicketID.OriginalIssue` (object)

- `TicketListResponse.TicketID.OriginalIssue.value` (string)

- `TicketListResponse.TicketID.OriginalIssue.issuingCity` (string, required)
  Original Issuing city
  Example: "NYC"

- `TicketListResponse.TicketID.OriginalIssue.issueDate` (string, required)
  Issue date
  Example: "2026-04-04"

- `TicketListResponse.TicketID.OriginalIssue.agencyCodeIATA` (string, required)
  Agency code
  Example: "89213476"

- `TicketListResponse.TicketID.OriginalIssue.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `TicketListResponse.TicketID.PreviousIssue` (array)

- `TicketListResponse.TicketID.PreviousIssue.value` (string)

- `TicketListResponse.TicketID.PreviousIssue.issuingCity` (string)

- `TicketListResponse.TicketID.PreviousIssue.issueDate` (string)

- `TicketListResponse.TicketID.PreviousIssue.agencyCodeIATA` (string)

- `TicketListResponse.TicketID.PreviousIssue.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `TicketListResponse.SettlementAuthorizationCode` (string)

- `TicketListResponse.@type` (string)
  Example: "response"

- `TicketListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `TicketListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `TicketListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `TicketListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `TicketListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `TicketListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `TicketListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `TicketListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `TicketListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `TicketListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `TicketListResponse.Result.Error.NameValuePair` (array)

- `TicketListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `TicketListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `TicketListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `TicketListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `TicketListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `TicketListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `TicketListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `TicketListResponse.Result.Warning.NameValuePair` (array)

- `TicketListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `TicketListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TicketListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `TicketListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `TicketListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `TicketListResponse.NextSteps.NextStep` (array, required)

- `TicketListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `TicketListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `TicketListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `TicketListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `TicketListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `TicketListResponse.ReferenceList` (array)

- `TicketListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `TicketListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `TicketListResponse.CurrencyRateConversion` (array)

- `TicketListResponse.CurrencyRateConversion.@type` (string)

- `TicketListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TicketListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TicketListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `TicketListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `TicketListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `TicketListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `TicketListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `TicketListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `TicketListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `TicketListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `TicketListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `TicketListResponse.Pagination.totalItems` (integer, required)
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

# Ticket display

GDS only. To retrieve an NDC ticket use the Ticket Retrieve API. This API duplicates functionality available in the more recently released Ticket Retrieve API, which for GDS can retrieve a single or multiple tickets.

Endpoint: GET /air/ticket/tickets/{Identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `Identifier` (string, required)
  The ticket number you wish to retrieve
  Example: "1259900123456"

## Query parameters:

- `detailViewInd` (boolean)
  If true, TicketDetail will be returned

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

- `TicketListResponse` (object)
  The response of a Ticket list endpoint request.

- `TicketListResponse.TicketID` (array)

- `TicketListResponse.TicketID.@type` (string, required)
  Discriminator classes TicketID, Ticket, TicketSummary or TicketDetail
  Example: "Ticket"

- `TicketListResponse.TicketID.objID` (string)

- `TicketListResponse.TicketID.TicketRef` (string)

- `TicketListResponse.TicketID.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TicketListResponse.TicketID.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TicketListResponse.TicketID.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `TicketListResponse.TicketID.numberOfTicketsIssued` (integer, required)
  The total number of tickets issued for the collection of flight segments example: 5

- `TicketListResponse.TicketID.settlementAuthorizationCode` (string)
  Electronic Settlement Authorization Code - A unique number generated by a Carrier to authorize or approve a transaction
  Example: "REA"

- `TicketListResponse.TicketID.tourCode` (string)
  A Tour Code on a flight ticket is a special code arranged between the Travel Agency and the Airlines
  Example: "LHR"

- `TicketListResponse.TicketID.accountCode` (string)
  The Account Code used to classify financial activities
  Example: "Pcard, travel"

- `TicketListResponse.TicketID.ticketDesignator` (string)
  A code on airline tickets to indicate what type of discount is applied
  Example: "infant"

- `TicketListResponse.TicketID.PersonName` (object, required)
  Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

- `TicketListResponse.TicketID.PersonName.@type` (string, required)
  Discriminator classes PersonName or PersonNameDetail
  Example: "PersonNameDetail"

- `TicketListResponse.TicketID.PersonName.Prefix` (string)
  Salutation of honorific (e.g. Mr., Mrs., Ms., Miss, Dr.)
  Example: "Mr"

- `TicketListResponse.TicketID.PersonName.Given` (string)
  Given name, first name or names.
  Example: "John"

- `TicketListResponse.TicketID.PersonName.Middle` (string)
  The middle name of the person name.
  Example: "Erick"

- `TicketListResponse.TicketID.PersonName.Surname` (string, required)
  Family name, last name.
  Example: "Smith"

- `TicketListResponse.TicketID.ReservationLocator` (object)
  The supplier and the supplier's locator code for a product

- `TicketListResponse.TicketID.ReservationLocator.value` (string)
  Example: "WTR45G"

- `TicketListResponse.TicketID.ReservationLocator.supplierCode` (string)
  Supplier Code
  Example: "AA"

- `TicketListResponse.TicketID.ReservationLocator.supplierName` (string)
  Name of the supplier
  Example: "American Airlines"

- `TicketListResponse.TicketID.FormOfPayment` (array, required)

- `TicketListResponse.TicketID.FormOfPayment.value` (string)
  The list of valid forms of payment.
  Enum: "AgencyAccount", "BSP", "Cash", "Document", "Invoice", "PaymentCard", "WaiverCode"

- `TicketListResponse.TicketID.FormOfPayment.documentNumber` (string)
  Payment document number
  Example: "45"

- `TicketListResponse.TicketID.FormOfPayment.encryptedValue` (string)
  Encrypted value
  Example: "BNASJASJKASKJASHJKASK"

- `TicketListResponse.TicketID.FormOfPayment.documentIssuer` (string)
  Document issuer
  Example: "Alpha travel"

- `TicketListResponse.TicketID.FormOfPayment.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `TicketListResponse.TicketID.TicketSegment` (array, required)

- `TicketListResponse.TicketID.TicketSegment.@type` (string)
  Example: "TicketSegment"

- `TicketListResponse.TicketID.TicketSegment.sequence` (integer)
  The sequence of the coupon within the ticket
  Example: 1

- `TicketListResponse.TicketID.TicketSegment.ClassOfService` (string)
  The booking class of service. segment
  Example: "Y"

- `TicketListResponse.TicketID.TicketSegment.FareBasisCode` (string)
  The Fare Basis code for this ticket segment.
  Example: "YEE1Y"

- `TicketListResponse.TicketID.TicketSegment.Status` (string)
  Enum: "CheckedIn", "Closed", "Exchanged", "InfoOnly", "Lifted/Boarded", "OpenForUse", "OtherAirlineControl", "Void", "Refund", "Suspended", "Unavailable", "Used"

- `TicketListResponse.TicketID.TicketSegment.Carrier` (string, required)
  The marketing carrier of the flight on this ticket segment.
  Example: "DL"

- `TicketListResponse.TicketID.TicketSegment.Number` (string, required)
  The flight number.
  Example: "2490"

- `TicketListResponse.TicketID.TicketSegment.Departure` (object, required)

- `TicketListResponse.TicketID.TicketSegment.Departure.@type` (string, required)
  Discriminator classes Departure or DepartureDetail
  Example: "DepartureDetail"

- `TicketListResponse.TicketID.TicketSegment.Departure.location` (string, required)
  Location of departure or arrival
  Example: "AMS"

- `TicketListResponse.TicketID.TicketSegment.Departure.date` (string, required)
  Local date of for arrival or departure
  Example: "0011-10-17"

- `TicketListResponse.TicketID.TicketSegment.Departure.time` (string, required)
  Local time Date of for arrival or departure
  Example: "04:45:00"

- `TicketListResponse.TicketID.TicketSegment.Arrival` (object, required)

- `TicketListResponse.TicketID.TicketSegment.Arrival.@type` (string, required)
  Discriminator classes Arrival or ArrivalDetail
  Example: "ArrivalDetail"

- `TicketListResponse.TicketID.TicketSegment.Arrival.location` (string, required)
  Location of departure or arrival
  Example: "MAD"

- `TicketListResponse.TicketID.TicketSegment.Arrival.date` (string, required)
  Local date of for arrival or departure
  Example: "0011-10-17"

- `TicketListResponse.TicketID.TicketSegment.Arrival.time` (string)
  Local time Date of for arrival or departure
  Example: "04:45:00"

- `TicketListResponse.TicketID.TicketSegment.FlightStatusCode` (string, required)
  A status code indicates the status of an air segment
  Example: "HK"

- `TicketListResponse.TicketID.TicketSegment.ValidDateRange` (object)
  Specifies the begin and end date of an event, such as check-in and check-out dates.

- `TicketListResponse.TicketID.TicketSegment.ValidDateRange.start` (string, required)
  Specifies the start date for an event, such as a booking or check-in date in YYYY-MM-DD format.
  Example: "2026-03-03"

- `TicketListResponse.TicketID.TicketSegment.ValidDateRange.end` (string, required)
  Specifies the end date an event, such as a booking or check-out date in YYYY-MM-DD format.
  Example: "2026-03-03"

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage` (object, required)

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.@type` (string)
  Example: "TicketBaggage"

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.quantity` (integer)
  How many baggage allowed
  Example: 2

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.Measurement` (array)
  The total dimensions of baggage

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.Measurement.value` (number)
  Example: 2.22

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.Measurement.measurementType` (string)
  The type of measurement such as width, height, weight
  Enum: "Width", "Height", "Depth", "Weight", "OverallDimension"

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.Measurement.unit` (string)
  The unit of measure in a code format. Refer to OpenTravel Code List Unit of Measure Code (UOM).
  Enum: "Miles", "Kilometers", "Meters", "Millimeters", "Centimeters", "Yards", "Feet", "Inches", "Pixels", "Block", "Megabytes", "Gigabytes", "Square feet", "Square meters", "Pounds", "Kilograms", "Square inch", "Square yard", "Acre", "Square millimeter", "Square centimeter", "Hectare", "Ounce", "Gram", "Gallons", "Liters", "Kilowatts", "Cubic meters"

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.soldByPieceInd` (boolean)
  If true, the baggage item is sold as a piece allowance. Weight restrictions may also apply.

- `TicketListResponse.TicketID.TicketSegment.TicketBaggage.soldByWeightInd` (boolean)
  If true, the baggage item is sold as a weight allowance. Number of item restrictions may also apply.

- `TicketListResponse.TicketID.TicketSegment.connectionInd` (boolean)
  If true, the ticketSegment is a connecting segment
  Example: true

- `TicketListResponse.TicketID.TicketPrice` (object, required)

- `TicketListResponse.TicketID.TicketPrice.@type` (string)
  Example: "TicketPrice"

- `TicketListResponse.TicketID.TicketPrice.fareCalculation` (string)
  Calculation of applicable fare
  Example: "LON BA SIN R235.00YEE1Y BA LON R235.00YEE1Y END ROE0.645487"

- `TicketListResponse.TicketID.TicketPrice.fareBreakdown` (string)
  An itinerary used as the start and finish of a particular fare

- `TicketListResponse.TicketID.TicketPrice.CurrencyCode` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TicketListResponse.TicketID.TicketPrice.CurrencyCode.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `TicketListResponse.TicketID.TicketPrice.CurrencyCode.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `TicketListResponse.TicketID.TicketPrice.CurrencyCode.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `TicketListResponse.TicketID.TicketPrice.CurrencyCode.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `TicketListResponse.TicketID.TicketPrice.Base` (number, required)

- `TicketListResponse.TicketID.TicketPrice.Taxes` (object)
  Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

- `TicketListResponse.TicketID.TicketPrice.Taxes.@type` (string, required)
  Discriminator. Child class is TaxesDetail
  Example: "TaxesDetail"

- `TicketListResponse.TicketID.TicketPrice.Taxes.TotalTaxes` (number)
  A monetary amount, representing the total of all taxes included in this offer. Supports up to 4 decimal places; decimal place must be included.
  Example: 330.1

- `TicketListResponse.TicketID.TicketPrice.Taxes.TaxInfo` (array)
  Returned for TripChange APIS only.

- `TicketListResponse.TicketID.TicketPrice.Taxes.TaxInfo.@type` (string)
  Example: "TaxInfo"

- `TicketListResponse.TicketID.TicketPrice.Taxes.TaxInfo.TaxCode` (string, required)
  The tax code
  Example: "XF"

- `TicketListResponse.TicketID.TicketPrice.Taxes.TaxInfo.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TicketListResponse.TicketID.TicketPrice.Taxes.TaxInfo.Amount` (number, required)
  The amount of the tax applied

- `TicketListResponse.TicketID.TicketPrice.Taxes.TaxInfo.TaxBreakdown` (array, required)
  The breakdown of the tax for this tax code

- `TicketListResponse.TicketID.TicketPrice.Fees` (object)
  Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

- `TicketListResponse.TicketID.TicketPrice.Fees.@type` (string, required)
  Discriminator. Child class FeesDetail
  Example: "FeesDetail"

- `TicketListResponse.TicketID.TicketPrice.Fees.TotalFees` (number)
  Total fees included in the TotalPrice. Supports up to 4 decimal places; decimal place needs to be included.
  Example: 111.11

- `TicketListResponse.TicketID.TicketPrice.Fees.TotalAdditionalFeesPayableLocally` (number)
  Fees due separately at the property. Expected to be paid in local currency. These fees are not included in the Offer TotalPrice.
  Example: 2.1

- `TicketListResponse.TicketID.TicketPrice.Total` (number, required)

- `TicketListResponse.TicketID.TicketPrice.Commission` (object)
  Commission information. In Air Search commission is returned for GDS only; not supported for NDC. Any commission filed by an airline in a CAT35 fare is returned in PriceBreakdownAir/Commission. The amount is either a percent of the fare component (@type CommissionPercent and the Percent object) or an amount (@type CommissionAmount and the Amount object).

- `TicketListResponse.TicketID.TicketPrice.Commission.@type` (string, required)
  Discriminator. Child classes CommissionAmount or CommissionPercent
  Example: "CommissionAmount"

- `TicketListResponse.TicketID.TicketPrice.Commission.application` (string)
  Type of commission
  Enum: "Full", "Partial", "Non-paying", "No-show", "Adjustment", "Commissionable"

- `TicketListResponse.TicketID.TicketPrice.FiledAmount` (object)
  The base amount of a ticket price or net price that is filed in local currency

- `TicketListResponse.TicketID.TicketPrice.FiledAmount.value` (number)
  Filed amount value
  Example: 43.3422

- `TicketListResponse.TicketID.TicketPrice.FiledAmount.currencyCode` (string)
  Filed amount currency code
  Example: "USD"

- `TicketListResponse.TicketID.TicketPrice.FiledAmount.codeAuthority` (string)
  Filed amount currency code authority
  Example: "Australian Dollar"

- `TicketListResponse.TicketID.TicketPrice.FiledAmount.decimalPlace` (integer, required)
  ISO 4217 standard has a different number of decimals
  Example: 3

- `TicketListResponse.TicketID.TicketPrice.FiledAmount.decimalAuthority` (string)
  ISO 4217 standard decimal authority
  Example: "ISO 4217"

- `TicketListResponse.TicketID.TicketPrice.PaidTaxes` (object)
  Summary Taxes object

- `TicketListResponse.TicketID.TicketPrice.PaidTaxes.@type` (string, required)
  Discriminator classes PaidTaxes or PaidTaxesDetail
  Example: "PaidTaxesDetail"

- `TicketListResponse.TicketID.TicketPrice.PaidTaxes.TotalTaxes` (number)
  A monetary amount, up to 4 decimal places. Decimal place needs to be included.
  Example: 220.12

- `TicketListResponse.TicketID.TicketPrice.iTFareInd` (boolean)
  if true, this is an IT fare and the base amount is not exposed
  Example: true

- `TicketListResponse.TicketID.TicketPrice.bTFareInd` (boolean)
  if true, this is a BT fare and the base amount is not exposed

- `TicketListResponse.TicketID.TicketPrice.AdditionalCollection` (object)
  The base amount of a ticket price or net price that is filed in local currency

- `TicketListResponse.TicketID.TicketPrice.NetAmount` (object)

- `TicketListResponse.TicketID.TicketPrice.NetAmount.amount` (number, required)
  The base amount
  Example: 43.3422

- `TicketListResponse.TicketID.TicketPrice.NetAmount.currencyCode` (string, required)
  Amount currency code
  Example: "USD"

- `TicketListResponse.TicketID.TicketPrice.NetAmount.decimalPlace` (integer, required)
  ISO 4217 decimal standard
  Example: 3

- `TicketListResponse.TicketID.TicketPrice.NetAmount.fareCalculation` (string)
  the fare calculation string
  Example: "LON BA SIN R 234.00 BA LON R 234.00NUC468.00END"

- `TicketListResponse.TicketID.TicketPrice.NetAmount.rateOfExchange` (number)
  The rate of exchange used to convert the fare calculation
  Example: 1.234562

- `TicketListResponse.TicketID.PassengerTypeCode` (string)
  Code used to identify Passengers according to various
  Example: "PTC"

- `TicketListResponse.TicketID.ValidatingCarrier` (string)
  The plating carrier of the ticket
  Example: "ticket prefix is 001, while United Airlines' prefix is 016."

- `TicketListResponse.TicketID.PricingType` (string)
  How the price was created
  Enum: "Auto Priced", "Manually Price"

- `TicketListResponse.TicketID.Restrictions` (array)
  restrictions associated with a particular fare
  Example: ["VALID BA ONLY/ NON REF","NON REF"]

- `TicketListResponse.TicketID.AgencyInfo` (object)
  Detail of the travel agency that issues the ticket

- `TicketListResponse.TicketID.AgencyInfo.ticketedDate` (string)
  Ticketed date
  Example: "2026-04-05"

- `TicketListResponse.TicketID.AgencyInfo.name` (string, required)
  Name of the Agency
  Example: "Alpha travel"

- `TicketListResponse.TicketID.AgencyInfo.place` (string)
  Place of the agency
  Example: "Marietta"

- `TicketListResponse.TicketID.AgencyInfo.ticketingPCC` (string)
  Ticketing PCC
  Example: "1CR"

- `TicketListResponse.TicketID.AgencyInfo.code` (string)
  Agency code
  Example: "12430870"

- `TicketListResponse.TicketID.AgencyInfo.salesType` (string)
  Sales type
  Example: "Ticketing"

- `TicketListResponse.TicketID.AgencyInfo.ticketingCountry` (string, required)
  Ticketing country
  Example: "US"

- `TicketListResponse.TicketID.AgencyInfo.ticketingCity` (string, required)
  Ticketing city
  Example: "NYC"

- `TicketListResponse.TicketID.OriginalIssue` (object)

- `TicketListResponse.TicketID.OriginalIssue.value` (string)

- `TicketListResponse.TicketID.OriginalIssue.issuingCity` (string, required)
  Original Issuing city
  Example: "NYC"

- `TicketListResponse.TicketID.OriginalIssue.issueDate` (string, required)
  Issue date
  Example: "2026-04-04"

- `TicketListResponse.TicketID.OriginalIssue.agencyCodeIATA` (string, required)
  Agency code
  Example: "89213476"

- `TicketListResponse.TicketID.OriginalIssue.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `TicketListResponse.TicketID.PreviousIssue` (array)

- `TicketListResponse.TicketID.PreviousIssue.value` (string)

- `TicketListResponse.TicketID.PreviousIssue.issuingCity` (string)

- `TicketListResponse.TicketID.PreviousIssue.issueDate` (string)

- `TicketListResponse.TicketID.PreviousIssue.agencyCodeIATA` (string)

- `TicketListResponse.TicketID.PreviousIssue.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `TicketListResponse.SettlementAuthorizationCode` (string)

- `TicketListResponse.@type` (string)
  Example: "response"

- `TicketListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `TicketListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `TicketListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `TicketListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `TicketListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `TicketListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `TicketListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `TicketListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `TicketListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `TicketListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `TicketListResponse.Result.Error.NameValuePair` (array)

- `TicketListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `TicketListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `TicketListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `TicketListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `TicketListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `TicketListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `TicketListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `TicketListResponse.Result.Warning.NameValuePair` (array)

- `TicketListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `TicketListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TicketListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `TicketListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `TicketListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `TicketListResponse.NextSteps.NextStep` (array, required)

- `TicketListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `TicketListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `TicketListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `TicketListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `TicketListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `TicketListResponse.ReferenceList` (array)

- `TicketListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `TicketListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `TicketListResponse.CurrencyRateConversion` (array)

- `TicketListResponse.CurrencyRateConversion.@type` (string)

- `TicketListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TicketListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TicketListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `TicketListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `TicketListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `TicketListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `TicketListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `TicketListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `TicketListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `TicketListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `TicketListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `TicketListResponse.Pagination.totalItems` (integer, required)
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

# Document list

Endpoint: GET /documents/documentlist/{identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `identifier` (string, required)
  The Reservation Identifier or Record Locator for the Reservation you wish to retrieve
  Example: "ABC123"

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

- `DocumentHistoryListResponse` (object)
  Summary of document associated to this Reservation.

- `DocumentHistoryListResponse.documentHistoryList` (array)

- `DocumentHistoryListResponse.documentHistoryList.name` (string)
  The traveler name associated to the document.
  Example: "SMITH/JOHNMR"

- `DocumentHistoryListResponse.documentHistoryList.documentListSummary` (array)

- `DocumentHistoryListResponse.documentHistoryList.documentListSummary.platingAirline` (string)
  The plating airline code of the document.
  Example: "BA"

- `DocumentHistoryListResponse.documentHistoryList.documentListSummary.number` (string, required)
  The document number. 13 digit ticket number, or 17 digit conjunctive ticket number, or 9 digit invoice number.

- `DocumentHistoryListResponse.documentHistoryList.documentListSummary.documentType` (string, required)
  Enum: "E", "N", "M", "F", "I", "D", "C"

- `DocumentHistoryListResponse.documentHistoryList.documentListSummary.actionStatus` (string, required)
  Enum: "I", "R", "RC", "V", "VE", "E"

- `DocumentHistoryListResponse.documentHistoryList.documentListSummary.transactionDateTimeUTC` (string)
  Transaction date and time stamp in UTC.

- `DocumentHistoryListResponse.documentHistoryList.documentListSummary.pseudoCityCode` (string, required)
  Example: "XS4"

- `DocumentHistoryListResponse.@type` (string)
  Example: "response"

- `DocumentHistoryListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `DocumentHistoryListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `DocumentHistoryListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `DocumentHistoryListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `DocumentHistoryListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `DocumentHistoryListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `DocumentHistoryListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `DocumentHistoryListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `DocumentHistoryListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `DocumentHistoryListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `DocumentHistoryListResponse.Result.Error.NameValuePair` (array)

- `DocumentHistoryListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `DocumentHistoryListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `DocumentHistoryListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `DocumentHistoryListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `DocumentHistoryListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `DocumentHistoryListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `DocumentHistoryListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `DocumentHistoryListResponse.Result.Warning.NameValuePair` (array)

- `DocumentHistoryListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `DocumentHistoryListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `DocumentHistoryListResponse.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `DocumentHistoryListResponse.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `DocumentHistoryListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `DocumentHistoryListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `DocumentHistoryListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `DocumentHistoryListResponse.NextSteps.NextStep` (array, required)

- `DocumentHistoryListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `DocumentHistoryListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `DocumentHistoryListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `DocumentHistoryListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `DocumentHistoryListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `DocumentHistoryListResponse.ReferenceList` (array)

- `DocumentHistoryListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `DocumentHistoryListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `DocumentHistoryListResponse.CurrencyRateConversion` (array)

- `DocumentHistoryListResponse.CurrencyRateConversion.@type` (string)

- `DocumentHistoryListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `DocumentHistoryListResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `DocumentHistoryListResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `DocumentHistoryListResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `DocumentHistoryListResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `DocumentHistoryListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `DocumentHistoryListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `DocumentHistoryListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `DocumentHistoryListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `DocumentHistoryListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `DocumentHistoryListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `DocumentHistoryListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `DocumentHistoryListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `DocumentHistoryListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `DocumentHistoryListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `DocumentHistoryListResponse.Pagination.totalItems` (integer, required)
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

# Document history

Endpoint: POST /documents/history
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

- `locator` (string)
  For GDS locator max length is 6.
  Example: "ZXG25P"

- `documentNumbers` (array)

- `documentNumbers.number` (string, required)
  The document number.
  Example: 19900123456

- `documentNumbers.numberOfConjunctiveTickets` (integer)
  Example: 2

- `documentNumbers.documentType` (string, required)
  Enum: "TKT", "EMD", "MCO", "INV", "TASF"

## Response 200 fields (application/json):

- `DocumentHistoryResponse` (object)
  Full document history display of a ticket or invoice.

- `DocumentHistoryResponse.documentHistories` (array)

- `DocumentHistoryResponse.documentHistories.number` (object)
  The document number with the type of document

- `DocumentHistoryResponse.documentHistories.issueDateTimeUTC` (string)
  The issue date time of the document in GMT.

- `DocumentHistoryResponse.documentHistories.issuingGTID` (string)
  The issuing terminal ID.
  Example: "CCCDBA"

- `DocumentHistoryResponse.documentHistories.issuingAgent` (string)
  The document issuing agent initials.
  Example: "TW"

- `DocumentHistoryResponse.documentHistories.issuingPseudoCityCode` (string)
  The document issuing pseudo city code.
  Example: "XS4"

- `DocumentHistoryResponse.documentHistories.issuingIATA` (string)
  The document issuing IATA number.
  Example: "99999992"

- `DocumentHistoryResponse.documentHistories.issuingAgencyName` (string)
  The name of the issuing agency.
  Example: "ABC Travel"

- `DocumentHistoryResponse.documentHistories.issuingAgencyLocation` (string)
  The city location of the issuing agency.
  Example: "AMS"

- `DocumentHistoryResponse.documentHistories.countryCode` (string)
  ISO Code of a Country.
  Example: "GB"

- `DocumentHistoryResponse.documentHistories.travelportLocator` (object)
  Locator information for the reservation. Contains the locator (PNR or external locator) or cancellation number for the reservation, order, or offer.

- `DocumentHistoryResponse.documentHistories.travelportLocator.value` (string)
  "Reference number for locatorType.
  Booking.com returns a PIN number along with the confirmation number for each sold hotel segment. If the agent/traveler needs to reconcile the booking with Booking.com, Booking.com requires both the PIN number and confirmation number to locate the segment in their system."
  Example: "ZXG25P"

- `DocumentHistoryResponse.documentHistories.travelportLocator.locatorType` (string)
  Specifies the type of reservation ID
  Travelport - Confirmation number; PNR locator Agency - IATA Number Booking.com - Confirmation number; PIN number
  In Document History, may return the content source (e.g. GDS or NDC)
  Example: "Confirmation Number"

- `DocumentHistoryResponse.documentHistories.travelportLocator.source` (string)
  "Content source. Typically a two-character Supplier code that indicates the source system which generated the resid.
  For Hotels, if source matches chain code, the offer is directly with the supplier. If source is 'BO', the offer is with Booking.com."
  Example: "1G"

- `DocumentHistoryResponse.documentHistories.travelportLocator.sourceContext` (string)
  Specifies the context of the source. Either Travelport, Agency, or Supplier.
  Example: "Travelport"

- `DocumentHistoryResponse.documentHistories.travelportLocator.otaType` (string)
  Used for codes
  Example: "14.UIT"

- `DocumentHistoryResponse.documentHistories.travelportLocator.creationDate` (string)
  Date created in Travelport or supplier system in YYYY-MM-DD format.
  Example: "2026-03-01"

- `DocumentHistoryResponse.documentHistories.travelportLocator.lastUpdated` (string)
  The date and time stamp the Reservation was last updated.
  Example: "2026-08-07 12:12:00+00:00"

- `DocumentHistoryResponse.documentHistories.supplierLocator` (object)
  Locator information for the reservation. Contains the locator (PNR or external locator) or cancellation number for the reservation, order, or offer.

- `DocumentHistoryResponse.documentHistories.orderID` (string)
  The NDC Order ID.
  Example: "AB081H5MRTUA7"

- `DocumentHistoryResponse.documentHistories.name` (string)
  The name of the traveler the document is issued for
  Example: "SMITH/JOHNMR"

- `DocumentHistoryResponse.documentHistories.passengerTypeCode` (string)
  Passenger type code
  Example: "CHD"

- `DocumentHistoryResponse.documentHistories.passengerComments` (object)
  Comments object to relay text information

- `DocumentHistoryResponse.documentHistories.passengerComments.@type` (string)
  Example: "Comments"

- `DocumentHistoryResponse.documentHistories.passengerComments.Comment` (array)

- `DocumentHistoryResponse.documentHistories.passengerComments.Comment.value` (string)
  Actual text. May be restricted by character limits based on the type of comment (e.g. Notepad remarks limited to 87 characters).
  Example: "Additional comments"

- `DocumentHistoryResponse.documentHistories.passengerComments.Comment.id` (string)
  Local identifier within a given message for this object.
  Example: "comment_1"

- `DocumentHistoryResponse.documentHistories.passengerComments.Comment.name` (string)
  Title of comment or type of remark.
  Example: "Comment name"

- `DocumentHistoryResponse.documentHistories.passengerComments.Comment.language` (string)
  Language code using ISO-639 standard
  Example: "EN"

- `DocumentHistoryResponse.documentHistories.pricingDateTimeUTC` (string)
  The pricing date and time stamp in UTC.
  Example: "2025-05-23"

- `DocumentHistoryResponse.documentHistories.pricingPseudoCityCode` (string)
  The pseudo city code that the price was created.
  Example: "XS4"

- `DocumentHistoryResponse.documentHistories.platingAirline` (string)
  The plating airline code of the document.
  Example: "BA"

- `DocumentHistoryResponse.documentHistories.agentEnteredDetails` (object)
  Agency entered details that are submitted at time of pricing or ticketing

- `DocumentHistoryResponse.documentHistories.agentEnteredDetails.fareQuoteModifierString` (array)
  Array of modifiers applied at the time of pricing
  Example: ["Z5"]

- `DocumentHistoryResponse.documentHistories.agentEnteredDetails.ticketModifierString` (array)
  Array of modifiers applied at the time of ticketing
  Example: ["EBVALID BA ONLY NON REF"]

- `DocumentHistoryResponse.documentHistories.formOfPayment` (array)
  Array of form of payments related to this document.

- `DocumentHistoryResponse.documentHistories.formOfPayment.formOfPaymentType` (string)
  Example: "CREDIT"

- `DocumentHistoryResponse.documentHistories.formOfPayment.paymentCard` (object)
  Payment Card details.

- `DocumentHistoryResponse.documentHistories.formOfPayment.paymentCard.cardCode` (string)
  The Payment Card Code.
  Example: "VI"

- `DocumentHistoryResponse.documentHistories.formOfPayment.paymentCard.cardNumber` (string)
  The payment card number masked.
  Example: "4929XXXXXXXXX123"

- `DocumentHistoryResponse.documentHistories.formOfPayment.paymentCard.cardExpiryDate` (string)
  The payment card expiry date. MMYY format.
  Example: "0525"

- `DocumentHistoryResponse.documentHistories.formOfPayment.paymentCard.cardAuthorizationCode` (string)
  The payment card authorization.
  Example: "123A45"

- `DocumentHistoryResponse.documentHistories.formOfPayment.amount` (number)
  The total amount charged to this form of payment.
  Example: 500

- `DocumentHistoryResponse.documentHistories.formOfPayment.formOfPaymentText` (string)
  Free text information associated to the form of payment.
  Example: "NONREF"

- `DocumentHistoryResponse.documentHistories.ticketSegments` (array)
  Flight information in ticket coupons.

- `DocumentHistoryResponse.documentHistories.ticketSegments.@type` (string)
  Example: "TicketSegment"

- `DocumentHistoryResponse.documentHistories.ticketSegments.sequence` (integer)
  The sequence of the coupon within the ticket
  Example: 1

- `DocumentHistoryResponse.documentHistories.ticketSegments.ClassOfService` (string)
  The booking class of service. segment
  Example: "Y"

- `DocumentHistoryResponse.documentHistories.ticketSegments.FareBasisCode` (string)
  The Fare Basis code for this ticket segment.
  Example: "YEE1Y"

- `DocumentHistoryResponse.documentHistories.ticketSegments.Status` (string)
  Enum: "CheckedIn", "Closed", "Exchanged", "InfoOnly", "Lifted/Boarded", "OpenForUse", "OtherAirlineControl", "Void", "Refund", "Suspended", "Unavailable", "Used"

- `DocumentHistoryResponse.documentHistories.ticketSegments.Carrier` (string, required)
  The marketing carrier of the flight on this ticket segment.
  Example: "DL"

- `DocumentHistoryResponse.documentHistories.ticketSegments.Number` (string, required)
  The flight number.
  Example: "2490"

- `DocumentHistoryResponse.documentHistories.ticketSegments.Departure` (object, required)

- `DocumentHistoryResponse.documentHistories.ticketSegments.Departure.@type` (string, required)
  Discriminator classes Departure or DepartureDetail
  Example: "DepartureDetail"

- `DocumentHistoryResponse.documentHistories.ticketSegments.Departure.location` (string, required)
  Location of departure or arrival
  Example: "AMS"

- `DocumentHistoryResponse.documentHistories.ticketSegments.Departure.date` (string, required)
  Local date of for arrival or departure
  Example: "0011-10-17"

- `DocumentHistoryResponse.documentHistories.ticketSegments.Departure.time` (string, required)
  Local time Date of for arrival or departure
  Example: "04:45:00"

- `DocumentHistoryResponse.documentHistories.ticketSegments.Arrival` (object, required)

- `DocumentHistoryResponse.documentHistories.ticketSegments.Arrival.@type` (string, required)
  Discriminator classes Arrival or ArrivalDetail
  Example: "ArrivalDetail"

- `DocumentHistoryResponse.documentHistories.ticketSegments.Arrival.location` (string, required)
  Location of departure or arrival
  Example: "MAD"

- `DocumentHistoryResponse.documentHistories.ticketSegments.Arrival.date` (string, required)
  Local date of for arrival or departure
  Example: "0011-10-17"

- `DocumentHistoryResponse.documentHistories.ticketSegments.Arrival.time` (string)
  Local time Date of for arrival or departure
  Example: "04:45:00"

- `DocumentHistoryResponse.documentHistories.ticketSegments.FlightStatusCode` (string, required)
  A status code indicates the status of an air segment
  Example: "HK"

- `DocumentHistoryResponse.documentHistories.ticketSegments.ValidDateRange` (object)
  Specifies the begin and end date of an event, such as check-in and check-out dates.

- `DocumentHistoryResponse.documentHistories.ticketSegments.ValidDateRange.start` (string, required)
  Specifies the start date for an event, such as a booking or check-in date in YYYY-MM-DD format.
  Example: "2026-03-03"

- `DocumentHistoryResponse.documentHistories.ticketSegments.ValidDateRange.end` (string, required)
  Specifies the end date an event, such as a booking or check-out date in YYYY-MM-DD format.
  Example: "2026-03-03"

- `DocumentHistoryResponse.documentHistories.ticketSegments.TicketBaggage` (object, required)

- `DocumentHistoryResponse.documentHistories.ticketSegments.TicketBaggage.@type` (string)
  Example: "TicketBaggage"

- `DocumentHistoryResponse.documentHistories.ticketSegments.TicketBaggage.quantity` (integer)
  How many baggage allowed
  Example: 2

- `DocumentHistoryResponse.documentHistories.ticketSegments.TicketBaggage.Measurement` (array)
  The total dimensions of baggage

- `DocumentHistoryResponse.documentHistories.ticketSegments.TicketBaggage.Measurement.value` (number)
  Example: 2.22

- `DocumentHistoryResponse.documentHistories.ticketSegments.TicketBaggage.Measurement.measurementType` (string)
  The type of measurement such as width, height, weight
  Enum: "Width", "Height", "Depth", "Weight", "OverallDimension"

- `DocumentHistoryResponse.documentHistories.ticketSegments.TicketBaggage.Measurement.unit` (string)
  The unit of measure in a code format. Refer to OpenTravel Code List Unit of Measure Code (UOM).
  Enum: "Miles", "Kilometers", "Meters", "Millimeters", "Centimeters", "Yards", "Feet", "Inches", "Pixels", "Block", "Megabytes", "Gigabytes", "Square feet", "Square meters", "Pounds", "Kilograms", "Square inch", "Square yard", "Acre", "Square millimeter", "Square centimeter", "Hectare", "Ounce", "Gram", "Gallons", "Liters", "Kilowatts", "Cubic meters"

- `DocumentHistoryResponse.documentHistories.ticketSegments.TicketBaggage.soldByPieceInd` (boolean)
  If true, the baggage item is sold as a piece allowance. Weight restrictions may also apply.

- `DocumentHistoryResponse.documentHistories.ticketSegments.TicketBaggage.soldByWeightInd` (boolean)
  If true, the baggage item is sold as a weight allowance. Number of item restrictions may also apply.

- `DocumentHistoryResponse.documentHistories.ticketSegments.connectionInd` (boolean)
  If true, the ticketSegment is a connecting segment
  Example: true

- `DocumentHistoryResponse.documentHistories.documentDetail` (object)
  Price used on this document

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail` (object)
  Detailed pricing information of the document.

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.currencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.currencyCode.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.currencyCode.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.currencyCode.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.currencyCode.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.filedBaseAmount` (object)
  A monetary amount, up to 4 decimal places. Decimal place must be included.

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.filedBaseAmount.value` (number)
  The amount of a given currency.
  Example: 124.56

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.filedBaseAmount.code` (string)
  An ISO 4217 alpha character code (3 characters) that specifies a money unit.
  Example: "USD"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.filedBaseAmount.minorUnit` (integer)
  Minor units are a mechanism for expressing the relationship between a major currency unit and its corresponding minor currency unit.
  Example: 2

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.filedBaseAmount.currencySource` (string)
  The system requesting or returning the currency code specified in the attribute
  Enum: "Supplier", "Charged", "Requested"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.filedBaseAmount.approximateInd` (boolean)
  "If true, the currency amount has been converted from the original amount.
  For Hotel Availability and Rules, true indicates this is a calculated value; false indicates this is the value returned by the property."
  Example: true

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.base` (number)
  The base fare excluding any taxes or fees.
  Example: 750

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.totalTaxes` (number)
  Total amount of all taxes.
  Example: 50

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.totalDocumentPrice` (number)
  Total of base plus totalTaxes. OB fees are not included in totalDocumentPrice.
  Example: 850

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.totalFees` (number)
  Total amount of all fees.
  Example: 50

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.totalChargePrice` (number)
  Total of base, totalTaxes and totalFees.
  Example: 900

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.totalAdditionalCollection` (number)
  Additional Collection amount charged on the exchanged document.
  Example: 250

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.totalForfeitAmount` (number)
  The total amount that has been forfeited after an exchange of documents when a residual amount has not been refunded.
  Example: 25

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.taxBreakdown` (array)
  Individual tax breakdown and description.

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.taxBreakdown.@type` (string, required)
  Discriminator. Child class is TaxesDetail
  Example: "TaxesDetail"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.taxBreakdown.TotalTaxes` (number)
  A monetary amount, representing the total of all taxes included in this offer. Supports up to 4 decimal places; decimal place must be included.
  Example: 330.1

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.taxBreakdown.TaxInfo` (array)
  Returned for TripChange APIS only.

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.paidTaxBreakdown` (array)
  Array of paid taxes.

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown` (array)
  Array of individual fees.

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown.@type` (string)

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown.feeCode` (string)
  For Hotel, the Hotel provider's explanation of the fee; can be returned either as a code or as text. For Air, the code for the fee, such as OB for OB fees.
  Example: "1011"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown.reportingAuthority` (string)
  Not used. Identifies the reporting authority.
  Example: "OPRA"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown.purpose` (string)
  Not used. Fee purpose
  Example: "Service charge"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown.description` (string)
  For Hotels, the Hotel provider's text explanation of the charge. For Air, any description for that fee code.
  Example: "Resort Fee"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown.feeApplication` (string)
  Application values (such as the application of a fee) like per person or per room.
  Enum: "PerPerson", "PerRoom", "PerAccommodation", "PerHouse", "PerApartment", "PerAdult", "PerChild"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown.feeFrequency` (string)
  The frequency of a fee such as per night or per stay.
  Enum: "PerNight", "PerDay", "PerStay", "PerWeek", "RoundTrip", "OneWay"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown.FeeAmountOrPercent` (object, required)
  Defines whether the fee is charged as an amount or percentage.

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown.FeeAmountOrPercent.@type` (string, required)
  Discriminator. Child classes FeeAmountOrPercentAmount or FeeAmountOrPercentPercent

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown.FeeAmountOrPercent.application` (string)
  Type of commission
  Enum: "Full", "Partial", "Non-paying", "No-show", "Adjustment", "Commissionable"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown.Tax` (array)

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown.includedinBaseInd` (boolean)
  If true, indicates the fee is included in Base Price.

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown.includedInTotalPriceInd` (boolean)
  If true, indicates the fee is included in Total Price. Default behavior is for fees not to be included in TotalPrice.

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.feeBreakdown.collectionMethod` (string)
  List of change fee method
  Enum: "EMD", "MCO", "Tax", "Unknown"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.fareCalculation` (object)
  Details on how the fare has been constructed.

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.fareCalculation.fareCalculationString` (string)
  The linear fare calculation string.
  Example: "LON BA X/SIN SYD R250.00BA X/SIN BA LON R250.00END"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.fareCalculation.rateOfExchange` (number)
  The exchange rate applied.
  Example: 0.1234568

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.fareCalculation.pricingIndicator` (string)
  The pricing code indicates how the fare is priced. e.g. manual or automated. The pricing indicator determines when the fare is valid for the Travelport fare guarantee policy.
  Example: "G"

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.commissionAmount` (number)
  The amount of commission applied to this document.
  Example: 25

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.commissionPercent` (number)
  The percentage of commission override applied to the document.
  Example: 10.25

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.restrictions` (array)
  Array of restrictions/endorsements.
  Example: ["VALID BA ONLY"]

- `DocumentHistoryResponse.documentHistories.documentDetail.documentPricingDetail.tourCode` (string)
  The tour code applied.
  Example: "SUMMERSUN"

- `DocumentHistoryResponse.documentHistories.documentDetail.voidDetail` (object)
  Detail information on a document that has been voided

- `DocumentHistoryResponse.documentHistories.documentDetail.voidDetail.voidDocumentNumber` (object)
  The document number with the type of document

- `DocumentHistoryResponse.documentHistories.documentDetail.voidDetail.voidDateTimeUTC` (string)
  The date time the document was voided in GMT.

- `DocumentHistoryResponse.documentHistories.documentDetail.voidDetail.source` (string)
  Example: "1G"

- `DocumentHistoryResponse.documentHistories.documentDetail.voidDetail.pseudoCityCode` (string)
  Example: "XS4"

- `DocumentHistoryResponse.documentHistories.documentDetail.voidDetail.voidingAgent` (string)
  The voiding agent initials.
  Example: "TW"

- `DocumentHistoryResponse.documentHistories.documentDetail.voidDetail.sacCode` (string)
  The settlement authorization code for this transaction
  Example: "123SZ7RAS4GRR"

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail` (object)
  Detail information on a refunded document

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundDocumentNumber` (object)
  The document number with the type of document

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundDateTimeUTC` (string)
  The date time the document was voided in GMT.

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.source` (string)
  Example: "1G"

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.pseudoCityCode` (string)
  Example: "XS4"

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundingAgent` (string)
  The voiding agent initials.
  Example: "TW"

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.sacCode` (string)
  The settlement authorization code for this transaction
  Example: "123SZ7RAS4GRR"

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundCategory` (string)
  Enum: "Full", "Partial", "Automated", "NonReportable"

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount` (object)
  Refund amount breakdown

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.currencyCode` (string)
  3 letter currency code as defined by ISO-4217.
  Example: "EUR"

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.base` (number)
  The base refund amount exclusive of taxes and fees.
  Example: 400

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.equivalent` (object)
  A monetary amount, up to 4 decimal places. Decimal place must be included.

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.totalTaxes` (number)
  Total amount of tax refunded.
  Example: 75

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.totalRefund` (number)
  Total refund amount.
  Example: 475

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.refundTaxBreakdown` (array)
  Array of individual taxes.

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.cashAmountUsed` (number)
  Total cash amount used.
  Example: 475

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.creditAmountUsed` (number)
  Total credit amount used.
  Example: 475

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.refundFormOfPayment` (array)
  The form of payment used for the refund including the amount refunded.

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.refundPenalty` (object)
  A monetary amount, up to 4 decimal places. Decimal place must be included.

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.refundWaiverCode` (object)
  A code assigned by an airline to support waiver of fees or ticket value as a result of disruption to the passenger.

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.refundWaiverCode.value` (string)

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.refundWaiverCode.reasonCode` (integer)
  A code assigned to identify the reason for disruption
  Example: 2

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.refundWaiverCode.waiverType` (string)
  List of waiver types.
  Enum: "ChangePenalty", "PriceDifference", "ChangePenaltyAndPriceDifference", "RefundPenalty", "NameChangePenalty"

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.refundCommissionAmount` (number)
  The amount of commission applied to the refunded ticket.
  Example: 40

- `DocumentHistoryResponse.documentHistories.documentDetail.refundDetail.refundAmount.refundCommissionPercent` (integer)
  The percentage of commission override applied to the refunded ticket.
  Example: 9

- `DocumentHistoryResponse.documentHistories.documentDetail.exchangePenalty` (object)
  A monetary amount, up to 4 decimal places. Decimal place must be included.

- `DocumentHistoryResponse.documentHistories.documentDetail.residualValue` (object)
  A monetary amount, up to 4 decimal places. Decimal place must be included.

- `DocumentHistoryResponse.documentHistories.mcoDetail` (object)
  MCO detail information

- `DocumentHistoryResponse.documentHistories.mcoDetail.issuedFor` (string)
  MCO issued for.
  Example: "Residual Value"

- `DocumentHistoryResponse.documentHistories.mcoDetail.reasonForIssuanceCode` (string)
  MCO reason for issuance code.
  Example: "K"

- `DocumentHistoryResponse.documentHistories.mcoDetail.issuedAt` (string)
  MCO issuance IATA location code.
  Example: "LON"

- `DocumentHistoryResponse.documentHistories.mcoDetail.pTA` (string)
  Yes , No , Unknown
  Enum: "Yes", "No", "Unknown"

- `DocumentHistoryResponse.documentHistories.mcoDetail.tOD` (string)
  Yes , No , Unknown
  Enum: "Yes", "No", "Unknown"

- `DocumentHistoryResponse.documentHistories.mcoDetail.comment` (array)
  Example: ["MCO ISSUED FOR RESIDUAL VALUE"]

- `DocumentHistoryResponse.documentHistories.duePaidRemarks` (string)
  Yes , No , Unknown
  Enum: "Yes", "No", "Unknown"

- `DocumentHistoryResponse.documentHistories.relatedDocument` (object)
  The related ticket or invoice number.

- `DocumentHistoryResponse.documentHistories.relatedDocument.number` (string, required)
  The document number.
  Example: 19900123456

- `DocumentHistoryResponse.documentHistories.relatedDocument.numberOfConjunctiveTickets` (integer)
  Example: 2

- `DocumentHistoryResponse.documentHistories.relatedDocument.documentType` (string, required)
  Enum: "TKT", "EMD", "MCO", "INV", "TASF"

- `DocumentHistoryResponse.documentHistories.associatedDocument` (object)
  The associated EMD or MCO number.

- `DocumentHistoryResponse.documentHistories.associatedDocument.number` (string, required)
  The document number.
  Example: 19900123456

- `DocumentHistoryResponse.documentHistories.associatedDocument.numberOfConjunctiveTickets` (integer)
  Example: 2

- `DocumentHistoryResponse.documentHistories.associatedDocument.documentType` (string, required)
  Enum: "TKT", "EMD", "MCO", "INV", "TASF"

- `DocumentHistoryResponse.documentHistories.exchanges` (object)
  Details of documents that have been exchanged for this document.

- `DocumentHistoryResponse.documentHistories.exchanges.exchangedFor` (object)

- `DocumentHistoryResponse.documentHistories.exchanges.exchangedFor.value` (string)

- `DocumentHistoryResponse.documentHistories.exchanges.exchangedFor.issuingCity` (string)

- `DocumentHistoryResponse.documentHistories.exchanges.exchangedFor.issueDate` (string)

- `DocumentHistoryResponse.documentHistories.exchanges.exchangedFor.agencyCodeIATA` (string)

- `DocumentHistoryResponse.documentHistories.exchanges.exchangedFor.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `DocumentHistoryResponse.documentHistories.exchanges.originalIssue` (object)

- `DocumentHistoryResponse.documentHistories.exchanges.previousIssue` (array)
  Array of previous issued documents.

- `DocumentHistoryResponse.@type` (string)
  Example: "response"

- `DocumentHistoryResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `DocumentHistoryResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `DocumentHistoryResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `DocumentHistoryResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `DocumentHistoryResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `DocumentHistoryResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `DocumentHistoryResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `DocumentHistoryResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `DocumentHistoryResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `DocumentHistoryResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `DocumentHistoryResponse.Result.Error.NameValuePair` (array)

- `DocumentHistoryResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `DocumentHistoryResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `DocumentHistoryResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `DocumentHistoryResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `DocumentHistoryResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `DocumentHistoryResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `DocumentHistoryResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `DocumentHistoryResponse.Result.Warning.NameValuePair` (array)

- `DocumentHistoryResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `DocumentHistoryResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `DocumentHistoryResponse.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `DocumentHistoryResponse.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `DocumentHistoryResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `DocumentHistoryResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `DocumentHistoryResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `DocumentHistoryResponse.NextSteps.NextStep` (array, required)

- `DocumentHistoryResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `DocumentHistoryResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `DocumentHistoryResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `DocumentHistoryResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `DocumentHistoryResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `DocumentHistoryResponse.ReferenceList` (array)

- `DocumentHistoryResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `DocumentHistoryResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `DocumentHistoryResponse.CurrencyRateConversion` (array)

- `DocumentHistoryResponse.CurrencyRateConversion.@type` (string)

- `DocumentHistoryResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `DocumentHistoryResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `DocumentHistoryResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `DocumentHistoryResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `DocumentHistoryResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `DocumentHistoryResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `DocumentHistoryResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `DocumentHistoryResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `DocumentHistoryResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `DocumentHistoryResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `DocumentHistoryResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `DocumentHistoryResponse.Pagination.totalItems` (integer, required)
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
