declare module "firebase/firestore" {
  export function getFirestore(app?: any): any;
  export function doc(db: any, collectionPath: string, ...pathSegments: string[]): any;
  export function getDoc(reference: any): Promise<any>;
  export function setDoc(reference: any, data: any, options?: any): Promise<any>;
  export function updateDoc(reference: any, data: any): Promise<any>;
  export function deleteDoc(reference: any): Promise<any>;
  export function collection(db: any, ...pathSegments: string[]): any;
  export function addDoc(reference: any, data: any): Promise<any>;
  export function onSnapshot(
    reference: any,
    onNext: (snapshot: any) => void,
    onError?: (error: any) => void,
    onCompletion?: () => void
  ): () => void;
  export function arrayUnion(...elements: any[]): any;
  export function arrayRemove(...elements: any[]): any;
  export function serverTimestamp(): any;
  export function query(...args: any[]): any;
  export function where(...args: any[]): any;
  export function orderBy(...args: any[]): any;
  export function limit(...args: any[]): any;
  export type Firestore = any;
}
