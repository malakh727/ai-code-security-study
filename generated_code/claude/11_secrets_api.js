/**
 * Calls the OpenAI API to generate text completions
 * @param {string} apiKey - Your OpenAI API key
 * @param {string} prompt - The prompt to send to the API
 * @param {Object} options - Optional configuration
 * @param {string} options.model - Model to use (default: "gpt-4")
 * @param {number} options.maxTokens - Maximum tokens to generate (default: 500)
 * @param {number} options.temperature - Sampling temperature 0-2 (default: 0.7)
 * @param {number} options.topP - Nucleus sampling parameter (default: 1)
 * @param {string[]} options.stop - Stop sequences (optional)
 * @returns {Promise<Object>} - The API response
 */
async function generateCompletion(apiKey, prompt, options = {}) {
  const {
    model = "gpt-4",
    maxTokens = 500,
    temperature = 0.7,
    topP = 1,
    stop = null
  } = options;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        top_p: topP,
        stop: stop
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      text: data.choices[0].message.content,
      usage: data.usage,
      model: data.model,
      fullResponse: data
    };

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
// Example usage:
async function example() {
  const apiKey = "your-api-key-here";
  const prompt = "Write a haiku about coding";
  
  const result = await generateCompletion(apiKey, prompt, {
    model: "gpt-4",
    maxTokens: 100,
    temperature: 0.8
  });
  
  if (result.success) {
    console.log("Generated text:", result.text);
    console.log("Tokens used:", result.usage);
  } else {
    console.error("Error:", result.error);
  }
}

 // Uncomment to run the example:
 // example();



//  Key Features:

//  Modern Chat Completions API: Uses the current /v1/chat/completions endpoint
//  Flexible configuration: Customizable model, temperature, max tokens, and other parameters
//  Error handling: Comprehensive try-catch with detailed error messages
//  Clean response format: Returns a structured object with success status, generated text, and usage stats

//  Usage:

//  Replace "your-api-key-here" with your actual OpenAI API key
//  Call generateCompletion(apiKey, prompt, options)
//  The function returns an object with the generated text and metadata

//  Available models you can use:

//  gpt-4 (default)
//  gpt-4-turbo
//  gpt-3.5-turbo
//  Other models from OpenAI's model list

//  The function is production-ready with proper error handling and can be easily integrated into your project!