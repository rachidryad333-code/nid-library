import { useState, useEffect, useCallback } from "react";
import { 
  Book as BookIcon, Loader2, Sparkles, 
  Menu, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Book, SearchResponse } from "./types";
import { BookCard } from "./components/BookCard";
import { BookModal } from "./components/BookModal";
import { cn } from "./lib/utils";

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("relevance");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    "All", "Fiction", "Science", "History", "Art", "Biography", 
    "Fantasy", "Mystery", "Romance", "Children"
  ];

  const searchBooks = useCallback(async (searchQuery: string, pageNum: number = 1, append: boolean = false, category: string = "All") => {
    if (!searchQuery.trim() && category === "All") return;
    if (append) setLoadingMore(true);
    else setLoading(true);
    
    setError(null);
    const fields = "key,title,author_name,author_key,first_publish_year,cover_i,isbn,subject";
    const sortParam = sortBy !== "relevance" ? `&sort=${sortBy}` : "";
    
    let finalQuery = searchQuery;
    if (category !== "All") {
      const subjectFilter = `subject:${category.toLowerCase()}`;
      finalQuery = searchQuery ? `${searchQuery} ${subjectFilter}` : subjectFilter;
    }

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(finalQuery)}&fields=${fields}${sortParam}&page=${pageNum}&limit=20`
      );
      if (!response.ok) throw new Error("Failed to fetch books");
      const data: SearchResponse = await response.json();
      
      setBooks(prev => {
        const newBooks = append ? [...prev, ...data.docs] : data.docs;
        // Remove duplicates
        const uniqueKeys = new Set();
        return newBooks.filter(book => {
          if (uniqueKeys.has(book.key)) return false;
          uniqueKeys.add(book.key);
          return true;
        });
      });
      
      setHasMore(data.docs.length === 20);
      setPage(pageNum);
    } catch (err) {
      setError("Something went wrong while searching. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sortBy]);

  useEffect(() => {
    searchBooks("classic literature", 1, false, selectedCategory);
  }, [searchBooks, selectedCategory]);

  const handleLoadMore = () => {
    searchBooks(selectedCategory === "All" ? "classic literature" : "", page + 1, true, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a1a] font-sans selection:bg-black/5 selection:text-[#1a1a1a]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#f8f7f4]/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium text-black/40">Literary Explorer</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.15em] font-semibold text-black/50">
              <a href="#" className="hover:text-black transition-colors">Discover</a>
              <a href="#" className="hover:text-black transition-colors">Collections</a>
              <a href="#" className="hover:text-black transition-colors">Insights</a>
            </nav>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-black/40 hover:text-black transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-black/5 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <a href="#" className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black/30 hover:text-black">Discover</a>
                <a href="#" className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black/30 hover:text-black">Collections</a>
                <a href="#" className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black/30 hover:text-black">Insights</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Hero Section */}
        <section className="text-left mb-20 sm:mb-32 space-y-6 sm:space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="h-[1px] w-8 sm:w-12 bg-black/20" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-bold text-black/30">Curated Selection</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl sm:text-8xl font-serif font-light tracking-tight leading-[1] sm:leading-[0.9] max-w-4xl text-[#1a1a1a]"
          >
            The Art of <br className="hidden sm:block" />
            <span className="italic text-black/60">Great Literature</span>
          </motion.h2>
        </section>

        {/* Categories & Sort */}
        <section className="mb-16 space-y-12">
          <div className="flex items-center gap-3 overflow-x-auto pb-6 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "px-8 py-2.5 rounded-full text-[11px] uppercase tracking-widest font-bold transition-all border",
                  selectedCategory === cat
                    ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                    : "bg-transparent text-black/40 border-black/10 hover:border-black/30 hover:text-black"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-b border-black/5 pb-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/20">Displaying</span>
              <h3 className="text-sm font-medium tracking-wide text-black/60">
                {loading ? "Searching..." : books.length > 0 ? "Selected Works" : "Featured"}
              </h3>
            </div>
            
            <div className="flex items-center gap-6">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/20">Sort</span>
              <select 
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-[11px] font-bold uppercase tracking-wider bg-transparent border-none focus:ring-0 text-black/60 cursor-pointer hover:text-black transition-colors"
              >
                <option value="relevance" className="bg-white">Relevance</option>
                <option value="new" className="bg-white">Newest</option>
                <option value="old" className="bg-white">Oldest</option>
              </select>
            </div>
          </div>
        </section>

        {/* Results Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <Loader2 className="w-8 h-8 text-black/10 animate-spin" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/20 font-bold">Curating Collection</p>
          </div>
        ) : error ? (
          <div className="bg-black/5 border border-black/5 p-12 rounded-3xl text-center">
            <p className="text-black/40 font-medium">{error}</p>
          </div>
        ) : (
          <div className="space-y-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
              <AnimatePresence mode="popLayout">
                {books.map((book) => (
                  <BookCard
                    key={book.key}
                    book={book}
                    onClick={setSelectedBook}
                  />
                ))}
              </AnimatePresence>
            </div>

            {hasMore && !loading && (
              <div className="flex justify-center pt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="group flex flex-col items-center gap-4 disabled:opacity-50"
                >
                  <div className="w-16 h-16 rounded-full border border-black/10 flex items-center justify-center group-hover:border-black/30 transition-all duration-500">
                    {loadingMore ? (
                      <Loader2 className="w-5 h-5 animate-spin text-black/20" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-black/20 group-hover:text-black transition-colors" />
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/20 group-hover:text-black/40 transition-colors">Load More</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#f2f1ed] border-t border-black/5 py-20 mt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/10">Literary Explorer &copy; 2026</span>
            <div className="flex gap-12 text-[10px] uppercase tracking-[0.2em] font-bold text-black/30">
              <a href="#" className="hover:text-black transition-colors">Privacy</a>
              <a href="#" className="hover:text-black transition-colors">Terms</a>
              <a href="#" className="hover:text-black transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Book Modal */}
      <BookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </div>
  );
}
