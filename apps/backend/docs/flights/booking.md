# Booking

Reference and full payload booking workflows.

## Host profile move

- [PUT /air/book/profile/reservationworkbench/{identifier}/clientprofile](https://developer.travelport.com/apis/flights/booking/clientprofilemove.md): Functionality to move client profile information into the Reservation workbench. Release

## Add offer reference payload

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromcatalogproductofferings](https://developer.travelport.com/apis/flights/booking/workbenchbuildfromcatalogproductofferings.md): Use the Add Offer reference payload request to add an offer to the reservation workbench as part of the booking workflow. The reference payload request sends identifiers from the Search response instead of full itinerary details. NDC supports only the reference payload. For GDS, you can send either a reference payload or a full payload.

## Single payload booking

- [POST /air/book/reservation/reservations/build](https://developer.travelport.com/apis/flights/booking/buildreservation.md): As an alternative to the booking workflow that takes place in a workbench session, you can send all booking details and commit a single payload to create a booking. The single payload book request does not support any of the optional steps in the booking workflow, such as adding seats or ancillaries.

## Add offer full payload

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromproducts](https://developer.travelport.com/apis/flights/booking/workbenchbuildfromproducts.md): Use the Add Offer full payload request to add an offer to the reservation workbench as part of the booking workflow. The full payload request sends full itinerary details instead of identifiers from the Search response as in the reference payload request. Full payload is not supported for NDC; use the reference payload instead. For GDS, you can send either a reference payload or a full payload.

## Auto price/ Manual Fare

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromunpricedsegments](https://developer.travelport.com/apis/flights/booking/buildfromunpricedsegments.md)

## Unpriced segment

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/unpricedsegments](https://developer.travelport.com/apis/flights/booking/addunpricedsegments.md): Use the Unpriced Segment API in either the booking or post-booking workflow to add an unpriced segment to the workbench. You can send the Unpriced Segment request instead of the Add Offer API in the booking workflow. Or, to add both an unpriced segment and an offer, you can send both Unpriced Segment and Add Offer. Unpriced Segment adds flight/s as unpriced segments instead of as an offer, which is by definition priced.Unpriced segments can be priced using the offers/buildfromunpricedsegments API. GDS content only. NDC does not support unpriced segments.

## Add auxiliary segments

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/customauxiliarysegments](https://developer.travelport.com/apis/flights/booking/addauxiliarysegments.md)

## Add multiple travelers

- [POST /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers/list](https://developer.travelport.com/apis/flights/booking/addtravelers.md)

## Add single traveler

- [POST /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers](https://developer.travelport.com/apis/flights/booking/addtraveler.md): Send the Add Traveler request to add a traveler to the reservation workbench. You must add each traveler to the workbench in a separate POST request. Traveler information can include traveler name and contact details, add traveler-specific remarks including certain SSRs and travel documents such as a passport.

# Host profile move

Functionality to move client profile information into the Reservation workbench. Release

Endpoint: PUT /air/book/profile/reservationworkbench/{identifier}/clientprofile
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `identifier` (string, required)
  The ReservationWorkbench Identifier you wish to move the client profile to
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

- `ClientProfileMoveHeaderModifiers` (object, required)

- `ClientProfileMoveHeaderModifiers.BusinessTitle` (string, required)
  The name of the corporation/business account the profile is associated to
  Example: "ABCCORP"

- `ClientProfileMoveHeaderModifiers.PersonalTitle` (string)
  The name of the Traveler the profile is associated to
  Example: "SMITH/J"

- `ClientProfileMoveHeaderModifiers.MultipleIndicator` (boolean)
  If true, Indicates the move is a multiple level Client File move. For example, you can move only a Personal File (single), or you can move the Personal, Business, and Agency Files (multiple).

- `ClientProfileMoveHeaderModifiers.SelectIndicator` (boolean)
  If true, Indicates this is a select line move. If false or blank move all lines

- `ClientProfileMoveHeaderModifiers.MergeIndicator` (boolean)
  Indicates how any associated TravelScreen Preferences should be activated at the time of the Client File Move. If true, merged preferences will be moved. If false of blank, normal preferences will be moved.

- `ClientProfileMoveHeaderModifiers.RelatedMoveIndicator` (string)
  Indicates the passenger and segment relation for the related move. Value set to Y indicates relation move required. Value set to P indicates Passenger Number is to be used when moving Secure Flight data.
  Example: "Y"

- `ClientProfileMoveHeaderModifiers.ProfilePCC` (string)
  If profile PCC is included as a modifier, this will override the requesting PCC

- `ClientProfileMoveLineModifiers` (array)

- `ClientProfileMoveLineModifiers.LineNumber` (integer, required)
  Line Number
  Example: 3

- `ClientProfileMoveLineModifiers.AppendedData` (string)
  Data to be appended to the above Client File line
  Example: "15MAY"

- `ClientProfileMoveTravelerFlightModifiers` (array)

- `ClientProfileMoveTravelerFlightModifiers.TravelerRef` (string, required)
  The Traveler ref to associate related lines of the client profile
  Example: "t1"

- `ClientProfileMoveTravelerFlightModifiers.FlightRef` (string)
  The Flight ref to associate the related lines of the client profile
  Example: "s1"

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

## Response 204 fields

# Add offer reference payload

Use the Add Offer reference payload request to add an offer to the reservation workbench as part of the booking workflow. The reference payload request sends identifiers from the Search response instead of full itinerary details. NDC supports only the reference payload. For GDS, you can send either a reference payload or a full payload.

Endpoint: POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromcatalogproductofferings
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

# Single payload booking

As an alternative to the booking workflow that takes place in a workbench session, you can send all booking details and commit a single payload to create a booking. The single payload book request does not support any of the optional steps in the booking workflow, such as adding seats or ancillaries.

Endpoint: POST /air/book/reservation/reservations/build
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

- `ReservationQueryBuild` (object)
  Used for a Create Hotel Reservation (Reference Payload) request. Defines a request to create a hotel reservation using selected hotel offer data together with traveler and payment details. This request typically follows Hotel Availability, Rules, or SearchComplete and is sent to finalize a booking. If the price or guarantee type changes from the preceding response, the request may need to be sent again with the applicable acceptance indicator.

- `ReservationQueryBuild.@type` (string, required)
  Discriminator classes ReservationQueryBuild only
  Example: "ReservationQueryBuild"

- `ReservationQueryBuild.ReservationBuild` (object, required)
  Defines the reservation build details used to create a hotel reservation from a cached offer, including traveler, payment, and related booking details.

- `ReservationQueryBuild.ReservationBuild.@type` (string, required)
  Discriminator classes ReservationBuildFromCatalogOffering, ReservationBuildFromCatalogOfferings, ReservationBuildfromCatalogOfferingsAir, ReservationBuildFromCatalogProductOfferings, ReservationBuildFromProducts, ReservationBuildVehicle
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

## Response 201 fields (application/json):

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

# Add offer full payload

Use the Add Offer full payload request to add an offer to the reservation workbench as part of the booking workflow. The full payload request sends full itinerary details instead of identifiers from the Search response as in the reference payload request. Full payload is not supported for NDC; use the reference payload instead. For GDS, you can send either a reference payload or a full payload.

Endpoint: POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromproducts
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

# Auto price/ Manual Fare

Endpoint: POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromunpricedsegments
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The reservation workbench identifier you wish to add the offer to.
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
  Discriminator OfferQueryBuildFromUnpricedSegments only.
  Example: "OfferQueryBuildFromUnpricedSegments"

- `BuildFromUnpricedSegments` (array, required)

- `BuildFromUnpricedSegments.@type` (string, required)
  Discriminator property BuildFromUnpricedSegmentsAutoPrice or BuildFromUnpricedSegmentsManualPrice.
  Example: "BuildFromUnpricedSegments"

- `BuildFromUnpricedSegments.UnpricedFlightSegmentCriteria` (array, required)

- `BuildFromUnpricedSegments.UnpricedFlightSegmentCriteria.@type` (string, required)
  Discriminator property UnpricedFlightSegmentCriteria only.
  Example: "UnpricedFlightSegmentCriteria"

- `BuildFromUnpricedSegments.UnpricedFlightSegmentCriteria.UnpricedFlightSegmentRefs` (array, required)
  Select the unpriced flight segments to build the offer.
  Example: "s1"

- `BuildFromUnpricedSegments.UnpricedFlightSegmentCriteria.Sequence` (integer)
  Use sequence when assigning preference to a specific leg of the journey or when using manual price. When assigning a sequence only one UnpricedSegmentRef can be entered. Send an array of UnpricedFlightSegmentCriteria when using multiple sequence.
  Example: 1

- `BuildFromUnpricedSegments.UnpricedFlightSegmentCriteria.TravelerRefs` (array)
  The traveler you wish to create an Offer for. If blank, all travelers will be included in the Offer.
  Example: "traveler_1"

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

# Unpriced segment

Use the Unpriced Segment API in either the booking or post-booking workflow to add an unpriced segment to the workbench. You can send the Unpriced Segment request instead of the Add Offer API in the booking workflow. Or, to add both an unpriced segment and an offer, you can send both Unpriced Segment and Add Offer. Unpriced Segment adds flight/s as unpriced segments instead of as an offer, which is by definition priced.Unpriced segments can be priced using the offers/buildfromunpricedsegments API. GDS content only. NDC does not support unpriced segments.

Endpoint: POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/unpricedsegments
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The reservation workbench identifier to add unpriced segments to.
  Example: "382c74c3-721d-4f34-80e5-57657b6cbc27"

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
  Discriminator. No child classes available.
  Example: "UnpricedSegments"

- `UnpricedFlightSegment` (array, required)

- `UnpricedFlightSegment.@type` (string, required)
  Example: "UnpricedFlightsegment"

- `UnpricedFlightSegment.id` (string)
  Local identifier within a given message for this FlightSegment
  Example: "unpricedSegment_1"

- `UnpricedFlightSegment.sequence` (integer, required)
  Sequence of the leg of the segment.
  Example: 1

- `UnpricedFlightSegment.connectionDuration` (string)
  The actual duration of the connecting FlightSegment
  Example: "PT2H30M"

- `UnpricedFlightSegment.passengerQuantity` (integer)
  Number of passengers on this segment.
  Example: 2

- `UnpricedFlightSegment.cabin` (string)
  Specifies the cabin type (e.g. first, business, economy). If sent for Flight Specific Search, this field is ignored.
  Enum: "PremiumFirst", "First", "Business", "PremiumEconomy", "Economy"

- `UnpricedFlightSegment.classOfService` (string)
  Class of service of the segment.
  Example: "Y"

- `UnpricedFlightSegment.amenityRefs` (array)
  List of amenity references for this flight
  Example: ["amenity_1"]

- `UnpricedFlightSegment.universalProductAttributeRefs` (array)
  List of universal product attributes for this flight.
  Example: "upa_1"

- `UnpricedFlightSegment.passiveSegmentStatus` (string)
  If the segment is to be sold as passive enter the passive segment status. AK supplier message sent upon cancel only, BK supplier message sent on book and cancel, YK Information only, no supplier message sent, segment cannot be priced or ticketed.
  Example: "AK"

- `UnpricedFlightSegment.IntermediateStopAmenities` (array)

- `UnpricedFlightSegment.IntermediateStopAmenities.@type` (string, required)
  Discriminator. No child classes.
  Example: "IntermediateStopAmenities"

- `UnpricedFlightSegment.IntermediateStopAmenities.departureLocation` (string, required)
  The departure location.
  Example: "NYC"

- `UnpricedFlightSegment.IntermediateStopAmenities.arrivalLocation` (string, required)
  The arrival location.
  Example: "DEN"

- `UnpricedFlightSegment.IntermediateStopAmenities.amenityRefs` (array)
  List of amenity references for this portion of the flight.
  Example: ["amenity_1"]

- `UnpricedFlightSegment.IntermediateStopAmenities.universalProductAttributeRefs` (array)
  List of UPA references for this portion of the flight.
  Example: ["upa_1"]

- `UnpricedFlightSegment.OperationalStatus` (object)
  The operational status of the flight

- `UnpricedFlightSegment.OperationalStatus.value` (string)
  List of operational flight status
  Enum: "FlightBoarding", "FlightCancelled", "FlightDeparted", "FlightPastScheduledDeparture", "NotAvailableUseSearch"

- `UnpricedFlightSegment.Flight` (object, required)
  Flight common schema. Used across Air workflow.

- `UnpricedFlightSegment.Flight.@type` (string, required)
  Discriminator. Child classes Flight and FlightDetail.
  Example: "FlightDetail"

- `UnpricedFlightSegment.Flight.id` (string)
  Local id within a given message to support referencing this object.
  Example: "126"

- `UnpricedFlightSegment.Flight.FlightRef` (string)
  Reference id that corresponds to the flight 'id' in ReferenceListFlight.Flight.
  Example: "s1"

- `UnpricedFlightSegment.Flight.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `UnpricedFlightSegment.Flight.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `UnpricedFlightSegment.Flight.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `UnpricedFlightSegment.Co2Actual` (object)
  The actual CO2 emissions of this flight. Measured in kilograms.

- `UnpricedFlightSegment.Co2Actual.value` (number)
  Example: 2.22

- `UnpricedFlightSegment.Co2Actual.measurementType` (string)
  The type of measurement such as width, height, weight
  Enum: "Width", "Height", "Depth", "Weight", "OverallDimension"

- `UnpricedFlightSegment.Co2Actual.unit` (string)
  The unit of measure in a code format. Refer to OpenTravel Code List Unit of Measure Code (UOM).
  Enum: "Miles", "Kilometers", "Meters", "Millimeters", "Centimeters", "Yards", "Feet", "Inches", "Pixels", "Block", "Megabytes", "Gigabytes", "Square feet", "Square meters", "Pounds", "Kilograms", "Square inch", "Square yard", "Acre", "Square millimeter", "Square centimeter", "Hectare", "Ounce", "Gram", "Gallons", "Liters", "Kilowatts", "Cubic meters"

- `UnpricedFlightSegment.boundFlightInd` (boolean)
  If present and true, the Segments in this Connection are married.

## Response 200 fields (application/json):

- `UnpricedSegmentsResponse` (object)
  The response of an UnpricedSegment add request.

- `UnpricedSegmentsResponse.UnpricedSegments` (object)
  Top level object for request. Top level container object for response.

- `UnpricedSegmentsResponse.@type` (string)
  Example: "response"

- `UnpricedSegmentsResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `UnpricedSegmentsResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `UnpricedSegmentsResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `UnpricedSegmentsResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `UnpricedSegmentsResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `UnpricedSegmentsResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `UnpricedSegmentsResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `UnpricedSegmentsResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `UnpricedSegmentsResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `UnpricedSegmentsResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `UnpricedSegmentsResponse.Result.Error.NameValuePair` (array)

- `UnpricedSegmentsResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `UnpricedSegmentsResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `UnpricedSegmentsResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `UnpricedSegmentsResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `UnpricedSegmentsResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `UnpricedSegmentsResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `UnpricedSegmentsResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `UnpricedSegmentsResponse.Result.Warning.NameValuePair` (array)

- `UnpricedSegmentsResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `UnpricedSegmentsResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `UnpricedSegmentsResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `UnpricedSegmentsResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `UnpricedSegmentsResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `UnpricedSegmentsResponse.NextSteps.NextStep` (array, required)

- `UnpricedSegmentsResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `UnpricedSegmentsResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `UnpricedSegmentsResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `UnpricedSegmentsResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `UnpricedSegmentsResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `UnpricedSegmentsResponse.ReferenceList` (array)

- `UnpricedSegmentsResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `UnpricedSegmentsResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `UnpricedSegmentsResponse.CurrencyRateConversion` (array)

- `UnpricedSegmentsResponse.CurrencyRateConversion.@type` (string)

- `UnpricedSegmentsResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `UnpricedSegmentsResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `UnpricedSegmentsResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `UnpricedSegmentsResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `UnpricedSegmentsResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `UnpricedSegmentsResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `UnpricedSegmentsResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `UnpricedSegmentsResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `UnpricedSegmentsResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `UnpricedSegmentsResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `UnpricedSegmentsResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `UnpricedSegmentsResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `UnpricedSegmentsResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `UnpricedSegmentsResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `UnpricedSegmentsResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `UnpricedSegmentsResponse.Pagination.totalItems` (integer, required)
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

# Add auxiliary segments

Endpoint: POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/customauxiliarysegments
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The reservation workbench identifier to add unpriced segments to.
  Example: "382c74c3-721d-4f34-80e5-57657b6cbc27"

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

- `CustomAuxiliarySegment` (array, required)
  Add TUR/SUR auxiliary segments.

- `CustomAuxiliarySegment.@type` (string, required)
  Discriminator classes CustomAuxiliarySegmentID or CustomAuxiliarySegment
  Example: "CustomAuxiliarySegment"

- `CustomAuxiliarySegment.id` (string)
  Custom Auxiliary segment reference ID.
  Example: "aux_001"

- `CustomAuxiliarySegment.customAuxiliarySegmentRef` (string)

- `CustomAuxiliarySegment.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CustomAuxiliarySegment.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `CustomAuxiliarySegment.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `CustomAuxiliarySegment.SegmentType` (string, required)
  The auxiliary segment type. SUR, TUR
  Example: "TUR"

- `CustomAuxiliarySegment.SupplierCode` (string, required)
  The supplier code application to this segment.
  Example: "YY"

- `CustomAuxiliarySegment.StatusCode` (string, required)
  Example: "BK"

- `CustomAuxiliarySegment.Quantity` (integer, required)
  The quantity of services provided for this auxiliary segment.
  Example: 1

- `CustomAuxiliarySegment.Location` (string, required)
  Three character IATA location code relevant to the auxiliary segment.
  Example: "LON"

- `CustomAuxiliarySegment.Date` (string, required)
  The local date relevant to the auxiliary segment.

- `CustomAuxiliarySegment.CustomTextQualifier` (string)
  Text qualifier such as DO for drop off.
  Example: "DO"

- `CustomAuxiliarySegment.CustomText` (string)
  Custom text relevant to this auxiliary segment.

## Response 200 fields (application/json):

- `CustomAuxiliarySegmentResponse` (object)
  The response of a Custom Auxiliary Segment add or update request.

- `CustomAuxiliarySegmentResponse.CustomAuxiliarySegments` (array)

- `CustomAuxiliarySegmentResponse.CustomAuxiliarySegments.@type` (string, required)
  Discriminator classes CustomAuxiliarySegmentID or CustomAuxiliarySegment
  Example: "CustomAuxiliarySegment"

- `CustomAuxiliarySegmentResponse.CustomAuxiliarySegments.id` (string)
  Custom Auxiliary segment reference ID.
  Example: "aux_001"

- `CustomAuxiliarySegmentResponse.CustomAuxiliarySegments.customAuxiliarySegmentRef` (string)

- `CustomAuxiliarySegmentResponse.CustomAuxiliarySegments.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CustomAuxiliarySegmentResponse.@type` (string)
  Example: "response"

- `CustomAuxiliarySegmentResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `CustomAuxiliarySegmentResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `CustomAuxiliarySegmentResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `CustomAuxiliarySegmentResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `CustomAuxiliarySegmentResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `CustomAuxiliarySegmentResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `CustomAuxiliarySegmentResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `CustomAuxiliarySegmentResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `CustomAuxiliarySegmentResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `CustomAuxiliarySegmentResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `CustomAuxiliarySegmentResponse.Result.Error.NameValuePair` (array)

- `CustomAuxiliarySegmentResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `CustomAuxiliarySegmentResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `CustomAuxiliarySegmentResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `CustomAuxiliarySegmentResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CustomAuxiliarySegmentResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `CustomAuxiliarySegmentResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `CustomAuxiliarySegmentResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `CustomAuxiliarySegmentResponse.Result.Warning.NameValuePair` (array)

- `CustomAuxiliarySegmentResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CustomAuxiliarySegmentResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CustomAuxiliarySegmentResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `CustomAuxiliarySegmentResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `CustomAuxiliarySegmentResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `CustomAuxiliarySegmentResponse.NextSteps.NextStep` (array, required)

- `CustomAuxiliarySegmentResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `CustomAuxiliarySegmentResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `CustomAuxiliarySegmentResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `CustomAuxiliarySegmentResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `CustomAuxiliarySegmentResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `CustomAuxiliarySegmentResponse.ReferenceList` (array)

- `CustomAuxiliarySegmentResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `CustomAuxiliarySegmentResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CustomAuxiliarySegmentResponse.CurrencyRateConversion` (array)

- `CustomAuxiliarySegmentResponse.CurrencyRateConversion.@type` (string)

- `CustomAuxiliarySegmentResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CustomAuxiliarySegmentResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CustomAuxiliarySegmentResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CustomAuxiliarySegmentResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CustomAuxiliarySegmentResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CustomAuxiliarySegmentResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CustomAuxiliarySegmentResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CustomAuxiliarySegmentResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `CustomAuxiliarySegmentResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CustomAuxiliarySegmentResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `CustomAuxiliarySegmentResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `CustomAuxiliarySegmentResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `CustomAuxiliarySegmentResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `CustomAuxiliarySegmentResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `CustomAuxiliarySegmentResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `CustomAuxiliarySegmentResponse.Pagination.totalItems` (integer, required)
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

# Add multiple travelers

Endpoint: POST /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers/list
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier that you wish to add Travelers to
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

- `Traveler` (array, required)

- `Traveler.@type` (string, required)
  Discriminator classes TravelerID or Traveler
  Example: "Traveler"

- `Traveler.id` (string)

- `Traveler.TravelerRef` (string)

- `Traveler.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `Traveler.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `Traveler.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `Traveler.birthDate` (string)
  Date of Birth YYYY-MM-DD
  Example: "2021-06-05"

- `Traveler.gender` (string)
  Gender Type Male, Female etc. This field is not used by Hotel APIs and will be ignored.
  Enum: "Male", "Female", "Unknown", "Undisclosed"

- `Traveler.PersonName` (object, required)
  Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

- `Traveler.PersonName.@type` (string, required)
  Discriminator classes PersonName or PersonNameDetail
  Example: "PersonNameDetail"

- `Traveler.PersonName.Prefix` (string)
  Salutation of honorific (e.g. Mr., Mrs., Ms., Miss, Dr.)
  Example: "Mr"

- `Traveler.PersonName.Given` (string)
  Given name, first name or names.
  Example: "John"

- `Traveler.PersonName.Middle` (string)
  The middle name of the person name.
  Example: "Erick"

- `Traveler.PersonName.Surname` (string, required)
  Family name, last name.
  Example: "Smith"

- `Traveler.Address` (array)

- `Traveler.Address.@type` (string, required)
  Discriminator classes include Address or AddressDetail
  Example: "AddressDetail"

- `Traveler.Address.id` (string)
  unique address id
  Example: "Address_1"

- `Traveler.Address.BldgRoom` (object)
  Address with building and room number

- `Traveler.Address.BldgRoom.value` (string)
  Example: "Moore House"

- `Traveler.Address.BldgRoom.buldingInd` (boolean)
  When true, the information is a building name. When false, it is an apartment or room #
  Example: true

- `Traveler.Address.Number` (object)
  The street number alone is the numerical number that precedes the street name in the address.

- `Traveler.Address.Number.value` (string)
  Street number value.
  Example: "23B"

- `Traveler.Address.Number.streetNmbrSuffix` (string)
  Street Number Suffix
  Example: "B"

- `Traveler.Address.Number.streetDirection` (string)
  Direction of the Street
  Example: "NW"

- `Traveler.Address.Number.ruralRouteNmbr` (string)
  RuralRoute Number
  Example: "76"

- `Traveler.Address.Number.po_Box` (string)
  PO Box Number
  Example: "1001"

- `Traveler.Address.Street` (string)
  Street name. May also contain the street number when the Number element is missing.
  Example: "ABC Street"

- `Traveler.Address.AddressLine` (array)
  Property street address. Used in place of Street and Number. Each element of the array represents an address line.
  Example: ["2035 S Havana street"]

- `Traveler.Address.City` (string, required)
  Full name of the city, town, or postal station (i.e., a postal service territory, often used in a military address).
  Example: "Dublin"

- `Traveler.Address.County` (string)
  County or Region Name.
  Example: "Berkshire"

- `Traveler.Address.StateProv` (object)
  The standard code or abbreviation for the state, province, or region. May also include full length name.

- `Traveler.Address.StateProv.value` (string)
  State, province, or region code needed to identify location (typically two characters).
  Example: "CA"

- `Traveler.Address.StateProv.name` (string)
  State, province, or region name needed to identify location.
  Example: "California"

- `Traveler.Address.Country` (object)
  Contains the information needed to identify a country.

- `Traveler.Address.Country.value` (string)
  The ISO 3166 code for the property's address.
  Example: "US"

- `Traveler.Address.Country.id` (string)
  Custom user-assigned identifier for the country.
  Example: "23"

- `Traveler.Address.Country.name` (string)
  The full name of the country for the property's address.
  Example: "United States"

- `Traveler.Address.Country.codeContext` (string)
  The source of a code, such as the organization that provided the id number
  Example: "IATA"

- `Traveler.Address.PostalCode` (string)
  Postal code for the address.
  Example: "Sl6 1AB"

- `Traveler.Address.Addressee` (string)
  The name of the company or person to be addressed
  Example: "ACME INC"

- `Traveler.Address.role` (string)
  Defines the type of location the address is assigned to. For TravelAgency address leave blank or use "Other".
  Enum: "Home", "Business", "Mailing", "Delivery", "Destination", "Other", "Billing"

- `Traveler.Telephone` (array)

- `Traveler.Telephone.@type` (string, required)
  Discriminator classes Telephone or TelephoneDetail
  Example: "Telephone"

- `Traveler.Telephone.countryAccessCode` (string)
  Phone country code
  Example: "1"

- `Traveler.Telephone.areaCityCode` (string)
  Phone local area code
  Example: "972"

- `Traveler.Telephone.phoneNumber` (string, required)
  Mobile/Telephone Number. Accepted characters are numeric, dash, space, and period.
  Example: "972-000-787"

- `Traveler.Telephone.extension` (string)
  Telephone extension number
  Example: "234"

- `Traveler.Telephone.id` (string)
  Optional internally referenced id
  Example: "3"

- `Traveler.Telephone.cityCode` (string)
  IATA city code if referenced by phone number.
  Example: "DEN"

- `Traveler.Telephone.role` (string)
  Defines the type of location the Telephone is assigned to. For Travel Agency telephone select "Other" or leave blank.
  Enum: "Mobile", "Home", "Work", "Office", "Fax", "Other"

- `Traveler.Email` (array)

- `Traveler.Email.value` (string)
  Example: "exampledomain@example.com"

- `Traveler.Email.id` (string)
  Electronic email addresses, in IETF specified format.
  Example: "email_1"

- `Traveler.Email.emailType` (string)
  Use email type to specify if the email is to be sent "TO" or sent "FROM"
  Example: "FROM"

- `Traveler.Email.comment` (string)
  Comments associated to the email

- `Traveler.Email.preferredFormat` (string)
  Mime media type
  Example: "text/html"

- `Traveler.Email.shareMarketing` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `Traveler.Email.shareSync` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `Traveler.Email.optOutInd` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `Traveler.Email.optInStatus` (string)
  Used to indicate marketing preferences, OptIn, OptOut
  Enum: "OptedIn", "OptedOut", "Unknown"

- `Traveler.Email.optInDate` (string)
  The datetime of receiving the opt in notice
  Example: "2026-03-03 11:11:00+00:00"

- `Traveler.Email.optOutDate` (string)
  The datetime the opt out notice was received
  Example: "2026-03-03 11:11:00+00:00"

- `Traveler.Email.validInd` (boolean)
  If true, this is a valid email address that has been system verified via a successful email transmission.
  Example: true

- `Traveler.Email.provisionedInd` (boolean)
  If true then the email address came from the provisioning process
  Example: true

- `Traveler.passengerTypeCode` (string)
  Passenger type code
  Example: "CHD"

- `Traveler.nationality` (string)
  Nationality on country code ISO
  Example: "AL"

- `Traveler.age` (integer)
  The age of the traveller at the time of travel
  Example: 13

- `Traveler.CustomerLoyalty` (array)

- `Traveler.CustomerLoyalty.value` (string, required)
  Number on loyalty card.
  Example: "132456"

- `Traveler.CustomerLoyalty.id` (string)
  Optional Customer Loyalty Id. Not saved
  Example: "Loyalty_1"

- `Traveler.CustomerLoyalty.priority` (integer)
  Optional Numeric Priority Code
  Example: 2

- `Traveler.CustomerLoyalty.programId` (string)
  "Specifies an identifier to indicate the company owner of the loyalty program. Typically two characters.
  For frequent guest number, the hotel supplier or brand code.
  For frequent flyer number, the air supplier code of the loyalty program."
  Example: "United"

- `Traveler.CustomerLoyalty.programName` (string)
  Supplier's loyalty program name.
  Example: "Frontier-EarlyReturns"

- `Traveler.CustomerLoyalty.supplierType` (string)
  The type of supplier of a loyalty program. Uses 'hotel' for frequent guest number or 'air' for frequent flyer number.
  Example: "Airline"

- `Traveler.CustomerLoyalty.supplier` (string, required)
  Supplier of a loyalty program (typically 2 characters representing the hotel, brand, or airline).
  Example: "UA"

- `Traveler.CustomerLoyalty.tier` (string)
  Customer Loyalty tier
  Example: "Silver"

- `Traveler.CustomerLoyalty.shareWithSupplier` (array)
  The list of suppliers that the CustomerLoyalty number is shared. Used for cross accrual.
  Example: ["LH"]

- `Traveler.CustomerLoyalty.cardHolderName` (string)
  Customer loyalty member name; up to 128 characters are supported. In Air Search, for discounted offers to be returned, the name must be sent as LAST FIRST; e.g.,if SMITH is the last name and JORDAN the first name, send as SMITH JORDAN
  Example: "John Smith"

- `Traveler.CustomerLoyalty.validatedInd` (boolean)
  Customer loyalty number has been validated by the supplier
  Example: true

- `Traveler.CustomerLoyalty.prefix` (string)
  The cardholder name prefix title like Mr, Mrs, Dr
  Example: "Dr"

- `Traveler.CustomerLoyalty.given` (string)
  The First Name of the Cardholder
  Example: "John"

- `Traveler.CustomerLoyalty.middle` (string)
  Middle Name of the Cardholder
  Example: "Wilkinson"

- `Traveler.CustomerLoyalty.surname` (string)
  Last Name of the Cardholder
  Example: "Smith"

- `Traveler.AlternateContact` (array)

- `Traveler.AlternateContact.@type` (string)
  Example: "AlternateContact"

- `Traveler.AlternateContact.id` (string)

- `Traveler.AlternateContact.contactType` (string)
  Contact type value
  Example: "Relative"

- `Traveler.AlternateContact.relation` (string)
  Relation value
  Example: "Mother"

- `Traveler.AlternateContact.PersonName` (object, required)
  Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

- `Traveler.AlternateContact.Address` (array)

- `Traveler.AlternateContact.Telephone` (array)

- `Traveler.AlternateContact.Email` (array)

- `Traveler.AlternateContact.emergencyInd` (boolean)
  This is the contact in case of an emergency
  Example: true

- `Traveler.AlternateContact.defaultInd` (boolean)
  This is the default contact
  Example: true

- `Traveler.TravelDocument` (array)

- `Traveler.TravelDocument.@type` (string, required)
  Discriminator classes TravelDocument or TravelDocumentDetail
  Example: "TravelDocumentDetail"

- `Traveler.TravelDocument.docNumber` (string)
  Document number value
  Example: "B37201"

- `Traveler.TravelDocument.docType` (string)
  Codes from OTA DOC - Document Type
  Enum: "Visa", "Passport", "MilitaryIdentification", "DriversLicense", "NationalIdentityDocument", "VaccinationCertificate", "AlienRegistrationNumber", "InsurancePolicyNumber", "TaxExemptionNumber", "VehicleRegistrationLicenseNumber", "BoderCrossingCard", "RefugeeTravelDocument", "PilotsLicense", "PermanentResidentCard", "RedressNumber", "KnownTravelerNumber", "Non-Standard", "MerchantNumber", "AirNexusCard", "CrewMemberCertificate", "PassportCard", "NaturalizationCertificate", "TicketNumber", "LargeFamilyDiscountCard", "IdentityCardTypeA", "IdentityCardTypeC", "IdentityCardTypeI"

- `Traveler.TravelDocument.issueDate` (string)
  Date of Issue
  Example: "2002-10-13"

- `Traveler.TravelDocument.expireDate` (string)
  Date of expiration
  Example: "2002-11-13"

- `Traveler.TravelDocument.stateProvCode` (string)
  State Province Code value
  Example: "44"

- `Traveler.TravelDocument.placeOfIssue` (string)
  Place of issue value
  Example: "Birmingham"

- `Traveler.TravelDocument.issueCountry` (string)
  Issue country on Country Code ISO
  Example: "CA"

- `Traveler.TravelDocument.birthDate` (string)
  The date of birth of the document holder
  Example: "1995-04-22"

- `Traveler.TravelDocument.birthCountry` (string)
  Birth country on Country Code ISO value
  Example: "AR"

- `Traveler.TravelDocument.birthPlace` (string)
  Birth place value
  Example: "Ontario"

- `Traveler.TravelDocument.residence` (string)
  Residence value
  Example: "1st section 8th st"

- `Traveler.TravelDocument.id` (string)
  Locally referenced id
  Example: "34"

- `Traveler.TravelDocument.Gender` (string, required)
  Gender Type Male, Female etc. This field is not used by Hotel APIs and will be ignored.
  Enum: "Male", "Female", "Unknown", "Undisclosed"

- `Traveler.TravelDocument.Nationality` (string)
  Specifies a 2 character country code as defined in ISO3166.
  Example: "BR"

- `Traveler.TravelDocument.PersonName` (object, required)
  Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

- `Traveler.Comments` (object)
  Comments object to relay text information

- `Traveler.Comments.@type` (string)
  Example: "Comments"

- `Traveler.Comments.Comment` (array)

- `Traveler.Comments.Comment.value` (string)
  Actual text. May be restricted by character limits based on the type of comment (e.g. Notepad remarks limited to 87 characters).
  Example: "Additional comments"

- `Traveler.Comments.Comment.id` (string)
  Local identifier within a given message for this object.
  Example: "comment_1"

- `Traveler.Comments.Comment.name` (string)
  Title of comment or type of remark.
  Example: "Comment name"

- `Traveler.Comments.Comment.language` (string)
  Language code using ISO-639 standard
  Example: "EN"

- `Traveler.RailDiscountCard` (array)

- `Traveler.RailDiscountCard.value` (string)
  Example: "Rail1234546"

- `Traveler.RailDiscountCard.supplierCode` (string, required)
  Code of the Supplier
  Example: "Enco"

- `Traveler.RailDiscountCard.referenceNumber` (string)
  ReferenceNumber
  Example: "134256"

- `Traveler.accompaniedByInfantInd` (boolean)
  Example: true

## Response 201 fields (application/json):

- `TravelerListResponse` (object)
  The response of a Document Overrides endpoint request.

- `TravelerListResponse.TravelerID` (array)

- `TravelerListResponse.TravelerID.@type` (string, required)
  Discriminator classes TravelerID or Traveler
  Example: "Traveler"

- `TravelerListResponse.TravelerID.id` (string)

- `TravelerListResponse.TravelerID.TravelerRef` (string)

- `TravelerListResponse.TravelerID.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelerListResponse.@type` (string)
  Example: "response"

- `TravelerListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `TravelerListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `TravelerListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `TravelerListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `TravelerListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `TravelerListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `TravelerListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `TravelerListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `TravelerListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `TravelerListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `TravelerListResponse.Result.Error.NameValuePair` (array)

- `TravelerListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `TravelerListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `TravelerListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `TravelerListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `TravelerListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `TravelerListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `TravelerListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `TravelerListResponse.Result.Warning.NameValuePair` (array)

- `TravelerListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `TravelerListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelerListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `TravelerListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `TravelerListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `TravelerListResponse.NextSteps.NextStep` (array, required)

- `TravelerListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `TravelerListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `TravelerListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `TravelerListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `TravelerListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `TravelerListResponse.ReferenceList` (array)

- `TravelerListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `TravelerListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `TravelerListResponse.CurrencyRateConversion` (array)

- `TravelerListResponse.CurrencyRateConversion.@type` (string)

- `TravelerListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TravelerListResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `TravelerListResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `TravelerListResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `TravelerListResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `TravelerListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TravelerListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `TravelerListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `TravelerListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `TravelerListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `TravelerListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `TravelerListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `TravelerListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `TravelerListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `TravelerListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `TravelerListResponse.Pagination.totalItems` (integer, required)
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

# Add single traveler

Send the Add Traveler request to add a traveler to the reservation workbench. You must add each traveler to the workbench in a separate POST request. Traveler information can include traveler name and contact details, add traveler-specific remarks including certain SSRs and travel documents such as a passport.

Endpoint: POST /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to add the Traveler information to
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
  Discriminator classes TravelerID or Traveler
  Example: "Traveler"

- `id` (string)

- `TravelerRef` (string)

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

- `birthDate` (string)
  Date of Birth YYYY-MM-DD
  Example: "2021-06-05"

- `gender` (string)
  Gender Type Male, Female etc. This field is not used by Hotel APIs and will be ignored.
  Enum: "Male", "Female", "Unknown", "Undisclosed"

- `PersonName` (object, required)
  Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

- `PersonName.@type` (string, required)
  Discriminator classes PersonName or PersonNameDetail
  Example: "PersonNameDetail"

- `PersonName.Prefix` (string)
  Salutation of honorific (e.g. Mr., Mrs., Ms., Miss, Dr.)
  Example: "Mr"

- `PersonName.Given` (string)
  Given name, first name or names.
  Example: "John"

- `PersonName.Middle` (string)
  The middle name of the person name.
  Example: "Erick"

- `PersonName.Surname` (string, required)
  Family name, last name.
  Example: "Smith"

- `Address` (array)

- `Address.@type` (string, required)
  Discriminator classes include Address or AddressDetail
  Example: "AddressDetail"

- `Address.id` (string)
  unique address id
  Example: "Address_1"

- `Address.BldgRoom` (object)
  Address with building and room number

- `Address.BldgRoom.value` (string)
  Example: "Moore House"

- `Address.BldgRoom.buldingInd` (boolean)
  When true, the information is a building name. When false, it is an apartment or room #
  Example: true

- `Address.Number` (object)
  The street number alone is the numerical number that precedes the street name in the address.

- `Address.Number.value` (string)
  Street number value.
  Example: "23B"

- `Address.Number.streetNmbrSuffix` (string)
  Street Number Suffix
  Example: "B"

- `Address.Number.streetDirection` (string)
  Direction of the Street
  Example: "NW"

- `Address.Number.ruralRouteNmbr` (string)
  RuralRoute Number
  Example: "76"

- `Address.Number.po_Box` (string)
  PO Box Number
  Example: "1001"

- `Address.Street` (string)
  Street name. May also contain the street number when the Number element is missing.
  Example: "ABC Street"

- `Address.AddressLine` (array)
  Property street address. Used in place of Street and Number. Each element of the array represents an address line.
  Example: ["2035 S Havana street"]

- `Address.City` (string, required)
  Full name of the city, town, or postal station (i.e., a postal service territory, often used in a military address).
  Example: "Dublin"

- `Address.County` (string)
  County or Region Name.
  Example: "Berkshire"

- `Address.StateProv` (object)
  The standard code or abbreviation for the state, province, or region. May also include full length name.

- `Address.StateProv.value` (string)
  State, province, or region code needed to identify location (typically two characters).
  Example: "CA"

- `Address.StateProv.name` (string)
  State, province, or region name needed to identify location.
  Example: "California"

- `Address.Country` (object)
  Contains the information needed to identify a country.

- `Address.Country.value` (string)
  The ISO 3166 code for the property's address.
  Example: "US"

- `Address.Country.id` (string)
  Custom user-assigned identifier for the country.
  Example: "23"

- `Address.Country.name` (string)
  The full name of the country for the property's address.
  Example: "United States"

- `Address.Country.codeContext` (string)
  The source of a code, such as the organization that provided the id number
  Example: "IATA"

- `Address.PostalCode` (string)
  Postal code for the address.
  Example: "Sl6 1AB"

- `Address.Addressee` (string)
  The name of the company or person to be addressed
  Example: "ACME INC"

- `Address.role` (string)
  Defines the type of location the address is assigned to. For TravelAgency address leave blank or use "Other".
  Enum: "Home", "Business", "Mailing", "Delivery", "Destination", "Other", "Billing"

- `Telephone` (array)

- `Telephone.@type` (string, required)
  Discriminator classes Telephone or TelephoneDetail
  Example: "Telephone"

- `Telephone.countryAccessCode` (string)
  Phone country code
  Example: "1"

- `Telephone.areaCityCode` (string)
  Phone local area code
  Example: "972"

- `Telephone.phoneNumber` (string, required)
  Mobile/Telephone Number. Accepted characters are numeric, dash, space, and period.
  Example: "972-000-787"

- `Telephone.extension` (string)
  Telephone extension number
  Example: "234"

- `Telephone.id` (string)
  Optional internally referenced id
  Example: "3"

- `Telephone.cityCode` (string)
  IATA city code if referenced by phone number.
  Example: "DEN"

- `Telephone.role` (string)
  Defines the type of location the Telephone is assigned to. For Travel Agency telephone select "Other" or leave blank.
  Enum: "Mobile", "Home", "Work", "Office", "Fax", "Other"

- `Email` (array)

- `Email.value` (string)
  Example: "exampledomain@example.com"

- `Email.id` (string)
  Electronic email addresses, in IETF specified format.
  Example: "email_1"

- `Email.emailType` (string)
  Use email type to specify if the email is to be sent "TO" or sent "FROM"
  Example: "FROM"

- `Email.comment` (string)
  Comments associated to the email

- `Email.preferredFormat` (string)
  Mime media type
  Example: "text/html"

- `Email.shareMarketing` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `Email.shareSync` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `Email.optOutInd` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `Email.optInStatus` (string)
  Used to indicate marketing preferences, OptIn, OptOut
  Enum: "OptedIn", "OptedOut", "Unknown"

- `Email.optInDate` (string)
  The datetime of receiving the opt in notice
  Example: "2026-03-03 11:11:00+00:00"

- `Email.optOutDate` (string)
  The datetime the opt out notice was received
  Example: "2026-03-03 11:11:00+00:00"

- `Email.validInd` (boolean)
  If true, this is a valid email address that has been system verified via a successful email transmission.
  Example: true

- `Email.provisionedInd` (boolean)
  If true then the email address came from the provisioning process
  Example: true

- `passengerTypeCode` (string)
  Passenger type code
  Example: "CHD"

- `nationality` (string)
  Nationality on country code ISO
  Example: "AL"

- `age` (integer)
  The age of the traveller at the time of travel
  Example: 13

- `CustomerLoyalty` (array)

- `CustomerLoyalty.value` (string, required)
  Number on loyalty card.
  Example: "132456"

- `CustomerLoyalty.id` (string)
  Optional Customer Loyalty Id. Not saved
  Example: "Loyalty_1"

- `CustomerLoyalty.priority` (integer)
  Optional Numeric Priority Code
  Example: 2

- `CustomerLoyalty.programId` (string)
  "Specifies an identifier to indicate the company owner of the loyalty program. Typically two characters.
  For frequent guest number, the hotel supplier or brand code.
  For frequent flyer number, the air supplier code of the loyalty program."
  Example: "United"

- `CustomerLoyalty.programName` (string)
  Supplier's loyalty program name.
  Example: "Frontier-EarlyReturns"

- `CustomerLoyalty.supplierType` (string)
  The type of supplier of a loyalty program. Uses 'hotel' for frequent guest number or 'air' for frequent flyer number.
  Example: "Airline"

- `CustomerLoyalty.supplier` (string, required)
  Supplier of a loyalty program (typically 2 characters representing the hotel, brand, or airline).
  Example: "UA"

- `CustomerLoyalty.tier` (string)
  Customer Loyalty tier
  Example: "Silver"

- `CustomerLoyalty.shareWithSupplier` (array)
  The list of suppliers that the CustomerLoyalty number is shared. Used for cross accrual.
  Example: ["LH"]

- `CustomerLoyalty.cardHolderName` (string)
  Customer loyalty member name; up to 128 characters are supported. In Air Search, for discounted offers to be returned, the name must be sent as LAST FIRST; e.g.,if SMITH is the last name and JORDAN the first name, send as SMITH JORDAN
  Example: "John Smith"

- `CustomerLoyalty.validatedInd` (boolean)
  Customer loyalty number has been validated by the supplier
  Example: true

- `CustomerLoyalty.prefix` (string)
  The cardholder name prefix title like Mr, Mrs, Dr
  Example: "Dr"

- `CustomerLoyalty.given` (string)
  The First Name of the Cardholder
  Example: "John"

- `CustomerLoyalty.middle` (string)
  Middle Name of the Cardholder
  Example: "Wilkinson"

- `CustomerLoyalty.surname` (string)
  Last Name of the Cardholder
  Example: "Smith"

- `AlternateContact` (array)

- `AlternateContact.@type` (string)
  Example: "AlternateContact"

- `AlternateContact.id` (string)

- `AlternateContact.contactType` (string)
  Contact type value
  Example: "Relative"

- `AlternateContact.relation` (string)
  Relation value
  Example: "Mother"

- `AlternateContact.PersonName` (object, required)
  Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

- `AlternateContact.Address` (array)

- `AlternateContact.Telephone` (array)

- `AlternateContact.Email` (array)

- `AlternateContact.emergencyInd` (boolean)
  This is the contact in case of an emergency
  Example: true

- `AlternateContact.defaultInd` (boolean)
  This is the default contact
  Example: true

- `TravelDocument` (array)

- `TravelDocument.@type` (string, required)
  Discriminator classes TravelDocument or TravelDocumentDetail
  Example: "TravelDocumentDetail"

- `TravelDocument.docNumber` (string)
  Document number value
  Example: "B37201"

- `TravelDocument.docType` (string)
  Codes from OTA DOC - Document Type
  Enum: "Visa", "Passport", "MilitaryIdentification", "DriversLicense", "NationalIdentityDocument", "VaccinationCertificate", "AlienRegistrationNumber", "InsurancePolicyNumber", "TaxExemptionNumber", "VehicleRegistrationLicenseNumber", "BoderCrossingCard", "RefugeeTravelDocument", "PilotsLicense", "PermanentResidentCard", "RedressNumber", "KnownTravelerNumber", "Non-Standard", "MerchantNumber", "AirNexusCard", "CrewMemberCertificate", "PassportCard", "NaturalizationCertificate", "TicketNumber", "LargeFamilyDiscountCard", "IdentityCardTypeA", "IdentityCardTypeC", "IdentityCardTypeI"

- `TravelDocument.issueDate` (string)
  Date of Issue
  Example: "2002-10-13"

- `TravelDocument.expireDate` (string)
  Date of expiration
  Example: "2002-11-13"

- `TravelDocument.stateProvCode` (string)
  State Province Code value
  Example: "44"

- `TravelDocument.placeOfIssue` (string)
  Place of issue value
  Example: "Birmingham"

- `TravelDocument.issueCountry` (string)
  Issue country on Country Code ISO
  Example: "CA"

- `TravelDocument.birthDate` (string)
  The date of birth of the document holder
  Example: "1995-04-22"

- `TravelDocument.birthCountry` (string)
  Birth country on Country Code ISO value
  Example: "AR"

- `TravelDocument.birthPlace` (string)
  Birth place value
  Example: "Ontario"

- `TravelDocument.residence` (string)
  Residence value
  Example: "1st section 8th st"

- `TravelDocument.id` (string)
  Locally referenced id
  Example: "34"

- `TravelDocument.Gender` (string, required)
  Gender Type Male, Female etc. This field is not used by Hotel APIs and will be ignored.
  Enum: "Male", "Female", "Unknown", "Undisclosed"

- `TravelDocument.Nationality` (string)
  Specifies a 2 character country code as defined in ISO3166.
  Example: "BR"

- `TravelDocument.PersonName` (object, required)
  Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

- `Comments` (object)
  Comments object to relay text information

- `Comments.@type` (string)
  Example: "Comments"

- `Comments.Comment` (array)

- `Comments.Comment.value` (string)
  Actual text. May be restricted by character limits based on the type of comment (e.g. Notepad remarks limited to 87 characters).
  Example: "Additional comments"

- `Comments.Comment.id` (string)
  Local identifier within a given message for this object.
  Example: "comment_1"

- `Comments.Comment.name` (string)
  Title of comment or type of remark.
  Example: "Comment name"

- `Comments.Comment.language` (string)
  Language code using ISO-639 standard
  Example: "EN"

- `RailDiscountCard` (array)

- `RailDiscountCard.value` (string)
  Example: "Rail1234546"

- `RailDiscountCard.supplierCode` (string, required)
  Code of the Supplier
  Example: "Enco"

- `RailDiscountCard.referenceNumber` (string)
  ReferenceNumber
  Example: "134256"

- `accompaniedByInfantInd` (boolean)
  Example: true

## Response 200 fields (application/json):

- `TravelerResponse` (object)
  The response of a Traveler endpoint request.

- `TravelerResponse.Traveler` (object)
  Traveler Identifier object.

- `TravelerResponse.Traveler.@type` (string)
  Example: "TravelerIdentifier"

- `TravelerResponse.Traveler.id` (string)

- `TravelerResponse.Traveler.TravelerRef` (string)

- `TravelerResponse.Traveler.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelerResponse.@type` (string)
  Example: "response"

- `TravelerResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `TravelerResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `TravelerResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `TravelerResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `TravelerResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `TravelerResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `TravelerResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `TravelerResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `TravelerResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `TravelerResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `TravelerResponse.Result.Error.NameValuePair` (array)

- `TravelerResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `TravelerResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `TravelerResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `TravelerResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `TravelerResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `TravelerResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `TravelerResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `TravelerResponse.Result.Warning.NameValuePair` (array)

- `TravelerResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `TravelerResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelerResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `TravelerResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `TravelerResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `TravelerResponse.NextSteps.NextStep` (array, required)

- `TravelerResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `TravelerResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `TravelerResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `TravelerResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `TravelerResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `TravelerResponse.ReferenceList` (array)

- `TravelerResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `TravelerResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `TravelerResponse.CurrencyRateConversion` (array)

- `TravelerResponse.CurrencyRateConversion.@type` (string)

- `TravelerResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TravelerResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `TravelerResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `TravelerResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `TravelerResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `TravelerResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `TravelerResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `TravelerResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `TravelerResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `TravelerResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `TravelerResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `TravelerResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `TravelerResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `TravelerResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `TravelerResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `TravelerResponse.Pagination.totalItems` (integer, required)
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
