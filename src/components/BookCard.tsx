import { motion } from "motion/react";
import { Book } from "../types";
import { cn } from "../lib/utils";
import { useState } from "react";

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  const getCoverUrl = () => {
    if (book.cover_i) return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg?default=false`;
    if (book.isbn && book.isbn.length > 0) return `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg?default=false`;
    return null;
  };

  const [imgSrc, setImgSrc] = useState(getCoverUrl() || "https://picsum.photos/seed/book/200/300?blur=2");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12 }}
      className="group cursor-pointer bg-black/5 rounded-2xl transition-all duration-500 border border-black/5 overflow-hidden hover:border-black/20"
      onClick={() => onClick(book)}
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-black/5">
        <img
          src={imgSrc}
          alt={book.title}
          onError={() => setImgSrc("https://picsum.photos/seed/book/200/300?blur=2")}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
          <span className="text-[#1a1a1a] text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-2 border border-black/20 rounded-full">
            Explore
          </span>
        </div>
      </div>
      <div className="p-6 space-y-2">
        <h3 className="font-serif text-lg text-[#1a1a1a]/90 line-clamp-2 leading-tight group-hover:text-black transition-colors">
          {book.title}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] uppercase tracking-widest text-black/40 truncate font-bold">
            {book.author_name?.[0] || "Unknown"}
          </p>
          {book.first_publish_year && (
            <p className="text-[10px] text-black/20 font-mono">
              {book.first_publish_year}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
