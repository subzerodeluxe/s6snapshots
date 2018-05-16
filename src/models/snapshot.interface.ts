export interface Snapshot {
    id?: string, 
    createdAt?: Date, 
    image: string,  
    summary: string,        
    tags?: string[],
    title: string
}