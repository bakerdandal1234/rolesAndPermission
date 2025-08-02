export interface Media {
  _id: string;
  url: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  summary: string;
  price: number;
  stock: number;
  media: Media[];
  category: Category;
  images?: any[]; 
}