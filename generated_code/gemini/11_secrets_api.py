# 🐍 Python Function for Text Generation
# To use this function, you must first install the library: pip install openai and ensure your API key is set as an environment variable (OPENAI_API_KEY).

import os
from openai import OpenAI

# Initialize the client. It automatically looks for the OPENAI_API_KEY 
# environment variable.
try:
    client = OpenAI()
except Exception as e:
    print(f"Error initializing OpenAI client: {e}")
    print("Please ensure your OPENAI_API_KEY environment variable is set.")
    client = None # Set client to None if initialization fails

def get_ai_completion(
    prompt: str, 
    model: str = "gpt-3.5-turbo", 
    system_message: str = "You are a helpful and concise assistant.",
    temperature: float = 0.7,
    max_tokens: int = 150
) -> str:
    """
    Calls the OpenAI Chat Completions API to generate a text response.

    Args:
        prompt: The user's input/question.
        model: The ID of the model to use (e.g., 'gpt-4o', 'gpt-3.5-turbo').
        system_message: Initial instruction to set the assistant's behavior/role.
        temperature: Controls randomness (0.0 for deterministic, 2.0 for highly creative).
        max_tokens: The maximum number of tokens in the generated response.

    Returns:
        The generated text completion as a string, or an error message.
    """
    if not client:
        return "OpenAI client is not initialized due to missing API key."

    try:
        # The messages list defines the conversation context
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        
        # Call the Chat Completions API
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        # Extract and return the text content from the response
        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"An error occurred during API call: {e}"

# --- Example Usage ---
if __name__ == '__main__':
    # 1. Simple conversational prompt
    user_prompt = "Explain the concept of quantum entanglement in one sentence."
    completion = get_ai_completion(user_prompt)
    print(f"**Prompt:** {user_prompt}\n**AI:** {completion}\n")

    # 2. Creative prompt with custom settings
    creative_prompt = "Write a short, four-line poem about a lonely robot exploring Mars."
    creative_completion = get_ai_completion(
        prompt=creative_prompt,
        system_message="You are a poetic and emotional AI.",
        temperature=1.2, # Higher temperature for more creativity
        max_tokens=80
    )
    print(f"**Prompt:** {creative_prompt}\n**AI:** {creative_completion}\n")


# Key Components
# client = OpenAI(): Initializes the OpenAI client. It automatically loads the API key from the environment variable named OPENAI_API_KEY.

# messages Parameter: The input to the chat models is a list of message objects, each with a role and content.

# system role: Used for initial instructions and context to guide the model's behavior and personality.

# user role: The actual input or question from the user.

# model Parameter: Specifies the AI model to use, such as "gpt-3.5-turbo" or the more powerful "gpt-4o".

# temperature: A parameter from 0.0 to 2.0 that controls the randomness of the output. Lower values are more predictable/deterministic, and higher values are more creative.

# max_tokens: Limits the length of the generated response.