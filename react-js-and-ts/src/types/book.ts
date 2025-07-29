export interface Book {
  _id: string;
  title: string;
  author: string;
  summary: string;
  images: string[];
  price: number;
  stock?: number;
}


export interface CartItem extends Book {
  quantity: number;
  selectedImage?: string; // Add this line
}



