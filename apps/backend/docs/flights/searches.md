# Searches

Air searches.

## Air Availability

- [POST /air/search/airAvailability](https://developer.travelport.com/apis/flights/searches/createairavailability.md): Air Availability returns scheduled flights between a specified city pair on a specified day and time and indicates whether seats are available on those flights. Air Availability is a full payload request that focuses on seat availability by class of service. It does not return pricing information. GDS only; not supported for NDC.

## Search

- [POST /air/catalog/search/catalogproductofferings](https://developer.travelport.com/apis/flights/searches/createairsearch.md): The Search API returns offers for flights between specific origin and destination (O&D) pairs. You can set the Search request to return offers for the full itinerary (a journey-based search), or for only the first leg (a leg-based search) and follow it with a Next Leg Search. Any modifiers or indicators sent in the Search request carry over to the Next Leg Search request and are not re-sent.

## Next Leg Search

- [POST /air/catalog/search/catalogproductofferings/buildnext](https://developer.travelport.com/apis/flights/searches/buildnextairsearch.md): The Next Leg Search API returns offers for the next leg of an itinerary after a leg-based round-trip Search. The leg-based Search response returns offers for the outbound leg of the itinerary, and Next Leg Search is then required to return offers for the next leg of the trip. For a multi-city itinerary, send an additional Next Leg Search request for each remaining leg. GDS supports searching for up to six O&D pairs (legs of the itinerary) while NDC supports three O&D pairs. Next Leg Search is supported only after a leg-based Search. If sent after a journey-based Search, an error message is returned. Any modifiers or indicators sent in the Search request carry over to the Next Leg Search request and are not re-sent. The Next Leg Search response uses the same structure and returns the same objects as the Search response. The only differences are, the first instance of CatalogProductOffering is the offer and product sent in the Next Leg Search request. This is the selected offer and product for the first leg. Subsequent instances of CatalogProductOffering are offers for the second leg.

## Flight Specific Search

- [POST /air/catalog/search/catalogproductofferings/buildoptions](https://developer.travelport.com/apis/flights/searches/buildoptionsairsearch.md): The Flight Specific Search API Reference Payload request returns additional upsells, up to 99, for any product/s returned by Search or Next Leg Search. The reference payload sends an identifier referencing a previous response and the offer and product identifiers. The full payload request does not reference a previous Search response. GDS only, not supported for NDC. Any CabinPreference in the initial Search request is applied to any subsequent Next Leg Search and reference Flight Specific Search requests. To use the Flight Specific Search reference payload request, your initial Search request must send offersPerPage to invoke caching if that Search was journey-based (leg-based search results are always cached). The Flight Specific Search response uses the same structure and returns the same objects as the Search response. The differences are, One instance of CatalogProductOffering (id o1) is returned for each offer sent in the request. One instance of ReferenceListProduct/Product is returned for each product sent in the request.

## Premium flex search

- [POST /air/catalog/search/catalogproductofferings/premiumflex](https://developer.travelport.com/apis/flights/searches/createflexsearch.md): The Premium Flex Search API is the first step in the travel booking workflow. Send a Search request to return offers for flights between the selected cities

# Air Availability

Air Availability returns scheduled flights between a specified city pair on a specified day and time and indicates whether seats are available on those flights. Air Availability is a full payload request that focuses on seat availability by class of service. It does not return pricing information. GDS only; not supported for NDC.

Endpoint: POST /air/search/airAvailability
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
  Discriminator class CatalogProductOfferingsQueryRequest only
  Example: "CatalogProductOfferingsQueryRequest"

- `CatalogProductOfferingsRequest` (object, required)
  Used for an Air Search request. Defines the request-wide search options for the initial shopping call, including content source, option to use the cache, passenger and flight search criteria, optional search and pricing refinement modifiers, and more.

- `CatalogProductOfferingsRequest.@type` (string, required)
  Discriminator classes CatalogProductOfferingsRequest and CatalogProductOfferingsRequestAir
  Example: "CatalogProductOfferingsRequestAir"

- `CatalogProductOfferingsRequest.SearchControlConsoleChannelID` (object)
  The Search API supports the Travelport Content Optimizer (formerly known as Search Control Console/SCC) for GDS content only. Send either the value or the sccType. If both values are sent, the sccType is applied. Travel agency administrators use Content Optimizer to create business rules for filtering certain air shopping results. If your client's application does not use Content Optimizer, do not use these attributes. Contact your Travelport representative if you would like additional information.

- `CatalogProductOfferingsRequest.SearchControlConsoleChannelID.value` (string)
  String for the Content Optimizer channel ID.
  Example: "IBM"

- `CatalogProductOfferingsRequest.SearchControlConsoleChannelID.sccType` (string)
  String for the Content Optimizer type.
  Example: "999"

- `CatalogProductOfferingsRequest.offersPerPage` (integer)
  Sets the maximum number of offers returned. If sent with 0 or not sent, Search returns all offers. If fewer offers than specified in offersPerPage are available, all offers are returned. For caching, sets whether to invoke caching so that journey-based search results can be referenced by subsequent reference payload requests. Send with any number equal to or greater than 1. No maximum value. If offersPerPage is not sent for a journey-based search, the results are not cached and the response does not return a transaction identifier. Does not affect leg-based search results, which are cached by default.Number of offers per page. If your workflow subsequently references a journey-based Closed search result, the Search request must send offersPerPage set to any positive number. This setting invokes caching to allow subsequent requests to refer to these search results. If a journey-based Search request does not send offersPerPage, any subsequent reference payload requests fail, including the Flight Specific Search, AirPrice, and Add Offer reference payloads.
  Example: 45

- `CatalogProductOfferingsRequest.contentSourceList` (array)
  Supports requesting both or either GDS or NDC content. If not sent only GDS content is returned. Send both values to return aggregated GDS and NDC content
  Enum: "GDS", "NDC", "LCC", "API"

- `CatalogProductOfferingsRequest.maxNumberOfUpsellsToReturn` (integer)
  Returns the specified number of upsell fares for each base fare, up to 4 for GDS, 99 for NDC, or as many filed by the airline if fewer than the value sent are available. Values greater than these supported values do not return an error message, but instead max out at the supported upsells per base fare. Upsells are not returned in a specific object but rather are presented along with the base fare as a higher level of service, usually a branded fare. This value carries over to any follow-on Next Leg Search request. Note the following differences for GDS and NDC: For GDS, when maxNumberOfUpsellsToReturn is either not sent or sent as 0, the lowest priced offer is returned. For NDC: When maxNumberOfUpsellsToReturn is not sent, the response returns the lowest priced offer of each available brand or cabin. When maxNumberOfUpsellsToReturn=0, the response returns the lowest priced offer. The number of upsells that can be requested are limited for multi-city itineraries: four to six O&Ds are limited to one upsell; three O&Ds are limited to two upsells; and one or two O&Ds (one-way or round-trip itineraries) can have up to four upsells for GSD or 99 for NDC.The maximum number of upsells to return
  Example: 3

- `CatalogProductOfferingsRequest.sortBy` (string)
  Sorts offers in order by the value in BestCombinablePrice/TotalPrice. Supported value: Price-LowToHigh: Sorts the offers returned from lowest to highest price. Supported for GDS, NDC, and combined GDS and NDC content. If sent, this sorting also applies to any following Next Leg Search. Upsell offers are not sorted. Travelport recommends as best practice that when sending sortBy and requesting NDC content, do not also send offersPerPage. If sent together some offers may be incomplete. Note the following when requesting NDC content: NDC-only content when multiple NDC carriers return offers: Without sorting: Search returns NDC offers consecutively by carrier; for example, all NDC AA offers, followed by all NDC UA offers. With sorting: Search returns all offers in ascending price order regardless of carrier. GDS and NDC combined content: Without sorting: Search returns offers by carrier. first for GDS and then for NDC; for example, GDS AA offers, NDC AA offers, GDS UA offers, NDC UA offers. With sorting: Search returns all offers in ascending price order regardless of carrier or content source.
  Enum: "Price-LowToHigh"

- `CatalogProductOfferingsRequest.PassengerCriteria` (array, required)
  Defines the type of passenger traveling. Send one instance of PassengerCriteria for each passenger type code (PTC). Search supports up to 9 total passengers. A maximum of 6 PTCs are supported for GDS. NDC does not have a PTC limitation. Can include optional traveler details such as age, birth date, loyalty, and geographic location when needed.

- `CatalogProductOfferingsRequest.PassengerCriteria.@type` (string, required)
  Discriminator. No child classes.
  Example: "PassengerCriteria"

- `CatalogProductOfferingsRequest.PassengerCriteria.number` (integer, required)
  The amount of passengers associated with this passenger type code
  Example: 1

- `CatalogProductOfferingsRequest.PassengerCriteria.age` (integer)
  The age of the passenger. Travelport recommends sending age only with PTCs that require age for pricing. For child passengers, Travelport recommends sending the age of the child in the age attribute plus the PTC CNN. Travelport recommends against sending CNN without age, or the CHD PTC. Many fares cannot be quoted for CHD. The age for CNN is generally between 2 and 11 inclusive, with ADT fares returned for ages 12 and up; however, this can vary by airline and country. The age for INF must be either 0 or 1. During booking, date of birth is required for all child and infant PTCs (Add Traveler payload in Traveler/birthDate).
  Example: 26

- `CatalogProductOfferingsRequest.PassengerCriteria.passengerTypeCode` (string)
  Required field for Air Search and Flight specific search. The passenger type code for the passengers on the itinerary. Common PTCs are: ADT: adult CHD: child of unknown age (see Notes on PTC and age below) CNN: child when age is known INF: infant without a seat INS: infant with a seat UNN: unaccompanied child. See API guides to download a full list of PTCs. NDC carriers BA, SQ, AV, AA, and AF/KLM offer teen/young adult tax exemptions from the UK Air Passenger Duty (GB tax). Send PTC with the value YTH and send the passengers age per below. The PTC may be returned as ADT, or Cxx in which xx is the age, but the tax exemption is applied in the pricing on these NDC carriers. When running a multiple passenger search for NDC on Qantas, Qantas supports only these PTCs: ADT, CHD, CNN, INF. Sending any other PTC may result in an error at ticketing.
  Example: "ADT"

- `CatalogProductOfferingsRequest.PassengerCriteria.birthDate` (string)
  The date of birth of the passenger. May be used in age validation for fares with age restrictions.
  Example: "2020-01-16"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty` (array)
  Optional object for sending customer loyalty information, such as for a frequent flyer program. If CustomerLoyalty is sent in the Search request, it must also be sent in the Air Price request and the Add Traveler request. Some carriers validate frequent traveler data through the workflow, failing to send the same CustomerLoyalty details, even if invalid, may cause a booking failure. If an invalid number is sent, the response returns a warning message that the FQTV is invalid, and the invalid number is cached to prevent a potential booking failure. In Search API CustomerLoyalty is only sent to NDC carriers. Ignored for GDS Search.

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.value` (string, required)
  Number on loyalty card.
  Example: "132456"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.id` (string)
  Optional Customer Loyalty Id. Not saved
  Example: "Loyalty_1"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.priority` (integer)
  Optional Numeric Priority Code
  Example: 2

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.programId` (string)
  "Specifies an identifier to indicate the company owner of the loyalty program. Typically two characters.
  For frequent guest number, the hotel supplier or brand code.
  For frequent flyer number, the air supplier code of the loyalty program."
  Example: "United"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.programName` (string)
  Supplier's loyalty program name.
  Example: "Frontier-EarlyReturns"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.supplierType` (string)
  The type of supplier of a loyalty program. Uses 'hotel' for frequent guest number or 'air' for frequent flyer number.
  Example: "Airline"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.supplier` (string, required)
  Supplier of a loyalty program (typically 2 characters representing the hotel, brand, or airline).
  Example: "UA"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.tier` (string)
  Customer Loyalty tier
  Example: "Silver"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.shareWithSupplier` (array)
  The list of suppliers that the CustomerLoyalty number is shared. Used for cross accrual.
  Example: ["LH"]

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.cardHolderName` (string)
  Customer loyalty member name; up to 128 characters are supported. In Air Search, for discounted offers to be returned, the name must be sent as LAST FIRST; e.g.,if SMITH is the last name and JORDAN the first name, send as SMITH JORDAN
  Example: "John Smith"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.validatedInd` (boolean)
  Customer loyalty number has been validated by the supplier
  Example: true

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.prefix` (string)
  The cardholder name prefix title like Mr, Mrs, Dr
  Example: "Dr"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.given` (string)
  The First Name of the Cardholder
  Example: "John"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.middle` (string)
  Middle Name of the Cardholder
  Example: "Wilkinson"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.surname` (string)
  Last Name of the Cardholder
  Example: "Smith"

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation` (object)
  Optional object for requesting local citizen/local resident fares for Spain and associated islands. You must also send a PTC relevant to the local resident fares; e.g., ADR for adult resident, CHR for child resident. Any discount applied through TravelerGeographicLocation applies to all travelers, not only to the traveler in this instance of PassengerCriteria. If the discount must apply only to an individual traveler, that traveler requires a separate search and book workflow.

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.value` (string)
  IATA code for the city, country, or state/province relevant to the local citizen//local resident fare.
  Example: "PMI"

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.travelerGeographicLocationType` (string)
  The geographic type of the location value
  Enum: "Country", "StateProvince", "City"

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.residentGeographicCode` (string)
  Resident code for Spanish residency fares for NDC. Any discount will apply to all travelers, not only to the traveler in this instance of PassengerCriteria. Supported/validated only for NDC to support local citizen fares.

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.generalLargeFamilyResidentDiscountInd` (boolean)
  Send only if true and request qualifies for general large family resident discount, defined as general large families (up to three children) from Spain, from the EU/EEA, or of any other nationality whose residency in Spain is recognized and who are in possession of a large-family certificate issued by the autonomous community in which they live. Supported/validated only for NDC to support local citizen fares.
  Example: true

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.specialLargeFamilyResidentDiscountInd` (boolean)
  Send only if true and request qualifies for special large family resident discount, defined as special large families (four or more children) from Spain, from the EU/EEA, or of any other nationality whose residency in Spain is recognized and who are in possession of a large-family certificate issued by the autonomous community in which they live. Supported/validated only for NDC to support local citizen fares.
  Example: true

- `CatalogProductOfferingsRequest.PassengerCriteria.specifiedPassengerTypeCodeOnlyInd` (boolean)
  If true, returns only offers for the specified PTC. If no offers for that PTC are available, an error message that offers were found is returned. GDS only; not supported for NDC. Default is false.
  Example: true

- `CatalogProductOfferingsRequest.SearchCriteriaFlight` (array, required)
  Each instance defines one leg of the itinerary by specifying an origin and destination (O&D) pair, aka departure and arrival location, for that leg. Optionally includes travel timing. Send one instance of SearchCriteriaFlight for each leg of the itinerary. You must specify all O&D pairs for all legs of the itinerary, even for a leg-based search. Search, Next Leg Search, and Flight Specific Search support a maximum of 6 O&D pairs for both GDS and NDC.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.departureDate` (string)
  Preferred local departure date in YYYY-MM-DD format. For GDS, send either departureDate or arrivalDate. If both departureDate and arrivalDate are sent, departureDate is ignored. For NDC, departureDate is required. For GDS content, departureDate is not required when sending arrivalDate.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.daysBeforeDeparture` (integer)
  Available for flex search only. Return flight options within a number of days from specified departure date. Maximum of 3 days can be selected.
  Example: 1

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.daysAfterDeparture` (integer)
  Available for flex search only. Return flight options within a number of days from specified departure date. Maximum of 3 days can be selected.
  Example: 2

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.departureTime` (string)
  Returns NDC offers with flights between two hours before and two hours after the departure time; for example, for departureTime of 10:00:00, Search returns available flights between 8:00 and 12:00. Do not use for GDS; instead, use DepartureTimeRange. For NDC content, if multiple time options are sent in the same instance of SearchCriteriaFlight, they are applied in the order DepartureTimeRange, departureTime, and arrivalTime.
  Example: "07:00:00"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.arrivalDate` (string)
  Date of arrival in YYYY-MM-DD format. For GDS, send either arrivalDate or departureDate. If both departureDate and arrivalDate are sent, departureDate is ignored. For NDC, arrivalDate is optional and departureDate is always required; if sent, offers returned are filtered by both arrivalDate and departureDate.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.arrivalTime` (string)
  Returns NDC offers with flights between two hours before and two hours after the arrival time; for example, for arrivalTime of 10:00:00, Search returns available flights between 8:00 and 12:00. Do not use for GDS; instead, use ArrivalTimeRange. Supported only by specific NDC carriers. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC Resources if you need login assistance).
  Example: "09:15:00"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.legSequence` (integer)
  Recommended to send when requesting cabin, class of service, and/or connection preferences at the leg level. See example in Air Search guide. Do not send if requesting preferences at itinerary level.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From` (object, required)
  Origin Destination Information

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From.value` (string)
  The IATA airport or city code for the departure or arrival airport/city for this leg.
  Example: "MEX"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From.cityOrAirport` (string)
  Optional enumeration specifying whether to restrict the search based on the city/airport code sent in From/value. Possible options and behavior are as follows. These behaviors are for availability selection only. Actual content may vary based on calculated price and diversity. Not all NDC carriers may support all options. Airport code with no cityOrAirport value expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. This behavior also applies to: city code with Airport Only, City code with City Only, City or airport code with City or Airport. Airport code with cityOrAirport value Airport Only returns content only from the specified airport. For example, LGA will return content from only LGA. Airport code with cityOrAirport value City expands the availability selection to the city without giving preference to the requested airport. This behavior is equivalent to searching with the airport's city code. For example, LGA would instead be treated as NYC and would return flights for LGA, EWR, and JFK with no preference.
  Enum: "Airport Only", "City or Airport", "City Only", "Use Default"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From.radius` (integer)
  Available for flex search only. Return offers from airports within a specified distance from the origin and/or destination.
  Example: 50

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From.radiusMeasurement` (string)
  For Hotels: Optional object to request either miles or kilometers for the search radius from the specified location. If unitOfDistance is not specified, the search defaults to miles for properties in the United States, Myanmar, and Liberia. The search defaults to kilometers in all other countries.
  Enum: "Miles", "Kilometers"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.To` (object, required)
  Origin Destination Information

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.AdditionalFrom` (array)
  Available for flex search only. Select additional origin cities to expand your flight options.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.AdditionalFrom.value` (string)
  The additional IATA airport or city codes for the departure or arrival airport/city for this leg.
  Example: "LGW"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.AdditionalFrom.cityOrAirport` (string)
  Optional enumeration specifying whether to restrict the search based on the city/airport code sent in From/value. Possible options and behavior are as follows. These behaviors are for availability selection only. Actual content may vary based on calculated price and diversity. Not all NDC carriers may support all options. Airport code with no cityOrAirport value expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. This behavior also applies to: city code with Airport Only, City code with City Only, City or airport code with City or Airport. Airport code with cityOrAirport value Airport Only returns content only from the specified airport. For example, LGA will return content from only LGA. Airport code with cityOrAirport value City expands the availability selection to the city without giving preference to the requested airport. This behavior is equivalent to searching with the airport's city code. For example, LGA would instead be treated as NYC and would return flights for LGA, EWR, and JFK with no preference.
  Enum: "Airport Only", "City or Airport", "City Only", "Use Default"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.AdditionalTo` (array)
  Available for flex search only. Select additional destination cities to expand your flight options.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.DepartureTimeRange` (object)
  In Air Search API supports searching by a departure or arrival time window for any leg of the itinerary. For NDC, supported only by specific NDC carriers. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC Resources if you need login assistance).

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.DepartureTimeRange.start` (string)
  The start time of the departure or arrival time window to search. Either start or end is required.
  Example: "06:15:00"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.DepartureTimeRange.end` (string)
  The end time of the departure or arrival time window to search. Either start or end is required.
  Example: "09:15:00"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.ArrivalTimeRange` (object)
  In Air Search API supports searching by a departure or arrival time window for any leg of the itinerary. For NDC, supported only by specific NDC carriers. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC Resources if you need login assistance).

- `CatalogProductOfferingsRequest.SearchModifiersAir` (object)
  Add one or more optional modifiers to filter search results by criteria related to the journey itself. All journey modifiers are in CatalogProductOfferingsQueryRequest/CatalogProductOfferingsRequest/SearchModifiersAir. Any modifiers sent in the initial Search request are applied to any subsequent Next Leg Search request. All modifiers apply to the entire itinerary, not at the leg level, unless otherwise specified with legSequence per below.

- `CatalogProductOfferingsRequest.SearchModifiersAir.@type` (string, required)
  discriminator
  Example: "SearchModifiersAir"

- `CatalogProductOfferingsRequest.SearchModifiersAir.excludeGround` (string)
  Excludes certain ground transportation from the response. By default, the response may return ground transportation options such as trains and buses, depending on the routing. In the response, ground transportation options are identified in ReferenceList/Flight by the TRN, TRS, or BUS equipment codes.GDS only, not supported for NDC.
  Enum: "Train", "All"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "CarrierPreference"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference.preferenceType` (string, required)
  The type of carrier preference
  Enum: "Preferred", "Permitted", "Prohibited"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference.carriers` (array, required)
  One or more carrier codes to permit, prohibit, or prefer. Preferred alliances are also supported; send the alliance code (e.g., /\*A) instead of the carrier code.
  Example: ["BA"]

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference.legSequence` (array)
  Applies the carrier/alliance preference to only specific legs of the itinerar referencing legSequence sent in SearchCriteriaFlight. Do not send if requesting preference at itinerary level. GDS only, not supported for NDC.
  Example: [1,2]

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "CabinPreference"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference.preferenceType` (string)
  Sending a mix of preferenceType values is not supported. For example, you cannot send an instance of CabinPreference with a preferenceType of Permitted and another instance with preferenceType of Prohibited. In this case the results default to the Preferred preference.
  Enum: "Preferred", "Permitted", "PreferredWithUpgrade", "Prohibited"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference.cabins` (array)
  A space-delimited list of cabins.
  Enum: "PremiumFirst", "First", "Business", "PremiumEconomy", "Economy"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference.legSequence` (array)
  Limits preference to the specified leg referenced in SearchCriteriaFlight. You can apply the preference to only some legs of the itinerary, or different preferences to different legs. To apply preference to the entire itinerary, do not send legSequence. GDS only, not supported for NDC. Not supported at Price or Book.
  Example: [1,2]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference.@type` (string)
  Discriminator. No child classes exist
  Example: "ClassOfServicePreference"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference.legSequence` (array)
  Applies preference to specified leg/s of the itinerary, referencing the leg sequence in SearchCriteriaFlight. Do not send if requesting preference at itinerary level.
  Example: [1,2]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference.ClassesOfService` (array, required)
  One or more classes of service to permit or prohibit.
  Example: ["F"]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference.PreferenceType` (string)
  Class of Service preference options.
  Enum: "Preferred", "Permitted", "Prohibited"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.@type` (string)
  Discriminator. No child classes exist
  Example: "ProductInclusionPreference"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.Classification` (array, required)
  Send one or more of the enumerated values to return only fares that include those attributes in the price. For example, sending CarryOn returns only fares that include a carry-on bag in the price.
  Enum: "CheckedBag", "CarryOn", "PersonalItem", "Rebooking", "Refund", "SeatAssignment", "PremiumSeat", "LieFlatSeat", "Meals", "WiFi", "Other"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.AdditionalClassification` (array)
  Currently unused. Only items enumerated in BrandClassificationENUM are currently supported. Any additional items sent are ignored and the lowest fares are returned regardless of associated brand attributes.
  Example: ["PremiumDrinks"]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.legSequence` (array)
  Leg sequence is not supported for ProductInclusionPreference. Preference will be applied to the whole journey.
  Example: [1,2]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.exactMatchInd` (boolean)
  Will not implement. The default behavior will be to provide an exact match to the product inclusion preferences.
  Example: true

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.bestMatchInd` (boolean)
  Will not implement. The default behavior will be to provide an exact match to the product inclusion preferences.
  Example: true

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.@type` (string)
  Discriminator classes ConnectionPreferences or ConnectionPreferencesAir. Must send “ConnectionPreferencesAir” when sending FlightType. If the @type value is not sent, FlightType is ignored for GDS; for NDC, a time out error is returned.

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.legSequence` (array)
  Applies preference to only specific leg/s of the itinerary referencing legSequence sent in SearchCriteriaFlight. Do not send for preference at itinerary level.
  Example: [1,2,4]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.maxConnectionDuration` (string)
  Limits results to itineraries that do not exceed a set length of time between flights on the same leg. Applies to all connections on the itinerary. Use the format PT{x}H, in which P is the duration designator, T is the time designator, and {x}H is the number of hours the connection should not exceed . For minutes use {x}H{x}M. GDS only, not supported for NDC.
  Example: "PT3H30M"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.maxOvernightDuration` (string)
  Limits results to itineraries that do not exceed a set length of time for any overnight connection. If the first flight in the connection arrives on one calendar date and the connecting flight arrives on another calendar date, this constitutes an overnight connection. Use the format PT{x}H, in which P is the duration designator, T is the time designator, and {x}H is the number of hours the connection should not exceed. For minutes use {x}H{x}M. GDS only, not supported for NDC.
  Example: "PT6H30M"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.preferenceType` (string, required)
  The type of connection preference. Only one preference type can be requested for an O&D pair.
  Enum: "Preferred", "Permitted", "Prohibited"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.ConnectionPoint` (array, required)
  IATA code for the connecting location/s for this preference. For example, if you specify three locations, any flights connecting in any one of those locations will be permitted/preferred/prohibited per the specified preferenceType.

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.cityOrAirport` (string)
  Optional enumeration specifying whether to restrict the search based on the city/airport code sent in From/value. Possible options and behavior are as follows. These behaviors are for availability selection only. Actual content may vary based on calculated price and diversity. Not all NDC carriers may support all options. Airport code with no cityOrAirport value expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. This behavior also applies to: city code with Airport Only, City code with City Only, City or airport code with City or Airport. Airport code with cityOrAirport value Airport Only returns content only from the specified airport. For example, LGA will return content from only LGA. Airport code with cityOrAirport value City expands the availability selection to the city without giving preference to the requested airport. This behavior is equivalent to searching with the airport's city code. For example, LGA would instead be treated as NYC and would return flights for LGA, EWR, and JFK with no preference.
  Enum: "Airport Only", "City or Airport", "City Only", "Use Default"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.FlightType` (object)
  The type of flight connection

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.FlightType.@type` (string, required)
  Discriminator. No child classes.
  Example: "FlightType"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.FlightType.connectionType` (string)
  Limits the connection type returned. Each value returns the specified type and all higher types. For example, StopDirect could return both flights that stop without a change of planes (StopDirect) and non-stop direct flights (NonStopDirect). SingleConnection or DoubleConnection will not exclude StopDirect flights from the journey. For example, SingleConnection could return an itinerary with two flight numbers, and either of these flights could have intermediate stops.
  Enum: "NonStopDirect", "StopDirect", "SingleConnection", "DoubleConnection", "TripleConnection"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.FlightType.excludeInterlineConnectionsInd` (boolean)
  Excludes interline connectionsClosed from results. If true, does not return offers with interline connections. If false or omitted, may return interline connections in results. Default is false. GDS only, not supported for NDC. When a product contains multiple interline air segments, brand details return only the brand of the significant carrier, not the validating/plating carrier brand information. The IATA rules for determining the significant carrier on an itinerary are based on the areas in which the transportation takes place.
  Example: true

- `CatalogProductOfferingsRequest.SearchModifiersAir.prohibitChangeOfAirportInd` (boolean)
  Suppresses return of offers that require a change of airport at connection. If true, excludes itineraries that require changing airports during connections. If false or omitted, may return itineraries that require change of airport. Default is false.
  Example: true

- `CatalogProductOfferingsRequest.PaymentCriteria` (object)
  Used to provide optional payment-card criteria in an Air Search request by sending the IssuerIdentifierNumber/BIN of the credit card to be used for payment. Sending the BIN returns OB fees in the response, which are ticketing and form of payment (FOP) fees, including credit card fees. Returned in an instance of Price/PriceBreakdown/Fees/Fee with a feeCode of OB.

- `CatalogProductOfferingsRequest.PaymentCriteria.@type` (string, required)
  discriminator
  Example: "PaymentCriteria"

- `CatalogProductOfferingsRequest.PaymentCriteria.IssuerIdentificationNumber` (string)
  6 to 11 digit number. The BIN/IIN of the credit card to be used for payment
  Example: "123456"

- `CatalogProductOfferingsRequest.PaymentCriteria.PaymentCardCode` (string)
  A two character code for a credit card
  Example: "VI"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber` (array)

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.value` (string)
  Example: "1259900123456"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.documentIssuer` (string)
  Document issuer
  Example: "BA"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.travelerIdentifierRef` (string)
  traveler identifier reference

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.name` (string)
  The name of the Traveler being referenced.

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.passengerTypeCode` (string)
  The passenger type code of the Traveler being referenced.
  Example: "ADT"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.id` (string)
  A locally referenced ID

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.description` (string)
  Descriptive text used to identify the contents of a target object

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.uris` (array)
  The URI used to GET the target object in another domain.

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass` (array)
  In Search API, for NDC flight pass bookings this is a required field and must reference the owner in PassengerCriteria. Only one permitted per Search request.

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.@type` (string, required)
  Discriminator. No child classes
  Example: "FlightPass"

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.accountNumber` (string, required)
  The flight pass account number
  Example: 140851633093

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.supplier` (string, required)
  The flight pass supplier code
  Example: "AC"

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.Description` (array)
  Example: ["FlightPass"]

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef` (array)
  In Search, use the passengerCriteriaRef to reference the owner of the flightpass. This is a mandatory field for Search API.

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.name` (string)
  Traveler identifier

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.passengerTypeCode` (string)
  Passenger Type code
  Example: "ADT"

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.ages` (array)
  The ages of the travelers associated to a particular ptc. For NDC, this value will be returned in PriceBreakdownAir if sent as part of the PassengerCriteria in the Air Search request.
  Example: [15]

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.passengerCriteriaRef` (string)
  Allows the user to associate passenger criteria information.
  Example: "passengerCriteria_1"

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.value` (string)

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.id` (string)
  A locally referenced ID

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.description` (string)
  Descriptive text used to identify the contents of a target object

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.uris` (array)
  Uniform Resource Identifier
  Example: ["google.com"]

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.age` (integer)
  Replaced with ages array. The age of the traveler.
  Example: 11

- `CatalogProductOfferingsRequest.PaymentCriteria.agencyAccountInd` (boolean)
  If true, payment will be made by agency account
  Example: true

- `CatalogProductOfferingsRequest.PaymentCriteria.bspInd` (boolean)
  If true, payment will be made by BSP
  Example: true

- `CatalogProductOfferingsRequest.PaymentCriteria.cashInd` (boolean)
  If true, payment will be made by cash
  Example: true

- `CatalogProductOfferingsRequest.PaymentCriteria.invoiceInd` (boolean)
  If true, payment will be made by invoice
  Example: true

- `CatalogProductOfferingsRequest.PricingModifiersAir` (object)
  A selection of Pricing Modifiers that can be used to influence the Price of an Offer. Discriminator classes PricingModifiersAir and PricingModifersAirDetail

- `CatalogProductOfferingsRequest.PricingModifiersAir.@type` (string, required)
  Discriminator. Child class PricingModifiersAirDetail.
  Example: "PricingModifiersAir"

- `CatalogProductOfferingsRequest.PricingModifiersAir.currencyCode` (string)
  In the Search API, send the currency type to return if you want to override the default currency specified with your PCC.
  Example: "GBP"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection` (object)
  May include FareSelectionDetail, RefundOptions, ChangeOptions objects.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.@type` (string, required)
  Discriminator. Child class FareSelectionDetail.
  Example: "FareSelection"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.fareType` (string)
  Defines the type of fares to return (Only public fares, Only private fares, Only agency private fares, Only
  Enum: "PublicFaresOnly", "PrivateFaresOnly", "AgencyPrivateFaresOnly", "AirlinePrivateFaresOnly", "PublicAndPrivateFares", "NetFaresOnly", "AllFares"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions` (object)
  Supports requesting only fares that meet certain refund criteria. GDS only; not supported for NDC. Search supports sending up to 12 refundability options. The following combinations are mutually exclusive; if sent, Search ignores them and returns a warning message: NonRefundable cannot also be sent with PartialRefund. Refundable cannot also be sent with ChangeOptions/changeTypes=PenaltyToChange

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.@type` (string, required)
  Discriminator. No child classes.
  Example: "RefundOptions"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.refundTypes` (array, required)
  Enum: "Refundable", "NonRefundable", "PartialRefund"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange` (object)
  Not currently supported. User can express a minimum and maximum Refund penalty range that will be included in the result set.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.@type` (string)
  Example: "RefundPenaltyRange"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Minimum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Minimum.@type` (string, required)
  Discriminator classes AmountPercentAmount or AmountPercentPercent
  Example: "AmountPercentAmount"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Minimum.application` (string)
  Type of commission
  Enum: "Full", "Partial", "Non-paying", "No-show", "Adjustment", "Commissionable"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Maximum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions` (object)
  Supports requesting only fares that meet certain change criteria. GDS only; not supported for NDC. Search supports sending up to 12 changeability options. ChangeOptions.changeTypes=PenaltyToChange cannot be sent with RefundOptions.Refundable. If sent, Search ignores them and returns a warning message

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.@type` (string)
  Discriminator. No child classes.
  Example: "ChangeOptions"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.changeTypes` (array, required)
  Enum: "Changeable", "NonChangeable", "PenaltyToChange"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange` (object)
  Not currently supported. User can express a minimum and maximum Change penalty range that will be included in the result set

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange.@type` (string)
  Example: "ChangePenaltyRange"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange.Minimum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange.Maximum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.FareQualiferString` (array)
  Request specific private leisure fares. Supported values vary by NDC carrier. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API in the guide section. This value is returned in FlightProduct.FareQualifierString if supplied by the airline. (Note the misspelling in request parameter)
  Example: ["Tour"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.FareQualifier` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.FareQualifier.value` (string)
  Deprecated - do not use. Replaced by FareQualiferString
  Enum: "Consolidator", "Government", "Marine", "Military", "Reward", "StandBy", "Staff", "Student", "Tour", "Youth", "VistFriendsAndRelatives"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation` (object)
  In search API sends account code/s to request negotiated fares. For NDC supports corporate loyalty program and GST Information. This information is returned in TermsAndConditions.OrganizationInformation.

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.@type` (string, required)
  Discriminator. No child classes
  Example: "OrganizationInformation"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.value` (string)
  The value of the code type.
  Example: "JBD123456"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.supplier` (string)
  The IATA code for the airline on which the code type is applicable.
  Example: "AA"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.organizationCodeType` (string)
  Sends a description for the OrganizationIdentifer value
  Enum: "Account", "OrganizationLoyaltyProgram", "Tour", "TicketDesignator"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.segmentSequenceList` (array)
  Returned in response when the code is applicable to a specified segment sequence
  Example: [1,2,3]

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.productRef` (array)
  Returned in response when the code is applicable to a specified product
  Example: ["product_1"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.accountCodeFaresOnlyInd` (boolean)
  Indicator to limit the fares returned to only fares filed for the specified account code. If true, returns only fares filed for the account code/s in OrganizationIdentifier/value. If sending multiple account codes, send with each instance of OrganizationIdentifier. If false or omitted, returns account fares and other fares. Default is false. If an account code is sent without accountCodeFaresOnlyInd=true, the response includes any fares filed for that account code plus fares that are not specific to the account code. If accountCodeFaresOnlyInd=true and no account code is sent, the indicator is ignored and the response returns all fares and a warning message that the request must include an account code. GDS only; not supported for NDC.
  Example: true

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber` (array)
  NDC only. Supported during book 'Add Offer' workflow.

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.value` (string, required)
  The GST registered number for the business.
  Example: "07AAGFF2194N1Z1"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.telephone` (string, required)
  Business telephone number
  Example: "222-222-222"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.address` (string, required)
  Business address
  Example: "1122 sample trail, CO, USA, 21232"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.country` (string, required)
  IATA country code of the business.
  Example: "IND"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.companyName` (string, required)
  Business name
  Example: "Adecco"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.email` (string, required)
  Business E-Mail
  Example: "sample@adecco.com"

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption` (object)
  GDS only, not supported for NDC. Marks as tax exempt either all taxes, only specific tax codes, or all taxes in specific countries. Send either allTaxesExemptInd OR countries and taxCodes per below. TaxExemption supports up to nine values for countries, for taxCodes, or for countries and taxCodes combined. The response returns any exempt taxes with exemptInd=true and a zero value.

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption.@type` (string)
  Discriminator. No child classes.
  Example: "TaxExemption"

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption.countries` (array)
  ISO country code. One or more two-letter alphanumeric codes for the countries in which the taxCodes sent are tax exempt.
  Example: ["GB","MX"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption.taxCodes` (array)
  One or more two-letter alphanumeric tax codes to mark as exempt.
  Example: ["US"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption.allTaxesExemptInd` (boolean)
  Marks all taxes as exempt. If true, marks all taxes in the response as exempt. Do not send if false; instead, use countries and taxCodes to specify which taxes to exempt.
  Example: true

- `CatalogProductOfferingsRequest.PricingModifiersAir.PromotionalCode` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.PromotionalCode.value` (string)
  The promotional code to apply
  Example: "CDFRT"

- `CatalogProductOfferingsRequest.PricingModifiersAir.PromotionalCode.supplierCode` (string, required)
  The IATA code for the airline on which the promotional code is applicable.
  Example: "AA"

- `CatalogProductOfferingsRequest.PricingModifiersAir.SellCity` (string)
  The IATA location code for the city. Overrides the sell city of the requester to specify an alternate sale location and return fares based on that location. GDS only, not supported for NDC.
  Example: "NYC"

- `CatalogProductOfferingsRequest.PricingModifiersAir.TicketCity` (string)
  The IATA location code for the city. Overrides the ticketing city of the requester to specify an alternate ticket location and return fares based on that location. GDS only, not supported for NDC.
  Example: "NYC"

- `CatalogProductOfferingsRequest.PricingModifiersAir.PricingPCC` (string)
  Use to send a faring PCC for which a selective access or code group agreement exists between that PCC and the PCC associated with your account. The following combinations of PricingPCC and FareSelection/fareType=PrivateFaresOnly return results as follows: PricingPCC sent and PrivateFaresOnly not requested: If a selective access or group agreement exists, both public and private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly not requested: If no selective access or group agreement exists, only public fares are returned. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists that allows private fare access, private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists but does not allow private fares access, or if no agreement exists, an error is returned. GDS only, not supported for NDC.
  Example: "0Bx3"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareBasisCodeOverride` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareBasisCodeOverride.value` (string)

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareBasisCodeOverride.specificFlightCriteriaRefs` (array)
  Reference the specificFlightCriteria you want to override. If blank, all segments will be overridden.
  Example: "s1, s2"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareBasisCodeOverride.unpricedFlightSegmentRefs` (array)
  Reference the unpricedFlightSegment you want to override. If blank, all segments will be overridden.
  Example: "up1, up2"

- `CatalogProductOfferingsRequest.PricingModifiersAir.MultiPricingAgency` (array)
  Return offers from multiple point of sale agencys.
  Example: ["[\"0XS4\",\"0YBZ\",\"J80K\"]"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.TicketingPCC` (string)
  In Search API, overrides the ticketing PCC associated with your account to specify an alternate PCC and return fares based on that PCC. GDS only, not supported for NDC.
  Example: "0XS4"

- `CatalogProductOfferingsRequest.PricingModifiersAir.CalculatedFareAdjustment` (object)
  Used in Exchange Search to modify the Price of the Fare. Discriminator classes CalculatedFareAdjustmentDiscount or CalculatedFareAdjustmentIncrease

- `CatalogProductOfferingsRequest.PricingModifiersAir.CalculatedFareAdjustment.@type` (string, required)
  Example: "CalculatedFareAdjustmentDiscount"

- `CatalogProductOfferingsRequest.PricingModifiersAir.ManualFareAdjustment` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.ManualFareAdjustment.@type` (string, required)
  Discriminator. Child classes ManualFareAdjustmentIncrease or ManualFareAdjustmentDiscount
  Example: "ManualFareAdjustmentIncrease"

- `CatalogProductOfferingsRequest.PricingModifiersAir.ManualFareAdjustment.passengerTypeCodes` (array)
  Send the PTC/s to be increased or discount. This increases or discounts the fare for all passengers with the PTC/s. If not sent, ManualFareAdjustment applies to all PTCs.
  Example: ["ADT","CHD"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.BrandPreference` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.BrandPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "BrandPreference"

- `CatalogProductOfferingsRequest.PricingModifiersAir.BrandPreference.brandTier` (integer)
  The brand tier you want to override
  Example: 1

- `CatalogProductOfferingsRequest.PricingModifiersAir.BrandPreference.legSequence` (array)
  Correlates with legSequence in SearchCriteriaFlight
  Example: [1,2]

- `CatalogProductOfferingsRequest.PricingModifiersAir.includeSplitPaymentInd` (boolean)
  Requests request split ticketing, which returns outbound and inbound one-way fares in addition to round trip options in the Search API response. This may result in lower fares than the same or similar round-trip itinerary. If true, requests split ticketing. If false or omitted split ticketing options are not returned. Default is false. GDS only, not supported for NDC. When split ticketing is requested, the Search response returns offers in the following order: Outbound one-way offers, Inbound one-way offers, Round trip offers. The response identifies all one-way outbound and inbound offers with CombinabilityCode j0. CombinabilityCode values for round trip offers start at j1 and increment by one for each offer. Only the following are in scope for split ticketing: Search (not supported for Next Leg Search or Flight Specific Search), Round-trip journey-based offerings ( isJourney header not sent or sent as true, or CustomResponseModifiersAir/SearchRepresentation not sent or sent with value Journey ) Upsells. Split ticketing is not supported for round-trip leg-based searches, virtual interlining, or NDC. Split ticketing is available only for customers specifically provisioned for split ticketing. Split ticketing returns one-way outbound and one-way inbound fares in addition to round-trip offers. Split ticket offers are identified with CombinabilityCode j0. If your account is not configured for split ticketing, sending includeSplitPaymentInd returns a response without split ticket offers and a warning message. GDS only, not supported for NDC. In Air Price, For split ticketing, the request must send offers that are identified in the Search response with CombinabilityCode j0, which identifies those offers as one-way outbound and one-way inbound split ticketing offers. A combination of j0 and any non-j0 value offer returns an error message that split pricing is not supported

- `CatalogProductOfferingsRequest.PricingModifiersAir.returnMostRestrictiveBrandInd` (boolean)
  In Search API, when there are different brands on a connecting flight, return information for either the most restrictive brand or the brand on the most significant segment on the itinerary. If true, return the offer brand of the most restrictive brand. If false or omitted, return the offer brand of the most significant segment of the itinerary. GDS only, not supported for NDC.

- `CatalogProductOfferingsRequest.PricingModifiersAir.splitPaymentOfferings` (number)
  Number between 0 and 99. Send with includeSplitPaymentInd to configure the percentage of round trip offers to return in a split ticketing response. By default, Search divides the split ticketing response into 34% round-trip offerings and the remainder as split ticketing offers, which are combined outbound and inbound one-way fares. To change this percentage, send SplitPaymentOfferings with the percentage value of round trip offers to return.
  Example: 25

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir` (object)
  Modifiers to customize the result set. Includes SearchRepresentation and optional indicators for returning or excluding selected response content. Values sent here can carry forward into the Next Leg Search request and are not re-sent.

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.@type` (string, required)
  discriminator
  Example: "CustomResponseModifiersAir"

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion` (array)
  Supported in Search and Price.

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion.@type` (string)
  Example: "BrandAttributeInclusion"

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion.Classification` (array)
  Send one or more of the following values to return information about only the specified attributes. Fares may include other attributes but information about them is not returned
  Enum: "CheckedBag", "CarryOn", "PersonalItem", "Rebooking", "Refund", "SeatAssignment", "PremiumSeat", "LieFlatSeat", "Meals", "WiFi", "Other"

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion.AdditionalClassification` (array)
  Send one or more of the following values to return information about only the specified additional attributes. Supported values ChauffeurTransfer, ExtraLegroom, InFlightEntertainment, LoungeAccess, PriorityBaggage, PriorityBoarding, PriorityCheckIn, PrioritySecurity, PriorityServices, MileageAccrual, Upgrades, USB.

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion.legSequence` (array)
  Leg sequence not supported for BrandAttributeInclusion.
  Example: [1,2]

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.SearchRepresentation` (string)
  Specifies either a journey or leg-based response. Journey returns offers for all legs of the itinerary. Journey is the default. Leg returns offers for only the first leg of the itinerary. Must be followed with a Next Leg Search to select an offer for the first leg and return offers on the subsequent leg to combine with it.Customize search result set as leg or journey based. Next Leg Search requests, and Flight Specific Search requests for less than the full itinerary, are supported only after a leg-based Search, not a journey-based Search. If these requests follow a journey-based Search request, an error message is returned.
  Enum: "Leg", "Journey", "LegWithJourneyData"

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.excludePenaltiesInd` (boolean)
  Indicator to omit change and cancel penalties. If true, omits all penalty information from the response. If false or omitted returns any change and penalty details provided by carrier for each offer in TermsAndConditionsFullAir/Penalties. Default is false. GDS only; not supported for NDC. excludePenaltiesInd can also be sent in the AirPrice request. If sent in Search but not in AirPrice, the value sent in Search is cached and applied to the AirPrice results. However, you can override the value sent in Search by sending excludePenaltiesInd in the AirPrice request with the opposite value. For example, if the Search request sends excludePenaltiesInd=true and the AirPrice request sends excludePenaltiesInd=false, the Search response does not return penalties and the AirPrice response does return penalties.If true, Penalties will be excluded from the response.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.excludeBaggageFeesInd` (boolean)
  Indicator to exclude baggage details. If true, excludes baggage fees, carry on fees, and embargo information from the response. Baggage quantity or weight is returned instead. If false or omitted, baggage details returned in response. Default is false. GDS only; not supported for NDC.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeFareCalculationInd` (boolean)
  Indicator to request the return of the fare calculation ladder. If true, returns the fare calculation ladder in BestCombinablePrice.PriceBreakdownAir.FareCalculation. If false or omitted, fare calculation ladder is not returned. Default is false. GDS only; not supported for NDC or in the Flight Specific Search full payload request.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.excludeSurchargesInd` (boolean)
  Indicator to exclude a surcharge breakdown. If true, excludes a surcharge breakdown from the response. Baggage quantity or kilos is returned instead. If false or omitted, surcharge breakdown returned in response. Default is false. GDS only; not supported for NDC.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.excludeUnbundledFaresInd` (boolean)
  Supported in Search and Price. Sets whether to return unbundled fares. If true, does not return unbundled fares. If false or omitted, returns unbundled and bundled fares as available. Default is false. GDS only, not supported for NDC.If true, unbundled fares will not be returned in the response
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeCO2EmissionsDataInd` (boolean)
  Indicator to return CO2 emission data in the Search and Next Leg Search responses. If true, returns CO2 emission data. If false or omitted CO2 emission data not returned. Default is false.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeFlightAmenitiesInd` (boolean)
  Indicator to return flight amenities from ATPCO RouteHappy data. If true, includes amenities in the response if available. If false or omitted, amenities are not returned in response. Default is false.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeUniversalProductAttributesInd` (boolean)
  Indicator to return universal product attributes (UPAs), which include images, icons, and URLs as provided by ATPCO. Must also send includeFlightAmenitiesInd=true. If true, returns universal product attributes if available. If false or omitted, Universal product attributes not returned. Default is false. UPAs are not returned for direct flights with intermediate stops, non-flight segments such as trains, or for Premium Business class.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeBundledAncillariesInd` (boolean)
  NDC only. If true, the search and price response will include bundled air and ancillary offerings/offers. Search and Price response will contain both ProductAir and ProductAncillary plus a new child class of PriceBreakdown: PriceBreakdownAncillaryAir to define the ancillary inclusion and pricing.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeFullPenaltyDisclosureInd` (boolean)
  If true, penalty information sourced from ATPCO Cat 31 and 33 will be disclosed. Penalties may be exposed at fare component level and include time windows.

- `CatalogProductOfferingsRequest.numberOfDownsellsToReturn` (integer)
  Not supported. Use BrandOptions.
  Example: 2

- `CatalogProductOfferingsRequest.SearchType` (string)
  List of search types.
  Enum: "MetaSearch", "ProductSearch", "OfferSearch"

- `CatalogProductOfferingsRequest.inhibitBrandContentInd` (boolean)
  Deprecated. Not supported as part of Air Search request.
  Example: true

- `CatalogProductOfferingsRequest.detailViewInd` (boolean)
  Deprecated. Not supported as part of Air Search request.
  Example: true

- `CatalogProductOfferingsRequest.excludeMixedBrandsInd` (boolean)
  Deprecated. Not supported as part of Air Search request.
  Example: true

## Response 200 fields (application/json):

- `CatalogProductOfferingsResponse` (object)
  Top level object for Search response. Includes CatalogProductOfferings, Result, and ReferenceList.

- `CatalogProductOfferingsResponse.CatalogProductOfferings` (object, required)
  CatalogProductOfferings is the top level object that groups all the offers in the response. Each instance of CatalogProductOffering is one offer.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.@type` (string, required)
  Discriminator. Child classes CatalogProductOfferingsID and CatalogProductOfferings
  Example: "CatalogProductOfferings"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.id` (string)
  Local identifier within a given message for this object.
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering` (array)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.@type` (string, required)
  Discriminator classes CatalogProductOfferingID or CatalogProductOffering
  Example: "CatalogProductOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.id` (string)
  The internal id for the offers in this instance: for GDS, o1, o2, and so on. NDC identifiers incorporate the carrier code into these types of IDs: QF_COPO0, SQb5, AAt5, etc. Search merges offers for offers for the same itinerary at the same price from GDS and NDC sources. A merged offer returns a CatalogProductOffering/id value that combines the standard GDS and NDC id numbers. For example, if a GDS offer that has id 03 is merged with an NDC offer that has id UA_CPO0, the merged id is 03-UA_CPO0. See Merged GDS and NDC Offers (Content Curation Layer) in the Air Shopping Guide for details.
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.CatalogProductOfferingRef` (string)
  Not used. Allows referencing another instance of this object in the same message
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.sequence` (integer)
  Indicates the order of this leg in the itinerary: 1 for the first leg, 2 for the second leg, 3 for the third leg of multi-city itineraries. (Search supports up to three legs.)
  Example: 1

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Departure` (string)
  IATA code for departure airport or city for this leg of the itinerary.
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Arrival` (string)
  IATA code for arrival airport or city for this leg of the itinerary.
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg` (array)
  FlextNextLeg is only returned for leg based search and identifies the O&D and/or date that the initial offering can be combined with.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.@type` (string, required)
  Example: "FlexNextLeg"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.Departure` (string)
  The departure location of the next leg option.
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.Arrival` (string)
  The arrival location of the next leg option.
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.DepartureDate` (string)
  Departure date of the next leg option.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand` (array)
  Lists reference numbers for brands returned. Only one instance of Brand is returned if no upsells are returned for that offer.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.@type` (string, required)
  Discriminator. Child classes BrandID, Brand. BrandCompleteInfo is no longer in use
  Example: "BrandID"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.id` (string)
  Local id within a given message to support referencing this object.
  Example: "brand_001"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.BrandRef` (string)
  Reference id that corresponds to the brand 'id' in ReferenceListBrand.Brand.
  Example: "brandRef_001"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions` (array, required)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.@type` (string)
  Example: "ProductBrandOptions"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.flightRefs` (array)
  Reference to the Flights that are used within ProductBrandOptions. Returned for GDS offerings. Not supported for NDC.
  Example: ["s1","s2","s3"]

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes` (object)
  Coming soon. Contains marketing information for Sponsored Flight Options.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.@type` (string, required)
  Discriminator. No child classes.
  Example: "SponsoredFlightAttributes"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.positionNumber` (integer)
  The display position number of the sponsored option

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.adID` (string)
  The advertisement ID

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.trackingID` (string)
  Unique tracking ID for sponsored flights campaign required in end to end workflow.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.sponsoredFlightInd` (boolean)
  If true, this option is a sponsored flight option.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering` (array, required)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.@type` (string, required)
  Discriminator. No child classes.
  Example: "ProductBrandOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Price` (object)
  Child class of Price. This includes all of the Price object plus the Pricebreakdown which gives detailed Price information per PTC or Hotel offering.
  For a Hotels Create Reservation (Full Payload) request, find the values to send in the Price objects from either Availability (returned in CatalogOffering/Price) or Rules (returned in Offer/Price). Although you can send the price returned in either API, the Rules pricing may be more accurate. If you sent a Rules request, send the value from that response. You must include CurrencyCode, Base, TotalTaxes, and TotalPrice. When returned from the previous steps, additionally send TermsAndConditionsFull, ProductRateCodeInfo, and RateCodeInfo.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Brand` (object, required)
  Brand ID parent class

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Product` (array, required)
  GDS Air Search returns one instance of Product. NDC may return multiple instances in the case of ancillary bundles.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.TermsAndConditions` (object)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.CombinabilityCode` (array)
  Code/s for the product/s on the other leg of the itinerary that can be combined with this product for the lowest available fare. See Combinable Codes and Best Combinable Price in the Air Search guide for details. For GDS only, a multi-city offer has jc in its CombinabilityCode, as in jc1, jc2. See multi-city offers with stopovers in the Air Search guides for details.
  Example: ["J1"]

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.BestCombinablePrice` (object)
  Price details for the full itinerary when this product is combined with any other product sharing a CombinabilityCode. For example, if p6 on the outbound and p24 on the inbound both have a CombinabilityCode value of j2, both products return the same BestCombinablePrice when combined for the itinerary. For a one-way itinerary, CombinabilityCode is returned for consistency but the value has no use and can be ignored. The pricing in BestCombinablePrice applies to the one-way itinerary. For NDC leg-based responses on carrier AA, the PriceBreakdown amount is approximate. Because AA returns only a journey-based response, Search must convert the response to a leg-based response. If the TotatlTaxes amount isn't divisible by the number of segments, the PriceBreakdown may not be accurate. However, accurate pricing will be returned in the AirPrice response.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Desirability` (number)
  The desirability of the offering expressed as a percentage. The higher the percentage the more desirable the offering.
  Example: 25

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.MatchedAttributes` (integer)
  If ProductInclusionPreference.Classification was sent in the request, this returns the number of those requested attributes that are available for this fare.
  Example: 7

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.BrandStatus` (string)
  alerts when a given brand is sold out of not offered for the journey
  Enum: "NotOffered", "SoldOut"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.ContentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.bestMatchInd` (boolean)
  If true, All brand attributes requested in ProductInclusionPreference.Classification are available for this fare.
  Example: true

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.CO2EmissionsData` (object)
  Contains the CO2 emissions data. Returned in Search and Next Leg Search responses when requested in CustomResponseModifiersAir. If CO2 data is not available for a flight or route, only available data is returned and these objects may be returned blank. CO2 data is not returned for non-flight segments (equipment codes BUS, HOV, LCH, LMO, TRN, TRS). Actual and Typical carbon emissions for the flight are returned as a measurement. Type of measurement for CO2 emissions is 'weight'. Unit of measure for CO2 emissions is 'kilograms'.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering` (array)
  Not currently in use.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.@type` (string, required)
  Discriminator classes UpsellOfferingID and UpsellOffering
  Example: "UpsellOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.id` (string)
  Local identifier within a given message for this object.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.CatalogProductOfferingRef` (string)
  Used to reference another instance of this object in the same message

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.productRefs` (array)
  An unsolicited Offering, offered in conjunction with specified product(s)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.sequence` (integer)
  NumberDoubleDigit
  Example: 1

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Departure` (string)
  Departure location
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Arrival` (string)
  Arrival location
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Brand` (array)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.ProductBrandOptions` (array, required)

- `CatalogProductOfferingsResponse.@type` (string)
  Example: "response"

- `CatalogProductOfferingsResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `CatalogProductOfferingsResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `CatalogProductOfferingsResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `CatalogProductOfferingsResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `CatalogProductOfferingsResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `CatalogProductOfferingsResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `CatalogProductOfferingsResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `CatalogProductOfferingsResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `CatalogProductOfferingsResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `CatalogProductOfferingsResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair` (array)

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `CatalogProductOfferingsResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogProductOfferingsResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `CatalogProductOfferingsResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `CatalogProductOfferingsResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `CatalogProductOfferingsResponse.Result.Warning.NameValuePair` (array)

- `CatalogProductOfferingsResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogProductOfferingsResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `CatalogProductOfferingsResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `CatalogProductOfferingsResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `CatalogProductOfferingsResponse.NextSteps.NextStep` (array, required)

- `CatalogProductOfferingsResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `CatalogProductOfferingsResponse.ReferenceList` (array)

- `CatalogProductOfferingsResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `CatalogProductOfferingsResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CatalogProductOfferingsResponse.CurrencyRateConversion` (array)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.@type` (string)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `CatalogProductOfferingsResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `CatalogProductOfferingsResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `CatalogProductOfferingsResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `CatalogProductOfferingsResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `CatalogProductOfferingsResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `CatalogProductOfferingsResponse.Pagination.totalItems` (integer, required)
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

# Search

The Search API returns offers for flights between specific origin and destination (O&D) pairs. You can set the Search request to return offers for the full itinerary (a journey-based search), or for only the first leg (a leg-based search) and follow it with a Next Leg Search. Any modifiers or indicators sent in the Search request carry over to the Next Leg Search request and are not re-sent.

Endpoint: POST /air/catalog/search/catalogproductofferings
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
  Discriminator class CatalogProductOfferingsQueryRequest only
  Example: "CatalogProductOfferingsQueryRequest"

- `CatalogProductOfferingsRequest` (object, required)
  Used for an Air Search request. Defines the request-wide search options for the initial shopping call, including content source, option to use the cache, passenger and flight search criteria, optional search and pricing refinement modifiers, and more.

- `CatalogProductOfferingsRequest.@type` (string, required)
  Discriminator classes CatalogProductOfferingsRequest and CatalogProductOfferingsRequestAir
  Example: "CatalogProductOfferingsRequestAir"

- `CatalogProductOfferingsRequest.SearchControlConsoleChannelID` (object)
  The Search API supports the Travelport Content Optimizer (formerly known as Search Control Console/SCC) for GDS content only. Send either the value or the sccType. If both values are sent, the sccType is applied. Travel agency administrators use Content Optimizer to create business rules for filtering certain air shopping results. If your client's application does not use Content Optimizer, do not use these attributes. Contact your Travelport representative if you would like additional information.

- `CatalogProductOfferingsRequest.SearchControlConsoleChannelID.value` (string)
  String for the Content Optimizer channel ID.
  Example: "IBM"

- `CatalogProductOfferingsRequest.SearchControlConsoleChannelID.sccType` (string)
  String for the Content Optimizer type.
  Example: "999"

- `CatalogProductOfferingsRequest.offersPerPage` (integer)
  Sets the maximum number of offers returned. If sent with 0 or not sent, Search returns all offers. If fewer offers than specified in offersPerPage are available, all offers are returned. For caching, sets whether to invoke caching so that journey-based search results can be referenced by subsequent reference payload requests. Send with any number equal to or greater than 1. No maximum value. If offersPerPage is not sent for a journey-based search, the results are not cached and the response does not return a transaction identifier. Does not affect leg-based search results, which are cached by default.Number of offers per page. If your workflow subsequently references a journey-based Closed search result, the Search request must send offersPerPage set to any positive number. This setting invokes caching to allow subsequent requests to refer to these search results. If a journey-based Search request does not send offersPerPage, any subsequent reference payload requests fail, including the Flight Specific Search, AirPrice, and Add Offer reference payloads.
  Example: 45

- `CatalogProductOfferingsRequest.contentSourceList` (array)
  Supports requesting both or either GDS or NDC content. If not sent only GDS content is returned. Send both values to return aggregated GDS and NDC content
  Enum: "GDS", "NDC", "LCC", "API"

- `CatalogProductOfferingsRequest.maxNumberOfUpsellsToReturn` (integer)
  Returns the specified number of upsell fares for each base fare, up to 4 for GDS, 99 for NDC, or as many filed by the airline if fewer than the value sent are available. Values greater than these supported values do not return an error message, but instead max out at the supported upsells per base fare. Upsells are not returned in a specific object but rather are presented along with the base fare as a higher level of service, usually a branded fare. This value carries over to any follow-on Next Leg Search request. Note the following differences for GDS and NDC: For GDS, when maxNumberOfUpsellsToReturn is either not sent or sent as 0, the lowest priced offer is returned. For NDC: When maxNumberOfUpsellsToReturn is not sent, the response returns the lowest priced offer of each available brand or cabin. When maxNumberOfUpsellsToReturn=0, the response returns the lowest priced offer. The number of upsells that can be requested are limited for multi-city itineraries: four to six O&Ds are limited to one upsell; three O&Ds are limited to two upsells; and one or two O&Ds (one-way or round-trip itineraries) can have up to four upsells for GSD or 99 for NDC.The maximum number of upsells to return
  Example: 3

- `CatalogProductOfferingsRequest.sortBy` (string)
  Sorts offers in order by the value in BestCombinablePrice/TotalPrice. Supported value: Price-LowToHigh: Sorts the offers returned from lowest to highest price. Supported for GDS, NDC, and combined GDS and NDC content. If sent, this sorting also applies to any following Next Leg Search. Upsell offers are not sorted. Travelport recommends as best practice that when sending sortBy and requesting NDC content, do not also send offersPerPage. If sent together some offers may be incomplete. Note the following when requesting NDC content: NDC-only content when multiple NDC carriers return offers: Without sorting: Search returns NDC offers consecutively by carrier; for example, all NDC AA offers, followed by all NDC UA offers. With sorting: Search returns all offers in ascending price order regardless of carrier. GDS and NDC combined content: Without sorting: Search returns offers by carrier. first for GDS and then for NDC; for example, GDS AA offers, NDC AA offers, GDS UA offers, NDC UA offers. With sorting: Search returns all offers in ascending price order regardless of carrier or content source.
  Enum: "Price-LowToHigh"

- `CatalogProductOfferingsRequest.PassengerCriteria` (array, required)
  Defines the type of passenger traveling. Send one instance of PassengerCriteria for each passenger type code (PTC). Search supports up to 9 total passengers. A maximum of 6 PTCs are supported for GDS. NDC does not have a PTC limitation. Can include optional traveler details such as age, birth date, loyalty, and geographic location when needed.

- `CatalogProductOfferingsRequest.PassengerCriteria.@type` (string, required)
  Discriminator. No child classes.
  Example: "PassengerCriteria"

- `CatalogProductOfferingsRequest.PassengerCriteria.number` (integer, required)
  The amount of passengers associated with this passenger type code
  Example: 1

- `CatalogProductOfferingsRequest.PassengerCriteria.age` (integer)
  The age of the passenger. Travelport recommends sending age only with PTCs that require age for pricing. For child passengers, Travelport recommends sending the age of the child in the age attribute plus the PTC CNN. Travelport recommends against sending CNN without age, or the CHD PTC. Many fares cannot be quoted for CHD. The age for CNN is generally between 2 and 11 inclusive, with ADT fares returned for ages 12 and up; however, this can vary by airline and country. The age for INF must be either 0 or 1. During booking, date of birth is required for all child and infant PTCs (Add Traveler payload in Traveler/birthDate).
  Example: 26

- `CatalogProductOfferingsRequest.PassengerCriteria.passengerTypeCode` (string)
  Required field for Air Search and Flight specific search. The passenger type code for the passengers on the itinerary. Common PTCs are: ADT: adult CHD: child of unknown age (see Notes on PTC and age below) CNN: child when age is known INF: infant without a seat INS: infant with a seat UNN: unaccompanied child. See API guides to download a full list of PTCs. NDC carriers BA, SQ, AV, AA, and AF/KLM offer teen/young adult tax exemptions from the UK Air Passenger Duty (GB tax). Send PTC with the value YTH and send the passengers age per below. The PTC may be returned as ADT, or Cxx in which xx is the age, but the tax exemption is applied in the pricing on these NDC carriers. When running a multiple passenger search for NDC on Qantas, Qantas supports only these PTCs: ADT, CHD, CNN, INF. Sending any other PTC may result in an error at ticketing.
  Example: "ADT"

- `CatalogProductOfferingsRequest.PassengerCriteria.birthDate` (string)
  The date of birth of the passenger. May be used in age validation for fares with age restrictions.
  Example: "2020-01-16"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty` (array)
  Optional object for sending customer loyalty information, such as for a frequent flyer program. If CustomerLoyalty is sent in the Search request, it must also be sent in the Air Price request and the Add Traveler request. Some carriers validate frequent traveler data through the workflow, failing to send the same CustomerLoyalty details, even if invalid, may cause a booking failure. If an invalid number is sent, the response returns a warning message that the FQTV is invalid, and the invalid number is cached to prevent a potential booking failure. In Search API CustomerLoyalty is only sent to NDC carriers. Ignored for GDS Search.

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.value` (string, required)
  Number on loyalty card.
  Example: "132456"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.id` (string)
  Optional Customer Loyalty Id. Not saved
  Example: "Loyalty_1"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.priority` (integer)
  Optional Numeric Priority Code
  Example: 2

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.programId` (string)
  "Specifies an identifier to indicate the company owner of the loyalty program. Typically two characters.
  For frequent guest number, the hotel supplier or brand code.
  For frequent flyer number, the air supplier code of the loyalty program."
  Example: "United"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.programName` (string)
  Supplier's loyalty program name.
  Example: "Frontier-EarlyReturns"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.supplierType` (string)
  The type of supplier of a loyalty program. Uses 'hotel' for frequent guest number or 'air' for frequent flyer number.
  Example: "Airline"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.supplier` (string, required)
  Supplier of a loyalty program (typically 2 characters representing the hotel, brand, or airline).
  Example: "UA"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.tier` (string)
  Customer Loyalty tier
  Example: "Silver"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.shareWithSupplier` (array)
  The list of suppliers that the CustomerLoyalty number is shared. Used for cross accrual.
  Example: ["LH"]

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.cardHolderName` (string)
  Customer loyalty member name; up to 128 characters are supported. In Air Search, for discounted offers to be returned, the name must be sent as LAST FIRST; e.g.,if SMITH is the last name and JORDAN the first name, send as SMITH JORDAN
  Example: "John Smith"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.validatedInd` (boolean)
  Customer loyalty number has been validated by the supplier
  Example: true

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.prefix` (string)
  The cardholder name prefix title like Mr, Mrs, Dr
  Example: "Dr"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.given` (string)
  The First Name of the Cardholder
  Example: "John"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.middle` (string)
  Middle Name of the Cardholder
  Example: "Wilkinson"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.surname` (string)
  Last Name of the Cardholder
  Example: "Smith"

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation` (object)
  Optional object for requesting local citizen/local resident fares for Spain and associated islands. You must also send a PTC relevant to the local resident fares; e.g., ADR for adult resident, CHR for child resident. Any discount applied through TravelerGeographicLocation applies to all travelers, not only to the traveler in this instance of PassengerCriteria. If the discount must apply only to an individual traveler, that traveler requires a separate search and book workflow.

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.value` (string)
  IATA code for the city, country, or state/province relevant to the local citizen//local resident fare.
  Example: "PMI"

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.travelerGeographicLocationType` (string)
  The geographic type of the location value
  Enum: "Country", "StateProvince", "City"

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.residentGeographicCode` (string)
  Resident code for Spanish residency fares for NDC. Any discount will apply to all travelers, not only to the traveler in this instance of PassengerCriteria. Supported/validated only for NDC to support local citizen fares.

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.generalLargeFamilyResidentDiscountInd` (boolean)
  Send only if true and request qualifies for general large family resident discount, defined as general large families (up to three children) from Spain, from the EU/EEA, or of any other nationality whose residency in Spain is recognized and who are in possession of a large-family certificate issued by the autonomous community in which they live. Supported/validated only for NDC to support local citizen fares.
  Example: true

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.specialLargeFamilyResidentDiscountInd` (boolean)
  Send only if true and request qualifies for special large family resident discount, defined as special large families (four or more children) from Spain, from the EU/EEA, or of any other nationality whose residency in Spain is recognized and who are in possession of a large-family certificate issued by the autonomous community in which they live. Supported/validated only for NDC to support local citizen fares.
  Example: true

- `CatalogProductOfferingsRequest.PassengerCriteria.specifiedPassengerTypeCodeOnlyInd` (boolean)
  If true, returns only offers for the specified PTC. If no offers for that PTC are available, an error message that offers were found is returned. GDS only; not supported for NDC. Default is false.
  Example: true

- `CatalogProductOfferingsRequest.SearchCriteriaFlight` (array, required)
  Each instance defines one leg of the itinerary by specifying an origin and destination (O&D) pair, aka departure and arrival location, for that leg. Optionally includes travel timing. Send one instance of SearchCriteriaFlight for each leg of the itinerary. You must specify all O&D pairs for all legs of the itinerary, even for a leg-based search. Search, Next Leg Search, and Flight Specific Search support a maximum of 6 O&D pairs for both GDS and NDC.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.departureDate` (string)
  Preferred local departure date in YYYY-MM-DD format. For GDS, send either departureDate or arrivalDate. If both departureDate and arrivalDate are sent, departureDate is ignored. For NDC, departureDate is required. For GDS content, departureDate is not required when sending arrivalDate.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.daysBeforeDeparture` (integer)
  Available for flex search only. Return flight options within a number of days from specified departure date. Maximum of 3 days can be selected.
  Example: 1

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.daysAfterDeparture` (integer)
  Available for flex search only. Return flight options within a number of days from specified departure date. Maximum of 3 days can be selected.
  Example: 2

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.departureTime` (string)
  Returns NDC offers with flights between two hours before and two hours after the departure time; for example, for departureTime of 10:00:00, Search returns available flights between 8:00 and 12:00. Do not use for GDS; instead, use DepartureTimeRange. For NDC content, if multiple time options are sent in the same instance of SearchCriteriaFlight, they are applied in the order DepartureTimeRange, departureTime, and arrivalTime.
  Example: "07:00:00"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.arrivalDate` (string)
  Date of arrival in YYYY-MM-DD format. For GDS, send either arrivalDate or departureDate. If both departureDate and arrivalDate are sent, departureDate is ignored. For NDC, arrivalDate is optional and departureDate is always required; if sent, offers returned are filtered by both arrivalDate and departureDate.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.arrivalTime` (string)
  Returns NDC offers with flights between two hours before and two hours after the arrival time; for example, for arrivalTime of 10:00:00, Search returns available flights between 8:00 and 12:00. Do not use for GDS; instead, use ArrivalTimeRange. Supported only by specific NDC carriers. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC Resources if you need login assistance).
  Example: "09:15:00"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.legSequence` (integer)
  Recommended to send when requesting cabin, class of service, and/or connection preferences at the leg level. See example in Air Search guide. Do not send if requesting preferences at itinerary level.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From` (object, required)
  Origin Destination Information

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From.value` (string)
  The IATA airport or city code for the departure or arrival airport/city for this leg.
  Example: "MEX"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From.cityOrAirport` (string)
  Optional enumeration specifying whether to restrict the search based on the city/airport code sent in From/value. Possible options and behavior are as follows. These behaviors are for availability selection only. Actual content may vary based on calculated price and diversity. Not all NDC carriers may support all options. Airport code with no cityOrAirport value expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. This behavior also applies to: city code with Airport Only, City code with City Only, City or airport code with City or Airport. Airport code with cityOrAirport value Airport Only returns content only from the specified airport. For example, LGA will return content from only LGA. Airport code with cityOrAirport value City expands the availability selection to the city without giving preference to the requested airport. This behavior is equivalent to searching with the airport's city code. For example, LGA would instead be treated as NYC and would return flights for LGA, EWR, and JFK with no preference.
  Enum: "Airport Only", "City or Airport", "City Only", "Use Default"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From.radius` (integer)
  Available for flex search only. Return offers from airports within a specified distance from the origin and/or destination.
  Example: 50

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From.radiusMeasurement` (string)
  For Hotels: Optional object to request either miles or kilometers for the search radius from the specified location. If unitOfDistance is not specified, the search defaults to miles for properties in the United States, Myanmar, and Liberia. The search defaults to kilometers in all other countries.
  Enum: "Miles", "Kilometers"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.To` (object, required)
  Origin Destination Information

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.AdditionalFrom` (array)
  Available for flex search only. Select additional origin cities to expand your flight options.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.AdditionalFrom.value` (string)
  The additional IATA airport or city codes for the departure or arrival airport/city for this leg.
  Example: "LGW"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.AdditionalFrom.cityOrAirport` (string)
  Optional enumeration specifying whether to restrict the search based on the city/airport code sent in From/value. Possible options and behavior are as follows. These behaviors are for availability selection only. Actual content may vary based on calculated price and diversity. Not all NDC carriers may support all options. Airport code with no cityOrAirport value expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. This behavior also applies to: city code with Airport Only, City code with City Only, City or airport code with City or Airport. Airport code with cityOrAirport value Airport Only returns content only from the specified airport. For example, LGA will return content from only LGA. Airport code with cityOrAirport value City expands the availability selection to the city without giving preference to the requested airport. This behavior is equivalent to searching with the airport's city code. For example, LGA would instead be treated as NYC and would return flights for LGA, EWR, and JFK with no preference.
  Enum: "Airport Only", "City or Airport", "City Only", "Use Default"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.AdditionalTo` (array)
  Available for flex search only. Select additional destination cities to expand your flight options.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.DepartureTimeRange` (object)
  In Air Search API supports searching by a departure or arrival time window for any leg of the itinerary. For NDC, supported only by specific NDC carriers. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC Resources if you need login assistance).

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.DepartureTimeRange.start` (string)
  The start time of the departure or arrival time window to search. Either start or end is required.
  Example: "06:15:00"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.DepartureTimeRange.end` (string)
  The end time of the departure or arrival time window to search. Either start or end is required.
  Example: "09:15:00"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.ArrivalTimeRange` (object)
  In Air Search API supports searching by a departure or arrival time window for any leg of the itinerary. For NDC, supported only by specific NDC carriers. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC Resources if you need login assistance).

- `CatalogProductOfferingsRequest.SearchModifiersAir` (object)
  Add one or more optional modifiers to filter search results by criteria related to the journey itself. All journey modifiers are in CatalogProductOfferingsQueryRequest/CatalogProductOfferingsRequest/SearchModifiersAir. Any modifiers sent in the initial Search request are applied to any subsequent Next Leg Search request. All modifiers apply to the entire itinerary, not at the leg level, unless otherwise specified with legSequence per below.

- `CatalogProductOfferingsRequest.SearchModifiersAir.@type` (string, required)
  discriminator
  Example: "SearchModifiersAir"

- `CatalogProductOfferingsRequest.SearchModifiersAir.excludeGround` (string)
  Excludes certain ground transportation from the response. By default, the response may return ground transportation options such as trains and buses, depending on the routing. In the response, ground transportation options are identified in ReferenceList/Flight by the TRN, TRS, or BUS equipment codes.GDS only, not supported for NDC.
  Enum: "Train", "All"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "CarrierPreference"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference.preferenceType` (string, required)
  The type of carrier preference
  Enum: "Preferred", "Permitted", "Prohibited"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference.carriers` (array, required)
  One or more carrier codes to permit, prohibit, or prefer. Preferred alliances are also supported; send the alliance code (e.g., /\*A) instead of the carrier code.
  Example: ["BA"]

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference.legSequence` (array)
  Applies the carrier/alliance preference to only specific legs of the itinerar referencing legSequence sent in SearchCriteriaFlight. Do not send if requesting preference at itinerary level. GDS only, not supported for NDC.
  Example: [1,2]

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "CabinPreference"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference.preferenceType` (string)
  Sending a mix of preferenceType values is not supported. For example, you cannot send an instance of CabinPreference with a preferenceType of Permitted and another instance with preferenceType of Prohibited. In this case the results default to the Preferred preference.
  Enum: "Preferred", "Permitted", "PreferredWithUpgrade", "Prohibited"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference.cabins` (array)
  A space-delimited list of cabins.
  Enum: "PremiumFirst", "First", "Business", "PremiumEconomy", "Economy"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference.legSequence` (array)
  Limits preference to the specified leg referenced in SearchCriteriaFlight. You can apply the preference to only some legs of the itinerary, or different preferences to different legs. To apply preference to the entire itinerary, do not send legSequence. GDS only, not supported for NDC. Not supported at Price or Book.
  Example: [1,2]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference.@type` (string)
  Discriminator. No child classes exist
  Example: "ClassOfServicePreference"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference.legSequence` (array)
  Applies preference to specified leg/s of the itinerary, referencing the leg sequence in SearchCriteriaFlight. Do not send if requesting preference at itinerary level.
  Example: [1,2]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference.ClassesOfService` (array, required)
  One or more classes of service to permit or prohibit.
  Example: ["F"]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference.PreferenceType` (string)
  Class of Service preference options.
  Enum: "Preferred", "Permitted", "Prohibited"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.@type` (string)
  Discriminator. No child classes exist
  Example: "ProductInclusionPreference"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.Classification` (array, required)
  Send one or more of the enumerated values to return only fares that include those attributes in the price. For example, sending CarryOn returns only fares that include a carry-on bag in the price.
  Enum: "CheckedBag", "CarryOn", "PersonalItem", "Rebooking", "Refund", "SeatAssignment", "PremiumSeat", "LieFlatSeat", "Meals", "WiFi", "Other"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.AdditionalClassification` (array)
  Currently unused. Only items enumerated in BrandClassificationENUM are currently supported. Any additional items sent are ignored and the lowest fares are returned regardless of associated brand attributes.
  Example: ["PremiumDrinks"]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.legSequence` (array)
  Leg sequence is not supported for ProductInclusionPreference. Preference will be applied to the whole journey.
  Example: [1,2]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.exactMatchInd` (boolean)
  Will not implement. The default behavior will be to provide an exact match to the product inclusion preferences.
  Example: true

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.bestMatchInd` (boolean)
  Will not implement. The default behavior will be to provide an exact match to the product inclusion preferences.
  Example: true

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.@type` (string)
  Discriminator classes ConnectionPreferences or ConnectionPreferencesAir. Must send “ConnectionPreferencesAir” when sending FlightType. If the @type value is not sent, FlightType is ignored for GDS; for NDC, a time out error is returned.

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.legSequence` (array)
  Applies preference to only specific leg/s of the itinerary referencing legSequence sent in SearchCriteriaFlight. Do not send for preference at itinerary level.
  Example: [1,2,4]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.maxConnectionDuration` (string)
  Limits results to itineraries that do not exceed a set length of time between flights on the same leg. Applies to all connections on the itinerary. Use the format PT{x}H, in which P is the duration designator, T is the time designator, and {x}H is the number of hours the connection should not exceed . For minutes use {x}H{x}M. GDS only, not supported for NDC.
  Example: "PT3H30M"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.maxOvernightDuration` (string)
  Limits results to itineraries that do not exceed a set length of time for any overnight connection. If the first flight in the connection arrives on one calendar date and the connecting flight arrives on another calendar date, this constitutes an overnight connection. Use the format PT{x}H, in which P is the duration designator, T is the time designator, and {x}H is the number of hours the connection should not exceed. For minutes use {x}H{x}M. GDS only, not supported for NDC.
  Example: "PT6H30M"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.preferenceType` (string, required)
  The type of connection preference. Only one preference type can be requested for an O&D pair.
  Enum: "Preferred", "Permitted", "Prohibited"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.ConnectionPoint` (array, required)
  IATA code for the connecting location/s for this preference. For example, if you specify three locations, any flights connecting in any one of those locations will be permitted/preferred/prohibited per the specified preferenceType.

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.cityOrAirport` (string)
  Optional enumeration specifying whether to restrict the search based on the city/airport code sent in From/value. Possible options and behavior are as follows. These behaviors are for availability selection only. Actual content may vary based on calculated price and diversity. Not all NDC carriers may support all options. Airport code with no cityOrAirport value expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. This behavior also applies to: city code with Airport Only, City code with City Only, City or airport code with City or Airport. Airport code with cityOrAirport value Airport Only returns content only from the specified airport. For example, LGA will return content from only LGA. Airport code with cityOrAirport value City expands the availability selection to the city without giving preference to the requested airport. This behavior is equivalent to searching with the airport's city code. For example, LGA would instead be treated as NYC and would return flights for LGA, EWR, and JFK with no preference.
  Enum: "Airport Only", "City or Airport", "City Only", "Use Default"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.FlightType` (object)
  The type of flight connection

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.FlightType.@type` (string, required)
  Discriminator. No child classes.
  Example: "FlightType"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.FlightType.connectionType` (string)
  Limits the connection type returned. Each value returns the specified type and all higher types. For example, StopDirect could return both flights that stop without a change of planes (StopDirect) and non-stop direct flights (NonStopDirect). SingleConnection or DoubleConnection will not exclude StopDirect flights from the journey. For example, SingleConnection could return an itinerary with two flight numbers, and either of these flights could have intermediate stops.
  Enum: "NonStopDirect", "StopDirect", "SingleConnection", "DoubleConnection", "TripleConnection"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.FlightType.excludeInterlineConnectionsInd` (boolean)
  Excludes interline connectionsClosed from results. If true, does not return offers with interline connections. If false or omitted, may return interline connections in results. Default is false. GDS only, not supported for NDC. When a product contains multiple interline air segments, brand details return only the brand of the significant carrier, not the validating/plating carrier brand information. The IATA rules for determining the significant carrier on an itinerary are based on the areas in which the transportation takes place.
  Example: true

- `CatalogProductOfferingsRequest.SearchModifiersAir.prohibitChangeOfAirportInd` (boolean)
  Suppresses return of offers that require a change of airport at connection. If true, excludes itineraries that require changing airports during connections. If false or omitted, may return itineraries that require change of airport. Default is false.
  Example: true

- `CatalogProductOfferingsRequest.PaymentCriteria` (object)
  Used to provide optional payment-card criteria in an Air Search request by sending the IssuerIdentifierNumber/BIN of the credit card to be used for payment. Sending the BIN returns OB fees in the response, which are ticketing and form of payment (FOP) fees, including credit card fees. Returned in an instance of Price/PriceBreakdown/Fees/Fee with a feeCode of OB.

- `CatalogProductOfferingsRequest.PaymentCriteria.@type` (string, required)
  discriminator
  Example: "PaymentCriteria"

- `CatalogProductOfferingsRequest.PaymentCriteria.IssuerIdentificationNumber` (string)
  6 to 11 digit number. The BIN/IIN of the credit card to be used for payment
  Example: "123456"

- `CatalogProductOfferingsRequest.PaymentCriteria.PaymentCardCode` (string)
  A two character code for a credit card
  Example: "VI"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber` (array)

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.value` (string)
  Example: "1259900123456"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.documentIssuer` (string)
  Document issuer
  Example: "BA"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.travelerIdentifierRef` (string)
  traveler identifier reference

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.name` (string)
  The name of the Traveler being referenced.

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.passengerTypeCode` (string)
  The passenger type code of the Traveler being referenced.
  Example: "ADT"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.id` (string)
  A locally referenced ID

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.description` (string)
  Descriptive text used to identify the contents of a target object

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.uris` (array)
  The URI used to GET the target object in another domain.

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass` (array)
  In Search API, for NDC flight pass bookings this is a required field and must reference the owner in PassengerCriteria. Only one permitted per Search request.

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.@type` (string, required)
  Discriminator. No child classes
  Example: "FlightPass"

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.accountNumber` (string, required)
  The flight pass account number
  Example: 140851633093

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.supplier` (string, required)
  The flight pass supplier code
  Example: "AC"

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.Description` (array)
  Example: ["FlightPass"]

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef` (array)
  In Search, use the passengerCriteriaRef to reference the owner of the flightpass. This is a mandatory field for Search API.

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.name` (string)
  Traveler identifier

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.passengerTypeCode` (string)
  Passenger Type code
  Example: "ADT"

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.ages` (array)
  The ages of the travelers associated to a particular ptc. For NDC, this value will be returned in PriceBreakdownAir if sent as part of the PassengerCriteria in the Air Search request.
  Example: [15]

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.passengerCriteriaRef` (string)
  Allows the user to associate passenger criteria information.
  Example: "passengerCriteria_1"

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.value` (string)

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.id` (string)
  A locally referenced ID

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.description` (string)
  Descriptive text used to identify the contents of a target object

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.uris` (array)
  Uniform Resource Identifier
  Example: ["google.com"]

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.age` (integer)
  Replaced with ages array. The age of the traveler.
  Example: 11

- `CatalogProductOfferingsRequest.PaymentCriteria.agencyAccountInd` (boolean)
  If true, payment will be made by agency account
  Example: true

- `CatalogProductOfferingsRequest.PaymentCriteria.bspInd` (boolean)
  If true, payment will be made by BSP
  Example: true

- `CatalogProductOfferingsRequest.PaymentCriteria.cashInd` (boolean)
  If true, payment will be made by cash
  Example: true

- `CatalogProductOfferingsRequest.PaymentCriteria.invoiceInd` (boolean)
  If true, payment will be made by invoice
  Example: true

- `CatalogProductOfferingsRequest.PricingModifiersAir` (object)
  A selection of Pricing Modifiers that can be used to influence the Price of an Offer. Discriminator classes PricingModifiersAir and PricingModifersAirDetail

- `CatalogProductOfferingsRequest.PricingModifiersAir.@type` (string, required)
  Discriminator. Child class PricingModifiersAirDetail.
  Example: "PricingModifiersAir"

- `CatalogProductOfferingsRequest.PricingModifiersAir.currencyCode` (string)
  In the Search API, send the currency type to return if you want to override the default currency specified with your PCC.
  Example: "GBP"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection` (object)
  May include FareSelectionDetail, RefundOptions, ChangeOptions objects.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.@type` (string, required)
  Discriminator. Child class FareSelectionDetail.
  Example: "FareSelection"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.fareType` (string)
  Defines the type of fares to return (Only public fares, Only private fares, Only agency private fares, Only
  Enum: "PublicFaresOnly", "PrivateFaresOnly", "AgencyPrivateFaresOnly", "AirlinePrivateFaresOnly", "PublicAndPrivateFares", "NetFaresOnly", "AllFares"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions` (object)
  Supports requesting only fares that meet certain refund criteria. GDS only; not supported for NDC. Search supports sending up to 12 refundability options. The following combinations are mutually exclusive; if sent, Search ignores them and returns a warning message: NonRefundable cannot also be sent with PartialRefund. Refundable cannot also be sent with ChangeOptions/changeTypes=PenaltyToChange

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.@type` (string, required)
  Discriminator. No child classes.
  Example: "RefundOptions"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.refundTypes` (array, required)
  Enum: "Refundable", "NonRefundable", "PartialRefund"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange` (object)
  Not currently supported. User can express a minimum and maximum Refund penalty range that will be included in the result set.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.@type` (string)
  Example: "RefundPenaltyRange"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Minimum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Minimum.@type` (string, required)
  Discriminator classes AmountPercentAmount or AmountPercentPercent
  Example: "AmountPercentAmount"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Minimum.application` (string)
  Type of commission
  Enum: "Full", "Partial", "Non-paying", "No-show", "Adjustment", "Commissionable"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Maximum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions` (object)
  Supports requesting only fares that meet certain change criteria. GDS only; not supported for NDC. Search supports sending up to 12 changeability options. ChangeOptions.changeTypes=PenaltyToChange cannot be sent with RefundOptions.Refundable. If sent, Search ignores them and returns a warning message

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.@type` (string)
  Discriminator. No child classes.
  Example: "ChangeOptions"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.changeTypes` (array, required)
  Enum: "Changeable", "NonChangeable", "PenaltyToChange"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange` (object)
  Not currently supported. User can express a minimum and maximum Change penalty range that will be included in the result set

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange.@type` (string)
  Example: "ChangePenaltyRange"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange.Minimum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange.Maximum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.FareQualiferString` (array)
  Request specific private leisure fares. Supported values vary by NDC carrier. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API in the guide section. This value is returned in FlightProduct.FareQualifierString if supplied by the airline. (Note the misspelling in request parameter)
  Example: ["Tour"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.FareQualifier` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.FareQualifier.value` (string)
  Deprecated - do not use. Replaced by FareQualiferString
  Enum: "Consolidator", "Government", "Marine", "Military", "Reward", "StandBy", "Staff", "Student", "Tour", "Youth", "VistFriendsAndRelatives"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation` (object)
  In search API sends account code/s to request negotiated fares. For NDC supports corporate loyalty program and GST Information. This information is returned in TermsAndConditions.OrganizationInformation.

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.@type` (string, required)
  Discriminator. No child classes
  Example: "OrganizationInformation"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.value` (string)
  The value of the code type.
  Example: "JBD123456"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.supplier` (string)
  The IATA code for the airline on which the code type is applicable.
  Example: "AA"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.organizationCodeType` (string)
  Sends a description for the OrganizationIdentifer value
  Enum: "Account", "OrganizationLoyaltyProgram", "Tour", "TicketDesignator"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.segmentSequenceList` (array)
  Returned in response when the code is applicable to a specified segment sequence
  Example: [1,2,3]

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.productRef` (array)
  Returned in response when the code is applicable to a specified product
  Example: ["product_1"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.accountCodeFaresOnlyInd` (boolean)
  Indicator to limit the fares returned to only fares filed for the specified account code. If true, returns only fares filed for the account code/s in OrganizationIdentifier/value. If sending multiple account codes, send with each instance of OrganizationIdentifier. If false or omitted, returns account fares and other fares. Default is false. If an account code is sent without accountCodeFaresOnlyInd=true, the response includes any fares filed for that account code plus fares that are not specific to the account code. If accountCodeFaresOnlyInd=true and no account code is sent, the indicator is ignored and the response returns all fares and a warning message that the request must include an account code. GDS only; not supported for NDC.
  Example: true

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber` (array)
  NDC only. Supported during book 'Add Offer' workflow.

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.value` (string, required)
  The GST registered number for the business.
  Example: "07AAGFF2194N1Z1"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.telephone` (string, required)
  Business telephone number
  Example: "222-222-222"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.address` (string, required)
  Business address
  Example: "1122 sample trail, CO, USA, 21232"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.country` (string, required)
  IATA country code of the business.
  Example: "IND"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.companyName` (string, required)
  Business name
  Example: "Adecco"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.email` (string, required)
  Business E-Mail
  Example: "sample@adecco.com"

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption` (object)
  GDS only, not supported for NDC. Marks as tax exempt either all taxes, only specific tax codes, or all taxes in specific countries. Send either allTaxesExemptInd OR countries and taxCodes per below. TaxExemption supports up to nine values for countries, for taxCodes, or for countries and taxCodes combined. The response returns any exempt taxes with exemptInd=true and a zero value.

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption.@type` (string)
  Discriminator. No child classes.
  Example: "TaxExemption"

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption.countries` (array)
  ISO country code. One or more two-letter alphanumeric codes for the countries in which the taxCodes sent are tax exempt.
  Example: ["GB","MX"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption.taxCodes` (array)
  One or more two-letter alphanumeric tax codes to mark as exempt.
  Example: ["US"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption.allTaxesExemptInd` (boolean)
  Marks all taxes as exempt. If true, marks all taxes in the response as exempt. Do not send if false; instead, use countries and taxCodes to specify which taxes to exempt.
  Example: true

- `CatalogProductOfferingsRequest.PricingModifiersAir.PromotionalCode` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.PromotionalCode.value` (string)
  The promotional code to apply
  Example: "CDFRT"

- `CatalogProductOfferingsRequest.PricingModifiersAir.PromotionalCode.supplierCode` (string, required)
  The IATA code for the airline on which the promotional code is applicable.
  Example: "AA"

- `CatalogProductOfferingsRequest.PricingModifiersAir.SellCity` (string)
  The IATA location code for the city. Overrides the sell city of the requester to specify an alternate sale location and return fares based on that location. GDS only, not supported for NDC.
  Example: "NYC"

- `CatalogProductOfferingsRequest.PricingModifiersAir.TicketCity` (string)
  The IATA location code for the city. Overrides the ticketing city of the requester to specify an alternate ticket location and return fares based on that location. GDS only, not supported for NDC.
  Example: "NYC"

- `CatalogProductOfferingsRequest.PricingModifiersAir.PricingPCC` (string)
  Use to send a faring PCC for which a selective access or code group agreement exists between that PCC and the PCC associated with your account. The following combinations of PricingPCC and FareSelection/fareType=PrivateFaresOnly return results as follows: PricingPCC sent and PrivateFaresOnly not requested: If a selective access or group agreement exists, both public and private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly not requested: If no selective access or group agreement exists, only public fares are returned. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists that allows private fare access, private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists but does not allow private fares access, or if no agreement exists, an error is returned. GDS only, not supported for NDC.
  Example: "0Bx3"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareBasisCodeOverride` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareBasisCodeOverride.value` (string)

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareBasisCodeOverride.specificFlightCriteriaRefs` (array)
  Reference the specificFlightCriteria you want to override. If blank, all segments will be overridden.
  Example: "s1, s2"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareBasisCodeOverride.unpricedFlightSegmentRefs` (array)
  Reference the unpricedFlightSegment you want to override. If blank, all segments will be overridden.
  Example: "up1, up2"

- `CatalogProductOfferingsRequest.PricingModifiersAir.MultiPricingAgency` (array)
  Return offers from multiple point of sale agencys.
  Example: ["[\"0XS4\",\"0YBZ\",\"J80K\"]"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.TicketingPCC` (string)
  In Search API, overrides the ticketing PCC associated with your account to specify an alternate PCC and return fares based on that PCC. GDS only, not supported for NDC.
  Example: "0XS4"

- `CatalogProductOfferingsRequest.PricingModifiersAir.CalculatedFareAdjustment` (object)
  Used in Exchange Search to modify the Price of the Fare. Discriminator classes CalculatedFareAdjustmentDiscount or CalculatedFareAdjustmentIncrease

- `CatalogProductOfferingsRequest.PricingModifiersAir.CalculatedFareAdjustment.@type` (string, required)
  Example: "CalculatedFareAdjustmentDiscount"

- `CatalogProductOfferingsRequest.PricingModifiersAir.ManualFareAdjustment` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.ManualFareAdjustment.@type` (string, required)
  Discriminator. Child classes ManualFareAdjustmentIncrease or ManualFareAdjustmentDiscount
  Example: "ManualFareAdjustmentIncrease"

- `CatalogProductOfferingsRequest.PricingModifiersAir.ManualFareAdjustment.passengerTypeCodes` (array)
  Send the PTC/s to be increased or discount. This increases or discounts the fare for all passengers with the PTC/s. If not sent, ManualFareAdjustment applies to all PTCs.
  Example: ["ADT","CHD"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.BrandPreference` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.BrandPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "BrandPreference"

- `CatalogProductOfferingsRequest.PricingModifiersAir.BrandPreference.brandTier` (integer)
  The brand tier you want to override
  Example: 1

- `CatalogProductOfferingsRequest.PricingModifiersAir.BrandPreference.legSequence` (array)
  Correlates with legSequence in SearchCriteriaFlight
  Example: [1,2]

- `CatalogProductOfferingsRequest.PricingModifiersAir.includeSplitPaymentInd` (boolean)
  Requests request split ticketing, which returns outbound and inbound one-way fares in addition to round trip options in the Search API response. This may result in lower fares than the same or similar round-trip itinerary. If true, requests split ticketing. If false or omitted split ticketing options are not returned. Default is false. GDS only, not supported for NDC. When split ticketing is requested, the Search response returns offers in the following order: Outbound one-way offers, Inbound one-way offers, Round trip offers. The response identifies all one-way outbound and inbound offers with CombinabilityCode j0. CombinabilityCode values for round trip offers start at j1 and increment by one for each offer. Only the following are in scope for split ticketing: Search (not supported for Next Leg Search or Flight Specific Search), Round-trip journey-based offerings ( isJourney header not sent or sent as true, or CustomResponseModifiersAir/SearchRepresentation not sent or sent with value Journey ) Upsells. Split ticketing is not supported for round-trip leg-based searches, virtual interlining, or NDC. Split ticketing is available only for customers specifically provisioned for split ticketing. Split ticketing returns one-way outbound and one-way inbound fares in addition to round-trip offers. Split ticket offers are identified with CombinabilityCode j0. If your account is not configured for split ticketing, sending includeSplitPaymentInd returns a response without split ticket offers and a warning message. GDS only, not supported for NDC. In Air Price, For split ticketing, the request must send offers that are identified in the Search response with CombinabilityCode j0, which identifies those offers as one-way outbound and one-way inbound split ticketing offers. A combination of j0 and any non-j0 value offer returns an error message that split pricing is not supported

- `CatalogProductOfferingsRequest.PricingModifiersAir.returnMostRestrictiveBrandInd` (boolean)
  In Search API, when there are different brands on a connecting flight, return information for either the most restrictive brand or the brand on the most significant segment on the itinerary. If true, return the offer brand of the most restrictive brand. If false or omitted, return the offer brand of the most significant segment of the itinerary. GDS only, not supported for NDC.

- `CatalogProductOfferingsRequest.PricingModifiersAir.splitPaymentOfferings` (number)
  Number between 0 and 99. Send with includeSplitPaymentInd to configure the percentage of round trip offers to return in a split ticketing response. By default, Search divides the split ticketing response into 34% round-trip offerings and the remainder as split ticketing offers, which are combined outbound and inbound one-way fares. To change this percentage, send SplitPaymentOfferings with the percentage value of round trip offers to return.
  Example: 25

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir` (object)
  Modifiers to customize the result set. Includes SearchRepresentation and optional indicators for returning or excluding selected response content. Values sent here can carry forward into the Next Leg Search request and are not re-sent.

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.@type` (string, required)
  discriminator
  Example: "CustomResponseModifiersAir"

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion` (array)
  Supported in Search and Price.

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion.@type` (string)
  Example: "BrandAttributeInclusion"

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion.Classification` (array)
  Send one or more of the following values to return information about only the specified attributes. Fares may include other attributes but information about them is not returned
  Enum: "CheckedBag", "CarryOn", "PersonalItem", "Rebooking", "Refund", "SeatAssignment", "PremiumSeat", "LieFlatSeat", "Meals", "WiFi", "Other"

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion.AdditionalClassification` (array)
  Send one or more of the following values to return information about only the specified additional attributes. Supported values ChauffeurTransfer, ExtraLegroom, InFlightEntertainment, LoungeAccess, PriorityBaggage, PriorityBoarding, PriorityCheckIn, PrioritySecurity, PriorityServices, MileageAccrual, Upgrades, USB.

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion.legSequence` (array)
  Leg sequence not supported for BrandAttributeInclusion.
  Example: [1,2]

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.SearchRepresentation` (string)
  Specifies either a journey or leg-based response. Journey returns offers for all legs of the itinerary. Journey is the default. Leg returns offers for only the first leg of the itinerary. Must be followed with a Next Leg Search to select an offer for the first leg and return offers on the subsequent leg to combine with it.Customize search result set as leg or journey based. Next Leg Search requests, and Flight Specific Search requests for less than the full itinerary, are supported only after a leg-based Search, not a journey-based Search. If these requests follow a journey-based Search request, an error message is returned.
  Enum: "Leg", "Journey", "LegWithJourneyData"

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.excludePenaltiesInd` (boolean)
  Indicator to omit change and cancel penalties. If true, omits all penalty information from the response. If false or omitted returns any change and penalty details provided by carrier for each offer in TermsAndConditionsFullAir/Penalties. Default is false. GDS only; not supported for NDC. excludePenaltiesInd can also be sent in the AirPrice request. If sent in Search but not in AirPrice, the value sent in Search is cached and applied to the AirPrice results. However, you can override the value sent in Search by sending excludePenaltiesInd in the AirPrice request with the opposite value. For example, if the Search request sends excludePenaltiesInd=true and the AirPrice request sends excludePenaltiesInd=false, the Search response does not return penalties and the AirPrice response does return penalties.If true, Penalties will be excluded from the response.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.excludeBaggageFeesInd` (boolean)
  Indicator to exclude baggage details. If true, excludes baggage fees, carry on fees, and embargo information from the response. Baggage quantity or weight is returned instead. If false or omitted, baggage details returned in response. Default is false. GDS only; not supported for NDC.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeFareCalculationInd` (boolean)
  Indicator to request the return of the fare calculation ladder. If true, returns the fare calculation ladder in BestCombinablePrice.PriceBreakdownAir.FareCalculation. If false or omitted, fare calculation ladder is not returned. Default is false. GDS only; not supported for NDC or in the Flight Specific Search full payload request.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.excludeSurchargesInd` (boolean)
  Indicator to exclude a surcharge breakdown. If true, excludes a surcharge breakdown from the response. Baggage quantity or kilos is returned instead. If false or omitted, surcharge breakdown returned in response. Default is false. GDS only; not supported for NDC.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.excludeUnbundledFaresInd` (boolean)
  Supported in Search and Price. Sets whether to return unbundled fares. If true, does not return unbundled fares. If false or omitted, returns unbundled and bundled fares as available. Default is false. GDS only, not supported for NDC.If true, unbundled fares will not be returned in the response
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeCO2EmissionsDataInd` (boolean)
  Indicator to return CO2 emission data in the Search and Next Leg Search responses. If true, returns CO2 emission data. If false or omitted CO2 emission data not returned. Default is false.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeFlightAmenitiesInd` (boolean)
  Indicator to return flight amenities from ATPCO RouteHappy data. If true, includes amenities in the response if available. If false or omitted, amenities are not returned in response. Default is false.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeUniversalProductAttributesInd` (boolean)
  Indicator to return universal product attributes (UPAs), which include images, icons, and URLs as provided by ATPCO. Must also send includeFlightAmenitiesInd=true. If true, returns universal product attributes if available. If false or omitted, Universal product attributes not returned. Default is false. UPAs are not returned for direct flights with intermediate stops, non-flight segments such as trains, or for Premium Business class.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeBundledAncillariesInd` (boolean)
  NDC only. If true, the search and price response will include bundled air and ancillary offerings/offers. Search and Price response will contain both ProductAir and ProductAncillary plus a new child class of PriceBreakdown: PriceBreakdownAncillaryAir to define the ancillary inclusion and pricing.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeFullPenaltyDisclosureInd` (boolean)
  If true, penalty information sourced from ATPCO Cat 31 and 33 will be disclosed. Penalties may be exposed at fare component level and include time windows.

- `CatalogProductOfferingsRequest.numberOfDownsellsToReturn` (integer)
  Not supported. Use BrandOptions.
  Example: 2

- `CatalogProductOfferingsRequest.SearchType` (string)
  List of search types.
  Enum: "MetaSearch", "ProductSearch", "OfferSearch"

- `CatalogProductOfferingsRequest.inhibitBrandContentInd` (boolean)
  Deprecated. Not supported as part of Air Search request.
  Example: true

- `CatalogProductOfferingsRequest.detailViewInd` (boolean)
  Deprecated. Not supported as part of Air Search request.
  Example: true

- `CatalogProductOfferingsRequest.excludeMixedBrandsInd` (boolean)
  Deprecated. Not supported as part of Air Search request.
  Example: true

## Response 200 fields (application/json):

- `CatalogProductOfferingsResponse` (object)
  Top level object for Search response. Includes CatalogProductOfferings, Result, and ReferenceList.

- `CatalogProductOfferingsResponse.CatalogProductOfferings` (object, required)
  CatalogProductOfferings is the top level object that groups all the offers in the response. Each instance of CatalogProductOffering is one offer.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.@type` (string, required)
  Discriminator. Child classes CatalogProductOfferingsID and CatalogProductOfferings
  Example: "CatalogProductOfferings"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.id` (string)
  Local identifier within a given message for this object.
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering` (array)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.@type` (string, required)
  Discriminator classes CatalogProductOfferingID or CatalogProductOffering
  Example: "CatalogProductOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.id` (string)
  The internal id for the offers in this instance: for GDS, o1, o2, and so on. NDC identifiers incorporate the carrier code into these types of IDs: QF_COPO0, SQb5, AAt5, etc. Search merges offers for offers for the same itinerary at the same price from GDS and NDC sources. A merged offer returns a CatalogProductOffering/id value that combines the standard GDS and NDC id numbers. For example, if a GDS offer that has id 03 is merged with an NDC offer that has id UA_CPO0, the merged id is 03-UA_CPO0. See Merged GDS and NDC Offers (Content Curation Layer) in the Air Shopping Guide for details.
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.CatalogProductOfferingRef` (string)
  Not used. Allows referencing another instance of this object in the same message
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.sequence` (integer)
  Indicates the order of this leg in the itinerary: 1 for the first leg, 2 for the second leg, 3 for the third leg of multi-city itineraries. (Search supports up to three legs.)
  Example: 1

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Departure` (string)
  IATA code for departure airport or city for this leg of the itinerary.
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Arrival` (string)
  IATA code for arrival airport or city for this leg of the itinerary.
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg` (array)
  FlextNextLeg is only returned for leg based search and identifies the O&D and/or date that the initial offering can be combined with.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.@type` (string, required)
  Example: "FlexNextLeg"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.Departure` (string)
  The departure location of the next leg option.
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.Arrival` (string)
  The arrival location of the next leg option.
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.DepartureDate` (string)
  Departure date of the next leg option.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand` (array)
  Lists reference numbers for brands returned. Only one instance of Brand is returned if no upsells are returned for that offer.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.@type` (string, required)
  Discriminator. Child classes BrandID, Brand. BrandCompleteInfo is no longer in use
  Example: "BrandID"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.id` (string)
  Local id within a given message to support referencing this object.
  Example: "brand_001"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.BrandRef` (string)
  Reference id that corresponds to the brand 'id' in ReferenceListBrand.Brand.
  Example: "brandRef_001"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions` (array, required)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.@type` (string)
  Example: "ProductBrandOptions"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.flightRefs` (array)
  Reference to the Flights that are used within ProductBrandOptions. Returned for GDS offerings. Not supported for NDC.
  Example: ["s1","s2","s3"]

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes` (object)
  Coming soon. Contains marketing information for Sponsored Flight Options.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.@type` (string, required)
  Discriminator. No child classes.
  Example: "SponsoredFlightAttributes"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.positionNumber` (integer)
  The display position number of the sponsored option

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.adID` (string)
  The advertisement ID

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.trackingID` (string)
  Unique tracking ID for sponsored flights campaign required in end to end workflow.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.sponsoredFlightInd` (boolean)
  If true, this option is a sponsored flight option.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering` (array, required)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.@type` (string, required)
  Discriminator. No child classes.
  Example: "ProductBrandOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Price` (object)
  Child class of Price. This includes all of the Price object plus the Pricebreakdown which gives detailed Price information per PTC or Hotel offering.
  For a Hotels Create Reservation (Full Payload) request, find the values to send in the Price objects from either Availability (returned in CatalogOffering/Price) or Rules (returned in Offer/Price). Although you can send the price returned in either API, the Rules pricing may be more accurate. If you sent a Rules request, send the value from that response. You must include CurrencyCode, Base, TotalTaxes, and TotalPrice. When returned from the previous steps, additionally send TermsAndConditionsFull, ProductRateCodeInfo, and RateCodeInfo.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Brand` (object, required)
  Brand ID parent class

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Product` (array, required)
  GDS Air Search returns one instance of Product. NDC may return multiple instances in the case of ancillary bundles.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.TermsAndConditions` (object)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.CombinabilityCode` (array)
  Code/s for the product/s on the other leg of the itinerary that can be combined with this product for the lowest available fare. See Combinable Codes and Best Combinable Price in the Air Search guide for details. For GDS only, a multi-city offer has jc in its CombinabilityCode, as in jc1, jc2. See multi-city offers with stopovers in the Air Search guides for details.
  Example: ["J1"]

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.BestCombinablePrice` (object)
  Price details for the full itinerary when this product is combined with any other product sharing a CombinabilityCode. For example, if p6 on the outbound and p24 on the inbound both have a CombinabilityCode value of j2, both products return the same BestCombinablePrice when combined for the itinerary. For a one-way itinerary, CombinabilityCode is returned for consistency but the value has no use and can be ignored. The pricing in BestCombinablePrice applies to the one-way itinerary. For NDC leg-based responses on carrier AA, the PriceBreakdown amount is approximate. Because AA returns only a journey-based response, Search must convert the response to a leg-based response. If the TotatlTaxes amount isn't divisible by the number of segments, the PriceBreakdown may not be accurate. However, accurate pricing will be returned in the AirPrice response.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Desirability` (number)
  The desirability of the offering expressed as a percentage. The higher the percentage the more desirable the offering.
  Example: 25

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.MatchedAttributes` (integer)
  If ProductInclusionPreference.Classification was sent in the request, this returns the number of those requested attributes that are available for this fare.
  Example: 7

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.BrandStatus` (string)
  alerts when a given brand is sold out of not offered for the journey
  Enum: "NotOffered", "SoldOut"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.ContentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.bestMatchInd` (boolean)
  If true, All brand attributes requested in ProductInclusionPreference.Classification are available for this fare.
  Example: true

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.CO2EmissionsData` (object)
  Contains the CO2 emissions data. Returned in Search and Next Leg Search responses when requested in CustomResponseModifiersAir. If CO2 data is not available for a flight or route, only available data is returned and these objects may be returned blank. CO2 data is not returned for non-flight segments (equipment codes BUS, HOV, LCH, LMO, TRN, TRS). Actual and Typical carbon emissions for the flight are returned as a measurement. Type of measurement for CO2 emissions is 'weight'. Unit of measure for CO2 emissions is 'kilograms'.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering` (array)
  Not currently in use.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.@type` (string, required)
  Discriminator classes UpsellOfferingID and UpsellOffering
  Example: "UpsellOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.id` (string)
  Local identifier within a given message for this object.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.CatalogProductOfferingRef` (string)
  Used to reference another instance of this object in the same message

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.productRefs` (array)
  An unsolicited Offering, offered in conjunction with specified product(s)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.sequence` (integer)
  NumberDoubleDigit
  Example: 1

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Departure` (string)
  Departure location
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Arrival` (string)
  Arrival location
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Brand` (array)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.ProductBrandOptions` (array, required)

- `CatalogProductOfferingsResponse.@type` (string)
  Example: "response"

- `CatalogProductOfferingsResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `CatalogProductOfferingsResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `CatalogProductOfferingsResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `CatalogProductOfferingsResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `CatalogProductOfferingsResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `CatalogProductOfferingsResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `CatalogProductOfferingsResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `CatalogProductOfferingsResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `CatalogProductOfferingsResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `CatalogProductOfferingsResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair` (array)

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `CatalogProductOfferingsResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogProductOfferingsResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `CatalogProductOfferingsResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `CatalogProductOfferingsResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `CatalogProductOfferingsResponse.Result.Warning.NameValuePair` (array)

- `CatalogProductOfferingsResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogProductOfferingsResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `CatalogProductOfferingsResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `CatalogProductOfferingsResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `CatalogProductOfferingsResponse.NextSteps.NextStep` (array, required)

- `CatalogProductOfferingsResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `CatalogProductOfferingsResponse.ReferenceList` (array)

- `CatalogProductOfferingsResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `CatalogProductOfferingsResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CatalogProductOfferingsResponse.CurrencyRateConversion` (array)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.@type` (string)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `CatalogProductOfferingsResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `CatalogProductOfferingsResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `CatalogProductOfferingsResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `CatalogProductOfferingsResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `CatalogProductOfferingsResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `CatalogProductOfferingsResponse.Pagination.totalItems` (integer, required)
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

# Next Leg Search

The Next Leg Search API returns offers for the next leg of an itinerary after a leg-based round-trip Search. The leg-based Search response returns offers for the outbound leg of the itinerary, and Next Leg Search is then required to return offers for the next leg of the trip. For a multi-city itinerary, send an additional Next Leg Search request for each remaining leg. GDS supports searching for up to six O&D pairs (legs of the itinerary) while NDC supports three O&D pairs. Next Leg Search is supported only after a leg-based Search. If sent after a journey-based Search, an error message is returned. Any modifiers or indicators sent in the Search request carry over to the Next Leg Search request and are not re-sent. The Next Leg Search response uses the same structure and returns the same objects as the Search response. The only differences are, the first instance of CatalogProductOffering is the offer and product sent in the Next Leg Search request. This is the selected offer and product for the first leg. Subsequent instances of CatalogProductOffering are offers for the second leg.

Endpoint: POST /air/catalog/search/catalogproductofferings/buildnext
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
  Discriminator. No child classes
  Example: "CatalogProductOfferingsQueryBuildNext"

- `BuildFromCatalogProductOfferingsRequest` (object, required)
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

- `BrandOptions` (string)
  Send with the value returnAllBrands to return all brands in a fare family regardless of the brand of the anchoring flight chosen from the initial Search response. GDS only; not supported for NDC. Not supported in the Flight Specific Search full payload request.
  Enum: "keepToBrand", "returnAllBrands"

## Response 200 fields (application/json):

- `CatalogProductOfferingsResponse` (object)
  Top level object for Search response. Includes CatalogProductOfferings, Result, and ReferenceList.

- `CatalogProductOfferingsResponse.CatalogProductOfferings` (object, required)
  CatalogProductOfferings is the top level object that groups all the offers in the response. Each instance of CatalogProductOffering is one offer.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.@type` (string, required)
  Discriminator. Child classes CatalogProductOfferingsID and CatalogProductOfferings
  Example: "CatalogProductOfferings"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.id` (string)
  Local identifier within a given message for this object.
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering` (array)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.@type` (string, required)
  Discriminator classes CatalogProductOfferingID or CatalogProductOffering
  Example: "CatalogProductOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.id` (string)
  The internal id for the offers in this instance: for GDS, o1, o2, and so on. NDC identifiers incorporate the carrier code into these types of IDs: QF_COPO0, SQb5, AAt5, etc. Search merges offers for offers for the same itinerary at the same price from GDS and NDC sources. A merged offer returns a CatalogProductOffering/id value that combines the standard GDS and NDC id numbers. For example, if a GDS offer that has id 03 is merged with an NDC offer that has id UA_CPO0, the merged id is 03-UA_CPO0. See Merged GDS and NDC Offers (Content Curation Layer) in the Air Shopping Guide for details.
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.CatalogProductOfferingRef` (string)
  Not used. Allows referencing another instance of this object in the same message
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.sequence` (integer)
  Indicates the order of this leg in the itinerary: 1 for the first leg, 2 for the second leg, 3 for the third leg of multi-city itineraries. (Search supports up to three legs.)
  Example: 1

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Departure` (string)
  IATA code for departure airport or city for this leg of the itinerary.
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Arrival` (string)
  IATA code for arrival airport or city for this leg of the itinerary.
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg` (array)
  FlextNextLeg is only returned for leg based search and identifies the O&D and/or date that the initial offering can be combined with.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.@type` (string, required)
  Example: "FlexNextLeg"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.Departure` (string)
  The departure location of the next leg option.
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.Arrival` (string)
  The arrival location of the next leg option.
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.DepartureDate` (string)
  Departure date of the next leg option.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand` (array)
  Lists reference numbers for brands returned. Only one instance of Brand is returned if no upsells are returned for that offer.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.@type` (string, required)
  Discriminator. Child classes BrandID, Brand. BrandCompleteInfo is no longer in use
  Example: "BrandID"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.id` (string)
  Local id within a given message to support referencing this object.
  Example: "brand_001"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.BrandRef` (string)
  Reference id that corresponds to the brand 'id' in ReferenceListBrand.Brand.
  Example: "brandRef_001"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions` (array, required)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.@type` (string)
  Example: "ProductBrandOptions"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.flightRefs` (array)
  Reference to the Flights that are used within ProductBrandOptions. Returned for GDS offerings. Not supported for NDC.
  Example: ["s1","s2","s3"]

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes` (object)
  Coming soon. Contains marketing information for Sponsored Flight Options.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.@type` (string, required)
  Discriminator. No child classes.
  Example: "SponsoredFlightAttributes"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.positionNumber` (integer)
  The display position number of the sponsored option

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.adID` (string)
  The advertisement ID

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.trackingID` (string)
  Unique tracking ID for sponsored flights campaign required in end to end workflow.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.sponsoredFlightInd` (boolean)
  If true, this option is a sponsored flight option.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering` (array, required)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.@type` (string, required)
  Discriminator. No child classes.
  Example: "ProductBrandOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Price` (object)
  Child class of Price. This includes all of the Price object plus the Pricebreakdown which gives detailed Price information per PTC or Hotel offering.
  For a Hotels Create Reservation (Full Payload) request, find the values to send in the Price objects from either Availability (returned in CatalogOffering/Price) or Rules (returned in Offer/Price). Although you can send the price returned in either API, the Rules pricing may be more accurate. If you sent a Rules request, send the value from that response. You must include CurrencyCode, Base, TotalTaxes, and TotalPrice. When returned from the previous steps, additionally send TermsAndConditionsFull, ProductRateCodeInfo, and RateCodeInfo.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Brand` (object, required)
  Brand ID parent class

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Product` (array, required)
  GDS Air Search returns one instance of Product. NDC may return multiple instances in the case of ancillary bundles.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.TermsAndConditions` (object)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.CombinabilityCode` (array)
  Code/s for the product/s on the other leg of the itinerary that can be combined with this product for the lowest available fare. See Combinable Codes and Best Combinable Price in the Air Search guide for details. For GDS only, a multi-city offer has jc in its CombinabilityCode, as in jc1, jc2. See multi-city offers with stopovers in the Air Search guides for details.
  Example: ["J1"]

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.BestCombinablePrice` (object)
  Price details for the full itinerary when this product is combined with any other product sharing a CombinabilityCode. For example, if p6 on the outbound and p24 on the inbound both have a CombinabilityCode value of j2, both products return the same BestCombinablePrice when combined for the itinerary. For a one-way itinerary, CombinabilityCode is returned for consistency but the value has no use and can be ignored. The pricing in BestCombinablePrice applies to the one-way itinerary. For NDC leg-based responses on carrier AA, the PriceBreakdown amount is approximate. Because AA returns only a journey-based response, Search must convert the response to a leg-based response. If the TotatlTaxes amount isn't divisible by the number of segments, the PriceBreakdown may not be accurate. However, accurate pricing will be returned in the AirPrice response.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Desirability` (number)
  The desirability of the offering expressed as a percentage. The higher the percentage the more desirable the offering.
  Example: 25

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.MatchedAttributes` (integer)
  If ProductInclusionPreference.Classification was sent in the request, this returns the number of those requested attributes that are available for this fare.
  Example: 7

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.BrandStatus` (string)
  alerts when a given brand is sold out of not offered for the journey
  Enum: "NotOffered", "SoldOut"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.ContentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.bestMatchInd` (boolean)
  If true, All brand attributes requested in ProductInclusionPreference.Classification are available for this fare.
  Example: true

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.CO2EmissionsData` (object)
  Contains the CO2 emissions data. Returned in Search and Next Leg Search responses when requested in CustomResponseModifiersAir. If CO2 data is not available for a flight or route, only available data is returned and these objects may be returned blank. CO2 data is not returned for non-flight segments (equipment codes BUS, HOV, LCH, LMO, TRN, TRS). Actual and Typical carbon emissions for the flight are returned as a measurement. Type of measurement for CO2 emissions is 'weight'. Unit of measure for CO2 emissions is 'kilograms'.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering` (array)
  Not currently in use.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.@type` (string, required)
  Discriminator classes UpsellOfferingID and UpsellOffering
  Example: "UpsellOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.id` (string)
  Local identifier within a given message for this object.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.CatalogProductOfferingRef` (string)
  Used to reference another instance of this object in the same message

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.productRefs` (array)
  An unsolicited Offering, offered in conjunction with specified product(s)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.sequence` (integer)
  NumberDoubleDigit
  Example: 1

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Departure` (string)
  Departure location
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Arrival` (string)
  Arrival location
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Brand` (array)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.ProductBrandOptions` (array, required)

- `CatalogProductOfferingsResponse.@type` (string)
  Example: "response"

- `CatalogProductOfferingsResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `CatalogProductOfferingsResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `CatalogProductOfferingsResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `CatalogProductOfferingsResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `CatalogProductOfferingsResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `CatalogProductOfferingsResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `CatalogProductOfferingsResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `CatalogProductOfferingsResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `CatalogProductOfferingsResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `CatalogProductOfferingsResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair` (array)

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `CatalogProductOfferingsResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogProductOfferingsResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `CatalogProductOfferingsResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `CatalogProductOfferingsResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `CatalogProductOfferingsResponse.Result.Warning.NameValuePair` (array)

- `CatalogProductOfferingsResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogProductOfferingsResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `CatalogProductOfferingsResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `CatalogProductOfferingsResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `CatalogProductOfferingsResponse.NextSteps.NextStep` (array, required)

- `CatalogProductOfferingsResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `CatalogProductOfferingsResponse.ReferenceList` (array)

- `CatalogProductOfferingsResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `CatalogProductOfferingsResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CatalogProductOfferingsResponse.CurrencyRateConversion` (array)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.@type` (string)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `CatalogProductOfferingsResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `CatalogProductOfferingsResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `CatalogProductOfferingsResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `CatalogProductOfferingsResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `CatalogProductOfferingsResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `CatalogProductOfferingsResponse.Pagination.totalItems` (integer, required)
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

# Flight Specific Search

The Flight Specific Search API Reference Payload request returns additional upsells, up to 99, for any product/s returned by Search or Next Leg Search. The reference payload sends an identifier referencing a previous response and the offer and product identifiers. The full payload request does not reference a previous Search response. GDS only, not supported for NDC. Any CabinPreference in the initial Search request is applied to any subsequent Next Leg Search and reference Flight Specific Search requests. To use the Flight Specific Search reference payload request, your initial Search request must send offersPerPage to invoke caching if that Search was journey-based (leg-based search results are always cached). The Flight Specific Search response uses the same structure and returns the same objects as the Search response. The differences are, One instance of CatalogProductOffering (id o1) is returned for each offer sent in the request. One instance of ReferenceListProduct/Product is returned for each product sent in the request.

Endpoint: POST /air/catalog/search/catalogproductofferings/buildoptions
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
  Discriminator. No child classes
  Example: "CatalogProductOfferingsQueryBuildOptions"

- `BuildOptions` (object, required)
  Used for a Flight Specific Search request. Selects the specific flights and the maximum number of upsells to return.

- `BuildOptions.@type` (string, required)
  Discriminator. Child classes BuildOptionsFromCatalogProductOptions (reference payload flight specific search) or BuildOptionsFromProducts (full payload flight specific search)
  Example: "BuildOptionsFromCatalogProductOptions"

- `BuildOptions.maxNumberOfUpsellsToReturn` (integer)
  Number of upsells to return. Valid values are 0 to 99 inclusive. If the carrier has filed fewer upsells, all filed upsells are returned.
  Example: 2

- `BuildOptions.PaymentCriteria` (object)
  Used to provide optional payment-card criteria in an Air Search request by sending the IssuerIdentifierNumber/BIN of the credit card to be used for payment. Sending the BIN returns OB fees in the response, which are ticketing and form of payment (FOP) fees, including credit card fees. Returned in an instance of Price/PriceBreakdown/Fees/Fee with a feeCode of OB.

- `BuildOptions.PaymentCriteria.@type` (string, required)
  discriminator
  Example: "PaymentCriteria"

- `BuildOptions.PaymentCriteria.IssuerIdentificationNumber` (string)
  6 to 11 digit number. The BIN/IIN of the credit card to be used for payment
  Example: "123456"

- `BuildOptions.PaymentCriteria.PaymentCardCode` (string)
  A two character code for a credit card
  Example: "VI"

- `BuildOptions.PaymentCriteria.DocumentNumber` (array)

- `BuildOptions.PaymentCriteria.DocumentNumber.value` (string)
  Example: "1259900123456"

- `BuildOptions.PaymentCriteria.DocumentNumber.documentIssuer` (string)
  Document issuer
  Example: "BA"

- `BuildOptions.PaymentCriteria.DocumentNumber.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `BuildOptions.PaymentCriteria.DocumentNumber.travelerIdentifierRef` (string)
  traveler identifier reference

- `BuildOptions.PaymentCriteria.DocumentNumber.name` (string)
  The name of the Traveler being referenced.

- `BuildOptions.PaymentCriteria.DocumentNumber.passengerTypeCode` (string)
  The passenger type code of the Traveler being referenced.
  Example: "ADT"

- `BuildOptions.PaymentCriteria.DocumentNumber.id` (string)
  A locally referenced ID

- `BuildOptions.PaymentCriteria.DocumentNumber.description` (string)
  Descriptive text used to identify the contents of a target object

- `BuildOptions.PaymentCriteria.DocumentNumber.uris` (array)
  The URI used to GET the target object in another domain.

- `BuildOptions.PaymentCriteria.FlightPass` (array)
  In Search API, for NDC flight pass bookings this is a required field and must reference the owner in PassengerCriteria. Only one permitted per Search request.

- `BuildOptions.PaymentCriteria.FlightPass.@type` (string, required)
  Discriminator. No child classes
  Example: "FlightPass"

- `BuildOptions.PaymentCriteria.FlightPass.accountNumber` (string, required)
  The flight pass account number
  Example: 140851633093

- `BuildOptions.PaymentCriteria.FlightPass.supplier` (string, required)
  The flight pass supplier code
  Example: "AC"

- `BuildOptions.PaymentCriteria.FlightPass.Description` (array)
  Example: ["FlightPass"]

- `BuildOptions.PaymentCriteria.FlightPass.TravelerIdentifierRef` (array)
  In Search, use the passengerCriteriaRef to reference the owner of the flightpass. This is a mandatory field for Search API.

- `BuildOptions.PaymentCriteria.FlightPass.TravelerIdentifierRef.name` (string)
  Traveler identifier

- `BuildOptions.PaymentCriteria.FlightPass.TravelerIdentifierRef.passengerTypeCode` (string)
  Passenger Type code
  Example: "ADT"

- `BuildOptions.PaymentCriteria.FlightPass.TravelerIdentifierRef.ages` (array)
  The ages of the travelers associated to a particular ptc. For NDC, this value will be returned in PriceBreakdownAir if sent as part of the PassengerCriteria in the Air Search request.
  Example: [15]

- `BuildOptions.PaymentCriteria.FlightPass.TravelerIdentifierRef.passengerCriteriaRef` (string)
  Allows the user to associate passenger criteria information.
  Example: "passengerCriteria_1"

- `BuildOptions.PaymentCriteria.FlightPass.TravelerIdentifierRef.value` (string)

- `BuildOptions.PaymentCriteria.FlightPass.TravelerIdentifierRef.id` (string)
  A locally referenced ID

- `BuildOptions.PaymentCriteria.FlightPass.TravelerIdentifierRef.description` (string)
  Descriptive text used to identify the contents of a target object

- `BuildOptions.PaymentCriteria.FlightPass.TravelerIdentifierRef.uris` (array)
  Uniform Resource Identifier
  Example: ["google.com"]

- `BuildOptions.PaymentCriteria.FlightPass.TravelerIdentifierRef.age` (integer)
  Replaced with ages array. The age of the traveler.
  Example: 11

- `BuildOptions.PaymentCriteria.agencyAccountInd` (boolean)
  If true, payment will be made by agency account
  Example: true

- `BuildOptions.PaymentCriteria.bspInd` (boolean)
  If true, payment will be made by BSP
  Example: true

- `BuildOptions.PaymentCriteria.cashInd` (boolean)
  If true, payment will be made by cash
  Example: true

- `BuildOptions.PaymentCriteria.invoiceInd` (boolean)
  If true, payment will be made by invoice
  Example: true

- `BuildOptions.FareRuleType` (string)
  Returns fare rules in the offer response. Use not recommended; request fare rules using the fare rule endpoints. Structured rules limit the rules returned to one or more of these categories: advance reservation/ticketing requirements, minimum/maximum stay, stopovers, penalties, voluntary exchanges and refunds. GDS supports all categories; NDC supports only penalties. See the Fare Rules Guide for details. Note that even if fare rules are not requested, for GDS only, change and cancel penalties are returned unless suppressed by sending CustomResponseModifiersAir/excludePenaltiesInd (see below) set to true. Not supported in BuildOptions (FlightSpecificSearch).
  Enum: "Structured", "ShortText", "LongText"

- `BuildOptions.BrandOptions` (string)
  Send with the value returnAllBrands to return all brands in a fare family regardless of the brand of the anchoring flight chosen from the initial Search response. GDS only; not supported for NDC. Not supported in the Flight Specific Search full payload request.
  Enum: "keepToBrand", "returnAllBrands"

- `BuildOptions.CustomResponseModifiersAir` (object)
  Modifiers to customize the result set. Includes SearchRepresentation and optional indicators for returning or excluding selected response content. Values sent here can carry forward into the Next Leg Search request and are not re-sent.

- `BuildOptions.CustomResponseModifiersAir.@type` (string, required)
  discriminator
  Example: "CustomResponseModifiersAir"

- `BuildOptions.CustomResponseModifiersAir.BrandAttributeInclusion` (array)
  Supported in Search and Price.

- `BuildOptions.CustomResponseModifiersAir.BrandAttributeInclusion.@type` (string)
  Example: "BrandAttributeInclusion"

- `BuildOptions.CustomResponseModifiersAir.BrandAttributeInclusion.Classification` (array)
  Send one or more of the following values to return information about only the specified attributes. Fares may include other attributes but information about them is not returned
  Enum: "CheckedBag", "CarryOn", "PersonalItem", "Rebooking", "Refund", "SeatAssignment", "PremiumSeat", "LieFlatSeat", "Meals", "WiFi", "Other"

- `BuildOptions.CustomResponseModifiersAir.BrandAttributeInclusion.AdditionalClassification` (array)
  Send one or more of the following values to return information about only the specified additional attributes. Supported values ChauffeurTransfer, ExtraLegroom, InFlightEntertainment, LoungeAccess, PriorityBaggage, PriorityBoarding, PriorityCheckIn, PrioritySecurity, PriorityServices, MileageAccrual, Upgrades, USB.

- `BuildOptions.CustomResponseModifiersAir.BrandAttributeInclusion.legSequence` (array)
  Leg sequence not supported for BrandAttributeInclusion.
  Example: [1,2]

- `BuildOptions.CustomResponseModifiersAir.SearchRepresentation` (string)
  Specifies either a journey or leg-based response. Journey returns offers for all legs of the itinerary. Journey is the default. Leg returns offers for only the first leg of the itinerary. Must be followed with a Next Leg Search to select an offer for the first leg and return offers on the subsequent leg to combine with it.Customize search result set as leg or journey based. Next Leg Search requests, and Flight Specific Search requests for less than the full itinerary, are supported only after a leg-based Search, not a journey-based Search. If these requests follow a journey-based Search request, an error message is returned.
  Enum: "Leg", "Journey", "LegWithJourneyData"

- `BuildOptions.CustomResponseModifiersAir.excludePenaltiesInd` (boolean)
  Indicator to omit change and cancel penalties. If true, omits all penalty information from the response. If false or omitted returns any change and penalty details provided by carrier for each offer in TermsAndConditionsFullAir/Penalties. Default is false. GDS only; not supported for NDC. excludePenaltiesInd can also be sent in the AirPrice request. If sent in Search but not in AirPrice, the value sent in Search is cached and applied to the AirPrice results. However, you can override the value sent in Search by sending excludePenaltiesInd in the AirPrice request with the opposite value. For example, if the Search request sends excludePenaltiesInd=true and the AirPrice request sends excludePenaltiesInd=false, the Search response does not return penalties and the AirPrice response does return penalties.If true, Penalties will be excluded from the response.
  Example: true

- `BuildOptions.CustomResponseModifiersAir.excludeBaggageFeesInd` (boolean)
  Indicator to exclude baggage details. If true, excludes baggage fees, carry on fees, and embargo information from the response. Baggage quantity or weight is returned instead. If false or omitted, baggage details returned in response. Default is false. GDS only; not supported for NDC.
  Example: true

- `BuildOptions.CustomResponseModifiersAir.includeFareCalculationInd` (boolean)
  Indicator to request the return of the fare calculation ladder. If true, returns the fare calculation ladder in BestCombinablePrice.PriceBreakdownAir.FareCalculation. If false or omitted, fare calculation ladder is not returned. Default is false. GDS only; not supported for NDC or in the Flight Specific Search full payload request.
  Example: true

- `BuildOptions.CustomResponseModifiersAir.excludeSurchargesInd` (boolean)
  Indicator to exclude a surcharge breakdown. If true, excludes a surcharge breakdown from the response. Baggage quantity or kilos is returned instead. If false or omitted, surcharge breakdown returned in response. Default is false. GDS only; not supported for NDC.
  Example: true

- `BuildOptions.CustomResponseModifiersAir.excludeUnbundledFaresInd` (boolean)
  Supported in Search and Price. Sets whether to return unbundled fares. If true, does not return unbundled fares. If false or omitted, returns unbundled and bundled fares as available. Default is false. GDS only, not supported for NDC.If true, unbundled fares will not be returned in the response
  Example: true

- `BuildOptions.CustomResponseModifiersAir.includeCO2EmissionsDataInd` (boolean)
  Indicator to return CO2 emission data in the Search and Next Leg Search responses. If true, returns CO2 emission data. If false or omitted CO2 emission data not returned. Default is false.
  Example: true

- `BuildOptions.CustomResponseModifiersAir.includeFlightAmenitiesInd` (boolean)
  Indicator to return flight amenities from ATPCO RouteHappy data. If true, includes amenities in the response if available. If false or omitted, amenities are not returned in response. Default is false.
  Example: true

- `BuildOptions.CustomResponseModifiersAir.includeUniversalProductAttributesInd` (boolean)
  Indicator to return universal product attributes (UPAs), which include images, icons, and URLs as provided by ATPCO. Must also send includeFlightAmenitiesInd=true. If true, returns universal product attributes if available. If false or omitted, Universal product attributes not returned. Default is false. UPAs are not returned for direct flights with intermediate stops, non-flight segments such as trains, or for Premium Business class.
  Example: true

- `BuildOptions.CustomResponseModifiersAir.includeBundledAncillariesInd` (boolean)
  NDC only. If true, the search and price response will include bundled air and ancillary offerings/offers. Search and Price response will contain both ProductAir and ProductAncillary plus a new child class of PriceBreakdown: PriceBreakdownAncillaryAir to define the ancillary inclusion and pricing.
  Example: true

- `BuildOptions.CustomResponseModifiersAir.includeFullPenaltyDisclosureInd` (boolean)
  If true, penalty information sourced from ATPCO Cat 31 and 33 will be disclosed. Penalties may be exposed at fare component level and include time windows.

- `BuildOptions.FareRuleCategory` (array)
  Not supported for flight specific search
  Enum: "AdvanceReservationsTicketing", "MinimumStay", "MaximumStay", "Stopovers", "Penalties", "Eligibility", "DayTime", "Seasonality", "FlightApplication", "Transfers", "Combinations", "BlackoutDates", "Surcharges", "AccompaniedTravel", "TravelRestrictions", "SalesRestrictions", "HIPMileageExeptions", "TicketEndorsements", "ChildrenDiscounts", "TourConductorDiscounts", "AgentDiscounts", "AllOtherDiscounts", "MiscellaneousProvisions", "FareByRule", "Groups", "Tours", "VisitAnotherCountry", "Deposits", "VoluntaryChanges", "VoluntaryRefunds", "NegotiatedFares", "ApplicationAndOtherConditions"

- `BuildOptions.returnBrandedFaresInd` (boolean)
  Not supported in flight specific search

## Response 200 fields (application/json):

- `CatalogProductOfferingsResponse` (object)
  Top level object for Search response. Includes CatalogProductOfferings, Result, and ReferenceList.

- `CatalogProductOfferingsResponse.CatalogProductOfferings` (object, required)
  CatalogProductOfferings is the top level object that groups all the offers in the response. Each instance of CatalogProductOffering is one offer.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.@type` (string, required)
  Discriminator. Child classes CatalogProductOfferingsID and CatalogProductOfferings
  Example: "CatalogProductOfferings"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.id` (string)
  Local identifier within a given message for this object.
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering` (array)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.@type` (string, required)
  Discriminator classes CatalogProductOfferingID or CatalogProductOffering
  Example: "CatalogProductOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.id` (string)
  The internal id for the offers in this instance: for GDS, o1, o2, and so on. NDC identifiers incorporate the carrier code into these types of IDs: QF_COPO0, SQb5, AAt5, etc. Search merges offers for offers for the same itinerary at the same price from GDS and NDC sources. A merged offer returns a CatalogProductOffering/id value that combines the standard GDS and NDC id numbers. For example, if a GDS offer that has id 03 is merged with an NDC offer that has id UA_CPO0, the merged id is 03-UA_CPO0. See Merged GDS and NDC Offers (Content Curation Layer) in the Air Shopping Guide for details.
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.CatalogProductOfferingRef` (string)
  Not used. Allows referencing another instance of this object in the same message
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.sequence` (integer)
  Indicates the order of this leg in the itinerary: 1 for the first leg, 2 for the second leg, 3 for the third leg of multi-city itineraries. (Search supports up to three legs.)
  Example: 1

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Departure` (string)
  IATA code for departure airport or city for this leg of the itinerary.
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Arrival` (string)
  IATA code for arrival airport or city for this leg of the itinerary.
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg` (array)
  FlextNextLeg is only returned for leg based search and identifies the O&D and/or date that the initial offering can be combined with.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.@type` (string, required)
  Example: "FlexNextLeg"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.Departure` (string)
  The departure location of the next leg option.
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.Arrival` (string)
  The arrival location of the next leg option.
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.DepartureDate` (string)
  Departure date of the next leg option.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand` (array)
  Lists reference numbers for brands returned. Only one instance of Brand is returned if no upsells are returned for that offer.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.@type` (string, required)
  Discriminator. Child classes BrandID, Brand. BrandCompleteInfo is no longer in use
  Example: "BrandID"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.id` (string)
  Local id within a given message to support referencing this object.
  Example: "brand_001"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.BrandRef` (string)
  Reference id that corresponds to the brand 'id' in ReferenceListBrand.Brand.
  Example: "brandRef_001"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions` (array, required)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.@type` (string)
  Example: "ProductBrandOptions"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.flightRefs` (array)
  Reference to the Flights that are used within ProductBrandOptions. Returned for GDS offerings. Not supported for NDC.
  Example: ["s1","s2","s3"]

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes` (object)
  Coming soon. Contains marketing information for Sponsored Flight Options.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.@type` (string, required)
  Discriminator. No child classes.
  Example: "SponsoredFlightAttributes"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.positionNumber` (integer)
  The display position number of the sponsored option

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.adID` (string)
  The advertisement ID

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.trackingID` (string)
  Unique tracking ID for sponsored flights campaign required in end to end workflow.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.sponsoredFlightInd` (boolean)
  If true, this option is a sponsored flight option.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering` (array, required)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.@type` (string, required)
  Discriminator. No child classes.
  Example: "ProductBrandOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Price` (object)
  Child class of Price. This includes all of the Price object plus the Pricebreakdown which gives detailed Price information per PTC or Hotel offering.
  For a Hotels Create Reservation (Full Payload) request, find the values to send in the Price objects from either Availability (returned in CatalogOffering/Price) or Rules (returned in Offer/Price). Although you can send the price returned in either API, the Rules pricing may be more accurate. If you sent a Rules request, send the value from that response. You must include CurrencyCode, Base, TotalTaxes, and TotalPrice. When returned from the previous steps, additionally send TermsAndConditionsFull, ProductRateCodeInfo, and RateCodeInfo.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Brand` (object, required)
  Brand ID parent class

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Product` (array, required)
  GDS Air Search returns one instance of Product. NDC may return multiple instances in the case of ancillary bundles.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.TermsAndConditions` (object)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.CombinabilityCode` (array)
  Code/s for the product/s on the other leg of the itinerary that can be combined with this product for the lowest available fare. See Combinable Codes and Best Combinable Price in the Air Search guide for details. For GDS only, a multi-city offer has jc in its CombinabilityCode, as in jc1, jc2. See multi-city offers with stopovers in the Air Search guides for details.
  Example: ["J1"]

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.BestCombinablePrice` (object)
  Price details for the full itinerary when this product is combined with any other product sharing a CombinabilityCode. For example, if p6 on the outbound and p24 on the inbound both have a CombinabilityCode value of j2, both products return the same BestCombinablePrice when combined for the itinerary. For a one-way itinerary, CombinabilityCode is returned for consistency but the value has no use and can be ignored. The pricing in BestCombinablePrice applies to the one-way itinerary. For NDC leg-based responses on carrier AA, the PriceBreakdown amount is approximate. Because AA returns only a journey-based response, Search must convert the response to a leg-based response. If the TotatlTaxes amount isn't divisible by the number of segments, the PriceBreakdown may not be accurate. However, accurate pricing will be returned in the AirPrice response.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Desirability` (number)
  The desirability of the offering expressed as a percentage. The higher the percentage the more desirable the offering.
  Example: 25

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.MatchedAttributes` (integer)
  If ProductInclusionPreference.Classification was sent in the request, this returns the number of those requested attributes that are available for this fare.
  Example: 7

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.BrandStatus` (string)
  alerts when a given brand is sold out of not offered for the journey
  Enum: "NotOffered", "SoldOut"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.ContentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.bestMatchInd` (boolean)
  If true, All brand attributes requested in ProductInclusionPreference.Classification are available for this fare.
  Example: true

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.CO2EmissionsData` (object)
  Contains the CO2 emissions data. Returned in Search and Next Leg Search responses when requested in CustomResponseModifiersAir. If CO2 data is not available for a flight or route, only available data is returned and these objects may be returned blank. CO2 data is not returned for non-flight segments (equipment codes BUS, HOV, LCH, LMO, TRN, TRS). Actual and Typical carbon emissions for the flight are returned as a measurement. Type of measurement for CO2 emissions is 'weight'. Unit of measure for CO2 emissions is 'kilograms'.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering` (array)
  Not currently in use.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.@type` (string, required)
  Discriminator classes UpsellOfferingID and UpsellOffering
  Example: "UpsellOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.id` (string)
  Local identifier within a given message for this object.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.CatalogProductOfferingRef` (string)
  Used to reference another instance of this object in the same message

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.productRefs` (array)
  An unsolicited Offering, offered in conjunction with specified product(s)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.sequence` (integer)
  NumberDoubleDigit
  Example: 1

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Departure` (string)
  Departure location
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Arrival` (string)
  Arrival location
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Brand` (array)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.ProductBrandOptions` (array, required)

- `CatalogProductOfferingsResponse.@type` (string)
  Example: "response"

- `CatalogProductOfferingsResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `CatalogProductOfferingsResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `CatalogProductOfferingsResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `CatalogProductOfferingsResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `CatalogProductOfferingsResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `CatalogProductOfferingsResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `CatalogProductOfferingsResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `CatalogProductOfferingsResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `CatalogProductOfferingsResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `CatalogProductOfferingsResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair` (array)

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `CatalogProductOfferingsResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogProductOfferingsResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `CatalogProductOfferingsResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `CatalogProductOfferingsResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `CatalogProductOfferingsResponse.Result.Warning.NameValuePair` (array)

- `CatalogProductOfferingsResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogProductOfferingsResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `CatalogProductOfferingsResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `CatalogProductOfferingsResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `CatalogProductOfferingsResponse.NextSteps.NextStep` (array, required)

- `CatalogProductOfferingsResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `CatalogProductOfferingsResponse.ReferenceList` (array)

- `CatalogProductOfferingsResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `CatalogProductOfferingsResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CatalogProductOfferingsResponse.CurrencyRateConversion` (array)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.@type` (string)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `CatalogProductOfferingsResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `CatalogProductOfferingsResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `CatalogProductOfferingsResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `CatalogProductOfferingsResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `CatalogProductOfferingsResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `CatalogProductOfferingsResponse.Pagination.totalItems` (integer, required)
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

# Premium flex search

The Premium Flex Search API is the first step in the travel booking workflow. Send a Search request to return offers for flights between the selected cities

Endpoint: POST /air/catalog/search/catalogproductofferings/premiumflex
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
  Discriminator class CatalogProductOfferingsQueryRequest only
  Example: "CatalogProductOfferingsQueryRequest"

- `CatalogProductOfferingsRequest` (object, required)
  Used for an Air Search request. Defines the request-wide search options for the initial shopping call, including content source, option to use the cache, passenger and flight search criteria, optional search and pricing refinement modifiers, and more.

- `CatalogProductOfferingsRequest.@type` (string, required)
  Discriminator classes CatalogProductOfferingsRequest and CatalogProductOfferingsRequestAir
  Example: "CatalogProductOfferingsRequestAir"

- `CatalogProductOfferingsRequest.SearchControlConsoleChannelID` (object)
  The Search API supports the Travelport Content Optimizer (formerly known as Search Control Console/SCC) for GDS content only. Send either the value or the sccType. If both values are sent, the sccType is applied. Travel agency administrators use Content Optimizer to create business rules for filtering certain air shopping results. If your client's application does not use Content Optimizer, do not use these attributes. Contact your Travelport representative if you would like additional information.

- `CatalogProductOfferingsRequest.SearchControlConsoleChannelID.value` (string)
  String for the Content Optimizer channel ID.
  Example: "IBM"

- `CatalogProductOfferingsRequest.SearchControlConsoleChannelID.sccType` (string)
  String for the Content Optimizer type.
  Example: "999"

- `CatalogProductOfferingsRequest.offersPerPage` (integer)
  Sets the maximum number of offers returned. If sent with 0 or not sent, Search returns all offers. If fewer offers than specified in offersPerPage are available, all offers are returned. For caching, sets whether to invoke caching so that journey-based search results can be referenced by subsequent reference payload requests. Send with any number equal to or greater than 1. No maximum value. If offersPerPage is not sent for a journey-based search, the results are not cached and the response does not return a transaction identifier. Does not affect leg-based search results, which are cached by default.Number of offers per page. If your workflow subsequently references a journey-based Closed search result, the Search request must send offersPerPage set to any positive number. This setting invokes caching to allow subsequent requests to refer to these search results. If a journey-based Search request does not send offersPerPage, any subsequent reference payload requests fail, including the Flight Specific Search, AirPrice, and Add Offer reference payloads.
  Example: 45

- `CatalogProductOfferingsRequest.contentSourceList` (array)
  Supports requesting both or either GDS or NDC content. If not sent only GDS content is returned. Send both values to return aggregated GDS and NDC content
  Enum: "GDS", "NDC", "LCC", "API"

- `CatalogProductOfferingsRequest.maxNumberOfUpsellsToReturn` (integer)
  Returns the specified number of upsell fares for each base fare, up to 4 for GDS, 99 for NDC, or as many filed by the airline if fewer than the value sent are available. Values greater than these supported values do not return an error message, but instead max out at the supported upsells per base fare. Upsells are not returned in a specific object but rather are presented along with the base fare as a higher level of service, usually a branded fare. This value carries over to any follow-on Next Leg Search request. Note the following differences for GDS and NDC: For GDS, when maxNumberOfUpsellsToReturn is either not sent or sent as 0, the lowest priced offer is returned. For NDC: When maxNumberOfUpsellsToReturn is not sent, the response returns the lowest priced offer of each available brand or cabin. When maxNumberOfUpsellsToReturn=0, the response returns the lowest priced offer. The number of upsells that can be requested are limited for multi-city itineraries: four to six O&Ds are limited to one upsell; three O&Ds are limited to two upsells; and one or two O&Ds (one-way or round-trip itineraries) can have up to four upsells for GSD or 99 for NDC.The maximum number of upsells to return
  Example: 3

- `CatalogProductOfferingsRequest.sortBy` (string)
  Sorts offers in order by the value in BestCombinablePrice/TotalPrice. Supported value: Price-LowToHigh: Sorts the offers returned from lowest to highest price. Supported for GDS, NDC, and combined GDS and NDC content. If sent, this sorting also applies to any following Next Leg Search. Upsell offers are not sorted. Travelport recommends as best practice that when sending sortBy and requesting NDC content, do not also send offersPerPage. If sent together some offers may be incomplete. Note the following when requesting NDC content: NDC-only content when multiple NDC carriers return offers: Without sorting: Search returns NDC offers consecutively by carrier; for example, all NDC AA offers, followed by all NDC UA offers. With sorting: Search returns all offers in ascending price order regardless of carrier. GDS and NDC combined content: Without sorting: Search returns offers by carrier. first for GDS and then for NDC; for example, GDS AA offers, NDC AA offers, GDS UA offers, NDC UA offers. With sorting: Search returns all offers in ascending price order regardless of carrier or content source.
  Enum: "Price-LowToHigh"

- `CatalogProductOfferingsRequest.PassengerCriteria` (array, required)
  Defines the type of passenger traveling. Send one instance of PassengerCriteria for each passenger type code (PTC). Search supports up to 9 total passengers. A maximum of 6 PTCs are supported for GDS. NDC does not have a PTC limitation. Can include optional traveler details such as age, birth date, loyalty, and geographic location when needed.

- `CatalogProductOfferingsRequest.PassengerCriteria.@type` (string, required)
  Discriminator. No child classes.
  Example: "PassengerCriteria"

- `CatalogProductOfferingsRequest.PassengerCriteria.number` (integer, required)
  The amount of passengers associated with this passenger type code
  Example: 1

- `CatalogProductOfferingsRequest.PassengerCriteria.age` (integer)
  The age of the passenger. Travelport recommends sending age only with PTCs that require age for pricing. For child passengers, Travelport recommends sending the age of the child in the age attribute plus the PTC CNN. Travelport recommends against sending CNN without age, or the CHD PTC. Many fares cannot be quoted for CHD. The age for CNN is generally between 2 and 11 inclusive, with ADT fares returned for ages 12 and up; however, this can vary by airline and country. The age for INF must be either 0 or 1. During booking, date of birth is required for all child and infant PTCs (Add Traveler payload in Traveler/birthDate).
  Example: 26

- `CatalogProductOfferingsRequest.PassengerCriteria.passengerTypeCode` (string)
  Required field for Air Search and Flight specific search. The passenger type code for the passengers on the itinerary. Common PTCs are: ADT: adult CHD: child of unknown age (see Notes on PTC and age below) CNN: child when age is known INF: infant without a seat INS: infant with a seat UNN: unaccompanied child. See API guides to download a full list of PTCs. NDC carriers BA, SQ, AV, AA, and AF/KLM offer teen/young adult tax exemptions from the UK Air Passenger Duty (GB tax). Send PTC with the value YTH and send the passengers age per below. The PTC may be returned as ADT, or Cxx in which xx is the age, but the tax exemption is applied in the pricing on these NDC carriers. When running a multiple passenger search for NDC on Qantas, Qantas supports only these PTCs: ADT, CHD, CNN, INF. Sending any other PTC may result in an error at ticketing.
  Example: "ADT"

- `CatalogProductOfferingsRequest.PassengerCriteria.birthDate` (string)
  The date of birth of the passenger. May be used in age validation for fares with age restrictions.
  Example: "2020-01-16"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty` (array)
  Optional object for sending customer loyalty information, such as for a frequent flyer program. If CustomerLoyalty is sent in the Search request, it must also be sent in the Air Price request and the Add Traveler request. Some carriers validate frequent traveler data through the workflow, failing to send the same CustomerLoyalty details, even if invalid, may cause a booking failure. If an invalid number is sent, the response returns a warning message that the FQTV is invalid, and the invalid number is cached to prevent a potential booking failure. In Search API CustomerLoyalty is only sent to NDC carriers. Ignored for GDS Search.

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.value` (string, required)
  Number on loyalty card.
  Example: "132456"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.id` (string)
  Optional Customer Loyalty Id. Not saved
  Example: "Loyalty_1"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.priority` (integer)
  Optional Numeric Priority Code
  Example: 2

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.programId` (string)
  "Specifies an identifier to indicate the company owner of the loyalty program. Typically two characters.
  For frequent guest number, the hotel supplier or brand code.
  For frequent flyer number, the air supplier code of the loyalty program."
  Example: "United"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.programName` (string)
  Supplier's loyalty program name.
  Example: "Frontier-EarlyReturns"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.supplierType` (string)
  The type of supplier of a loyalty program. Uses 'hotel' for frequent guest number or 'air' for frequent flyer number.
  Example: "Airline"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.supplier` (string, required)
  Supplier of a loyalty program (typically 2 characters representing the hotel, brand, or airline).
  Example: "UA"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.tier` (string)
  Customer Loyalty tier
  Example: "Silver"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.shareWithSupplier` (array)
  The list of suppliers that the CustomerLoyalty number is shared. Used for cross accrual.
  Example: ["LH"]

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.cardHolderName` (string)
  Customer loyalty member name; up to 128 characters are supported. In Air Search, for discounted offers to be returned, the name must be sent as LAST FIRST; e.g.,if SMITH is the last name and JORDAN the first name, send as SMITH JORDAN
  Example: "John Smith"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.validatedInd` (boolean)
  Customer loyalty number has been validated by the supplier
  Example: true

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.prefix` (string)
  The cardholder name prefix title like Mr, Mrs, Dr
  Example: "Dr"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.given` (string)
  The First Name of the Cardholder
  Example: "John"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.middle` (string)
  Middle Name of the Cardholder
  Example: "Wilkinson"

- `CatalogProductOfferingsRequest.PassengerCriteria.CustomerLoyalty.surname` (string)
  Last Name of the Cardholder
  Example: "Smith"

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation` (object)
  Optional object for requesting local citizen/local resident fares for Spain and associated islands. You must also send a PTC relevant to the local resident fares; e.g., ADR for adult resident, CHR for child resident. Any discount applied through TravelerGeographicLocation applies to all travelers, not only to the traveler in this instance of PassengerCriteria. If the discount must apply only to an individual traveler, that traveler requires a separate search and book workflow.

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.value` (string)
  IATA code for the city, country, or state/province relevant to the local citizen//local resident fare.
  Example: "PMI"

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.travelerGeographicLocationType` (string)
  The geographic type of the location value
  Enum: "Country", "StateProvince", "City"

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.residentGeographicCode` (string)
  Resident code for Spanish residency fares for NDC. Any discount will apply to all travelers, not only to the traveler in this instance of PassengerCriteria. Supported/validated only for NDC to support local citizen fares.

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.generalLargeFamilyResidentDiscountInd` (boolean)
  Send only if true and request qualifies for general large family resident discount, defined as general large families (up to three children) from Spain, from the EU/EEA, or of any other nationality whose residency in Spain is recognized and who are in possession of a large-family certificate issued by the autonomous community in which they live. Supported/validated only for NDC to support local citizen fares.
  Example: true

- `CatalogProductOfferingsRequest.PassengerCriteria.TravelerGeographicLocation.specialLargeFamilyResidentDiscountInd` (boolean)
  Send only if true and request qualifies for special large family resident discount, defined as special large families (four or more children) from Spain, from the EU/EEA, or of any other nationality whose residency in Spain is recognized and who are in possession of a large-family certificate issued by the autonomous community in which they live. Supported/validated only for NDC to support local citizen fares.
  Example: true

- `CatalogProductOfferingsRequest.PassengerCriteria.specifiedPassengerTypeCodeOnlyInd` (boolean)
  If true, returns only offers for the specified PTC. If no offers for that PTC are available, an error message that offers were found is returned. GDS only; not supported for NDC. Default is false.
  Example: true

- `CatalogProductOfferingsRequest.SearchCriteriaFlight` (array, required)
  Each instance defines one leg of the itinerary by specifying an origin and destination (O&D) pair, aka departure and arrival location, for that leg. Optionally includes travel timing. Send one instance of SearchCriteriaFlight for each leg of the itinerary. You must specify all O&D pairs for all legs of the itinerary, even for a leg-based search. Search, Next Leg Search, and Flight Specific Search support a maximum of 6 O&D pairs for both GDS and NDC.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.departureDate` (string)
  Preferred local departure date in YYYY-MM-DD format. For GDS, send either departureDate or arrivalDate. If both departureDate and arrivalDate are sent, departureDate is ignored. For NDC, departureDate is required. For GDS content, departureDate is not required when sending arrivalDate.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.daysBeforeDeparture` (integer)
  Available for flex search only. Return flight options within a number of days from specified departure date. Maximum of 3 days can be selected.
  Example: 1

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.daysAfterDeparture` (integer)
  Available for flex search only. Return flight options within a number of days from specified departure date. Maximum of 3 days can be selected.
  Example: 2

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.departureTime` (string)
  Returns NDC offers with flights between two hours before and two hours after the departure time; for example, for departureTime of 10:00:00, Search returns available flights between 8:00 and 12:00. Do not use for GDS; instead, use DepartureTimeRange. For NDC content, if multiple time options are sent in the same instance of SearchCriteriaFlight, they are applied in the order DepartureTimeRange, departureTime, and arrivalTime.
  Example: "07:00:00"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.arrivalDate` (string)
  Date of arrival in YYYY-MM-DD format. For GDS, send either arrivalDate or departureDate. If both departureDate and arrivalDate are sent, departureDate is ignored. For NDC, arrivalDate is optional and departureDate is always required; if sent, offers returned are filtered by both arrivalDate and departureDate.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.arrivalTime` (string)
  Returns NDC offers with flights between two hours before and two hours after the arrival time; for example, for arrivalTime of 10:00:00, Search returns available flights between 8:00 and 12:00. Do not use for GDS; instead, use ArrivalTimeRange. Supported only by specific NDC carriers. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC Resources if you need login assistance).
  Example: "09:15:00"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.legSequence` (integer)
  Recommended to send when requesting cabin, class of service, and/or connection preferences at the leg level. See example in Air Search guide. Do not send if requesting preferences at itinerary level.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From` (object, required)
  Origin Destination Information

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From.value` (string)
  The IATA airport or city code for the departure or arrival airport/city for this leg.
  Example: "MEX"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From.cityOrAirport` (string)
  Optional enumeration specifying whether to restrict the search based on the city/airport code sent in From/value. Possible options and behavior are as follows. These behaviors are for availability selection only. Actual content may vary based on calculated price and diversity. Not all NDC carriers may support all options. Airport code with no cityOrAirport value expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. This behavior also applies to: city code with Airport Only, City code with City Only, City or airport code with City or Airport. Airport code with cityOrAirport value Airport Only returns content only from the specified airport. For example, LGA will return content from only LGA. Airport code with cityOrAirport value City expands the availability selection to the city without giving preference to the requested airport. This behavior is equivalent to searching with the airport's city code. For example, LGA would instead be treated as NYC and would return flights for LGA, EWR, and JFK with no preference.
  Enum: "Airport Only", "City or Airport", "City Only", "Use Default"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From.radius` (integer)
  Available for flex search only. Return offers from airports within a specified distance from the origin and/or destination.
  Example: 50

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.From.radiusMeasurement` (string)
  For Hotels: Optional object to request either miles or kilometers for the search radius from the specified location. If unitOfDistance is not specified, the search defaults to miles for properties in the United States, Myanmar, and Liberia. The search defaults to kilometers in all other countries.
  Enum: "Miles", "Kilometers"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.To` (object, required)
  Origin Destination Information

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.AdditionalFrom` (array)
  Available for flex search only. Select additional origin cities to expand your flight options.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.AdditionalFrom.value` (string)
  The additional IATA airport or city codes for the departure or arrival airport/city for this leg.
  Example: "LGW"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.AdditionalFrom.cityOrAirport` (string)
  Optional enumeration specifying whether to restrict the search based on the city/airport code sent in From/value. Possible options and behavior are as follows. These behaviors are for availability selection only. Actual content may vary based on calculated price and diversity. Not all NDC carriers may support all options. Airport code with no cityOrAirport value expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. This behavior also applies to: city code with Airport Only, City code with City Only, City or airport code with City or Airport. Airport code with cityOrAirport value Airport Only returns content only from the specified airport. For example, LGA will return content from only LGA. Airport code with cityOrAirport value City expands the availability selection to the city without giving preference to the requested airport. This behavior is equivalent to searching with the airport's city code. For example, LGA would instead be treated as NYC and would return flights for LGA, EWR, and JFK with no preference.
  Enum: "Airport Only", "City or Airport", "City Only", "Use Default"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.AdditionalTo` (array)
  Available for flex search only. Select additional destination cities to expand your flight options.

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.DepartureTimeRange` (object)
  In Air Search API supports searching by a departure or arrival time window for any leg of the itinerary. For NDC, supported only by specific NDC carriers. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC Resources if you need login assistance).

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.DepartureTimeRange.start` (string)
  The start time of the departure or arrival time window to search. Either start or end is required.
  Example: "06:15:00"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.DepartureTimeRange.end` (string)
  The end time of the departure or arrival time window to search. Either start or end is required.
  Example: "09:15:00"

- `CatalogProductOfferingsRequest.SearchCriteriaFlight.ArrivalTimeRange` (object)
  In Air Search API supports searching by a departure or arrival time window for any leg of the itinerary. For NDC, supported only by specific NDC carriers. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC Resources if you need login assistance).

- `CatalogProductOfferingsRequest.SearchModifiersAir` (object)
  Add one or more optional modifiers to filter search results by criteria related to the journey itself. All journey modifiers are in CatalogProductOfferingsQueryRequest/CatalogProductOfferingsRequest/SearchModifiersAir. Any modifiers sent in the initial Search request are applied to any subsequent Next Leg Search request. All modifiers apply to the entire itinerary, not at the leg level, unless otherwise specified with legSequence per below.

- `CatalogProductOfferingsRequest.SearchModifiersAir.@type` (string, required)
  discriminator
  Example: "SearchModifiersAir"

- `CatalogProductOfferingsRequest.SearchModifiersAir.excludeGround` (string)
  Excludes certain ground transportation from the response. By default, the response may return ground transportation options such as trains and buses, depending on the routing. In the response, ground transportation options are identified in ReferenceList/Flight by the TRN, TRS, or BUS equipment codes.GDS only, not supported for NDC.
  Enum: "Train", "All"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "CarrierPreference"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference.preferenceType` (string, required)
  The type of carrier preference
  Enum: "Preferred", "Permitted", "Prohibited"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference.carriers` (array, required)
  One or more carrier codes to permit, prohibit, or prefer. Preferred alliances are also supported; send the alliance code (e.g., /\*A) instead of the carrier code.
  Example: ["BA"]

- `CatalogProductOfferingsRequest.SearchModifiersAir.CarrierPreference.legSequence` (array)
  Applies the carrier/alliance preference to only specific legs of the itinerar referencing legSequence sent in SearchCriteriaFlight. Do not send if requesting preference at itinerary level. GDS only, not supported for NDC.
  Example: [1,2]

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "CabinPreference"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference.preferenceType` (string)
  Sending a mix of preferenceType values is not supported. For example, you cannot send an instance of CabinPreference with a preferenceType of Permitted and another instance with preferenceType of Prohibited. In this case the results default to the Preferred preference.
  Enum: "Preferred", "Permitted", "PreferredWithUpgrade", "Prohibited"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference.cabins` (array)
  A space-delimited list of cabins.
  Enum: "PremiumFirst", "First", "Business", "PremiumEconomy", "Economy"

- `CatalogProductOfferingsRequest.SearchModifiersAir.CabinPreference.legSequence` (array)
  Limits preference to the specified leg referenced in SearchCriteriaFlight. You can apply the preference to only some legs of the itinerary, or different preferences to different legs. To apply preference to the entire itinerary, do not send legSequence. GDS only, not supported for NDC. Not supported at Price or Book.
  Example: [1,2]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference.@type` (string)
  Discriminator. No child classes exist
  Example: "ClassOfServicePreference"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference.legSequence` (array)
  Applies preference to specified leg/s of the itinerary, referencing the leg sequence in SearchCriteriaFlight. Do not send if requesting preference at itinerary level.
  Example: [1,2]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference.ClassesOfService` (array, required)
  One or more classes of service to permit or prohibit.
  Example: ["F"]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ClassOfServicePreference.PreferenceType` (string)
  Class of Service preference options.
  Enum: "Preferred", "Permitted", "Prohibited"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.@type` (string)
  Discriminator. No child classes exist
  Example: "ProductInclusionPreference"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.Classification` (array, required)
  Send one or more of the enumerated values to return only fares that include those attributes in the price. For example, sending CarryOn returns only fares that include a carry-on bag in the price.
  Enum: "CheckedBag", "CarryOn", "PersonalItem", "Rebooking", "Refund", "SeatAssignment", "PremiumSeat", "LieFlatSeat", "Meals", "WiFi", "Other"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.AdditionalClassification` (array)
  Currently unused. Only items enumerated in BrandClassificationENUM are currently supported. Any additional items sent are ignored and the lowest fares are returned regardless of associated brand attributes.
  Example: ["PremiumDrinks"]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.legSequence` (array)
  Leg sequence is not supported for ProductInclusionPreference. Preference will be applied to the whole journey.
  Example: [1,2]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.exactMatchInd` (boolean)
  Will not implement. The default behavior will be to provide an exact match to the product inclusion preferences.
  Example: true

- `CatalogProductOfferingsRequest.SearchModifiersAir.ProductInclusionPreference.bestMatchInd` (boolean)
  Will not implement. The default behavior will be to provide an exact match to the product inclusion preferences.
  Example: true

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences` (array)

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.@type` (string)
  Discriminator classes ConnectionPreferences or ConnectionPreferencesAir. Must send “ConnectionPreferencesAir” when sending FlightType. If the @type value is not sent, FlightType is ignored for GDS; for NDC, a time out error is returned.

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.legSequence` (array)
  Applies preference to only specific leg/s of the itinerary referencing legSequence sent in SearchCriteriaFlight. Do not send for preference at itinerary level.
  Example: [1,2,4]

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.maxConnectionDuration` (string)
  Limits results to itineraries that do not exceed a set length of time between flights on the same leg. Applies to all connections on the itinerary. Use the format PT{x}H, in which P is the duration designator, T is the time designator, and {x}H is the number of hours the connection should not exceed . For minutes use {x}H{x}M. GDS only, not supported for NDC.
  Example: "PT3H30M"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.maxOvernightDuration` (string)
  Limits results to itineraries that do not exceed a set length of time for any overnight connection. If the first flight in the connection arrives on one calendar date and the connecting flight arrives on another calendar date, this constitutes an overnight connection. Use the format PT{x}H, in which P is the duration designator, T is the time designator, and {x}H is the number of hours the connection should not exceed. For minutes use {x}H{x}M. GDS only, not supported for NDC.
  Example: "PT6H30M"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.preferenceType` (string, required)
  The type of connection preference. Only one preference type can be requested for an O&D pair.
  Enum: "Preferred", "Permitted", "Prohibited"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.ConnectionPoint` (array, required)
  IATA code for the connecting location/s for this preference. For example, if you specify three locations, any flights connecting in any one of those locations will be permitted/preferred/prohibited per the specified preferenceType.

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.cityOrAirport` (string)
  Optional enumeration specifying whether to restrict the search based on the city/airport code sent in From/value. Possible options and behavior are as follows. These behaviors are for availability selection only. Actual content may vary based on calculated price and diversity. Not all NDC carriers may support all options. Airport code with no cityOrAirport value expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. This behavior also applies to: city code with Airport Only, City code with City Only, City or airport code with City or Airport. Airport code with cityOrAirport value Airport Only returns content only from the specified airport. For example, LGA will return content from only LGA. Airport code with cityOrAirport value City expands the availability selection to the city without giving preference to the requested airport. This behavior is equivalent to searching with the airport's city code. For example, LGA would instead be treated as NYC and would return flights for LGA, EWR, and JFK with no preference.
  Enum: "Airport Only", "City or Airport", "City Only", "Use Default"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.FlightType` (object)
  The type of flight connection

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.FlightType.@type` (string, required)
  Discriminator. No child classes.
  Example: "FlightType"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.FlightType.connectionType` (string)
  Limits the connection type returned. Each value returns the specified type and all higher types. For example, StopDirect could return both flights that stop without a change of planes (StopDirect) and non-stop direct flights (NonStopDirect). SingleConnection or DoubleConnection will not exclude StopDirect flights from the journey. For example, SingleConnection could return an itinerary with two flight numbers, and either of these flights could have intermediate stops.
  Enum: "NonStopDirect", "StopDirect", "SingleConnection", "DoubleConnection", "TripleConnection"

- `CatalogProductOfferingsRequest.SearchModifiersAir.ConnectionPreferences.FlightType.excludeInterlineConnectionsInd` (boolean)
  Excludes interline connectionsClosed from results. If true, does not return offers with interline connections. If false or omitted, may return interline connections in results. Default is false. GDS only, not supported for NDC. When a product contains multiple interline air segments, brand details return only the brand of the significant carrier, not the validating/plating carrier brand information. The IATA rules for determining the significant carrier on an itinerary are based on the areas in which the transportation takes place.
  Example: true

- `CatalogProductOfferingsRequest.SearchModifiersAir.prohibitChangeOfAirportInd` (boolean)
  Suppresses return of offers that require a change of airport at connection. If true, excludes itineraries that require changing airports during connections. If false or omitted, may return itineraries that require change of airport. Default is false.
  Example: true

- `CatalogProductOfferingsRequest.PaymentCriteria` (object)
  Used to provide optional payment-card criteria in an Air Search request by sending the IssuerIdentifierNumber/BIN of the credit card to be used for payment. Sending the BIN returns OB fees in the response, which are ticketing and form of payment (FOP) fees, including credit card fees. Returned in an instance of Price/PriceBreakdown/Fees/Fee with a feeCode of OB.

- `CatalogProductOfferingsRequest.PaymentCriteria.@type` (string, required)
  discriminator
  Example: "PaymentCriteria"

- `CatalogProductOfferingsRequest.PaymentCriteria.IssuerIdentificationNumber` (string)
  6 to 11 digit number. The BIN/IIN of the credit card to be used for payment
  Example: "123456"

- `CatalogProductOfferingsRequest.PaymentCriteria.PaymentCardCode` (string)
  A two character code for a credit card
  Example: "VI"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber` (array)

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.value` (string)
  Example: "1259900123456"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.documentIssuer` (string)
  Document issuer
  Example: "BA"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.documentType` (string)
  Document type like EMD, MCO
  Enum: "EMD", "MCO", "Ticket", "TASF", "Invoice"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.travelerIdentifierRef` (string)
  traveler identifier reference

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.name` (string)
  The name of the Traveler being referenced.

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.passengerTypeCode` (string)
  The passenger type code of the Traveler being referenced.
  Example: "ADT"

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.id` (string)
  A locally referenced ID

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.description` (string)
  Descriptive text used to identify the contents of a target object

- `CatalogProductOfferingsRequest.PaymentCriteria.DocumentNumber.uris` (array)
  The URI used to GET the target object in another domain.

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass` (array)
  In Search API, for NDC flight pass bookings this is a required field and must reference the owner in PassengerCriteria. Only one permitted per Search request.

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.@type` (string, required)
  Discriminator. No child classes
  Example: "FlightPass"

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.accountNumber` (string, required)
  The flight pass account number
  Example: 140851633093

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.supplier` (string, required)
  The flight pass supplier code
  Example: "AC"

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.Description` (array)
  Example: ["FlightPass"]

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef` (array)
  In Search, use the passengerCriteriaRef to reference the owner of the flightpass. This is a mandatory field for Search API.

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.name` (string)
  Traveler identifier

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.passengerTypeCode` (string)
  Passenger Type code
  Example: "ADT"

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.ages` (array)
  The ages of the travelers associated to a particular ptc. For NDC, this value will be returned in PriceBreakdownAir if sent as part of the PassengerCriteria in the Air Search request.
  Example: [15]

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.passengerCriteriaRef` (string)
  Allows the user to associate passenger criteria information.
  Example: "passengerCriteria_1"

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.value` (string)

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.id` (string)
  A locally referenced ID

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.description` (string)
  Descriptive text used to identify the contents of a target object

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.uris` (array)
  Uniform Resource Identifier
  Example: ["google.com"]

- `CatalogProductOfferingsRequest.PaymentCriteria.FlightPass.TravelerIdentifierRef.age` (integer)
  Replaced with ages array. The age of the traveler.
  Example: 11

- `CatalogProductOfferingsRequest.PaymentCriteria.agencyAccountInd` (boolean)
  If true, payment will be made by agency account
  Example: true

- `CatalogProductOfferingsRequest.PaymentCriteria.bspInd` (boolean)
  If true, payment will be made by BSP
  Example: true

- `CatalogProductOfferingsRequest.PaymentCriteria.cashInd` (boolean)
  If true, payment will be made by cash
  Example: true

- `CatalogProductOfferingsRequest.PaymentCriteria.invoiceInd` (boolean)
  If true, payment will be made by invoice
  Example: true

- `CatalogProductOfferingsRequest.PricingModifiersAir` (object)
  A selection of Pricing Modifiers that can be used to influence the Price of an Offer. Discriminator classes PricingModifiersAir and PricingModifersAirDetail

- `CatalogProductOfferingsRequest.PricingModifiersAir.@type` (string, required)
  Discriminator. Child class PricingModifiersAirDetail.
  Example: "PricingModifiersAir"

- `CatalogProductOfferingsRequest.PricingModifiersAir.currencyCode` (string)
  In the Search API, send the currency type to return if you want to override the default currency specified with your PCC.
  Example: "GBP"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection` (object)
  May include FareSelectionDetail, RefundOptions, ChangeOptions objects.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.@type` (string, required)
  Discriminator. Child class FareSelectionDetail.
  Example: "FareSelection"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.fareType` (string)
  Defines the type of fares to return (Only public fares, Only private fares, Only agency private fares, Only
  Enum: "PublicFaresOnly", "PrivateFaresOnly", "AgencyPrivateFaresOnly", "AirlinePrivateFaresOnly", "PublicAndPrivateFares", "NetFaresOnly", "AllFares"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions` (object)
  Supports requesting only fares that meet certain refund criteria. GDS only; not supported for NDC. Search supports sending up to 12 refundability options. The following combinations are mutually exclusive; if sent, Search ignores them and returns a warning message: NonRefundable cannot also be sent with PartialRefund. Refundable cannot also be sent with ChangeOptions/changeTypes=PenaltyToChange

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.@type` (string, required)
  Discriminator. No child classes.
  Example: "RefundOptions"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.refundTypes` (array, required)
  Enum: "Refundable", "NonRefundable", "PartialRefund"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange` (object)
  Not currently supported. User can express a minimum and maximum Refund penalty range that will be included in the result set.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.@type` (string)
  Example: "RefundPenaltyRange"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Minimum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Minimum.@type` (string, required)
  Discriminator classes AmountPercentAmount or AmountPercentPercent
  Example: "AmountPercentAmount"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Minimum.application` (string)
  Type of commission
  Enum: "Full", "Partial", "Non-paying", "No-show", "Adjustment", "Commissionable"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.RefundOptions.RefundPenaltyRange.Maximum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions` (object)
  Supports requesting only fares that meet certain change criteria. GDS only; not supported for NDC. Search supports sending up to 12 changeability options. ChangeOptions.changeTypes=PenaltyToChange cannot be sent with RefundOptions.Refundable. If sent, Search ignores them and returns a warning message

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.@type` (string)
  Discriminator. No child classes.
  Example: "ChangeOptions"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.changeTypes` (array, required)
  Enum: "Changeable", "NonChangeable", "PenaltyToChange"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange` (object)
  Not currently supported. User can express a minimum and maximum Change penalty range that will be included in the result set

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange.@type` (string)
  Example: "ChangePenaltyRange"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange.Minimum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.ChangeOptions.ChangePenaltyRange.Maximum` (object)
  Parent object when amount is applied as an Amount or a Percent.

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.FareQualiferString` (array)
  Request specific private leisure fares. Supported values vary by NDC carrier. For detailed NDC support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API in the guide section. This value is returned in FlightProduct.FareQualifierString if supplied by the airline. (Note the misspelling in request parameter)
  Example: ["Tour"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.FareQualifier` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareSelection.FareQualifier.value` (string)
  Deprecated - do not use. Replaced by FareQualiferString
  Enum: "Consolidator", "Government", "Marine", "Military", "Reward", "StandBy", "Staff", "Student", "Tour", "Youth", "VistFriendsAndRelatives"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation` (object)
  In search API sends account code/s to request negotiated fares. For NDC supports corporate loyalty program and GST Information. This information is returned in TermsAndConditions.OrganizationInformation.

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.@type` (string, required)
  Discriminator. No child classes
  Example: "OrganizationInformation"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.value` (string)
  The value of the code type.
  Example: "JBD123456"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.supplier` (string)
  The IATA code for the airline on which the code type is applicable.
  Example: "AA"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.organizationCodeType` (string)
  Sends a description for the OrganizationIdentifer value
  Enum: "Account", "OrganizationLoyaltyProgram", "Tour", "TicketDesignator"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.segmentSequenceList` (array)
  Returned in response when the code is applicable to a specified segment sequence
  Example: [1,2,3]

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.productRef` (array)
  Returned in response when the code is applicable to a specified product
  Example: ["product_1"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.OrganizationIdentifier.accountCodeFaresOnlyInd` (boolean)
  Indicator to limit the fares returned to only fares filed for the specified account code. If true, returns only fares filed for the account code/s in OrganizationIdentifier/value. If sending multiple account codes, send with each instance of OrganizationIdentifier. If false or omitted, returns account fares and other fares. Default is false. If an account code is sent without accountCodeFaresOnlyInd=true, the response includes any fares filed for that account code plus fares that are not specific to the account code. If accountCodeFaresOnlyInd=true and no account code is sent, the indicator is ignored and the response returns all fares and a warning message that the request must include an account code. GDS only; not supported for NDC.
  Example: true

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber` (array)
  NDC only. Supported during book 'Add Offer' workflow.

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.value` (string, required)
  The GST registered number for the business.
  Example: "07AAGFF2194N1Z1"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.telephone` (string, required)
  Business telephone number
  Example: "222-222-222"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.address` (string, required)
  Business address
  Example: "1122 sample trail, CO, USA, 21232"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.country` (string, required)
  IATA country code of the business.
  Example: "IND"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.companyName` (string, required)
  Business name
  Example: "Adecco"

- `CatalogProductOfferingsRequest.PricingModifiersAir.OrganizationInformation.GSTRegistrationNumber.email` (string, required)
  Business E-Mail
  Example: "sample@adecco.com"

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption` (object)
  GDS only, not supported for NDC. Marks as tax exempt either all taxes, only specific tax codes, or all taxes in specific countries. Send either allTaxesExemptInd OR countries and taxCodes per below. TaxExemption supports up to nine values for countries, for taxCodes, or for countries and taxCodes combined. The response returns any exempt taxes with exemptInd=true and a zero value.

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption.@type` (string)
  Discriminator. No child classes.
  Example: "TaxExemption"

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption.countries` (array)
  ISO country code. One or more two-letter alphanumeric codes for the countries in which the taxCodes sent are tax exempt.
  Example: ["GB","MX"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption.taxCodes` (array)
  One or more two-letter alphanumeric tax codes to mark as exempt.
  Example: ["US"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.TaxExemption.allTaxesExemptInd` (boolean)
  Marks all taxes as exempt. If true, marks all taxes in the response as exempt. Do not send if false; instead, use countries and taxCodes to specify which taxes to exempt.
  Example: true

- `CatalogProductOfferingsRequest.PricingModifiersAir.PromotionalCode` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.PromotionalCode.value` (string)
  The promotional code to apply
  Example: "CDFRT"

- `CatalogProductOfferingsRequest.PricingModifiersAir.PromotionalCode.supplierCode` (string, required)
  The IATA code for the airline on which the promotional code is applicable.
  Example: "AA"

- `CatalogProductOfferingsRequest.PricingModifiersAir.SellCity` (string)
  The IATA location code for the city. Overrides the sell city of the requester to specify an alternate sale location and return fares based on that location. GDS only, not supported for NDC.
  Example: "NYC"

- `CatalogProductOfferingsRequest.PricingModifiersAir.TicketCity` (string)
  The IATA location code for the city. Overrides the ticketing city of the requester to specify an alternate ticket location and return fares based on that location. GDS only, not supported for NDC.
  Example: "NYC"

- `CatalogProductOfferingsRequest.PricingModifiersAir.PricingPCC` (string)
  Use to send a faring PCC for which a selective access or code group agreement exists between that PCC and the PCC associated with your account. The following combinations of PricingPCC and FareSelection/fareType=PrivateFaresOnly return results as follows: PricingPCC sent and PrivateFaresOnly not requested: If a selective access or group agreement exists, both public and private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly not requested: If no selective access or group agreement exists, only public fares are returned. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists that allows private fare access, private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists but does not allow private fares access, or if no agreement exists, an error is returned. GDS only, not supported for NDC.
  Example: "0Bx3"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareBasisCodeOverride` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareBasisCodeOverride.value` (string)

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareBasisCodeOverride.specificFlightCriteriaRefs` (array)
  Reference the specificFlightCriteria you want to override. If blank, all segments will be overridden.
  Example: "s1, s2"

- `CatalogProductOfferingsRequest.PricingModifiersAir.FareBasisCodeOverride.unpricedFlightSegmentRefs` (array)
  Reference the unpricedFlightSegment you want to override. If blank, all segments will be overridden.
  Example: "up1, up2"

- `CatalogProductOfferingsRequest.PricingModifiersAir.MultiPricingAgency` (array)
  Return offers from multiple point of sale agencys.
  Example: ["[\"0XS4\",\"0YBZ\",\"J80K\"]"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.TicketingPCC` (string)
  In Search API, overrides the ticketing PCC associated with your account to specify an alternate PCC and return fares based on that PCC. GDS only, not supported for NDC.
  Example: "0XS4"

- `CatalogProductOfferingsRequest.PricingModifiersAir.CalculatedFareAdjustment` (object)
  Used in Exchange Search to modify the Price of the Fare. Discriminator classes CalculatedFareAdjustmentDiscount or CalculatedFareAdjustmentIncrease

- `CatalogProductOfferingsRequest.PricingModifiersAir.CalculatedFareAdjustment.@type` (string, required)
  Example: "CalculatedFareAdjustmentDiscount"

- `CatalogProductOfferingsRequest.PricingModifiersAir.ManualFareAdjustment` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.ManualFareAdjustment.@type` (string, required)
  Discriminator. Child classes ManualFareAdjustmentIncrease or ManualFareAdjustmentDiscount
  Example: "ManualFareAdjustmentIncrease"

- `CatalogProductOfferingsRequest.PricingModifiersAir.ManualFareAdjustment.passengerTypeCodes` (array)
  Send the PTC/s to be increased or discount. This increases or discounts the fare for all passengers with the PTC/s. If not sent, ManualFareAdjustment applies to all PTCs.
  Example: ["ADT","CHD"]

- `CatalogProductOfferingsRequest.PricingModifiersAir.BrandPreference` (array)

- `CatalogProductOfferingsRequest.PricingModifiersAir.BrandPreference.@type` (string, required)
  Discriminator. No child classes exist
  Example: "BrandPreference"

- `CatalogProductOfferingsRequest.PricingModifiersAir.BrandPreference.brandTier` (integer)
  The brand tier you want to override
  Example: 1

- `CatalogProductOfferingsRequest.PricingModifiersAir.BrandPreference.legSequence` (array)
  Correlates with legSequence in SearchCriteriaFlight
  Example: [1,2]

- `CatalogProductOfferingsRequest.PricingModifiersAir.includeSplitPaymentInd` (boolean)
  Requests request split ticketing, which returns outbound and inbound one-way fares in addition to round trip options in the Search API response. This may result in lower fares than the same or similar round-trip itinerary. If true, requests split ticketing. If false or omitted split ticketing options are not returned. Default is false. GDS only, not supported for NDC. When split ticketing is requested, the Search response returns offers in the following order: Outbound one-way offers, Inbound one-way offers, Round trip offers. The response identifies all one-way outbound and inbound offers with CombinabilityCode j0. CombinabilityCode values for round trip offers start at j1 and increment by one for each offer. Only the following are in scope for split ticketing: Search (not supported for Next Leg Search or Flight Specific Search), Round-trip journey-based offerings ( isJourney header not sent or sent as true, or CustomResponseModifiersAir/SearchRepresentation not sent or sent with value Journey ) Upsells. Split ticketing is not supported for round-trip leg-based searches, virtual interlining, or NDC. Split ticketing is available only for customers specifically provisioned for split ticketing. Split ticketing returns one-way outbound and one-way inbound fares in addition to round-trip offers. Split ticket offers are identified with CombinabilityCode j0. If your account is not configured for split ticketing, sending includeSplitPaymentInd returns a response without split ticket offers and a warning message. GDS only, not supported for NDC. In Air Price, For split ticketing, the request must send offers that are identified in the Search response with CombinabilityCode j0, which identifies those offers as one-way outbound and one-way inbound split ticketing offers. A combination of j0 and any non-j0 value offer returns an error message that split pricing is not supported

- `CatalogProductOfferingsRequest.PricingModifiersAir.returnMostRestrictiveBrandInd` (boolean)
  In Search API, when there are different brands on a connecting flight, return information for either the most restrictive brand or the brand on the most significant segment on the itinerary. If true, return the offer brand of the most restrictive brand. If false or omitted, return the offer brand of the most significant segment of the itinerary. GDS only, not supported for NDC.

- `CatalogProductOfferingsRequest.PricingModifiersAir.splitPaymentOfferings` (number)
  Number between 0 and 99. Send with includeSplitPaymentInd to configure the percentage of round trip offers to return in a split ticketing response. By default, Search divides the split ticketing response into 34% round-trip offerings and the remainder as split ticketing offers, which are combined outbound and inbound one-way fares. To change this percentage, send SplitPaymentOfferings with the percentage value of round trip offers to return.
  Example: 25

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir` (object)
  Modifiers to customize the result set. Includes SearchRepresentation and optional indicators for returning or excluding selected response content. Values sent here can carry forward into the Next Leg Search request and are not re-sent.

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.@type` (string, required)
  discriminator
  Example: "CustomResponseModifiersAir"

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion` (array)
  Supported in Search and Price.

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion.@type` (string)
  Example: "BrandAttributeInclusion"

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion.Classification` (array)
  Send one or more of the following values to return information about only the specified attributes. Fares may include other attributes but information about them is not returned
  Enum: "CheckedBag", "CarryOn", "PersonalItem", "Rebooking", "Refund", "SeatAssignment", "PremiumSeat", "LieFlatSeat", "Meals", "WiFi", "Other"

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion.AdditionalClassification` (array)
  Send one or more of the following values to return information about only the specified additional attributes. Supported values ChauffeurTransfer, ExtraLegroom, InFlightEntertainment, LoungeAccess, PriorityBaggage, PriorityBoarding, PriorityCheckIn, PrioritySecurity, PriorityServices, MileageAccrual, Upgrades, USB.

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.BrandAttributeInclusion.legSequence` (array)
  Leg sequence not supported for BrandAttributeInclusion.
  Example: [1,2]

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.SearchRepresentation` (string)
  Specifies either a journey or leg-based response. Journey returns offers for all legs of the itinerary. Journey is the default. Leg returns offers for only the first leg of the itinerary. Must be followed with a Next Leg Search to select an offer for the first leg and return offers on the subsequent leg to combine with it.Customize search result set as leg or journey based. Next Leg Search requests, and Flight Specific Search requests for less than the full itinerary, are supported only after a leg-based Search, not a journey-based Search. If these requests follow a journey-based Search request, an error message is returned.
  Enum: "Leg", "Journey", "LegWithJourneyData"

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.excludePenaltiesInd` (boolean)
  Indicator to omit change and cancel penalties. If true, omits all penalty information from the response. If false or omitted returns any change and penalty details provided by carrier for each offer in TermsAndConditionsFullAir/Penalties. Default is false. GDS only; not supported for NDC. excludePenaltiesInd can also be sent in the AirPrice request. If sent in Search but not in AirPrice, the value sent in Search is cached and applied to the AirPrice results. However, you can override the value sent in Search by sending excludePenaltiesInd in the AirPrice request with the opposite value. For example, if the Search request sends excludePenaltiesInd=true and the AirPrice request sends excludePenaltiesInd=false, the Search response does not return penalties and the AirPrice response does return penalties.If true, Penalties will be excluded from the response.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.excludeBaggageFeesInd` (boolean)
  Indicator to exclude baggage details. If true, excludes baggage fees, carry on fees, and embargo information from the response. Baggage quantity or weight is returned instead. If false or omitted, baggage details returned in response. Default is false. GDS only; not supported for NDC.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeFareCalculationInd` (boolean)
  Indicator to request the return of the fare calculation ladder. If true, returns the fare calculation ladder in BestCombinablePrice.PriceBreakdownAir.FareCalculation. If false or omitted, fare calculation ladder is not returned. Default is false. GDS only; not supported for NDC or in the Flight Specific Search full payload request.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.excludeSurchargesInd` (boolean)
  Indicator to exclude a surcharge breakdown. If true, excludes a surcharge breakdown from the response. Baggage quantity or kilos is returned instead. If false or omitted, surcharge breakdown returned in response. Default is false. GDS only; not supported for NDC.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.excludeUnbundledFaresInd` (boolean)
  Supported in Search and Price. Sets whether to return unbundled fares. If true, does not return unbundled fares. If false or omitted, returns unbundled and bundled fares as available. Default is false. GDS only, not supported for NDC.If true, unbundled fares will not be returned in the response
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeCO2EmissionsDataInd` (boolean)
  Indicator to return CO2 emission data in the Search and Next Leg Search responses. If true, returns CO2 emission data. If false or omitted CO2 emission data not returned. Default is false.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeFlightAmenitiesInd` (boolean)
  Indicator to return flight amenities from ATPCO RouteHappy data. If true, includes amenities in the response if available. If false or omitted, amenities are not returned in response. Default is false.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeUniversalProductAttributesInd` (boolean)
  Indicator to return universal product attributes (UPAs), which include images, icons, and URLs as provided by ATPCO. Must also send includeFlightAmenitiesInd=true. If true, returns universal product attributes if available. If false or omitted, Universal product attributes not returned. Default is false. UPAs are not returned for direct flights with intermediate stops, non-flight segments such as trains, or for Premium Business class.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeBundledAncillariesInd` (boolean)
  NDC only. If true, the search and price response will include bundled air and ancillary offerings/offers. Search and Price response will contain both ProductAir and ProductAncillary plus a new child class of PriceBreakdown: PriceBreakdownAncillaryAir to define the ancillary inclusion and pricing.
  Example: true

- `CatalogProductOfferingsRequest.CustomResponseModifiersAir.includeFullPenaltyDisclosureInd` (boolean)
  If true, penalty information sourced from ATPCO Cat 31 and 33 will be disclosed. Penalties may be exposed at fare component level and include time windows.

- `CatalogProductOfferingsRequest.numberOfDownsellsToReturn` (integer)
  Not supported. Use BrandOptions.
  Example: 2

- `CatalogProductOfferingsRequest.SearchType` (string)
  List of search types.
  Enum: "MetaSearch", "ProductSearch", "OfferSearch"

- `CatalogProductOfferingsRequest.inhibitBrandContentInd` (boolean)
  Deprecated. Not supported as part of Air Search request.
  Example: true

- `CatalogProductOfferingsRequest.detailViewInd` (boolean)
  Deprecated. Not supported as part of Air Search request.
  Example: true

- `CatalogProductOfferingsRequest.excludeMixedBrandsInd` (boolean)
  Deprecated. Not supported as part of Air Search request.
  Example: true

## Response 200 fields (application/json):

- `CatalogProductOfferingsResponse` (object)
  Top level object for Search response. Includes CatalogProductOfferings, Result, and ReferenceList.

- `CatalogProductOfferingsResponse.CatalogProductOfferings` (object, required)
  CatalogProductOfferings is the top level object that groups all the offers in the response. Each instance of CatalogProductOffering is one offer.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.@type` (string, required)
  Discriminator. Child classes CatalogProductOfferingsID and CatalogProductOfferings
  Example: "CatalogProductOfferings"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.id` (string)
  Local identifier within a given message for this object.
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.Identifier.value` (string)
  "Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
  When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
  For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value.
  Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
  Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.Identifier.authority` (string)
  "Name of the supplier system that created this identifier.
  For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
  For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
  Example: "TVPT"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering` (array)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.@type` (string, required)
  Discriminator classes CatalogProductOfferingID or CatalogProductOffering
  Example: "CatalogProductOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.id` (string)
  The internal id for the offers in this instance: for GDS, o1, o2, and so on. NDC identifiers incorporate the carrier code into these types of IDs: QF_COPO0, SQb5, AAt5, etc. Search merges offers for offers for the same itinerary at the same price from GDS and NDC sources. A merged offer returns a CatalogProductOffering/id value that combines the standard GDS and NDC id numbers. For example, if a GDS offer that has id 03 is merged with an NDC offer that has id UA_CPO0, the merged id is 03-UA_CPO0. See Merged GDS and NDC Offers (Content Curation Layer) in the Air Shopping Guide for details.
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.CatalogProductOfferingRef` (string)
  Not used. Allows referencing another instance of this object in the same message
  Example: "cpo_1"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.sequence` (integer)
  Indicates the order of this leg in the itinerary: 1 for the first leg, 2 for the second leg, 3 for the third leg of multi-city itineraries. (Search supports up to three legs.)
  Example: 1

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Departure` (string)
  IATA code for departure airport or city for this leg of the itinerary.
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Arrival` (string)
  IATA code for arrival airport or city for this leg of the itinerary.
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg` (array)
  FlextNextLeg is only returned for leg based search and identifies the O&D and/or date that the initial offering can be combined with.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.@type` (string, required)
  Example: "FlexNextLeg"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.Departure` (string)
  The departure location of the next leg option.
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.Arrival` (string)
  The arrival location of the next leg option.
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.FlexNextLeg.DepartureDate` (string)
  Departure date of the next leg option.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand` (array)
  Lists reference numbers for brands returned. Only one instance of Brand is returned if no upsells are returned for that offer.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.@type` (string, required)
  Discriminator. Child classes BrandID, Brand. BrandCompleteInfo is no longer in use
  Example: "BrandID"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.id` (string)
  Local id within a given message to support referencing this object.
  Example: "brand_001"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.BrandRef` (string)
  Reference id that corresponds to the brand 'id' in ReferenceListBrand.Brand.
  Example: "brandRef_001"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.Brand.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions` (array, required)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.@type` (string)
  Example: "ProductBrandOptions"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.flightRefs` (array)
  Reference to the Flights that are used within ProductBrandOptions. Returned for GDS offerings. Not supported for NDC.
  Example: ["s1","s2","s3"]

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes` (object)
  Coming soon. Contains marketing information for Sponsored Flight Options.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.@type` (string, required)
  Discriminator. No child classes.
  Example: "SponsoredFlightAttributes"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.positionNumber` (integer)
  The display position number of the sponsored option

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.adID` (string)
  The advertisement ID

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.trackingID` (string)
  Unique tracking ID for sponsored flights campaign required in end to end workflow.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.SponsoredFlightAttributes.sponsoredFlightInd` (boolean)
  If true, this option is a sponsored flight option.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering` (array, required)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.@type` (string, required)
  Discriminator. No child classes.
  Example: "ProductBrandOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Price` (object)
  Child class of Price. This includes all of the Price object plus the Pricebreakdown which gives detailed Price information per PTC or Hotel offering.
  For a Hotels Create Reservation (Full Payload) request, find the values to send in the Price objects from either Availability (returned in CatalogOffering/Price) or Rules (returned in Offer/Price). Although you can send the price returned in either API, the Rules pricing may be more accurate. If you sent a Rules request, send the value from that response. You must include CurrencyCode, Base, TotalTaxes, and TotalPrice. When returned from the previous steps, additionally send TermsAndConditionsFull, ProductRateCodeInfo, and RateCodeInfo.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Brand` (object, required)
  Brand ID parent class

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Product` (array, required)
  GDS Air Search returns one instance of Product. NDC may return multiple instances in the case of ancillary bundles.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.TermsAndConditions` (object)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.CombinabilityCode` (array)
  Code/s for the product/s on the other leg of the itinerary that can be combined with this product for the lowest available fare. See Combinable Codes and Best Combinable Price in the Air Search guide for details. For GDS only, a multi-city offer has jc in its CombinabilityCode, as in jc1, jc2. See multi-city offers with stopovers in the Air Search guides for details.
  Example: ["J1"]

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.BestCombinablePrice` (object)
  Price details for the full itinerary when this product is combined with any other product sharing a CombinabilityCode. For example, if p6 on the outbound and p24 on the inbound both have a CombinabilityCode value of j2, both products return the same BestCombinablePrice when combined for the itinerary. For a one-way itinerary, CombinabilityCode is returned for consistency but the value has no use and can be ignored. The pricing in BestCombinablePrice applies to the one-way itinerary. For NDC leg-based responses on carrier AA, the PriceBreakdown amount is approximate. Because AA returns only a journey-based response, Search must convert the response to a leg-based response. If the TotatlTaxes amount isn't divisible by the number of segments, the PriceBreakdown may not be accurate. However, accurate pricing will be returned in the AirPrice response.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.Desirability` (number)
  The desirability of the offering expressed as a percentage. The higher the percentage the more desirable the offering.
  Example: 25

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.MatchedAttributes` (integer)
  If ProductInclusionPreference.Classification was sent in the request, this returns the number of those requested attributes that are available for this fare.
  Example: 7

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.BrandStatus` (string)
  alerts when a given brand is sold out of not offered for the journey
  Enum: "NotOffered", "SoldOut"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.ContentSource` (string)
  Indicates the owner the offer or document.
  Enum: "GDS", "NDC", "LCC", "API"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.bestMatchInd` (boolean)
  If true, All brand attributes requested in ProductInclusionPreference.Classification are available for this fare.
  Example: true

- `CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.ProductBrandOptions.ProductBrandOffering.CO2EmissionsData` (object)
  Contains the CO2 emissions data. Returned in Search and Next Leg Search responses when requested in CustomResponseModifiersAir. If CO2 data is not available for a flight or route, only available data is returned and these objects may be returned blank. CO2 data is not returned for non-flight segments (equipment codes BUS, HOV, LCH, LMO, TRN, TRS). Actual and Typical carbon emissions for the flight are returned as a measurement. Type of measurement for CO2 emissions is 'weight'. Unit of measure for CO2 emissions is 'kilograms'.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering` (array)
  Not currently in use.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.@type` (string, required)
  Discriminator classes UpsellOfferingID and UpsellOffering
  Example: "UpsellOffering"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.id` (string)
  Local identifier within a given message for this object.

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.CatalogProductOfferingRef` (string)
  Used to reference another instance of this object in the same message

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.productRefs` (array)
  An unsolicited Offering, offered in conjunction with specified product(s)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.sequence` (integer)
  NumberDoubleDigit
  Example: 1

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Departure` (string)
  Departure location
  Example: "LHR"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Arrival` (string)
  Arrival location
  Example: "LAX"

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.Brand` (array)

- `CatalogProductOfferingsResponse.CatalogProductOfferings.UpsellOffering.ProductBrandOptions` (array, required)

- `CatalogProductOfferingsResponse.@type` (string)
  Example: "response"

- `CatalogProductOfferingsResponse.transactionId` (string)
  "A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
  Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"

- `CatalogProductOfferingsResponse.traceId` (string)
  "Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
  Example: "TraceID_123456"

- `CatalogProductOfferingsResponse.correlationId` (string)
  Identifier used to correlate hotel API invocations across a multi-call business flow.

- `CatalogProductOfferingsResponse.reservationStatus` (string)
  Status of reservation or offer completion.
  Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"

- `CatalogProductOfferingsResponse.Result` (object)
  Returns the error and/or warning message information, if applicable.

- `CatalogProductOfferingsResponse.Result.@type` (string)
  Discriminator class Result only
  Example: "Result"

- `CatalogProductOfferingsResponse.Result.status` (string)
  The status of an error or warning
  Enum: "Not processed", "Incomplete", "Complete", "Unknown"

- `CatalogProductOfferingsResponse.Result.Error` (array)
  A list of error information returned at the provider level for a response.

- `CatalogProductOfferingsResponse.Result.Error.@type` (string, required)
  Discriminator classes Error or ErrorDetail
  Example: "ErrorDetail"

- `CatalogProductOfferingsResponse.Result.Error.Message` (string)
  The Travelport standardized error or warning message
  Example: "No flights found."

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair` (array)

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.value` (string)
  Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
  Example: "Sunday"

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.id` (string)
  Optional internally referenced id
  Example: "6"

- `CatalogProductOfferingsResponse.Result.Error.NameValuePair.name` (string, required)
  Key, categorizing the of type of remark or error.
  Example: "Day1"

- `CatalogProductOfferingsResponse.Result.Error.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogProductOfferingsResponse.Result.Warning` (array)
  A list of warning information returned at the provider level for a response.

- `CatalogProductOfferingsResponse.Result.Warning.@type` (string, required)
  Discriminator classes Warning or WarningDetail
  Example: "WarningDetail"

- `CatalogProductOfferingsResponse.Result.Warning.Message` (string)
  The Travelport standardized error or warning message
  Example: "Customer Loyalty could not be applied."

- `CatalogProductOfferingsResponse.Result.Warning.NameValuePair` (array)

- `CatalogProductOfferingsResponse.Result.Warning.StatusCode` (integer)
  Http standard response code
  Example: 200

- `CatalogProductOfferingsResponse.Identifier` (object)
  A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).

- `CatalogProductOfferingsResponse.NextSteps` (object)
  Container for the steps that describe actions that may be taken on the containing object.

- `CatalogProductOfferingsResponse.NextSteps.baseURI` (string, required)
  The base portion of the uri in order to shorten the uris in the individual steps

- `CatalogProductOfferingsResponse.NextSteps.id` (string)
  Optional internally referenced id
  Example: "5"

- `CatalogProductOfferingsResponse.NextSteps.NextStep` (array, required)

- `CatalogProductOfferingsResponse.NextSteps.NextStep.value` (string)
  Example: "www.resourcelocation.com"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.id` (string)
  Identifier for the Next Step
  Example: "2"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.action` (string, required)
  The action this next step is intended to achieve
  Example: "cancel"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.method` (string, required)
  Describes the set of potential methods that can be taken after an operation.
  Enum: "GET", "DELETE", "PUT", "POST"

- `CatalogProductOfferingsResponse.NextSteps.NextStep.description` (string)
  Additional clarification for the next step
  Example: "remove offer from the order"

- `CatalogProductOfferingsResponse.ReferenceList` (array)

- `CatalogProductOfferingsResponse.ReferenceList.@type` (string, required)
  Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
  Example: "ReferenceListFlight"

- `CatalogProductOfferingsResponse.ReferenceList.id` (string)
  Uniquely identifies for the Reference List

- `CatalogProductOfferingsResponse.CurrencyRateConversion` (array)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.@type` (string)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.value` (string)
  An ISO 4217 currency code.
  Example: "USD"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
  Currency code authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
  Number of decimal places for the currency.
  Example: 4

- `CatalogProductOfferingsResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
  Currency code decimal authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.TargetCurrency` (object, required)
  Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world.
  For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate` (object, required)
  Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.value` (number)

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
  Contextual rate authority
  Example: "ISO 4217"

- `CatalogProductOfferingsResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
  Rate as of
  Example: "2026-08-07 12:12:00+00:00"

- `CatalogProductOfferingsResponse.Pagination` (object)
  Pagination object used when result sets span across a number of pages.

- `CatalogProductOfferingsResponse.Pagination.@type` (string, required)
  Example: "Pagination"

- `CatalogProductOfferingsResponse.Pagination.page` (integer, required)
  The current page number of the full result set
  Example: 1

- `CatalogProductOfferingsResponse.Pagination.pageSize` (integer, required)
  The total number of items on this page
  Example: 20

- `CatalogProductOfferingsResponse.Pagination.totalPages` (integer, required)
  The total number of pages in this result set
  Example: 5

- `CatalogProductOfferingsResponse.Pagination.totalItems` (integer, required)
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
