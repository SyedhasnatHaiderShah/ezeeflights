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

# New workbench

Use this request to initiate a workbench for a new reservation. This prerequisite step for booking creates the workbench session in which all booking details are added together to create a PNR at commit.

Endpoint: POST /air/book/session/reservationworkbench
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
  Discriminator classes ReservationID, Reservation or ReservationDetail
  Example: "Reservation"

- `id` (string)
  Internal identifier for the response.
  Example: "REF12873"

- `Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

## Response 200 fields (application/json):

- `ReservationResponse` (object)
  The response of Create Reservation (Reference Payload), Create Reservation (Full Payload), Sync Reservation, Modify/Add Reservation, Create/Modify Passive Reservation, Retrieve Reservation, or Cancel Reservation endpoint requests.

- `ReservationResponse.Reservation` (object)

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

# Post commit workbench

Initiate a post-commit workbench to create a session for ticketing or updating an existing reservation. This is a prerequisite step for any transaction that modifies, updates, or tickets any PNR.

Endpoint: POST /air/book/session/reservationworkbench/buildfromlocator
Version: 11.33.0
Security: bearerAuth

## Query parameters:

- `Locator` (string)
  The booking locator code used to retrieve a Reservation
  Example: "ABC123"

- `source` (string)
  Specifies a unique identifier to indicate the source system which generated the resId.

- `detailViewInd` (boolean)
  If true, ReservationDetail will be returned

- `viewBrandCompleteInfoInd` (boolean)
  If true, Brand complete information will be returned in Reservation Response

- `viewBaggageDetailInd` (boolean)
  if true, full baggage information will be returned in Reservation Response

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

# Cancel workbench items

Cancel one or more offers or unpriced segments within the workbench. Offer types including air, hotel, vehicle. Ancillaries associated to air segments will by default cancel when the air segment is cancelled. Some restrictions on NDC and non-GDS hotel content apply.

Endpoint: POST /book/reservationworkbench/{ReservationResource_Identifier}/reservations/cancelitems
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Workbench Identifier you are actively working in

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

- `cancelAllInd` (boolean)
  If true, all offers and unpriced segments in the reservation will be cancelled. Includes air, hotel, car offers and unpricedSegments.

- `cancelOffers` (object)
  Parent class must be substituted with subclass CancelAllOffers or CancelSelectedOffers.

- `cancelOffers.objectType` (string, required)
  CancelOffers sub type options.
  Enum: "CancelAllOffers", "CancelSelectedOffers"

- `cancelUnpricedSegments` (object)
  Parent class must be substituted with subclass CancelAllUnpricedSegments or CancelSelectedUnpricedSegments

- `cancelUnpricedSegments.objectType` (string, required)
  CancelUnpricedSegments sub type options.
  Enum: "CancelAllUnpricedSegments", "CancelSelectedUnpricedSegments"

- `cancelAuxiliarySegments` (object)
  Parent class must be substituted with subclass CancelAllAuxiliarySegments or CancelSelectedAuxiliarySegments

- `cancelAuxiliarySegments.objectType` (string, required)
  CancelAuxiliarySegments sub type options.
  Enum: "CancelAllAuxiliarySegments", "CancelSelectedAuxiliarySegments"

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

# Retrieve workbench.

At any point in the booking session, you can retrieve the workbench. The response returns all details added to the workbench at that point.

Endpoint: GET /air/book/session/reservationworkbench/{Identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `Identifier` (string, required)
  The Reservation Workbench Identifier of the Reservation Workbench you are actively working on
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

## Query parameters:

- `detailViewInd` (boolean)
  If true, ReservationDetail will be returned.

- `viewBrandCompleteInfoInd` (boolean)
  If true, Brand complete information will be returned in Reservation Response

- `viewBaggageDetailInd` (boolean)
  if true, full baggage information will be returned in Reservation Response

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

# Discard workbench

At any point in a booking or ticketing workflow, if necessary, you can discard the workbench and any information in it.

Endpoint: DELETE /air/book/session/reservationworkbench/{Identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `Identifier` (string, required)
  The Reservation Workbench Identifier of the Reservation Workbench you are actively working on
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

- `ErrorResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `ErrorResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `ErrorResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `ErrorResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `ErrorResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `ErrorResponse.Result.Error.NameValuePair` (array)

- `ErrorResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `ErrorResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `ErrorResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `ErrorResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `ErrorResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `ErrorResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `ErrorResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `ErrorResponse.Result.Warning.NameValuePair` (array)

- `ErrorResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `ErrorResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `ErrorResponse.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `ErrorResponse.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

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

- `ErrorResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ErrorResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

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

## Response 200 fields

## Response 204 fields

# Workbench commit

After all required and any optional steps in a booking workbench session, send a POST request with the workbench identifier to commit the workbench. The resulting actions depend on whether payment is present in the workbench. If no Add Payment request has been sent, committing the workbench books the itinerary and generates a PNR. If an Add Payment request has not been sent, committing the workbench tickets the itinerary and generates ticket number/s.

Endpoint: POST /air/book/reservation/reservations/{Identifier}
Version: 11.33.0
Security: bearerAuth

## Query parameters:

- `autoDeleteDate` (string)
  Acts as a retention segment to hold the reservation open past the last date of travel purge date. Sending a new autoDeleteDate at commit step will update the existing autoDeleteDate. Sending 000/00/00 will delete an existing autoDeleteDate.

- `Issuance` (string)
  Indicates the type of issuance that should be performed at commit. (Ticket, BackOffice (MIR/TAIR))
  Enum: "Ticket", "BackOffice", "All", "Invoice"

- `DocumentValue` (string)
  Indicates of the value of the document should be refunded or retained following a CancelOffer action
  Enum: "Retain", "Refund", "Forfeit", "Void"

- `payLaterInd` (boolean)
  If true, the Reservation will be fulfilled at a later date

## Path parameters:

- `Identifier` (string, required)
  The ReservationWorkbenchIdentifier you wish to commit
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
