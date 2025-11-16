"use client";

import { useEffect, useState } from "react";

export function RenderExcalidraw({ alt, src }) {
  const [svgData, setSvgData] = useState(null);

  useEffect(() => {
    async function fetchSvgData() {
      const res = await fetch(src);
      const data = await res.text();

      if (data) {
        setSvgData(data);
        console.log(data);
      }
    }

    fetchSvgData();
  }, []);

  if (svgData) {
    return (
      <div>
        <div className="excalidraw-content" dangerouslySetInnerHTML={{ __html: svgData }} />
      </div>
    );
  }
}
