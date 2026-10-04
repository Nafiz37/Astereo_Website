"use client";

import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";