'use client';

import dynamic from "next/dynamic";
import LoadingSkeleton from "./LoadingSkeleton";

const MainPickSlider = dynamic(() => import("./MainPickSlider"), { 
  loading: () => <LoadingSkeleton type="slider" />,
  ssr: true
});

export default MainPickSlider;
