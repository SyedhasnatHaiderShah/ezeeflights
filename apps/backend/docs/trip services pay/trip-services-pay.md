# TripServices Pay

The TripServices Pay v11 APIs allow online travel agencies to request credit card authorizations, card and address validations, and reversals against a specific merchant vendor.

Version: 11.33.0

## Servers

```
https://api.pp.travelport.net/11/payment
```

```
https://api.travelport.net/11/payment
```

## Security

### bearerAuth

Bearer authentication using a JSON Web Token (JWT). The token must be sent in the Authorization header using the format: `Authorization: Bearer <token>`.

Type: http
Scheme: bearer
Bearer Format: JWT

## Download OpenAPI description

[TripServices Pay](https://developer.travelport.com/_bundle/apis/pay/@11.33/index.yaml)

## Payment Card Authorization

### Payment Card Authorization

 - [POST /paymentcardauthorizations/{authType}](https://developer.travelport.com/apis/pay/payment-card-authorization/create.md): Travelport’s NextGenAPI Payment Authorization Service allows the user to request credit card authorizations, address validations and reversals against a specific merchant vendor.
