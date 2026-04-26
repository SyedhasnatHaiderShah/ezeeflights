# Ticketing

Issuing tickets including form of payment and payment.

## Post commit workbench

- [POST /air/book/session/reservationworkbench/buildfromlocator](https://developer.travelport.com/apis/flights/workbench-actions/createreservationworkbenchfromlocator.md): Initiate a post-commit workbench to create a session for ticketing or updating an existing reservation. This is a prerequisite step for any transaction that modifies, updates, or tickets any PNR.

## Workbench commit

- [POST /air/book/reservation/reservations/{Identifier}](https://developer.travelport.com/apis/flights/workbench-actions/commitreservation.md): After all required and any optional steps in a booking workbench session, send a POST request with the workbench identifier to commit the workbench. The resulting actions depend on whether payment is present in the workbench. If no Add Payment request has been sent, committing the workbench books the itinerary and generates a PNR. If an Add Payment request has not been sent, committing the workbench tickets the itinerary and generates ticket number/s.

## Post commit workbench

- [POST /air/book/session/reservationworkbench/buildfromlocator](https://developer.travelport.com/apis/flights/ticketing/createreservationworkbenchfromlocator.md): Initiate a post-commit workbench to create a session for ticketing or updating an existing reservation. This is a prerequisite step for any transaction that modifies, updates, or tickets any PNR.

## Workbench commit

- [POST /air/book/reservation/reservations/{Identifier}](https://developer.travelport.com/apis/flights/ticketing/commitreservation.md): After all required and any optional steps in a booking workbench session, send a POST request with the workbench identifier to commit the workbench. The resulting actions depend on whether payment is present in the workbench. If no Add Payment request has been sent, committing the workbench books the itinerary and generates a PNR. If an Add Payment request has not been sent, committing the workbench tickets the itinerary and generates ticket number/s.

## Add form of payment

- [POST /air/payment/reservationworkbench/{ReservationResource_Identifier}/formofpayment](https://developer.travelport.com/apis/flights/ticketing/addformofpayment.md): You can send an Add Form of Payment (FOP) request in either a booking or ticketing workbench session. FOPs of cash and credit are supported. FOPs of agent invoice and non-standard credit card are supported for GDS only.

## Update form of payment

- [PUT /air/payment/reservationworkbench/{ReservationResource_Identifier}/formofpayment/{Identifier}](https://developer.travelport.com/apis/flights/ticketing/updateformofpayment.md): Update a Form Of Payment with new information

## Delete form of payment

- [DELETE /air/payment/reservationworkbench/{ReservationResource_Identifier}/formofpayment/{Identifier}](https://developer.travelport.com/apis/flights/ticketing/deleteformofpayment.md): Delete a Form Of Payment

## Add payment

- [POST /air/paymentoffer/reservationworkbench/{ReservationResource_Identifier}/payments](https://developer.travelport.com/apis/flights/ticketing/addpayment.md): The Payment step takes place in a ticketing workbench session and applies the payment sent previously in the Form of Payment request to the offer/s specified in the Payment request payload. Payment can be sent for any type of offer, including air, seats, and ancillaries. Payment can be made for multiple offers and multiple types of offers in the same request. Form of payment information must either already be present in the reservation or the workbench. At workbench commit, tickets or EMDs are issued for any offer payment has been sent for. Payment is also required prior to ticketing when exchanging tickets in the case of an even exchange, or an add collect (price of new itinerary is greater than existing itinerary). In the case of an add collect, send Payment with a zero amount in Amount/value. See the Exchange, Refund, and Void Guide for details.

## Ticket Retrieve

- [POST /air/ticket/tickets/getbylocator](https://developer.travelport.com/apis/flights/ticketing/ticketgetbylocator.md)

## Ticket display

- [GET /air/ticket/tickets/{Identifier}](https://developer.travelport.com/apis/flights/ticketing/getticket.md): GDS only. To retrieve an NDC ticket use the Ticket Retrieve API. This API duplicates functionality available in the more recently released Ticket Retrieve API, which for GDS can retrieve a single or multiple tickets.

## Single ticket void

- [PUT /air/ticket/tickets/updatestatus/{Identifier}](https://developer.travelport.com/apis/flights/ticketing/updateticket.md): Use the TicketVoid API to void a GDS ticket. Generally a ticket can be voided only within the same day it was issued. See Basic Concepts above for limitations. At this time AirTicketing does not support canceling a GDS itinerary outside the void period.

## Batch void

- [POST /documents/void](https://developer.travelport.com/apis/flights/ticketing/documentvoid.md): The Batch Void API voids multiple documents, including Tickets, EMDs and MCOs on a single booking. You can either void all documents of a specific type (ticket, EMD, or MCO), or send a list of individual ticket or document numbers to void. All tickets and/or documents must be on the same booking. This function is not supported for NDC or LCC. TASF void will be supported as a future enhancement.

## Ticket Retrieve

- [POST /air/ticket/tickets/getbylocator](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/ticketgetbylocator.md)

## Ticket display

- [GET /air/ticket/tickets/{Identifier}](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/getticket.md): GDS only. To retrieve an NDC ticket use the Ticket Retrieve API. This API duplicates functionality available in the more recently released Ticket Retrieve API, which for GDS can retrieve a single or multiple tickets.

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

# Add form of payment

You can send an Add Form of Payment (FOP) request in either a booking or ticketing workbench session. FOPs of cash and credit are supported. FOPs of agent invoice and non-standard credit card are supported for GDS only.

Endpoint: POST /air/payment/reservationworkbench/{ReservationResource_Identifier}/formofpayment
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to add form of payment to
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

## Query parameters:

- `authorizePaymentInd` (boolean)
  If true payment card approval will be obtained.

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
  Discriminator classes FormOfPaymentID, FormOfPaymentBSP, FormOfPaymentCash, FormOfPaymentCheck, FormOfPaymentDocument, FormOfPaymentFlightPass, FormOfPaymentForfeit, FormOfPaymentInvoice, FormOfPaymentPaymentCard, FormOfPaymentVirtualPaymentAccount, FormOfPaymentWaiverCode
  Example: "FormOfPaymentPaymentCard"

- `id` (string)
  Form of Payment reference ID.

- `FormOfPaymentRef` (string)

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

- `FormOfPaymentResponse` (object)
  The response of a Form of payment endpoint request.

- `FormOfPaymentResponse.FormOfPayment` (object)
  The Travelport-assigned identifier for the FOP used for purchase.

- `FormOfPaymentResponse.FormOfPayment.@type` (string)
  Example: "FormOfPaymentPaymentCash"

- `FormOfPaymentResponse.FormOfPayment.id` (string)
  Form of payment identifier reference ID.

- `FormOfPaymentResponse.FormOfPayment.FormOfPaymentRef` (string)

- `FormOfPaymentResponse.FormOfPayment.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FormOfPaymentResponse.@type` (string)
  Example: "response"

- `FormOfPaymentResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `FormOfPaymentResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `FormOfPaymentResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `FormOfPaymentResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `FormOfPaymentResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `FormOfPaymentResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `FormOfPaymentResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `FormOfPaymentResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `FormOfPaymentResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `FormOfPaymentResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `FormOfPaymentResponse.Result.Error.NameValuePair` (array)

- `FormOfPaymentResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `FormOfPaymentResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `FormOfPaymentResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `FormOfPaymentResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `FormOfPaymentResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `FormOfPaymentResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `FormOfPaymentResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `FormOfPaymentResponse.Result.Warning.NameValuePair` (array)

- `FormOfPaymentResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `FormOfPaymentResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FormOfPaymentResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `FormOfPaymentResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `FormOfPaymentResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `FormOfPaymentResponse.NextSteps.NextStep` (array, required)

- `FormOfPaymentResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `FormOfPaymentResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `FormOfPaymentResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `FormOfPaymentResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `FormOfPaymentResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `FormOfPaymentResponse.ReferenceList` (array)

- `FormOfPaymentResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `FormOfPaymentResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `FormOfPaymentResponse.CurrencyRateConversion` (array)

- `FormOfPaymentResponse.CurrencyRateConversion.@type` (string)

- `FormOfPaymentResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `FormOfPaymentResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `FormOfPaymentResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `FormOfPaymentResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `FormOfPaymentResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `FormOfPaymentResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `FormOfPaymentResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `FormOfPaymentResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `FormOfPaymentResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `FormOfPaymentResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `FormOfPaymentResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `FormOfPaymentResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `FormOfPaymentResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `FormOfPaymentResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `FormOfPaymentResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `FormOfPaymentResponse.Pagination.totalItems` (integer, required)
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

# Update form of payment

Update a Form Of Payment with new information

Endpoint: PUT /air/payment/reservationworkbench/{ReservationResource_Identifier}/formofpayment/{Identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier that includes the form of payment you want to update.

- `Identifier` (string, required)
  The form of payment identifier you wish to update.

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
  Discriminator classes FormOfPaymentID, FormOfPaymentBSP, FormOfPaymentCash, FormOfPaymentCheck, FormOfPaymentDocument, FormOfPaymentFlightPass, FormOfPaymentForfeit, FormOfPaymentInvoice, FormOfPaymentPaymentCard, FormOfPaymentVirtualPaymentAccount, FormOfPaymentWaiverCode
  Example: "FormOfPaymentPaymentCard"

- `id` (string)
  Form of Payment reference ID.

- `FormOfPaymentRef` (string)

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

- `FormOfPaymentResponse` (object)
  The response of a Form of payment endpoint request.

- `FormOfPaymentResponse.FormOfPayment` (object)
  The Travelport-assigned identifier for the FOP used for purchase.

- `FormOfPaymentResponse.FormOfPayment.@type` (string)
  Example: "FormOfPaymentPaymentCash"

- `FormOfPaymentResponse.FormOfPayment.id` (string)
  Form of payment identifier reference ID.

- `FormOfPaymentResponse.FormOfPayment.FormOfPaymentRef` (string)

- `FormOfPaymentResponse.FormOfPayment.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FormOfPaymentResponse.@type` (string)
  Example: "response"

- `FormOfPaymentResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `FormOfPaymentResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `FormOfPaymentResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `FormOfPaymentResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `FormOfPaymentResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `FormOfPaymentResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `FormOfPaymentResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `FormOfPaymentResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `FormOfPaymentResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `FormOfPaymentResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `FormOfPaymentResponse.Result.Error.NameValuePair` (array)

- `FormOfPaymentResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `FormOfPaymentResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `FormOfPaymentResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `FormOfPaymentResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `FormOfPaymentResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `FormOfPaymentResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `FormOfPaymentResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `FormOfPaymentResponse.Result.Warning.NameValuePair` (array)

- `FormOfPaymentResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `FormOfPaymentResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `FormOfPaymentResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `FormOfPaymentResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `FormOfPaymentResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `FormOfPaymentResponse.NextSteps.NextStep` (array, required)

- `FormOfPaymentResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `FormOfPaymentResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `FormOfPaymentResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `FormOfPaymentResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `FormOfPaymentResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `FormOfPaymentResponse.ReferenceList` (array)

- `FormOfPaymentResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `FormOfPaymentResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `FormOfPaymentResponse.CurrencyRateConversion` (array)

- `FormOfPaymentResponse.CurrencyRateConversion.@type` (string)

- `FormOfPaymentResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `FormOfPaymentResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `FormOfPaymentResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `FormOfPaymentResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `FormOfPaymentResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `FormOfPaymentResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `FormOfPaymentResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `FormOfPaymentResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `FormOfPaymentResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `FormOfPaymentResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `FormOfPaymentResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `FormOfPaymentResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `FormOfPaymentResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `FormOfPaymentResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `FormOfPaymentResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `FormOfPaymentResponse.Pagination.totalItems` (integer, required)
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

# Delete form of payment

Delete a Form Of Payment

Endpoint: DELETE /air/payment/reservationworkbench/{ReservationResource_Identifier}/formofpayment/{Identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier that includes the form of payment you want to delete

- `Identifier` (string, required)
  The form of payment identifier you wish to update.

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

# Add payment

The Payment step takes place in a ticketing workbench session and applies the payment sent previously in the Form of Payment request to the offer/s specified in the Payment request payload. Payment can be sent for any type of offer, including air, seats, and ancillaries. Payment can be made for multiple offers and multiple types of offers in the same request. Form of payment information must either already be present in the reservation or the workbench. At workbench commit, tickets or EMDs are issued for any offer payment has been sent for. Payment is also required prior to ticketing when exchanging tickets in the case of an even exchange, or an add collect (price of new itinerary is greater than existing itinerary). In the case of an add collect, send Payment with a zero amount in Amount/value. See the Exchange, Refund, and Void Guide for details.

Endpoint: POST /air/paymentoffer/reservationworkbench/{ReservationResource_Identifier}/payments
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to add the payment to
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

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
  Discriminator classes PaymentID or Payment
  Example: "Payment"

- `id` (string)
  Customer-assigned identifier for the payment.

- `PaymentRef` (string)
  Customer-assigned name for the payment.

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

- `Amount` (object, required)
  A monetary amount, up to 4 decimal places. Decimal place must be included.

- `Amount.value` (number)
  The amount of a given currency.
  Example: 124.56

- `Amount.code` (string)
  An ISO 4217 alpha character code (3 characters) that specifies a money unit.
  Example: "USD"

- `Amount.minorUnit` (integer)
  Minor units are a mechanism for expressing the relationship between a major currency unit and its corresponding minor currency unit.
  Example: 2

- `Amount.currencySource` (string)
  The system requesting or returning the currency code specified in the attribute
  Enum: "Supplier", "Charged", "Requested"

- `Amount.approximateInd` (boolean)
  "If true, the currency amount has been converted from the original amount.
  For Hotel Availability and Rules, true indicates this is a calculated value; false indicates this is the value returned by the property."
  Example: true

- `FormOfPaymentIdentifier` (object)
  The Travelport-assigned identifier for the FOP used for purchase.

- `FormOfPaymentIdentifier.@type` (string)
  Example: "FormOfPaymentPaymentCash"

- `FormOfPaymentIdentifier.id` (string)
  Form of payment identifier reference ID.

- `FormOfPaymentIdentifier.FormOfPaymentRef` (string)

- `FormOfPaymentIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `OfferIdentifier` (array)

- `OfferIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "offer_1"

- `OfferIdentifier.offerRef` (string)
  Used to reference another instance of this object in the same message
  Example: "offer_1"

- `OfferIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `Fees` (object)
  Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

- `Fees.@type` (string, required)
  Discriminator. Child class FeesDetail
  Example: "FeesDetail"

- `Fees.TotalFees` (number)
  Total fees included in the TotalPrice. Supports up to 4 decimal places; decimal place needs to be included.
  Example: 111.11

- `Fees.TotalAdditionalFeesPayableLocally` (number)
  Fees due separately at the property. Expected to be paid in local currency. These fees are not included in the Offer TotalPrice.
  Example: 2.1

- `Taxes` (object)
  Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

- `Taxes.@type` (string, required)
  Discriminator. Child class is TaxesDetail
  Example: "TaxesDetail"

- `Taxes.TotalTaxes` (number)
  A monetary amount, representing the total of all taxes included in this offer. Supports up to 4 decimal places; decimal place must be included.
  Example: 330.1

- `Taxes.TaxInfo` (array)
  Returned for TripChange APIS only.

- `Taxes.TaxInfo.@type` (string)
  Example: "TaxInfo"

- `Taxes.TaxInfo.TaxCode` (string, required)
  The tax code
  Example: "XF"

- `Taxes.TaxInfo.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `Taxes.TaxInfo.CurrencyCode.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `Taxes.TaxInfo.CurrencyCode.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `Taxes.TaxInfo.CurrencyCode.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `Taxes.TaxInfo.CurrencyCode.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `Taxes.TaxInfo.Amount` (number, required)
  The amount of the tax applied

- `Taxes.TaxInfo.TaxBreakdown` (array, required)
  The breakdown of the tax for this tax code

- `Taxes.TaxInfo.TaxBreakdown.@type` (string)
  Example: "TaxInfo"

- `Taxes.TaxInfo.TaxBreakdown.AirportCode` (string, required)
  The airport location the tax applies to
  Example: "MIA"

- `Taxes.TaxInfo.TaxBreakdown.CurrencyCode` (object)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `Taxes.TaxInfo.TaxBreakdown.Amount` (number)
  The amount of the tax applied

- `TravelerIdentifierRef` (array)

- `TravelerIdentifierRef.name` (string)
  Traveler identifier

- `TravelerIdentifierRef.passengerTypeCode` (string)
  Passenger Type code
  Example: "ADT"

- `TravelerIdentifierRef.ages` (array)
  The ages of the travelers associated to a particular ptc. For NDC, this value will be returned in PriceBreakdownAir if sent as part of the PassengerCriteria in the Air Search request.
  Example: [15]

- `TravelerIdentifierRef.passengerCriteriaRef` (string)
  Allows the user to associate passenger criteria information.
  Example: "passengerCriteria_1"

- `TravelerIdentifierRef.value` (string)

- `TravelerIdentifierRef.id` (string)
  A locally referenced ID

- `TravelerIdentifierRef.description` (string)
  Descriptive text used to identify the contents of a target object

- `TravelerIdentifierRef.uris` (array)
  Uniform Resource Identifier
  Example: ["google.com"]

- `TravelerIdentifierRef.age` (integer)
  Replaced with ages array. The age of the traveler.
  Example: 11

- `BaseAmount` (object)
  A monetary amount, up to 4 decimal places. Decimal place must be included.

- `depositInd` (boolean)
  If true, the payment is a deposit on the referenced Offer; at booking the provided card is charged for deposit or prepay rate.

- `AgencyServiceFeeIdentifier` (array)

- `AgencyServiceFeeIdentifier.id` (string)
  Unique id for this object within a message

- `guaranteeInd` (boolean)
  If true, the payment is a guarantee for the referenced Offer; no amounts are charged at booking; the customer is to make payment in person upon arrival.

- `ExtendedPayment` (object)
  Note this field is deprecated in Payment schema and should be passed in FormOfPaymentPaymentCardExtendPayment schema

- `ExtendedPayment.NumberOfInstallments` (integer, required)
  The number of installment payments to be charged by the payment card provider
  Example: 6

- `ExtendedPayment.FirstInstallment` (number)
  For Pagos Parceledos, specify the first installment amount. This will be the same currency as the payment
  Example: 100

- `ExtendedPayment.RemainingAmount` (number)
  For Pagos Parceledos, specify the remaining amount to be charged that will be spread across the number of installments. This will be the same currency as the payment
  Example: 50

- `ExtendedPayment.OTATOCode` (string)
  For Pagos Parceledos the OTATOCode

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

# Single ticket void

Use the TicketVoid API to void a GDS ticket. Generally a ticket can be voided only within the same day it was issued. See Basic Concepts above for limitations. At this time AirTicketing does not support canceling a GDS itinerary outside the void period.

Endpoint: PUT /air/ticket/tickets/updatestatus/{Identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `Identifier` (string, required)
  The ticket number you wish to update
  Example: "1259900123456"

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
  Example: "TicketQueryUpdateTicket"

- `agencyCode` (string)
  Agency IATA code.

- `dateOfIssue` (string)
  Date the ticket was issued.

- `status` (string, required)
  The status to update the ticket.
  Example: "Void"

## Response 200 fields (application/json):

- `TicketIdResponse` (object)
  The response of a Ticket id endpoint request.

- `TicketIdResponse.@type` (string)
  Example: "response"

- `TicketIdResponse.Ticket` (object)

- `TicketIdResponse.Ticket.@type` (string, required)
  Discriminator classes TicketID, Ticket, TicketSummary or TicketDetail
  Example: "Ticket"

- `TicketIdResponse.Ticket.objID` (string)

- `TicketIdResponse.Ticket.TicketRef` (string)

- `TicketIdResponse.Ticket.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TicketIdResponse.Ticket.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TicketIdResponse.Ticket.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `TicketIdResponse.SettlementAuthorizationCode` (string, required)

- `TicketIdResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `TicketIdResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `TicketIdResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `TicketIdResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `TicketIdResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `TicketIdResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `TicketIdResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `TicketIdResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `TicketIdResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `TicketIdResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `TicketIdResponse.Result.Error.NameValuePair` (array)

- `TicketIdResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `TicketIdResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `TicketIdResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `TicketIdResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `TicketIdResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `TicketIdResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `TicketIdResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `TicketIdResponse.Result.Warning.NameValuePair` (array)

- `TicketIdResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `TicketIdResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TicketIdResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `TicketIdResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `TicketIdResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `TicketIdResponse.NextSteps.NextStep` (array, required)

- `TicketIdResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `TicketIdResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `TicketIdResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `TicketIdResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `TicketIdResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `TicketIdResponse.ReferenceList` (array)

- `TicketIdResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `TicketIdResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `TicketIdResponse.CurrencyRateConversion` (array)

- `TicketIdResponse.CurrencyRateConversion.@type` (string)

- `TicketIdResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TicketIdResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `TicketIdResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `TicketIdResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `TicketIdResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `TicketIdResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TicketIdResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `TicketIdResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `TicketIdResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `TicketIdResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `TicketIdResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `TicketIdResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `TicketIdResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `TicketIdResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `TicketIdResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `TicketIdResponse.Pagination.totalItems` (integer, required)
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

# Batch void

The Batch Void API voids multiple documents, including Tickets, EMDs and MCOs on a single booking. You can either void all documents of a specific type (ticket, EMD, or MCO), or send a list of individual ticket or document numbers to void. All tickets and/or documents must be on the same booking. This function is not supported for NDC or LCC. TASF void will be supported as a future enhancement.

Endpoint: POST /documents/void
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

- `locator` (object, required)
  Locator information for the reservation. Contains the locator (PNR or external locator) or cancellation number for the reservation, order, or offer.

- `locator.value` (string)
  "Reference number for locatorType.
  Booking.com returns a PIN number along with the confirmation number for each sold hotel segment. If the agent/traveler needs to reconcile the booking with Booking.com, Booking.com requires both the PIN number and confirmation number to locate the segment in their system."
  Example: "ZXG25P"

- `locator.locatorType` (string)
  Specifies the type of reservation ID
  Travelport - Confirmation number; PNR locator Agency - IATA Number Booking.com - Confirmation number; PIN number
  In Document History, may return the content source (e.g. GDS or NDC)
  Example: "Confirmation Number"

- `locator.source` (string)
  "Content source. Typically a two-character Supplier code that indicates the source system which generated the resid.
  For Hotels, if source matches chain code, the offer is directly with the supplier. If source is 'BO', the offer is with Booking.com."
  Example: "1G"

- `locator.sourceContext` (string)
  Specifies the context of the source. Either Travelport, Agency, or Supplier.
  Example: "Travelport"

- `locator.otaType` (string)
  Used for codes
  Example: "14.UIT"

- `locator.creationDate` (string)
  Date created in Travelport or supplier system in YYYY-MM-DD format.
  Example: "2026-03-01"

- `locator.lastUpdated` (string)
  The date and time stamp the Reservation was last updated.
  Example: "2026-08-07 12:12:00+00:00"

- `documentVoid` (array, required)

- `documentVoid.documentType` (string, required)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `documentVoid.number` (array)
  Example: ["1259900123456"]

## Response 200 fields (application/json):

- `DocumentVoidListResponse` (object)
  List of void results.

- `DocumentVoidListResponse.documentStatus` (array)

- `DocumentVoidListResponse.documentStatus.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `DocumentVoidListResponse.documentStatus.number` (string)
  Example: "1259900123456"

- `DocumentVoidListResponse.documentStatus.status` (string)
  The status of the document.
  Example: "VOID"

- `DocumentVoidListResponse.@type` (string)
  Example: "response"

- `DocumentVoidListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `DocumentVoidListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `DocumentVoidListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `DocumentVoidListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `DocumentVoidListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `DocumentVoidListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `DocumentVoidListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `DocumentVoidListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `DocumentVoidListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `DocumentVoidListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `DocumentVoidListResponse.Result.Error.NameValuePair` (array)

- `DocumentVoidListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `DocumentVoidListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `DocumentVoidListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `DocumentVoidListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `DocumentVoidListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `DocumentVoidListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `DocumentVoidListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `DocumentVoidListResponse.Result.Warning.NameValuePair` (array)

- `DocumentVoidListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `DocumentVoidListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `DocumentVoidListResponse.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `DocumentVoidListResponse.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `DocumentVoidListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `DocumentVoidListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `DocumentVoidListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `DocumentVoidListResponse.NextSteps.NextStep` (array, required)

- `DocumentVoidListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `DocumentVoidListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `DocumentVoidListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `DocumentVoidListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `DocumentVoidListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `DocumentVoidListResponse.ReferenceList` (array)

- `DocumentVoidListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `DocumentVoidListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `DocumentVoidListResponse.CurrencyRateConversion` (array)

- `DocumentVoidListResponse.CurrencyRateConversion.@type` (string)

- `DocumentVoidListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `DocumentVoidListResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `DocumentVoidListResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `DocumentVoidListResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `DocumentVoidListResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `DocumentVoidListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `DocumentVoidListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `DocumentVoidListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `DocumentVoidListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `DocumentVoidListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `DocumentVoidListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `DocumentVoidListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `DocumentVoidListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `DocumentVoidListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `DocumentVoidListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `DocumentVoidListResponse.Pagination.totalItems` (integer, required)
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
