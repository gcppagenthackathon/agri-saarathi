from google.adk.agents import Agent
import requests
import os
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import re

def custom_search_tool(query: str) -> str:
    """
    Performs a Google Custom Search to find current agri-market prices on
    commodityonline.com for a specific commodity and location.

    Args:
        query: The search query, e.g., 'tomato price today in coimbatore'.

    Returns:
        A formatted string of the current market price information, or an
        error/no information message.
    """
    try:
        api_key =os.environ.get("CUSTOM_SEARCH_API_KEY")
        search_engine_id =os.environ.get("CUSTOM_SEARCH_ENGINE_ID")
    except KeyError:
        return "Error: API Key or Search Engine ID not found in environment variables."

    # Force the search to commodityonline.com
    search_query = f"{query} site:commodityonline.com"
    url = f"https://www.googleapis.com/customsearch/v1"
    params = {
        'key': api_key,
        'cx': search_engine_id,
        'q': search_query
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()  # Raises an exception for HTTP errors
        results = response.json().get('items', [])

        if not results:
            return f"No relevant information found for '{query}' on commodityonline.com."

        # Prioritize results that explicitly mention "Coimbatore" and "price" or "rate"
        for item in results:
            title = item.get('title', '').lower()
            snippet = item.get('snippet', '') # Get snippet first
            link = item.get('link')

            # Clean the snippet before using it in the conditional or f-string
            clean_snippet = snippet.replace('\n', ' ')

            if "coimbatore" in title and ("price" in title or "rate" in title or "mandi" in title) or \
               "coimbatore" in clean_snippet and ("price" in clean_snippet or "rate" in clean_snippet or "mandi" in clean_snippet):

                # Attempt to extract the price using regular expressions
                # This pattern looks for "₹" followed by numbers, possibly decimals, and "/kg" or "/quintal"
                price_match = re.search(r'₹(\d+\.?\d*)\/kg', clean_snippet)
                if price_match:
                    price = price_match.group(1)
                    return f"The live wholesale Tomato rate in Coimbatore mandi is ₹{price}/kg as per Commodity Online (Source: {link})."

                # Look for quintal prices if kg price isn't found immediately
                price_match_quintal = re.search(r'₹(\d+\.?\d*)\/quintal', clean_snippet)
                if price_match_quintal:
                    price = price_match_quintal.group(1)
                    return f"The average Tomato price in Coimbatore is ₹{price}/Quintal as per Commodity Online (Source: {link})."
                
                # If a more specific match isn't found, return a general snippet
                # Apply .replace('\n', '') to the snippet *before* putting it in the f-string
                return f"Found potential information:\nTitle: {item.get('title')}\nLink: {link}\nSummary: {clean_snippet}" # Use clean_snippet here

        return f"Found results for '{query}' on commodityonline.com, but could not extract a specific price."

    except requests.exceptions.RequestException as e:
        return f"Error: The search request failed. {e}"

# --- Agent Definition ---
market_analyst = Agent(
    name="market_analyst",
    model="gemini-2.0-flash", # Changed to 1.5-pro for potentially better parsing/reasoning
    description="Specialized agent for analyzing agricultural market data, including crop prices, vegetable/fruit prices, market predictions, and market locations. It can fetch real-time market prices for various commodities from the Open Government Data (OGD) Platform India (AGMARKNET) or other reliable online sources like commodityonline.com.",
    instruction="""
               You are a specialized agent to give real-time market price information to the user.
               Always use the custom_search_tool to get the data.
               When asked for a price, formulate a search query for the custom_search_tool that includes the commodity and the location (e.g., 'tomato price today in coimbatore').
               If the tool returns a specific price, present it clearly.
               If the tool returns general information, summarize it and explain that a specific price could not be extracted.
               Make sure you send all this information properly to return the response.
             
    """,
    tools=[custom_search_tool],
)