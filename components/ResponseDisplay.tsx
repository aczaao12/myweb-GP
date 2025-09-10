import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { GeminiResponse } from '../types';

interface ResponseDisplayProps {
  response: GeminiResponse | null;
  isLoading: boolean;
  isStreaming: boolean;
  warnings?: string[];
}

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 rounded-lg my-4 relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-gray-400 hover:text-white text-xs px-2 py-1 bg-gray-700 rounded"
      >
        {copied ? 'Đã chép!' : 'Chép'}
      </button>
      <pre className="p-4 overflow-x-auto text-sm text-white rounded-lg">
        <code>{code}</code>
      </pre>
    </div>
  );
};


const FormattedContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="prose prose-sm sm:prose dark:prose-invert max-w-none break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const isInline = !String(children).includes('\n');
            
            if (isInline) {
              return <code className={className} {...props}>{children}</code>;
            }
            
            return <CodeBlock code={String(children).replace(/\n$/, '')} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const WarningDisplay: React.FC<{ warnings: string[] }> = ({ warnings }) => (
    <div className="p-4 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-r-lg">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Cảnh báo tiềm ẩn</h4>
        <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
            {warnings.map((warning, index) => <li key={index}>{warning}</li>)}
        </ul>
    </div>
);

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, isLoading, isStreaming, warnings }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!response) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        <h3 className="text-lg font-medium">Xin chào!</h3>
        <p>Hãy nhập yêu cầu của bạn vào ô bên dưới để bắt đầu.</p>
      </div>
    );
  }

  if (response.status === 'error') {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="font-semibold text-red-800 dark:text-red-200">Đã xảy ra lỗi</h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">{response.content}</p>
      </div>
    );
  }

  return (
    <div>
        {warnings && warnings.length > 0 && <WarningDisplay warnings={warnings} />}
        <FormattedContent content={response.content} />
        {isStreaming && <span className="inline-block w-2 h-5 align-bottom bg-primary-500 animate-pulse ml-1" />}
    </div>
  );
};
