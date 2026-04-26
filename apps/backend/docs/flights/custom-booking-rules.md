# Custom Booking Rules

Manage custom rules set up for your PCC.

## Custom rule list and details

- [GET /air/book/customrule/customrules](https://developer.travelport.com/apis/flights/custom-booking-rules/getcustomrules.md)

## Custom rule

- [POST /air/book/customrule/customrules/{ReservationWorkbench_Identifier}](https://developer.travelport.com/apis/flights/custom-booking-rules/addcustomrule.md)

## Remove custom rule

- [DELETE /air/book/customrule/customrules/{ReservationWorkbench_Identifier}](https://developer.travelport.com/apis/flights/custom-booking-rules/deletecustomrule.md)

# Custom rule list and details

Endpoint: GET /air/book/customrule/customrules
Version: 11.33.0
Security: bearerAuth

## Query parameters:

- `PCC` (string)
  The owning pcc of the custom rules
  Example: "0XS4"

- `RuleRecordName` (array)
  The name of the rule record for a detail view of the rule. For multiple rules send space delimited list of strings
  Example: ["CORPCODE"]

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

- `CustomRuleResponse` (object)
  The response of a Custom rule endpoint request.

- `CustomRuleResponse.CustomRule` (object, required)

- `CustomRuleResponse.CustomRule.@type` (string, required)
  Discriminator classes CustomRuleID or CustomRule

- `CustomRuleResponse.CustomRule.id` (string)
  Custom rule id reference ID.

- `CustomRuleResponse.CustomRule.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CustomRuleResponse.CustomRule.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `CustomRuleResponse.CustomRule.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `CustomRuleResponse.@type` (string)
  Example: "response"

- `CustomRuleResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `CustomRuleResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `CustomRuleResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `CustomRuleResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `CustomRuleResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `CustomRuleResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `CustomRuleResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `CustomRuleResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `CustomRuleResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `CustomRuleResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `CustomRuleResponse.Result.Error.NameValuePair` (array)

- `CustomRuleResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `CustomRuleResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `CustomRuleResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `CustomRuleResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CustomRuleResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `CustomRuleResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `CustomRuleResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `CustomRuleResponse.Result.Warning.NameValuePair` (array)

- `CustomRuleResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CustomRuleResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CustomRuleResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `CustomRuleResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `CustomRuleResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `CustomRuleResponse.NextSteps.NextStep` (array, required)

- `CustomRuleResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `CustomRuleResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `CustomRuleResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `CustomRuleResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `CustomRuleResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `CustomRuleResponse.ReferenceList` (array)

- `CustomRuleResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `CustomRuleResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CustomRuleResponse.CurrencyRateConversion` (array)

- `CustomRuleResponse.CurrencyRateConversion.@type` (string)

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CustomRuleResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CustomRuleResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CustomRuleResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `CustomRuleResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CustomRuleResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `CustomRuleResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `CustomRuleResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `CustomRuleResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `CustomRuleResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `CustomRuleResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `CustomRuleResponse.Pagination.totalItems` (integer, required)
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

# Custom rule

Endpoint: POST /air/book/customrule/customrules/{ReservationWorkbench_Identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationWorkbench_Identifier` (string, required)
  The unique reservation workbench Identifer from your active workbench session where the custom rules shall be updated
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

## Query parameters:

- `PCC` (string)
  The owning pcc of the custom rules
  Example: "0XS4"

- `RuleRecordName` (array)
  The name of the rule record for a detail view of the rule. For multiple rules send space delimited list of strings
  Example: ["CORPCODE"]

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

## Response 201 fields (application/json):

- `CustomRuleResponse` (object)
  The response of a Custom rule endpoint request.

- `CustomRuleResponse.CustomRule` (object, required)

- `CustomRuleResponse.CustomRule.@type` (string, required)
  Discriminator classes CustomRuleID or CustomRule

- `CustomRuleResponse.CustomRule.id` (string)
  Custom rule id reference ID.

- `CustomRuleResponse.CustomRule.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CustomRuleResponse.CustomRule.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `CustomRuleResponse.CustomRule.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `CustomRuleResponse.@type` (string)
  Example: "response"

- `CustomRuleResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `CustomRuleResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `CustomRuleResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `CustomRuleResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `CustomRuleResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `CustomRuleResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `CustomRuleResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `CustomRuleResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `CustomRuleResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `CustomRuleResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `CustomRuleResponse.Result.Error.NameValuePair` (array)

- `CustomRuleResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `CustomRuleResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `CustomRuleResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `CustomRuleResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CustomRuleResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `CustomRuleResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `CustomRuleResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `CustomRuleResponse.Result.Warning.NameValuePair` (array)

- `CustomRuleResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CustomRuleResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CustomRuleResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `CustomRuleResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `CustomRuleResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `CustomRuleResponse.NextSteps.NextStep` (array, required)

- `CustomRuleResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `CustomRuleResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `CustomRuleResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `CustomRuleResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `CustomRuleResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `CustomRuleResponse.ReferenceList` (array)

- `CustomRuleResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `CustomRuleResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CustomRuleResponse.CurrencyRateConversion` (array)

- `CustomRuleResponse.CurrencyRateConversion.@type` (string)

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CustomRuleResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CustomRuleResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CustomRuleResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `CustomRuleResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CustomRuleResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `CustomRuleResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `CustomRuleResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `CustomRuleResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `CustomRuleResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `CustomRuleResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `CustomRuleResponse.Pagination.totalItems` (integer, required)
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

# Remove custom rule

Endpoint: DELETE /air/book/customrule/customrules/{ReservationWorkbench_Identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationWorkbench_Identifier` (string, required)
  The unique reservation workbench Identifer from your active workbench session where the custom rules shall be updated
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

## Query parameters:

- `PCC` (string)
  The owning pcc of the custom rules
  Example: "0XS4"

- `RuleRecordSequence` (integer)
  The sequence of the rule record to delete a specific rule record. Leave blank to delete all rules.
  Example: 1

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

- `CustomRuleResponse` (object)
  The response of a Custom rule endpoint request.

- `CustomRuleResponse.CustomRule` (object, required)

- `CustomRuleResponse.CustomRule.@type` (string, required)
  Discriminator classes CustomRuleID or CustomRule

- `CustomRuleResponse.CustomRule.id` (string)
  Custom rule id reference ID.

- `CustomRuleResponse.CustomRule.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CustomRuleResponse.CustomRule.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `CustomRuleResponse.CustomRule.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `CustomRuleResponse.@type` (string)
  Example: "response"

- `CustomRuleResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `CustomRuleResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `CustomRuleResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `CustomRuleResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `CustomRuleResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `CustomRuleResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `CustomRuleResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `CustomRuleResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `CustomRuleResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `CustomRuleResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `CustomRuleResponse.Result.Error.NameValuePair` (array)

- `CustomRuleResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `CustomRuleResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `CustomRuleResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `CustomRuleResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CustomRuleResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `CustomRuleResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `CustomRuleResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `CustomRuleResponse.Result.Warning.NameValuePair` (array)

- `CustomRuleResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CustomRuleResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CustomRuleResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `CustomRuleResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `CustomRuleResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `CustomRuleResponse.NextSteps.NextStep` (array, required)

- `CustomRuleResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `CustomRuleResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `CustomRuleResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `CustomRuleResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `CustomRuleResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `CustomRuleResponse.ReferenceList` (array)

- `CustomRuleResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `CustomRuleResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CustomRuleResponse.CurrencyRateConversion` (array)

- `CustomRuleResponse.CurrencyRateConversion.@type` (string)

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CustomRuleResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CustomRuleResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CustomRuleResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CustomRuleResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `CustomRuleResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CustomRuleResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `CustomRuleResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `CustomRuleResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `CustomRuleResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `CustomRuleResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `CustomRuleResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `CustomRuleResponse.Pagination.totalItems` (integer, required)
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
