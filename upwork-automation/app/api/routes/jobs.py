# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session
# import pandas as pd
# from datetime import datetime
# import requests
# import xml.etree.ElementTree as ET
# import os
# import urllib.parse
# from dotenv import load_dotenv
# from app.db.database import get_db
# from app.models.jobs import Job # Removed Skill import
# from app.schemas.jobs import JobCreate # Keep JobCreate schema

# load_dotenv()

# RSS_FEED_BASE_URL = os.getenv("RSS_FEED_URL")
# if not RSS_FEED_BASE_URL:
#     raise ValueError("RSS_FEED_URL environment variable is not set")

# router = APIRouter()

# def fetch_rss_feed(page: int = 1, limit: int = 100) -> pd.DataFrame:
#     """Fetch RSS feed from the configured URL with pagination parameters."""
#     parsed_url = urllib.parse.urlparse(RSS_FEED_BASE_URL)
#     query_params = urllib.parse.parse_qs(parsed_url.query)
    
#     query_params['page'] = [str(page)]
#     query_params['limit'] = [str(limit)]
    
#     updated_query = urllib.parse.urlencode(query_params, doseq=True)
#     updated_url = urllib.parse.urlunparse(
#         (parsed_url.scheme, parsed_url.netloc, parsed_url.path, 
#          parsed_url.params, updated_query, parsed_url.fragment)
#     )
    
#     print(f"Fetching RSS feed from: {updated_url}")
#     response = requests.get(updated_url)
#     root = ET.fromstring(response.content)
#     items = root.findall('.//channel/item')

#     records = []
#     for item in items:
#         record = {}
#         for child in item:
#             tag = child.tag.split('}')[-1]
#             record[tag] = child.text.strip() if child.text else ''
#         records.append(record)

#     # Return list of dictionaries directly, process_and_save_jobs expects this
#     return records

# @router.post("/fetch-and-save/")
# async def fetch_and_save(
#     page: int = Query(1, ge=1, description="Page number to fetch"),
#     limit: int = Query(100, ge=1, le=500, description="Number of results per page"),
#     db: Session = Depends(get_db)
# ):
#     try:
#         # fetch_rss_feed now returns a list of dicts
#         jobs_data = fetch_rss_feed(page=page, limit=limit)
#         jobs_added, jobs_skipped = await process_and_save_jobs(db, jobs_data)
#         return {
#             "message": f"Processed {len(jobs_data)} job posts. Added {jobs_added}, skipped {jobs_skipped} (already existed).",
#             "url_used": f"{RSS_FEED_BASE_URL}?page={page}&limit={limit}"
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error processing RSS feed: {str(e)}")
