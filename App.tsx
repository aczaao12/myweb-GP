import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { getDatabase, ref, onValue, set, push, query, orderByChild, serverTimestamp } from 'firebase/database';
import type { HistoryItem, TaskType } from './types';
import { TASK_TYPES } from './constants';
import { analyzePrompt, generateContentStream } from './services/geminiService';
import { Header } from './components/Header';
import { HistoryPanel } from './components/HistoryPanel';
import { ResponseDisplay } from './components/ResponseDisplay';
import { InputArea } from './components/InputArea';
import { SettingsPage } from './components/SettingsPage';
import { DocumentationPage } from './components/DocumentationPage';
import { useSettings } from './hooks/useSettings';
import { initializeFirebase } from './firebase';
import { useAuth } from './hooks/useAuth';

type View = 'chat' | 'settings' | 'docs';

const App: React.FC = () => {
  const { settings } = useSettings();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTaskType, setActiveTaskType] = useState<TaskType>(TASK_TYPES[0].value);
  const [activeView, setActiveView] = useState<View>('chat');
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    if (settings.firebaseConfig) {
      const handles = initializeFirebase(settings.firebaseConfig);
      setIsFirebaseReady(!!handles);
    } else {
      setIsFirebaseReady(false);
    }
  }, [settings.firebaseConfig]);

  const { user } = useAuth(isFirebaseReady);

  useEffect(() => {
    if (!user) return;

    const db = getDatabase();
    const historyRef = query(ref(db, `history/${user.uid}`), orderByChild('timestamp'));
    
    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      const historyList: HistoryItem[] = data
        ? Object.entries(data).map(([id, item]) => ({
            id,
            ...(item as Omit<HistoryItem, 'id'>),
          })).reverse()
        : [];
      setHistory(historyList);
    });

    return () => unsubscribe();
  }, [user]);
  
  const activeConversation = useMemo(() => {
    return history.find(item => item.id === activeConversationId) || null;
  }, [history, activeConversationId]);
  
  const handleSubmit = useCallback(async (prompt: string, task: TaskType) => {
    if (!isFirebaseReady || !user) {
        alert("Firebase chưa được cấu hình. Vui lòng kiểm tra trang Cài đặt.");
        return;
    }
    if (!settings.workerUrl) {
        alert("URL Cloudflare Worker chưa được cấu hình. Vui lòng kiểm tra trang Cài đặt.");
        return;
    }

    setIsLoading(true);
    setIsStreaming(true);
    
    const { warnings } = analyzePrompt(prompt);

    // Create a temporary ID for the new conversation
    const tempId = `temp_${Date.now()}`;
    setActiveConversationId(tempId);
    
    const newItem: HistoryItem = {
      id: tempId,
      prompt,
      response: { status: 'ok', content: '' },
      task,
      timestamp: new Date().toISOString(),
      warnings,
    };

    // Add new item to local state immediately for better UX
    setHistory(prev => [newItem, ...prev]);

    await generateContentStream(prompt, task, settings.workerUrl, {
      onUpdate: (chunk) => {
        setHistory(prev => prev.map(item => 
          item.id === tempId 
            ? { ...item, response: { ...item.response, content: item.response.content + chunk } }
            : item
        ));
      },
      onComplete: async () => {
        setIsLoading(false);
        setIsStreaming(false);
        
        // Finalize the conversation and save to Firebase
        setHistory(prev => {
          const finalHistory = [...prev];
          const finalItemIndex = finalHistory.findIndex(item => item.id === tempId);
          if (finalItemIndex === -1) return prev; // Should not happen

          const finalItem = finalHistory[finalItemIndex];
          const db = getDatabase();
          const historyListRef = ref(db, `history/${user.uid}`);
          const newHistoryItemRef = push(historyListRef);
          
          const dbItem = {
              ...finalItem,
              timestamp: serverTimestamp(), // Use server timestamp for consistency
          };
          delete (dbItem as any).id; // Don't save temp id to db

          set(newHistoryItemRef, dbItem);
          
          // Update local state with the real ID from Firebase
          finalHistory[finalItemIndex] = { ...finalItem, id: newHistoryItemRef.key! };
          setActiveConversationId(newHistoryItemRef.key!);
          
          return finalHistory;
        });
      },
      onError: (error) => {
        setIsLoading(false);
        setIsStreaming(false);
        setHistory(prev => prev.map(item =>
          item.id === tempId
            ? { ...item, response: { status: 'error', content: error.message } }
            : item
        ));
      },
    });

  }, [isFirebaseReady, user, settings.workerUrl]);

  const handleSelectHistory = (item: HistoryItem) => {
    setActiveConversationId(item.id);
    setIsLoading(false);
    setIsStreaming(false);
  };

  const renderContent = () => {
    switch(activeView) {
      case 'settings':
        return <SettingsPage onClose={() => setActiveView('chat')} />;
      case 'docs':
        return <DocumentationPage onClose={() => setActiveView('chat')} />;
      case 'chat':
      default:
        return (
          <>
            <Header 
              onOpenSettings={() => setActiveView('settings')} 
              onOpenDocs={() => setActiveView('docs')}
            />
            <div className="flex flex-1 overflow-hidden">
              <aside className="w-1/4 max-w-xs bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto hidden md:block">
                <HistoryPanel history={history} onSelect={handleSelectHistory} activeItemId={activeConversationId} />
              </aside>
              
              <main className="flex-1 flex flex-col">
                <div className="flex-1 p-6 overflow-y-auto">
                  <ResponseDisplay 
                    response={activeConversation ? activeConversation.response : null}
                    isLoading={isLoading && !isStreaming}
                    isStreaming={isStreaming}
                    warnings={activeConversation?.warnings}
                  />
                </div>
                
                <InputArea 
                  onSubmit={handleSubmit} 
                  isLoading={isLoading} 
                  activeTaskType={activeTaskType}
                  setActiveTaskType={setActiveTaskType}
                />
              </main>
            </div>
          </>
        );
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">
      {renderContent()}
    </div>
  );
};

export default App;
