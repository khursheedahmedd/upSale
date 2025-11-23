# import json
# import os
# import json
# import os
# from sqlalchemy.orm import Session
# from app.models.jobs import Job, Question # Removed Skill and ClientInfo
# from datetime import datetime
# from fastapi import HTTPException
# from app.api.routes.job_analyzer import load_company_details # This import might be unused now
# from typing import List
# from itertools import islice
# from app.api.routes.rag_relevance import analyze_job_batch_rag

# COMPANY_DETAILS_PATH = os.path.abspath(os.path.join(
#     os.path.dirname(__file__),
#     "..",
#     "api", "routes", "agents", "company_details.md"
# ))

# async def process_and_save_jobs(db: Session, jobs_data: list) -> tuple:
#     """
#     Process and save jobs to the database.

#     Args:
#         db (Session): The database session.
#         jobs_data (list): A list of job data dictionaries.

#     Returns:
#         tuple: A tuple containing the number of jobs added and skipped.
#     """
#     jobs_added = 0
#     jobs_skipped = 0
#     job_ids: List[str] = []

#     for job_data in jobs_data:
#         # Use 'id' from job_data which maps to Job.id (Supabase primary key)
#         existing_job = db.query(Job).filter(Job.id == job_data.get("id")).first()
#         if existing_job:
#             jobs_skipped += 1
#             continue

#         # Create Job object and assign fields directly from job_data
#         job = Job(
#             id=job_data.get("id"), # Use 'id' as per new schema
#             title=job_data.get("title"),
#             description=job_data.get("description"),
#             createdDateTime=datetime.fromisoformat(job_data.get("createdDateTime")),
#             publishedDateTime=datetime.fromisoformat(job_data.get("publishedDateTime")),
#             renewedDateTime=job_data.get("renewedDateTime"), # Assuming this is already datetime or None
#             duration=job_data.get("duration"),
#             durationLabel=job_data.get("durationLabel"),
#             engagement=job_data.get("engagement"),
#             recordNumber=job_data.get("recordNumber"),
#             experienceLevel=job_data.get("experienceLevel"),
#             freelancersToHire=job_data.get("freelancersToHire"),
#             enterprise=job_data.get("enterprise"),
#             totalApplicants=job_data.get("totalApplicants"),
#             preferredFreelancerLocation=job_data.get("preferredFreelancerLocation"),
#             preferredFreelancerLocationMandatory=job_data.get("preferredFreelancerLocationMandatory"),
#             premium=job_data.get("premium"),
#             client_country=job_data.get("client_country"),
#             client_total_hires=job_data.get("client_total_hires"),
#             client_total_posted_jobs=job_data.get("client_total_posted_jobs"),
#             client_total_spent=job_data.get("client_total_spent"),
#             client_verification_status=job_data.get("client_verification_status"),
#             client_location_city=job_data.get("client_location_city"),
#             client_location_state=job_data.get("client_location_state"),
#             client_location_timezone=job_data.get("client_location_timezone"),
#             client_location_offsetToUTC=job_data.get("client_location_offsetToUTC"),
#             client_total_reviews=job_data.get("client_total_reviews"),
#             client_total_feedback=job_data.get("client_total_feedback"),
#             amount=job_data.get("amount"), # Use 'amount' as per new schema
#             currency=job_data.get("currency"),
#             team_name=job_data.get("team_name"),
#             team_rid=job_data.get("team_rid"),
#             team_id=job_data.get("team_id"),
#             team_photoUrl=job_data.get("team_photoUrl"),
#             status=Job.Status.NOT_APPLIED, # Default status
#             category_id=job_data.get("category_id"),
#             category_label=job_data.get("category_label"),
#             subcategory_id=job_data.get("subcategory_id"),
#             subcategory_label=job_data.get("subcategory_label"),
#             city=job_data.get("city"),
#             state=job_data.get("state"),
#             country=job_data.get("country"),
#             threeLetterAbbreviation=job_data.get("threeLetterAbbreviation"),
#             phoneCode=job_data.get("phoneCode"),
#             avg_rate_bid=job_data.get("avg_rate_bid"),
#             min_rate_bid=job_data.get("min_rate_bid"),
#             max_rate_bid=job_data.get("max_rate_bid"),
#             last_client_activity=job_data.get("last_client_activity"), # Assuming this is already datetime or None
#             invites_sent=job_data.get("invites_sent"),
#             total_invited_to_interview=job_data.get("total_invited_to_interview"),
#             total_hired=job_data.get("total_hired"),
#             total_unanswered_invites=job_data.get("total_unanswered_invites"),
#             total_offered=job_data.get("total_offered"),
#             total_recommended=job_data.get("total_recommended"),
#             skills=job_data.get("skills"), # Assign skills string directly
#             ciphertext=job_data.get("ciphertext"),
#             JobUpdatedDateTime=job_data.get("JobUpdatedDateTime"), # Assuming this is already datetime or None
#             JobFirstFetchedDateTime=job_data.get("JobFirstFetchedDateTime"), # Assuming this is already datetime or None
#             contractor_selection=job_data.get("contractor_selection"),
#             # Keep existing fields not in Supabase schema for now if they exist in input
#             job_link=job_data.get("link"), # Keep job_link as it's used for checking existing jobs
#             client_reviews=job_data.get("client_reviews"), # Keep if needed elsewhere
#             client_avg_hourly_rate=job_data.get("client_avg_hourly_rate"), # Keep if needed elsewhere
#             from_hourly_range=job_data.get("from_hourly_range"), # Keep if needed elsewhere
#             to_hourly_range=job_data.get("to_hourly_range"), # Keep if needed elsewhere
#             has_questions=job_data.get("has_questions", False), # Keep if needed elsewhere
#             notes=job_data.get("notes"), # Keep if needed elsewhere
#             # Fields not expected in input but kept in model/schema:
#             # applying_location_restriction, job_attachments, requires_github_repo, requires_relevant_portfolio, job_search_query
#         )

#         # Handle questions in job post if present
#         contractor_selection_str = job_data.get("contractor_selection")
#         if contractor_selection_str:
#             try:
#                 contractor_data = json.loads(contractor_selection_str)
#                 proposal_req = contractor_data.get("proposalRequirement", {})
#                 screening_questions = proposal_req.get("screeningQuestions", [])

#                 if screening_questions:
#                     job.has_questions = True # Keep this flag if still used
#                     for q_data in screening_questions:
#                         question_text = q_data.get("question")
#                         if question_text:
#                             question = Question(
#                                 question=question_text,
#                                 job=job # Link question to job
#                             )
#                             db.add(question) # Add question to session

#             except json.JSONDecodeError:
#                 print(f"Warning: Could not decode contractor_selection JSON for job {job.id}") # Use job.id
#             except Exception as e:
#                 print(f"Warning: Error processing contractor_selection for job {job.id}: {e}") # Use job.id

#         # Skills are now stored directly as text, no need for Skill model or relationship
#         # The 'skills' field is assigned directly during Job object creation above.

#         db.add(job)
#         jobs_added += 1
#         job_ids.append(job.id) # Use job.id

#     try:
#         db.commit()
#         print(f"[INFO] Successfully committed all jobs to the database. Added: {jobs_added}, Skipped: {jobs_skipped}")
#     except Exception as e:
#         print(f"[ERROR] Final commit failed for the batch: {e}")
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Database commit failed: {str(e)}")


# # Here we are creating batches of 3 Jobs at a time and passing it to job_analyzer_batch to check relevance
#     job_ids_iter = iter(job_ids)
#     while True:
#         batch_iterator = islice(job_ids_iter, 3)
#         job_id_batch_list = list(batch_iterator)

#         if not job_id_batch_list:
#             break

#         try:
#             # Pass the list of job IDs to the relevance analysis function
#             await analyze_job_batch_rag(job_id_batch_list, db=db)
#             print(f"[INFO] Successfully called RAG-based job analyzer batch endpoint for jobs: {job_id_batch_list}")
#         except Exception as e:
#             print(f"[ERROR] Error during initiating RAG-based relevance analysis for job batch {job_id_batch_list}: {e}")

#     print(f"[INFO] Completed batch processing. Added: {jobs_added}, Skipped: {jobs_skipped}")
#     return jobs_added, jobs_skipped
