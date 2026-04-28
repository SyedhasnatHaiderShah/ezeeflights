# Availability

Hotel availability and pagination.

## Return hotel availability.

 - [POST /hotel/availability/catalogofferingshospitality](https://developer.travelport.com/apis/stays/availability/createhotelavailability.md): Hotel Availability returns room types and rates available at one or more specified properties on specified dates.

## Return additional availability results (pagination).

 - [GET /hotel/availability/catalogofferingshospitality/{identifier}](https://developer.travelport.com/apis/stays/availability/gethotelavailabilitypage.md): Return additional availability results. The Hotel Availability response uses pagination by default. The response notes the total number of rates found and, if greater than 100, also returns a pagination identifier that can be used for retrieving additional pages of results using this Availability Pagination request. You can send an Availability Pagination request to retrieve each additional page of 100 rates until all available rates have been retrieved. NOTE: Availability results are cached for 30 minutes. You cannot retrieve additional results from that Availability response after it expires.

# Return hotel availability.

Hotel Availability returns room types and rates available at one or more specified properties on specified dates.

Endpoint: POST /hotel/availability/catalogofferingshospitality
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

  - `CatalogOfferingsQueryRequest` (object)
    Used for a Hotel Availability request. Defines a request to retrieve available room types and rates for one or more specified hotel properties on given stay dates. This request typically follows a Hotel Search request and is sent before booking.

  - `CatalogOfferingsQueryRequest.@type` (string, required)
    Discriminator class CatalogOfferingsRequestHospitality
    Example: "CatalogOfferingsRequestHospitality"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest` (array, required)

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.@type` (string)
    Example: "CatalogOfferingsRequestHospitality"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.SearchControlConsoleChannelID` (object)
    The Search API supports the Travelport Content Optimizer (formerly known as Search Control Console/SCC) for GDS content only. Send either the value or the sccType. If both values are sent, the sccType is applied. Travel agency administrators use Content Optimizer to create business rules for filtering certain air shopping results. If your client's application does not use Content Optimizer, do not use these attributes. Contact your Travelport representative if you would like additional information.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.SearchControlConsoleChannelID.value` (string)
    String for the Content Optimizer channel ID.
    Example: "IBM"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.SearchControlConsoleChannelID.sccType` (string)
    String for the Content Optimizer type.
    Example: "999"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.requestedCurrency` (string)
    If sent, the response includes a currency rate conversion value from the local currency to the currency specified. This value can be applied to the hotel's local pricing to convert rates; the API does not convert any amounts.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.maxResponseWaitTime` (integer)
    Supports a timeout in milliseconds when requesting availability for multiple properties. If sent, the request times out at the specified time and returns all properties retrieved at that point.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.StayDates` (object, required)
    Indicates a date, such as check-in, check-out, deadline, or expiry date.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.StayDates.specific` (string)
    A specific date in YYYY-MM-DD format. When used within a window, must fall between start and end.
    Example: "2026-03-03"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.StayDates.start` (string)
    "For Air, the earliest date acceptable for the start date. 
For Hotel, the check-in, cancellation, or penalty deadline date. Format YYYY-MM-DD. Used with end to designate a range of dates."
    Example: "2026-03-03"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.StayDates.end` (string)
    "For Air, the latest date acceptable for the end date. 
For Hotel, the check-out, cancellation, or penalty deadline date. Format YYYY-MM-DD."
    Example: "2026-03-03"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.StayDates.duration` (string)
    Duration from start date.
    Example: "P1D"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.StayDates.durationUnit` (string)
    Defines the Units that can be applied to Stay restrictions.
    Enum: "Minutes", "Hours", "Days", "Months", "MON", "TUES", "WED", "THU", "FRI", "SAT", "SUN"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion` (object)

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.@type` (string)
    Example: "HotelSearchCriterion"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.numberOfRooms` (integer)
    Number of rooms requested at a single property. Supports values 1-9 inclusive.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.PropertyRequest` (array, required)

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.PropertyRequest.@type` (string)
    Example: "PropertyRequest"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.PropertyRequest.moreRatesToken` (string)
    More rates token

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.PropertyRequest.PropertyKey` (object, required)
    Contains up to 250 PropertyKey objects. Each PropertyKey object identifies one property.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.PropertyRequest.PropertyKey.@type` (string)

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.PropertyRequest.PropertyKey.chainCode` (string, required)
    Code for the hotel chain (typically 2 characters)
    Example: "UR"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.PropertyRequest.PropertyKey.propertyCode` (string, required)
    The property code of the requested property (typically 5 characters).
    Example: "G3375"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RoomStayCandidates` (object)
    Includes traveler information.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RoomStayCandidates.RoomStayCandidate` (array, required)

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RoomStayCandidates.RoomStayCandidate.GuestCounts` (object, required)
    The number and age(s) of guests within the room.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RoomStayCandidates.RoomStayCandidate.GuestCounts.@type` (string)
    Example: "GuestCounts"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RoomStayCandidates.RoomStayCandidate.GuestCounts.GuestCount` (array, required)

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RoomStayCandidates.RoomStayCandidate.RoomAmenity` (array)

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RateCandidates` (object)
    For a Hotel Search request: up to eight negotiated rate codes and/or one frequent guest number. For a Hotel Availability request: rate plans, access codes, and rate categories - send only if requesting rate plans.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RateCandidates.@type` (string, required)
    Discriminator classes RateCandidates and RateCandidatesDetail
    Example: "RateCandidates"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RateCandidates.RateCandidate` (array, required)

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RateCandidates.RateCandidate.@type` (string, required)
    Discriminator classes RateCandidate and RateCandidateDetail
    Example: "RateCandidateDetail"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RateCandidates.RateCandidate.priority` (integer)
    A rate candidate priority

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RateCandidates.RateCandidate.rateCode` (string)
    "The negotiated rateCode to be applied to the request. 
For Hotel Availability, each rateCode must be associated with a chainCode, propertyCode, and a rateCategory of 'Multi-level/Negotiated/Secure'. 
For Hotel Rules, this value can be found, if returned, in the Availability response's ProductRateCodeInfo/RateCodeInfo/value."
    Example: "HL123"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RateCandidates.RateCandidate.rateCategory` (string)
    For Hotel Search, request a rate category by sending up to 8 OTA rate categories to search for. If the supplier has rates available for the requested category, the response contains those rates and indicates them as such. Some properties do not return these rates unless explicitly requested.
For a Hotel Rules request, this value can be found, if returned, in the Availability response's ProductRateCodeInfo/RateCodeInfo/rateCategory.
    Enum: "All", "Association", "Business", "BusinessStandard", "Club", "Convention", "Corporate", "Consortiums", "Discount", "Credential", "Employee", "FamilyPlan", "FullInclusive", "Government", "Inclusive", "Industry/TravelAgentRate", "Leisure", "Military", "Monthly", "Multi-DayPackage", "MultLevel/Negotiated/Secure", "Other", "Package", "PrePaid", "Promotional", "RackGeneral", "SeniorCitizen", "Standard", "Tour", "VIP", "Weekend", "Weekly"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RateCandidates.RateCandidate.chainCode` (string)
    Code for the hotel chain (typically 2 characters)
    Example: "UR"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RateCandidates.RateCandidate.propertyCode` (string)
    The property code of the requested property (typically 5 characters).
    Example: "G3375"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RateCandidates.RateCandidate.masterRateCode` (string)
    An agency-created rate code that can be translated into up to 12 negotiated rate codes. If masterRateCode is sent, any additional rateCodes will be ignored.
    Example: "1ABC23"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RateCandidates.prePayRatesOnlyInd` (boolean)
    A prepay rate charges the full amount on the credit card immediately on booking. If true, returns only pre-paid rates. If false, allows the return of all rates.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RateCandidates.postPayRatesOnlyInd` (boolean)
    A postpay rate (most common in the US) charges the credit card at the property when the guest checks in. If true, returns only post-paid rates. If false, allows the return of all rates.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.RateCandidates.removeSpecialRatesInd` (boolean)
    Used to request the removal of rate category (Promotional/Package/etc.) rates that may have been returned by the supplier as typical published rates. If true, removes all rate category type rates (except for negotiated rates). If true but one or more specific rate categories are requested, then this indicator is ignored and the rate category is applied. If false, allows the return of all rates returned by the supplier with no filtering. Default behavior is false.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.AggregatorList` (array)
    Enum: "TVPT", "BKNG", "EXPE", "BNTL"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.ExtraAccommodation` (array)

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.ExtraAccommodation.@type` (string, required)
    Example: "ExtraAccommodation"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.ExtraAccommodation.quantity` (integer, required)
    The quantity.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.HotelSearchCriterion.ExtraAccommodation.AccommodationType` (string, required)
    Enum: "Crib", "ExtraAdult", "ExtraChild", "RollawayAdult", "RollawayChild"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.MinimumAmount` (object)
    A monetary amount, up to 4 decimal places. Decimal place must be included.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.MinimumAmount.value` (number)
    The amount of a given currency.
    Example: 124.56

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.MinimumAmount.code` (string)
    An ISO 4217 alpha character code (3 characters) that specifies a money unit.
    Example: "USD"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.MinimumAmount.minorUnit` (integer)
    Minor units are a mechanism for expressing the relationship between a major currency unit and its corresponding minor currency unit.
    Example: 2

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.MinimumAmount.currencySource` (string)
    The system requesting or returning the currency code specified in the attribute
    Enum: "Supplier", "Charged", "Requested"

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.MinimumAmount.approximateInd` (boolean)
    "If true, the currency amount has been converted from the original amount.
For Hotel Availability and Rules, true indicates this is a calculated value; false indicates this is the value returned by the property."
    Example: true

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.MaximumAmount` (object)
    A monetary amount, up to 4 decimal places. Decimal place must be included.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.verboseResponseInd` (boolean)
    Used to indicate whether to group common property details. If true, disables the grouping of common property details in the response's ReferenceList object and instead returns them for each property in Offer/Products/Product. In this case ProductHospitality is returned. If false, returns common details across properties in a ReferenceList object with a cross-reference for each offer. For this case ProductHospitalityOffer will be returned. Default behavior is false.

  - `CatalogOfferingsQueryRequest.CatalogOfferingsRequest.recommendedRoomAmenitiesInd` (boolean)
    if true, a limited set of room amenities will be returned in the response. if false, or omitted a full set of room amenities will be returned in the response.

## Response 200 fields (application/json):

  - `CatalogOfferingsHospitalityResponse` (object)
    The response of a Catalog Offerings hospitality endpoint request. By default, common information from each room offer is consolidated into the single object ReferenceList. If the optional verboseResponseInd indicator is sent in the request, ReferenceList is not returned and common property details are not grouped.

  - `CatalogOfferingsHospitalityResponse.@type` (string)
    Example: "response"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings` (object)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.@type` (string, required)
    Example: "CatalogOfferings"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.id` (string)
    Local identifier within a given message for this object.
    Example: "CatalogOfferings_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.Identifier.value` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
    Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.Identifier.authority` (string)
    "Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
    Example: "TVPT"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.totalCatalogOffering` (integer)
    Total number of rates available for this request.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.catalogOfferingPerPage` (integer)
    Total number of rates returned per page.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.numberOfPages` (integer)
    Total number of pages created by this request.
    Example: 5

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering` (array, required)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.@type` (string, required)
    'Discriminator class for Hotel Availability is CatalogOfferingHospitality. 
Discriminator class for ExchangeSearch is CatalogOfferingModify.'
    Example: "CatalogOffering"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.id` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer. 
For Hotel Availability, offers are cached for 30 minutes. If a Rules request or Reservation is not created within 30 minutes, a new Availability request must be sent."
    Example: "108c5875-c822-4d2e-bb9f-c96368100f4a:a709ffcdc1f681c5cf3f1d7da1a8ebfc"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.CatalogOfferingRef` (string)
    Used to reference another instance of this object in the same message
    Example: "co1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ContentSource` (string)
    Indicates the owner the offer or document.
    Enum: "GDS", "NDC", "LCC", "API"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions` (array, required)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.@type` (string, required)
    Discriminator classes ProductOptionsID and ProductOptions.
    Example: "ProductOptions"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.id` (string)
    Local identifier within a given message for this object.
    Example: "ProductOptions_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.ProductOptionsRef` (string)
    Used to reference another instance of this object in the same message
    Example: "ProductOptions_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.sequence` (integer)
    NonnegativeInteger
    Example: 1

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product` (array, required)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product.@type` (string, required)
    Discriminator. Air Search child classes are ProductAir and ProductAncillary. Exchange Search child class is ProductAir. Ancillary Search is ProductAncillary. Seat Map child class isProductSeatAvailability. Air Price child classes are ProductAir and ProductAncillary. Hotel Availability child classes are ProductHospitality and ProductHospitalityOffer. Hotel Rules and HotelReservation child classes are ProductHospitality. All Vehicle APIs are ProductVehicle and ProductAncillaryVehicle. Reservation and Reservation Workbench child classes are ProductAir, ProductAncillary, ProductHospitality, ProductVehicle, and ProductAncillaryVehicle.
    Example: "ProductAir"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product.id` (string)
    Local id within a given message to support referencing this object.
    Example: "product_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product.productRef` (string)
    Reference id that corresponds to the product 'id' in ReferenceListProduct.Product. To find flight details for a product, use the ProductRef id to identify the product in ReferenceListProduct.Product, and use the Flight id's (e.g., s3, s4) to match to flight information in ReferenceListFlight.Flight.
    Example: "product_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price` (object, required)
    Child class of Price. This includes all of the Price object plus the Pricebreakdown which gives detailed Price information per PTC or Hotel offering.
For a Hotels Create Reservation (Full Payload) request, find the values to send in the Price objects from either Availability (returned in CatalogOffering/Price) or Rules (returned in Offer/Price). Although you can send the price returned in either API, the Rules pricing may be more accurate. If you sent a Rules request, send the value from that response. You must include CurrencyCode, Base, TotalTaxes, and TotalPrice. When returned from the previous steps, additionally send TermsAndConditionsFull, ProductRateCodeInfo, and RateCodeInfo.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.@type` (string, required)
    Discriminator classes Price or PriceDetail
    Example: "PriceDetail"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.id` (string)
    Internally referenced id
    Example: "2"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode.value` (string)
    An ISO 4217 currency code.
    Example: "USD"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode.codeAuthority` (string)
    Currency code authority
    Example: "ISO 4217"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode.decimalPlace` (integer)
    Number of decimal places for the currency.
    Example: 4

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode.decimalAuthority` (string)
    Currency code decimal authority
    Example: "ISO 4217"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.Base` (number)
    "Base price before taxes and fees. 
For Hotel, may not be returned by all suppliers."
    Example: 20.2

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.TotalTaxes` (number)
    "Total taxes applied to the base price. 
For Hotel, may not be returned by all suppliers."
    Example: 34.4

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.TotalFees` (number)
    Total fees included in Total Price.
    Example: 201

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.TotalPrice` (number)
    Total price of this offer including the base price and all taxes and fees.
    Example: 34

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.FlightPassCredits` (integer)
    The total number of flight pass credits consumed for this offer.
    Example: 2

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown` (array)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.@type` (string, required)
    Discriminator. Air Search and Air Price APIs child classes are PriceBreakdownAir and PriceBreakdownAncillary.Search Ancillaries and Seat Availabilities child classes are PriceBreakdown, PriceBreakdownAncillary, and PriceBreakdownAncillaryAir. All Hotel API child classes are PriceBreakdownHospitality.Vehicle API child classes are PriceBreakdownVehicleCharges, PriceBreakdownVehicleDeposit, PriceBreakdownVehiclePrice, and PriceBreakdownAncillaryVehicle. Reservation and Reservation Workbench APIs are PriceBreakdownAir, PriceBreakdownAncillary, PriceBreakdownHospitality, PriceBreakdownVehicleCharges, PriceBreakdownVehicleDeposit, PriceBreakdownVehiclePrice, and PriceBreakdownAncillaryVehicle.
    Example: "PriceBreakdownAir"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount` (object)
    Amount represents the cost applied

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.@type` (string)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.currencySource` (string)
    The system requesting or returning the currency code specified in the attribute
    Enum: "Supplier", "Charged", "Requested"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.Base` (number)
    The base price prior to all applicable taxes or fees of a product, such as the amount for a room or fare for a flight.
    Example: 120.2

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.Taxes` (object)
    Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.Fees` (object)
    Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.Total` (number)
    "Specifies the total price including base + taxes + fees. 
In PriceBreakdownHospitality, this total is for a given group of nights. 
In PriceBreakdownAir this is the total for one passenger of this PTC type."
    Example: 230.13

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.approximateInd` (boolean)
    if true this amount has been converted from the original amount
    Example: true

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Commission` (object)
    Commission information. In Air Search commission is returned for GDS only; not supported for NDC. Any commission filed by an airline in a CAT35 fare is returned in PriceBreakdownAir/Commission. The amount is either a percent of the fare component (@type CommissionPercent and the Percent object) or an amount (@type CommissionAmount and the Amount object).

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Commission.@type` (string, required)
    Discriminator. Child classes CommissionAmount or CommissionPercent
    Example: "CommissionAmount"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Commission.application` (string)
    Type of commission
    Enum: "Full", "Partial", "Non-paying", "No-show", "Adjustment", "Commissionable"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal` (object)
    No longer used. Previously used to expose the local vendor currency when it is different to the purchased currency

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.@type` (string)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.currencySource` (string)
    The system requesting or returning the currency code specified in the attribute
    Enum: "Supplier", "Charged", "Requested"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.Base` (number)
    The price prior to all applicable taxes of a product such as the rate for a room or fare for a flight.
    Example: 120.2

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.Taxes` (object)
    Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.Fees` (object)
    Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.Total` (number)
    Specifies the total price including base + taxes + fees
    Example: 30.13

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.approximateInd` (boolean)
    True if this amount has been converted from the original amount
    Example: true

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions` (object)
    Terms And Conditions that apply to an offer.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.@type` (string, required)
    Discriminator. Air Search child classes are TermsAndConditionsAir and TermsAndConditionsAncillary. Exchange Search child class is TermsAndConditionsAirChange. Search Ancillaries and Seat Availabilities child classes are TermsAndConditions, TermsAndConditionsAncillary, and TermsAndConditionsAncillaryAir. Hotel Availability child class is TermsAndConditionsHospitality.
    Example: "TermsAndConditionsAir"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.id` (string)
    Local id within a given message to support referencing this object. For Air Search APIs, matches to the reference value in ProductBrandOffering/TermsAndConditions/termsAndConditionsRef in instances of ProductBrandOptions.
    Example: "TC_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.termsAndConditionsRef` (string)
    Reference id that corresponds to the TermsAndConditions 'id' in ReferenceListTermsAndConditions.TermsAndConditions.
    Example: "TC_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.ExpiryDate` (string)
    The date and time the offer will expire. Not returned in GDS Search. NDC generally allows 20 to 30 minutes to create a booking (the offer time limit). That time limit varies by airline and is returned here in the Search response.
    Example: "2022-08-07 12:12:00+00:00"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty` (array)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.value` (string, required)
    Number on loyalty card.
    Example: "132456"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.id` (string)
    Optional Customer Loyalty Id. Not saved
    Example: "Loyalty_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.priority` (integer)
    Optional Numeric Priority Code
    Example: 2

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.programId` (string)
    "Specifies an identifier to indicate the company owner of the loyalty program. Typically two characters.
For frequent guest number, the hotel supplier or brand code. 
For frequent flyer number, the air supplier code of the loyalty program."
    Example: "United"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.programName` (string)
    Supplier's loyalty program name.
    Example: "Frontier-EarlyReturns"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.supplierType` (string)
    The type of supplier of a loyalty program. Uses 'hotel' for frequent guest number or 'air' for frequent flyer number.
    Example: "Airline"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.supplier` (string, required)
    Supplier of a loyalty program (typically 2 characters representing the hotel, brand, or airline).
    Example: "UA"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.tier` (string)
    Customer Loyalty tier
    Example: "Silver"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.shareWithSupplier` (array)
    The list of suppliers that the CustomerLoyalty number is shared. Used for cross accrual.
    Example: ["LH"]

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.cardHolderName` (string)
    Customer loyalty member name; up to 128 characters are supported. In Air Search, for discounted offers to be returned, the name must be sent as LAST FIRST; e.g.,if SMITH is the last name and JORDAN the first name, send as SMITH JORDAN
    Example: "John Smith"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.validatedInd` (boolean)
    Customer loyalty number has been validated by the supplier
    Example: true

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.prefix` (string)
    The cardholder name prefix title like Mr, Mrs, Dr
    Example: "Dr"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.given` (string)
    The First Name of the Cardholder
    Example: "John"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.middle` (string)
    Middle Name of the Cardholder
    Example: "Wilkinson"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.surname` (string)
    Last Name of the Cardholder
    Example: "Smith"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.AncillaryOffering` (array)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.AncillaryOffering.@type` (string, required)
    Discriminator classes AncillaryOfferingID and AncillaryOffering
    Example: "AncillaryOffering"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.AncillaryOffering.id` (string)
    Local identifier within a given message for this object.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.AncillaryOffering.CatalogOfferingRef` (string)
    Used to reference another instance of this object in the same message

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.AncillaryOffering.AncillaryOfferingRef` (string)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.AncillaryOffering.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `CatalogOfferingsHospitalityResponse.transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `CatalogOfferingsHospitalityResponse.traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `CatalogOfferingsHospitalityResponse.correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `CatalogOfferingsHospitalityResponse.reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `CatalogOfferingsHospitalityResponse.Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `CatalogOfferingsHospitalityResponse.Result.@type` (string)
    Discriminator class Result only
    Example: "Result"

  - `CatalogOfferingsHospitalityResponse.Result.status` (string)
    The status of an error or warning
    Enum: "Not processed", "Incomplete", "Complete", "Unknown"

  - `CatalogOfferingsHospitalityResponse.Result.Error` (array)
    A list of error information returned at the provider level for a response.

  - `CatalogOfferingsHospitalityResponse.Result.Error.@type` (string, required)
    Discriminator classes Error or ErrorDetail
    Example: "ErrorDetail"

  - `CatalogOfferingsHospitalityResponse.Result.Error.Message` (string)
    The Travelport standardized error or warning message
    Example: "No flights found."

  - `CatalogOfferingsHospitalityResponse.Result.Error.NameValuePair` (array)

  - `CatalogOfferingsHospitalityResponse.Result.Error.NameValuePair.value` (string)
    Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
    Example: "Sunday"

  - `CatalogOfferingsHospitalityResponse.Result.Error.NameValuePair.id` (string)
    Optional internally referenced id
    Example: "6"

  - `CatalogOfferingsHospitalityResponse.Result.Error.NameValuePair.name` (string, required)
    Key, categorizing the of type of remark or error.
    Example: "Day1"

  - `CatalogOfferingsHospitalityResponse.Result.Error.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `CatalogOfferingsHospitalityResponse.Result.Warning` (array)
    A list of warning information returned at the provider level for a response.

  - `CatalogOfferingsHospitalityResponse.Result.Warning.@type` (string, required)
    Discriminator classes Warning or WarningDetail
    Example: "WarningDetail"

  - `CatalogOfferingsHospitalityResponse.Result.Warning.Message` (string)
    The Travelport standardized error or warning message
    Example: "Customer Loyalty could not be applied."

  - `CatalogOfferingsHospitalityResponse.Result.Warning.NameValuePair` (array)

  - `CatalogOfferingsHospitalityResponse.Result.Warning.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `CatalogOfferingsHospitalityResponse.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `CatalogOfferingsHospitalityResponse.NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `CatalogOfferingsHospitalityResponse.NextSteps.baseURI` (string, required)
    The base portion of the uri in order to shorten the uris in the individual steps

  - `CatalogOfferingsHospitalityResponse.NextSteps.id` (string)
    Optional internally referenced id
    Example: "5"

  - `CatalogOfferingsHospitalityResponse.NextSteps.NextStep` (array, required)

  - `CatalogOfferingsHospitalityResponse.NextSteps.NextStep.value` (string)
    Example: "www.resourcelocation.com"

  - `CatalogOfferingsHospitalityResponse.NextSteps.NextStep.id` (string)
    Identifier for the Next Step
    Example: "2"

  - `CatalogOfferingsHospitalityResponse.NextSteps.NextStep.action` (string, required)
    The action this next step is intended to achieve
    Example: "cancel"

  - `CatalogOfferingsHospitalityResponse.NextSteps.NextStep.method` (string, required)
    Describes the set of potential methods that can be taken after an operation.
    Enum: "GET", "DELETE", "PUT", "POST"

  - `CatalogOfferingsHospitalityResponse.NextSteps.NextStep.description` (string)
    Additional clarification for the next step
    Example: "remove offer from the order"

  - `CatalogOfferingsHospitalityResponse.ReferenceList` (array)

  - `CatalogOfferingsHospitalityResponse.ReferenceList.@type` (string, required)
    Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
    Example: "ReferenceListFlight"

  - `CatalogOfferingsHospitalityResponse.ReferenceList.id` (string)
    Uniquely identifies for the Reference List

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion` (array)

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion.@type` (string)

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion.SourceCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion.TargetCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion.ConversionRate` (object, required)
    Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion.ConversionRate.value` (number)

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
    Contextual rate authority
    Example: "ISO 4217"

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
    Rate as of
    Example: "2026-08-07 12:12:00+00:00"

  - `CatalogOfferingsHospitalityResponse.Pagination` (object)
    Pagination object used when result sets span across a number of pages.

  - `CatalogOfferingsHospitalityResponse.Pagination.@type` (string, required)
    Example: "Pagination"

  - `CatalogOfferingsHospitalityResponse.Pagination.page` (integer, required)
    The current page number of the full result set
    Example: 1

  - `CatalogOfferingsHospitalityResponse.Pagination.pageSize` (integer, required)
    The total number of items on this page
    Example: 20

  - `CatalogOfferingsHospitalityResponse.Pagination.totalPages` (integer, required)
    The total number of pages in this result set
    Example: 5

  - `CatalogOfferingsHospitalityResponse.Pagination.totalItems` (integer, required)
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

# Return additional availability results (pagination).

Return additional availability results. The Hotel Availability response uses pagination by default. The response notes the total number of rates found and, if greater than 100, also returns a pagination identifier that can be used for retrieving additional pages of results using this Availability Pagination request. You can send an Availability Pagination request to retrieve each additional page of 100 rates until all available rates have been retrieved. NOTE: Availability results are cached for 30 minutes. You cannot retrieve additional results from that Availability response after it expires.

Endpoint: GET /hotel/availability/catalogofferingshospitality/{identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

  - `identifier` (string, required)
    The Identifier of the CatalogOfferings from which a page is to be returned

## Query parameters:

  - `pageNumber` (string, required)
    The page number of the page of availability results to retrieve (e.g., second page is pageNumber=2, etc.). The Availability response returns page 1, so values here should be between 2 and 5 inclusive. You are not required to retrieve pages consecutively.

## Header parameters:

  - `TraceId` (string)
    Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response.
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

  - `TVP-Correlation-Id` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.
    Example: "382c74c3-721d-4f34-80e5-57657b6cbc27"

  - `Accept-Encoding` (string, required)
    Comma-separated list of acceptable encodings like gzip and/or deflate
    Example: "gzip, deflate"

## Response 200 fields (application/json):

  - `CatalogOfferingsHospitalityResponse` (object)
    The response of a Catalog Offerings hospitality endpoint request. By default, common information from each room offer is consolidated into the single object ReferenceList. If the optional verboseResponseInd indicator is sent in the request, ReferenceList is not returned and common property details are not grouped.

  - `CatalogOfferingsHospitalityResponse.@type` (string)
    Example: "response"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings` (object)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.@type` (string, required)
    Example: "CatalogOfferings"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.id` (string)
    Local identifier within a given message for this object.
    Example: "CatalogOfferings_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.Identifier.value` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
    Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.Identifier.authority` (string)
    "Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
    Example: "TVPT"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.totalCatalogOffering` (integer)
    Total number of rates available for this request.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.catalogOfferingPerPage` (integer)
    Total number of rates returned per page.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.numberOfPages` (integer)
    Total number of pages created by this request.
    Example: 5

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering` (array, required)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.@type` (string, required)
    'Discriminator class for Hotel Availability is CatalogOfferingHospitality. 
Discriminator class for ExchangeSearch is CatalogOfferingModify.'
    Example: "CatalogOffering"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.id` (string)
    "Unique offer identifier that can be sent in subsequent payload requests to reference this offer. 
For Hotel Availability, offers are cached for 30 minutes. If a Rules request or Reservation is not created within 30 minutes, a new Availability request must be sent."
    Example: "108c5875-c822-4d2e-bb9f-c96368100f4a:a709ffcdc1f681c5cf3f1d7da1a8ebfc"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.CatalogOfferingRef` (string)
    Used to reference another instance of this object in the same message
    Example: "co1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ContentSource` (string)
    Indicates the owner the offer or document.
    Enum: "GDS", "NDC", "LCC", "API"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions` (array, required)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.@type` (string, required)
    Discriminator classes ProductOptionsID and ProductOptions.
    Example: "ProductOptions"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.id` (string)
    Local identifier within a given message for this object.
    Example: "ProductOptions_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.ProductOptionsRef` (string)
    Used to reference another instance of this object in the same message
    Example: "ProductOptions_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.sequence` (integer)
    NonnegativeInteger
    Example: 1

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product` (array, required)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product.@type` (string, required)
    Discriminator. Air Search child classes are ProductAir and ProductAncillary. Exchange Search child class is ProductAir. Ancillary Search is ProductAncillary. Seat Map child class isProductSeatAvailability. Air Price child classes are ProductAir and ProductAncillary. Hotel Availability child classes are ProductHospitality and ProductHospitalityOffer. Hotel Rules and HotelReservation child classes are ProductHospitality. All Vehicle APIs are ProductVehicle and ProductAncillaryVehicle. Reservation and Reservation Workbench child classes are ProductAir, ProductAncillary, ProductHospitality, ProductVehicle, and ProductAncillaryVehicle.
    Example: "ProductAir"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product.id` (string)
    Local id within a given message to support referencing this object.
    Example: "product_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product.productRef` (string)
    Reference id that corresponds to the product 'id' in ReferenceListProduct.Product. To find flight details for a product, use the ProductRef id to identify the product in ReferenceListProduct.Product, and use the Flight id's (e.g., s3, s4) to match to flight information in ReferenceListFlight.Flight.
    Example: "product_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.ProductOptions.Product.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price` (object, required)
    Child class of Price. This includes all of the Price object plus the Pricebreakdown which gives detailed Price information per PTC or Hotel offering.
For a Hotels Create Reservation (Full Payload) request, find the values to send in the Price objects from either Availability (returned in CatalogOffering/Price) or Rules (returned in Offer/Price). Although you can send the price returned in either API, the Rules pricing may be more accurate. If you sent a Rules request, send the value from that response. You must include CurrencyCode, Base, TotalTaxes, and TotalPrice. When returned from the previous steps, additionally send TermsAndConditionsFull, ProductRateCodeInfo, and RateCodeInfo.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.@type` (string, required)
    Discriminator classes Price or PriceDetail
    Example: "PriceDetail"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.id` (string)
    Internally referenced id
    Example: "2"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode.value` (string)
    An ISO 4217 currency code.
    Example: "USD"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode.codeAuthority` (string)
    Currency code authority
    Example: "ISO 4217"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode.decimalPlace` (integer)
    Number of decimal places for the currency.
    Example: 4

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.CurrencyCode.decimalAuthority` (string)
    Currency code decimal authority
    Example: "ISO 4217"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.Base` (number)
    "Base price before taxes and fees. 
For Hotel, may not be returned by all suppliers."
    Example: 20.2

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.TotalTaxes` (number)
    "Total taxes applied to the base price. 
For Hotel, may not be returned by all suppliers."
    Example: 34.4

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.TotalFees` (number)
    Total fees included in Total Price.
    Example: 201

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.TotalPrice` (number)
    Total price of this offer including the base price and all taxes and fees.
    Example: 34

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.FlightPassCredits` (integer)
    The total number of flight pass credits consumed for this offer.
    Example: 2

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown` (array)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.@type` (string, required)
    Discriminator. Air Search and Air Price APIs child classes are PriceBreakdownAir and PriceBreakdownAncillary.Search Ancillaries and Seat Availabilities child classes are PriceBreakdown, PriceBreakdownAncillary, and PriceBreakdownAncillaryAir. All Hotel API child classes are PriceBreakdownHospitality.Vehicle API child classes are PriceBreakdownVehicleCharges, PriceBreakdownVehicleDeposit, PriceBreakdownVehiclePrice, and PriceBreakdownAncillaryVehicle. Reservation and Reservation Workbench APIs are PriceBreakdownAir, PriceBreakdownAncillary, PriceBreakdownHospitality, PriceBreakdownVehicleCharges, PriceBreakdownVehicleDeposit, PriceBreakdownVehiclePrice, and PriceBreakdownAncillaryVehicle.
    Example: "PriceBreakdownAir"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount` (object)
    Amount represents the cost applied

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.@type` (string)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.currencySource` (string)
    The system requesting or returning the currency code specified in the attribute
    Enum: "Supplier", "Charged", "Requested"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.Base` (number)
    The base price prior to all applicable taxes or fees of a product, such as the amount for a room or fare for a flight.
    Example: 120.2

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.Taxes` (object)
    Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.Fees` (object)
    Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.Total` (number)
    "Specifies the total price including base + taxes + fees. 
In PriceBreakdownHospitality, this total is for a given group of nights. 
In PriceBreakdownAir this is the total for one passenger of this PTC type."
    Example: 230.13

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Amount.approximateInd` (boolean)
    if true this amount has been converted from the original amount
    Example: true

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Commission` (object)
    Commission information. In Air Search commission is returned for GDS only; not supported for NDC. Any commission filed by an airline in a CAT35 fare is returned in PriceBreakdownAir/Commission. The amount is either a percent of the fare component (@type CommissionPercent and the Percent object) or an amount (@type CommissionAmount and the Amount object).

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Commission.@type` (string, required)
    Discriminator. Child classes CommissionAmount or CommissionPercent
    Example: "CommissionAmount"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.PriceBreakdown.Commission.application` (string)
    Type of commission
    Enum: "Full", "Partial", "Non-paying", "No-show", "Adjustment", "Commissionable"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal` (object)
    No longer used. Previously used to expose the local vendor currency when it is different to the purchased currency

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.@type` (string)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.currencySource` (string)
    The system requesting or returning the currency code specified in the attribute
    Enum: "Supplier", "Charged", "Requested"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.CurrencyCode` (object)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.Base` (number)
    The price prior to all applicable taxes of a product such as the rate for a room or fare for a flight.
    Example: 120.2

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.Taxes` (object)
    Summary of all individual taxes. Child class TaxesDetail provides the breakdown of individual taxes.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.Fees` (object)
    Includes TotalFees object to return the sum total of any fees. Child class FeesDetail includes a breakdown of the individual fees.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.Total` (number)
    Specifies the total price including base + taxes + fees
    Example: 30.13

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.Price.VendorCurrencyTotal.approximateInd` (boolean)
    True if this amount has been converted from the original amount
    Example: true

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions` (object)
    Terms And Conditions that apply to an offer.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.@type` (string, required)
    Discriminator. Air Search child classes are TermsAndConditionsAir and TermsAndConditionsAncillary. Exchange Search child class is TermsAndConditionsAirChange. Search Ancillaries and Seat Availabilities child classes are TermsAndConditions, TermsAndConditionsAncillary, and TermsAndConditionsAncillaryAir. Hotel Availability child class is TermsAndConditionsHospitality.
    Example: "TermsAndConditionsAir"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.id` (string)
    Local id within a given message to support referencing this object. For Air Search APIs, matches to the reference value in ProductBrandOffering/TermsAndConditions/termsAndConditionsRef in instances of ProductBrandOptions.
    Example: "TC_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.termsAndConditionsRef` (string)
    Reference id that corresponds to the TermsAndConditions 'id' in ReferenceListTermsAndConditions.TermsAndConditions.
    Example: "TC_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.ExpiryDate` (string)
    The date and time the offer will expire. Not returned in GDS Search. NDC generally allows 20 to 30 minutes to create a booking (the offer time limit). That time limit varies by airline and is returned here in the Search response.
    Example: "2022-08-07 12:12:00+00:00"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty` (array)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.value` (string, required)
    Number on loyalty card.
    Example: "132456"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.id` (string)
    Optional Customer Loyalty Id. Not saved
    Example: "Loyalty_1"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.priority` (integer)
    Optional Numeric Priority Code
    Example: 2

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.programId` (string)
    "Specifies an identifier to indicate the company owner of the loyalty program. Typically two characters.
For frequent guest number, the hotel supplier or brand code. 
For frequent flyer number, the air supplier code of the loyalty program."
    Example: "United"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.programName` (string)
    Supplier's loyalty program name.
    Example: "Frontier-EarlyReturns"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.supplierType` (string)
    The type of supplier of a loyalty program. Uses 'hotel' for frequent guest number or 'air' for frequent flyer number.
    Example: "Airline"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.supplier` (string, required)
    Supplier of a loyalty program (typically 2 characters representing the hotel, brand, or airline).
    Example: "UA"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.tier` (string)
    Customer Loyalty tier
    Example: "Silver"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.shareWithSupplier` (array)
    The list of suppliers that the CustomerLoyalty number is shared. Used for cross accrual.
    Example: ["LH"]

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.cardHolderName` (string)
    Customer loyalty member name; up to 128 characters are supported. In Air Search, for discounted offers to be returned, the name must be sent as LAST FIRST; e.g.,if SMITH is the last name and JORDAN the first name, send as SMITH JORDAN
    Example: "John Smith"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.validatedInd` (boolean)
    Customer loyalty number has been validated by the supplier
    Example: true

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.prefix` (string)
    The cardholder name prefix title like Mr, Mrs, Dr
    Example: "Dr"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.given` (string)
    The First Name of the Cardholder
    Example: "John"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.middle` (string)
    Middle Name of the Cardholder
    Example: "Wilkinson"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.CatalogOffering.TermsAndConditions.CustomerLoyalty.surname` (string)
    Last Name of the Cardholder
    Example: "Smith"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.AncillaryOffering` (array)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.AncillaryOffering.@type` (string, required)
    Discriminator classes AncillaryOfferingID and AncillaryOffering
    Example: "AncillaryOffering"

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.AncillaryOffering.id` (string)
    Local identifier within a given message for this object.

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.AncillaryOffering.CatalogOfferingRef` (string)
    Used to reference another instance of this object in the same message

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.AncillaryOffering.AncillaryOfferingRef` (string)

  - `CatalogOfferingsHospitalityResponse.CatalogOfferings.AncillaryOffering.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `CatalogOfferingsHospitalityResponse.transactionId` (string)
    "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
    Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

  - `CatalogOfferingsHospitalityResponse.traceId` (string)
    "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
    Example: "TraceID_123456"

  - `CatalogOfferingsHospitalityResponse.correlationId` (string)
    Identifier used to correlate hotel API invocations across a multi-call business flow.

  - `CatalogOfferingsHospitalityResponse.reservationStatus` (string)
    Status of reservation or offer completion.
    Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

  - `CatalogOfferingsHospitalityResponse.Result` (object)
    Returns the error and/or warning message information, if applicable.

  - `CatalogOfferingsHospitalityResponse.Result.@type` (string)
    Discriminator class Result only
    Example: "Result"

  - `CatalogOfferingsHospitalityResponse.Result.status` (string)
    The status of an error or warning
    Enum: "Not processed", "Incomplete", "Complete", "Unknown"

  - `CatalogOfferingsHospitalityResponse.Result.Error` (array)
    A list of error information returned at the provider level for a response.

  - `CatalogOfferingsHospitalityResponse.Result.Error.@type` (string, required)
    Discriminator classes Error or ErrorDetail
    Example: "ErrorDetail"

  - `CatalogOfferingsHospitalityResponse.Result.Error.Message` (string)
    The Travelport standardized error or warning message
    Example: "No flights found."

  - `CatalogOfferingsHospitalityResponse.Result.Error.NameValuePair` (array)

  - `CatalogOfferingsHospitalityResponse.Result.Error.NameValuePair.value` (string)
    Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
    Example: "Sunday"

  - `CatalogOfferingsHospitalityResponse.Result.Error.NameValuePair.id` (string)
    Optional internally referenced id
    Example: "6"

  - `CatalogOfferingsHospitalityResponse.Result.Error.NameValuePair.name` (string, required)
    Key, categorizing the of type of remark or error.
    Example: "Day1"

  - `CatalogOfferingsHospitalityResponse.Result.Error.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `CatalogOfferingsHospitalityResponse.Result.Warning` (array)
    A list of warning information returned at the provider level for a response.

  - `CatalogOfferingsHospitalityResponse.Result.Warning.@type` (string, required)
    Discriminator classes Warning or WarningDetail
    Example: "WarningDetail"

  - `CatalogOfferingsHospitalityResponse.Result.Warning.Message` (string)
    The Travelport standardized error or warning message
    Example: "Customer Loyalty could not be applied."

  - `CatalogOfferingsHospitalityResponse.Result.Warning.NameValuePair` (array)

  - `CatalogOfferingsHospitalityResponse.Result.Warning.StatusCode` (integer)
    Http standard response code
    Example: 200

  - `CatalogOfferingsHospitalityResponse.Identifier` (object)
    A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

  - `CatalogOfferingsHospitalityResponse.NextSteps` (object)
    Container for the steps that describe actions that may be taken on the containing object.

  - `CatalogOfferingsHospitalityResponse.NextSteps.baseURI` (string, required)
    The base portion of the uri in order to shorten the uris in the individual steps

  - `CatalogOfferingsHospitalityResponse.NextSteps.id` (string)
    Optional internally referenced id
    Example: "5"

  - `CatalogOfferingsHospitalityResponse.NextSteps.NextStep` (array, required)

  - `CatalogOfferingsHospitalityResponse.NextSteps.NextStep.value` (string)
    Example: "www.resourcelocation.com"

  - `CatalogOfferingsHospitalityResponse.NextSteps.NextStep.id` (string)
    Identifier for the Next Step
    Example: "2"

  - `CatalogOfferingsHospitalityResponse.NextSteps.NextStep.action` (string, required)
    The action this next step is intended to achieve
    Example: "cancel"

  - `CatalogOfferingsHospitalityResponse.NextSteps.NextStep.method` (string, required)
    Describes the set of potential methods that can be taken after an operation.
    Enum: "GET", "DELETE", "PUT", "POST"

  - `CatalogOfferingsHospitalityResponse.NextSteps.NextStep.description` (string)
    Additional clarification for the next step
    Example: "remove offer from the order"

  - `CatalogOfferingsHospitalityResponse.ReferenceList` (array)

  - `CatalogOfferingsHospitalityResponse.ReferenceList.@type` (string, required)
    Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
    Example: "ReferenceListFlight"

  - `CatalogOfferingsHospitalityResponse.ReferenceList.id` (string)
    Uniquely identifies for the Reference List

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion` (array)

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion.@type` (string)

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion.SourceCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion.TargetCurrency` (object, required)
    Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion.ConversionRate` (object, required)
    Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion.ConversionRate.value` (number)

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
    Contextual rate authority
    Example: "ISO 4217"

  - `CatalogOfferingsHospitalityResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
    Rate as of
    Example: "2026-08-07 12:12:00+00:00"

  - `CatalogOfferingsHospitalityResponse.Pagination` (object)
    Pagination object used when result sets span across a number of pages.

  - `CatalogOfferingsHospitalityResponse.Pagination.@type` (string, required)
    Example: "Pagination"

  - `CatalogOfferingsHospitalityResponse.Pagination.page` (integer, required)
    The current page number of the full result set
    Example: 1

  - `CatalogOfferingsHospitalityResponse.Pagination.pageSize` (integer, required)
    The total number of items on this page
    Example: 20

  - `CatalogOfferingsHospitalityResponse.Pagination.totalPages` (integer, required)
    The total number of pages in this result set
    Example: 5

  - `CatalogOfferingsHospitalityResponse.Pagination.totalItems` (integer, required)
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

