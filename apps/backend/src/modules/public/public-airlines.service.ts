import { Injectable } from "@nestjs/common";

@Injectable()
export class PublicAirlinesService {
  getAirlines() {
    return [
      {
        id: "1",
        name: "Emirates",
        code: "EK",
        logoUrl:
          "https://images.unsplash.com/photo-1610642372651-fe6e7bc209ef?auto=format&fit=crop&q=80&w=100",
      },
      {
        id: "2",
        name: "Qatar Airways",
        code: "QR",
        logoUrl:
          "https://images.unsplash.com/photo-1544016768-982d1554f0b9?auto=format&fit=crop&q=80&w=100",
      },
      {
        id: "3",
        name: "British Airways",
        code: "BA",
        logoUrl:
          "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&q=80&w=100",
      },
      {
        id: "4",
        name: "Singapore Airlines",
        code: "SQ",
        logoUrl:
          "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=100",
      },
      {
        id: "5",
        name: "Turkish Airlines",
        code: "TK",
        logoUrl:
          "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80&w=100",
      },
    ];
  }
}
