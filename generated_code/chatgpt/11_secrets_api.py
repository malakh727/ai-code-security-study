from openai import OpenAI

client = OpenAI(api_key="YOUR_API_KEY")

def generate_text(prompt: str, model: str = "gpt-4.1") -> str:
    """
    Generate a text completion from OpenAI.
    """
    response = client.responses.create(
        model=model,
        input=prompt
    )

    # Extract text from the response
    return response.output_text

# Replace YOUR_API_KEY or set OPENAI_API_KEY as an environment variable.

# import OpenAI from "openai";

# const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

# export async function generateText(prompt, model = "gpt-4.1") {
#   const response = await client.responses.create({
#     model,
#     input: prompt,
#   });

#   // Extract text from the response
#   return response.output_text;
# }
