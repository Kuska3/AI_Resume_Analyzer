from analyzer import analyze_resume, calculate_cosine_similarity, tokenize_and_clean

def test_tokenization():
    text = "Experienced with C++, C#, .NET, Docker, React.js, and CI/CD."
    tokens = tokenize_and_clean(text)
    print("Tokens extracted:", tokens)
    assert "c++" in tokens
    assert "c#" in tokens
    assert ".net" in tokens
    assert "ci/cd" in tokens
    print("Tokenization test passed!")

def test_full_analysis():
    resume = """
    John Doe
    Email: john.doe@email.com | Phone: 555-0199
    
    Education:
    Bachelor of Science in Computer Science, State University, 2022
    
    Skills:
    Python, JavaScript, React, Docker, SQL, Git, Linux
    
    Experience:
    Software Engineer at TechCorp (2022 - Present)
    - Developed APIs in Python using Flask.
    - Built frontend layouts in React.
    - Managed Docker containers and SQL databases.
    """
    
    job_desc = """
    We are looking for a Senior Software Engineer.
    Requirements:
    - Strong programming skills in Python and JavaScript.
    - Deep understanding of React and front-end architectures.
    - Experience with Docker, Kubernetes, and CI/CD pipelines.
    - Solid SQL skills and experience with PostgreSQL.
    """
    
    results = analyze_resume(resume, job_desc)
    print("\n--- Mock Analysis Results ---")
    print(f"ATS Score: {results['ats_score']}%")
    print(f"Text Similarity: {results['text_similarity']}%")
    print(f"Keyword Score: {results['keyword_score']}%")
    print(f"Structure Score: {results['structure_score']}%")
    print("Skills Matched:", results['skills_matched'])
    print("Skills Missing:", results['skills_missing'])
    
    # Assertions
    assert 0 <= results['ats_score'] <= 100
    assert "Python" in results['skills_matched']
    assert "React" in results['skills_matched']
    assert "Kubernetes" in results['skills_missing']
    assert "CI/CD" in results['skills_missing']
    assert results['structure_score'] == 80.0
    print(f"Structure Score verified as: {results['structure_score']}%")
    print("Core analyzer test passed!")

if __name__ == "__main__":
    test_tokenization()
    test_full_analysis()
