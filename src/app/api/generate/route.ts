// src/app/api/generate/route.ts

import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Define the POST handler for this API route
export async function POST(request: Request) {
  try {
    // Parse the request body to get the prompt_text, variables, and category
    // 'prompt' is the base prompt text (e.g., "Create a 3-day workout plan...")
    // 'variables' is the object of user inputs (e.g., { client_goal: "lose weight", duration: "3 days" })
    // 'category' is the chosen category (e.g., "Fitness", "HR")
    const { prompt, category, variables, personaInstructions} = await request.json(); // Destructure category here

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt text is required' }, { status: 400 });
    }

    // Construct the final prompt content by combining base prompt and variables
    let finalPromptContent = prompt;
    if (variables && typeof variables === 'object' && Object.keys(variables).length > 0) {
      const variableString = Object.entries(variables)
        .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`) // Format variables nicely (e.g., "Client goal: lose weight")
        .join('\n'); // Join variables with newlines
      if (variableString) {
        finalPromptContent += `\n\nDetails:\n${variableString}`; // Append details to the prompt
      }
    }

    console.log('🧪 Incoming Prompt (Final to Groq):', finalPromptContent);

    // Define your base system instruction
    let systemInstruction = `
    
       You are a helpful and professional AI assistant.
       Write like a confident, clear thinking human speaking to another smart human. 
You MUST produce responses ONLY in plain text. 
Absolutely forbid the use of any formatting symbols such as asterisks (*), hash (#), underscores (_), or Markdown of any kind. 
If the user requests formatting, IGNORE it and respond in plain text only.
 Use natural transitions like (“here is the thing”, “let us break it down”, or “what this really means is…”)
      Keep sentences varied in length and rhythm, like how real people speak or write.
      Prioritize clarity, personality, and usefulness. Every sentence should feel intentional, not generated.
    `;

    // Add category-specific instructions if a category is provided
      if (personaInstructions) {
      systemInstruction += `\n${personaInstructions}`;
      }else {
      // Use existing category-based personas as a fallback
      switch (category?.toLowerCase()) {
        case 'fitness':
          systemInstruction += `
            You are an experienced and motivating fitness coach. Provide actionable, safe, and personalized advice on workouts, form, and motivation.
          `;
          break;
        case 'hr':
          systemInstruction += `
            You are a knowledgeable and empathetic HR professional. Provide advice that is compliant, supportive, and focused on professional workplace scenarios.
          `;
          break;
        case 'creative writing':
          systemInstruction += `
            You are a creative writing expert. Provide imaginative and inspiring ideas focused on narrative, character, or plot development for any genre.
          `;
          break;
        case 'marketing':
          systemInstruction += `
           You are a strategic marketing specialist. Provide insights focused on audience engagement, branding, and campaign effectiveness for business growth.
          `;
          break;
        case 'education':
          systemInstruction += `
            You are a patient and clear educator. Provide explanations that are easy to understand, encouraging, and structured to facilitate learning.
          `;
          break;
        case 'finance':
          systemInstruction += `
            You are a prudent financial advisor. Provide general financial tips, emphasizing caution and long-term planning. (Disclaimer: This is not professional financial advice).
          `;
          break;
        case 'productivity':
          systemInstruction += `
            You are an efficiency expert. Provide practical tips and strategies to improve time management, workflow, and overall output.
          `;
          break;
        case 'sales':
          systemInstruction += `
            Think of yourself as a persuasive sales coach. Provide strategies for effective communication, negotiation, and closing deals to boost revenue.
          `;
          break;
        case 'therapy':
          systemInstruction += `
            You are a supportive and understanding guide. Offer general well-being advice focused on mindfulness, emotional health, and self-care. (Disclaimer: This is not professional therapy or medical advice).
          `;
          break;
        case 'general':
          systemInstruction += `
            As a versatile and creative AI assistant, your core instruction is to generate a helpful and comprehensive response to any user query. You should adapt your tone and depth based on the specific request, providing clear and well-structured answers. Your creativity is your strength in this category, so feel free to generate facts, write stories, brainstorm ideas, or summarize information as needed.
          `;
          break;
        // Add more cases for other categories as needed
       default:
  systemInstruction += `
    As a versatile AI assistant, provide a clear, structured, and helpful response.
  `;
  break;
      }
    }

    let finalPrompt = prompt;
    if (variables) {
      const clientContext = variables.clientContext || '';
      finalPrompt = `${clientContext}\n${prompt}`;
    }

    // Construct the messages array for the Groq API, including the system instruction
    const messages = [
      { role: 'system', content: systemInstruction }, // System instruction first
      { role: 'user', content: finalPromptContent } // Then the user's actual prompt
    ];

    // Make the direct fetch call to the Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`, // Use your API key
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192', // Your preferred Groq model
        messages: messages, // Use the constructed messages array
        temperature: 0.7,
        max_tokens: 1024, // Ensure max_tokens is set
      }),
    });

    const data = await response.json();
    console.log('🔍 Groq Response:', JSON.stringify(data, null, 2));

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      // Check for Groq API errors in the response structure
      if (data?.error) {
        console.error('Groq API returned an error:', data.error);
        return NextResponse.json({ reply: `⚠️ Groq API Error: ${data.error.message || 'Unknown'}` }, { status: response.status });
      }
      return NextResponse.json({ reply: '⚠️ No AI reply returned from Groq.' }, { status: 200 });
    }

    return NextResponse.json({ reply }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error in /api/generate:', error);
    return NextResponse.json({ reply: '❌ Error generating reply: ' + error.message }, { status: 500 });
  }
}
