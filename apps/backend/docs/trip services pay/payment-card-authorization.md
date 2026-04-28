# Payment Card Authorization

## Payment Card Authorization

 - [POST /paymentcardauthorizations/{authType}](https://developer.travelport.com/apis/pay/payment-card-authorization/create.md): Travelport’s NextGenAPI Payment Authorization Service allows the user to request credit card authorizations, address validations and reversals against a specific merchant vendor.

# Payment Card Authorization

Travelport’s NextGenAPI Payment Authorization Service allows the user to request credit card authorizations, address validations and reversals against a specific merchant vendor.

Endpoint: POST /paymentcardauthorizations/{authType}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

  - `authType` (string, required)
    Type of PaymentCardAuthorizationRequest - authorization, address verification, reversal
    Enum: "AUTH", "REVS", "VALD", "AAVS"

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
    Discriminator classes PaymentCardAuthorizationQueryRequest only
    Example: "PaymentCardAuthorizationQueryRequest"

  - `authType` (string)
    This object  contains type of Authorization
    Enum: "AUTH", "REVS", "VALD", "AAVS"

  - `PaymentCardRequest` (object)

  - `PaymentCardRequest.@type` (string)
    Example: "PaymentCardRequest"

  - `PaymentCardRequest.paymentCardShortNumber` (string)
    The payment card short number
    Example: "9596"

  - `PaymentCardRequest.airlineMerchantCode` (string, required)
    The airline merchant code
    Example: "KL"

  - `PaymentCardRequest.extendedPaymentInstallments` (string)
    The number of installment payments for this transaction to be charged
    Example: "6"

  - `PaymentCardRequest.expireDate` (string, required)
    The payment card expiry date MMYY
    Example: "1232"

  - `PaymentCardRequest.eCI` (string)
    3D Secure eCI code
    Example: "5"

  - `PaymentCardRequest.cAVV` (string)
    3D Secure cAVV value
    Example: "AAACBGESJIMBIFMBZhIkAAAAAAA="

  - `PaymentCardRequest.xID` (string)
    3D Secure xID value
    Example: "MDAwMDAwMDAwMDEyMzQ2Njc4OTA="

  - `PaymentCardRequest.agentSignOn` (string)
    The agent sign on ID
    Example: "ABC123/BZ"

  - `PaymentCardRequest.localDateTime` (string)
    The local date time
    Example: "2018-06-08 09:45:00"

  - `PaymentCardRequest.approvalCode` (string)
    The approval code to be reversed
    Example: "00187C"

  - `PaymentCardRequest.paymentCardSecurityCode` (string)
    The payment card security code
    Example: "933"

  - `PaymentCardRequest.paymentCardCode` (string)
    The payment card code
    Example: "VI"

  - `PaymentCardRequest.uCAFIndicator` (string)
    Universal Card Authentication Field™ MasterCard only UCAF is the mechanism that is used to transmit the AAV from the merchant to issuer for authentication purposes during the authorization process
    Example: "0"

  - `PaymentCardRequest.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `PaymentCardRequest.Identifier.value` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
    Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

  - `PaymentCardRequest.Identifier.authority` (string)
    "Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
    Example: "TVPT"

  - `PaymentCardRequest.PrimaryAccountNumber` (string, required)
    The unencrypted credit card number
    Example: "4010000011112222"

  - `PaymentCardRequest.CurrencyAmount` (object, required)
    A monetary amount, up to 4 decimal places. Decimal place must be included.

  - `PaymentCardRequest.CurrencyAmount.value` (number)
    The amount of a given currency.
    Example: 124.56

  - `PaymentCardRequest.CurrencyAmount.code` (string)
    An ISO 4217 alpha character code (3 characters) that specifies a money unit.
    Example: "USD"

  - `PaymentCardRequest.CurrencyAmount.minorUnit` (integer)
    Minor units are a mechanism for expressing the relationship between a major currency unit and its corresponding minor currency unit.
    Example: 2

  - `PaymentCardRequest.CurrencyAmount.currencySource` (string)
    The system requesting or returning the currency code specified in the attribute
    Enum: "Supplier", "Charged", "Requested"

  - `PaymentCardRequest.CurrencyAmount.approximateInd` (boolean)
    "If true, the currency amount has been converted from the original amount.
For Hotel Availability and Rules, true indicates this is a calculated value; false indicates this is the value returned by the property."
    Example: true

  - `PaymentCardRequest.PromotionCode` (object, required)
    Used to provide a promotion code of the loyalty redemption.

  - `PaymentCardRequest.PromotionCode.promotionCode` (string)
    The promotion code value
    Example: "SUMMER22"

  - `PaymentCardRequest.PromotionCode.promotionVendorCode` (array)
    The promotion vendor code value
    Example: [300,234,657]

  - `PaymentCardRequest.CardHolder` (object)

  - `PaymentCardRequest.CardHolder.@type` (string)
    Example: "CardHolder"

  - `PaymentCardRequest.CardHolder.CardHolderName` (string)
    Name imprinted or embossed on the payment card
    Example: "Eric K Miller"

  - `PaymentCardRequest.CardHolder.IP4Address` (string, required)
    An IP 4 formatted string
    Example: "111.222.0.0"

  - `PaymentCardRequest.CardHolder.Person` (object)

  - `PaymentCardRequest.CardHolder.Person.@type` (string, required)
    Discriminator classes Person or PersonID

  - `PaymentCardRequest.CardHolder.Person.id` (string)
    Example: "3456"

  - `PaymentCardRequest.CardHolder.Person.birthDate` (string)
    Date of Birth YYYY-MM-DD
    Example: "2026-06-05"

  - `PaymentCardRequest.CardHolder.Person.gender` (string)
    Gender Type Male, Female etc. This field is not used by Hotel APIs and will be ignored.
    Enum: "Male", "Female", "Unknown", "Undisclosed"

  - `PaymentCardRequest.CardHolder.Person.PersonName` (object, required)
    Travelport+ limits the combination of Given and Surname to 22 characters. Given name must have at least one character. Any PersonName exceeding 22 characters is truncated in the response.

  - `PaymentCardRequest.CardHolder.Person.PersonName.@type` (string, required)
    Discriminator classes PersonName or PersonNameDetail
    Example: "PersonNameDetail"

  - `PaymentCardRequest.CardHolder.Person.PersonName.Prefix` (string)
    Salutation of honorific (e.g. Mr., Mrs., Ms., Miss, Dr.)
    Example: "Mr"

  - `PaymentCardRequest.CardHolder.Person.PersonName.Given` (string)
    Given name, first name or names.
    Example: "John"

  - `PaymentCardRequest.CardHolder.Person.PersonName.Middle` (string)
    The middle name of the person name.
    Example: "Erick"

  - `PaymentCardRequest.CardHolder.Person.PersonName.Surname` (string, required)
    Family name, last name.
    Example: "Smith"

  - `PaymentCardRequest.CardHolder.Person.Address` (array)

  - `PaymentCardRequest.CardHolder.Person.Address.@type` (string, required)
    Discriminator classes include Address or AddressDetail
    Example: "AddressDetail"

  - `PaymentCardRequest.CardHolder.Person.Address.id` (string)
    unique address id
    Example: "Address_1"

  - `PaymentCardRequest.CardHolder.Person.Address.BldgRoom` (object)
    Address with building and room number

  - `PaymentCardRequest.CardHolder.Person.Address.BldgRoom.value` (string)
    Example: "Moore House"

  - `PaymentCardRequest.CardHolder.Person.Address.BldgRoom.buldingInd` (boolean)
    When true, the information is a building name. When false, it is an apartment or room #
    Example: true

  - `PaymentCardRequest.CardHolder.Person.Address.Number` (object)
    The street number alone is the numerical number that precedes the street name in the address.

  - `PaymentCardRequest.CardHolder.Person.Address.Number.value` (string)
    Street number value.
    Example: "23B"

  - `PaymentCardRequest.CardHolder.Person.Address.Number.streetNmbrSuffix` (string)
    Street Number Suffix
    Example: "B"

  - `PaymentCardRequest.CardHolder.Person.Address.Number.streetDirection` (string)
    Direction of the Street
    Example: "NW"

  - `PaymentCardRequest.CardHolder.Person.Address.Number.ruralRouteNmbr` (string)
    RuralRoute Number
    Example: "76"

  - `PaymentCardRequest.CardHolder.Person.Address.Number.po_Box` (string)
    PO Box Number
    Example: "1001"

  - `PaymentCardRequest.CardHolder.Person.Address.Street` (string)
    Street name. May also contain the street number when the Number element is missing.
    Example: "ABC Street"

  - `PaymentCardRequest.CardHolder.Person.Address.AddressLine` (array)
    Property street address. Used in place of Street and Number. Each element of the array represents an address line.
    Example: ["2035 S Havana street"]

  - `PaymentCardRequest.CardHolder.Person.Address.City` (string, required)
    Full name of the city, town, or postal station (i.e., a postal service territory, often used in a military address).
    Example: "Dublin"

  - `PaymentCardRequest.CardHolder.Person.Address.County` (string)
    County or Region Name.
    Example: "Berkshire"

  - `PaymentCardRequest.CardHolder.Person.Address.StateProv` (object)
    The standard code or abbreviation for the state, province, or region. May also include full length name.

  - `PaymentCardRequest.CardHolder.Person.Address.StateProv.value` (string)
    State, province, or region code needed to identify location (typically two characters).
    Example: "CA"

  - `PaymentCardRequest.CardHolder.Person.Address.StateProv.name` (string)
    State, province, or region name needed to identify location.
    Example: "California"

  - `PaymentCardRequest.CardHolder.Person.Address.Country` (object)
    Contains the information needed to identify a country.

  - `PaymentCardRequest.CardHolder.Person.Address.Country.value` (string)
    The ISO 3166 code for the property's address.
    Example: "US"

  - `PaymentCardRequest.CardHolder.Person.Address.Country.id` (string)
    Custom user-assigned identifier for the country.
    Example: "23"

  - `PaymentCardRequest.CardHolder.Person.Address.Country.name` (string)
    The full name of the country for the property's address.
    Example: "United States"

  - `PaymentCardRequest.CardHolder.Person.Address.Country.codeContext` (string)
    The source of a code, such as the organization that provided the id number
    Example: "IATA"

  - `PaymentCardRequest.CardHolder.Person.Address.PostalCode` (string)
    Postal code for the address.
    Example: "Sl6 1AB"

  - `PaymentCardRequest.CardHolder.Person.Address.Addressee` (string)
    The name of the company or person to be addressed
    Example: "ACME INC"

  - `PaymentCardRequest.CardHolder.Person.Address.role` (string)
    Defines the type of location the address is assigned to. For TravelAgency address leave blank or use "Other".
    Enum: "Home", "Business", "Mailing", "Delivery", "Destination", "Other", "Billing"

  - `PaymentCardRequest.CardHolder.Person.Telephone` (array)

  - `PaymentCardRequest.CardHolder.Person.Telephone.@type` (string, required)
    Discriminator classes Telephone or TelephoneDetail
    Example: "Telephone"

  - `PaymentCardRequest.CardHolder.Person.Telephone.countryAccessCode` (string)
    Phone country code
    Example: "1"

  - `PaymentCardRequest.CardHolder.Person.Telephone.areaCityCode` (string)
    Phone local area code
    Example: "972"

  - `PaymentCardRequest.CardHolder.Person.Telephone.phoneNumber` (string, required)
    Mobile/Telephone Number. Accepted characters are numeric, dash, space, and period.
    Example: "972-000-787"

  - `PaymentCardRequest.CardHolder.Person.Telephone.extension` (string)
    Telephone extension number
    Example: "234"

  - `PaymentCardRequest.CardHolder.Person.Telephone.id` (string)
    Optional internally referenced id
    Example: "3"

  - `PaymentCardRequest.CardHolder.Person.Telephone.cityCode` (string)
    IATA city code if referenced by phone number.
    Example: "DEN"

  - `PaymentCardRequest.CardHolder.Person.Telephone.role` (string)
    Defines the type of location the Telephone is assigned to. For Travel Agency telephone select "Other" or leave blank.
    Enum: "Mobile", "Home", "Work", "Office", "Fax", "Other"

  - `PaymentCardRequest.CardHolder.Person.Email` (array)

  - `PaymentCardRequest.CardHolder.Person.Email.value` (string)
    Example: "exampledomain@example.com"

  - `PaymentCardRequest.CardHolder.Person.Email.id` (string)
    Electronic email addresses, in IETF specified format.
    Example: "email_1"

  - `PaymentCardRequest.CardHolder.Person.Email.emailType` (string)
    Use email type to specify if the email is to be sent "TO" or sent "FROM"
    Example: "FROM"

  - `PaymentCardRequest.CardHolder.Person.Email.comment` (string)
    Comments associated to the email

  - `PaymentCardRequest.CardHolder.Person.Email.preferredFormat` (string)
    Mime media type
    Example: "text/html"

  - `PaymentCardRequest.CardHolder.Person.Email.shareMarketing` (string)
    Used to indicate marketing preferences, Yes, No, Inherit
    Enum: "Yes", "No", "Inherit"

  - `PaymentCardRequest.CardHolder.Person.Email.shareSync` (string)
    Used to indicate marketing preferences, Yes, No, Inherit
    Enum: "Yes", "No", "Inherit"

  - `PaymentCardRequest.CardHolder.Person.Email.optOutInd` (string)
    Used to indicate marketing preferences, Yes, No, Inherit
    Enum: "Yes", "No", "Inherit"

  - `PaymentCardRequest.CardHolder.Person.Email.optInStatus` (string)
    Used to indicate marketing preferences, OptIn, OptOut
    Enum: "OptedIn", "OptedOut", "Unknown"

  - `PaymentCardRequest.CardHolder.Person.Email.optInDate` (string)
    The datetime of receiving the opt in notice
    Example: "2026-03-03 11:11:00+00:00"

  - `PaymentCardRequest.CardHolder.Person.Email.optOutDate` (string)
    The datetime the opt out notice was received
    Example: "2026-03-03 11:11:00+00:00"

  - `PaymentCardRequest.CardHolder.Person.Email.validInd` (boolean)
    If true, this is a valid email address that has been system verified via a successful email transmission.
    Example: true

  - `PaymentCardRequest.CardHolder.Person.Email.provisionedInd` (boolean)
    If true then the email address came from the provisioning process
    Example: true

  - `PaymentCardRequest.AgencyPCCDetail` (object, required)
    Agency PCC detail information

  - `PaymentCardRequest.AgencyPCCDetail.@type` (string, required)
    Discriminator classes AgencyPCC or AgencyPCCDetail
    Example: "AgencyPCC"

  - `PaymentCardRequest.AgencyPCCDetail.id` (string)
    Agency PCC unique id
    Example: "agencyPCC_1"

  - `PaymentCardRequest.AgencyPCCDetail.pseudoCityCode` (string, required)
    PCC
    Example: "1CR"

  - `PaymentCardRequest.AgencyPCCDetail.agencyCode` (string, required)
    Agency PCC Code
    Example: "91212132"

  - `PaymentCardRequest.AgencyPCCDetail.country` (string, required)
    Country Code
    Example: "US"

  - `PaymentCardRequest.AgencyPCCDetail.codeAffinity` (string, required)
    Code Affinity
    Example: "1A"

  - `PaymentCardRequest.AgencyPCCDetail.tierLevel` (integer)
    Tier Level
    Example: 2

  - `PaymentCardRequest.AgencyPCCDetail.bsp` (string)
    Billing Settlement Plan
    Example: "BSP"

  - `PaymentCardRequest.AgencyPCCDetail.whps` (string)
    WHPS code
    Example: "ABC12s"

  - `PaymentCardRequest.AgencyPCCDetail.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `PaymentCardRequest.AgencyPCCDetail.City` (object, required)
    Airport or city code of the customer embarkation

  - `PaymentCardRequest.AgencyPCCDetail.City.value` (string)
    Example: "DEN"

  - `PaymentCardRequest.AgencyPCCDetail.City.cityOrAirport` (string)
    Optional enumeration specifying whether to restrict the search based on the city/airport code sent in From/value. Possible options and behavior are as follows. These behaviors are for availability selection only. Actual content may vary based on calculated price and diversity. Not all NDC carriers may support all options. Airport code with no cityOrAirport value expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. This behavior also applies to: city code with Airport Only, City code with City Only, City or airport code with City or Airport. Airport code with cityOrAirport value Airport Only returns content only from the specified airport. For example, LGA will return content from only LGA. Airport code with cityOrAirport value City expands the availability selection to the city without giving preference to the requested airport. This behavior is equivalent to searching with the airport's city code. For example, LGA would instead be treated as NYC and would return flights for LGA, EWR, and JFK with no preference.
    Enum: "Airport Only", "City or Airport", "City Only", "Use Default"

  - `PaymentCardRequest.AgencyPCCDetail.Currency` (object, required)
    The default currency that will apply to all prices, amounts, fares, etc. in a message.  It is placed at the top of any message using this object.

  - `PaymentCardRequest.AgencyPCCDetail.Currency.value` (number)
    Example: 22.2

  - `PaymentCardRequest.AgencyPCCDetail.Currency.code` (string, required)
    An ISO 4217 alpha character code that specifies a money unit
    Example: "USD"

  - `PaymentCardRequest.AgencyPCCDetail.Name` (string)
    The name of the agency
    Example: "GALILEO FRANCE"

  - `PaymentCardRequest.AgencyPCCDetail.StateProv` (string)
    The state or province of the agency
    Example: "CO"

  - `PaymentCardRequest.AgencyPCCDetail.PostalCode` (string)
    Postal code for the agency address.
    Example: "80012"

  - `PaymentCardRequest.AdditionalAmount` (array)

  - `PaymentCardRequest.AdditionalAmount.value` (number)

  - `PaymentCardRequest.AdditionalAmount.additionalAmountType` (string)
    Used in Columbia and other places as a way to add extra taxes
    Enum: "FA", "FV", "FO", "SA", "SV", "ST"

  - `PaymentCardRequest.AdditionalAmount.code` (string)
    The ISO currency code
    Example: "USD"

  - `PaymentCardRequest.AdditionalAmount.minorUnit` (integer)
    The minor unit for the currency
    Example: 2

  - `PaymentCardRequest.AdditionalAmount.currencySource` (string)
    The system requesting or returning the currency code specified in the attribute
    Enum: "Supplier", "Charged", "Requested"

  - `PaymentCardRequest.AdditionalAmount.approximateInd` (boolean)
    True if the currency amount has been converted from the original amount

  - `PaymentCardRequest.TravelInfoAir` (object)

  - `PaymentCardRequest.TravelInfoAir.@type` (string, required)
    Discriminator classes TravelInfo or TravelInfoAir
    Example: "TravelInfo"

  - `PaymentCardRequest.TravelInfoAir.departureDate` (string)
    The local date of departure for an intinerary
    Example: "2018-08-28"

  - `PaymentCardRequest.TravelInfoAir.numberOfTravelers` (integer)
    The number of travelers
    Example: 2

  - `PaymentCardRequest.TravelInfoAir.LocatorCode` (object)
    Locator information for the reservation. Contains the locator (PNR or external locator) or cancellation number for the reservation, order, or offer.

  - `PaymentCardRequest.TravelInfoAir.LocatorCode.value` (string)
    "Reference number for locatorType.
Booking.com returns a PIN number along with the confirmation number for each sold hotel segment. If the agent/traveler needs to reconcile the booking with Booking.com, Booking.com requires both the PIN number and confirmation number to locate the segment in their system."
    Example: "ZXG25P"

  - `PaymentCardRequest.TravelInfoAir.LocatorCode.locatorType` (string)
    Specifies the type of reservation ID
Travelport - Confirmation number; PNR locator Agency - IATA Number Booking.com - Confirmation number; PIN number
In Document History, may return the content source (e.g. GDS or NDC)
    Example: "Confirmation Number"

  - `PaymentCardRequest.TravelInfoAir.LocatorCode.source` (string)
    "Content source. Typically a two-character Supplier code that indicates the source system which generated the resid.
For Hotels, if source matches chain code, the offer is directly with the supplier. If source is 'BO', the offer is with Booking.com."
    Example: "1G"

  - `PaymentCardRequest.TravelInfoAir.LocatorCode.sourceContext` (string)
    Specifies the context of the source. Either Travelport, Agency, or Supplier.
    Example: "Travelport"

  - `PaymentCardRequest.TravelInfoAir.LocatorCode.otaType` (string)
    Used for codes
    Example: "14.UIT"

  - `PaymentCardRequest.TravelInfoAir.LocatorCode.creationDate` (string)
    Date created in Travelport or supplier system in YYYY-MM-DD format.
    Example: "2026-03-01"

  - `PaymentCardRequest.TravelInfoAir.LocatorCode.lastUpdated` (string)
    The date and time stamp the Reservation was last updated.
    Example: "2026-08-07 12:12:00+00:00"

  - `PaymentCardRequest.TravelInfoAir.fareBasisCode` (string)
    The fare Basis Code
    Example: "YEE1Y"

  - `PaymentCardRequest.TravelInfoAir.AirlineCodes` (array)
    IATA defined code for Airline
    Example: "KL"

  - `PaymentCardRequest.TravelInfoAir.AirportCodes` (array)
    IATA defined code for airport
    Example: "BNE"

  - `PaymentCardRequest.TravelInfoAir.FirstFlightNumber` (string)
    Flight number of the first flight on the itinerary
    Example: "BA 98"

  - `PaymentCardRequest.TravelInfoAir.FirstFlightDepartureTime` (string)
    Local departure time of the first flight
    Example: "915"

  - `PaymentCardRequest.TravelInfoAir.FirstSegmentClass` (string)
    Class of service of the first segment on the itinerary
    Example: "Y"

## Response 200 fields (application/json):

  - `PaymentCardAuthorizationResponse` (object)
    The response of Payment card authorization endpoint request.

  - `PaymentCardAuthorizationResponse.PaymentCardAuthorization` (object)

  - `PaymentCardAuthorizationResponse.PaymentCardAuthorization.@type` (string, required)
    Discriminator classes PaymentCardAuthorizationID or PaymentCardAuthorization
    Example: "PaymentCardAuthorization"

  - `PaymentCardAuthorizationResponse.PaymentCardAuthorization.id` (string)
    internally referenced xsd id
    Example: "63"

  - `PaymentCardAuthorizationResponse.PaymentCardAuthorization.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `PaymentCardAuthorizationResponse.PaymentCardAuthorization.PaymentCardAuthorizationRef` (string)

  - `PaymentCardAuthorizationResponse.PaymentCardAuthorization.completionCode` (string)
    The completion code value
    Example: "0"

  - `PaymentCardAuthorizationResponse.PaymentCardAuthorization.approvalCode` (string)
    The approval code value
    Example: "235"

  - `PaymentCardAuthorizationResponse.PaymentCardAuthorization.avsResult` (string)
    The address verification result code
    Example: "G"

  - `PaymentCardAuthorizationResponse.PaymentCardAuthorization.securityResult` (string)
    The security result code
    Example: "C"

  - `PaymentCardAuthorizationResponse.PaymentCardAuthorization.completionCodeDescription` (string)
    Completion code description
    Example: "OK"

  - `PaymentCardAuthorizationResponse.PaymentCardAuthorization.avsResultDescription` (string)
    The avs result description
    Example: "Address not verified for International transaction (International only)"

  - `PaymentCardAuthorizationResponse.PaymentCardAuthorization.securityResultDescription` (string)
    The security result description
    Example: "CVV2 Match"

  - `PaymentCardAuthorizationResponse.PaymentCardAuthorization.PrimaryAccountNumber` (string)
    The unencrypted credit card number
    Example: "444111000222"

  - `PaymentCardAuthorizationResponse.@type` (string)
    Example: "response"

  - `PaymentCardAuthorizationResponse.transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `PaymentCardAuthorizationResponse.traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `PaymentCardAuthorizationResponse.correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `PaymentCardAuthorizationResponse.reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `PaymentCardAuthorizationResponse.Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `PaymentCardAuthorizationResponse.Result.@type` (string)
    Discriminator class Result only
    Example: "Result"

  - `PaymentCardAuthorizationResponse.Result.status` (string)
    The status of an error or warning
    Enum: "Not processed", "Incomplete", "Complete", "Unknown"

  - `PaymentCardAuthorizationResponse.Result.Error` (array)
    A list of error information returned at the provider level for a response.

  - `PaymentCardAuthorizationResponse.Result.Error.@type` (string, required)
    Discriminator classes Error or ErrorDetail
    Example: "ErrorDetail"

  - `PaymentCardAuthorizationResponse.Result.Error.Message` (string)
    The Travelport standardized error or warning message
    Example: "No flights found."

  - `PaymentCardAuthorizationResponse.Result.Error.NameValuePair` (array)

  - `PaymentCardAuthorizationResponse.Result.Error.NameValuePair.value` (string)
    Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
    Example: "Sunday"

  - `PaymentCardAuthorizationResponse.Result.Error.NameValuePair.id` (string)
    Optional internally referenced id
    Example: "6"

  - `PaymentCardAuthorizationResponse.Result.Error.NameValuePair.name` (string, required)
    Key, categorizing the of type of remark or error.
    Example: "Day1"

  - `PaymentCardAuthorizationResponse.Result.Error.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `PaymentCardAuthorizationResponse.Result.Warning` (array)
    A list of warning information returned at the provider level for a response.

  - `PaymentCardAuthorizationResponse.Result.Warning.@type` (string, required)
    Discriminator classes Warning or WarningDetail
    Example: "WarningDetail"

  - `PaymentCardAuthorizationResponse.Result.Warning.Message` (string)
    The Travelport standardized error or warning message
    Example: "Customer Loyalty could not be applied."

  - `PaymentCardAuthorizationResponse.Result.Warning.NameValuePair` (array)

  - `PaymentCardAuthorizationResponse.Result.Warning.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `PaymentCardAuthorizationResponse.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `PaymentCardAuthorizationResponse.NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `PaymentCardAuthorizationResponse.NextSteps.baseURI` (string, required)
    The base portion of the uri in order to shorten the uris in the individual steps

  - `PaymentCardAuthorizationResponse.NextSteps.id` (string)
    Optional internally referenced id
    Example: "5"

  - `PaymentCardAuthorizationResponse.NextSteps.NextStep` (array, required)

  - `PaymentCardAuthorizationResponse.NextSteps.NextStep.value` (string)
    Example: "www.resourcelocation.com"

  - `PaymentCardAuthorizationResponse.NextSteps.NextStep.id` (string)
    Identifier for the Next Step
    Example: "2"

  - `PaymentCardAuthorizationResponse.NextSteps.NextStep.action` (string, required)
    The action this next step is intended to achieve
    Example: "cancel"

  - `PaymentCardAuthorizationResponse.NextSteps.NextStep.method` (string, required)
    Describes the set of potential methods that can be taken after an operation.
    Enum: "GET", "DELETE", "PUT", "POST"

  - `PaymentCardAuthorizationResponse.NextSteps.NextStep.description` (string)
    Additional clarification for the next step
    Example: "remove offer from the order"

  - `PaymentCardAuthorizationResponse.ReferenceList` (array)

  - `PaymentCardAuthorizationResponse.ReferenceList.@type` (string, required)
    Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
    Example: "ReferenceListFlight"

  - `PaymentCardAuthorizationResponse.ReferenceList.id` (string)
    Uniquely identifies for the Reference List

  - `PaymentCardAuthorizationResponse.CurrencyRateConversion` (array)

  - `PaymentCardAuthorizationResponse.CurrencyRateConversion.@type` (string)

  - `PaymentCardAuthorizationResponse.CurrencyRateConversion.SourceCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `PaymentCardAuthorizationResponse.CurrencyRateConversion.SourceCurrency.value` (string)
    An ISO 4217 currency code.
    Example: "USD"

  - `PaymentCardAuthorizationResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
    Currency code authority
    Example: "ISO 4217"

  - `PaymentCardAuthorizationResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
    Number of decimal places for the currency.
    Example: 4

  - `PaymentCardAuthorizationResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
    Currency code decimal authority
    Example: "ISO 4217"

  - `PaymentCardAuthorizationResponse.CurrencyRateConversion.TargetCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `PaymentCardAuthorizationResponse.CurrencyRateConversion.ConversionRate` (object, required)
    Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

  - `PaymentCardAuthorizationResponse.CurrencyRateConversion.ConversionRate.value` (number)

  - `PaymentCardAuthorizationResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
    Contextual rate authority
    Example: "ISO 4217"

  - `PaymentCardAuthorizationResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
    Rate as of
    Example: "2026-08-07 12:12:00+00:00"

  - `PaymentCardAuthorizationResponse.Pagination` (object)
    Pagination object used when result sets span across a number of pages.

  - `PaymentCardAuthorizationResponse.Pagination.@type` (string, required)
    Example: "Pagination"

  - `PaymentCardAuthorizationResponse.Pagination.page` (integer, required)
    The current page number of the full result set
    Example: 1

  - `PaymentCardAuthorizationResponse.Pagination.pageSize` (integer, required)
    The total number of items on this page
    Example: 20

  - `PaymentCardAuthorizationResponse.Pagination.totalPages` (integer, required)
    The total number of pages in this result set
    Example: 5

  - `PaymentCardAuthorizationResponse.Pagination.totalItems` (integer, required)
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

