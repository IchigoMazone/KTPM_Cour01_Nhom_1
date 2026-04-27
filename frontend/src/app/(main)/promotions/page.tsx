"use client";

import React from "react";
import Offers from "./offers";
import Coupons from "./coupons";
import Bundles from "./bundles";
import Referrals from "./referrals";

export default function Page() {
  return (
    <>
      <Offers />
      <Coupons />
      <Bundles />
      <Referrals />
    </>
  );
}
