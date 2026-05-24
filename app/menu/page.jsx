import React from "react";

const page = () => {
  return (
    <div className="min-h-screen w-full flex flex-row bg-[#0a0a0a] text-white font-sans selection:bg-white/20">
      {/* LEFT: Premium Slider (70%) */}
      <div className="relative w-[75%] h-screen overflow-hidden bg-[#111111] overflow-y-auto p-4 no-scrollbar">
        {/* Testimonial Overlay */}
      </div>

      {/* RIGHT: Scrollable Side Panel (30%) */}
      <div className="w-[25%] h-screen bg-[#0a0a0a] flex flex-col gap-4 "></div>

    </div>
  );
};

export default page;
