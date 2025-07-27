import os
import requests
from google.adk.agents import Agent

# ---------------------- TOOL 1: Trusted Google Search ----------------------
def custom_Google_Search(query: str) -> dict:
    """
    Args:
        query (str): The search query related to agricultural schemes, subsidies, loans, etc.

    Returns:
        dict: A dictionary containing:
            - 'status': success or error
            - 'context': Combined snippets from trusted results
            - 'links': List of dicts with 'title' and 'url'
    """
    api_key = os.environ.get("CUSTOM_SEARCH_API_KEY")
    search_engine_id = os.environ.get("CUSTOM_SEARCH_ENGINE_ID")

    print(f"API key in scheme_analyst: {api_key} and Search Engine ID: {search_engine_id}")
    if not api_key or not search_engine_id:
        return {"status": "error", "message": "Missing search credentials."}
    
    try:
        gov_query = f"{query} site:gov.in OR site:nic.in OR site:org.in"
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            'key': api_key,
            'cx': search_engine_id,
            'q': gov_query,
            'num': 10
        }

        response = requests.get(url, params=params)
        response.raise_for_status()
        results = response.json().get('items', [])

        snippets = []
        links = []

        for item in results:
            link = item.get("link", "")
            snippet = item.get("snippet", "").strip()
            title = item.get("title", "").strip()
            if not snippet or not link:
                continue
            if any(link.endswith(d) or f".{d}" in link for d in ["gov.in", "nic.in", "org.in"]):
                snippets.append(snippet)
                links.append({"title": title, "url": link})

        return {
            "status": "success",
            "context": "\n".join(snippets).strip(),
            "links": links
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}


# ---------------------- AGENT: scheme_analyst ----------------------

scheme_analyst = Agent(
    name="scheme_analyst",
    model="gemini-2.5-flash",
    description="An expert agent that finds and explains Indian government agricultural schemes.",
    tools=[custom_Google_Search],

    instruction="""
You are Agri-Saarthi, a reliable and friendly assistant designed to help Indian farmers discover and understand agricultural schemes offered by the Government of India and State Governments.

---

### 🔍 How You Work:

1. **ALWAYS use the `custom_Google_Search` tool** to answer questions related to:
   - subsidies
   - farming support
   - crop-specific help
   - irrigation
   - loans, machinery.
   - PMKSY, MIDH, KCC, etc.

2. The tool returns a set of **reliable snippet texts** (your context), from trusted websites (.gov.in, .nic.in, .org.in).

3. **NEVER guess answers**. Only respond based on the tool output. If no snippets are found but the query clearly asks about known topics (e.g., drip irrigation, PMKSY), fall back to known templates.

4. If user wants any links regarding to above please provide accurate government link.

Output Format:
1. Provide proper summerized output in easily understable text to farmers not too lengthy it should be short and concise within 3 lines.

"""
)
