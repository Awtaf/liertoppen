import React from "react";
import { Composition } from "remotion";
import { AnxietyReel } from "./AnxietyReel/AnxietyReel";
import { VIDEO } from "./AnxietyReel/timing";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AnxietyReel"
      component={AnxietyReel}
      durationInFrames={VIDEO.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
};
