// Adapted from
// https://github.com/ianstormtaylor/slate/blob/e766e7a4ac6dbdd2863a73012140d79ebe42743e/packages/slate-react/src/utils/environment.ts
// under MIT license.

import { Platform } from "./Types";

export const IS_IOS =
  typeof navigator !== "undefined" &&
  typeof window !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !window.MSStream;

export const IS_APPLE =
  typeof navigator !== "undefined" && /Mac OS X/.test(navigator.userAgent);

export const IS_FIREFOX =
  typeof navigator !== "undefined" &&
  /^(?!.*Seamonkey)(?=.*Firefox).*/i.test(navigator.userAgent);

export const IS_SAFARI =
  typeof navigator !== "undefined" &&
  /Version\/[\d]+.*Safari/.test(navigator.userAgent);

export const PLATFORM: Platform = IS_APPLE ? "apple" : "windows";
