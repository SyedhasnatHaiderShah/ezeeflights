# How to Use Travelport uAPI Postman Payload (`payload-postman.xml`)

This document explains what `payload-postman.xml` is, how it is generated, and how you can test it directly using **Postman** or **cURL** to debug flight search requests against the Travelport Universal API (uAPI).

---

## 📌 1. What is this Payload?

Whenever a flight search is performed in the backend (even if using the external provider), the application automatically generates a standard Travelport SOAP XML request (`LowFareSearchReq`) and saves it to:
`apps/backend/logs/travelport_responses/payload-postman.xml`

This allows developers to easily inspect the exact parameters being sent to Travelport or replay the exact search query in Postman.

---

## 🚀 2. Step-by-Step Guide: Testing in Postman

### Step 1: Create a New Request

1. Open **Postman** and click **New Request** (`+` button).
2. Set the HTTP Method to **`POST`**.
3. Enter your Travelport Air Service Endpoint URL:
   - **APAC (Production / Sandbox):** `https://apac.universal-api.travelport.com/B2BGateway/connect/uAPI/AirService`
   - **EMEA (Production / Sandbox):** `https://emea.universal-api.travelport.com/B2BGateway/connect/uAPI/AirService`
   - _(Note: Check your `.env` file for your specific `TRAVELPORT_URL` and append `/AirService` if not present)._

---

### Step 2: Set Authorization (Basic Auth)

1. Go to the **Authorization** tab in Postman.
2. Select **Basic Auth** from the Auth Type dropdown.
3. Fill in your Travelport credentials (from your `.env`):
   - **Username:** `TRAVELPORT_USERNAME` (e.g., `Universal API/uAPI8123456789...`)
   - **Password:** `TRAVELPORT_PASSWORD`

---

### Step 3: Configure HTTP Headers

Go to the **Headers** tab and add the following key-value pairs:

| Key                   | Value                    | Description                                  |
| :-------------------- | :----------------------- | :------------------------------------------- |
| **`Content-Type`**    | `text/xml;charset=UTF-8` | Required for Travelport SOAP XML requests    |
| **`SOAPAction`**      | `""` _(leave empty)_     | Required by Travelport uAPI AirService       |
| **`Accept-Encoding`** | `gzip, deflate`          | Recommended for compressed, faster responses |
| **`Connection`**      | `keep-alive`             | Keeps the connection open                    |

---

### Step 4: Paste the XML Body

1. Go to the **Body** tab.
2. Select **`raw`** radio button.
3. In the format dropdown on the right, change `Text` / `JSON` to **`XML`**.
4. Open `payload-postman.xml`, copy the **entire file contents**, and paste it into the Postman body editor.

---

### Step 5: Send Request & Inspect Response

1. Click the **Send** button.
2. You should receive a `200 OK` HTTP status with a SOAP XML response envelope containing `<air:LowFareSearchRsp>`.
3. Inside the response, you will see:
   - `<air:FlightDetailsList>`: Information about airports, aircraft types, and flight times.
   - `<air:AirSegmentList>`: Individual flight legs and carrier codes.
   - `<air:AirPricingSolution>`: Total prices, base fares, taxes, and baggage allowances.

---

## 💻 3. Testing via cURL (Command Line)

If you prefer testing directly from your terminal (Bash or PowerShell), you can run:

```bash
curl -X POST "https://apac.universal-api.travelport.com/B2BGateway/connect/uAPI/AirService" \
  -u "YOUR_TRAVELPORT_USERNAME:YOUR_TRAVELPORT_PASSWORD" \
  -H "Content-Type: text/xml;charset=UTF-8" \
  -H "SOAPAction: \"\"" \
  -d @apps/backend/logs/travelport_responses/payload-postman.xml
```

_(Make sure to replace `YOUR_TRAVELPORT_USERNAME` and `YOUR_TRAVELPORT_PASSWORD` with your actual `.env` values, and run the command from the root of the project)._

---

## 🔍 4. Key Elements Inside the XML Payload Explained

When modifying or inspecting `payload-postman.xml`, here are the most important sections:

```xml
<air:LowFareSearchReq TargetBranch="P7123456" SolutionResult="true" MaxNumberOfSolutions="200" ReturnBrandedFares="true">
```

- **`TargetBranch`**: Your Travelport agency branch code (PCC/Workarea).
- **`MaxNumberOfSolutions`**: Limits how many flight options Travelport returns (default: 200).
- **`ReturnBrandedFares`**: Requests detailed fare families (Economy Light, Standard, Flex, etc.).

---

```xml
<air:SearchAirLeg>
    <air:SearchOrigin>
        <com:CityOrAirport Code="LHE" PreferCity="true"/>
    </air:SearchOrigin>
    <air:SearchDestination>
        <com:CityOrAirport Code="DXB" PreferCity="true"/>
    </air:SearchDestination>
    <air:SearchDepTime PreferredTime="2026-07-15T00:00:00"/>
</air:SearchAirLeg>
```

- **`<air:SearchAirLeg>`**: Represents a sector of the trip. A round-trip flight will have **two** `<air:SearchAirLeg>` blocks (outbound and inbound).
- **`PreferCity="true"`**: Tells Travelport to search all airports associated with a metro city code (e.g., searching `NYC` checks JFK, LGA, and EWR).

---

```xml
<air:AirSearchModifiers PreferredCurrency="USD">
    <air:PreferredProviders>
        <com:Provider Code="1G"/>
    </air:PreferredProviders>
</air:AirSearchModifiers>
```

- **`PreferredCurrency`**: Requests all pricing to be converted and returned in this currency (e.g., `USD`, `PKR`, `AED`).
- **`<com:Provider Code="1G"/>`**: Specifies the GDS provider core. `1G` stands for **Galileo** (Travelport).

---

```xml
<com:SearchPassenger Code="ADT" Key="P1"/>
<com:SearchPassenger Code="CNN" Age="8" Key="PC1"/>
<com:SearchPassenger Code="INF" Age="1" Key="PI1"/>
```

- Defines the passenger mix for the pricing query:
  - `ADT` = Adult
  - `CNN` = Child (requires an `Age` attribute between 2-11)
  - `INF` = Infant without seat (requires an `Age` attribute, usually 0 or 1)
