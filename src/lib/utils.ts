import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function calculateTermInDays(issueDate: string, dueDate: string): number {
  const issue = new Date(issueDate);
  const due = new Date(dueDate);
  return Math.round((due.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateEstimatedNetAmount(grossAmount: number, rate: number, termInDays: number): number {
  const dailyRate = rate / 100 / 30;
  const discount = grossAmount * dailyRate * termInDays;
  return Math.max(grossAmount - discount, grossAmount * 0.8);
}

export function calculateEstimatedReturn(investedAmount: number, rate: number, termInDays: number): number {
  const monthlyRate = rate / 100;
  const monthsRatio = termInDays / 30;
  return investedAmount * monthlyRate * monthsRatio;
}
