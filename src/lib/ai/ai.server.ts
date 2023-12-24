import { OPENAI_API_KEY, OPENAI_API_THROTTLE_RPS } from '$env/static/private';
import { Throttler } from '$lib/utils/throttler';
import OpenAI from 'openai';

export const ai = new OpenAI({ apiKey: OPENAI_API_KEY });

export const aiThrottler = new Throttler(Number(OPENAI_API_THROTTLE_RPS));
