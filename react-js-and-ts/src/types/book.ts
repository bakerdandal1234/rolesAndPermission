export interface Book {
  _id: string;
  title: string;
  author: string;
  summary: string;
  image?: string;
  price: number;
  stock?: number;
}


export interface CartItem extends Book {
  quantity: number;
}



