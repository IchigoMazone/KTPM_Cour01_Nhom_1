"use client";

import React from "react";
import Overview from "./overview";
import Mission from "./mission";
import Stats from "./stats";
import Gallery from "./gallery";

export default function Page() {
  return (
    <>
      <Overview />
      <Mission />
      <Stats />
      <Gallery />
    </>
  );
}
