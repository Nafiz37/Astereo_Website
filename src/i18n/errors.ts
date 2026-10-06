import type { Locale } from "./config";

/** Bangla translations of the validation messages produced by src/lib/validation.ts (English is the source). */
const bn: Record<string, string> = {
  "Please enter your name": "অনুগ্রহ করে আপনার নাম লিখুন",
  "Enter a valid email address": "সঠিক ইমেইল ঠিকানা লিখুন",
  "Enter a valid phone number": "সঠিক ফোন নম্বর লিখুন",
  "Tell us a little more (at least 10 characters)": "আরও একটু বিস্তারিত লিখুন (কমপক্ষে ১০টি অক্ষর)",
  "Please accept the privacy policy": "অনুগ্রহ করে গোপনীয়তা নীতিতে সম্মতি দিন",
  "Enter a valid URL (https://...)": "সঠিক URL লিখুন (https://...)",
  "Link must start with http:// or https://": "লিংক অবশ্যই http:// বা https:// দিয়ে শুরু হতে হবে",
  "Invalid input": "ইনপুট সঠিক নয়",
  "Please check the highlighted fields": "অনুগ্রহ করে চিহ্নিত ঘরগুলো দেখুন",
};

export const translateError = (message: string, lang: Locale) => (lang === "bn" ? (bn[message] ?? message) : message);
