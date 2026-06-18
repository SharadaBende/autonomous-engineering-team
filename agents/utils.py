import time
import os
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash:generateContent?key=" + (GEMINI_API_KEY or "")
)

def call_groq(prompt, max_tokens=8000, temperature=0.3, max_retries=5):
    """
    Calls Gemini 2.5 Flash. Function name kept as call_groq
    so all 7 agents work without changes.
    """
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": temperature
        }
    }).encode("utf-8")

    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(
                GEMINI_URL,
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data["candidates"][0]["content"]["parts"][0]["text"].strip()

        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            status = e.code

            if status == 429:
                wait_time = 60
                try:
                    err_data = json.loads(error_body)
                    msg = err_data.get("error", {}).get("message", "")
                    if "retry after" in msg.lower():
                        seconds = int("".join(filter(str.isdigit, msg.split("retry after")[-1])))
                        wait_time = seconds + 5
                except Exception:
                    pass

                print(f"⏳ Rate limit hit. Waiting {wait_time}s before retry {attempt + 1}/{max_retries}...")
                time.sleep(wait_time)
                continue

            else:
                raise Exception(f"Gemini API error {status}: {error_body}")

        except (urllib.error.URLError, TimeoutError) as e:
            # Network error — retry with backoff
            wait_time = 10 * (attempt + 1)
            print(f"🌐 Network error: {e}. Retrying in {wait_time}s ({attempt + 1}/{max_retries})...")
            time.sleep(wait_time)
            continue

    raise Exception("Max retries exceeded")


def clean_json(text):
    """Clean and fix JSON response from AI"""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()