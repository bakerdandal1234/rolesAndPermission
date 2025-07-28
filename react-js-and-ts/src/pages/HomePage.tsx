import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

interface Book {
  _id: string;
  title: string;
  author: string;
  summary: string;
  image?: string;
  price: number;
}

const fetchBooks = async (): Promise<Book[]> => {
  const res = await axios.get('/api/books');
  return res.data;
};

function HomePage() {
  const { data: books = [], isLoading, isError, error } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks,
  });

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (isError) return <div className="text-center py-8 text-red-500">Error: {(error as Error).message}</div>;
 console.log("books", books);
  return (
    <div className="w-full px-4 py-8 dark:bg-gray-900 dark:text-white min-h-screen space-y-8">
      <h1 className="text-3xl font-bold text-center">Available Books</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map((book) => (
          <Card key={book._id} className="dark:bg-gray-800 dark:border-gray-700">
            {book.image && <img src={book.image} alt={book.title} className="w-full h-48 object-cover" />}
            <CardHeader>
              <CardTitle className="dark:text-white">title: {book.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">by {book.author}</p>
              <p className="mt-4">{book.summary}</p>
              <p className="mt-2 text-lg font-semibold">Price: ${book.price}</p>
              <Link to={`/product/${book._id}`}>
                <Button className="w-full mt-4">Product Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}

      </div>
    </div>
  );
}

export default HomePage;
