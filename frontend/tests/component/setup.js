import {afterEach,vi} from 'vitest';
import {cleanup} from '@testing-library/react';
afterEach(()=>cleanup());
if (!globalThis.ResizeObserver) globalThis.ResizeObserver=class {observe(){} unobserve(){} disconnect(){}};
if (!globalThis.matchMedia) globalThis.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
if (!globalThis.IntersectionObserver) globalThis.IntersectionObserver=class {observe(){} unobserve(){} disconnect(){}};
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView=function(){};
