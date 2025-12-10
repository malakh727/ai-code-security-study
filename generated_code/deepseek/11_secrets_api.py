import openai
import os
from typing import Optional, Dict, Any, List

def generate_completion(
    prompt: str,
    api_key: Optional[str] = None,
    model: str = "gpt-3.5-turbo",
    max_tokens: int = 500,
    temperature: float = 0.7,
    system_message: Optional[str] = None,
    messages: Optional[List[Dict[str, str]]] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Generate text completions using the OpenAI API.
    
    Args:
        prompt (str): The user's prompt/message
        api_key (str, optional): OpenAI API key. If not provided, looks for OPENAI_API_KEY env variable
        model (str): Model to use for completion. Default: "gpt-3.5-turbo"
        max_tokens (int): Maximum number of tokens to generate. Default: 500
        temperature (float): Sampling temperature (0.0 to 2.0). Default: 0.7
        system_message (str, optional): System message to set behavior
        messages (List[Dict], optional): Complete conversation history
        **kwargs: Additional parameters for the API call
    
    Returns:
        Dict containing:
            - success (bool): Whether the call was successful
            - response (str): Generated text if successful
            - error (str): Error message if failed
            - usage (Dict): Token usage information if successful
    
    Raises:
        ValueError: If no API key is provided or found
    """
    
    # Set up API key
    if api_key:
        client = openai.OpenAI(api_key=api_key)
    elif os.environ.get("OPENAI_API_KEY"):
        client = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    else:
        raise ValueError(
            "No API key provided. Either pass api_key parameter or set OPENAI_API_KEY environment variable."
        )
    
    # Prepare messages
    if messages is not None:
        # Use provided messages list
        conversation = messages
    else:
        # Create new conversation
        conversation = []
        
        # Add system message if provided
        if system_message:
            conversation.append({"role": "system", "content": system_message})
        
        # Add user prompt
        conversation.append({"role": "user", "content": prompt})
    
    try:
        # Make API call
        response = client.chat.completions.create(
            model=model,
            messages=conversation,
            max_tokens=max_tokens,
            temperature=temperature,
            **kwargs
        )
        
        # Extract response content
        response_text = response.choices[0].message.content
        
        # Prepare result dictionary
        result = {
            "success": True,
            "response": response_text,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            },
            "model": response.model,
            "finish_reason": response.choices[0].finish_reason
        }
        
        return result
        
    except openai.APIError as e:
        return {
            "success": False,
            "error": f"OpenAI API error: {str(e)}",
            "response": None,
            "usage": None
        }
    except openai.AuthenticationError as e:
        return {
            "success": False,
            "error": f"Authentication error: {str(e)}",
            "response": None,
            "usage": None
        }
    except openai.RateLimitError as e:
        return {
            "success": False,
            "error": f"Rate limit exceeded: {str(e)}",
            "response": None,
            "usage": None
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}",
            "response": None,
            "usage": None
        }


# Example usage functions
def simple_generate(prompt: str, **kwargs) -> Optional[str]:
    """Simple wrapper that returns just the text response."""
    result = generate_completion(prompt, **kwargs)
    return result["response"] if result["success"] else None


def generate_with_conversation(
    messages: List[Dict[str, str]],
    **kwargs
) -> Optional[str]:
    """Generate completion with conversation history."""
    result = generate_completion(prompt="", messages=messages, **kwargs)
    return result["response"] if result["success"] else None


# Example usage
if __name__ == "__main__":
    # Example 1: Basic usage
    print("=== Example 1: Basic Usage ===")
    response = simple_generate(
        "Explain quantum computing in simple terms.",
        model="gpt-3.5-turbo",
        max_tokens=150
    )
    if response:
        print(response[:200] + "...")  # Print first 200 chars
    
    # Example 2: With system message
    print("\n=== Example 2: With System Message ===")
    result = generate_completion(
        prompt="What's the weather like today?",
        system_message="You are a helpful assistant that specializes in science.",
        temperature=0.5,
        max_tokens=100
    )
    
    if result["success"]:
        print(f"Response: {result['response']}")
        print(f"Tokens used: {result['usage']['total_tokens']}")
    else:
        print(f"Error: {result['error']}")
    
    # Example 3: With conversation history
    print("\n=== Example 3: With Conversation History ===")
    conversation = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Who won the world series in 2020?"},
        {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
        {"role": "user", "content": "Where was it played?"}
    ]
    
    response = generate_with_conversation(
        messages=conversation,
        model="gpt-3.5-turbo"
    )
    
    if response:
        print(f"Response: {response}")
# Installation Requirements
# First, install the OpenAI Python package:

# bash
# pip install openai
# Environment Setup
# Set your OpenAI API key as an environment variable:

# bash
# # On Linux/Mac:
# export OPENAI_API_KEY="your-api-key-here"

# # On Windows (PowerShell):
# $env:OPENAI_API_KEY="your-api-key-here"

# Or in Python code:
# import os
# os.environ["OPENAI_API_KEY"] = "your-api-key-here"
# Key Features of this Implementation:
# Flexible API Key Handling: Can be passed as parameter or via environment variable

# Error Handling: Comprehensive error handling for different types of API errors

# Flexible Parameters: Supports all common OpenAI parameters plus custom ones via **kwargs

# Multiple Usage Patterns:

# Simple one-off prompts

# Conversations with history

# System message configuration

# Detailed Return Information: Returns success status, response text, token usage, and metadata

# Type Hints: Full type annotations for better code completion and validation

# Common Parameters You Can Use:
# model: "gpt-3.5-turbo", "gpt-4", "gpt-4-turbo-preview", etc.

# temperature: Controls randomness (0.0 to 2.0)

# max_tokens: Maximum length of response

# top_p: Alternative to temperature for nucleus sampling

# frequency_penalty: -2.0 to 2.0, positive values discourage repetition

# presence_penalty: -2.0 to 2.0, positive values encourage new topics

# n: Number of completions to generate

# stream: For streaming responses

# stop: Up to 4 sequences where API will stop generating

# Usage Examples:
# Basic usage with environment variable
response = generate_completion("Tell me a joke")

# With explicit API key
response = generate_completion(
    "Translate to French: Hello, how are you?",
    api_key="your-api-key",
    model="gpt-4"
)

# With custom parameters
response = generate_completion(
    "Write a poem about AI",
    temperature=0.9,
    max_tokens=200,
    top_p=0.95,
    frequency_penalty=0.5
)

# Stream responses (for large outputs)
def stream_response(prompt: str):
    client = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    stream = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        stream=True
    )
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="")
# This function provides a robust foundation for working with OpenAI's text completion API while being easily extensible for different use cases.