CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20),
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE career_paths (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty_level VARCHAR(50),
    estimated_duration_months INT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE skill_courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    description TEXT,
    level VARCHAR(50),
    duration_hours INT,
    url VARCHAR(255),
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE career_path_skills (
    id SERIAL PRIMARY KEY,
    career_path_id INT REFERENCES career_paths(id) ON DELETE CASCADE,
    skill_course_id INT REFERENCES skill_courses(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT false
);

CREATE TABLE assessment_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50),
    category VARCHAR(100),
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE assessment_options (
    id SERIAL PRIMARY KEY,
    question_id INT REFERENCES assessment_questions(id) ON DELETE CASCADE,
    option_text VARCHAR(255),
    score INT,
    career_path_id INT REFERENCES career_paths(id)
);

CREATE TABLE user_assessment_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    recommended_career_path_id INT REFERENCES career_paths(id),
    total_score INT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE user_assessment_answers (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES user_assessment_sessions(id) ON DELETE CASCADE,
    question_id INT REFERENCES assessment_questions(id),
    option_id INT REFERENCES assessment_options(id),
    answer_score INT
);

CREATE TABLE roadmaps (
    id SERIAL PRIMARY KEY,
    career_path_id INT REFERENCES career_paths(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE roadmap_contents (
    id SERIAL PRIMARY KEY,
    roadmap_id INT REFERENCES roadmaps(id) ON DELETE CASCADE,
    title VARCHAR(100),
    description TEXT,
    step_order INT,
    skill_course_id INT REFERENCES skill_courses(id),
    estimated_days INT
);

CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    roadmap_content_id INT REFERENCES roadmap_contents(id),
    skill_course_id INT REFERENCES skill_courses(id),
    status VARCHAR(50),
    progress_percent DECIMAL(5,2),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    career_path_id INT REFERENCES career_paths(id),
    roadmap_id INT REFERENCES roadmaps(id),
    skill_course_id INT REFERENCES skill_courses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


insert into users (full_name, email, password_hash, role)
values
('admin growpath', 'admin@growpath.com', 'hashedpassword', 'admin'),
('reza fahresi', 'reza@gmail.com', 'hashedpassword', 'user');

insert into career_paths (title, description, category, difficulty_level, estimated_duration_months, created_by)
values
('backend developer', 'fokus pada server-side development', 'programming', 'intermediate', 6, 1),
('frontend developer', 'fokus pada ui/ux web', 'programming', 'beginner', 5, 1);

insert into skill_courses (title, type, description, level, duration_hours, url, created_by)
values
('node.js basic', 'video', 'belajar dasar node.js', 'beginner', 10, 'https://example.com/node', 1),
('express.js api', 'video', 'membuat rest api', 'intermediate', 12, 'https://example.com/express', 1),
('react.js basic', 'video', 'belajar react dasar', 'beginner', 15, 'https://example.com/react', 1);

insert into career_path_skills (career_path_id, skill_course_id, is_mandatory)
values
(1, 1, true),
(1, 2, true),
(2, 3, true);

insert into assessment_questions (question_text, question_type, category, created_by)
values
('kamu lebih suka bekerja di bagian mana?', 'multiple_choice', 'interest', 1),
('seberapa nyaman kamu dengan coding?', 'multiple_choice', 'skill', 1);

insert into assessment_options (question_id, option_text, score, career_path_id)
values
(1, 'backend (server, database)', 10, 1),
(1, 'frontend (ui, tampilan)', 10, 2),
(2, 'sangat nyaman', 10, 1),
(2, 'masih belajar', 5, 2);

insert into user_assessment_sessions (user_id, recommended_career_path_id, total_score, started_at, completed_at)
values
(2, 1, 20, now(), now());

insert into user_assessment_answers (session_id, question_id, option_id, answer_score)
values
(1, 1, 1, 10),
(1, 2, 3, 10);

insert into roadmaps (career_path_id, title, description, created_by)
values
(1, 'backend roadmap', 'roadmap untuk backend developer', 1),
(2, 'frontend roadmap', 'roadmap untuk frontend developer', 1);

insert into roadmap_contents (roadmap_id, title, description, step_order, skill_course_id, estimated_days)
values
(1, 'belajar node.js', 'dasar node.js', 1, 1, 7),
(1, 'belajar express', 'membuat api', 2, 2, 10),
(2, 'belajar react', 'dasar react', 1, 3, 10);

insert into user_progress (user_id, roadmap_content_id, skill_course_id, status, progress_percent, started_at)
values
(2, 1, 1, 'in_progress', 50, now()),
(2, 2, 2, 'not_started', 0, null);

insert into bookmarks (user_id, career_path_id, roadmap_id, skill_course_id)
values
(2, 1, 1, 1),
(2, 2, 2, 3);