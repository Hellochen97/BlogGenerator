import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { ArrowLeft, FileText, Trash2 } from 'lucide-react';
import { auth, db } from '../firebase';
import type { SavedPost } from '../types';
import Button from './ui/Button';
import Loader from './ui/Loader';

interface HistoryViewProps {
  onBack: () => void;
  onLoadPost: (post: SavedPost) => void;
}

export default function HistoryView({ onBack, onLoadPost }: HistoryViewProps) {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      if (!auth?.currentUser || !db) {
        setPosts([]);
        setIsLoading(false);
        return;
      }

      try {
        const snapshot = await getDocs(
          query(collection(db, 'blogPosts'), where('authorUid', '==', auth.currentUser.uid), orderBy('createdAt', 'desc')),
        );
        setPosts(snapshot.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<SavedPost, 'id'>) })));
      } catch (nextError) {
        console.error(nextError);
        setError('Unable to load saved drafts.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, []);

  async function deletePost(postId: string) {
    if (!db) return;
    await deleteDoc(doc(db, 'blogPosts', postId));
    setPosts((current) => current.filter((post) => post.id !== postId));
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-sage">Saved drafts</p>
            <h1 className="text-2xl font-extrabold text-ink">History</h1>
          </div>
          <Button variant="ghost" icon={<ArrowLeft size={17} />} onClick={onBack}>
            Back
          </Button>
        </div>

        <div className="p-5">
          {isLoading && <Loader label="Loading saved drafts" />}
          {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {!isLoading && posts.length === 0 && <p className="text-sm text-slate-500">No saved drafts yet.</p>}

          <div className="space-y-3">
            {posts.map((post) => (
              <article key={post.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <button type="button" className="flex-1 text-left" onClick={() => onLoadPost(post)}>
                    <div className="flex items-center gap-2 text-sm font-semibold text-sage">
                      <FileText size={16} aria-hidden="true" />
                      <span>{post.language}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-bold text-ink">{post.selectedIdea?.title || post.mainKeyword || 'Untitled draft'}</h2>
                    <p className="mt-1 text-sm text-slate-500">{post.mainKeyword}</p>
                  </button>
                  <Button variant="ghost" icon={<Trash2 size={16} />} onClick={() => deletePost(post.id)}>
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
