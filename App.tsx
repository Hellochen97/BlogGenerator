import { useEffect, useMemo, useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { CheckCircle, History, LogOut, Plus, Save, Sparkles } from 'lucide-react';
import { DEFAULT_WIZARD_DATA, STEPS } from './constants';
import { auth, db, isAuthEnabled, logout, signInWithGoogle } from './firebase';
import { isAllowedEmailDomain } from './authPolicy';
import type { BlogIdea, SavedPost, StepId, WizardData } from './types';
import Button from './components/ui/Button';
import Loader from './components/ui/Loader';
import ProgressBar from './components/ui/ProgressBar';
import LoginScreen from './components/LoginScreen';
import HistoryView from './components/HistoryView';
import HistoryDetailView from './components/HistoryDetailView';
import Step1Language from './components/steps/Step1Language';
import Step2Keywords from './components/steps/Step2Keywords';
import Step3Requests from './components/steps/Step3Requests';
import Step4Ideas from './components/steps/Step4Ideas';
import Step5WordCount from './components/steps/Step5WordCount';
import Step6Outline from './components/steps/Step6Outline';
import Step7Article from './components/steps/Step7Article';
import Step8SEO from './components/steps/Step8SEO';

const clientMockEnabled = import.meta.env.VITE_ENABLE_CLIENT_MOCK !== 'false';

export default function App() {
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [data, setData] = useState<WizardData>(DEFAULT_WIZARD_DATA);
  const [ideas, setIdeas] = useState<BlogIdea[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!isAuthEnabled);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryPost, setSelectedHistoryPost] = useState<SavedPost | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (!isAuthEnabled || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser && !isAllowedEmailDomain(nextUser.email)) {
        await logout();
        setUser(null);
      } else {
        setUser(nextUser);
      }
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  const currentStepIndex = useMemo(() => STEPS.findIndex((step) => step.id === currentStep), [currentStep]);
  const currentStepMeta = STEPS[currentStepIndex];
  const canSave = isAuthEnabled && Boolean(user && db && data.article);

  function updateData<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  function startNewDraft() {
    setData(DEFAULT_WIZARD_DATA);
    setIdeas([]);
    setCurrentStep(1);
    setShowHistory(false);
    setSelectedHistoryPost(null);
    setSaveState('idle');
  }

  async function saveToHistory() {
    if (!canSave || !user || !db) return;

    setSaveState('saving');
    try {
      await addDoc(collection(db, 'blogPosts'), {
        ...data,
        authorUid: user.uid,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
      });
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1800);
    } catch (error) {
      console.error(error);
      setSaveState('error');
    }
  }

  function loadHistoryPost(post: SavedPost) {
    setSelectedHistoryPost(post);
    setData({
      language: post.language,
      mainKeyword: post.mainKeyword,
      relatedKeywords: post.relatedKeywords,
      additionalRequests: post.additionalRequests,
      selectedIdea: post.selectedIdea,
      targetWordCount: post.targetWordCount,
      outline: post.outline,
      article: post.article,
      geoReport: post.geoReport,
      seoMetadata: post.seoMetadata,
    });
    setCurrentStep(7);
    setShowHistory(false);
  }

  function renderStep() {
    switch (currentStep) {
      case 1:
        return <Step1Language value={data.language} onChange={(value) => updateData('language', value)} />;
      case 2:
        return (
          <Step2Keywords
            mainKeyword={data.mainKeyword}
            relatedKeywords={data.relatedKeywords}
            onMainKeywordChange={(value) => updateData('mainKeyword', value)}
            onRelatedKeywordsChange={(value) => updateData('relatedKeywords', value)}
          />
        );
      case 3:
        return <Step3Requests value={data.additionalRequests} onChange={(value) => updateData('additionalRequests', value)} />;
      case 4:
        return (
          <Step4Ideas
            data={data}
            ideas={ideas}
            onIdeasChange={setIdeas}
            onSelectIdea={(idea) => {
              updateData('selectedIdea', idea);
              setCurrentStep(5);
            }}
          />
        );
      case 5:
        return <Step5WordCount value={data.targetWordCount} onChange={(value) => updateData('targetWordCount', value)} />;
      case 6:
        return <Step6Outline data={data} onChange={(value) => updateData('outline', value)} />;
      case 7:
        return <Step7Article data={data} onChange={setData} />;
      case 8:
        return <Step8SEO data={data} onChange={(value) => updateData('seoMetadata', value)} />;
      default:
        return null;
    }
  }

  if (isAuthEnabled && !authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader label="Preparing workspace" />
      </div>
    );
  }

  if (isAuthEnabled && !user) {
    return <LoginScreen onLogin={signInWithGoogle} />;
  }

  if (selectedHistoryPost) {
    return <HistoryDetailView post={selectedHistoryPost} onBack={() => setSelectedHistoryPost(null)} onLoad={loadHistoryPost} />;
  }

  if (showHistory && isAuthEnabled) {
    return <HistoryView onBack={() => setShowHistory(false)} onLoadPost={loadHistoryPost} />;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white">
              <Sparkles size={20} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-normal text-ink">BlogGenerator</h1>
              <p className="text-sm text-slate-500">{clientMockEnabled ? 'Local mock mode' : 'Server generation mode'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAuthEnabled && (
              <Button variant="ghost" icon={<History size={17} />} onClick={() => setShowHistory(true)}>
                History
              </Button>
            )}
            <Button variant="secondary" icon={<Plus size={17} />} onClick={startNewDraft}>
              New Draft
            </Button>
            {canSave && (
              <Button
                variant={saveState === 'saved' ? 'success' : 'primary'}
                icon={saveState === 'saved' ? <CheckCircle size={17} /> : <Save size={17} />}
                isLoading={saveState === 'saving'}
                onClick={saveToHistory}
              >
                {saveState === 'saved' ? 'Saved' : 'Save'}
              </Button>
            )}
            {isAuthEnabled && user && (
              <Button variant="ghost" icon={<LogOut size={17} />} onClick={logout}>
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="rounded-lg border border-slate-200 bg-white p-4">
          <ProgressBar currentStep={currentStep} />
          <nav className="mt-5 space-y-1" aria-label="Generator steps">
            {STEPS.map((step) => {
              const isActive = step.id === currentStep;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold ${
                    isActive ? 'bg-sage text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{step.title}</span>
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{step.id}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-sm font-semibold uppercase tracking-normal text-sage">Step {currentStep}</p>
            <h2 className="mt-1 text-2xl font-extrabold text-ink">{currentStepMeta?.title}</h2>
          </div>

          <div className="p-5">{renderStep()}</div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-between">
            <Button
              variant="ghost"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((Math.max(1, currentStep - 1) as StepId))}
            >
              Back
            </Button>
            <Button
              variant="primary"
              disabled={currentStep === 8}
              onClick={() => setCurrentStep((Math.min(8, currentStep + 1) as StepId))}
            >
              Next
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
