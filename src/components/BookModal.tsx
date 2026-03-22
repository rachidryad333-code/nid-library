import { motion, AnimatePresence } from "motion/react";
import { X, BookOpen, Calendar, Hash, Tag, Sparkles, Loader2 } from "lucide-react";
import { Book } from "../types";
import { useEffect, useState } from "react";
import { getBookInsights } from "../services/gemini";
import Markdown from "react-markdown";

interface BookModalProps {
  book: Book | null;
  onClose: () => void;
}

export function BookModal({ book, onClose }: BookModalProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCoverUrl = () => {
    if (!book) return null;
    if (book.cover_i) return `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg?default=false`;
    if (book.isbn && book.isbn.length > 0) return `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-L.jpg?default=false`;
    return null;
  };

  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    if (book) {
      setImgSrc(getCoverUrl());
      setLoading(true);
      setInsights(null);
      setDescription(null);

      // Fetch Gemini insights
      getBookInsights(book.title, book.author_name?.[0] || "Unknown Author")
        .then((res) => {
          setInsights(res || "No insights available.");
          setLoading(false);
        })
        .catch(() => {
          setInsights("Failed to load insights.");
          setLoading(false);
        });

      // Fetch full bibliographic data using .json extension
      fetch(`https://openlibrary.org${book.key}.json`)
        .then(res => res.json())
        .then(data => {
          const desc = data.description;
          if (typeof desc === 'string') {
            setDescription(desc);
          } else if (desc && typeof desc === 'object' && desc.value) {
            setDescription(desc.value);
          }
        })
        .catch(err => console.error("Error fetching work data:", err));
    }
  }, [book]);

  if (!book) return null;

  const openLibraryUrl = book.isbn 
    ? `https://openlibrary.org/isbn/${book.isbn[0]}`
    : `https://openlibrary.org${book.key}`;

  return (
    <AnimatePresence>
      {book && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-black/5"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-3 bg-black/5 backdrop-blur-xl rounded-full hover:bg-black/10 transition-colors border border-black/5"
            >
              <X className="w-5 h-5 text-black/60" />
            </button>

            {/* Left: Cover */}
            <div className="w-full md:w-[45%] aspect-[3/4] md:aspect-auto bg-black/5 relative">
              <img
                src={imgSrc || "https://picsum.photos/seed/book/400/600?blur=2"}
                alt={book.title}
                onError={() => setImgSrc("https://picsum.photos/seed/book/400/600?blur=2")}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-transparent md:hidden" />
            </div>

            {/* Right: Info */}
            <div className="flex-1 p-6 sm:p-12 overflow-y-auto no-scrollbar">
              <div className="space-y-8 sm:space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-[1px] w-6 sm:w-8 bg-black/20" />
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-bold text-black/30">Literary Insight</span>
                  </div>
                  <h2 className="text-2xl sm:text-5xl font-serif font-light text-[#1a1a1a] leading-[1.1]">
                    {book.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 sm:pt-4">
                    {book.author_key?.map((key, idx) => (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-black/10">
                          <img
                            src={`https://covers.openlibrary.org/a/olid/${key}-S.jpg?default=false`}
                            alt={book.author_name?.[idx]}
                            className="w-full h-full object-cover grayscale opacity-80"
                            onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.author_name?.[idx] || "A")}&background=eee&color=333`)}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <p className="text-[11px] uppercase tracking-widest font-bold text-black/60">
                          {book.author_name?.[idx]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {description && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase font-bold text-black/20 tracking-[0.2em]">Abstract</h3>
                    <p className="text-sm text-black/50 leading-relaxed font-light">
                      {description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-black/5">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-black/20 tracking-[0.2em]">Published</p>
                    <p className="text-sm font-medium text-black/70">{book.first_publish_year || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-black/20 tracking-[0.2em]">ISBN</p>
                    <p className="text-sm font-medium text-black/70 truncate">{book.isbn?.[0] || "N/A"}</p>
                  </div>
                </div>

                {/* Gemini Insights Section */}
                <div className="bg-black/[0.02] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-black/5 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-black/40" />
                    <h3 className="text-[9px] sm:text-[10px] uppercase font-bold text-black/40 tracking-[0.3em]">AI Synthesis</h3>
                  </div>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 text-black/20 animate-spin" />
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none text-black/60 font-light leading-relaxed">
                      <Markdown>{insights}</Markdown>
                    </div>
                  )}
                </div>

                {book.subject && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase font-bold text-black/20 tracking-[0.2em]">Taxonomy</h3>
                    <div className="flex flex-wrap gap-3">
                      {book.subject.slice(0, 6).map((s) => (
                        <span key={s} className="px-4 py-1.5 bg-black/5 text-black/40 text-[10px] uppercase tracking-widest font-bold rounded-full border border-black/5">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-8">
                  <a 
                    href={openLibraryUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-black/30 hover:text-black transition-colors"
                  >
                    Source Archive <BookOpen className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
