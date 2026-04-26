# Remarks and Special Service Requests

Booking remarks including notepad, OSI, and itinerary remarks, and SSRs.

## Document override remarks

- [POST /air/book/documentoverride/Reservation/{ReservationResource_Identifier}/documentoverrides](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/createdocumentoverrides.md): Use document override to send remarks such as tour code, commission, or endorsements/restrictions.Document override remarks are returned in the PNR retrieve only when the detailViewInd query parameter is set to true. Document override remarks can be added to an existing PNR but cannot be modified or deleted; see PNR Modify Guide.

## Accounting remarks

- [POST /air/book/accounting/reservationworkbench/{ReservationResource_Identifier}/accountings](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/createaccounting.md): Accounting remarks are optional remarks that are added to the PNR and typically used by an agency's back office system in some way. The remarks can include ticket numbers, customer or account numbers, fares offered to the customer but refused, and canned remarks that document fare rules. Accounting remarks replace the back office accounting remarks in AirReservation prior to version 11.

## Delete accounting remarks

- [DELETE /air/book/accounting/reservationworkbench/{ReservationResource_Identifier}/accountings/{id}/namevaluepairs](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/deleteaccounting.md)

## Reservation comments (general, itinerary and OSI remarks)

- [POST /air/book/remarks/reservationworkbench/{ReservationResource_Identifier}/reservationcomments/list](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/addreservationcomments.md)

## Delete Reservation Comments

- [DELETE /air/book/remarks/reservationworkbench/{ReservationResource_Identifier}/reservationcomments/{id}/comments](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/deletereservationcomments.md)

## Special service list requests

- [POST /air/book/specialservices/reservationworkbench/{ReservationResource_Identifier}/specialservices/list](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/addspecialservices.md)

## Delete a special service

- [DELETE /air/book/specialservices/reservationworkbench/{ReservationResource_Identifier}/specialservices/{id}](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/deletespecialservices.md)

## Delete multiple special services

- [POST /air/book/specialservices/reservationworkbench/{ReservationResource_Identifier}/specialservices/deletemultiple](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/deletemultiplespecialservices.md)

## Add primary contact remark (SSR CTC)

- [POST /air/book/primarycontact/reservationworkbench/{ReservationResource_Identifier}/primarycontacts](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/addprimarycontact.md)

## Delete primary contact remark

- [DELETE /air/book/primarycontact/reservationworkbench/{ReservationResource_Identifier}/primarycontacts/{id}](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/deleteprimarycontact.md)

# Document override remarks

Use document override to send remarks such as tour code, commission, or endorsements/restrictions.Document override remarks are returned in the PNR retrieve only when the detailViewInd query parameter is set to true. Document override remarks can be added to an existing PNR but cannot be modified or deleted; see PNR Modify Guide.

Endpoint: POST /air/book/documentoverride/Reservation/{ReservationResource_Identifier}/documentoverrides
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to add document overrides
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
  Discriminator classes DocumentOverridesID or DocumentOverrides
  Example: "DocumentOverrides"

- `id` (string)
  The reporting number.
  Example: "documentoverrides_001"

- `DocumentOverridesRef` (string)

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

- `OfferIdentifier` (object)
  Travelport-generated offer identifier number.

- `OfferIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "offer_1"

- `OfferIdentifier.offerRef` (string)
  Used to reference another instance of this object in the same message
  Example: "offer_1"

- `OfferIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `ProductIdentifier` (object)
  Product Identifier class

- `ProductIdentifier.id` (string)
  Local identifier within a given message for this object.
  Example: "product_1"

- `ProductIdentifier.productRef` (string)
  Used to reference another instance of this object in the same payload.
  Example: "product_1"

- `ProductIdentifier.Identifier` (object)
  In next leg search Value from CatalogProductOffering/ProductBrandOptions/ProductBrandOffering/Product/productRef in the Search response for the product to select for the first leg of the itinerary. When sending a second Next Leg Search request in a multi-city search, this value should be the offer for the second leg of the itinerary, and so on for additional O&D pairs.

- `ProductIdentifier.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `ProductIdentifier.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `Commissions` (array)

- `Commissions.@type` (string)

- `Commissions.TravelerIdentifierRef` (array)

- `Commissions.TravelerIdentifierRef.name` (string)
  Traveler identifier

- `Commissions.TravelerIdentifierRef.passengerTypeCode` (string)
  Passenger Type code
  Example: "ADT"

- `Commissions.TravelerIdentifierRef.ages` (array)
  The ages of the travelers associated to a particular ptc. For NDC, this value will be returned in PriceBreakdownAir if sent as part of the PassengerCriteria in the Air Search request.
  Example: [15]

- `Commissions.TravelerIdentifierRef.passengerCriteriaRef` (string)
  Allows the user to associate passenger criteria information.
  Example: "passengerCriteria_1"

- `Commissions.TravelerIdentifierRef.value` (string)

- `Commissions.TravelerIdentifierRef.id` (string)
  A locally referenced ID

- `Commissions.TravelerIdentifierRef.description` (string)
  Descriptive text used to identify the contents of a target object

- `Commissions.TravelerIdentifierRef.uris` (array)
  Uniform Resource Identifier
  Example: ["google.com"]

- `Commissions.TravelerIdentifierRef.age` (integer)
  Replaced with ages array. The age of the traveler.
  Example: 11

- `Commissions.Commission` (object, required)
  Commission information. In Air Search commission is returned for GDS only; not supported for NDC. Any commission filed by an airline in a CAT35 fare is returned in PriceBreakdownAir/Commission. The amount is either a percent of the fare component (@type CommissionPercent and the Percent object) or an amount (@type CommissionAmount and the Amount object).

- `Commissions.Commission.@type` (string, required)
  Discriminator. Child classes CommissionAmount or CommissionPercent
  Example: "CommissionAmount"

- `Commissions.Commission.application` (string)
  Type of commission
  Enum: "Full", "Partial", "Non-paying", "No-show", "Adjustment", "Commissionable"

- `Commissions.ApplyTo` (string)
  List of commission Apply
  Enum: "Base", "Fee"

- `DestinationPurpose` (array)

- `DestinationPurpose.@type` (string)
  Example: "DestinationPurpose"

- `DestinationPurpose.destination` (string, required)
  List of destinations
  Enum: "United States of America", "Mexico / Central America / Canal Zone/ Costa Rica", "Islands and Countries of the Caribbean", "South America", "Europe", "Africa", "Middle East / Western Asia", "Asia", "Australia / New Zealand / Pacific Islands", "Canada and Greenland"

- `DestinationPurpose.purpose` (string, required)
  The purpose exposed.
  Enum: "Business", "Pleasure", "Charter Service"

- `Restrictions` (array)

- `Restrictions.@type` (string)

- `Restrictions.TravelerIdentifierRef` (array)

- `Restrictions.Restriction` (array, required)
  Example: ["NON REFUNDABLE/NON ENDORSEABLE"]

- `Restrictions.DocumentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `TourCodes` (array)

- `TourCodes.@type` (string)
  Discriminator. No child classes.
  Example: "TourCodes"

- `TourCodes.TravelerIdentifierRef` (array)
  Reference the traveler if the tour code is traveler specific. Leave blank to apply to all travelers.

- `TourCodes.TourCode` (object, required)
  Tour code

- `TourCodes.TourCode.value` (string)
  The actual value of the tour code.

- `TourCodes.TourCode.tourCodeType` (string)
  List of tour code types.
  Enum: "Bulk Tour", "Inclusive Tour"

- `ChangeFeeCollectionMethod` (object)

- `ChangeFeeCollectionMethod.value` (string)
  List of change fee method
  Enum: "EMD", "MCO", "Tax", "Unknown"

- `ChangeFeeCollectionMethod.code` (string, required)
  The code value
  Example: "f2142"

- `ChangeFeeCollectionMethod.subCode` (string)
  The subcode value
  Example: "631b"

- `ChangeFeeCollectionMethod.description` (string)
  The description value
  Example: "Change fee collection method"

- `ChangeFeeCollectionMethod.changeFeeIssuedSeparatelyInd` (boolean)
  if true, the change fee will be issued as a separate transaction to the residual amount
  Example: true

- `ChangeFeeCollectionMethod.taxIncludedInBaseAmountInd` (boolean)
  If true, the tax on the fee will be included in the base fee amount and sent as a single value to the supplier for fulfilment
  Example: true

- `NetRemitInfo` (object)

- `NetRemitInfo.@type` (string)
  Example: "NetRemitInfo"

- `NetRemitInfo.CarCode` (string)
  The CAR code or deal code applied to this product for use in net remit.
  Example: "ACAR"

- `NetRemitInfo.ValueCode` (string)
  The Value code applied to this product for use in net remit
  Example: "D1000"

- `NetRemitInfo.ActualSellingFare` (number)
  The actual selling fare which will override the Offer base fare on the document
  Example: 100.5

- `NetRemitInfo.NetBaseAmount` (object)
  The base amount of a ticket price or net price that is filed in local currency

- `NetRemitInfo.NetBaseAmount.value` (number)
  Filed amount value
  Example: 43.3422

- `NetRemitInfo.NetBaseAmount.currencyCode` (string)
  Filed amount currency code
  Example: "USD"

- `NetRemitInfo.NetBaseAmount.codeAuthority` (string)
  Filed amount currency code authority
  Example: "Australian Dollar"

- `NetRemitInfo.NetBaseAmount.decimalPlace` (integer, required)
  ISO 4217 standard has a different number of decimals
  Example: 3

- `NetRemitInfo.NetBaseAmount.decimalAuthority` (string)
  ISO 4217 standard decimal authority
  Example: "ISO 4217"

- `NetRemitInfo.ClientDiscountCode` (string)
  The client discount code applied to this product for net remit.
  Example: "DEF456"

- `TicketDesignators` (array)

- `TicketDesignators.@type` (string, required)
  Discriminator class TicketDesignators only

- `TicketDesignators.TravelerIdentifierRef` (array)

- `TicketDesignators.TicketDesignator` (string, required)

- `InvoiceFareAmount` (object)
  A monetary amount, up to 4 decimal places. Decimal place must be included.

- `InvoiceFareAmount.value` (number)
  The amount of a given currency.
  Example: 124.56

- `InvoiceFareAmount.code` (string)
  An ISO 4217 alpha character code (3 characters) that specifies a money unit.
  Example: "USD"

- `InvoiceFareAmount.minorUnit` (integer)
  Minor units are a mechanism for expressing the relationship between a major currency unit and its corresponding minor currency unit.
  Example: 2

- `InvoiceFareAmount.currencySource` (string)
  The system requesting or returning the currency code specified in the attribute
  Enum: "Supplier", "Charged", "Requested"

- `InvoiceFareAmount.approximateInd` (boolean)
  "If true, the currency amount has been converted from the original amount.
  For Hotel Availability and Rules, true indicates this is a calculated value; false indicates this is the value returned by the property."
  Example: true

- `residualValueAsEvenExchangeMIRInd` (boolean)
  Report an exchange with residual value transaction as an Even exchange in the MIR.
  Example: true

- `obFeeExemptInd` (boolean)
  If true, the associated Offer is exempt from OB Payment Card Fees.
  Example: true

## Response 200 fields (application/json):

- `DocumentOverridesResponse` (object)
  The response of a Document Overrides endpoint request.

- `DocumentOverridesResponse.DocumentOverrides` (object)

- `DocumentOverridesResponse.DocumentOverrides.@type` (string, required)
  Discriminator classes DocumentOverridesID or DocumentOverrides
  Example: "DocumentOverrides"

- `DocumentOverridesResponse.DocumentOverrides.id` (string)
  The reporting number.
  Example: "documentoverrides_001"

- `DocumentOverridesResponse.DocumentOverrides.DocumentOverridesRef` (string)

- `DocumentOverridesResponse.DocumentOverrides.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `DocumentOverridesResponse.@type` (string)
  Example: "response"

- `DocumentOverridesResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `DocumentOverridesResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `DocumentOverridesResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `DocumentOverridesResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `DocumentOverridesResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `DocumentOverridesResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `DocumentOverridesResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `DocumentOverridesResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `DocumentOverridesResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `DocumentOverridesResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `DocumentOverridesResponse.Result.Error.NameValuePair` (array)

- `DocumentOverridesResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `DocumentOverridesResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `DocumentOverridesResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `DocumentOverridesResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `DocumentOverridesResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `DocumentOverridesResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `DocumentOverridesResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `DocumentOverridesResponse.Result.Warning.NameValuePair` (array)

- `DocumentOverridesResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `DocumentOverridesResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `DocumentOverridesResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `DocumentOverridesResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `DocumentOverridesResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `DocumentOverridesResponse.NextSteps.NextStep` (array, required)

- `DocumentOverridesResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `DocumentOverridesResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `DocumentOverridesResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `DocumentOverridesResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `DocumentOverridesResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `DocumentOverridesResponse.ReferenceList` (array)

- `DocumentOverridesResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `DocumentOverridesResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `DocumentOverridesResponse.CurrencyRateConversion` (array)

- `DocumentOverridesResponse.CurrencyRateConversion.@type` (string)

- `DocumentOverridesResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `DocumentOverridesResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `DocumentOverridesResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `DocumentOverridesResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `DocumentOverridesResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `DocumentOverridesResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `DocumentOverridesResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `DocumentOverridesResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `DocumentOverridesResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `DocumentOverridesResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `DocumentOverridesResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `DocumentOverridesResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `DocumentOverridesResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `DocumentOverridesResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `DocumentOverridesResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `DocumentOverridesResponse.Pagination.totalItems` (integer, required)
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

# Accounting remarks

Accounting remarks are optional remarks that are added to the PNR and typically used by an agency's back office system in some way. The remarks can include ticket numbers, customer or account numbers, fares offered to the customer but refused, and canned remarks that document fare rules. Accounting remarks replace the back office accounting remarks in AirReservation prior to version 11.

Endpoint: POST /air/book/accounting/reservationworkbench/{ReservationResource_Identifier}/accountings
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to add accounting information
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
  Discriminator classes AccountingID or Accounting
  Example: "Accounting"

- `id` (string)

- `AccountingRef` (string)
  Accounting reference

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

- `dataType` (string)
  Accounting data type. When used as Accounting remark designator the accepted value is DOCI.
  Example: "DateTime"

- `template` (string)
  Accounting template
  Example: "Internal Finance template"

- `NameValuePair` (array)
  'Defines the type of accounting-specific remark (name) and the remark itself (value).
  Send the following in "name" for each type of remark: DYO - Design Your Own Itinerary FS - Fare Saver CR - Canned Remarks TK - Ticket Number Details AC - Agent, Account, or Branch Details AR - Replace Sign On Code X* - Back Office Accounting Details FT - Free Text
  For remark text "value", please note character limits for each type of remark: DYO - 2 digit, numeric FS - 9 characters total limit in format 1 (all numeric) or format 2 (numeric â€œâ€“â€œ two alpha) CR - 42 characters total limit in format (two numeric "." two numeric "." etc) TK - 8 to 12 characters in format 1 (all numeric) or format 2 (numeric â€œ-â€œ three numeric) AC - 42 characters, alphanumeric and some special characters AR - 10 characters, alphanumeric X* - 84 characters, alphanumeric and some special characters FT - 84 characters, alphanumeric and some special characters'

- `NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

## Response 200 fields (application/json):

- `AccountingResponse` (object)
  The response of an Accounting endpoint request.

- `AccountingResponse.Accounting` (object)

- `AccountingResponse.Accounting.@type` (string, required)
  Discriminator classes AccountingID or Accounting
  Example: "Accounting"

- `AccountingResponse.Accounting.id` (string)

- `AccountingResponse.Accounting.AccountingRef` (string)
  Accounting reference

- `AccountingResponse.Accounting.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `AccountingResponse.@type` (string)
  Example: "response"

- `AccountingResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `AccountingResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `AccountingResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `AccountingResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `AccountingResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `AccountingResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `AccountingResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `AccountingResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `AccountingResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `AccountingResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `AccountingResponse.Result.Error.NameValuePair` (array)

- `AccountingResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `AccountingResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `AccountingResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `AccountingResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `AccountingResponse.Result.Warning.NameValuePair` (array)

- `AccountingResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `AccountingResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `AccountingResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `AccountingResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `AccountingResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `AccountingResponse.NextSteps.NextStep` (array, required)

- `AccountingResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `AccountingResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `AccountingResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `AccountingResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `AccountingResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `AccountingResponse.ReferenceList` (array)

- `AccountingResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `AccountingResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `AccountingResponse.CurrencyRateConversion` (array)

- `AccountingResponse.CurrencyRateConversion.@type` (string)

- `AccountingResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `AccountingResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `AccountingResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `AccountingResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `AccountingResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `AccountingResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `AccountingResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `AccountingResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `AccountingResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `AccountingResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `AccountingResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `AccountingResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `AccountingResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `AccountingResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `AccountingResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `AccountingResponse.Pagination.totalItems` (integer, required)
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

# Delete accounting remarks

Endpoint: DELETE /air/book/accounting/reservationworkbench/{ReservationResource_Identifier}/accountings/{id}/namevaluepairs
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to delete accounting information from
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `id` (string, required)
  The Accounting item id to be deleted
  Example: "accounting_123"

## Query parameters:

- `NameValuePairIds` (string)
  Comma separated list of nameValuePair IDs
  Example: "1 ,2, 3"

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

# Reservation comments (general, itinerary and OSI remarks)

Endpoint: POST /air/book/remarks/reservationworkbench/{ReservationResource_Identifier}/reservationcomments/list
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to add the Reservation Comments to
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

- `ReservationComment` (array, required)
  Example: ["reservation_1","reservation2"]

- `ReservationComment.@type` (string, required)
  Discriminator classes ReservationCommentID or ReservationComment
  Example: "ReservationComment"

- `ReservationComment.id` (string)
  Local identifier within a given message for this object.

- `ReservationComment.commentSource` (string)
  Originator of a comment.
  Enum: "Agency", "Supplier", "Traveler"

- `ReservationComment.shareWith` (string)
  Designates the visibility of a remark.
  Enum: "Supplier", "Agency", "Traveler"

- `ReservationComment.shareWithSupplier` (array)
  Reservation comment shared with supplier

- `ReservationComment.Comment` (array)
  Defines the type of remark (name) and the remark itself (value).
  Send the following in 'name' for each type of remark: Notepad remarks: Two-character code. Use asterisk for any placeholder. (HS, CR, R, \*) Unassociated remarks: ITIN COMMENTS Special instruction remarks: SI
  For remark text 'value', please note character limits for each type of remark: Notepad remarks: 87 Unassociated remarks: 70 Special instruction remarks: 50

- `ReservationComment.Comment.value` (string)
  Actual text. May be restricted by character limits based on the type of comment (e.g. Notepad remarks limited to 87 characters).
  Example: "Additional comments"

- `ReservationComment.Comment.id` (string)
  Local identifier within a given message for this object.
  Example: "comment_1"

- `ReservationComment.Comment.name` (string)
  Title of comment or type of remark.
  Example: "Comment name"

- `ReservationComment.Comment.language` (string)
  Language code using ISO-639 standard
  Example: "EN"

- `ReservationComment.AppliesTo` (array)

- `ReservationComment.AppliesTo.@type` (string, required)
  Discriminator classes AppliesToOffer, AppliesToOfferProduct,and AppliesToOfferProductSegment
  Example: "AppliesToOffer"

## Response 200 fields (application/json):

- `ReservationCommentListResponse` (object)
  The response of a Reservation comment list endpoint request.

- `ReservationCommentListResponse.ReservationCommentID` (array)

- `ReservationCommentListResponse.ReservationCommentID.@type` (string, required)
  Discriminator classes ReservationCommentID or ReservationComment
  Example: "ReservationComment"

- `ReservationCommentListResponse.ReservationCommentID.id` (string)
  Local identifier within a given message for this object.

- `ReservationCommentListResponse.@type` (string)
  Example: "response"

- `ReservationCommentListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `ReservationCommentListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `ReservationCommentListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `ReservationCommentListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `ReservationCommentListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `ReservationCommentListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `ReservationCommentListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `ReservationCommentListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `ReservationCommentListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `ReservationCommentListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `ReservationCommentListResponse.Result.Error.NameValuePair` (array)

- `ReservationCommentListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `ReservationCommentListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `ReservationCommentListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `ReservationCommentListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `ReservationCommentListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `ReservationCommentListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `ReservationCommentListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `ReservationCommentListResponse.Result.Warning.NameValuePair` (array)

- `ReservationCommentListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `ReservationCommentListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `ReservationCommentListResponse.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `ReservationCommentListResponse.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `ReservationCommentListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `ReservationCommentListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `ReservationCommentListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `ReservationCommentListResponse.NextSteps.NextStep` (array, required)

- `ReservationCommentListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `ReservationCommentListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `ReservationCommentListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `ReservationCommentListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `ReservationCommentListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ReservationCommentListResponse.ReferenceList` (array)

- `ReservationCommentListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ReservationCommentListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `ReservationCommentListResponse.CurrencyRateConversion` (array)

- `ReservationCommentListResponse.CurrencyRateConversion.@type` (string)

- `ReservationCommentListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `ReservationCommentListResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `ReservationCommentListResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `ReservationCommentListResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `ReservationCommentListResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `ReservationCommentListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `ReservationCommentListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `ReservationCommentListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `ReservationCommentListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `ReservationCommentListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `ReservationCommentListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `ReservationCommentListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `ReservationCommentListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `ReservationCommentListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `ReservationCommentListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `ReservationCommentListResponse.Pagination.totalItems` (integer, required)
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

# Delete Reservation Comments

Endpoint: DELETE /air/book/remarks/reservationworkbench/{ReservationResource_Identifier}/reservationcomments/{id}/comments
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to delete the Reservation Comments
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `id` (string, required)
  The Reservation Comment ID to be deleted.
  Example: "reservationcomment_123"

## Query parameters:

- `CommentIds` (string)
  Comma separated list of comments IDs
  Example: "1, 2, 3"

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

# Special service list requests

Endpoint: POST /air/book/specialservices/reservationworkbench/{ReservationResource_Identifier}/specialservices/list
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to add the special service to
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

- `SpecialService` (array, required)
  Example: ["specialservice_1"]

- `SpecialService.@type` (string, required)
  Discriminator classes SpecialServiceID, SpecialServiceBassinet, SpecialServiceBlind, SpecialServiceDeaf, SpecialServiceDPNA, SpecialServiceMeal, SpecialServiceUnaccompaniedMinor, SpecialServiceWheelchairAirlineSupplied, SpecialServiceWheelchairTravelerSupplied
  Example: "SpecialService"

- `SpecialService.id` (string)
  Internal Id

- `SpecialService.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `SpecialService.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `SpecialService.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `SpecialService.AppliesTo` (object)
  In a request, used to apply a feature to a specific Offer, Product, or Segment. In a response, returned for Special Instruction and Associated Remarks.

- `SpecialService.AppliesTo.@type` (string, required)
  Discriminator classes AppliesToOffer, AppliesToOfferProduct,and AppliesToOfferProductSegment
  Example: "AppliesToOffer"

- `SpecialService.Status` (object)

- `SpecialService.Status.value` (string)
  Status returned in a response for a two or more phase commitment process
  Enum: "Pending", "Confirmed", "Cancelled", "Rejected", "Requested"

- `SpecialService.Status.supplierText` (string)
  Supplier status text
  Example: "Active/In-active"

- `SpecialService.Status.code` (string)
  Special service status code
  Example: "NN"

- `SpecialService.ServiceAnimalType` (string)
  The type of service animal accompanying the Traveler. If no service animal leave blank.
  Example: "Horse"

- `SpecialService.TravelerIdentifier` (object)
  Traveler Identifier object.

- `SpecialService.TravelerIdentifier.@type` (string)
  Example: "TravelerIdentifier"

- `SpecialService.TravelerIdentifier.id` (string)

- `SpecialService.TravelerIdentifier.TravelerRef` (string)

- `SpecialService.TravelerIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `SpecialService.Quantity` (integer)
  Example: 1

- `SpecialService.FreeText` (string)
  Example: "NO SEAFOOD"

- `SpecialService.SSRCode` (string)
  Example: "SPML"

- `SpecialService.Carrier` (string)
  For unassociated SSRs use carrier to instruct which airline to send the service information to
  Example: "BA"

## Response 200 fields (application/json):

- `SpecialServiceListResponse` (object)
  The response of a Special service list endpoint request.

- `SpecialServiceListResponse.@type` (string)
  Example: "response"

- `SpecialServiceListResponse.SpecialServiceID` (array)

- `SpecialServiceListResponse.SpecialServiceID.@type` (string, required)
  Discriminator classes SpecialServiceID, SpecialServiceBassinet, SpecialServiceBlind, SpecialServiceDeaf, SpecialServiceDPNA, SpecialServiceMeal, SpecialServiceUnaccompaniedMinor, SpecialServiceWheelchairAirlineSupplied, SpecialServiceWheelchairTravelerSupplied
  Example: "SpecialService"

- `SpecialServiceListResponse.SpecialServiceID.id` (string)
  Internal Id

- `SpecialServiceListResponse.SpecialServiceID.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `SpecialServiceListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `SpecialServiceListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `SpecialServiceListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `SpecialServiceListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `SpecialServiceListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `SpecialServiceListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `SpecialServiceListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `SpecialServiceListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `SpecialServiceListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `SpecialServiceListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `SpecialServiceListResponse.Result.Error.NameValuePair` (array)

- `SpecialServiceListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `SpecialServiceListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `SpecialServiceListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `SpecialServiceListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `SpecialServiceListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `SpecialServiceListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `SpecialServiceListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `SpecialServiceListResponse.Result.Warning.NameValuePair` (array)

- `SpecialServiceListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `SpecialServiceListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `SpecialServiceListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `SpecialServiceListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `SpecialServiceListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `SpecialServiceListResponse.NextSteps.NextStep` (array, required)

- `SpecialServiceListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `SpecialServiceListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `SpecialServiceListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `SpecialServiceListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `SpecialServiceListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `SpecialServiceListResponse.ReferenceList` (array)

- `SpecialServiceListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `SpecialServiceListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `SpecialServiceListResponse.CurrencyRateConversion` (array)

- `SpecialServiceListResponse.CurrencyRateConversion.@type` (string)

- `SpecialServiceListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `SpecialServiceListResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `SpecialServiceListResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `SpecialServiceListResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `SpecialServiceListResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `SpecialServiceListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `SpecialServiceListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `SpecialServiceListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `SpecialServiceListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `SpecialServiceListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `SpecialServiceListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `SpecialServiceListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `SpecialServiceListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `SpecialServiceListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `SpecialServiceListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `SpecialServiceListResponse.Pagination.totalItems` (integer, required)
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

## Response 204 fields

# Delete a special service

Endpoint: DELETE /air/book/specialservices/reservationworkbench/{ReservationResource_Identifier}/specialservices/{id}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to delete the special service.
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `id` (string, required)
  The Special Service Id
  Example: "specialservice_123"

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

# Delete multiple special services

Endpoint: POST /air/book/specialservices/reservationworkbench/{ReservationResource_Identifier}/specialservices/deletemultiple
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to update the special service.
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
  Example: "SpecialServiceQueryDeleteMultiple"

- `SpecialServiceID` (array, required)
  Example: ["specialservice_1"]

## Response 200 fields (application/json):

- `SpecialServiceListResponse` (object)
  The response of a Special service list endpoint request.

- `SpecialServiceListResponse.@type` (string)
  Example: "response"

- `SpecialServiceListResponse.SpecialServiceID` (array)

- `SpecialServiceListResponse.SpecialServiceID.@type` (string, required)
  Discriminator classes SpecialServiceID, SpecialServiceBassinet, SpecialServiceBlind, SpecialServiceDeaf, SpecialServiceDPNA, SpecialServiceMeal, SpecialServiceUnaccompaniedMinor, SpecialServiceWheelchairAirlineSupplied, SpecialServiceWheelchairTravelerSupplied
  Example: "SpecialService"

- `SpecialServiceListResponse.SpecialServiceID.id` (string)
  Internal Id

- `SpecialServiceListResponse.SpecialServiceID.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `SpecialServiceListResponse.SpecialServiceID.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `SpecialServiceListResponse.SpecialServiceID.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `SpecialServiceListResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `SpecialServiceListResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `SpecialServiceListResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `SpecialServiceListResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `SpecialServiceListResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `SpecialServiceListResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `SpecialServiceListResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `SpecialServiceListResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `SpecialServiceListResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `SpecialServiceListResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `SpecialServiceListResponse.Result.Error.NameValuePair` (array)

- `SpecialServiceListResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `SpecialServiceListResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `SpecialServiceListResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `SpecialServiceListResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `SpecialServiceListResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `SpecialServiceListResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `SpecialServiceListResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `SpecialServiceListResponse.Result.Warning.NameValuePair` (array)

- `SpecialServiceListResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `SpecialServiceListResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `SpecialServiceListResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `SpecialServiceListResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `SpecialServiceListResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `SpecialServiceListResponse.NextSteps.NextStep` (array, required)

- `SpecialServiceListResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `SpecialServiceListResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `SpecialServiceListResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `SpecialServiceListResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `SpecialServiceListResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `SpecialServiceListResponse.ReferenceList` (array)

- `SpecialServiceListResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `SpecialServiceListResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `SpecialServiceListResponse.CurrencyRateConversion` (array)

- `SpecialServiceListResponse.CurrencyRateConversion.@type` (string)

- `SpecialServiceListResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `SpecialServiceListResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `SpecialServiceListResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `SpecialServiceListResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `SpecialServiceListResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `SpecialServiceListResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `SpecialServiceListResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `SpecialServiceListResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `SpecialServiceListResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `SpecialServiceListResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `SpecialServiceListResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `SpecialServiceListResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `SpecialServiceListResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `SpecialServiceListResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `SpecialServiceListResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `SpecialServiceListResponse.Pagination.totalItems` (integer, required)
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

# Add primary contact remark (SSR CTC)

Endpoint: POST /air/book/primarycontact/reservationworkbench/{ReservationResource_Identifier}/primarycontacts
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to add the primary contact to
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
  Discriminator classes PrimaryContactID or PrimaryContact
  Example: "PrimaryContact"

- `id` (string)

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

- `shareWith` (string)
  Designates the visibility of a remark.
  Enum: "Supplier", "Agency", "Traveler"

- `shareWithSupplier` (array)
  Primary contact shared with supplier

- `Email` (object)
  Electronic email addresses, in IETF specified format.
  Booking.com requires a traveler email address in the Hotel Create Reservation and Add Reservation requests. A system-generated confirmation email is sent to the traveler after the booking completes.

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

- `Telephone` (object)

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

- `TravelerIdentifier` (object)
  Traveler Identifier object.

- `TravelerIdentifier.@type` (string)
  Example: "TravelerIdentifier"

- `TravelerIdentifier.id` (string)

- `TravelerIdentifier.TravelerRef` (string)

- `TravelerIdentifier.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `contactInformationRefusedInd` (boolean)
  If true, the passenger has refused to provide emergency contact details
  Example: true

## Response 200 fields (application/json):

- `PrimaryContactResponse` (object)
  The response of a Primary contact endpoint request.

- `PrimaryContactResponse.PrimaryContact` (object)

- `PrimaryContactResponse.PrimaryContact.@type` (string, required)
  Discriminator classes PrimaryContactID or PrimaryContact
  Example: "PrimaryContact"

- `PrimaryContactResponse.PrimaryContact.id` (string)

- `PrimaryContactResponse.PrimaryContact.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `PrimaryContactResponse.@type` (string)
  Example: "response"

- `PrimaryContactResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `PrimaryContactResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `PrimaryContactResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `PrimaryContactResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `PrimaryContactResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `PrimaryContactResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `PrimaryContactResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `PrimaryContactResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `PrimaryContactResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `PrimaryContactResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `PrimaryContactResponse.Result.Error.NameValuePair` (array)

- `PrimaryContactResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `PrimaryContactResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `PrimaryContactResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `PrimaryContactResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `PrimaryContactResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `PrimaryContactResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `PrimaryContactResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `PrimaryContactResponse.Result.Warning.NameValuePair` (array)

- `PrimaryContactResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `PrimaryContactResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `PrimaryContactResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `PrimaryContactResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `PrimaryContactResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `PrimaryContactResponse.NextSteps.NextStep` (array, required)

- `PrimaryContactResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `PrimaryContactResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `PrimaryContactResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `PrimaryContactResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `PrimaryContactResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `PrimaryContactResponse.ReferenceList` (array)

- `PrimaryContactResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `PrimaryContactResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `PrimaryContactResponse.CurrencyRateConversion` (array)

- `PrimaryContactResponse.CurrencyRateConversion.@type` (string)

- `PrimaryContactResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `PrimaryContactResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `PrimaryContactResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `PrimaryContactResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `PrimaryContactResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `PrimaryContactResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `PrimaryContactResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `PrimaryContactResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `PrimaryContactResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `PrimaryContactResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `PrimaryContactResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `PrimaryContactResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `PrimaryContactResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `PrimaryContactResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `PrimaryContactResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `PrimaryContactResponse.Pagination.totalItems` (integer, required)
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

# Delete primary contact remark

Endpoint: DELETE /air/book/primarycontact/reservationworkbench/{ReservationResource_Identifier}/primarycontacts/{id}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to delete the primary contact from

- `id` (string, required)
  The primary contact id
  Example: "primary_001"

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
