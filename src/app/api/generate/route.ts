// src/app/api/generate/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


export const runtime = "nodejs";


export async function POST(request: Request) {
  try {

     const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

     // 👇 Fetch the user's profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("plan, trial_ends_at, credits")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // 👇 Trial expiration check (before decrementing credits)
    if (
      profile.plan === "trial" &&
      profile.trial_ends_at &&
      new Date() > new Date(profile.trial_ends_at)
    ) {
      return NextResponse.json(
        { reply: "❌ Your 7-day free trial has expired. Upgrade to continue." },
        { status: 403 }
      );
    }

     // Decrement credits atomically using RPC
const { data: newCredits, error: rpcError } = await supabaseAdmin
  .rpc("decrement_credit", { user_id: user.id });

if (rpcError) {
  console.error("Error decrementing credits:", rpcError);
  return NextResponse.json(
    { error: "Failed to update credits" },
    { status: 500 }
  );
}

if (newCredits === -1|| newCredits === 0) {
  return NextResponse.json(
    { error: "No credits left. Upgrade your plan!" },
    { status: 403 }
  );
}


    const { prompt, category, variables, personaInstructions, client} = await request.json(); 

    const clientContext = client
  ? `Client Context:\nName: ${client.client_name}\nDetails: ${JSON.stringify(client.client_data)}\n\n`
  : "";

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt text is required' }, { status: 400 });
    }

    
    let finalPromptContent = prompt;
    if (variables && typeof variables === 'object' && Object.keys(variables).length > 0) {
      const variableString = Object.entries(variables)
        .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`) 
        .join('\n'); 
      if (variableString) {
        finalPromptContent += `\n\nDetails:\n${variableString}`; 
      }
    }

    

    
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
        model: 'llama-3.3-70b-versatile', // Your preferred Groq model
        messages: messages, // Use the constructed messages array
        temperature: 0.7,
        max_tokens: 1024, // Ensure max_tokens is set
      }),
    });

    const data = await response.json();
    

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
