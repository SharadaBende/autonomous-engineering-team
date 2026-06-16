import time
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def call_groq(prompt, max_tokens=2000, temperature=0.3, max_retries=5):
    """
    Call Groq API with automatic retry on rate limit
    """
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            error_msg = str(e)
            
            if "429" in error_msg:
                # Extract wait time from error message
                wait_time = 60
                if "Please try again in" in error_msg:
                    try:
                        time_str = error_msg.split("Please try again in")[1].split(".")[0].strip()
                        if "m" in time_str:
                            minutes = float(time_str.replace("m", "").strip())
                            wait_time = int(minutes * 60) + 10
                        elif "s" in time_str:
                            wait_time = int(float(time_str.replace("s", "").strip())) + 5
                    except:
                        wait_time = 60
                
                print(f"⏳ Rate limit hit. Waiting {wait_time} seconds before retry {attempt + 1}/{max_retries}...")
                time.sleep(wait_time)
                continue
            
            else:
                raise e
    
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