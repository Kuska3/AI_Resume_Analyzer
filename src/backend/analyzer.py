import re
import io
import math
from collections import Counter
from pypdf import PdfReader

# Standard English stopwords to filter out for TF-IDF calculations
STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent", "as", "at",
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cant", "cannot", "could",
    "couldnt", "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during", "each", "few", "for",
    "from", "further", "had", "hadnt", "has", "hasnt", "have", "havent", "having", "he", "hed", "hell", "hes",
    "her", "here", "heres", "hers", "herself", "him", "himself", "his", "how", "hows", "i", "id", "ill", "im",
    "ive", "if", "in", "into", "is", "isnt", "it", "its", "itself", "lets", "me", "more", "most", "mustnt", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
    "ourselves", "out", "over", "own", "same", "shant", "she", "shed", "shell", "shes", "should", "shouldnt",
    "so", "some", "such", "than", "that", "thats", "the", "their", "theirs", "them", "themselves", "then",
    "there", "theres", "these", "they", "theyd", "theyll", "theyre", "theyve", "this", "those", "through",
    "to", "too", "under", "until", "up", "very", "was", "wasnt", "we", "wed", "well", "were", "weve", "werent",
    "what", "whats", "when", "whens", "where", "wheres", "which", "while", "who", "whos", "whom", "why", "whys",
    "with", "wont", "would", "wouldnt", "you", "youd", "youll", "youre", "youve", "your", "yours", "yourself",
    "yourselves", "the", "us", "our", "we", "will"
}

# Pre-defined comprehensive catalog of technical and soft skills to capture accurately.
# We map them to lowercase for matching, and keep their original casing for presentation.
SKILL_CATALOG = {
    # Programming Languages
    "python": "Python",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "java": "Java",
    "c++": "C++",
    "c#": "C#",
    "ruby": "Ruby",
    "go": "Go",
    "golang": "Go",
    "rust": "Rust",
    "php": "PHP",
    "html": "HTML",
    "css": "CSS",
    "sql": "SQL",
    "r": "R",
    "scala": "Scala",
    "kotlin": "Kotlin",
    "swift": "Swift",
    "dart": "Dart",
    "perl": "Perl",
    
    # Frameworks & Libraries
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "angular": "Angular",
    "vue": "Vue.js",
    "vue.js": "Vue.js",
    "vuejs": "Vue.js",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "express": "Express.js",
    "express.js": "Express.js",
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "node.js": "Node.js",
    "node": "Node.js",
    "nodejs": "Node.js",
    "asp.net": "ASP.NET",
    ".net": ".NET",
    "laravel": "Laravel",
    "jquery": "jQuery",
    "bootstrap": "Bootstrap",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "ruby on rails": "Ruby on Rails",
    "rails": "Ruby on Rails",
    "svelte": "Svelte",
    
    # Cloud & Infrastructure & DevOps
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "gcp": "Google Cloud",
    "google cloud": "Google Cloud",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "ci/cd": "CI/CD",
    "jenkins": "Jenkins",
    "github actions": "GitHub Actions",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "linux": "Linux",
    "nginx": "Nginx",
    "kubernetes": "Kubernetes",
    "prometheus": "Prometheus",
    "grafana": "Grafana",
    
    # Databases & Caching
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "sqlite": "SQLite",
    "redis": "Redis",
    "dynamodb": "DynamoDB",
    "oracle": "Oracle",
    "elasticsearch": "Elasticsearch",
    "cassandra": "Cassandra",
    "firebase": "Firebase",
    "mariadb": "MariaDB",
    
    # Data Science & AI & ML
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "scikit-learn": "Scikit-learn",
    "keras": "Keras",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "nlp": "NLP",
    "natural language processing": "NLP",
    "deep learning": "Deep Learning",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "opencv": "OpenCV",
    "llm": "LLM",
    "large language models": "LLM",
    "openai": "OpenAI",
    "prompt engineering": "Prompt Engineering",
    "data science": "Data Science",
    
    # Tools, Architectures, Methods
    "git": "Git",
    "github": "GitHub",
    "jira": "Jira",
    "rest api": "REST API",
    "restful": "REST API",
    "graphql": "GraphQL",
    "microservices": "Microservices",
    "system design": "System Design",
    "unit testing": "Unit Testing",
    "agile": "Agile",
    "scrum": "Scrum",
    "oop": "OOP",
    "mvc": "MVC",
    
    # Soft & Professional Skills
    "project management": "Project Management",
    "leadership": "Leadership",
    "team leadership": "Team Leadership",
    "problem solving": "Problem Solving",
    "communication": "Communication",
    "collaboration": "Collaboration",
    "critical thinking": "Critical Thinking",
    "agile methodology": "Agile Methodology",
    "scrum master": "Scrum Master",
}

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts plain text from a raw PDF file's bytes using pypdf.
    """
    text_content = []
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_content.append(page_text)
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""
    
    # Join pages and normalize whitespace
    full_text = "\n".join(text_content)
    # Remove excessive carriage returns and consolidate spacing
    full_text = re.sub(r'\s+', ' ', full_text).strip()
    return full_text

def tokenize_and_clean(text: str) -> list[str]:
    """
    Tokenizes text, keeping special technical notations intact (e.g. c++, c#, .net, ci/cd).
    Removes standard stopwords and punctuation that is not part of a programming syntax.
    """
    # Regex designed to capture letters/numbers and characters like +, #, ., / commonly in skill names.
    # We want to match: C++, C#, .NET, Vue.js, CI/CD, React.js
    tokens = re.findall(r'[a-zA-Z0-9+#\-\./]+', text.lower())
    
    # Filter tokens: remove pure punctuation-like residues and stopwords
    cleaned = []
    for token in tokens:
        # Strip trailing dots, dashes, or slashes that are not part of technical terms
        if token.endswith('.') and not token.endswith('.net') and not token.endswith('.js'):
            token = token.rstrip('.')
        if token.endswith('/') or token.endswith('-'):
            token = token.rstrip('/-')
        if token.startswith('/') or token.startswith('-'):
            token = token.lstrip('/-')
        
        # Eliminate empty tokens, very short numbers (unless relevant), and standard stopwords
        if token and token not in STOPWORDS and not re.match(r'^\d+$', token):
            cleaned.append(token)
            
    return cleaned

def calculate_cosine_similarity(text1: str, text2: str) -> float:
    """
    Calculates TF-IDF Cosine Similarity between two text inputs in pure Python.
    Optimized to be fully independent of scikit-learn for total execution stability,
    while utilizing exact standard equations.
    """
    tokens1 = tokenize_and_clean(text1)
    tokens2 = tokenize_and_clean(text2)
    
    if not tokens1 or not tokens2:
        return 0.0
        
    counts1 = Counter(tokens1)
    counts2 = Counter(tokens2)
    
    # Vocabulary (set of all unique terms)
    vocab = set(counts1.keys()).union(set(counts2.keys()))
    
    # Compute Term Frequency (TF) - log normalized TF
    def get_tf(counts):
        tf = {}
        for word, count in counts.items():
            tf[word] = 1 + math.log(count) if count > 0 else 0
        return tf
        
    tf1 = get_tf(counts1)
    tf2 = get_tf(counts2)
    
    # Compute Inverse Document Frequency (IDF)
    # We treat text1 (resume) and text2 (job description) as our corpus (N = 2)
    idf = {}
    for word in vocab:
        df = 0
        if word in counts1:
            df += 1
        if word in counts2:
            df += 1
        # Smooth IDF formulation
        idf[word] = math.log(1 + (2 / df))
        
    # Calculate TF-IDF vectors
    vec1 = {word: tf1.get(word, 0) * idf[word] for word in vocab}
    vec2 = {word: tf2.get(word, 0) * idf[word] for word in vocab}
    
    # Calculate Cosine Similarity
    dot_product = sum(vec1[word] * vec2[word] for word in vocab)
    mag1 = math.sqrt(sum(val ** 2 for val in vec1.values()))
    mag2 = math.sqrt(sum(val ** 2 for val in vec2.values()))
    
    if mag1 == 0 or mag2 == 0:
        return 0.0
        
    return dot_product / (mag1 * mag2)

def extract_skills_from_text(text: str) -> set[str]:
    """
    Matches the text against the comprehensive skill catalog to find all mentioned skills.
    Ensures safe word boundaries, accounting for special characters like ++ or # or .
    """
    # Pad text with leading/trailing spaces to simplify word boundary detection for special characters
    text_padded = " " + text.lower() + " "
    found_skills = set()
    
    for term, canonical_name in SKILL_CATALOG.items():
        # Escape special symbols for regex compilation
        escaped_term = re.escape(term)
        
        # Word boundary detection
        # If term begins or ends with + or #, normal \b word boundary fails. We use positive lookbehinds/lookaheads instead.
        pattern = r""
        if re.search(r'[^a-zA-Z0-9]', term[0]):
            pattern += r"(?<=[\s,.:;\(\)\[\]\{\}])"
        else:
            pattern += r"\b"
            
        pattern += escaped_term
        
        if re.search(r'[^a-zA-Z0-9]', term[-1]):
            pattern += r"(?=[\s,.:;\(\)\[\]\{\}])"
        else:
            pattern += r"\b"
            
        if re.search(pattern, text_padded):
            found_skills.add(canonical_name)
            
    return found_skills

def analyze_structure(text: str) -> float:
    """
    Evaluates the structure of a resume by detecting the presence of key sections.
    """
    text_lower = text.lower()
    
    sections = {
        "education": ["education", "academic", "degree", "university", "college"],
        "experience": ["experience", "employment", "work history", "professional history", "career"],
        "skills": ["skills", "technologies", "technical expertise", "proficiencies"],
        "projects": ["projects", "personal projects", "portfolio"],
        "contact": ["contact", "email", "phone", "linkedin", "address"]
    }
    
    found_count = 0
    for section_name, markers in sections.items():
        for marker in markers:
            # Match marker as full words / phrases
            if re.search(r'\b' + re.escape(marker) + r'\b', text_lower):
                found_count += 1
                break
                
    # Calculate score as a percentage (each of the 5 sections represents 20 points)
    return (found_count / 5.0) * 100.0

def analyze_resume(resume_text: str, job_description: str) -> dict:
    """
    Coordinates the resume scanning process.
    Computes TF-IDF similarity, maps matched/missing skills, scores structure,
    and returns a cohesive score report with actionable insights.
    """
    # 1. Text Similarity Score (out of 100)
    similarity_fraction = calculate_cosine_similarity(resume_text, job_description)
    text_similarity = round(similarity_fraction * 100.0, 1)
    
    # 2. Skill & Keyword Matching
    resume_skills = extract_skills_from_text(resume_text)
    job_skills = extract_skills_from_text(job_description)
    
    if not job_skills:
        # Fallback: if no predefined skills were found in JD, we extract nouns/keywords as fallback
        # In a typical case, JD will have at least a few skills. Let's provide a baseline
        matched_skills = []
        missing_skills = []
        keyword_score = 100.0
    else:
        matched_skills = sorted(list(resume_skills.intersection(job_skills)))
        missing_skills = sorted(list(job_skills.difference(resume_skills)))
        
        # Keyword Match Score
        keyword_fraction = len(matched_skills) / len(job_skills)
        keyword_score = round(keyword_fraction * 100.0, 1)
        
    # 3. Structure Analysis
    structure_score = round(analyze_structure(resume_text), 1)
    
    # 4. Aggregated ATS Score
    # 40% Text Similarity, 40% Keyword Score, 20% Structure Score
    ats_score = round(
        (0.4 * text_similarity) + 
        (0.4 * keyword_score) + 
        (0.2 * structure_score), 
        1
    )
    
    # Limit maximum score to 100
    ats_score = min(ats_score, 100.0)
    
    return {
        "ats_score": ats_score,
        "text_similarity": text_similarity,
        "keyword_score": keyword_score,
        "structure_score": structure_score,
        "skills_matched": matched_skills,
        "skills_missing": missing_skills
    }
