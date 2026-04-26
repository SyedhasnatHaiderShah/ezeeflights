# Travel Agency Details

Manage travel agency details that can be attached to a booking.

## Travel agency details (single payload)

- [POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency](https://developer.travelport.com/apis/flights/travel-agency-details/addagencydetails.md)

## Travel Agency Address

- [POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/addaddress](https://developer.travelport.com/apis/flights/travel-agency-details/addagencyaddress.md)

## Travel agency address

- [PUT /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/updateaddress](https://developer.travelport.com/apis/flights/travel-agency-details/updateagencyaddress.md)

## Travel agency address

- [DELETE /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/deleteaddress/{addressid}](https://developer.travelport.com/apis/flights/travel-agency-details/deleteagencyaddress.md)

## Travel agency corporate ID

- [POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/addcorporatecode](https://developer.travelport.com/apis/flights/travel-agency-details/addcorporatecode.md)

## Travel agency corporate ID

- [PUT /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/updatecorporatecode](https://developer.travelport.com/apis/flights/travel-agency-details/updatecorporatecode.md)

## Travel agency corporate ID

- [DELETE /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/deletecorporatecode](https://developer.travelport.com/apis/flights/travel-agency-details/deletecorporatecode.md)

## Travel agency email

- [POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/addemail](https://developer.travelport.com/apis/flights/travel-agency-details/addagencyemail.md)

## Travel agency email

- [PUT /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/updateemail](https://developer.travelport.com/apis/flights/travel-agency-details/updateagencyemail.md)

## Travel agency email

- [DELETE /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/deleteemail/{emailid}](https://developer.travelport.com/apis/flights/travel-agency-details/deleteagencyemail.md)

## Travel agency telephone

- [POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/addtelephone](https://developer.travelport.com/apis/flights/travel-agency-details/addagencytelephone.md)

## Travel agency telephone

- [PUT /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/updatetelephone](https://developer.travelport.com/apis/flights/travel-agency-details/updateagencytelephone.md)

## Travel agency telephone

- [DELETE /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/deletetelephone/{telephoneid}](https://developer.travelport.com/apis/flights/travel-agency-details/deleteagencytelephone.md)

# Travel agency details (single payload)

Endpoint: POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to add the travel agency details to
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

- `TravelAgencyQueryTravelAgency` (object)
  At least one property is required in the payload. For AF/KL NDC bookings both the Telephone and Email are required at time of Reservation commit.

- `TravelAgencyQueryTravelAgency.Address` (object)

- `TravelAgencyQueryTravelAgency.Address.role` (string)
  Defines the type of location the address is assigned to. For TravelAgency address leave blank or use "Other".
  Enum: "Home", "Business", "Mailing", "Delivery", "Destination", "Other", "Billing"

- `TravelAgencyQueryTravelAgency.Address.Addressee` (string)
  The name of the company or person to be addressed
  Example: "MRS A Agent"

- `TravelAgencyQueryTravelAgency.Address.AddressLine` (array)
  Street address. Use in place of Street and Number. Each element of the array represents an address line.
  Example: "2035 S Havana street"

- `TravelAgencyQueryTravelAgency.Address.City` (string)
  City, town, or postal station.
  Example: "Denver"

- `TravelAgencyQueryTravelAgency.Address.StateProv` (object)
  The standard code or abbreviation for the state, province, or region. May also include full length name.

- `TravelAgencyQueryTravelAgency.Address.StateProv.value` (string)
  State, province, or region code needed to identify location (typically two characters).
  Example: "CA"

- `TravelAgencyQueryTravelAgency.Address.StateProv.name` (string)
  State, province, or region name needed to identify location.
  Example: "California"

- `TravelAgencyQueryTravelAgency.Address.Country` (object)
  Contains the information needed to identify a country.

- `TravelAgencyQueryTravelAgency.Address.Country.value` (string)
  The ISO 3166 code for the property's address.
  Example: "US"

- `TravelAgencyQueryTravelAgency.Address.Country.id` (string)
  Custom user-assigned identifier for the country.
  Example: "23"

- `TravelAgencyQueryTravelAgency.Address.Country.name` (string)
  The full name of the country for the property's address.
  Example: "United States"

- `TravelAgencyQueryTravelAgency.Address.Country.codeContext` (string)
  The source of a code, such as the organization that provided the id number
  Example: "IATA"

- `TravelAgencyQueryTravelAgency.Address.PostalCode` (string)
  Postal code for the address.
  Example: "Sl6 1AB"

- `TravelAgencyQueryTravelAgency.Telephone` (array)

- `TravelAgencyQueryTravelAgency.Telephone.role` (string)
  Defines the type of location the Telephone is assigned to. For Travel Agency telephone select "Other" or leave blank.
  Enum: "Mobile", "Home", "Work", "Office", "Fax", "Other"

- `TravelAgencyQueryTravelAgency.Telephone.cityCode` (string)
  City Code
  Example: "DEN"

- `TravelAgencyQueryTravelAgency.Telephone.countryAccessCode` (string)
  Telephone Country Access Code
  Example: "1"

- `TravelAgencyQueryTravelAgency.Telephone.areaCityCode` (string)
  Telephone Area CityCode
  Example: "972"

- `TravelAgencyQueryTravelAgency.Telephone.phoneNumber` (string)
  Mobile/Telephone Number
  Example: "972-000-787"

- `TravelAgencyQueryTravelAgency.Telephone.extension` (string)
  Telephone extension number
  Example: "234"

- `TravelAgencyQueryTravelAgency.Email` (object)
  email addresses

- `TravelAgencyQueryTravelAgency.Email.value` (string)
  Example: "exampledomain@example.com"

- `TravelAgencyQueryTravelAgency.CorporateCode` (string)
  A reference assigned by the Travel Agency to identify the corporate organization
  Example: "Air Agency"

## Response 201 fields (application/json):

- `TravelAgency` (object)

- `TravelAgency.@type` (string, required)
  Discriminator classes TravelAgency, TravelAgencyID, or TravelAgencyDetail
  Example: "TravelAgencyDetail"

- `TravelAgency.id` (string)
  Simple xsd id, not for external use
  Example: "2"

- `TravelAgency.TravelOrganizationRef` (string)
  An organization that has a name and a structure and members and directly works in the travel industry
  Example: "TravelAgency_1"

- `TravelAgency.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelAgency.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TravelAgency.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

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

- `Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `Result.Error.NameValuePair` (array)

- `Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `Result.Warning.NameValuePair` (array)

- `Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `NextSteps.NextStep` (array, required)

- `NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ReferenceList` (array)

- `ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CurrencyRateConversion` (array)

- `CurrencyRateConversion.@type` (string)

- `CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CurrencyRateConversion.ConversionRate.value` (number)

- `CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `Pagination.@type` (string, required)
  Example: "Pagination"

- `Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `Pagination.totalItems` (integer, required)
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

# Travel Agency Address

Endpoint: POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/addaddress
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to add the travel agency details to
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

- `TravelAgencyQueryTravelAgencyAddress` (object)

- `TravelAgencyQueryTravelAgencyAddress.Address` (object, required)
  The extended class of Address.

- `TravelAgencyQueryTravelAgencyAddress.Address.@type` (string, required)
  Discriminator classes include Address or AddressDetail
  Example: "AddressDetail"

- `TravelAgencyQueryTravelAgencyAddress.Address.id` (string)
  unique address id
  Example: "Address_1"

- `TravelAgencyQueryTravelAgencyAddress.Address.BldgRoom` (object)
  Address with building and room number

- `TravelAgencyQueryTravelAgencyAddress.Address.BldgRoom.value` (string)
  Example: "Moore House"

- `TravelAgencyQueryTravelAgencyAddress.Address.BldgRoom.buldingInd` (boolean)
  When true, the information is a building name. When false, it is an apartment or room #
  Example: true

- `TravelAgencyQueryTravelAgencyAddress.Address.Number` (object)
  The street number alone is the numerical number that precedes the street name in the address.

- `TravelAgencyQueryTravelAgencyAddress.Address.Number.value` (string)
  Street number value.
  Example: "23B"

- `TravelAgencyQueryTravelAgencyAddress.Address.Number.streetNmbrSuffix` (string)
  Street Number Suffix
  Example: "B"

- `TravelAgencyQueryTravelAgencyAddress.Address.Number.streetDirection` (string)
  Direction of the Street
  Example: "NW"

- `TravelAgencyQueryTravelAgencyAddress.Address.Number.ruralRouteNmbr` (string)
  RuralRoute Number
  Example: "76"

- `TravelAgencyQueryTravelAgencyAddress.Address.Number.po_Box` (string)
  PO Box Number
  Example: "1001"

- `TravelAgencyQueryTravelAgencyAddress.Address.Street` (string)
  Street name. May also contain the street number when the Number element is missing.
  Example: "ABC Street"

- `TravelAgencyQueryTravelAgencyAddress.Address.AddressLine` (array)
  Property street address. Used in place of Street and Number. Each element of the array represents an address line.
  Example: ["2035 S Havana street"]

- `TravelAgencyQueryTravelAgencyAddress.Address.City` (string, required)
  Full name of the city, town, or postal station (i.e., a postal service territory, often used in a military address).
  Example: "Dublin"

- `TravelAgencyQueryTravelAgencyAddress.Address.County` (string)
  County or Region Name.
  Example: "Berkshire"

- `TravelAgencyQueryTravelAgencyAddress.Address.StateProv` (object)
  The standard code or abbreviation for the state, province, or region. May also include full length name.

- `TravelAgencyQueryTravelAgencyAddress.Address.StateProv.value` (string)
  State, province, or region code needed to identify location (typically two characters).
  Example: "CA"

- `TravelAgencyQueryTravelAgencyAddress.Address.StateProv.name` (string)
  State, province, or region name needed to identify location.
  Example: "California"

- `TravelAgencyQueryTravelAgencyAddress.Address.Country` (object)
  Contains the information needed to identify a country.

- `TravelAgencyQueryTravelAgencyAddress.Address.Country.value` (string)
  The ISO 3166 code for the property's address.
  Example: "US"

- `TravelAgencyQueryTravelAgencyAddress.Address.Country.id` (string)
  Custom user-assigned identifier for the country.
  Example: "23"

- `TravelAgencyQueryTravelAgencyAddress.Address.Country.name` (string)
  The full name of the country for the property's address.
  Example: "United States"

- `TravelAgencyQueryTravelAgencyAddress.Address.Country.codeContext` (string)
  The source of a code, such as the organization that provided the id number
  Example: "IATA"

- `TravelAgencyQueryTravelAgencyAddress.Address.PostalCode` (string)
  Postal code for the address.
  Example: "Sl6 1AB"

- `TravelAgencyQueryTravelAgencyAddress.Address.Addressee` (string)
  The name of the company or person to be addressed
  Example: "ACME INC"

- `TravelAgencyQueryTravelAgencyAddress.Address.role` (string)
  Defines the type of location the address is assigned to. For TravelAgency address leave blank or use "Other".
  Enum: "Home", "Business", "Mailing", "Delivery", "Destination", "Other", "Billing"

- `TravelAgencyQueryTravelAgencyAddress.Address.addressType` (string)
  OTA code for address type
  Example: "CLT"

- `TravelAgencyQueryTravelAgencyAddress.Address.use` (string)
  OTA code for address use
  Example: "AUT"

- `TravelAgencyQueryTravelAgencyAddress.Address.Comment` (object)
  Textual information.

- `TravelAgencyQueryTravelAgencyAddress.Address.Comment.value` (string)
  Actual text. May be restricted by character limits based on the type of comment (e.g. Notepad remarks limited to 87 characters).
  Example: "Additional comments"

- `TravelAgencyQueryTravelAgencyAddress.Address.Comment.id` (string)
  Local identifier within a given message for this object.
  Example: "comment_1"

- `TravelAgencyQueryTravelAgencyAddress.Address.Comment.name` (string)
  Title of comment or type of remark.
  Example: "Comment name"

- `TravelAgencyQueryTravelAgencyAddress.Address.Comment.language` (string)
  Language code using ISO-639 standard
  Example: "EN"

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy` (object)
  Confidential details for marketing purpose

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy.id` (string)
  Optional internally referenced id
  Example: "2"

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy.shareMarketing` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy.shareSync` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy.optOutInd` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy.optInStatus` (string)
  Used to indicate marketing preferences, OptIn, OptOut
  Enum: "OptedIn", "OptedOut", "Unknown"

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy.optInDate` (string)
  The datetime of receiving the opt in notice
  Example: "2026-08-07 12:12:00+00:00"

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy.optOutDate` (string)
  The datetime the opt out notice was received
  Example: "2026-08-07 12:12:00+00:00"

- `TravelAgencyQueryTravelAgencyAddress.Address.Priority` (integer)
  The priority ranking within the group
  Example: 1

- `TravelAgencyQueryTravelAgencyAddress.Address.validInd` (boolean)
  If true, this is a valid and complete mailing address that has been verified through an address verification service or previously mailed materials have not been returned.

- `TravelAgencyQueryTravelAgencyAddress.Address.provisionedInd` (boolean)
  If true, this address came into the system through provisioning

## Response 201 fields (application/json):

- `TravelAgency` (object)

- `TravelAgency.@type` (string, required)
  Discriminator classes TravelAgency, TravelAgencyID, or TravelAgencyDetail
  Example: "TravelAgencyDetail"

- `TravelAgency.id` (string)
  Simple xsd id, not for external use
  Example: "2"

- `TravelAgency.TravelOrganizationRef` (string)
  An organization that has a name and a structure and members and directly works in the travel industry
  Example: "TravelAgency_1"

- `TravelAgency.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelAgency.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TravelAgency.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

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

- `Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `Result.Error.NameValuePair` (array)

- `Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `Result.Warning.NameValuePair` (array)

- `Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `NextSteps.NextStep` (array, required)

- `NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ReferenceList` (array)

- `ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CurrencyRateConversion` (array)

- `CurrencyRateConversion.@type` (string)

- `CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CurrencyRateConversion.ConversionRate.value` (number)

- `CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `Pagination.@type` (string, required)
  Example: "Pagination"

- `Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `Pagination.totalItems` (integer, required)
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

# Travel agency address

Endpoint: PUT /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/updateaddress
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to update the travel agency details
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `id` (string, required)
  The unique Travel Agency ID
  Example: "agency_001"

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

- `TravelAgencyQueryTravelAgencyAddress` (object)

- `TravelAgencyQueryTravelAgencyAddress.Address` (object, required)
  The extended class of Address.

- `TravelAgencyQueryTravelAgencyAddress.Address.@type` (string, required)
  Discriminator classes include Address or AddressDetail
  Example: "AddressDetail"

- `TravelAgencyQueryTravelAgencyAddress.Address.id` (string)
  unique address id
  Example: "Address_1"

- `TravelAgencyQueryTravelAgencyAddress.Address.BldgRoom` (object)
  Address with building and room number

- `TravelAgencyQueryTravelAgencyAddress.Address.BldgRoom.value` (string)
  Example: "Moore House"

- `TravelAgencyQueryTravelAgencyAddress.Address.BldgRoom.buldingInd` (boolean)
  When true, the information is a building name. When false, it is an apartment or room #
  Example: true

- `TravelAgencyQueryTravelAgencyAddress.Address.Number` (object)
  The street number alone is the numerical number that precedes the street name in the address.

- `TravelAgencyQueryTravelAgencyAddress.Address.Number.value` (string)
  Street number value.
  Example: "23B"

- `TravelAgencyQueryTravelAgencyAddress.Address.Number.streetNmbrSuffix` (string)
  Street Number Suffix
  Example: "B"

- `TravelAgencyQueryTravelAgencyAddress.Address.Number.streetDirection` (string)
  Direction of the Street
  Example: "NW"

- `TravelAgencyQueryTravelAgencyAddress.Address.Number.ruralRouteNmbr` (string)
  RuralRoute Number
  Example: "76"

- `TravelAgencyQueryTravelAgencyAddress.Address.Number.po_Box` (string)
  PO Box Number
  Example: "1001"

- `TravelAgencyQueryTravelAgencyAddress.Address.Street` (string)
  Street name. May also contain the street number when the Number element is missing.
  Example: "ABC Street"

- `TravelAgencyQueryTravelAgencyAddress.Address.AddressLine` (array)
  Property street address. Used in place of Street and Number. Each element of the array represents an address line.
  Example: ["2035 S Havana street"]

- `TravelAgencyQueryTravelAgencyAddress.Address.City` (string, required)
  Full name of the city, town, or postal station (i.e., a postal service territory, often used in a military address).
  Example: "Dublin"

- `TravelAgencyQueryTravelAgencyAddress.Address.County` (string)
  County or Region Name.
  Example: "Berkshire"

- `TravelAgencyQueryTravelAgencyAddress.Address.StateProv` (object)
  The standard code or abbreviation for the state, province, or region. May also include full length name.

- `TravelAgencyQueryTravelAgencyAddress.Address.StateProv.value` (string)
  State, province, or region code needed to identify location (typically two characters).
  Example: "CA"

- `TravelAgencyQueryTravelAgencyAddress.Address.StateProv.name` (string)
  State, province, or region name needed to identify location.
  Example: "California"

- `TravelAgencyQueryTravelAgencyAddress.Address.Country` (object)
  Contains the information needed to identify a country.

- `TravelAgencyQueryTravelAgencyAddress.Address.Country.value` (string)
  The ISO 3166 code for the property's address.
  Example: "US"

- `TravelAgencyQueryTravelAgencyAddress.Address.Country.id` (string)
  Custom user-assigned identifier for the country.
  Example: "23"

- `TravelAgencyQueryTravelAgencyAddress.Address.Country.name` (string)
  The full name of the country for the property's address.
  Example: "United States"

- `TravelAgencyQueryTravelAgencyAddress.Address.Country.codeContext` (string)
  The source of a code, such as the organization that provided the id number
  Example: "IATA"

- `TravelAgencyQueryTravelAgencyAddress.Address.PostalCode` (string)
  Postal code for the address.
  Example: "Sl6 1AB"

- `TravelAgencyQueryTravelAgencyAddress.Address.Addressee` (string)
  The name of the company or person to be addressed
  Example: "ACME INC"

- `TravelAgencyQueryTravelAgencyAddress.Address.role` (string)
  Defines the type of location the address is assigned to. For TravelAgency address leave blank or use "Other".
  Enum: "Home", "Business", "Mailing", "Delivery", "Destination", "Other", "Billing"

- `TravelAgencyQueryTravelAgencyAddress.Address.addressType` (string)
  OTA code for address type
  Example: "CLT"

- `TravelAgencyQueryTravelAgencyAddress.Address.use` (string)
  OTA code for address use
  Example: "AUT"

- `TravelAgencyQueryTravelAgencyAddress.Address.Comment` (object)
  Textual information.

- `TravelAgencyQueryTravelAgencyAddress.Address.Comment.value` (string)
  Actual text. May be restricted by character limits based on the type of comment (e.g. Notepad remarks limited to 87 characters).
  Example: "Additional comments"

- `TravelAgencyQueryTravelAgencyAddress.Address.Comment.id` (string)
  Local identifier within a given message for this object.
  Example: "comment_1"

- `TravelAgencyQueryTravelAgencyAddress.Address.Comment.name` (string)
  Title of comment or type of remark.
  Example: "Comment name"

- `TravelAgencyQueryTravelAgencyAddress.Address.Comment.language` (string)
  Language code using ISO-639 standard
  Example: "EN"

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy` (object)
  Confidential details for marketing purpose

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy.id` (string)
  Optional internally referenced id
  Example: "2"

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy.shareMarketing` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy.shareSync` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy.optOutInd` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy.optInStatus` (string)
  Used to indicate marketing preferences, OptIn, OptOut
  Enum: "OptedIn", "OptedOut", "Unknown"

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy.optInDate` (string)
  The datetime of receiving the opt in notice
  Example: "2026-08-07 12:12:00+00:00"

- `TravelAgencyQueryTravelAgencyAddress.Address.Privacy.optOutDate` (string)
  The datetime the opt out notice was received
  Example: "2026-08-07 12:12:00+00:00"

- `TravelAgencyQueryTravelAgencyAddress.Address.Priority` (integer)
  The priority ranking within the group
  Example: 1

- `TravelAgencyQueryTravelAgencyAddress.Address.validInd` (boolean)
  If true, this is a valid and complete mailing address that has been verified through an address verification service or previously mailed materials have not been returned.

- `TravelAgencyQueryTravelAgencyAddress.Address.provisionedInd` (boolean)
  If true, this address came into the system through provisioning

## Response 200 fields (application/json):

- `TravelAgency` (object)

- `TravelAgency.@type` (string, required)
  Discriminator classes TravelAgency, TravelAgencyID, or TravelAgencyDetail
  Example: "TravelAgencyDetail"

- `TravelAgency.id` (string)
  Simple xsd id, not for external use
  Example: "2"

- `TravelAgency.TravelOrganizationRef` (string)
  An organization that has a name and a structure and members and directly works in the travel industry
  Example: "TravelAgency_1"

- `TravelAgency.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelAgency.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TravelAgency.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

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

- `Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `Result.Error.NameValuePair` (array)

- `Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `Result.Warning.NameValuePair` (array)

- `Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `NextSteps.NextStep` (array, required)

- `NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ReferenceList` (array)

- `ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CurrencyRateConversion` (array)

- `CurrencyRateConversion.@type` (string)

- `CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CurrencyRateConversion.ConversionRate.value` (number)

- `CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `Pagination.@type` (string, required)
  Example: "Pagination"

- `Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `Pagination.totalItems` (integer, required)
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

# Travel agency address

Endpoint: DELETE /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/deleteaddress/{addressid}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to delete the travel agency details
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `id` (string, required)
  The unique Travel Agency ID
  Example: "agency_001"

- `addressid` (string, required)
  The unique agency address id
  Example: "address_001"

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

- `TravelAgency` (object)

- `TravelAgency.@type` (string, required)
  Discriminator classes TravelAgency, TravelAgencyID, or TravelAgencyDetail
  Example: "TravelAgencyDetail"

- `TravelAgency.id` (string)
  Simple xsd id, not for external use
  Example: "2"

- `TravelAgency.TravelOrganizationRef` (string)
  An organization that has a name and a structure and members and directly works in the travel industry
  Example: "TravelAgency_1"

- `TravelAgency.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelAgency.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TravelAgency.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

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

- `Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `Result.Error.NameValuePair` (array)

- `Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `Result.Warning.NameValuePair` (array)

- `Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `NextSteps.NextStep` (array, required)

- `NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ReferenceList` (array)

- `ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CurrencyRateConversion` (array)

- `CurrencyRateConversion.@type` (string)

- `CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CurrencyRateConversion.ConversionRate.value` (number)

- `CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `Pagination.@type` (string, required)
  Example: "Pagination"

- `Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `Pagination.totalItems` (integer, required)
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

# Travel agency corporate ID

Endpoint: POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/addcorporatecode
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to add the travel agency details to
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

- `TravelAgencyQueryTravelAgencyCorporateCode` (object)

- `TravelAgencyQueryTravelAgencyCorporateCode.CorporateCode` (string, required)
  A reference assigned by the Travel Agency to identify the corporate organization
  Example: "Air Agency"

## Response 201 fields (application/json):

- `TravelAgency` (object)

- `TravelAgency.@type` (string, required)
  Discriminator classes TravelAgency, TravelAgencyID, or TravelAgencyDetail
  Example: "TravelAgencyDetail"

- `TravelAgency.id` (string)
  Simple xsd id, not for external use
  Example: "2"

- `TravelAgency.TravelOrganizationRef` (string)
  An organization that has a name and a structure and members and directly works in the travel industry
  Example: "TravelAgency_1"

- `TravelAgency.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelAgency.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TravelAgency.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

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

- `Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `Result.Error.NameValuePair` (array)

- `Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `Result.Warning.NameValuePair` (array)

- `Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `NextSteps.NextStep` (array, required)

- `NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ReferenceList` (array)

- `ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CurrencyRateConversion` (array)

- `CurrencyRateConversion.@type` (string)

- `CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CurrencyRateConversion.ConversionRate.value` (number)

- `CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `Pagination.@type` (string, required)
  Example: "Pagination"

- `Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `Pagination.totalItems` (integer, required)
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

# Travel agency corporate ID

Endpoint: DELETE /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/deletecorporatecode
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to delete the travel agency details from
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `id` (string, required)
  The unique travel agency id
  Example: "agency_001"

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

- `TravelAgency` (object)

- `TravelAgency.@type` (string, required)
  Discriminator classes TravelAgency, TravelAgencyID, or TravelAgencyDetail
  Example: "TravelAgencyDetail"

- `TravelAgency.id` (string)
  Simple xsd id, not for external use
  Example: "2"

- `TravelAgency.TravelOrganizationRef` (string)
  An organization that has a name and a structure and members and directly works in the travel industry
  Example: "TravelAgency_1"

- `TravelAgency.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelAgency.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TravelAgency.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

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

- `Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `Result.Error.NameValuePair` (array)

- `Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `Result.Warning.NameValuePair` (array)

- `Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `NextSteps.NextStep` (array, required)

- `NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ReferenceList` (array)

- `ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CurrencyRateConversion` (array)

- `CurrencyRateConversion.@type` (string)

- `CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CurrencyRateConversion.ConversionRate.value` (number)

- `CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `Pagination.@type` (string, required)
  Example: "Pagination"

- `Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `Pagination.totalItems` (integer, required)
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

# Travel agency email

Endpoint: POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/addemail
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to add the travel agency details to
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

- `TravelAgencyQueryTravelAgencyEmail` (object)
  Example: "john@travelport.com"

- `TravelAgencyQueryTravelAgencyEmail.Email` (object, required)
  Electronic email addresses, in IETF specified format.
  Booking.com requires a traveler email address in the Hotel Create Reservation and Add Reservation requests. A system-generated confirmation email is sent to the traveler after the booking completes.

- `TravelAgencyQueryTravelAgencyEmail.Email.value` (string)
  Example: "exampledomain@example.com"

- `TravelAgencyQueryTravelAgencyEmail.Email.id` (string)
  Electronic email addresses, in IETF specified format.
  Example: "email_1"

- `TravelAgencyQueryTravelAgencyEmail.Email.emailType` (string)
  Use email type to specify if the email is to be sent "TO" or sent "FROM"
  Example: "FROM"

- `TravelAgencyQueryTravelAgencyEmail.Email.comment` (string)
  Comments associated to the email

- `TravelAgencyQueryTravelAgencyEmail.Email.preferredFormat` (string)
  Mime media type
  Example: "text/html"

- `TravelAgencyQueryTravelAgencyEmail.Email.shareMarketing` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyEmail.Email.shareSync` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyEmail.Email.optOutInd` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyEmail.Email.optInStatus` (string)
  Used to indicate marketing preferences, OptIn, OptOut
  Enum: "OptedIn", "OptedOut", "Unknown"

- `TravelAgencyQueryTravelAgencyEmail.Email.optInDate` (string)
  The datetime of receiving the opt in notice
  Example: "2026-03-03 11:11:00+00:00"

- `TravelAgencyQueryTravelAgencyEmail.Email.optOutDate` (string)
  The datetime the opt out notice was received
  Example: "2026-03-03 11:11:00+00:00"

- `TravelAgencyQueryTravelAgencyEmail.Email.validInd` (boolean)
  If true, this is a valid email address that has been system verified via a successful email transmission.
  Example: true

- `TravelAgencyQueryTravelAgencyEmail.Email.provisionedInd` (boolean)
  If true then the email address came from the provisioning process
  Example: true

## Response 201 fields (application/json):

- `TravelAgency` (object)

- `TravelAgency.@type` (string, required)
  Discriminator classes TravelAgency, TravelAgencyID, or TravelAgencyDetail
  Example: "TravelAgencyDetail"

- `TravelAgency.id` (string)
  Simple xsd id, not for external use
  Example: "2"

- `TravelAgency.TravelOrganizationRef` (string)
  An organization that has a name and a structure and members and directly works in the travel industry
  Example: "TravelAgency_1"

- `TravelAgency.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelAgency.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TravelAgency.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

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

- `Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `Result.Error.NameValuePair` (array)

- `Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `Result.Warning.NameValuePair` (array)

- `Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `NextSteps.NextStep` (array, required)

- `NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ReferenceList` (array)

- `ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CurrencyRateConversion` (array)

- `CurrencyRateConversion.@type` (string)

- `CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CurrencyRateConversion.ConversionRate.value` (number)

- `CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `Pagination.@type` (string, required)
  Example: "Pagination"

- `Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `Pagination.totalItems` (integer, required)
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

# Travel agency email

Endpoint: PUT /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/updateemail
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to update the travel agency details
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `id` (string, required)
  Identifier provides the ability to create a globally unique identifier. For the identifier to be globally unique it must have a system provided identifier and the system must be identified using a global naming authority. System identification uses the domain naming system (DNS) to assure they are globally unique and should be an URL.

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

- `TravelAgencyQueryTravelAgencyEmail` (object)
  Example: "john@travelport.com"

- `TravelAgencyQueryTravelAgencyEmail.Email` (object, required)
  Electronic email addresses, in IETF specified format.
  Booking.com requires a traveler email address in the Hotel Create Reservation and Add Reservation requests. A system-generated confirmation email is sent to the traveler after the booking completes.

- `TravelAgencyQueryTravelAgencyEmail.Email.value` (string)
  Example: "exampledomain@example.com"

- `TravelAgencyQueryTravelAgencyEmail.Email.id` (string)
  Electronic email addresses, in IETF specified format.
  Example: "email_1"

- `TravelAgencyQueryTravelAgencyEmail.Email.emailType` (string)
  Use email type to specify if the email is to be sent "TO" or sent "FROM"
  Example: "FROM"

- `TravelAgencyQueryTravelAgencyEmail.Email.comment` (string)
  Comments associated to the email

- `TravelAgencyQueryTravelAgencyEmail.Email.preferredFormat` (string)
  Mime media type
  Example: "text/html"

- `TravelAgencyQueryTravelAgencyEmail.Email.shareMarketing` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyEmail.Email.shareSync` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyEmail.Email.optOutInd` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyEmail.Email.optInStatus` (string)
  Used to indicate marketing preferences, OptIn, OptOut
  Enum: "OptedIn", "OptedOut", "Unknown"

- `TravelAgencyQueryTravelAgencyEmail.Email.optInDate` (string)
  The datetime of receiving the opt in notice
  Example: "2026-03-03 11:11:00+00:00"

- `TravelAgencyQueryTravelAgencyEmail.Email.optOutDate` (string)
  The datetime the opt out notice was received
  Example: "2026-03-03 11:11:00+00:00"

- `TravelAgencyQueryTravelAgencyEmail.Email.validInd` (boolean)
  If true, this is a valid email address that has been system verified via a successful email transmission.
  Example: true

- `TravelAgencyQueryTravelAgencyEmail.Email.provisionedInd` (boolean)
  If true then the email address came from the provisioning process
  Example: true

## Response 200 fields (application/json):

- `TravelAgency` (object)

- `TravelAgency.@type` (string, required)
  Discriminator classes TravelAgency, TravelAgencyID, or TravelAgencyDetail
  Example: "TravelAgencyDetail"

- `TravelAgency.id` (string)
  Simple xsd id, not for external use
  Example: "2"

- `TravelAgency.TravelOrganizationRef` (string)
  An organization that has a name and a structure and members and directly works in the travel industry
  Example: "TravelAgency_1"

- `TravelAgency.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelAgency.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TravelAgency.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

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

- `Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `Result.Error.NameValuePair` (array)

- `Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `Result.Warning.NameValuePair` (array)

- `Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `NextSteps.NextStep` (array, required)

- `NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ReferenceList` (array)

- `ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CurrencyRateConversion` (array)

- `CurrencyRateConversion.@type` (string)

- `CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CurrencyRateConversion.ConversionRate.value` (number)

- `CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `Pagination.@type` (string, required)
  Example: "Pagination"

- `Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `Pagination.totalItems` (integer, required)
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

# Travel agency email

Endpoint: DELETE /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/deleteemail/{emailid}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to delete the travel agency details from
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `id` (string, required)
  The unique travel agency id
  Example: "agency_001"

- `emailid` (string, required)
  The unique email id
  Example: "email_001"

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

- `TravelAgency` (object)

- `TravelAgency.@type` (string, required)
  Discriminator classes TravelAgency, TravelAgencyID, or TravelAgencyDetail
  Example: "TravelAgencyDetail"

- `TravelAgency.id` (string)
  Simple xsd id, not for external use
  Example: "2"

- `TravelAgency.TravelOrganizationRef` (string)
  An organization that has a name and a structure and members and directly works in the travel industry
  Example: "TravelAgency_1"

- `TravelAgency.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelAgency.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TravelAgency.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

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

- `Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `Result.Error.NameValuePair` (array)

- `Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `Result.Warning.NameValuePair` (array)

- `Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `NextSteps.NextStep` (array, required)

- `NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ReferenceList` (array)

- `ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CurrencyRateConversion` (array)

- `CurrencyRateConversion.@type` (string)

- `CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CurrencyRateConversion.ConversionRate.value` (number)

- `CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `Pagination.@type` (string, required)
  Example: "Pagination"

- `Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `Pagination.totalItems` (integer, required)
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

# Travel agency telephone

Endpoint: POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/addtelephone
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to add the travel agency details to
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

- `TravelAgencyQueryTravelAgencyTelephone` (object)
  Example: 553467891

- `TravelAgencyQueryTravelAgencyTelephone.Telephone` (object, required)
  Extended class of Telephone

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.@type` (string, required)
  Discriminator classes Telephone or TelephoneDetail
  Example: "Telephone"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.countryAccessCode` (string)
  Phone country code
  Example: "1"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.areaCityCode` (string)
  Phone local area code
  Example: "972"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.phoneNumber` (string, required)
  Mobile/Telephone Number. Accepted characters are numeric, dash, space, and period.
  Example: "972-000-787"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.extension` (string)
  Telephone extension number
  Example: "234"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.id` (string)
  Optional internally referenced id
  Example: "3"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.cityCode` (string)
  IATA city code if referenced by phone number.
  Example: "DEN"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.role` (string)
  Defines the type of location the Telephone is assigned to. For Travel Agency telephone select "Other" or leave blank.
  Enum: "Mobile", "Home", "Work", "Office", "Fax", "Other"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.phoneLocationType` (string)
  Location of the phone
  Example: "Agency"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.phoneTechType` (string)
  Indicates the type of technology associated with the telephone number
  Example: "Voice"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.phoneUseType` (string)
  Agency code for how phone is used (e.g., Home, Business, Emergency Contact, Travel Arranger, Day, Evening).
  Example: "Home"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.pin` (string)
  Additional codes used for telephone
  Example: "3456"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.priority` (integer)
  Priority
  Example: 1

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy` (object)
  Confidential details for marketing purpose

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy.id` (string)
  Optional internally referenced id
  Example: "2"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy.shareMarketing` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy.shareSync` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy.optOutInd` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy.optInStatus` (string)
  Used to indicate marketing preferences, OptIn, OptOut
  Enum: "OptedIn", "OptedOut", "Unknown"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy.optInDate` (string)
  The datetime of receiving the opt in notice
  Example: "2026-08-07 12:12:00+00:00"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy.optOutDate` (string)
  The datetime the opt out notice was received
  Example: "2026-08-07 12:12:00+00:00"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Enum_TelephoneRole` (string)
  Defines the type of location the Telephone is assigned to. For Travel Agency telephone select "Other" or leave blank.
  Enum: "Mobile", "Home", "Work", "Office", "Fax", "Other"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Comment` (object)
  Textual information.

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Comment.value` (string)
  Actual text. May be restricted by character limits based on the type of comment (e.g. Notepad remarks limited to 87 characters).
  Example: "Additional comments"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Comment.id` (string)
  Local identifier within a given message for this object.
  Example: "comment_1"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Comment.name` (string)
  Title of comment or type of remark.
  Example: "Comment name"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Comment.language` (string)
  Language code using ISO-639 standard
  Example: "EN"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.defaultInd` (boolean)
  When true, indicates a default value should be used.
  Example: true

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.provisionedInd` (boolean)
  true indicates this phone number was created through provisioned

## Response 201 fields (application/json):

- `TravelAgency` (object)

- `TravelAgency.@type` (string, required)
  Discriminator classes TravelAgency, TravelAgencyID, or TravelAgencyDetail
  Example: "TravelAgencyDetail"

- `TravelAgency.id` (string)
  Simple xsd id, not for external use
  Example: "2"

- `TravelAgency.TravelOrganizationRef` (string)
  An organization that has a name and a structure and members and directly works in the travel industry
  Example: "TravelAgency_1"

- `TravelAgency.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelAgency.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TravelAgency.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

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

- `Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `Result.Error.NameValuePair` (array)

- `Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `Result.Warning.NameValuePair` (array)

- `Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `NextSteps.NextStep` (array, required)

- `NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ReferenceList` (array)

- `ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CurrencyRateConversion` (array)

- `CurrencyRateConversion.@type` (string)

- `CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CurrencyRateConversion.ConversionRate.value` (number)

- `CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `Pagination.@type` (string, required)
  Example: "Pagination"

- `Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `Pagination.totalItems` (integer, required)
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

# Travel agency telephone

Endpoint: PUT /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/updatetelephone
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to update the travel agency details
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `id` (string, required)
  The unique travel agency id
  Example: "agency_001"

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

- `TravelAgencyQueryTravelAgencyTelephone` (object)
  Example: 553467891

- `TravelAgencyQueryTravelAgencyTelephone.Telephone` (object, required)
  Extended class of Telephone

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.@type` (string, required)
  Discriminator classes Telephone or TelephoneDetail
  Example: "Telephone"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.countryAccessCode` (string)
  Phone country code
  Example: "1"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.areaCityCode` (string)
  Phone local area code
  Example: "972"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.phoneNumber` (string, required)
  Mobile/Telephone Number. Accepted characters are numeric, dash, space, and period.
  Example: "972-000-787"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.extension` (string)
  Telephone extension number
  Example: "234"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.id` (string)
  Optional internally referenced id
  Example: "3"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.cityCode` (string)
  IATA city code if referenced by phone number.
  Example: "DEN"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.role` (string)
  Defines the type of location the Telephone is assigned to. For Travel Agency telephone select "Other" or leave blank.
  Enum: "Mobile", "Home", "Work", "Office", "Fax", "Other"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.phoneLocationType` (string)
  Location of the phone
  Example: "Agency"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.phoneTechType` (string)
  Indicates the type of technology associated with the telephone number
  Example: "Voice"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.phoneUseType` (string)
  Agency code for how phone is used (e.g., Home, Business, Emergency Contact, Travel Arranger, Day, Evening).
  Example: "Home"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.pin` (string)
  Additional codes used for telephone
  Example: "3456"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.priority` (integer)
  Priority
  Example: 1

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy` (object)
  Confidential details for marketing purpose

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy.id` (string)
  Optional internally referenced id
  Example: "2"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy.shareMarketing` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy.shareSync` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy.optOutInd` (string)
  Used to indicate marketing preferences, Yes, No, Inherit
  Enum: "Yes", "No", "Inherit"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy.optInStatus` (string)
  Used to indicate marketing preferences, OptIn, OptOut
  Enum: "OptedIn", "OptedOut", "Unknown"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy.optInDate` (string)
  The datetime of receiving the opt in notice
  Example: "2026-08-07 12:12:00+00:00"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Privacy.optOutDate` (string)
  The datetime the opt out notice was received
  Example: "2026-08-07 12:12:00+00:00"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Enum_TelephoneRole` (string)
  Defines the type of location the Telephone is assigned to. For Travel Agency telephone select "Other" or leave blank.
  Enum: "Mobile", "Home", "Work", "Office", "Fax", "Other"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Comment` (object)
  Textual information.

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Comment.value` (string)
  Actual text. May be restricted by character limits based on the type of comment (e.g. Notepad remarks limited to 87 characters).
  Example: "Additional comments"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Comment.id` (string)
  Local identifier within a given message for this object.
  Example: "comment_1"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Comment.name` (string)
  Title of comment or type of remark.
  Example: "Comment name"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.Comment.language` (string)
  Language code using ISO-639 standard
  Example: "EN"

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.defaultInd` (boolean)
  When true, indicates a default value should be used.
  Example: true

- `TravelAgencyQueryTravelAgencyTelephone.Telephone.provisionedInd` (boolean)
  true indicates this phone number was created through provisioned

## Response 200 fields (application/json):

- `TravelAgency` (object)

- `TravelAgency.@type` (string, required)
  Discriminator classes TravelAgency, TravelAgencyID, or TravelAgencyDetail
  Example: "TravelAgencyDetail"

- `TravelAgency.id` (string)
  Simple xsd id, not for external use
  Example: "2"

- `TravelAgency.TravelOrganizationRef` (string)
  An organization that has a name and a structure and members and directly works in the travel industry
  Example: "TravelAgency_1"

- `TravelAgency.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelAgency.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TravelAgency.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

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

- `Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `Result.Error.NameValuePair` (array)

- `Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `Result.Warning.NameValuePair` (array)

- `Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `NextSteps.NextStep` (array, required)

- `NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ReferenceList` (array)

- `ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CurrencyRateConversion` (array)

- `CurrencyRateConversion.@type` (string)

- `CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CurrencyRateConversion.ConversionRate.value` (number)

- `CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `Pagination.@type` (string, required)
  Example: "Pagination"

- `Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `Pagination.totalItems` (integer, required)
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

# Travel agency telephone

Endpoint: DELETE /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/deletetelephone/{telephoneid}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `ReservationResource_Identifier` (string, required)
  The Reservation Identifier you wish to delete the travel agency details from
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `id` (string, required)
  The unique travel agency id
  Example: "agency_001"

- `telephoneid` (string, required)
  The unique telephone id
  Example: "telephone_001"

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

- `TravelAgency` (object)

- `TravelAgency.@type` (string, required)
  Discriminator classes TravelAgency, TravelAgencyID, or TravelAgencyDetail
  Example: "TravelAgencyDetail"

- `TravelAgency.id` (string)
  Simple xsd id, not for external use
  Example: "2"

- `TravelAgency.TravelOrganizationRef` (string)
  An organization that has a name and a structure and members and directly works in the travel industry
  Example: "TravelAgency_1"

- `TravelAgency.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `TravelAgency.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `TravelAgency.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

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

- `Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `Result.Error.NameValuePair` (array)

- `Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `Result.Warning.NameValuePair` (array)

- `Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `NextSteps.NextStep` (array, required)

- `NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `ReferenceList` (array)

- `ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CurrencyRateConversion` (array)

- `CurrencyRateConversion.@type` (string)

- `CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CurrencyRateConversion.ConversionRate.value` (number)

- `CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `Pagination.@type` (string, required)
  Example: "Pagination"

- `Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `Pagination.totalItems` (integer, required)
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
