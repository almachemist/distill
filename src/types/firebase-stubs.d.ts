declare module 'firebase/firestore' {
  export const collection: any
  export const doc: any
  export const getDocs: any
  export const getDoc: any
  export const setDoc: any
  export const updateDoc: any
  export const addDoc: any
  export const query: any
  export const where: any
  export const orderBy: any
  export const Timestamp: any
  export type Timestamp = any
}

declare module '@/lib/firebase/config' {
  export const db: any
}
