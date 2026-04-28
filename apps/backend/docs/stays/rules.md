# Rules

Reference payload and full payload hotel rules.

## Return hotel rules (reference payload).

 - [POST /hotel/rules/offershospitality/buildfromcatalogoffering](https://developer.travelport.com/apis/stays/rules/buildhotelrulesfromcatalogoffering.md): Available January 2023. Hotel Rules retrieves the rules associated with a specific rate. The reference payload references an offer by sending the unique offer ID from an Availability response, instead of sending all required offer details as in the full payload Rules request. The response for both the reference and full payload is the same.

## Return hotel rules (full payload).

 - [POST /hotel/rules/offershospitality/buildfromrequest](https://developer.travelport.com/apis/stays/rules/createhotelrules.md): Hotel Rules retrieves the rules associated with a specific rate. The full payload request in this topic sends all required rate details, while the reference payload Rules request references rate details from a previous Availability response by sending the offer ID from that response. The response for both the reference and full payload is the same.
# Return hotel rules (reference payload).

Available January 2023. Hotel Rules retrieves the rules associated with a specific rate. The reference payload references an offer by sending the unique offer ID from an Availability response, instead of sending all required offer details as in the full payload Rules request. The response for both the reference and full payload is the same.

Endpoint: POST /hotel/rules/offershospitality/buildfromcatalogoffering
Version: 11.33.0
Security: bearerAuth

## Header parameters:

  - `TraceId` (string)
    Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response.
    Example: "TraceID_123456789"

  - `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
    Identifies the Travelport access group with which the caller is associated
    Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

  - `TVP-PCC-Core` (string)
    Allows user to pass PCC instead of Access Group ID
    Example: "DU7_1G"

  - `TVP-Correlation-Id` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.
    Example: "382c74c3-721d-4f34-80e5-57657b6cbc27"

  - `Accept-Encoding` (string, required)
    Comma-separated list of acceptable encodings like gzip and/or deflate
    Example: "gzip, deflate"

## Request fields (application/json):

  - `OfferQueryBuildFromCatalogOffering` (object)
    Used for a Hotel Rules (Reference Payload) request. Defines a request to retrieve the rules associated with a specific rate by referencing a selected offer from a preceding Hotel Availability response. This request is typically sent directly after Hotel Availability and before booking. If the cached offer expires, a new Hotel Availability request must be sent.

  - `OfferQueryBuildFromCatalogOffering.@type` (string, required)
    Discriminator class OfferQueryBuildFromCatalogOffering only
    Example: "OfferQueryBuildFromCatalogOffering"

  - `OfferQueryBuildFromCatalogOffering.BuildFromCatalogOfferingHospitality` (object)
    For a Rules (Reference Payload) or a Create Reservation (Reference Payload) call, reference the value returned in the Availability response at CatalogOffering/id for the specific offer you want to request. Send this value in CatalogOfferingIdentifier. Offers from an Availability response are stored in cache for 30 minutes. If the offers expire you must send a new Availability request.

  - `OfferQueryBuildFromCatalogOffering.BuildFromCatalogOfferingHospitality.@type` (string)
    Example: "BuildFromCatalogOfferingHospitality"

  - `OfferQueryBuildFromCatalogOffering.BuildFromCatalogOfferingHospitality.CatalogOfferingIdentifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `OfferQueryBuildFromCatalogOffering.BuildFromCatalogOfferingHospitality.CatalogOfferingIdentifier.value` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
    Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

  - `OfferQueryBuildFromCatalogOffering.BuildFromCatalogOfferingHospitality.CatalogOfferingIdentifier.authority` (string)
    "Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
    Example: "TVPT"

  - `OfferQueryBuildFromCatalogOffering.BuildFromCatalogOfferingHospitality.SpecialInstruction` (string)
    Customer generated special instructions transmitted to the hotel.
    Example: "Guest prefers room on first floor."

  - `OfferQueryBuildFromCatalogOffering.BuildFromCatalogOfferingHospitality.NumberOfRooms` (integer)
    Not supported.
    Example: 1

  - `OfferQueryBuildFromCatalogOffering.BuildFromCatalogOfferingHospitality.RoomPerTravelerInd` (boolean)
    Not implemented.

## Response 200 fields (application/json):

  - `OfferHospitalityResponse` (object)
    The response of a Hotel Rules (Reference Payload) or Hotel Rules (Full Payload) endpoint request.

  - `OfferHospitalityResponse.Offer` (object)
    Contains all of the returned offer details.

  - `OfferHospitalityResponse.Offer.@type` (string, required)
    "Discriminator classes for Air Price are OfferID, Offer, and OfferUpsell. 
Discriminator classes for Reservation and ReservationWorkbench are OfferID, Offer, OfferModify, and OfferUpsell. 
Discriminator classes for Hotel Rules are OfferID and Offer."
    Example: "Offer"

  - `OfferHospitalityResponse.Offer.id` (string)
    Offer identifier sent in the reference payload request to book that offer. Not returned in the full payload response; this is the only difference in the two responses.
    Example: "offer_1"

  - `OfferHospitalityResponse.Offer.offerRef` (string)
    Used to reference another instance of this object in the same message
    Example: "offer_1"

  - `OfferHospitalityResponse.Offer.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `OfferHospitalityResponse.Offer.ContentSource` (string)
    Indicates the owner the offer or document.
    Enum: "GDS", "NDC", "LCC", "API"

  - `OfferHospitalityResponse.Offer.parentOfferRef` (string)
    A reference to the Offer this offer is sold in conjunction with
    Example: "offer_1"

  - `OfferHospitalityResponse.Offer.offerModifyRef` (string)
    Reference to the new Offer created as a result of this Offer being subject to a schedule change.

  - `OfferHospitalityResponse.Offer.Product` (array, required)

  - `OfferHospitalityResponse.Offer.Product.@type` (string, required)
    Discriminator. Air Search child classes are ProductAir and ProductAncillary. Exchange Search child class is ProductAir. Ancillary Search is ProductAncillary. Seat Map child class isProductSeatAvailability. Air Price child classes are ProductAir and ProductAncillary. Hotel Availability child classes are ProductHospitality and ProductHospitalityOffer. Hotel Rules and HotelReservation child classes are ProductHospitality. All Vehicle APIs are ProductVehicle and ProductAncillaryVehicle. Reservation and Reservation Workbench child classes are ProductAir, ProductAncillary, ProductHospitality, ProductVehicle, and ProductAncillaryVehicle.
    Example: "ProductAir"

  - `OfferHospitalityResponse.Offer.Product.id` (string)
    Local id within a given message to support referencing this object.
    Example: "product_1"

  - `OfferHospitalityResponse.Offer.Product.productRef` (string)
    Reference id that corresponds to the product 'id' in ReferenceListProduct.Product. To find flight details for a product, use the ProductRef id to identify the product in ReferenceListProduct.Product, and use the Flight id's (e.g., s3, s4) to match to flight information in ReferenceListFlight.Flight.
    Example: "product_1"

  - `OfferHospitalityResponse.Offer.Product.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `OfferHospitalityResponse.Offer.Price` (object, required)
    Price includes a summary of the Base, Taxes, and Fees applicable to the offer in the currency indicated.

  - `OfferHospitalityResponse.Offer.Price.@type` (string, required)
    Discriminator classes Price or PriceDetail
    Example: "PriceDetail"

  - `OfferHospitalityResponse.Offer.Price.id` (string)
    Internally referenced id
    Example: "2"

  - `OfferHospitalityResponse.Offer.Price.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `OfferHospitalityResponse.Offer.Price.CurrencyCode.value` (string)
    An ISO 4217 currency code.
    Example: "USD"

  - `OfferHospitalityResponse.Offer.Price.CurrencyCode.codeAuthority` (string)
    Currency code authority
    Example: "ISO 4217"

  - `OfferHospitalityResponse.Offer.Price.CurrencyCode.decimalPlace` (integer)
    Number of decimal places for the currency.
    Example: 4

  - `OfferHospitalityResponse.Offer.Price.CurrencyCode.decimalAuthority` (string)
    Currency code decimal authority
    Example: "ISO 4217"

  - `OfferHospitalityResponse.Offer.Price.Base` (number)
    "Base price before taxes and fees. 
For Hotel, may not be returned by all suppliers."
    Example: 20.2

  - `OfferHospitalityResponse.Offer.Price.TotalTaxes` (number)
    "Total taxes applied to the base price. 
For Hotel, may not be returned by all suppliers."
    Example: 34.4

  - `OfferHospitalityResponse.Offer.Price.TotalFees` (number)
    Total fees included in Total Price.
    Example: 201

  - `OfferHospitalityResponse.Offer.Price.TotalPrice` (number)
    Total price of this offer including the base price and all taxes and fees.
    Example: 34

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal` (object)
    No longer used. Previously used to expose the local vendor currency when it is different to the purchased currency

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.@type` (string)

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.currencySource` (string)
    The system requesting or returning the currency code specified in the attribute
    Enum: "Supplier", "Charged", "Requested"

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Base` (number)
    The price prior to all applicable taxes of a product such as the rate for a room or fare for a flight.
    Example: 120.2

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes` (object)
    Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.@type` (string, required)
    Discriminator. Child class is TaxesDetail
    Example: "TaxesDetail"

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.TotalTaxes` (number)
    A monetary amount, representing the total of all taxes included in this offer. Supports up to 4 decimal places; decimal place must be included.
    Example: 330.1

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo` (array)
    Returned for TripChange APIS only.

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.@type` (string)
    Example: "TaxInfo"

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.TaxCode` (string, required)
    The tax code
    Example: "XF"

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.Amount` (number, required)
    The amount of the tax applied

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.TaxBreakdown` (array, required)
    The breakdown of the tax for this tax code

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Fees` (object)
    Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Fees.@type` (string, required)
    Discriminator. Child class FeesDetail
    Example: "FeesDetail"

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Fees.TotalFees` (number)
    Total fees included in the TotalPrice. Supports up to 4 decimal places; decimal place needs to be included.
    Example: 111.11

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Fees.TotalAdditionalFeesPayableLocally` (number)
    Fees due separately at the property. Expected to be paid in local currency. These fees are not included in the Offer TotalPrice.
    Example: 2.1

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Total` (number)
    Specifies the total price including base + taxes + fees
    Example: 30.13

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.approximateInd` (boolean)
    True if this amount has been converted from the original amount
    Example: true

  - `OfferHospitalityResponse.Offer.TermsAndConditionsFull` (array)

  - `OfferHospitalityResponse.Offer.TermsAndConditionsFull.@type` (string, required)
    'Discriminator classes for Air Price are TermsAndConditionsFullAir and TermsAndConditionsFullAncillary. 
Discriminator class for Hotel Rules and Reservation is TermsAndConditionsFullHospitality. 
Discriminator class for Vehicle Rules and Reservation is TermsAndConditionsFullVehicle. 
Discriminator classes for Reservation and Reservation Workbench APIs are TermsAndConditionsFullAir, TermsAndConditionsFullAncillary, TermsAndConditionsFullHospitality, TermsAndConditionsFullVehicle, TermsAndConditionsFullVehicle, and TermsAndConditionsFullScheduleChange.'
    Example: "TermsAndConditionsFullAir"

  - `OfferHospitalityResponse.Offer.TermsAndConditionsFull.id` (string)
    Local identifier within a given message for this object.
    Example: "TC_1"

  - `OfferHospitalityResponse.Offer.TermsAndConditionsFull.termsAndConditionsRef` (string)
    Used to reference another instance of this object in the same message.
    Example: "TC_1"

  - `OfferHospitalityResponse.Offer.TermsAndConditionsFull.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `OfferHospitalityResponse.Offer.passiveOfferInd` (boolean)
    Indicates aggregator segment built into PNR. Always send with true when using in a request. If returned true in a response, the Offer is passive for booking purposes.
    Example: true

  - `OfferHospitalityResponse.Offer.scheduleChangeInd` (boolean)
    If true, this Offer is subject to a schedule change.

  - `OfferHospitalityResponse.@type` (string)
    Example: "response"

  - `OfferHospitalityResponse.transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `OfferHospitalityResponse.traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `OfferHospitalityResponse.correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `OfferHospitalityResponse.reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `OfferHospitalityResponse.Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `OfferHospitalityResponse.Result.@type` (string)
    Discriminator class Result only
    Example: "Result"

  - `OfferHospitalityResponse.Result.status` (string)
    The status of an error or warning
    Enum: "Not processed", "Incomplete", "Complete", "Unknown"

  - `OfferHospitalityResponse.Result.Error` (array)
    A list of error information returned at the provider level for a response.

  - `OfferHospitalityResponse.Result.Error.@type` (string, required)
    Discriminator classes Error or ErrorDetail
    Example: "ErrorDetail"

  - `OfferHospitalityResponse.Result.Error.Message` (string)
    The Travelport standardized error or warning message
    Example: "No flights found."

  - `OfferHospitalityResponse.Result.Error.NameValuePair` (array)

  - `OfferHospitalityResponse.Result.Error.NameValuePair.value` (string)
    Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
    Example: "Sunday"

  - `OfferHospitalityResponse.Result.Error.NameValuePair.id` (string)
    Optional internally referenced id
    Example: "6"

  - `OfferHospitalityResponse.Result.Error.NameValuePair.name` (string, required)
    Key, categorizing the of type of remark or error.
    Example: "Day1"

  - `OfferHospitalityResponse.Result.Error.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `OfferHospitalityResponse.Result.Warning` (array)
    A list of warning information returned at the provider level for a response.

  - `OfferHospitalityResponse.Result.Warning.@type` (string, required)
    Discriminator classes Warning or WarningDetail
    Example: "WarningDetail"

  - `OfferHospitalityResponse.Result.Warning.Message` (string)
    The Travelport standardized error or warning message
    Example: "Customer Loyalty could not be applied."

  - `OfferHospitalityResponse.Result.Warning.NameValuePair` (array)

  - `OfferHospitalityResponse.Result.Warning.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `OfferHospitalityResponse.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `OfferHospitalityResponse.NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `OfferHospitalityResponse.NextSteps.baseURI` (string, required)
    The base portion of the uri in order to shorten the uris in the individual steps

  - `OfferHospitalityResponse.NextSteps.id` (string)
    Optional internally referenced id
    Example: "5"

  - `OfferHospitalityResponse.NextSteps.NextStep` (array, required)

  - `OfferHospitalityResponse.NextSteps.NextStep.value` (string)
    Example: "www.resourcelocation.com"

  - `OfferHospitalityResponse.NextSteps.NextStep.id` (string)
    Identifier for the Next Step
    Example: "2"

  - `OfferHospitalityResponse.NextSteps.NextStep.action` (string, required)
    The action this next step is intended to achieve
    Example: "cancel"

  - `OfferHospitalityResponse.NextSteps.NextStep.method` (string, required)
    Describes the set of potential methods that can be taken after an operation.
    Enum: "GET", "DELETE", "PUT", "POST"

  - `OfferHospitalityResponse.NextSteps.NextStep.description` (string)
    Additional clarification for the next step
    Example: "remove offer from the order"

  - `OfferHospitalityResponse.ReferenceList` (array)

  - `OfferHospitalityResponse.ReferenceList.@type` (string, required)
    Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
    Example: "ReferenceListFlight"

  - `OfferHospitalityResponse.ReferenceList.id` (string)
    Uniquely identifies for the Reference List

  - `OfferHospitalityResponse.CurrencyRateConversion` (array)

  - `OfferHospitalityResponse.CurrencyRateConversion.@type` (string)

  - `OfferHospitalityResponse.CurrencyRateConversion.SourceCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `OfferHospitalityResponse.CurrencyRateConversion.TargetCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `OfferHospitalityResponse.CurrencyRateConversion.ConversionRate` (object, required)
    Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

  - `OfferHospitalityResponse.CurrencyRateConversion.ConversionRate.value` (number)

  - `OfferHospitalityResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
    Contextual rate authority
    Example: "ISO 4217"

  - `OfferHospitalityResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
    Rate as of
    Example: "2026-08-07 12:12:00+00:00"

  - `OfferHospitalityResponse.Pagination` (object)
    Pagination object used when result sets span across a number of pages.

  - `OfferHospitalityResponse.Pagination.@type` (string, required)
    Example: "Pagination"

  - `OfferHospitalityResponse.Pagination.page` (integer, required)
    The current page number of the full result set
    Example: 1

  - `OfferHospitalityResponse.Pagination.pageSize` (integer, required)
    The total number of items on this page
    Example: 20

  - `OfferHospitalityResponse.Pagination.totalPages` (integer, required)
    The total number of pages in this result set
    Example: 5

  - `OfferHospitalityResponse.Pagination.totalItems` (integer, required)
    The total number of pages in this result set
    Example: 100

## Response 400 fields (application/json):

  - `@type` (string)
    Example: "response"

  - `transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReferenceList` (array)

  - `CurrencyRateConversion` (array)

  - `Pagination` (object)
    Pagination object used when result sets span across a number of pages.

# Return hotel rules (full payload).

Hotel Rules retrieves the rules associated with a specific rate. The full payload request in this topic sends all required rate details, while the reference payload Rules request references rate details from a previous Availability response by sending the offer ID from that response. The response for both the reference and full payload is the same.

Endpoint: POST /hotel/rules/offershospitality/buildfromrequest
Version: 11.33.0
Security: bearerAuth

## Header parameters:

  - `TraceId` (string)
    Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response.
    Example: "TraceID_123456789"

  - `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
    Identifies the Travelport access group with which the caller is associated
    Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"

  - `TVP-PCC-Core` (string)
    Allows user to pass PCC instead of Access Group ID
    Example: "DU7_1G"

  - `TVP-Correlation-Id` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.
    Example: "382c74c3-721d-4f34-80e5-57657b6cbc27"

  - `Accept-Encoding` (string, required)
    Comma-separated list of acceptable encodings like gzip and/or deflate
    Example: "gzip, deflate"

## Request fields (application/json):

  - `OfferQueryHospitalityRequest` (object)
    Used for a Hotel Rules (Full Payload) request. Defines a request to retrieve the rules associated with a specific rate by sending the required rate details directly instead of referencing a preceding Hotel Availability response. This request is typically sent after Hotel Availability and before booking.

  - `OfferQueryHospitalityRequest.@type` (string, required)
    Discriminator class OfferQueryHospitalityRequest only
    Example: "OfferQueryHospitalityRequest"

  - `OfferQueryHospitalityRequest.checkinDate` (string, required)
    Check-in date in YYYY-MM-DD format.

  - `OfferQueryHospitalityRequest.checkoutDate` (string, required)
    Check-out date in YYYY-MM-DD format.

  - `OfferQueryHospitalityRequest.numberOfGuests` (integer, required)
    Total number of travelers. Must be a numeric value between 1 and 9. Required; send with same value as the total across all counts in RoomStayCandidate/GuestCount/count

  - `OfferQueryHospitalityRequest.bookingCode` (string)
    For the offer you want to request rules on, send the value found for that offer in CatalogOffering/ProductOptions/Product/bookingCode from the Availability response.

  - `OfferQueryHospitalityRequest.storedCurrency` (string)
    For the offer you want to request rules on, send the value found for that offer in CatalogOffering/Price/CurrencyCode/value from the Availability response.

  - `OfferQueryHospitalityRequest.storedAmount` (number)
    For the offer you want to request rules on, send the value found for that offer in CatalogOffering/Price/TotalPrice from the Availability response.

  - `OfferQueryHospitalityRequest.requestedCurrency` (string)
    Send the currency code to return a conversion rate for. The response returns the currency conversion rate of the local currency to the requested currency. This can be used to calculate, independently of the API, conversion for the rates returned in the response. The response does not convert any amounts.

  - `OfferQueryHospitalityRequest.ExtraAccommodation` (array)

  - `OfferQueryHospitalityRequest.ExtraAccommodation.@type` (string, required)
    Example: "ExtraAccommodation"

  - `OfferQueryHospitalityRequest.ExtraAccommodation.quantity` (integer, required)
    The quantity.

  - `OfferQueryHospitalityRequest.ExtraAccommodation.AccommodationType` (string, required)
    Enum: "Crib", "ExtraAdult", "ExtraChild", "RollawayAdult", "RollawayChild"

  - `OfferQueryHospitalityRequest.RoomStayCandidates` (object)
    Includes traveler information.

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate` (array, required)

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.GuestCounts` (object, required)
    The number and age(s) of guests within the room.

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.GuestCounts.@type` (string)
    Example: "GuestCounts"

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.GuestCounts.GuestCount` (array, required)

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.GuestCounts.GuestCount.@type` (string)
    Example: "GuestCount"

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.GuestCounts.GuestCount.age` (integer)
    The age of the guest. Required only when request includes a child in the room.
    Example: 21

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.GuestCounts.GuestCount.count` (integer)
    Number of guests. Supports numeric values 1-9 inclusive.
    Example: 2

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.GuestCounts.GuestCount.ageQualifyingCode` (string)
    "Required only for children or if traveler age is relevant, such as for a senior discount. Supported values include '8' and '10'. 8: Traveler in this GuestCount is a child. 10: Traveler in this GuestCount is an adult."
    Example: "10"

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.RoomAmenity` (array)

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.RoomAmenity.@type` (string)

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.RoomAmenity.description` (string)
    Description of amenity received from supplier.
    Example: "WiFi"

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.RoomAmenity.quantity` (integer)
    quantity of amenity

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.RoomAmenity.Name` (string)
    Room Amenity Name
    Example: "24 hour Room Service"

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.RoomAmenity.Inclusion` (array)

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.RoomAmenity.includedInd` (boolean)
    Represents if the amenity is included with the rate

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.RoomAmenity.surchargeInd` (boolean)
    Represents if the amenity attracts a surcharge.

  - `OfferQueryHospitalityRequest.RoomStayCandidates.RoomStayCandidate.RoomAmenity.code` (string)
    OTA code used to describe the room amenity. This is optional in the Properties Search request but mandatory in the response.

  - `OfferQueryHospitalityRequest.PropertyKey` (object, required)
    Contains up to 250 PropertyKey objects. Each PropertyKey object identifies one property.

  - `OfferQueryHospitalityRequest.PropertyKey.@type` (string)

  - `OfferQueryHospitalityRequest.PropertyKey.chainCode` (string, required)
    Code for the hotel chain (typically 2 characters)
    Example: "UR"

  - `OfferQueryHospitalityRequest.PropertyKey.propertyCode` (string, required)
    The property code of the requested property (typically 5 characters).
    Example: "G3375"

  - `OfferQueryHospitalityRequest.HotelAggregator` (string)
    "Identifies the source of the rate.  Send the value for the abbreviation returned for the offer in the Availability response in CatalogOffering/Identifier/authority.  Access to Booking.com rates requires additional provisioning and a direct agreement with the supplier. Contact your Travelport Account Manager for details."
    Enum: "Travelport", "Agoda", "Booking", "Expedia", "Bonotel"

  - `OfferQueryHospitalityRequest.RateCandidate` (object)
    Rate plan details and/or frequent guest number, if requesting. 
For Hotel Availability, the values required differ according to whether you are sending a negotiated rate code or a rate category. Send one instance of RateCandidate for each rate plan to request. To include CustomerLoyalty, use RateCandidateDetail.
 
For Hotel Rules, include the values for the offer you want to request rules on, if returned in the Availability response. May include rateCode, rateID, rateCategory, chainCode, and propertyCode

  - `OfferQueryHospitalityRequest.RateCandidate.@type` (string, required)
    Discriminator classes RateCandidate and RateCandidateDetail
    Example: "RateCandidateDetail"

  - `OfferQueryHospitalityRequest.RateCandidate.priority` (integer)
    A rate candidate priority

  - `OfferQueryHospitalityRequest.RateCandidate.rateCode` (string)
    "The negotiated rateCode to be applied to the request. 
For Hotel Availability, each rateCode must be associated with a chainCode, propertyCode, and a rateCategory of 'Multi-level/Negotiated/Secure'. 
For Hotel Rules, this value can be found, if returned, in the Availability response's ProductRateCodeInfo/RateCodeInfo/value."
    Example: "HL123"

  - `OfferQueryHospitalityRequest.RateCandidate.rateCategory` (string)
    For Hotel Search, request a rate category by sending up to 8 OTA rate categories to search for. If the supplier has rates available for the requested category, the response contains those rates and indicates them as such. Some properties do not return these rates unless explicitly requested.
For a Hotel Rules request, this value can be found, if returned, in the Availability response's ProductRateCodeInfo/RateCodeInfo/rateCategory.
    Enum: "All", "Association", "Business", "BusinessStandard", "Club", "Convention", "Corporate", "Consortiums", "Discount", "Credential", "Employee", "FamilyPlan", "FullInclusive", "Government", "Inclusive", "Industry/TravelAgentRate", "Leisure", "Military", "Monthly", "Multi-DayPackage", "MultLevel/Negotiated/Secure", "Other", "Package", "PrePaid", "Promotional", "RackGeneral", "SeniorCitizen", "Standard", "Tour", "VIP", "Weekend", "Weekly"

  - `OfferQueryHospitalityRequest.RateCandidate.chainCode` (string)
    Code for the hotel chain (typically 2 characters)
    Example: "UR"

  - `OfferQueryHospitalityRequest.RateCandidate.propertyCode` (string)
    The property code of the requested property (typically 5 characters).
    Example: "G3375"

  - `OfferQueryHospitalityRequest.RateCandidate.masterRateCode` (string)
    An agency-created rate code that can be translated into up to 12 negotiated rate codes. If masterRateCode is sent, any additional rateCodes will be ignored.
    Example: "1ABC23"

## Response 200 fields (application/json):

  - `OfferHospitalityResponse` (object)
    The response of a Hotel Rules (Reference Payload) or Hotel Rules (Full Payload) endpoint request.

  - `OfferHospitalityResponse.Offer` (object)
    Contains all of the returned offer details.

  - `OfferHospitalityResponse.Offer.@type` (string, required)
    "Discriminator classes for Air Price are OfferID, Offer, and OfferUpsell. 
Discriminator classes for Reservation and ReservationWorkbench are OfferID, Offer, OfferModify, and OfferUpsell. 
Discriminator classes for Hotel Rules are OfferID and Offer."
    Example: "Offer"

  - `OfferHospitalityResponse.Offer.id` (string)
    Offer identifier sent in the reference payload request to book that offer. Not returned in the full payload response; this is the only difference in the two responses.
    Example: "offer_1"

  - `OfferHospitalityResponse.Offer.offerRef` (string)
    Used to reference another instance of this object in the same message
    Example: "offer_1"

  - `OfferHospitalityResponse.Offer.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `OfferHospitalityResponse.Offer.Identifier.value` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
    Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

  - `OfferHospitalityResponse.Offer.Identifier.authority` (string)
    "Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
    Example: "TVPT"

  - `OfferHospitalityResponse.Offer.ContentSource` (string)
    Indicates the owner the offer or document.
    Enum: "GDS", "NDC", "LCC", "API"

  - `OfferHospitalityResponse.Offer.parentOfferRef` (string)
    A reference to the Offer this offer is sold in conjunction with
    Example: "offer_1"

  - `OfferHospitalityResponse.Offer.offerModifyRef` (string)
    Reference to the new Offer created as a result of this Offer being subject to a schedule change.

  - `OfferHospitalityResponse.Offer.Product` (array, required)

  - `OfferHospitalityResponse.Offer.Product.@type` (string, required)
    Discriminator. Air Search child classes are ProductAir and ProductAncillary. Exchange Search child class is ProductAir. Ancillary Search is ProductAncillary. Seat Map child class isProductSeatAvailability. Air Price child classes are ProductAir and ProductAncillary. Hotel Availability child classes are ProductHospitality and ProductHospitalityOffer. Hotel Rules and HotelReservation child classes are ProductHospitality. All Vehicle APIs are ProductVehicle and ProductAncillaryVehicle. Reservation and Reservation Workbench child classes are ProductAir, ProductAncillary, ProductHospitality, ProductVehicle, and ProductAncillaryVehicle.
    Example: "ProductAir"

  - `OfferHospitalityResponse.Offer.Product.id` (string)
    Local id within a given message to support referencing this object.
    Example: "product_1"

  - `OfferHospitalityResponse.Offer.Product.productRef` (string)
    Reference id that corresponds to the product 'id' in ReferenceListProduct.Product. To find flight details for a product, use the ProductRef id to identify the product in ReferenceListProduct.Product, and use the Flight id's (e.g., s3, s4) to match to flight information in ReferenceListFlight.Flight.
    Example: "product_1"

  - `OfferHospitalityResponse.Offer.Product.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `OfferHospitalityResponse.Offer.Price` (object, required)
    Price includes a summary of the Base, Taxes, and Fees applicable to the offer in the currency indicated.

  - `OfferHospitalityResponse.Offer.Price.@type` (string, required)
    Discriminator classes Price or PriceDetail
    Example: "PriceDetail"

  - `OfferHospitalityResponse.Offer.Price.id` (string)
    Internally referenced id
    Example: "2"

  - `OfferHospitalityResponse.Offer.Price.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `OfferHospitalityResponse.Offer.Price.CurrencyCode.value` (string)
    An ISO 4217 currency code.
    Example: "USD"

  - `OfferHospitalityResponse.Offer.Price.CurrencyCode.codeAuthority` (string)
    Currency code authority
    Example: "ISO 4217"

  - `OfferHospitalityResponse.Offer.Price.CurrencyCode.decimalPlace` (integer)
    Number of decimal places for the currency.
    Example: 4

  - `OfferHospitalityResponse.Offer.Price.CurrencyCode.decimalAuthority` (string)
    Currency code decimal authority
    Example: "ISO 4217"

  - `OfferHospitalityResponse.Offer.Price.Base` (number)
    "Base price before taxes and fees. 
For Hotel, may not be returned by all suppliers."
    Example: 20.2

  - `OfferHospitalityResponse.Offer.Price.TotalTaxes` (number)
    "Total taxes applied to the base price. 
For Hotel, may not be returned by all suppliers."
    Example: 34.4

  - `OfferHospitalityResponse.Offer.Price.TotalFees` (number)
    Total fees included in Total Price.
    Example: 201

  - `OfferHospitalityResponse.Offer.Price.TotalPrice` (number)
    Total price of this offer including the base price and all taxes and fees.
    Example: 34

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal` (object)
    No longer used. Previously used to expose the local vendor currency when it is different to the purchased currency

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.@type` (string)

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.currencySource` (string)
    The system requesting or returning the currency code specified in the attribute
    Enum: "Supplier", "Charged", "Requested"

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Base` (number)
    The price prior to all applicable taxes of a product such as the rate for a room or fare for a flight.
    Example: 120.2

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes` (object)
    Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.@type` (string, required)
    Discriminator. Child class is TaxesDetail
    Example: "TaxesDetail"

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.TotalTaxes` (number)
    A monetary amount, representing the total of all taxes included in this offer. Supports up to 4 decimal places; decimal place must be included.
    Example: 330.1

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo` (array)
    Returned for TripChange APIS only.

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.@type` (string)
    Example: "TaxInfo"

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.TaxCode` (string, required)
    The tax code
    Example: "XF"

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.Amount` (number, required)
    The amount of the tax applied

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Taxes.TaxInfo.TaxBreakdown` (array, required)
    The breakdown of the tax for this tax code

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Fees` (object)
    Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Fees.@type` (string, required)
    Discriminator. Child class FeesDetail
    Example: "FeesDetail"

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Fees.TotalFees` (number)
    Total fees included in the TotalPrice. Supports up to 4 decimal places; decimal place needs to be included.
    Example: 111.11

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Fees.TotalAdditionalFeesPayableLocally` (number)
    Fees due separately at the property. Expected to be paid in local currency. These fees are not included in the Offer TotalPrice.
    Example: 2.1

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.Total` (number)
    Specifies the total price including base + taxes + fees
    Example: 30.13

  - `OfferHospitalityResponse.Offer.Price.VendorCurrencyTotal.approximateInd` (boolean)
    True if this amount has been converted from the original amount
    Example: true

  - `OfferHospitalityResponse.Offer.TermsAndConditionsFull` (array)

  - `OfferHospitalityResponse.Offer.TermsAndConditionsFull.@type` (string, required)
    'Discriminator classes for Air Price are TermsAndConditionsFullAir and TermsAndConditionsFullAncillary. 
Discriminator class for Hotel Rules and Reservation is TermsAndConditionsFullHospitality. 
Discriminator class for Vehicle Rules and Reservation is TermsAndConditionsFullVehicle. 
Discriminator classes for Reservation and Reservation Workbench APIs are TermsAndConditionsFullAir, TermsAndConditionsFullAncillary, TermsAndConditionsFullHospitality, TermsAndConditionsFullVehicle, TermsAndConditionsFullVehicle, and TermsAndConditionsFullScheduleChange.'
    Example: "TermsAndConditionsFullAir"

  - `OfferHospitalityResponse.Offer.TermsAndConditionsFull.id` (string)
    Local identifier within a given message for this object.
    Example: "TC_1"

  - `OfferHospitalityResponse.Offer.TermsAndConditionsFull.termsAndConditionsRef` (string)
    Used to reference another instance of this object in the same message.
    Example: "TC_1"

  - `OfferHospitalityResponse.Offer.TermsAndConditionsFull.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `OfferHospitalityResponse.Offer.passiveOfferInd` (boolean)
    Indicates aggregator segment built into PNR. Always send with true when using in a request. If returned true in a response, the Offer is passive for booking purposes.
    Example: true

  - `OfferHospitalityResponse.Offer.scheduleChangeInd` (boolean)
    If true, this Offer is subject to a schedule change.

  - `OfferHospitalityResponse.@type` (string)
    Example: "response"

  - `OfferHospitalityResponse.transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `OfferHospitalityResponse.traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `OfferHospitalityResponse.correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `OfferHospitalityResponse.reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `OfferHospitalityResponse.Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `OfferHospitalityResponse.Result.@type` (string)
    Discriminator class Result only
    Example: "Result"

  - `OfferHospitalityResponse.Result.status` (string)
    The status of an error or warning
    Enum: "Not processed", "Incomplete", "Complete", "Unknown"

  - `OfferHospitalityResponse.Result.Error` (array)
    A list of error information returned at the provider level for a response.

  - `OfferHospitalityResponse.Result.Error.@type` (string, required)
    Discriminator classes Error or ErrorDetail
    Example: "ErrorDetail"

  - `OfferHospitalityResponse.Result.Error.Message` (string)
    The Travelport standardized error or warning message
    Example: "No flights found."

  - `OfferHospitalityResponse.Result.Error.NameValuePair` (array)

  - `OfferHospitalityResponse.Result.Error.NameValuePair.value` (string)
    Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
    Example: "Sunday"

  - `OfferHospitalityResponse.Result.Error.NameValuePair.id` (string)
    Optional internally referenced id
    Example: "6"

  - `OfferHospitalityResponse.Result.Error.NameValuePair.name` (string, required)
    Key, categorizing the of type of remark or error.
    Example: "Day1"

  - `OfferHospitalityResponse.Result.Error.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `OfferHospitalityResponse.Result.Warning` (array)
    A list of warning information returned at the provider level for a response.

  - `OfferHospitalityResponse.Result.Warning.@type` (string, required)
    Discriminator classes Warning or WarningDetail
    Example: "WarningDetail"

  - `OfferHospitalityResponse.Result.Warning.Message` (string)
    The Travelport standardized error or warning message
    Example: "Customer Loyalty could not be applied."

  - `OfferHospitalityResponse.Result.Warning.NameValuePair` (array)

  - `OfferHospitalityResponse.Result.Warning.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `OfferHospitalityResponse.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `OfferHospitalityResponse.NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `OfferHospitalityResponse.NextSteps.baseURI` (string, required)
    The base portion of the uri in order to shorten the uris in the individual steps

  - `OfferHospitalityResponse.NextSteps.id` (string)
    Optional internally referenced id
    Example: "5"

  - `OfferHospitalityResponse.NextSteps.NextStep` (array, required)

  - `OfferHospitalityResponse.NextSteps.NextStep.value` (string)
    Example: "www.resourcelocation.com"

  - `OfferHospitalityResponse.NextSteps.NextStep.id` (string)
    Identifier for the Next Step
    Example: "2"

  - `OfferHospitalityResponse.NextSteps.NextStep.action` (string, required)
    The action this next step is intended to achieve
    Example: "cancel"

  - `OfferHospitalityResponse.NextSteps.NextStep.method` (string, required)
    Describes the set of potential methods that can be taken after an operation.
    Enum: "GET", "DELETE", "PUT", "POST"

  - `OfferHospitalityResponse.NextSteps.NextStep.description` (string)
    Additional clarification for the next step
    Example: "remove offer from the order"

  - `OfferHospitalityResponse.ReferenceList` (array)

  - `OfferHospitalityResponse.ReferenceList.@type` (string, required)
    Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
    Example: "ReferenceListFlight"

  - `OfferHospitalityResponse.ReferenceList.id` (string)
    Uniquely identifies for the Reference List

  - `OfferHospitalityResponse.CurrencyRateConversion` (array)

  - `OfferHospitalityResponse.CurrencyRateConversion.@type` (string)

  - `OfferHospitalityResponse.CurrencyRateConversion.SourceCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `OfferHospitalityResponse.CurrencyRateConversion.TargetCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `OfferHospitalityResponse.CurrencyRateConversion.ConversionRate` (object, required)
    Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

  - `OfferHospitalityResponse.CurrencyRateConversion.ConversionRate.value` (number)

  - `OfferHospitalityResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
    Contextual rate authority
    Example: "ISO 4217"

  - `OfferHospitalityResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
    Rate as of
    Example: "2026-08-07 12:12:00+00:00"

  - `OfferHospitalityResponse.Pagination` (object)
    Pagination object used when result sets span across a number of pages.

  - `OfferHospitalityResponse.Pagination.@type` (string, required)
    Example: "Pagination"

  - `OfferHospitalityResponse.Pagination.page` (integer, required)
    The current page number of the full result set
    Example: 1

  - `OfferHospitalityResponse.Pagination.pageSize` (integer, required)
    The total number of items on this page
    Example: 20

  - `OfferHospitalityResponse.Pagination.totalPages` (integer, required)
    The total number of pages in this result set
    Example: 5

  - `OfferHospitalityResponse.Pagination.totalItems` (integer, required)
    The total number of pages in this result set
    Example: 100

## Response 400 fields (application/json):

  - `@type` (string)
    Example: "response"

  - `transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `ReferenceList` (array)

  - `CurrencyRateConversion` (array)

  - `Pagination` (object)
    Pagination object used when result sets span across a number of pages.

