// Remotion CLI config (https://www.remotion.dev/docs/config)
import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./remotion/index.ts");
// Fonts and (later) audio files live here, separate from the Next.js /public.
Config.setPublicDir("./remotion/public");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setCrf(18);
