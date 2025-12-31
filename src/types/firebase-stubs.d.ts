declare module 'firebase/firestore' {
  export function collection(...args: unknown[]): unknown
  export function doc(...args: unknown[]): unknown
  export function getDocs(...args: unknown[]): unknown
  export function getDoc(...args: unknown[]): unknown
  export function setDoc(...args: unknown[]): unknown
  export function updateDoc(...args: unknown[]): unknown
  export function addDoc(...args: unknown[]): unknown
  export function query(...args: unknown[]): unknown
  export function where(...args: unknown[]): unknown
  export function orderBy(...args: unknown[]): unknown
  export class Timestamp {
    static now(): Timestamp
  }
}

declare module '@/lib/firebase/config' {
  export const db: unknown
}
