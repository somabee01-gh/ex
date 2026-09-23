import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Invoice Recognition API
  app.post('/api/recognize-invoice', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: '請提供發票或收據圖片' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: '系統未設定 GEMINI_API_KEY，請於 Settings > Secrets 設定。',
          fallbackAvailable: true,
        });
      }

      const ai = getGenAI();

      // Clean base64 string
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      const prompt = `你是一個專業的台灣發票與帳單辨識專家，請仔細分析這張上傳的發票、收據或消費憑證（例如：全聯福利中心、7-11超商、全家、家樂福、中油加油站等台灣統一發票電子發票證明聯、傳統二三聯發票或店家收據）。

【特別注意】：
- 台灣電子發票證明聯通常頂端為商家名稱（如「全聯福利中心」、「統一超商」等）。
- 發票字軌號碼通常為兩個英文大寫字母加8位數字（如 WK-64233410）。
- 年月份（如 115年01-02月，請轉換為西元 2026 年，若是 113年為 2024 年，114年為 2025 年；或參考下方日期時間）。
- 請辨識總金額 (總計/新台幣/NT$)，若圖片底部有折損或模糊，請從可見的品項或條碼 QR Code 旁字樣推估，若無法完全確定金額可填寫 0 並在 notes 註明。

請辨識並抽取以下資訊，並依據使用者的嚴格記帳分類規則進行歸類：
【主分類與子分類規則】：
1. 「伙食」：子分類只能是以下其中之一：「早餐」、「午餐」、「晚餐」、「飲料」、「點心」。如果無法精確分辨用餐時間，請依品項或時間判斷（如清晨早上為早餐、奶茶/咖啡/手搖飲為飲料、雞蛋糕/餅乾/甜點為點心、中午為午餐、傍晚為晚餐）。
2. 「交通工具」：子分類只能是以下其中之一：「加油」、「保養」、「停車費」（加油站汽油柴油為加油；汽機車維修、換機油、齒輪油、輪胎、定期保養均為保養；路邊停車格、公私立停車場、嘟嘟房、日月亭、月租停車、停車單繳費為停車費）。
3. 「服飾」：無特定子分類，填寫空字串 ""。
4. 「日用品」：無特定子分類，填寫空字串 ""（全聯、寶雅、家樂福等生鮮雜貨若無特定餐點，預設建議歸為「日用品」或依購買品項歸類）。
5. 「網購」：子分類只能是以下其中之一：「蝦皮」、「淘寶」、「MOMO」；若非這三者則分類至最相關項目。
6. 「書籍」：子分類只能是以下其中之一：「數學」、「物理」、「化學」、「通識」、「加工」。
7. 若完全不符合上述六大類，主分類為「其他」，子分類為空字串 ""。

請以繁體中文 (台灣) 回傳精確的 JSON 資料。`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          invoiceNumber: {
            type: Type.STRING,
            description: '發票號碼，如 AB-12345678 或空字串',
          },
          date: {
            type: Type.STRING,
            description: '消費日期，格式 YYYY-MM-DD，若年為民國年請轉換為西元年 (例如 115年 -> 2026, 114年 -> 2025)',
          },
          merchant: {
            type: Type.STRING,
            description: '商家或賣家名稱，例如 全聯福利中心、統一超商、台灣中油、蝦皮購物',
          },
          totalAmount: {
            type: Type.INTEGER,
            description: '發票或消費總金額（新台幣整數）',
          },
          category: {
            type: Type.STRING,
            description: '推薦的主類別：伙食 / 交通工具 / 服飾 / 日用品 / 網購 / 書籍 / 其他',
          },
          subcategory: {
            type: Type.STRING,
            description: '子分類名稱（必須嚴格符合上述各分類允許的選項，若無則為空字串）',
          },
          description: {
            type: Type.STRING,
            description: '消費項目摘要描述，例如「全聯生活採買」、「95無鉛汽油 150元」、「早點豆漿蛋餅」',
          },
          items: {
            type: Type.ARRAY,
            description: '明細清單',
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.INTEGER },
                unitPrice: { type: Type.INTEGER },
                amount: { type: Type.INTEGER },
                category: { type: Type.STRING },
                subcategory: { type: Type.STRING },
              },
            },
          },
          notes: {
            type: Type.STRING,
            description: '辨識備註或額外資訊，如載具、付款方式、統編等',
          },
        },
        required: ['totalAmount', 'category', 'description'],
      };

      // Multi-model fallback & retry list for resilience against 503 / 429
      const candidateModels = [
        'gemini-3.8-flash',
        'gemini-2.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-3.1-pro-preview',
      ];

      let lastError: any = null;
      let parsedData: any = null;

      for (const modelName of candidateModels) {
        try {
          console.log(`[OCR] Attempting invoice recognition with model: ${modelName}`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: cleanBase64,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
            config: {
              responseMimeType: 'application/json',
              responseSchema,
            },
          });

          const responseText = response.text || '{}';
          parsedData = JSON.parse(responseText);
          console.log(`[OCR] Successfully recognized with model: ${modelName}`);
          break; // Success! Exit model fallback loop
        } catch (err: any) {
          lastError = err;
          console.warn(`[OCR] Model ${modelName} failed or unavailable:`, err?.message || err);
          // Wait briefly before trying next fallback model
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      }

      if (!parsedData) {
        const errorMsg = lastError?.message || '';
        if (errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE')) {
          return res.status(503).json({
            error: 'AI 服務目前全球負載較高，系統已嘗試自動切換備援模型。請點擊「立即重新辨識」再試一次。',
            isRetryable: true,
          });
        }
        if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
          return res.status(429).json({
            error: 'API 呼叫頻率達上限，請稍候 3 秒後點擊「立即重新辨識」。',
            isRetryable: true,
          });
        }
        return res.status(500).json({
          error: `辨識異常：${errorMsg || '無法解析發票，請點擊重試或手動輸入'}`,
          isRetryable: true,
        });
      }

      res.json({
        success: true,
        data: parsedData,
      });
    } catch (error: any) {
      console.error('Invoice recognition error:', error);
      res.status(500).json({
        error: error?.message || '辨識發票時發生錯誤，請重試或手動輸入。',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
