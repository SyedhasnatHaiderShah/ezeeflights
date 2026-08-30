import {
  getAcceptedHotelLocationCodes,
  hotelLocationMatchesSearch,
  resolveTravelportHotelLocation,
} from "../src/common/utils/hotel-location.util";

describe("hotel-location.util", () => {
  it("maps LHR to LON for Travelport SOAP location", () => {
    expect(resolveTravelportHotelLocation("LHR")).toBe("LON");
    expect(resolveTravelportHotelLocation("lhr")).toBe("LON");
  });

  it("passes through codes with no mapping (e.g. LHE)", () => {
    expect(resolveTravelportHotelLocation("LHE")).toBe("LHE");
  });

  it("accepts LON hotels when searching LHR", () => {
    expect(hotelLocationMatchesSearch("LON", "LHR")).toBe(true);
    expect(hotelLocationMatchesSearch("LHR", "LHR")).toBe(true);
    expect(hotelLocationMatchesSearch("DXB", "LHR")).toBe(false);
  });

  it("accepts LHR when searching LON", () => {
    const codes = getAcceptedHotelLocationCodes("LON");
    expect(codes.has("LON")).toBe(true);
    expect(codes.has("LHR")).toBe(true);
  });

  it("keeps hotels without hotelLocation tag", () => {
    expect(hotelLocationMatchesSearch(undefined, "LHR")).toBe(true);
    expect(hotelLocationMatchesSearch("", "LHR")).toBe(true);
  });
});
