# Modify Traveler Details

Modify traveler information.

## Update traveler information

- [PUT /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers/updatefromtravelerupdateditems/{id}](https://developer.travelport.com/apis/flights/modify-traveler-details/updatefromtravelerupdateditems.md): The Traveler Update request follows an Updatable Items request and makes a change to one or more items returned in that Updatable Items response. Sent as part of a workbench session, either during the initial booking workflow (workbench not committed, PNR not issued yet) or a post-commit workbench for an existing PNR. It is followed by a workbench commit.

## Traveler updatable items

- [POST /air/book/updateableitem/reservationworkbench/{ReservationResource_Identifier}/travelerupdatableitems/buildfromtraveler](https://developer.travelport.com/apis/flights/modify-traveler-details/buildfromtraveler.md): The Updatable Items request retrieves by traveler ID a list of objects that are updatable for that traveler, and returns for each an indicator for whether that item can be added, modified, or deleted.

## Update traveler information

- [PUT /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers/updatefromtravelerupdateditems/{id}](https://developer.travelport.com/apis/flights/modify-bookings/updatefromtravelerupdateditems.md): The Traveler Update request follows an Updatable Items request and makes a change to one or more items returned in that Updatable Items response. Sent as part of a workbench session, either during the initial booking workflow (workbench not committed, PNR not issued yet) or a post-commit workbench for an existing PNR. It is followed by a workbench commit.

## Traveler updatable items

- [POST /air/book/updateableitem/reservationworkbench/{ReservationResource_Identifier}/travelerupdatableitems/buildfromtraveler](https://developer.travelport.com/apis/flights/modify-bookings/buildfromtraveler.md): The Updatable Items request retrieves by traveler ID a list of objects that are updatable for that traveler, and returns for each an indicator for whether that item can be added, modified, or deleted.

# Update traveler information

The Traveler Update request follows an Updatable Items request and makes a change to one or more items returned in that Updatable Items response. Sent as part of a workbench session, either during the initial booking workflow (workbench not committed, PNR not issued yet) or a post-commit workbench for an existing PNR. It is followed by a workbench commit.

Endpoint: PUT /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers/updatefromtravelerupdateditems/{id}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier that contains the Traveler you wish to update
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `id` (string, required)
  The specific TravelerUpdatableItemsListResponse Identifier
  Example: "59f58f5f-c443-43b4-9f5d-be999fd00a01"

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
  Discriminator classes TravelerQueryUpdate only
  Example: "TravelerQueryUpdate"

- `TravelerUpdatedItem` (array, required)

- `TravelerUpdatedItem.@type` (string, required)
  Discriminator classes TravelerUpdatedItemAddress, TravelerUpdatedItemBirthDate, TravelerUpdatedItemComments, TravelerUpdatedItemCustomerLoyalty, TravelerUpdatedItemEmail, TravelerUpdatedItemGender, TravelerUpdatedItemPersonName, TravelerUpdatedItemTelephone, TravelerUpdatedItemTravelDocument
  Example: "TravelerUpdatedItem"

- `TravelerUpdatedItem.TravelerUpdatableItemID` (string)
  A unique GUID to identify the TravelerUpdatedItem
  Example: "234"

- `TravelerUpdatedItem.addInd` (boolean)
  If true the TravelerUpdatedItem is being added to the Traveler
  Example: true

- `TravelerUpdatedItem.modifyInd` (boolean)
  If true the TravelerUpdatedItem is being modified in the Traveler
  Example: true

- `TravelerUpdatedItem.deleteInd` (boolean)
  If true the TravelerUpdatedItem is being deleted from the Traveler
  Example: true

## Response 200 fields (application/json):

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

## Response 204 fields

# Traveler updatable items

The Updatable Items request retrieves by traveler ID a list of objects that are updatable for that traveler, and returns for each an indicator for whether that item can be added, modified, or deleted.

Endpoint: POST /air/book/updateableitem/reservationworkbench/{ReservationResource_Identifier}/travelerupdatableitems/buildfromtraveler
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier

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
  Discriminator classes TravelerUpdatableItemsQueryBuildFromTraveler only
  Example: "TravelerUpdatableItemsQueryBuildFromTraveler"

- `TravelerIdentifier` (array)
  Example: ["34","65","23","12","22","81"]

## Response 201 fields (application/json):

- `TravelerUpdatableItemsListResponse` (object)
  The response of a Traveler updatable items list endpoint request.

- `TravelerUpdatableItemsListResponse.TravelerUpdatableItemsID` (array)

- `TravelerUpdatableItemsListResponse.TravelerUpdatableItemsID.@type` (string, required)
  Discriminator classes TravelerUpdatableItems only
  Example: "TravelerUpdatableItems"

- `TravelerUpdatableItemsListResponse.TravelerUpdatableItemsID.id` (string)
  Internally reference xsd id
  Example: "523"

- `TravelerUpdatableItemsListResponse.TravelerUpdatableItemsID.TravelerUpdatableItemsRef` (string)

- `TravelerUpdatableItemsListResponse.TravelerUpdatableItemsID.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelerUpdatableItemsListResponse.TravelerUpdatableItemsID.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TravelerUpdatableItemsListResponse.TravelerUpdatableItemsID.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `TravelerUpdatableItemsListResponse.@type` (string)
  Example: "response"

- `TravelerUpdatableItemsListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `TravelerUpdatableItemsListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `TravelerUpdatableItemsListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `TravelerUpdatableItemsListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `TravelerUpdatableItemsListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `TravelerUpdatableItemsListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `TravelerUpdatableItemsListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `TravelerUpdatableItemsListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `TravelerUpdatableItemsListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `TravelerUpdatableItemsListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `TravelerUpdatableItemsListResponse.Result.Error.NameValuePair` (array)

- `TravelerUpdatableItemsListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `TravelerUpdatableItemsListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `TravelerUpdatableItemsListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `TravelerUpdatableItemsListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `TravelerUpdatableItemsListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `TravelerUpdatableItemsListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `TravelerUpdatableItemsListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `TravelerUpdatableItemsListResponse.Result.Warning.NameValuePair` (array)

- `TravelerUpdatableItemsListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `TravelerUpdatableItemsListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelerUpdatableItemsListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `TravelerUpdatableItemsListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `TravelerUpdatableItemsListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `TravelerUpdatableItemsListResponse.NextSteps.NextStep` (array, required)

- `TravelerUpdatableItemsListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `TravelerUpdatableItemsListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `TravelerUpdatableItemsListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `TravelerUpdatableItemsListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `TravelerUpdatableItemsListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `TravelerUpdatableItemsListResponse.ReferenceList` (array)

- `TravelerUpdatableItemsListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `TravelerUpdatableItemsListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `TravelerUpdatableItemsListResponse.CurrencyRateConversion` (array)

- `TravelerUpdatableItemsListResponse.CurrencyRateConversion.@type` (string)

- `TravelerUpdatableItemsListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TravelerUpdatableItemsListResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `TravelerUpdatableItemsListResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `TravelerUpdatableItemsListResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `TravelerUpdatableItemsListResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `TravelerUpdatableItemsListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TravelerUpdatableItemsListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `TravelerUpdatableItemsListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `TravelerUpdatableItemsListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `TravelerUpdatableItemsListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `TravelerUpdatableItemsListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `TravelerUpdatableItemsListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `TravelerUpdatableItemsListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `TravelerUpdatableItemsListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `TravelerUpdatableItemsListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `TravelerUpdatableItemsListResponse.Pagination.totalItems` (integer, required)
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
