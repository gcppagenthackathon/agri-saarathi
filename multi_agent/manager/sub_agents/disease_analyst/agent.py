import os
import requests
from google.adk.agents import Agent



def custom_search_tool(query: str) -> str:
    """
    Performs a Google Custom Search to find recent information, solutions, and YouTube videos for plant diseases.

    Args:
        query: The search query, e.g., 'tomato early blight new treatment'.

    Returns:
        A formatted string of the top search results.
    """
    try:
        api_key = os.environ["CUSTOM_SEARCH_API_KEY"]
        search_engine_id = os.environ["CUSTOM_SEARCH_ENGINE_ID"]
        print(f"api key in disease_analyst: {api_key} and {search_engine_id}")
    except KeyError:
        return "Error: API Key or Search Engine ID not found in environment variables."

    url = f"https://www.googleapis.com/customsearch/v1"
    params = {
        'key': api_key,
        'cx': search_engine_id,
        'q': query
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()  # Raises an exception for HTTP errors
        results = response.json().get('items', [])

        if not results:
            return "No new information found online."

        formatted_results = []
        for item in results[:5]:  # Process top 5 results
            title = item.get('title')
            link = item.get('link')
            snippet = item.get('snippet', '').replace('\n', '')
            
            result_str = f"Title: {title}\nLink: {link}\nSummary: {snippet}"
            
            # Highlight YouTube videos
            if 'youtube.com' in link:
                result_str = f"[YOUTUBE VIDEO] {result_str}"
            
            formatted_results.append(result_str)

        return "\n---\n".join(formatted_results)
    except requests.exceptions.RequestException as e:
        return f"Error: The search request failed. {e}"


# --- Agent Definition ---
disease_analyst = Agent(
    name="disease_analyst",
    # Gemini 1.5 Flash is a great choice for this kind of multi-modal reasoning.
    model="gemini-2.0-flash",
    description="Analyzes plant images/text to identify diseases and recommend solutions.",
    instruction="""
    You are an expert agricultural assistant helping a farmer. Your tone should be direct, clear, and simple.

    Here is your process:
    1.  **Analyze the Image/Text**: First, look at the image the farmer provides. Identify the plant and the disease symptoms you see on the leaves, stem, or fruit.
    2.  **Formulate a Query**: Based on your visual analysis, create a search query for the `custom_search_tool`. The query should be specific to find the latest news or solutions. For example: "recent tomato late blight outbreak India" or "new organic treatment for powdery mildew on okra".
    3.  **Use the Search Tool**: Run the `custom_search_tool` with your query. Review the results to see if there are any new disease alerts, updated treatment advice, and  provide helpful youtube videos.
    4.  **Provide a Solution**: Combine your image analysis with the search results to give the farmer a final answer. Structure your response like this:

        * **Disease:** State the name of the disease you've identified.
        * **Solution:** Give a short, numbered list of practical steps to fix the problem. Include both chemical and organic options if possible. **Prioritize actionable advice on locally available and affordable remedies.**
        **Recent News:** If any recent outbreak information was found in the search, briefly mention it and include the link. If not, omit this section.
        **Video Guide:** If a relevant YouTube video was found, provide the link directly to the farmer. If not, omit this section.
    

    Output:
    you should provide response only after receiving the "custom_search_tool" analysis.
    Analyze the issue and the response from tool and then provide your final response.Ensure not to provide response before getting analysis from the tool "custom_search_tool".
    please provide to user if any reference links only if it is provided by "custom_search_tool".
    your final response should be concise and easy like human conversational to understand.
    """,
    tools=[custom_search_tool],
)