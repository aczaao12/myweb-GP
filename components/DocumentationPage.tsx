import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface DocumentationPageProps {
  onClose: () => void;
}

const DocSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-primary-600 dark:text-primary-400 border-b pb-2 border-gray-300 dark:border-gray-600">{title}</h2>
        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none break-words space-y-4">
            {children}
        </div>
    </section>
);

const CodeSnippet: React.FC<{ children: React.ReactNode; lang?: string }> = ({ children, lang }) => (
    <pre className={`bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm ${lang ? `language-${lang}` : ''}`}>
        <code className="text-gray-800 dark:text-gray-200">{children}</code>
    </pre>
);

const Alert: React.FC<{ type?: 'info' | 'warning', children: React.ReactNode }> = ({ type = 'info', children }) => {
    const colorClasses = {
        info: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-l-4 border-blue-400 dark:border-blue-600',
            text: 'text-blue-800 dark:text-blue-200',
        },
        warning: {
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-l-4 border-yellow-400 dark:border-yellow-600',
            text: 'text-yellow-800 dark:text-yellow-200',
        },
    };
    const classes = colorClasses[type];
    return (
        <div className={`p-4 ${classes.bg} ${classes.border}`}>
            <p className={classes.text}>{children}</p>
        </div>
    );
};

const workerCode = `
// Import the Google GenAI SDK
import { GoogleGenAI } from "@google/genai";

// Function to add CORS headers to a response
const addCorsHeaders = (response) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
};

// Pre-processing logic for the prompt
const preprocessPrompt = (rawPrompt, task) => {
  let processedPrompt = rawPrompt;
  const today = new Date().toLocaleDateString('vi-VN');
  processedPrompt = processedPrompt.replace(/hôm nay/gi, today);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  processedPrompt = processedPrompt.replace(/hôm qua/gi, yesterday.toLocaleDateString('vi-VN'));
  
  let context = '';
  switch (task) {
    case 'code':
      context = 'Hãy viết code React cho một ứng dụng Vite sử dụng TypeScript và Tailwind CSS.';
      break;
    case 'fix_bug':
      context = 'Phân tích đoạn code sau, tìm ra lỗi, giải thích ngắn gọn và cung cấp code đã sửa.';
      break;
    case 'explain':
      context = 'Giải thích khái niệm hoặc đoạn code sau một cách ngắn gọn.';
      break;
    case 'optimize_code':
      context = 'Phân tích đoạn code sau, đề xuất các cách tối ưu và cung cấp code đã tối ưu.';
      break;
  }
  return \`\${context}\\n\\n---\\n\\n**Yêu cầu:**\\n\${processedPrompt}\`;
};


export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return addCorsHeaders(new Response(null, { status: 204 }));
    }

    if (request.method !== "POST") {
      const response = new Response("Method Not Allowed", { status: 405 });
      return addCorsHeaders(response);
    }
    
    // --- Get Gemini API Key from secrets ---
    const GEMINI_API_KEY = env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        const response = new Response("GEMINI_API_KEY secret not set", { status: 500 });
        return addCorsHeaders(response);
    }
    
    try {
      const { prompt, task } = await request.json();
      if (!prompt || !task) {
        const response = new Response('Missing "prompt" or "task" in request body.', { status: 400 });
        return addCorsHeaders(response);
      }

      const finalPrompt = preprocessPrompt(prompt, task);

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: finalPrompt,
      });

      // Create a transform stream to process the chunks
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      // Pipe the Gemini stream to our response stream
      (async () => {
        for await (const chunk of responseStream) {
          writer.write(encoder.encode(chunk.text));
        }
        writer.close();
      })();
      
      const response = new Response(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
      
      return addCorsHeaders(response);

    } catch (error) {
      console.error("Error in worker:", error);
      const response = new Response(\`Internal Server Error: \${error.message}\`, { status: 500 });
      return addCorsHeaders(response);
    }
  },
};
`.trim();


export const DocumentationPage: React.FC<DocumentationPageProps> = ({ onClose }) => {
  return (
    <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Hướng Dẫn & Kiến Trúc</h1>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close documentation">
            <CloseIcon className="w-6 h-6" />
          </button>
      </header>
      
      <div className="p-8 overflow-y-auto">
        <DocSection title="Tổng quan kiến trúc (Cloudflare Worker)">
            <p>
                Chào mừng bạn! Ứng dụng này sử dụng kiến trúc hybrid hiện đại, kết hợp sức mạnh của Cloudflare Workers cho phần backend và Firebase cho lưu trữ dữ liệu.
            </p>
            <p>Luồng hoạt động như sau:</p>
             <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center font-mono text-sm">
                <span className="font-bold text-primary-600">React UI</span> → <span className="font-bold text-orange-500">Cloudflare Worker</span> → <span className="font-bold text-yellow-600">Gemini API</span>
            </div>
             <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center font-mono text-sm mt-2">
                <span className="font-bold text-primary-600">React UI</span> ↔️ <span className="font-bold text-red-500">Firebase (Auth & RTDB)</span>
            </div>
            <ul className="list-disc pl-5 mt-4">
                <li><strong>Giao diện Web (Frontend):</strong> Khi bạn gửi yêu cầu, nó sẽ gọi một Cloudflare Worker.</li>
                <li><strong>Cloudflare Worker (Backend):</strong> Đây là code JavaScript chạy trên mạng lưới toàn cầu của Cloudflare. Nó nhận yêu cầu, xử lý prompt, và gọi Gemini API một cách an toàn (vì API Key được lưu trên Cloudflare), sau đó stream kết quả về cho bạn.</li>
                <li><strong>Firebase (Auth & RTDB):</strong> Được dùng để xác thực người dùng (một cách ẩn danh) và lưu trữ lịch sử cuộc trò chuyện trong Realtime Database.</li>
            </ul>
        </DocSection>

        <DocSection title="Phần 1: Cài đặt Backend (Cloudflare Worker)">
             <h3 className="text-lg font-semibold !mt-6">Bước 1: Chuẩn bị môi trường Cloudflare</h3>
             <ul className="list-disc pl-5">
                <li>Có một tài khoản Cloudflare.</li>
                <li>Cài đặt Node.js và npm.</li>
                <li>Cài đặt Wrangler CLI (công cụ dòng lệnh của Cloudflare): <code>npm install -g wrangler</code>.</li>
                <li>Đăng nhập vào tài khoản Cloudflare của bạn: <code>wrangler login</code>.</li>
             </ul>

            <h3 className="text-lg font-semibold !mt-6">Bước 2: Tạo và Cấu hình Worker</h3>
            <p>Tạo một thư mục mới cho worker và chạy lệnh khởi tạo:</p>
            <CodeSnippet lang="bash">{`mkdir my-gemini-worker\ncd my-gemini-worker\nwrangler init -y`}</CodeSnippet>
            <p>Thao tác này sẽ tạo ra một project worker cơ bản.</p>
            <p>Bên trong thư mục `my-gemini-worker`, bạn sẽ thấy file <code>src/index.js</code> (hoặc .ts). Mở file này và thay thế toàn bộ nội dung bằng code sau:</p>
            <CodeSnippet lang="javascript">{workerCode}</CodeSnippet>
            <Alert>Worker này đã bao gồm logic xử lý CORS, tiền xử lý prompt và streaming kết quả từ Gemini API.</Alert>
            <p>Tiếp theo, bạn cần cài đặt SDK của Google GenAI vào project worker:</p>
             <CodeSnippet lang="bash">npm install @google/genai</CodeSnippet>

            <h3 className="text-lg font-semibold !mt-6">Bước 3: Cấu hình API Key an toàn</h3>
             <ol className="list-decimal pl-5">
                <li>Lấy API Key của bạn từ <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">Google AI Studio</a>.</li>
                <li>Trong terminal (tại thư mục worker), chạy lệnh sau để lưu key dưới dạng secret. Thao tác này rất an toàn và key của bạn sẽ không bị lộ.</li>
             </ol>
             <CodeSnippet lang="bash">wrangler secret put GEMINI_API_KEY</CodeSnippet>
             <p>Dán key của bạn vào khi được hỏi và nhấn Enter.</p>

            <h3 className="text-lg font-semibold !mt-6">Bước 4: Deploy Worker</h3>
            <p>Trong terminal (tại thư mục worker), chạy lệnh:</p>
            <CodeSnippet lang="bash">wrangler deploy</CodeSnippet>
            <p>Sau khi deploy thành công, terminal sẽ hiển thị URL của Worker (ví dụ: `https://my-gemini-worker.your-account.workers.dev`). Hãy sao chép URL này.</p>
        </DocSection>
        
        <DocSection title="Phần 2: Cài đặt Frontend">
             <h3 className="text-lg font-semibold !mt-6">Bước 1: Cấu hình ứng dụng</h3>
              <ol className="list-decimal pl-5">
                <li>Mở ứng dụng web này.</li>
                <li>Nhấn vào biểu tượng ⚙️ để mở trang <strong>Cài đặt</strong>.</li>
                <li>Dán <strong>Cloudflare Worker URL</strong> bạn đã sao chép ở trên vào ô tương ứng.</li>
                <li>Trong Firebase Console (Project Settings > General), tìm và sao chép đối tượng <strong>Firebase Config</strong> cho Web App của bạn.</li>
                <li>Dán đối tượng này vào ô "Firebase Config (dạng JSON)".</li>
                <li>Nhấn "Lưu cấu hình".</li>
             </ol>

             <h3 className="text-lg font-semibold !mt-6">Bước 2: Cấu hình bảo mật RTDB</h3>
             <p>Để đảm bảo người dùng chỉ có thể đọc/ghi lịch sử của chính họ, hãy cập nhật Rules cho Realtime Database trong Firebase Console:</p>
             <CodeSnippet lang="json">{`
{
  "rules": {
    "history": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
             `}</CodeSnippet>

             <p className="!mt-6"><strong>Chúc mừng!</strong> Frontend và backend của bạn giờ đã được kết nối. Ứng dụng đã sẵn sàng để sử dụng!</p>
        </DocSection>
      </div>
    </div>
  );
};
