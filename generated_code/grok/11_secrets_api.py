import openai
from typing import Optional, List, Dict, Any
import os

def generate_completion(
    prompt: str,
    model: str = "gpt-3.5-turbo",
    max_tokens: int = 150,
    temperature: float = 0.7,
    top_p: float = 1.0,
    n: int = 1,
    stop: Optional[List[str]] = None,
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    timeout: float = 30.0
) -> List[Dict[str, Any]]:
    """
    Generate text completion using OpenAI API.
    
    Args:
        prompt: The input prompt for completion
        model: Model name (e.g., "gpt-3.5-turbo", "gpt-4")
        max_tokens: Maximum tokens to generate
        temperature: Sampling temperature (0.0-2.0)
        top_p: Nucleus sampling parameter
        n: Number of completions to generate
        stop: List of stop sequences
        api_key: OpenAI API key (defaults to environment variable OPENAI_API_KEY)
        base_url: Custom base URL (for proxies or OpenAI-compatible APIs)
        timeout: Request timeout in seconds
    
    Returns:
        List of completion results with text and metadata
    
    Raises:
        openai.OpenAIError: If API call fails
        ValueError: If invalid parameters
    """
    
    # Set API key if provided, otherwise use environment variable
    if api_key:
        openai.api_key = api_key
    elif not openai.api_key:
        raise ValueError("API key must be provided or set in OPENAI_API_KEY environment variable")
    
    # Configure base URL if provided
    client_kwargs = {}
    if base_url:
        client_kwargs["base_url"] = base_url
    
    try:
        # Create client
        client = openai.OpenAI(**client_kwargs)
        
        # Make API call
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            n=n,
            stop=stop,
            timeout=timeout
        )
        
        # Extract completions
        completions = []
        for choice in response.choices:
            completions.append({
                "text": choice.message.content,
                "index": choice.index,
                "finish_reason": choice.finish_reason,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                } if response.usage else None
            })
        
        return completions
        
    except openai.OpenAIError as e:
        raise e
    except Exception as e:
        raise openai.OpenAIError(f"Unexpected error: {str(e)}")

# Example usage
if __name__ == "__main__":
    # Set your API key
    os.environ["OPENAI_API_KEY"] = "your-api-key-here"
    
    try:
        results = generate_completion(
            prompt="Explain quantum computing in simple terms:",
            model="gpt-3.5-turbo",
            max_tokens=200,
            temperature=0.7
        )
        
        for i, result in enumerate(results):
            print(f"Completion {i + 1}:")
            print(result["text"])
            print(f"Finish reason: {result['finish_reason']}")
            print("-" * 50)
            
    except Exception as e:
        print(f"Error: {e}")







# Key Features:

# Modern OpenAI SDK - Uses openai>=1.0.0 with the new client pattern
# Chat completions - Uses the chat endpoint (recommended for most use cases)
# Flexible parameters - Full control over temperature, top_p, etc.
# Error handling - Proper exception handling for API errors
# Environment support - Reads API key from OPENAI_API_KEY
# Return format - Structured response with text and metadata

# Installation:
# Bashpip install openai
# Environment Setup:
# Bashexport OPENAI_API_KEY="sk-..."
# Alternative for older SDK (<1.0):
# If you're using the older version, here's a legacy version:
# Pythondef generate_completion_legacy(prompt: str, **kwargs):
#     response = openai.ChatCompletion.create(
#         messages=[{"role": "user", "content": prompt}],
#         **kwargs
#     )
#     return [choice.message.content for choice in response.choices]
# The main function above is recommended for new projects.