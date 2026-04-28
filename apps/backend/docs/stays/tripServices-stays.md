# TripServices Stays

The TripServices Stay v11 APIs are a robust, flexible set of RESTful JSON endpoints that empower developers to build seamless, beautiful hotel booking experiences with global reach and real-time data. Built for developers, our APIs are designed to integrate easily into your applications, enabling you to build rich, responsive hotel booking interfaces tailored to your users.

Version: 11.33.0

## Servers

```
https://api.pp.travelport.net/11
```

```
https://api.travelport.net/11
```

## Security

### bearerAuth

Bearer authentication using a JSON Web Token (JWT). The token must be sent in the Authorization header using the format: `Authorization: Bearer <token>`.

Type: http
Scheme: bearer
Bearer Format: JWT

## Download OpenAPI description

[TripServices Stays](https://developer.travelport.com/_bundle/apis/stays/@11.33/index.yaml)

## Search and Details

Hotel searches.

### Return hotel details.

 - [GET /hotel/search/propertiesdetail](https://developer.travelport.com/apis/stays/search-and-details/getpropertiesdetail.md): The Hotel Details request retrieves, for a specified property, a additional property-level information such as description and images provided by the supplier. It is an optional request and does not need to be preceded by a Hotel Search request.

### Search hotels by location.

 - [POST /hotel/search/properties/search](https://developer.travelport.com/apis/stays/search-and-details/paths/~1hotel~1search~1properties~1search/post.md): The Search by Location request searches for hotels by any one of these: 1) geographic coordinates, 2) address, 3) IATA airport code, or 4) IATA city code. Although you can search by various criteria, all responses return results in the same format. The response returns up to 100 properties, or all available properties if less than 100. If more than 100 properties matching the search criteria are available, you can request the next page of results with the Search Pagination API.

### Search hotels by property ID.

 - [POST /hotel/search/properties](https://developer.travelport.com/apis/stays/search-and-details/create.md): The Search by ID request searches for specific hotels by their property ID. You can send up to 250 property IDs. The response returns a list of properties based on the ID/s sent. The Search by ID response format is the same as for Search by Location. The response returns up to 100 properties, or all requested properties if less than 100. If more than 100 properties were requested and are available, you can request the next page with the Search Pagination API.

### Return additional search results (pagination).

 - [GET /hotel/search/properties/{identifier}](https://developer.travelport.com/apis/stays/search-and-details/getpropertiespage.md): Return additional search results. The v11 hotel search APIs (Search by Location and Search by ID) use pagination by default. Search responses return up to 100 properties in the initial response, or all available properties if fewer than 100. The search response notes the total number of properties found and includes an identifier to be used for retrieving additional pages. If the search response indicates that more than 100 properties are available, you can use this Search Pagination request to retrieve each additional page of 100 properties until all available properties have been retrieved.

## Availability

Hotel availability and pagination.

### Return hotel availability.

 - [POST /hotel/availability/catalogofferingshospitality](https://developer.travelport.com/apis/stays/availability/createhotelavailability.md): Hotel Availability returns room types and rates available at one or more specified properties on specified dates.

### Return additional availability results (pagination).

 - [GET /hotel/availability/catalogofferingshospitality/{identifier}](https://developer.travelport.com/apis/stays/availability/gethotelavailabilitypage.md): Return additional availability results. The Hotel Availability response uses pagination by default. The response notes the total number of rates found and, if greater than 100, also returns a pagination identifier that can be used for retrieving additional pages of results using this Availability Pagination request. You can send an Availability Pagination request to retrieve each additional page of 100 rates until all available rates have been retrieved. NOTE: Availability results are cached for 30 minutes. You cannot retrieve additional results from that Availability response after it expires.

## Rules

Reference payload and full payload hotel rules.

### Return hotel rules (reference payload).

 - [POST /hotel/rules/offershospitality/buildfromcatalogoffering](https://developer.travelport.com/apis/stays/rules/buildhotelrulesfromcatalogoffering.md): Available January 2023. Hotel Rules retrieves the rules associated with a specific rate. The reference payload references an offer by sending the unique offer ID from an Availability response, instead of sending all required offer details as in the full payload Rules request. The response for both the reference and full payload is the same.

### Return hotel rules (full payload).

 - [POST /hotel/rules/offershospitality/buildfromrequest](https://developer.travelport.com/apis/stays/rules/createhotelrules.md): Hotel Rules retrieves the rules associated with a specific rate. The full payload request in this topic sends all required rate details, while the reference payload Rules request references rate details from a previous Availability response by sending the offer ID from that response. The response for both the reference and full payload is the same.

## Reservations

Create, modify and cancel hotel reservations.

### Create Reservation (Full Payload) or Sync Hotel Reservation

 - [POST /hotel/book/reservations](https://developer.travelport.com/apis/stays/reservations/createhotelreservation.md): Use the Create Reservation Full Payload request to book a room by sending complete stay details and the booking code from the Availability response, along with traveler, form of payment, and payment information. NOTE: Availability results are stored in cache for 30 minutes. If the offers expire before you create a reservation, you must send a new request before booking. The Create Reservation Full Payload response uses the same format as the reference payload response. The only difference is that the Reference Payload response returns Reservation/id, which is the offer ID sent in that request. The full payload response does not return this information.
Note for Multi-room sell requests- when making a reservation, Travelport attempts to sell the number of rooms requested; however, the supplier may not be able to accommodate the total number of rooms. Each room sold creates a unique hotel segment on the Travelport reservation. A traveler name is associated with each room with these limitations: If the number of rooms requested is equal to the number of traveler names in the request, each room is associated with a unique traveler name. If the number of rooms requested is not equal to the number of traveler names in the request, all rooms are associated with the first traveler name.
Note for query parameters- Hotel APIs that create a new reservation or add to an existing one verify the reservation request with the guarantee type and price returned in preceding workflow steps. If there is any difference, the API does not yet create the reservation but instead returns an error to notify about the change.  To accept the change, send the request a second time with the applicable query parameter/s (acceptPriceChangeInd and/or acceptGuaranteeChangeInd). Do not send either of these query parameters in the initial request.  If you do not want to proceed with the booking because of the changes, you are not required to send a second booking request with the false value(s). You can simply let these offers expire.
Use the Sync Reservation request to synchronize a Booking.com hotel reservation to a Travelport PNR whenever specific sell failures occur. The Sync Reservation request is a scaled down re-try of a previous Create or Add Reservation request that adds to the original sell request the Traveler email address and the Booking.com booking information. The Sync message attempts to add the reservation information into a Travelport reservation as a standard aggregator segment but without re-selling the segment in the aggregator system. Booking.com requires the traveler email address in a hotel sell request. If the sell completes in the Booking.com system, the traveler receives a confirmation email containing information needed to synchronize the Travelport booking if the user receives one of two specific error messages on the original sell attempt. The Sync Reservation response returns all available data for the reservation using the same structure as the Create Reservation response.

### Create hotel reservation (Reference payload).

 - [POST /hotel/book/reservations/build](https://developer.travelport.com/apis/stays/reservations/buildhotelreservation.md): Use the Create Reservation Reference Payload request to book a room using a cached offer from either a preceding Availability or SearchComplete response. The reference payload request sends an offer ID plus traveler details and both form of payment and payment information. NOTE: Results from Availability and SearchComplete are stored in cache for 30 minutes. If the offers expire before you create a reservation, you must send a new request before booking. The Create Reservation Full Payload response uses the same format as the Reference Payload response. The only difference is that the reference payload response returns Reservation/id, which is the offer ID sent in that request. The full payload response does not return this information."
Note for query parameters- Hotel APIs that create a new reservation or add to an existing one verify the reservation request with the guarantee type and price returned in preceding workflow steps. If there is any difference, the API does not yet create the reservation but instead returns an error to notify about the change.  To accept the change, send the request a second time with the applicable query parameter/s (acceptPriceChangeInd and/or acceptGuaranteeChangeInd). Do not send either of these query parameters in the initial request.  If you do not want to proceed with the booking because of the changes, you are not required to send a second booking request with the false value(s). You can simply let these offers expire.

### Retrieve hotel reservation.

 - [GET /hotel/book/reservations/{Identifier}](https://developer.travelport.com/apis/stays/reservations/retrievehotelreservation.md): The Retrieve Hotel Reservation API returns all existing data on a reservation. You may retrieve details about a held booking or PNR. While a PNR refers to a held booking that has not been ticketed, the PNR code persists after ticketing to provide the booking records. Once a PNR has been ticketed, you can still use Retrieve to return both booking and ticketing details. A Ticket Display request can also be used to retrieve any ticketed itinerary.

### Modify existing hotel reservation.

 - [PUT /hotel/book/reservations/{Identifier}](https://developer.travelport.com/apis/stays/reservations/updatehotelreservation.md): Use Modify Hotel Reservation to modify specific data on an existing booking. Modify Hotel supports changes to the following data: 1) Dates of reservation, if allowed by supplier; note that a change in price may occur, 2) Form of payment details, 3) Specific details of the traveler associated with a booking as follows: a) Changing the given name and/or surname to that of another traveler currently on the reservation; other name changes are not supported, b) Telephone number, c) Email address, and/or d) Adding new comments. NOTE: Booking.com does not support modify capabilities. You cannot modify reservations made from Booking.com content. NOTE: When changing dates for a reservation sold through Travelport, best practice is to first send an Availability request for the new dates and look for the same booking code that is on the existing reservation. Although an Availability request is not mandatory, the Modify request will fail if the new dates are not available.  Add Hotel Reservation allows you to add another hotel room to an existing reservation. The full payload request sends complete offer details and the booking code from a preceding Availability request. Reference payload request sends a cached offer ID from a preceding Availability response. It requires both a preceding search (either by location or by ID) request and an Availability request, or a SearchComplete request.

### Cancel hotel reservation.

 - [PUT /hotel/book/reservations/{reservationIdentifier}/canceloffer](https://developer.travelport.com/apis/stays/reservations/cancelhoteloffer.md): The Cancel Hotel Reservation API cancels an existing hotel reservation.

### Create passive hotel reservation

 - [POST /hotel/book/reservations/passive](https://developer.travelport.com/apis/stays/reservations/createhotelpassivereservation.md): Create Passive Reservation creates a new booking with a hotel segment booked outside the Travelport GDS, called a passive segment. This allows the booking to include complete travel details. Passive hotel segments are confirmed with a status code of MK, which is returned in the response in Receipt/OfferStatus/code. A status code of AK is used for placeholder-only passive segments. A passive hotel segment is any segment that is booked using anything other than the JSON APIs or another product that uses the Travelport GDS. (A passive hotel segment is any segment that is booked using anything other than a product that uses the Travelport GDS. Passive segments are informational only. They do not result in a reservation or a change in inventory. Information on a passive segment is not received from or passed to the hotel supplier. Instead, passive segments provide a way to consolidate all booking information, including details from direct hotel bookings or even phone reservations.)

### Add passive reservation to a booking.

 - [PUT /hotel/book/reservations/{reservationIdentifier}/passive](https://developer.travelport.com/apis/stays/reservations/addpassiveoffer.md): Use the Add Passive Reservation request to add a passive hotel booking segment to an existing reservation. You can add either of two types of passive segments to an existing reservation: 1) Sending full details of the room in the request adds a single hotel segment with a status of MK (confirmed passive) to the reservation, or, 2) Sending only dates in the request, which adds a placeholder segment to the reservation. You may want to add a placeholder if you do not have all booking details. Or, you can send only dates to add a dummy or retention segment, which can be used to keep the reservation details active in the system after travel is complete, up to the dates on the passive segment. Placeholder segments return a status of AK. (A passive hotel segment is any segment that is booked using anything other than a product that uses the Travelport GDS. Passive segments are informational only. They do not result in a reservation or a change in inventory. Information on a passive segment is not received from or passed to the hotel supplier. Instead, passive segments provide a way to consolidate all booking information, including details from direct hotel bookings or even phone reservations.)

### Modify passive hotel reservation.

 - [PUT /hotel/book/reservations/{reservationIdentifier}/passiveupdate](https://developer.travelport.com/apis/stays/reservations/updatepassiveoffer.md): Use Modify Passive Reservation to update any parameter within an MK passive hotel booking segment of an existing reservation. MK designates a confirmed passive segment, while AK is used for placeholder-only segments. (A passive hotel segment is any segment that is booked using anything other than a product that uses the Travelport GDS. Passive segments are informational only. They do not result in a reservation or a change in inventory. Information on a passive segment is not received from or passed to the hotel supplier. Instead, passive segments provide a way to consolidate all booking information, including details from direct hotel bookings or even phone reservations.)
