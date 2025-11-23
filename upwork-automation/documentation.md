# IBM Sales Navigator for Upwork - API Documentation

## API Endpoints

### client_details.py

- `/client-details/{job_id}` (GET): Retrieves client details and jobs for a given job ID.
  - Path parameters:
    - `job_id` (string): The ID of the job.
  - Response:
    - `client_details` (object): An object containing client details such as country, reviews, total spent, and average hourly rate.
    - `client_jobs` (array): An array of `JobSchema` objects representing the client's jobs.

### generate_proposal.py

- `/generate-proposal/{job_id}` (POST): Generates a proposal for a given job ID.
  - Path parameters:
    - `job_id` (string): The ID of the job.
  - Query parameters:
    - `overwrite` (boolean, optional): Whether to overwrite an existing proposal. Defaults to `false`.
  - Response:
    - `job_id` (string): The ID of the job.
    - `proposal` (string): The generated proposal in markdown format.

### job_analyzer.py

- `/analyze/{job_id}` (POST): Analyzes a job by its ID and returns the relevance score and details.
  - Path parameters:
    - `job_id` (string): The ID of the job.
  - Response:
    - `job_id` (string): The ID of the job.
    - `score` (number): The relevance score.
    - `category` (string): The relevance category.
    - `reasoning` (string): The reasoning behind the relevance score.
    - `technology_match` (string): Analysis of how the job's technology requirements match the company's skills.
    - `portfolio_match` (string): Analysis of which portfolio items demonstrate relevant experience.
    - `project_match` (string): Analysis of which past projects are most relevant to this job.
    - `location_match` (string): Analysis of whether the company's location is suitable for the job.
    - `closest_profile_name` (string): Name of the team member whose profile is most relevant to this job description.
    - `tags` (array): An array of tags.

### job_listings.py

- `/` (GET): Lists all jobs.
  - Response:
    - An array of `JobSchema` objects.
- `/{job_id}` (GET): Gets a specific job by ID.
  - Path parameters:
    - `job_id` (string): The ID of the job.
  - Response:
    - A `JobSchema` object.
- `/details/{job_id}` (GET): Gets detailed job information by job ID.
  - Path parameters:
    - `job_id` (string): The ID of the job.
  - Response:
    - A `JobSchema` object.

### jobs.py

- `/fetch-and-save/` (POST): Fetches job posts from an RSS feed and saves them to the database.
  - Query parameters:
    - `page` (integer, optional): The page number to fetch. Defaults to 1.
    - `limit` (integer, optional): The number of results per page. Defaults to 100.
  - Response:
    - `message` (string): A message indicating the number of jobs processed, added, and skipped.
    - `url_used` (string): The URL used to fetch the RSS feed.

### webhook.py

- This file contains no active endpoints (code is commented out).

## Data Models

### Job

Represents a job posting.

- `job_id` (String): The ID of the job (primary key).
- `applying_location_restriction` (ARRAY(String)): An array of location restrictions for applying.
- `job_attachments` (ARRAY(String)): An array of job attachment URLs.
- `client_reviews` (String): Client reviews.
- `client_country` (String): The client's country.
- `client_total_spent` (String): The client's total spent.
- `client_avg_hourly_rate` (String): The client's average hourly rate.
- `from_hourly_range` (Numeric): The lower bound of the hourly rate range.
- `to_hourly_range` (Numeric): The upper bound of the hourly rate range.
- `has_questions` (Boolean): Indicates whether the job has questions.
- `amount` (Numeric): The job amount.
- `currency` (String): The job currency.
- `job_link` (String): The link to the job posting.
- `job_posted_on_date` (DateTime): The date the job was posted.
- `job_published_on_date` (DateTime): The date the job was published.
- `job_description` (Text): The job description.
- `job_title` (String): The job title.
- `job_country` (String): The job country.
- `status` (String): The job status (default: `not_applied`). Possible values: `not_applied`, `not_relevant`, `proposal_generated`, `bidding_done`.
- `notes` (Text): Notes about the job.
- `requires_github_repo` (Boolean): Indicates whether a GitHub repository is required.
- `requires_relevant_portfolio` (Boolean): Indicates whether a relevant portfolio is required.
- `job_skills` (relationship): A relationship to the `Skill` model through the `job_skills` association table.
- `job_category` (relationship): A relationship to the `Category` model through the `job_category` association table.
- `job_subcategory` (relationship): A relationship to the `SubCategory` model through the `job_subcategory` association table.
- `job_type` (relationship): A relationship to the `JobType` model through the `job_type` association table.
- `experience_level` (relationship): A relationship to the `ExperienceLevel` model through the `experience_level` association table.
- `client_info` (relationship): A relationship to the `ClientInfo` model through the `client_info` association table.
- `client_location` (relationship): A relationship to the `Location` model through the `client_location` association table.
- `client_timezone` (relationship): A relationship to the `Timezone` model through the `client_timezone` association table.
- `project_length` (relationship): A relationship to the `ProjectLength` model through the `project_length` association table.
- `hours_per_week` (relationship): A relationship to the `HoursPerWeek` model through the `hours_per_week` association table.
- `payment_status` (relationship): A relationship to the `PaymentStatus` model through the `payment_status` association table.
- `job_search_query` (String): The job search query.
- `scraping_job` (relationship): A relationship to the `ScrapingJob` model through the `scraping_jobs` association table.
- `questions` (relationship): A relationship to the `Question` model.
- `proposals` (relationship): A relationship to the `JobProposal` model.
- `relevance` (relationship): A relationship to the `JobRelevance` model.
- `team_name` (String): The name of the team.
- `team_id` (String): The ID of the team.
- `team_rid` (String): The RID of the team.
- `category_id` (String): The ID of the category.
- `category_label` (String): The label of the category.
- `subcategory_id` (String): The ID of the subcategory.
- `subcategory_label` (String): The label of the subcategory.

### JobRelevance

Represents the relevance analysis results for a job.

- `job_id` (String): The ID of the job (primary key, foreign key to `jobs.job_id`).
- `score` (Float): The relevance score.
- `category` (String): The relevance category.
- `reasoning` (Text): The reasoning behind the relevance score.
- `technology_match` (Text): Analysis of how the job's technology requirements match the company's skills.
- `portfolio_match` (Text): Analysis of which portfolio items demonstrate relevant experience.
- `project_match` (Text): Analysis of which past projects are most relevant to this job.
- `location_match` (Text): Analysis of whether the company's location is suitable for the job.
- `closest_profile_name` (String): Name of the team member whose profile is most relevant to this job description.
- `tags` (ARRAY(String)): An array of tags.
- `job` (relationship): A relationship to the `Job` model.

### Skill

Represents a skill.

- `id` (Integer): The ID of the skill (primary key).
- `name` (String): The name of the skill.
- `description` (Text): The description of the skill.

### Question

Represents a question.

- `id` (Integer): The ID of the question (primary key).
- `question` (String): The question text.
- `answer` (String): The answer to the question.
- `description` (Text): The description of the question.
- `is_manually_added` (Boolean): Indicates whether the question was manually added.
- `job_id` (String): The ID of the job (foreign key to `jobs.job_id`).
- `job` (relationship): A relationship to the `Job` model.

### RSSJobCategory

Represents an RSS job category.

- `id` (Integer): The ID of the category (primary key).
- `name` (String): The name of the category.
- `description` (Text): The description of the category.

### JobProposal

Represents a job proposal.

- `id` (Integer): The ID of the proposal (primary key).
- `proposal` (Text): The proposal text.
- `notes` (Text): Notes about the proposal.
- `job_id` (String): The ID of the job (foreign key to `jobs.job_id`).
- `job` (relationship): A relationship to the `Job` model.
- `upwork_profile_id` (Integer): The ID of the Upwork profile (foreign key to `upwork_profiles.id`).
- `upwork_profile` (relationship): A relationship to the `UpworkProfile` model.

### UpworkProfile

Represents an Upwork profile.

- `id` (Integer): The ID of the profile (primary key).
- `name` (String): The name of the profile.
- `description` (Text): The description of the profile.
- `notes` (Text): Notes about the profile.
- `proposals` (relationship): A relationship to the `JobProposal` model.

### Category

Represents a category.

- `id` (Integer): The ID of the category (primary key).
- `name` (String): The name of the category.
- `description` (Text): The description of the category.

### SubCategory

Represents a subcategory.

- `id` (Integer): The ID of the subcategory (primary key).
- `name` (String): The name of the subcategory.
- `description` (Text): The description of the subcategory.

### JobType

Represents a job type.

- `id` (Integer): The ID of the job type (primary key).
- `name` (String): The name of the job type.
- `description` (Text): The description of the job type.

### ExperienceLevel

Represents an experience level.

- `id` (Integer): The ID of the experience level (primary key).
- `name` (String): The name of the experience level.
- `description` (Text): The description of the experience level.

### ClientInfo

Represents client information.

- `id` (Integer): The ID of the client info (primary key).
- `name` (String): The name of the client.
- `description` (String): The description of the client.
- `total_hires` (Integer): The total number of hires.
- `total_posted_jobs` (Integer): The total number of posted jobs.
- `verification_status` (String): The verification status.
- `location_city` (String): The location city.
- `total_reviews` (Float): The total number of reviews.
- `total_feedback` (Float): The total feedback.

### Location

Represents a location.

- `id` (Integer): The ID of the location (primary key).
- `name` (String): The name of the location.
- `description` (Text): The description of the location.

### Timezone

Represents a timezone.

- `id` (Integer): The ID of the timezone (primary key).
- `name` (String): The name of the timezone.
- `description` (Text): The description of the timezone.

### ProjectLength

Represents a project length.

- `id` (Integer): The ID of the project length (primary key).
- `name` (String): The name of the project length.
- `description` (Text): The description of the project length.

### HoursPerWeek

Represents hours per week.

- `id` (Integer): The ID of the hours per week (primary key).
- `name` (String): The name of the hours per week.
- `description` (Text): The description of the hours per week.

### PaymentStatus

Represents a payment status.

- `id` (Integer): The ID of the payment status (primary key).
- `name` (String): The name of the payment status.
- `description` (Text): The description of the payment status.

### ScrapingJob

Represents a scraping job.

- `id` (Integer): The ID of the scraping job (primary key).
- `name` (String): The name of the scraping job.
- `description` (Text): The description of the scraping job.

## Schemas

### ClientInfoBase

Base schema for client information.

- `name` (Optional[str]): The name of the client.
- `description` (Optional[str]): A description of the client.
- `total_hires` (Optional[int]): The total number of hires.
- `total_posted_jobs` (Optional[int]): The total number of posted jobs.
- `verification_status` (Optional[str]): The verification status.
- `location_city` (Optional[str]): The location city.
- `total_reviews` (Optional[float]): The total number of reviews.
- `total_feedback` (Optional[float]): The total feedback.

### ClientInfo

Schema for client information with ID.

- `id` (int): The ID of the client info.

### JobBase

Base schema for job postings.

- `applying_location_restriction` (Optional[List[str]]): An array of location restrictions for applying.
- `job_attachments` (Optional[List[str]]): An array of job attachment URLs.
- `client_reviews` (Optional[str]): Client reviews.
- `client_country` (Optional[str]): The client's country.
- `client_total_spent` (Optional[str]): The client's total spent.
- `client_avg_hourly_rate` (Optional[str]): The client's average hourly rate.
- `from_hourly_range` (Optional[float]): The lower bound of the hourly rate range.
- `to_hourly_range` (Optional[float]): The upper bound of the hourly rate range.
- `has_questions` (bool): Indicates whether the job has questions.
- `amount` (Optional[float]): The job amount (aliased as `job_budget`).
- `currency` (Optional[str]): The job currency.
- `job_link` (Optional[str]): The link to the job posting.
- `job_description` (Optional[str]): The job description.
- `job_title` (Optional[str]): The job title.
- `job_country` (Optional[str]): The job country.
- `status` (str): The job status (default: `not_applied`).
- `notes` (Optional[str]): Notes about the job.
- `requires_github_repo` (bool): Indicates whether a GitHub repository is required.
- `requires_relevant_portfolio` (bool): Indicates whether a relevant portfolio is required.
- `job_search_query` (Optional[str]): The job search query.
- `team_name` (Optional[str]): The name of the team.
- `team_id` (Optional[str]): The ID of the team.
- `team_rid` (Optional[str]): The RID of the team.
- `category_id` (Optional[str]): The ID of the category.
- `category_label` (Optional[str]): The label of the category.
- `subcategory_id` (Optional[str]): The ID of the subcategory.
- `subcategory_label` (Optional[str]): The label of the subcategory.
- `skills` (Optional[List[str]]): A list of skills.
- `client_info` (Optional[ClientInfoBase]): Client information.

### JobCreate

Schema for creating job postings. Inherits from `JobBase`.

### QuestionBase

Base schema for questions.

- `question` (Optional[str]): The question text.
- `answer` (Optional[str]): The answer to the question.
- `description` (Optional[str]): The description of the question.
- `is_manually_added` (bool): Indicates whether the question was manually added.

### Question

Schema for questions with ID and job ID.

- `id` (int): The ID of the question.
- `job_id` (str): The ID of the job.

### JobRelevanceSchema

Schema for job relevance analysis results.

- `score` (Optional[float]): The relevance score.
- `category` (Optional[str]): The relevance category.
- `reasoning` (Optional[str]): The reasoning behind the relevance score.
- `technology_match` (Optional[str]): Analysis of how the job's technology requirements match the company's skills.
- `portfolio_match` (Optional[str]): Analysis of which portfolio items demonstrate relevant experience.
- `project_match` (Optional[str]): Analysis of which past projects are most relevant to this job.
- `location_match` (Optional[str]): Analysis of whether the company's location is suitable for the job.
- `closest_profile_name` (Optional[str]): Name of the team member whose profile is most relevant to this job description.
- `tags` (Optional[List[str]]): An array of tags.

### Job

Schema for job postings with ID, dates, questions, relevance, and client info.

- `job_id` (str): The ID of the job.
- `job_posted_on_date` (Optional[datetime]): The date the job was posted.
- `job_published_on_date` (Optional[datetime]): The date the job was published.
- `questions` (Optional[List['Question']]): A list of questions.
- `relevance` (Optional[JobRelevanceSchema]): Job relevance analysis results.
- `client_info` (Optional[ClientInfo]): Client information.

### SkillBase

Base schema for skills.

- `name` (str): The name of the skill.
- `description` (Optional[str]): The description of the skill.

### Skill

Schema for skills with ID.

- `id` (int): The ID of the skill.

### JobProposalBase

Base schema for job proposals.

- `proposal` (Optional[str]): The proposal text.
- `notes` (Optional[str]): Notes about the proposal.

### JobProposal

Schema for job proposals with ID, job ID, and Upwork profile ID.

- `id` (int): The ID of the proposal.
- `job_id` (str): The ID of the job.
- `upwork_profile_id` (Optional[int]): The ID of the Upwork profile.

### UpworkProfileBase

Base schema for Upwork profiles.

- `name` (str): The name of the profile.
- `description` (str): The description of the profile.
- `notes` (Optional[str]): Notes about the profile.

### UpworkProfile

Schema for Upwork profiles with ID and proposals.

- `id` (int): The ID of the profile.
- `proposals` (List[JobProposal]): A list of job proposals.

## Utility Functions

### process_and_save_jobs

Processes and saves jobs to the database.

- **Parameters:**
  - `db` (Session): The database session.
  - `jobs_data` (list): A list of job data dictionaries.
- **Returns:**
  - `tuple`: A tuple containing the number of jobs added and skipped.

This function iterates through a list of job data dictionaries, checks if each job already exists in the database, and if not, creates a new `Job` object and saves it to the database. It also handles the creation of related `Skill` and `Question` objects. After adding the job, it initiates relevance analysis using `run_job_matching_agent`.
