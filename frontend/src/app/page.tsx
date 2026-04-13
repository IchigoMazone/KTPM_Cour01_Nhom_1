"use client";
import React from "react";
import { GradientText } from "../components/ui/gradient-text";
import { motion } from "framer-motion";
import CountUp from "react-countup"; // npm install react-countup
import About from "./about";
import Mission from "./mission";
import Stats from "./stats";
import Gallery from "./gallery";

export default function Page() {
  return (
    <>
      <About />
      <Mission />
      <Stats />
      <Gallery />
    </>
  );
}
