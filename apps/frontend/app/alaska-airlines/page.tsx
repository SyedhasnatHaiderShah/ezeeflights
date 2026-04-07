"use client";

import * as React from "react";
import { AirlinePageTemplate } from "@/components/sections/AirlinePageTemplate";
import { AIRLINE_DATA } from "@/constants/airline-data";

export default function AlaskaAirlinesPage() {
  const data = AIRLINE_DATA.alaska;
  
  if (!data) return null;

  return <AirlinePageTemplate data={data} />;
}
