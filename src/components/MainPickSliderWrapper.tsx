'use client';

import dynamic from "next/dynamic";
const MainPickSlider = dynamic(() => import("./MainPickSlider"), { ssr: false });
export default MainPickSlider;
