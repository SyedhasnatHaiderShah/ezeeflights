# Queues

Manage agency queues.

## Queue placement

- [POST /air/queue/queue](https://developer.travelport.com/apis/flights/queues/create.md)

## Queue remove

- [POST /air/queue/queue/remove](https://developer.travelport.com/apis/flights/queues/queueremove.md)

## Queue list

- [POST /air/queue/queue/list](https://developer.travelport.com/apis/flights/queues/createqueuelist.md)

# Queue placement

Endpoint: POST /air/queue/queue
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
  Example: "AgencyQueueSummary"

- `Identifer` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `Identifer.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `Identifer.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `ReservationIdentifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `Queue` (array, required)

- `Queue.value` (integer)
  Example: 23

- `Queue.pccOverride` (string)
  Example: "0XS4"

- `Queue.category` (string)

- `Queue.date` (string)

- `Queue.dateOffset` (integer)

## Response 200 fields (application/json):

- `BaseResponse` (object)
  Base response is part of all JSON APIs responses and includes common items which are relevant across all APIs

- `BaseResponse.@type` (string)
  Example: "response"

- `BaseResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `BaseResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `BaseResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `BaseResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `BaseResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `BaseResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `BaseResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `BaseResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `BaseResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `BaseResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `BaseResponse.Result.Error.NameValuePair` (array)

- `BaseResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `BaseResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `BaseResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `BaseResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `BaseResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `BaseResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `BaseResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `BaseResponse.Result.Warning.NameValuePair` (array)

- `BaseResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `BaseResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BaseResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `BaseResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `BaseResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `BaseResponse.NextSteps.NextStep` (array, required)

- `BaseResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `BaseResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `BaseResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `BaseResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `BaseResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `BaseResponse.ReferenceList` (array)

- `BaseResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `BaseResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `BaseResponse.CurrencyRateConversion` (array)

- `BaseResponse.CurrencyRateConversion.@type` (string)

- `BaseResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `BaseResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `BaseResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `BaseResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `BaseResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `BaseResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `BaseResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `BaseResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `BaseResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `BaseResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `BaseResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `BaseResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `BaseResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `BaseResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `BaseResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `BaseResponse.Pagination.totalItems` (integer, required)
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

# Queue remove

Endpoint: POST /air/queue/queue/remove
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
  Example: "AgencyQueueSummary"

- `Identifer` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `Identifer.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `Identifer.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `ReservationIdentifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `Queue` (array, required)

- `Queue.value` (integer)
  Example: 23

- `Queue.pccOverride` (string)
  Example: "0XS4"

- `Queue.category` (string)

- `Queue.date` (string)

- `Queue.dateOffset` (integer)

## Response 200 fields (application/json):

- `BaseResponse` (object)
  Base response is part of all JSON APIs responses and includes common items which are relevant across all APIs

- `BaseResponse.@type` (string)
  Example: "response"

- `BaseResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `BaseResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `BaseResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `BaseResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `BaseResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `BaseResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `BaseResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `BaseResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `BaseResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `BaseResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `BaseResponse.Result.Error.NameValuePair` (array)

- `BaseResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `BaseResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `BaseResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `BaseResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `BaseResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `BaseResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `BaseResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `BaseResponse.Result.Warning.NameValuePair` (array)

- `BaseResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `BaseResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `BaseResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `BaseResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `BaseResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `BaseResponse.NextSteps.NextStep` (array, required)

- `BaseResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `BaseResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `BaseResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `BaseResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `BaseResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `BaseResponse.ReferenceList` (array)

- `BaseResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `BaseResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `BaseResponse.CurrencyRateConversion` (array)

- `BaseResponse.CurrencyRateConversion.@type` (string)

- `BaseResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `BaseResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `BaseResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `BaseResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `BaseResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `BaseResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `BaseResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `BaseResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `BaseResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `BaseResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `BaseResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `BaseResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `BaseResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `BaseResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `BaseResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `BaseResponse.Pagination.totalItems` (integer, required)
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

# Queue list

Endpoint: POST /air/queue/queue/list
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
  Example: "AgencyQueueSummary"

- `Identifer` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `Identifer.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `Identifer.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `ReservationIdentifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `Queue` (array, required)

- `Queue.value` (integer)
  Example: 23

- `Queue.pccOverride` (string)
  Example: "0XS4"

- `Queue.category` (string)

- `Queue.date` (string)

- `Queue.dateOffset` (integer)

## Response 200 fields (application/json):

- `AgencyQueueResponse` (object)
  Agency queue response including QueueList

- `AgencyQueueResponse.@type` (string, required)
  Example: "response"

- `AgencyQueueResponse.AgencyQueue` (object)

- `AgencyQueueResponse.AgencyQueue.@type` (string, required)
  Example: "AgencyQueueSummary"

- `AgencyQueueResponse.AgencyQueue.Identifer` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `AgencyQueueResponse.AgencyQueue.ReservationIdentifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `AgencyQueueResponse.AgencyQueue.Queue` (array, required)

- `AgencyQueueResponse.AgencyQueue.QueueList` (array)

- `AgencyQueueResponse.AgencyQueue.QueueList.@type` (string, required)
  Discriminator QueueList only.
  Example: "QueueList"

- `AgencyQueueResponse.AgencyQueue.QueueList.Name` (string, required)
  The lead traveler in the reservation.
  Example: "1SMITH ADT/ROBERT C MR"

- `AgencyQueueResponse.AgencyQueue.QueueList.Locator` (object, required)
  Locator information for the reservation. Contains the locator (PNR or external locator) or cancellation number for the reservation, order, or offer.

- `AgencyQueueResponse.AgencyQueue.QueueList.Locator.value` (string)
  "Reference number for locatorType.
  Booking.com returns a PIN number along with the confirmation number for each sold hotel segment. If the agent/traveler needs to reconcile the booking with Booking.com, Booking.com requires both the PIN number and confirmation number to locate the segment in their system."
  Example: "ZXG25P"

- `AgencyQueueResponse.AgencyQueue.QueueList.Locator.locatorType` (string)
  Specifies the type of reservation ID
  Travelport - Confirmation number; PNR locator Agency - IATA Number Booking.com - Confirmation number; PIN number
  In Document History, may return the content source (e.g. GDS or NDC)
  Example: "Confirmation Number"

- `AgencyQueueResponse.AgencyQueue.QueueList.Locator.source` (string)
  "Content source. Typically a two-character Supplier code that indicates the source system which generated the resid.
  For Hotels, if source matches chain code, the offer is directly with the supplier. If source is 'BO', the offer is with Booking.com."
  Example: "1G"

- `AgencyQueueResponse.AgencyQueue.QueueList.Locator.sourceContext` (string)
  Specifies the context of the source. Either Travelport, Agency, or Supplier.
  Example: "Travelport"

- `AgencyQueueResponse.AgencyQueue.QueueList.Locator.otaType` (string)
  Used for codes
  Example: "14.UIT"

- `AgencyQueueResponse.AgencyQueue.QueueList.Locator.creationDate` (string)
  Date created in Travelport or supplier system in YYYY-MM-DD format.
  Example: "2026-03-01"

- `AgencyQueueResponse.AgencyQueue.QueueList.Locator.lastUpdated` (string)
  The date and time stamp the Reservation was last updated.
  Example: "2026-08-07 12:12:00+00:00"

- `AgencyQueueResponse.AgencyQueue.QueueList.TravelDate` (string)
  The first date of travel in the reservation.
  Example: "2025-10-25"

- `AgencyQueueResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `AgencyQueueResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `AgencyQueueResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `AgencyQueueResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `AgencyQueueResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `AgencyQueueResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `AgencyQueueResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `AgencyQueueResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `AgencyQueueResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `AgencyQueueResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `AgencyQueueResponse.Result.Error.NameValuePair` (array)

- `AgencyQueueResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `AgencyQueueResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `AgencyQueueResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `AgencyQueueResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `AgencyQueueResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `AgencyQueueResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `AgencyQueueResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `AgencyQueueResponse.Result.Warning.NameValuePair` (array)

- `AgencyQueueResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `AgencyQueueResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `AgencyQueueResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `AgencyQueueResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `AgencyQueueResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `AgencyQueueResponse.NextSteps.NextStep` (array, required)

- `AgencyQueueResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `AgencyQueueResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `AgencyQueueResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `AgencyQueueResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `AgencyQueueResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `AgencyQueueResponse.ReferenceList` (array)

- `AgencyQueueResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `AgencyQueueResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `AgencyQueueResponse.CurrencyRateConversion` (array)

- `AgencyQueueResponse.CurrencyRateConversion.@type` (string)

- `AgencyQueueResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `AgencyQueueResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `AgencyQueueResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `AgencyQueueResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `AgencyQueueResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `AgencyQueueResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `AgencyQueueResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `AgencyQueueResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `AgencyQueueResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `AgencyQueueResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `AgencyQueueResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `AgencyQueueResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `AgencyQueueResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `AgencyQueueResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `AgencyQueueResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `AgencyQueueResponse.Pagination.totalItems` (integer, required)
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
