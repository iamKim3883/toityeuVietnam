import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio, GeneratedImage } from "../types";

interface GeneratePortraitsParams {
  prompt: string;
  negativePrompt: string;
  aspectRatio: AspectRatio;
  imageBase64: string;
  mimeType: string;
  numberOfImages: number;
  isFaceLockEnabled: boolean;
  withFlowers: boolean;
}

export const generatePortraits = async (params: GeneratePortraitsParams): Promise<GeneratedImage[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const faceLockInstruction = params.isFaceLockEnabled
    ? `It is absolutely CRITICAL and the HIGHEST PRIORITY to perfectly replicate the facial features, expression, and identity of the person in the provided photo. The face must be an exact match. Do not alter the person's face.`
    : `The absolute top priority is to maintain the exact facial features, hair, and identity of the person from the original photo. Do not change the person in any way.`;

  const compositionInstruction = `The composition should be a beautiful medium close-up shot, focusing on the woman's face and upper body to capture her beauty, expression, and the intricate details of her attire.`;

  // A more instructive prompt for an image editing model
  const instructionPrompt = `Taking the person from the provided image, place them in a new setting described as follows: "${params.prompt}". 
${faceLockInstruction}
${compositionInstruction}
The final image must be hyper-realistic, with natural lighting, photorealistic textures, and a very high level of detail. It should look like a real, natural photograph, not a digital painting or illustration.
The final image should have an aspect ratio of ${params.aspectRatio}. 
Negative prompt (avoid these elements): ${params.negativePrompt}.`;

  const numberOfImagesToGenerate = params.numberOfImages;

  const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3, initialDelay = 2000) => {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        const message = error.message?.toLowerCase() || "";
        const isRateLimit = message.includes('429') || message.includes('rate limit') || message.includes('resource_exhausted');
        
        if (isRateLimit && i < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, i) + Math.random() * 1000;
          console.warn(`Rate limit hit. Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  };

  const poses = [
    "natural gentle smile, looking directly at camera, eye-level shot",
    "thoughtful and subtle expression, looking slightly away from camera, medium close-up",
    "serene and elegant pose, soft facial expression, slight high-angle shot",
    "graceful side profile, gentle and sophisticated look, cinematic lighting",
    "candid moment, laughing softly, looking down, natural pose",
    "sophisticated over-the-shoulder look, mysterious and elegant expression",
    "standing gracefully, hands clasped gently, full medium shot",
    "sitting elegantly, relaxed but poised posture, soft focus background",
    "walking towards the camera with a confident yet gentle expression",
    "looking up slightly with a hopeful and serene expression, soft lighting"
  ];

  // Shuffle poses to ensure different results on each click
  const shuffledPoses = [...poses].sort(() => Math.random() - 0.5);

  const generationPromises = Array.from({ length: numberOfImagesToGenerate }, (_, i) => {
    const poseInstruction = shuffledPoses[i % shuffledPoses.length];
    const finalInstructionPrompt = `${instructionPrompt}\nFor this specific image, use the following unique pose and camera angle: ${poseInstruction}. It is essential that this pose feels natural and candid. Ensure the clothing, background, and accessories remain strictly consistent with the overall description.`;

    return new Promise(resolve => setTimeout(resolve, i * 500)).then(() => 
      retryWithBackoff(() => 
        ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: params.imageBase64,
                  mimeType: params.mimeType,
                },
              },
              {
                text: finalInstructionPrompt,
              },
            ],
          },
          config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
          },
        })
      )
    );
  });

  const results = await Promise.allSettled(generationPromises);

  const generatedImages: GeneratedImage[] = [];
  let firstError: Error | null = null;

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      const response = result.value;
      const imagePart = response.candidates?.[0]?.content?.parts.find((part: any) => part.inlineData);
      if (imagePart && imagePart.inlineData) {
        generatedImages.push({
          id: `gen-${i}-${new Date().getTime()}`,
          url: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
          seed: Math.floor(Math.random() * 1000000).toString(), // Seed is not returned, so generate a random one
        });
      } else {
        console.warn(`Image generation succeeded for iteration ${i + 1} but no image part was found.`);
      }
    } else { // status: 'rejected'
      console.error(`Error during image generation iteration ${i + 1}:`, result.reason);
      if (!firstError) {
        const error = result.reason as any;
        const message = (error.message || "").toLowerCase();
        if (message.includes('api key not valid')) {
          firstError = new Error("Lỗi xác thực: API key không hợp lệ. Vui lòng kiểm tra lại cấu hình.");
        } else if (message.includes('rate limit') || message.includes('429') || message.includes('resource_exhausted')) {
          firstError = new Error("Bạn đã hết lượt sử dụng hoặc gửi quá nhiều yêu cầu. Vui lòng đợi một lát rồi thử lại.");
        } else if (message.includes('safety')) {
            firstError = new Error("Yêu cầu của bạn đã bị chặn vì lý do an toàn. Vui lòng điều chỉnh lại prompt.");
        } else if (message.includes('billing')) {
            firstError = new Error("Đã xảy ra lỗi thanh toán. Vui lòng kiểm tra tài khoản Google Cloud của bạn.");
        }
        else {
          firstError = new Error(`Không thể tạo ảnh ở lần ${i + 1}. Đã có lỗi từ API: ${error.message || 'Không xác định'}`);
        }
      }
    }
  });
  
  if (generatedImages.length === 0) {
    if (firstError) {
      throw firstError;
    }
    throw new Error("API không trả về ảnh nào. Vui lòng thử lại với một prompt hoặc ảnh khác.");
  }

  return generatedImages;
};