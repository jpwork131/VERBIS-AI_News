import { useState } from "react";
import { commentArticle } from "../../api/articles";
import useLoginCheck from "../../hooks/LoginCheck";
import { MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";

const CommentBox = ({ articleId, comments, onNewComment }) => {
  const [text, setText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checkLogin = useLoginCheck();

  const toggleComments = () => setShowComments((prev) => !prev);

  const submitComment = () =>
    checkLogin(async () => {
      if (text.trim() === "") return;
      setIsSubmitting(true);
      try {
        const res = await commentArticle(articleId, text);
        onNewComment(res.data);
        setText("");
      } catch (err) {
        console.error("Comment failed", err);
      } finally {
        setIsSubmitting(false);
      }
    });

  return (
    <div className="mt-8 border-t border-white/20 pt-6">
      {/* Toggle Button */}
      <button
        onClick={toggleComments}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
          showComments 
            ? "bg-foreground text-background" 
            : "bg-white/40 backdrop-blur-md text-foreground hover:bg-white/60 border border-white/40"
        }`}
      >
        <MessageSquare size={14} strokeWidth={2.5} />
        {showComments ? "Close Discussion" : `View Comments (${comments.length})`}
        {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {showComments && (
        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          
          {/* Comment List */}
          <div className="space-y-4 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
            {comments.length === 0 ? (
              <p className="text-sm italic text-muted-foreground/60 font-serif">
                No thoughts shared yet. Be the first to start the conversation.
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c._id}
                  className="rounded-2xl bg-white/30 p-5 text-sm backdrop-blur-sm border border-white/40 shadow-sm transition-all hover:bg-white/50"
                >
                  <p className="font-sans leading-relaxed text-foreground/90">
                    {c.comment}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="relative group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Join the discussion..."
              className="w-full min-h-30 rounded-2xl border border-white/60 bg-white/50 p-5 text-sm font-sans placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all backdrop-blur-xl shadow-inner"
            />
            
            <button
              onClick={submitComment}
              disabled={isSubmitting || !text.trim()}
              className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-background transition-all hover:bg-primary hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentBox;