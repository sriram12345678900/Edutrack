declare module "firebase/firestore" {
  export function getFirestore(app?: any): any;
  export function doc(db: any, collectionPath: string, ...pathSegments: string[]): any;
  export function getDoc(reference: any): Promise<any>;
  export function setDoc(reference: any, data: any, options?: any): Promise<any>;
  export function updateDoc(reference: any, data: any): Promise<any>;
  export function onSnapshot(
    reference: any,
    onNext: (snapshot: any) => void,
    onError?: (error: any) => void,
    onCompletion?: () => void
  ): () => void;
  export type Firestore = any;
}
