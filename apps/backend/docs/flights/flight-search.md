# TripServices Flights

The TripServices Flights API collection supports rapid development of high-performing travel solutions. The Air APIs connect you to comprehensive air content and facilitate multi-channel development across web and mobile platforms. All requests are RESTful and support JSON. For information on how Travelport uses polymorphism in our APIs please see documentation available https://support.travelport.com/webhelp/JSONAPIs/Airv11/GeneralProject/Polymorphism.htm

Version: 11.33.0

## Servers

SwaggerHub API Auto Mocking

```
https://virtserver.swaggerhub.com/TravelportAPI/TPAirExchangeAncillaries/11.33.0
```

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

[TripServices Flights](https://developer.travelport.com/_bundle/apis/flights/@11.33/index.yaml)

## Searches

Air searches.

### Air Availability

- [POST /air/search/airAvailability](https://developer.travelport.com/apis/flights/searches/createairavailability.md): Air Availability returns scheduled flights between a specified city pair on a specified day and time and indicates whether seats are available on those flights. Air Availability is a full payload request that focuses on seat availability by class of service. It does not return pricing information. GDS only; not supported for NDC.

### Search

- [POST /air/catalog/search/catalogproductofferings](https://developer.travelport.com/apis/flights/searches/createairsearch.md): The Search API returns offers for flights between specific origin and destination (O&D) pairs. You can set the Search request to return offers for the full itinerary (a journey-based search), or for only the first leg (a leg-based search) and follow it with a Next Leg Search. Any modifiers or indicators sent in the Search request carry over to the Next Leg Search request and are not re-sent.

### Next Leg Search

- [POST /air/catalog/search/catalogproductofferings/buildnext](https://developer.travelport.com/apis/flights/searches/buildnextairsearch.md): The Next Leg Search API returns offers for the next leg of an itinerary after a leg-based round-trip Search. The leg-based Search response returns offers for the outbound leg of the itinerary, and Next Leg Search is then required to return offers for the next leg of the trip. For a multi-city itinerary, send an additional Next Leg Search request for each remaining leg. GDS supports searching for up to six O&D pairs (legs of the itinerary) while NDC supports three O&D pairs. Next Leg Search is supported only after a leg-based Search. If sent after a journey-based Search, an error message is returned. Any modifiers or indicators sent in the Search request carry over to the Next Leg Search request and are not re-sent. The Next Leg Search response uses the same structure and returns the same objects as the Search response. The only differences are, the first instance of CatalogProductOffering is the offer and product sent in the Next Leg Search request. This is the selected offer and product for the first leg. Subsequent instances of CatalogProductOffering are offers for the second leg.

### Flight Specific Search

- [POST /air/catalog/search/catalogproductofferings/buildoptions](https://developer.travelport.com/apis/flights/searches/buildoptionsairsearch.md): The Flight Specific Search API Reference Payload request returns additional upsells, up to 99, for any product/s returned by Search or Next Leg Search. The reference payload sends an identifier referencing a previous response and the offer and product identifiers. The full payload request does not reference a previous Search response. GDS only, not supported for NDC. Any CabinPreference in the initial Search request is applied to any subsequent Next Leg Search and reference Flight Specific Search requests. To use the Flight Specific Search reference payload request, your initial Search request must send offersPerPage to invoke caching if that Search was journey-based (leg-based search results are always cached). The Flight Specific Search response uses the same structure and returns the same objects as the Search response. The differences are, One instance of CatalogProductOffering (id o1) is returned for each offer sent in the request. One instance of ReferenceListProduct/Product is returned for each product sent in the request.

### Premium flex search

- [POST /air/catalog/search/catalogproductofferings/premiumflex](https://developer.travelport.com/apis/flights/searches/createflexsearch.md): The Premium Flex Search API is the first step in the travel booking workflow. Send a Search request to return offers for flights between the selected cities

## Pricing and Fare Rules

Air pricing, fare rules, and fare display.

### AirPrice reference payload

- [POST /air/price/offers/buildfromcatalogproductofferings](https://developer.travelport.com/apis/flights/pricing-and-fare-rules/offerbuildfromcatalogproductofferings.md): The AirPrice API confirms pricing on air search results. While air pricing is generally an optional but recommended step, it is required for low cost carriers and some NDC carriers. This API uses a reference payload request, which sends identifiers from the Search API response. To use the AirPrice reference payload request, your initial Search request must send offersPerPage to invoke caching if that Search was journey-based (leg-based search results are always cached).

### AirPrice full payload

- [POST /air/price/offers/buildfromproducts](https://developer.travelport.com/apis/flights/pricing-and-fare-rules/offerbuildfromproducts.md): The AirPrice API confirms pricing on air search results. While air pricing is generally an optional but recommended step, it is required for low cost carriers and some NDC carriers.

### Fare rules for existing reservation (after booking)

- [GET /air/farerule/farerules/fromreservation](https://developer.travelport.com/apis/flights/pricing-and-fare-rules/getrulesfromreservation.md): Fare rules are the conditions and restrictions that apply to any booking based on its fare type. These determine the price of the fare. Generally, less expensive fares have more restrictions and more expensive fares have fewer restrictions. Fare rules can include blackout dates, advanced reservation requirements, minimum and maximum stay requirements, and cancellation and change penalties.

### Fare rules after AirPrice

- [GET /air/farerule/farerules/fromoffer](https://developer.travelport.com/apis/flights/pricing-and-fare-rules/getrulesfromoffer.md): Fare rules are the conditions and restrictions that apply to any booking based on its fare type. These determine the price of the fare. Generally, less expensive fares have more restrictions and more expensive fares have fewer restrictions. Fare rules can include blackout dates, advanced reservation requirements, minimum and maximum stay requirements, and cancellation and change penalties.

### Fare rules after AirSearch

- [GET /air/farerule/farerules/fromcatalogproductofferings](https://developer.travelport.com/apis/flights/pricing-and-fare-rules/getrulesfromcatalogproductofferings.md): Fare rules are the conditions and restrictions that apply to any booking based on its fare type. These determine the price of the fare. Generally, less expensive fares have more restrictions and more expensive fares have fewer restrictions. Fare rules can include blackout dates, advanced reservation requirements, minimum and maximum stay requirements, and cancellation and change penalties.

### Fare rules after Fare Display

- [GET /air/farerule/farerules/fromfaredisplay](https://developer.travelport.com/apis/flights/pricing-and-fare-rules/getfromfaredisplay.md): Fare rules are the conditions and restrictions that apply to any booking based on its fare type. These determine the price of the fare. Generally, less expensive fares have more restrictions and more expensive fares have fewer restrictions. Fare rules can include blackout dates, advanced reservation requirements, minimum and maximum stay requirements, and cancellation and change penalties.

## Seats Ancillaries EMDs

Seat map, book and cancel. Ancillary search, book, and cancel. EMD retrieve and void.

### Seat Map

- [POST /air/search/seat/catalogofferingsancillaries/seatavailabilities](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/createseatavailability.md): The Seat Map request returns seat availability for both free and paid seats. It is a reference payload that sends identifiers from a previous transaction or a booking. You can send the Seat Map request at several places in the JSON APIs workflow - after searching, after pricing, during booking, and after booking. The Seat Map request uses the same endpoint but a different message payload depending on where in the workflow it is sent. See the supported workflow options in the Seats Guide. All Seat Map requests allow you to request seat maps for any of the following: All flights within an offer (all flights on the itinerary). All flights within a product (all flights on one leg of an itinerary). One or more individual flights. Standalone Seat Map sends flight criteria including a booking code to return a view-only seat map. Unlike the Seat Map request, Standalone Seat Map does not send any identifiers from a previously searched or priced flight. It is instead a full payload request and can be sent entirely on its own, either within or outside of a workbench session.

### Ancillary Price (NDC only)

- [POST /air/ancillaryprice/offers/buildancillaryoffersfromcatalogofferings](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/buildancillaryoffersfromcatalogofferings.md): The Ancillary Price request confirms pricing request searches for a selected ancillary. You must first create a new or post-commit workbench and send an Ancillary Shop request. After pricing, add the selected ancillary to the workbench

### Ancillary Shop

- [POST /air/ancillaryshop/catalogofferingsancillaries](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/createancillarysearch.md): The Ancillary Shop request searches for ancillaries available for the Reservation. You must first create a new or post-commit workbench. After ancillary shop, send an ancillary price request (only for NDC), and then add the selected ancillary to the workbench.

### NDC Refund Quote and Seat/Ancillary cancel

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/canceloffer](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/cancelworkbenchoffer.md): The NDC Refund Quote API determines what if any refund value may be available on a ticket. It is part of the NDC cancel workflow: Create a workbench session, send Refund Quote as detailed here, and send Cancel to cancel the ticket and issue any refund. For supporting NDC carriers only, you can cancel only specified segments in Refund Quote instead of the entire itinerary. In this case, the ticket value is retained at Cancel.Refund Quote is mandatory when canceling a ticket outside the void period and there is any difference between a refund due and the purchase price. If Refund Quote is not sent, and a refund is not available for the exact amount of the purchase price, Cancel returns the error message OFFER CANNOT BE CANCELED WHEN REFUND AMOUNT DOES NOT EQUAL OFFER PRICE. PERFORM A REFUND QUOTE AND TRY AGAIN. The Ancillary Cancel API supports canceling baggage and/or paid seats for both GDS and NDC, and canceling non-baggage ancillaries for NDC. Canceling non-baggage ancillaries for GDS is not supported. Ancillary Cancel must be sent in a workbench session: Create a workbench, send Ancillary Cancel, and commit the workbench. You can cancel ancillaries booked in the same or a previous session. Seat and ancillary cancel support varies in the booking workflow. See the Seats Guide and Ancillary Guide for support details. Only one paid seat per workbench session can be canceled. To cancel multiple seats, send one cancel request, commit the workbench, and start a new workbench to cancel the next seat. For paid bags, you can send multiple cancel requests in a post-commit workbench session. You cannot cancel ancillaries or seats from a ticketed itinerary.

### Seat/Ancillary book

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildancillaryoffersfromcatalogofferings](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/workbenchbuildancillaryoffersfromcatalogofferings.md): The Ancillary Book request adds a selected ancillary or a paid seat to the new or post-commit workbench. For ancillaries, first send an Ancillary Shop request and an Ancillary Price request (NDC only). After adding an ancillary to the workbench, you must also issue an EMD for the selected ancillary per the Ancillary and EMD Guide. For paid seats, you must first create a workbench and send a Seat Map request.

### EMD retrieve

- [GET /air/emds/getbylocator](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/emdgetbylocator.md): Not currently implemented.

### EMD Display

- [GET /air/emds/{Identifier}](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/getemd.md): Display an EMD to retrieve EMD details such as the amount paid and agency ticketing information. EMD Display not supported for NDC. EMD details for NDC are returned in the Reservation Retrieve.

### EMD Void

- [PUT /air/emds/{Identifier}](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/updateemd.md): Void an EMD to cancel it. You can also use EMD void with the GDS exchange APIs to refund an EMD back to the original FOP. See the Exchange, Refund, and Void Guide. EMD Void not supported for NDC.

### NDC Refund Quote and Seat/Ancillary cancel

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/canceloffer](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/cancelworkbenchoffer.md): The NDC Refund Quote API determines what if any refund value may be available on a ticket. It is part of the NDC cancel workflow: Create a workbench session, send Refund Quote as detailed here, and send Cancel to cancel the ticket and issue any refund. For supporting NDC carriers only, you can cancel only specified segments in Refund Quote instead of the entire itinerary. In this case, the ticket value is retained at Cancel.Refund Quote is mandatory when canceling a ticket outside the void period and there is any difference between a refund due and the purchase price. If Refund Quote is not sent, and a refund is not available for the exact amount of the purchase price, Cancel returns the error message OFFER CANNOT BE CANCELED WHEN REFUND AMOUNT DOES NOT EQUAL OFFER PRICE. PERFORM A REFUND QUOTE AND TRY AGAIN. The Ancillary Cancel API supports canceling baggage and/or paid seats for both GDS and NDC, and canceling non-baggage ancillaries for NDC. Canceling non-baggage ancillaries for GDS is not supported. Ancillary Cancel must be sent in a workbench session: Create a workbench, send Ancillary Cancel, and commit the workbench. You can cancel ancillaries booked in the same or a previous session. Seat and ancillary cancel support varies in the booking workflow. See the Seats Guide and Ancillary Guide for support details. Only one paid seat per workbench session can be canceled. To cancel multiple seats, send one cancel request, commit the workbench, and start a new workbench to cancel the next seat. For paid bags, you can send multiple cancel requests in a post-commit workbench session. You cannot cancel ancillaries or seats from a ticketed itinerary.

## NDC Modify Cancel Exchange

NDC modify and cancel flows.

### NDC Refund Quote and Seat/Ancillary cancel

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/canceloffer](https://developer.travelport.com/apis/flights/seats-ancillaries-emds/cancelworkbenchoffer.md): The NDC Refund Quote API determines what if any refund value may be available on a ticket. It is part of the NDC cancel workflow: Create a workbench session, send Refund Quote as detailed here, and send Cancel to cancel the ticket and issue any refund. For supporting NDC carriers only, you can cancel only specified segments in Refund Quote instead of the entire itinerary. In this case, the ticket value is retained at Cancel.Refund Quote is mandatory when canceling a ticket outside the void period and there is any difference between a refund due and the purchase price. If Refund Quote is not sent, and a refund is not available for the exact amount of the purchase price, Cancel returns the error message OFFER CANNOT BE CANCELED WHEN REFUND AMOUNT DOES NOT EQUAL OFFER PRICE. PERFORM A REFUND QUOTE AND TRY AGAIN. The Ancillary Cancel API supports canceling baggage and/or paid seats for both GDS and NDC, and canceling non-baggage ancillaries for NDC. Canceling non-baggage ancillaries for GDS is not supported. Ancillary Cancel must be sent in a workbench session: Create a workbench, send Ancillary Cancel, and commit the workbench. You can cancel ancillaries booked in the same or a previous session. Seat and ancillary cancel support varies in the booking workflow. See the Seats Guide and Ancillary Guide for support details. Only one paid seat per workbench session can be canceled. To cancel multiple seats, send one cancel request, commit the workbench, and start a new workbench to cancel the next seat. For paid bags, you can send multiple cancel requests in a post-commit workbench session. You cannot cancel ancillaries or seats from a ticketed itinerary.

### Reservation Cancel

- [POST /air/receipt/reservations/{ReservationResource_Identifier}/receipts](https://developer.travelport.com/apis/flights/modify-bookings/cancelreservation.md): Create a set of offer cancellation receipts for every offer in the reservation.

### NDC Refund Quote and Seat/Ancillary cancel

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/canceloffer](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/cancelworkbenchoffer.md): The NDC Refund Quote API determines what if any refund value may be available on a ticket. It is part of the NDC cancel workflow: Create a workbench session, send Refund Quote as detailed here, and send Cancel to cancel the ticket and issue any refund. For supporting NDC carriers only, you can cancel only specified segments in Refund Quote instead of the entire itinerary. In this case, the ticket value is retained at Cancel.Refund Quote is mandatory when canceling a ticket outside the void period and there is any difference between a refund due and the purchase price. If Refund Quote is not sent, and a refund is not available for the exact amount of the purchase price, Cancel returns the error message OFFER CANNOT BE CANCELED WHEN REFUND AMOUNT DOES NOT EQUAL OFFER PRICE. PERFORM A REFUND QUOTE AND TRY AGAIN. The Ancillary Cancel API supports canceling baggage and/or paid seats for both GDS and NDC, and canceling non-baggage ancillaries for NDC. Canceling non-baggage ancillaries for GDS is not supported. Ancillary Cancel must be sent in a workbench session: Create a workbench, send Ancillary Cancel, and commit the workbench. You can cancel ancillaries booked in the same or a previous session. Seat and ancillary cancel support varies in the booking workflow. See the Seats Guide and Ancillary Guide for support details. Only one paid seat per workbench session can be canceled. To cancel multiple seats, send one cancel request, commit the workbench, and start a new workbench to cancel the next seat. For paid bags, you can send multiple cancel requests in a post-commit workbench session. You cannot cancel ancillaries or seats from a ticketed itinerary.

### NDC Reshop

- [POST /air/change/catalogofferingsairchange](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/createndcexchangesearch.md): NDC only; not supported for GDS. The Reshop API searches for a new itinerary when modifying a held booking or exchanging a ticket for NDC. Reshop is part of the NDC modify/exchange workflow. Create a post-commit workbench, Reshop as detailed here, Reprice to confirm pricing, and commit the workbench to confirm the changes.

### Modify

- [POST /air/modify/reservations/{Identifier}](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/ndcmodifyreservation.md): After all required changes any optional steps in a booking workbench session, send a POST request with the workbench identifier to commit the order changes in the workbench.

### Reservation Cancel

- [POST /air/receipt/reservations/{ReservationResource_Identifier}/receipts](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/cancelreservation.md): Create a set of offer cancellation receipts for every offer in the reservation.

### NDC reprice

- [POST /air/reprice/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromcatalogofferings](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/workbenchndcbuildfromcatalogofferings.md): Use the Add Offer reference payload request to add an offer to the reservation workbench as part of the booking workflow. The reference payload request sends identifiers from the Search response instead of full itinerary details. NDC supports only the reference payload. For GDS, you can send either a reference payload or a full payload.

### Standalone reprice

- [POST /air/reprice/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromoffer](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/repricebuildfromoffer.md): NDC only; not supported for GDS. Not supported for all NDC carriers. Use the Standalone Reprice API to reprice an itinerary on a held booking for NDC. Standalone Reprice can be sent before or after the price guarantee expires. This request would typically be used to check if the price has changed before issuing a ticket. You can then either ticket the itinerary or hold the booking again. Standalone Reprice must be sent in a workbench session. It must be followed by a Modify request to commit the workbench and either ticket or hold the itinerary. If you want to ticket at Modify, send Form of Payment and Payment before Modify. For supporting NDC carriers, see 'Reprice a Booking' in the Deferred Payment section in NDC capabilities by airline through JSON API in the Travelport Knowledge Base.

### Cancel payment

- [POST /air/paymentoffer/reservationworkbench/{ReservationResource_Identifier}/payments/{id}](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/cancelpayment.md): NDC only; not supported for GDS. Supported only for Qantas (QF). For NDC on supporting carriers only, you can use the Cancel Payment API to cancel the payment on a ticket. This refunds the payment, cancels the ticket but retains the itinerary, and creates a held booking for later fulfillment. For example, you might want to use this workflow to use a different payment method than was sent in ticketing. You must establish a workbench session before sending the Cancel Payment request detailed here. After sending Cancel Payment, you must commit the workbench to implement the change.

## Workbench Actions

Create, manage, and commit workbench sessions.

### New workbench

- [POST /air/book/session/reservationworkbench](https://developer.travelport.com/apis/flights/workbench-actions/createreservationworkbench.md): Use this request to initiate a workbench for a new reservation. This prerequisite step for booking creates the workbench session in which all booking details are added together to create a PNR at commit.

### Post commit workbench

- [POST /air/book/session/reservationworkbench/buildfromlocator](https://developer.travelport.com/apis/flights/workbench-actions/createreservationworkbenchfromlocator.md): Initiate a post-commit workbench to create a session for ticketing or updating an existing reservation. This is a prerequisite step for any transaction that modifies, updates, or tickets any PNR.

### Cancel workbench items

- [POST /book/reservationworkbench/{ReservationResource_Identifier}/reservations/cancelitems](https://developer.travelport.com/apis/flights/workbench-actions/cancelworkbenchitems.md): Cancel one or more offers or unpriced segments within the workbench. Offer types including air, hotel, vehicle. Ancillaries associated to air segments will by default cancel when the air segment is cancelled. Some restrictions on NDC and non-GDS hotel content apply.

### Retrieve workbench.

- [GET /air/book/session/reservationworkbench/{Identifier}](https://developer.travelport.com/apis/flights/workbench-actions/retrievereservationworkbench.md): At any point in the booking session, you can retrieve the workbench. The response returns all details added to the workbench at that point.

### Discard workbench

- [DELETE /air/book/session/reservationworkbench/{Identifier}](https://developer.travelport.com/apis/flights/workbench-actions/ignorereservationworkbench.md): At any point in a booking or ticketing workflow, if necessary, you can discard the workbench and any information in it.

### Workbench commit

- [POST /air/book/reservation/reservations/{Identifier}](https://developer.travelport.com/apis/flights/workbench-actions/commitreservation.md): After all required and any optional steps in a booking workbench session, send a POST request with the workbench identifier to commit the workbench. The resulting actions depend on whether payment is present in the workbench. If no Add Payment request has been sent, committing the workbench books the itinerary and generates a PNR. If an Add Payment request has not been sent, committing the workbench tickets the itinerary and generates ticket number/s.

### Post commit workbench

- [POST /air/book/session/reservationworkbench/buildfromlocator](https://developer.travelport.com/apis/flights/ticketing/createreservationworkbenchfromlocator.md): Initiate a post-commit workbench to create a session for ticketing or updating an existing reservation. This is a prerequisite step for any transaction that modifies, updates, or tickets any PNR.

### Workbench commit

- [POST /air/book/reservation/reservations/{Identifier}](https://developer.travelport.com/apis/flights/ticketing/commitreservation.md): After all required and any optional steps in a booking workbench session, send a POST request with the workbench identifier to commit the workbench. The resulting actions depend on whether payment is present in the workbench. If no Add Payment request has been sent, committing the workbench books the itinerary and generates a PNR. If an Add Payment request has not been sent, committing the workbench tickets the itinerary and generates ticket number/s.

## Ticketing

Issuing tickets including form of payment and payment.

### Post commit workbench

- [POST /air/book/session/reservationworkbench/buildfromlocator](https://developer.travelport.com/apis/flights/workbench-actions/createreservationworkbenchfromlocator.md): Initiate a post-commit workbench to create a session for ticketing or updating an existing reservation. This is a prerequisite step for any transaction that modifies, updates, or tickets any PNR.

### Workbench commit

- [POST /air/book/reservation/reservations/{Identifier}](https://developer.travelport.com/apis/flights/workbench-actions/commitreservation.md): After all required and any optional steps in a booking workbench session, send a POST request with the workbench identifier to commit the workbench. The resulting actions depend on whether payment is present in the workbench. If no Add Payment request has been sent, committing the workbench books the itinerary and generates a PNR. If an Add Payment request has not been sent, committing the workbench tickets the itinerary and generates ticket number/s.

### Post commit workbench

- [POST /air/book/session/reservationworkbench/buildfromlocator](https://developer.travelport.com/apis/flights/ticketing/createreservationworkbenchfromlocator.md): Initiate a post-commit workbench to create a session for ticketing or updating an existing reservation. This is a prerequisite step for any transaction that modifies, updates, or tickets any PNR.

### Workbench commit

- [POST /air/book/reservation/reservations/{Identifier}](https://developer.travelport.com/apis/flights/ticketing/commitreservation.md): After all required and any optional steps in a booking workbench session, send a POST request with the workbench identifier to commit the workbench. The resulting actions depend on whether payment is present in the workbench. If no Add Payment request has been sent, committing the workbench books the itinerary and generates a PNR. If an Add Payment request has not been sent, committing the workbench tickets the itinerary and generates ticket number/s.

### Add form of payment

- [POST /air/payment/reservationworkbench/{ReservationResource_Identifier}/formofpayment](https://developer.travelport.com/apis/flights/ticketing/addformofpayment.md): You can send an Add Form of Payment (FOP) request in either a booking or ticketing workbench session. FOPs of cash and credit are supported. FOPs of agent invoice and non-standard credit card are supported for GDS only.

### Update form of payment

- [PUT /air/payment/reservationworkbench/{ReservationResource_Identifier}/formofpayment/{Identifier}](https://developer.travelport.com/apis/flights/ticketing/updateformofpayment.md): Update a Form Of Payment with new information

### Delete form of payment

- [DELETE /air/payment/reservationworkbench/{ReservationResource_Identifier}/formofpayment/{Identifier}](https://developer.travelport.com/apis/flights/ticketing/deleteformofpayment.md): Delete a Form Of Payment

### Add payment

- [POST /air/paymentoffer/reservationworkbench/{ReservationResource_Identifier}/payments](https://developer.travelport.com/apis/flights/ticketing/addpayment.md): The Payment step takes place in a ticketing workbench session and applies the payment sent previously in the Form of Payment request to the offer/s specified in the Payment request payload. Payment can be sent for any type of offer, including air, seats, and ancillaries. Payment can be made for multiple offers and multiple types of offers in the same request. Form of payment information must either already be present in the reservation or the workbench. At workbench commit, tickets or EMDs are issued for any offer payment has been sent for. Payment is also required prior to ticketing when exchanging tickets in the case of an even exchange, or an add collect (price of new itinerary is greater than existing itinerary). In the case of an add collect, send Payment with a zero amount in Amount/value. See the Exchange, Refund, and Void Guide for details.

### Ticket Retrieve

- [POST /air/ticket/tickets/getbylocator](https://developer.travelport.com/apis/flights/ticketing/ticketgetbylocator.md)

### Ticket display

- [GET /air/ticket/tickets/{Identifier}](https://developer.travelport.com/apis/flights/ticketing/getticket.md): GDS only. To retrieve an NDC ticket use the Ticket Retrieve API. This API duplicates functionality available in the more recently released Ticket Retrieve API, which for GDS can retrieve a single or multiple tickets.

### Single ticket void

- [PUT /air/ticket/tickets/updatestatus/{Identifier}](https://developer.travelport.com/apis/flights/ticketing/updateticket.md): Use the TicketVoid API to void a GDS ticket. Generally a ticket can be voided only within the same day it was issued. See Basic Concepts above for limitations. At this time AirTicketing does not support canceling a GDS itinerary outside the void period.

### Batch void

- [POST /documents/void](https://developer.travelport.com/apis/flights/ticketing/documentvoid.md): The Batch Void API voids multiple documents, including Tickets, EMDs and MCOs on a single booking. You can either void all documents of a specific type (ticket, EMD, or MCO), or send a list of individual ticket or document numbers to void. All tickets and/or documents must be on the same booking. This function is not supported for NDC or LCC. TASF void will be supported as a future enhancement.

### Ticket Retrieve

- [POST /air/ticket/tickets/getbylocator](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/ticketgetbylocator.md)

### Ticket display

- [GET /air/ticket/tickets/{Identifier}](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/getticket.md): GDS only. To retrieve an NDC ticket use the Ticket Retrieve API. This API duplicates functionality available in the more recently released Ticket Retrieve API, which for GDS can retrieve a single or multiple tickets.

## Booking

Reference and full payload booking workflows.

### Host profile move

- [PUT /air/book/profile/reservationworkbench/{identifier}/clientprofile](https://developer.travelport.com/apis/flights/booking/clientprofilemove.md): Functionality to move client profile information into the Reservation workbench. Release

### Add offer reference payload

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromcatalogproductofferings](https://developer.travelport.com/apis/flights/booking/workbenchbuildfromcatalogproductofferings.md): Use the Add Offer reference payload request to add an offer to the reservation workbench as part of the booking workflow. The reference payload request sends identifiers from the Search response instead of full itinerary details. NDC supports only the reference payload. For GDS, you can send either a reference payload or a full payload.

### Single payload booking

- [POST /air/book/reservation/reservations/build](https://developer.travelport.com/apis/flights/booking/buildreservation.md): As an alternative to the booking workflow that takes place in a workbench session, you can send all booking details and commit a single payload to create a booking. The single payload book request does not support any of the optional steps in the booking workflow, such as adding seats or ancillaries.

### Add offer full payload

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromproducts](https://developer.travelport.com/apis/flights/booking/workbenchbuildfromproducts.md): Use the Add Offer full payload request to add an offer to the reservation workbench as part of the booking workflow. The full payload request sends full itinerary details instead of identifiers from the Search response as in the reference payload request. Full payload is not supported for NDC; use the reference payload instead. For GDS, you can send either a reference payload or a full payload.

### Auto price/ Manual Fare

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromunpricedsegments](https://developer.travelport.com/apis/flights/booking/buildfromunpricedsegments.md)

### Unpriced segment

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/unpricedsegments](https://developer.travelport.com/apis/flights/booking/addunpricedsegments.md): Use the Unpriced Segment API in either the booking or post-booking workflow to add an unpriced segment to the workbench. You can send the Unpriced Segment request instead of the Add Offer API in the booking workflow. Or, to add both an unpriced segment and an offer, you can send both Unpriced Segment and Add Offer. Unpriced Segment adds flight/s as unpriced segments instead of as an offer, which is by definition priced.Unpriced segments can be priced using the offers/buildfromunpricedsegments API. GDS content only. NDC does not support unpriced segments.

### Add auxiliary segments

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/customauxiliarysegments](https://developer.travelport.com/apis/flights/booking/addauxiliarysegments.md)

### Add multiple travelers

- [POST /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers/list](https://developer.travelport.com/apis/flights/booking/addtravelers.md)

### Add single traveler

- [POST /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers](https://developer.travelport.com/apis/flights/booking/addtraveler.md): Send the Add Traveler request to add a traveler to the reservation workbench. You must add each traveler to the workbench in a separate POST request. Traveler information can include traveler name and contact details, add traveler-specific remarks including certain SSRs and travel documents such as a passport.

## Remarks and Special Service Requests

Booking remarks including notepad, OSI, and itinerary remarks, and SSRs.

### Document override remarks

- [POST /air/book/documentoverride/Reservation/{ReservationResource_Identifier}/documentoverrides](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/createdocumentoverrides.md): Use document override to send remarks such as tour code, commission, or endorsements/restrictions.Document override remarks are returned in the PNR retrieve only when the detailViewInd query parameter is set to true. Document override remarks can be added to an existing PNR but cannot be modified or deleted; see PNR Modify Guide.

### Accounting remarks

- [POST /air/book/accounting/reservationworkbench/{ReservationResource_Identifier}/accountings](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/createaccounting.md): Accounting remarks are optional remarks that are added to the PNR and typically used by an agency's back office system in some way. The remarks can include ticket numbers, customer or account numbers, fares offered to the customer but refused, and canned remarks that document fare rules. Accounting remarks replace the back office accounting remarks in AirReservation prior to version 11.

### Delete accounting remarks

- [DELETE /air/book/accounting/reservationworkbench/{ReservationResource_Identifier}/accountings/{id}/namevaluepairs](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/deleteaccounting.md)

### Reservation comments (general, itinerary and OSI remarks)

- [POST /air/book/remarks/reservationworkbench/{ReservationResource_Identifier}/reservationcomments/list](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/addreservationcomments.md)

### Delete Reservation Comments

- [DELETE /air/book/remarks/reservationworkbench/{ReservationResource_Identifier}/reservationcomments/{id}/comments](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/deletereservationcomments.md)

### Special service list requests

- [POST /air/book/specialservices/reservationworkbench/{ReservationResource_Identifier}/specialservices/list](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/addspecialservices.md)

### Delete a special service

- [DELETE /air/book/specialservices/reservationworkbench/{ReservationResource_Identifier}/specialservices/{id}](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/deletespecialservices.md)

### Delete multiple special services

- [POST /air/book/specialservices/reservationworkbench/{ReservationResource_Identifier}/specialservices/deletemultiple](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/deletemultiplespecialservices.md)

### Add primary contact remark (SSR CTC)

- [POST /air/book/primarycontact/reservationworkbench/{ReservationResource_Identifier}/primarycontacts](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/addprimarycontact.md)

### Delete primary contact remark

- [DELETE /air/book/primarycontact/reservationworkbench/{ReservationResource_Identifier}/primarycontacts/{id}](https://developer.travelport.com/apis/flights/remarks-and-special-service-requests/deleteprimarycontact.md)

## Retrieve Bookings and Tickets

Retrieve bookings, tickets, and document histories.

### Ticket Retrieve

- [POST /air/ticket/tickets/getbylocator](https://developer.travelport.com/apis/flights/ticketing/ticketgetbylocator.md)

### Ticket display

- [GET /air/ticket/tickets/{Identifier}](https://developer.travelport.com/apis/flights/ticketing/getticket.md): GDS only. To retrieve an NDC ticket use the Ticket Retrieve API. This API duplicates functionality available in the more recently released Ticket Retrieve API, which for GDS can retrieve a single or multiple tickets.

### Reservation retrieve

- [GET /air/book/reservation/reservations/{Identifier}](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/retrievereservation.md): Retrieve details about a held booking, or PNR. While a PNR refers to a held booking that has not been ticketed, the PNR code persists after ticketing to provide the booking records. Once a PNR has been ticketed, you can still use PNR Retrieve to return both booking and ticketing details. A Ticket Display request can also be used to retrieve any ticketed itinerary.

### Retrieve a reservation by locator

- [GET /air/book/reservation/reservations/getbylocator](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/getreservationbylocator.md): To be deprecated and replaced by Get by Identifier using identifier Type "Locator"

### Ticket list

- [GET /air/receipt/reservations/{ReservationResource_Identifier}/receipts](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/getreceipts.md): Get a list of ticket receipts for a reservation.

### Ticket Retrieve

- [POST /air/ticket/tickets/getbylocator](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/ticketgetbylocator.md)

### Ticket display

- [GET /air/ticket/tickets/{Identifier}](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/getticket.md): GDS only. To retrieve an NDC ticket use the Ticket Retrieve API. This API duplicates functionality available in the more recently released Ticket Retrieve API, which for GDS can retrieve a single or multiple tickets.

### Document list

- [GET /documents/documentlist/{identifier}](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/documenthistorylist.md)

### Document history

- [POST /documents/history](https://developer.travelport.com/apis/flights/retrieve-bookings-and-tickets/documenthistory.md)

## Modify Traveler Details

Modify traveler information.

### Update traveler information

- [PUT /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers/updatefromtravelerupdateditems/{id}](https://developer.travelport.com/apis/flights/modify-traveler-details/updatefromtravelerupdateditems.md): The Traveler Update request follows an Updatable Items request and makes a change to one or more items returned in that Updatable Items response. Sent as part of a workbench session, either during the initial booking workflow (workbench not committed, PNR not issued yet) or a post-commit workbench for an existing PNR. It is followed by a workbench commit.

### Traveler updatable items

- [POST /air/book/updateableitem/reservationworkbench/{ReservationResource_Identifier}/travelerupdatableitems/buildfromtraveler](https://developer.travelport.com/apis/flights/modify-traveler-details/buildfromtraveler.md): The Updatable Items request retrieves by traveler ID a list of objects that are updatable for that traveler, and returns for each an indicator for whether that item can be added, modified, or deleted.

### Update traveler information

- [PUT /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers/updatefromtravelerupdateditems/{id}](https://developer.travelport.com/apis/flights/modify-bookings/updatefromtravelerupdateditems.md): The Traveler Update request follows an Updatable Items request and makes a change to one or more items returned in that Updatable Items response. Sent as part of a workbench session, either during the initial booking workflow (workbench not committed, PNR not issued yet) or a post-commit workbench for an existing PNR. It is followed by a workbench commit.

### Traveler updatable items

- [POST /air/book/updateableitem/reservationworkbench/{ReservationResource_Identifier}/travelerupdatableitems/buildfromtraveler](https://developer.travelport.com/apis/flights/modify-bookings/buildfromtraveler.md): The Updatable Items request retrieves by traveler ID a list of objects that are updatable for that traveler, and returns for each an indicator for whether that item can be added, modified, or deleted.

## Modify Bookings

Divide or cancel bookings.

### Update traveler information

- [PUT /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers/updatefromtravelerupdateditems/{id}](https://developer.travelport.com/apis/flights/modify-traveler-details/updatefromtravelerupdateditems.md): The Traveler Update request follows an Updatable Items request and makes a change to one or more items returned in that Updatable Items response. Sent as part of a workbench session, either during the initial booking workflow (workbench not committed, PNR not issued yet) or a post-commit workbench for an existing PNR. It is followed by a workbench commit.

### Traveler updatable items

- [POST /air/book/updateableitem/reservationworkbench/{ReservationResource_Identifier}/travelerupdatableitems/buildfromtraveler](https://developer.travelport.com/apis/flights/modify-traveler-details/buildfromtraveler.md): The Updatable Items request retrieves by traveler ID a list of objects that are updatable for that traveler, and returns for each an indicator for whether that item can be added, modified, or deleted.

### Reservation divide

- [POST /air/book/reservation/reservations/divide](https://developer.travelport.com/apis/flights/modify-bookings/divide.md): Use this operation to divide a reservation when any of the party needs to cancel or travel on alternative flights

### Reservation Cancel

- [POST /air/receipt/reservations/{ReservationResource_Identifier}/receipts](https://developer.travelport.com/apis/flights/modify-bookings/cancelreservation.md): Create a set of offer cancellation receipts for every offer in the reservation.

### Update traveler information

- [PUT /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers/updatefromtravelerupdateditems/{id}](https://developer.travelport.com/apis/flights/modify-bookings/updatefromtravelerupdateditems.md): The Traveler Update request follows an Updatable Items request and makes a change to one or more items returned in that Updatable Items response. Sent as part of a workbench session, either during the initial booking workflow (workbench not committed, PNR not issued yet) or a post-commit workbench for an existing PNR. It is followed by a workbench commit.

### Traveler updatable items

- [POST /air/book/updateableitem/reservationworkbench/{ReservationResource_Identifier}/travelerupdatableitems/buildfromtraveler](https://developer.travelport.com/apis/flights/modify-bookings/buildfromtraveler.md): The Updatable Items request retrieves by traveler ID a list of objects that are updatable for that traveler, and returns for each an indicator for whether that item can be added, modified, or deleted.

### Reservation Cancel

- [POST /air/receipt/reservations/{ReservationResource_Identifier}/receipts](https://developer.travelport.com/apis/flights/ndc-modify-cancel-exchange/cancelreservation.md): Create a set of offer cancellation receipts for every offer in the reservation.

## GDS Exchanges

GDS ticket exchange workflow from exchange search, modify, and ticket exchange.

### Exchange eligibility

- [GET /eligibility/ticketchangeeligibilities](https://developer.travelport.com/apis/flights/gds-exchanges/geteligibility.md): The Eligibility API is the first step in the GDS exchange workflow. Eligibility returns information about whether a ticket may have value in an exchange or refund scenario, and the range of potential exchange and refund fees. This information relates only to fees and not any fare or tax difference for the itinerary.

### Exchange Search

- [POST /exchangesearch/catalogofferingsairchange](https://developer.travelport.com/apis/flights/gds-exchanges/createexchangesearch.md): The Exchange Search API is the second step in the GDS exchange workflow, after Eligibility. It supports searching for an alternate itinerary for a possible exchange on a currently ticketed GDS itinerary. The response details any differences in base fare, taxes, fees, and total price between the currently ticketed itinerary and the possible new itinerary.

### Exchange Price Quote (GDS)

- [POST /pricequote/catalogofferingsairchange/productspecificsearch](https://developer.travelport.com/apis/flights/gds-exchanges/productspecificsearch.md): The Product Specific Search function of the Exchange Search API is the second step in the GDS exchange workflow, after Eligibility. It supports searching for a specified itinerary and in addition can provide alternate options. The response details any differences in base fare, taxes, fees, and total price between the currently ticketed itinerary and the possible new itinerary.

### Pagination. Get additional Pages

- [GET /exchangesearch/catalogofferingsairchange/{identifier}](https://developer.travelport.com/apis/flights/gds-exchanges/getairchangepage.md)

### Coming soon. Manual refunds

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/create](https://developer.travelport.com/apis/flights/gds-exchanges/createmanualoffer.md)

### Add/Modify Offer

- [POST /air/book/offer/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromcatalogofferings](https://developer.travelport.com/apis/flights/gds-exchanges/tripchangebuildfromcatalogofferings.md): Use the Add Offer reference payload request to add an offer to the reservation workbench as part of the booking workflow. The reference payload request sends identifiers from the Exchange Search response instead of full itinerary details.

### Manual exchange

- [POST /air/book/offer/reservationworkbench/{ReservationResource_Identifier}/offers](https://developer.travelport.com/apis/flights/gds-exchanges/createagencycalculatedexchange.md)

## Queues

Manage agency queues.

### Queue placement

- [POST /air/queue/queue](https://developer.travelport.com/apis/flights/queues/create.md)

### Queue remove

- [POST /air/queue/queue/remove](https://developer.travelport.com/apis/flights/queues/queueremove.md)

### Queue list

- [POST /air/queue/queue/list](https://developer.travelport.com/apis/flights/queues/createqueuelist.md)

## Travel Agency Details

Manage travel agency details that can be attached to a booking.

### Travel agency details (single payload)

- [POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency](https://developer.travelport.com/apis/flights/travel-agency-details/addagencydetails.md)

### Travel Agency Address

- [POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/addaddress](https://developer.travelport.com/apis/flights/travel-agency-details/addagencyaddress.md)

### Travel agency address

- [PUT /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/updateaddress](https://developer.travelport.com/apis/flights/travel-agency-details/updateagencyaddress.md)

### Travel agency address

- [DELETE /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/deleteaddress/{addressid}](https://developer.travelport.com/apis/flights/travel-agency-details/deleteagencyaddress.md)

### Travel agency corporate ID

- [POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/addcorporatecode](https://developer.travelport.com/apis/flights/travel-agency-details/addcorporatecode.md)

### Travel agency corporate ID

- [PUT /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/updatecorporatecode](https://developer.travelport.com/apis/flights/travel-agency-details/updatecorporatecode.md)

### Travel agency corporate ID

- [DELETE /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/deletecorporatecode](https://developer.travelport.com/apis/flights/travel-agency-details/deletecorporatecode.md)

### Travel agency email

- [POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/addemail](https://developer.travelport.com/apis/flights/travel-agency-details/addagencyemail.md)

### Travel agency email

- [PUT /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/updateemail](https://developer.travelport.com/apis/flights/travel-agency-details/updateagencyemail.md)

### Travel agency email

- [DELETE /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/deleteemail/{emailid}](https://developer.travelport.com/apis/flights/travel-agency-details/deleteagencyemail.md)

### Travel agency telephone

- [POST /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/addtelephone](https://developer.travelport.com/apis/flights/travel-agency-details/addagencytelephone.md)

### Travel agency telephone

- [PUT /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/updatetelephone](https://developer.travelport.com/apis/flights/travel-agency-details/updateagencytelephone.md)

### Travel agency telephone

- [DELETE /air/ticket/travelagency/reservationworkbench/{ReservationResource_Identifier}/travelagency/{id}/deletetelephone/{telephoneid}](https://developer.travelport.com/apis/flights/travel-agency-details/deleteagencytelephone.md)

## Custom Booking Rules

Manage custom rules set up for your PCC.

### Custom rule list and details

- [GET /air/book/customrule/customrules](https://developer.travelport.com/apis/flights/custom-booking-rules/getcustomrules.md)

### Custom rule

- [POST /air/book/customrule/customrules/{ReservationWorkbench_Identifier}](https://developer.travelport.com/apis/flights/custom-booking-rules/addcustomrule.md)

### Remove custom rule

- [DELETE /air/book/customrule/customrules/{ReservationWorkbench_Identifier}](https://developer.travelport.com/apis/flights/custom-booking-rules/deletecustomrule.md)

## Deprecated

### Update document overrides (deprecated)

- [PUT /air/book/documentoverride/Reservation/{ReservationResource_Identifier}/documentoverrides/{id}](https://developer.travelport.com/apis/flights/deprecated/updatedocumentoverrides.md)

### Delete document overrides (deprecated)

- [DELETE /air/book/documentoverride/Reservation/{ReservationResource_Identifier}/documentoverrides/{id}](https://developer.travelport.com/apis/flights/deprecated/deletedocumentoverrides.md)

### Update a reservation (deprecated)

- [PUT /air/book/reservation/reservations/{Identifier}](https://developer.travelport.com/apis/flights/deprecated/updatereservation.md)

### Cancel an Offer within a Reservation (deprecated)

- [PUT /air/book/reservation/reservations/{reservationIdentifier}/canceloffer](https://developer.travelport.com/apis/flights/deprecated/cancelreservationoffer.md): Cancel an Offer by modifying the Reservation

### Create a reservation (deprecated)

- [POST /air/book/reservation/reservations](https://developer.travelport.com/apis/flights/deprecated/createreservation.md): Create a reservation on the core or with the vendor/provider.

### ReceiptResource - BuildFromLocator (deprecated)

- [POST /air/receipt/reservations/{ReservationResource_Identifier}/receipts/buildfromlocator](https://developer.travelport.com/apis/flights/deprecated/buildreceiptsfromlocator.md): Process all unprocessed offers and create ticket receipts

### ReceiptResource - BuildFromPayment (deprecated)

- [POST /air/receipt/reservations/{ReservationResource_Identifier}/receipts/buildfrompayment](https://developer.travelport.com/apis/flights/deprecated/buildreceiptsfrompayment.md): Process all un-processesed payments and create a list of payment receipts.

### Create a workbench for existing booking (deprecated)

- [POST /air/book/session/reservationworkbench/buildfromidentifier/{Identifier}](https://developer.travelport.com/apis/flights/deprecated/createreservationworkbenchfromidentifier.md): Initiate a post-commit workbench to create a session for ticketing or updating an existing reservation. This is a prerequisite step for any transaction that modifies, updates, or tickets any PNR.

### Standalone reprice (deprecated)

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromoffer](https://developer.travelport.com/apis/flights/deprecated/buildfromoffer.md)

### Reprice existing offers in the workbench (deprecated)

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromoffers](https://developer.travelport.com/apis/flights/deprecated/buildfromoffers.md)

### Not implemented (deprecated)

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromofferlist](https://developer.travelport.com/apis/flights/deprecated/buildfromofferlist.md): Create and Offer by referencing the OfferList Identifier which is returned in the Price response

### Add offer to booking - reference payload. (deprecated)

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers/buildfromcatalogofferings](https://developer.travelport.com/apis/flights/deprecated/workbenchbuildfromcatalogofferings.md): Use the Add Offer reference payload request to add an offer to the reservation workbench as part of the booking workflow. The reference payload request sends identifiers from the Search response instead of full itinerary details. NDC supports only the reference payload. For GDS, you can send either a reference payload or a full payload.

### Create refund or passive offer (deprecated)

- [POST /air/book/airoffer/reservationworkbench/{ReservationResource_Identifier}/offers](https://developer.travelport.com/apis/flights/deprecated/deprecatedcreatemanualoffer.md)

### Update accounting remarks (deprecated)

- [PUT /air/book/accounting/reservationworkbench/{ReservationResource_Identifier}/accountings](https://developer.travelport.com/apis/flights/deprecated/updateaccounting.md)

### Update Reservation Comments (deprecated)

- [PUT /air/book/remarks/reservationworkbench/{ReservationResource_Identifier}/reservationcomments](https://developer.travelport.com/apis/flights/deprecated/updatereservationcomments.md)

### Update special service (deprecated)

- [PUT /air/book/specialservices/reservationworkbench/{ReservationResource_Identifier}/specialservices](https://developer.travelport.com/apis/flights/deprecated/updatespecialservices.md)

### Retrieve Traveler (deprecated)

- [GET /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers/{id}](https://developer.travelport.com/apis/flights/deprecated/gettraveler.md)

### Update traveler (deprecated)

- [PUT /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers/{id}](https://developer.travelport.com/apis/flights/deprecated/updatetraveler.md)

### Delete traveler (deprecated)

- [DELETE /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers/{id}](https://developer.travelport.com/apis/flights/deprecated/deletetraveler.md)

### retrieve multiple travelers (deprecated)

- [GET /air/book/traveler/reservationworkbench/{ReservationResource_Identifier}/travelers](https://developer.travelport.com/apis/flights/deprecated/gettravelers.md)

### Update primary contact (deprecated)

- [PUT /air/book/primarycontact/reservationworkbench/{ReservationResource_Identifier}/primarycontacts](https://developer.travelport.com/apis/flights/deprecated/updateprimarycontact.md)

### Add multiple primary contacts (deprecated)

- [POST /air/book/primarycontact/reservationworkbench/{ReservationResource_Identifier}/primarycontacts/list](https://developer.travelport.com/apis/flights/deprecated/addprimarycontacts.md)

### Used POST method (deprecated)

- [GET /air/ticket/tickets/getbylocator](https://developer.travelport.com/apis/flights/deprecated/deprecatedticketgetbylocator.md)
