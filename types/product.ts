export type Product = {
  id: number;
  title: string;
  description: string;
  cost: number;
  banner: string;
}; 

export type ProductFormInputs = {
    title: string;
    description: string;
    cost: number;
    banner: FileList;
  };