import axios from "axios";


// Seed some initial dummy data so the app has stuff to display right away
const initDb = () => {
  if (!localStorage.getItem("db_initialized")) {
    const subjects = [
      { id: "math", name: "Mathematics" },
      { id: "sci", name: "Science" },
      { id: "eng", name: "English" },
      { id: "his", name: "History" }
    ];

    const topics = [
      // Math syllabus
      { id: "math-algebra", name: "Algebra", subject_id: "math" },
      { id: "math-calculus", name: "Calculus", subject_id: "math" },
      { id: "math-geometry", name: "Geometry", subject_id: "math" },

      // Science syllabus
      { id: "sci-physics", name: "Physics", subject_id: "sci" },
      { id: "sci-chemistry", name: "Chemistry", subject_id: "sci" },
      { id: "sci-biology", name: "Biology", subject_id: "sci" },

      // Languages
      { id: "eng-grammar", name: "Grammar", subject_id: "eng" },
      { id: "eng-literature", name: "Literature", subject_id: "eng" },

      // Humanities
      { id: "his-world", name: "World History", subject_id: "his" },
      { id: "his-ancient", name: "Ancient Civilizations", subject_id: "his" }
    ];

    const subTopics = [
      // Algebra sub-sections
      { id: "sub-linear", name: "Linear Equations", topic_id: "math-algebra" },
      { id: "sub-quadratic", name: "Quadratic Equations", topic_id: "math-algebra" },

      // Calculus sub-sections
      { id: "sub-limits", name: "Limits & Continuity", topic_id: "math-calculus" },
      { id: "sub-derivatives", name: "Derivatives", topic_id: "math-calculus" },

      // Geometry details
      { id: "sub-triangles", name: "Triangles & Trigonometry", topic_id: "math-geometry" },
      { id: "sub-circles", name: "Circles & Polygons", topic_id: "math-geometry" },

      // Physics branches
      { id: "sub-mechanics", name: "Classical Mechanics", topic_id: "sci-physics" },
      { id: "sub-thermo", name: "Thermodynamics", topic_id: "sci-physics" },

      // Chemistry branches
      { id: "sub-organic", name: "Organic Chemistry", topic_id: "sci-chemistry" },
      { id: "sub-inorganic", name: "Inorganic Chemistry", topic_id: "sci-chemistry" },

      // Biology branches
      { id: "sub-genetics", name: "Genetics", topic_id: "sci-biology" },
      { id: "sub-ecology", name: "Ecology", topic_id: "sci-biology" },

      // English rules
      { id: "sub-tenses", name: "Verb Tenses", topic_id: "eng-grammar" },
      { id: "sub-punctuation", name: "Punctuation", topic_id: "eng-grammar" },

      // English reading
      { id: "sub-shakespeare", name: "Shakespearean Drama", topic_id: "eng-literature" },
      { id: "sub-modern", name: "Modern Prose", topic_id: "eng-literature" },

      // History periods
      { id: "sub-ww2", name: "World War II", topic_id: "his-world" },
      { id: "sub-coldwar", name: "Cold War Era", topic_id: "his-world" },

      // Ancient periods
      { id: "sub-egypt", name: "Ancient Egypt", topic_id: "his-ancient" },
      { id: "sub-rome", name: "Roman Empire", topic_id: "his-ancient" }
    ];

    const initialTests = [
      {
        id: "t-1",
        name: "Algebra Core Competency",
        type: "practice",
        subject_id: "math",
        topic_ids: ["math-algebra"],
        sub_topic_ids: ["sub-linear", "sub-quadratic"],
        correct_marks: 4,
        wrong_marks: -1,
        unattempt_marks: 0,
        difficulty: "medium",
        total_time: 45,
        total_marks: 100,
        total_questions: 2,
        status: "live",
        created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "t-2",
        name: "Introductory Mechanics",
        type: "mock",
        subject_id: "sci",
        topic_ids: ["sci-physics"],
        sub_topic_ids: ["sub-mechanics"],
        correct_marks: 4,
        wrong_marks: -1,
        unattempt_marks: 0,
        difficulty: "easy",
        total_time: 60,
        total_marks: 200,
        total_questions: 1,
        status: "live",
        created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "t-3",
        name: "Ancient Civilizations Draft",
        type: "live",
        subject_id: "his",
        topic_ids: ["his-ancient"],
        sub_topic_ids: ["sub-egypt"],
        correct_marks: 3,
        wrong_marks: 0,
        unattempt_marks: 0,
        difficulty: "hard",
        total_time: 90,
        total_marks: 300,
        total_questions: 50,
        status: null,
        created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
      }
    ];

    const initialQuestions = [
      {
        id: "q-1",
        test_id: "t-1",
        question: "Solve for x: 3x + 7 = 22.",
        type: "single",
        options: ["x = 3", "x = 5", "x = 7", "x = 15"],
        correct_options: [1],
        explanation: "Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5."
      },
      {
        id: "q-2",
        test_id: "t-1",
        question: "What are the roots of the equation x^2 - 5x + 6 = 0?",
        type: "single",
        options: ["x = 1, 6", "x = 2, 3", "x = -2, -3", "x = -1, -6"],
        correct_options: [1],
        explanation: "Factoring the equation gives (x - 2)(x - 3) = 0, so the roots are x = 2 and x = 3."
      },
      {
        id: "q-3",
        test_id: "t-2",
        question: "Which of the following are vector quantities?",
        type: "multiple",
        options: ["Velocity", "Speed", "Force", "Mass"],
        correct_options: [0, 2],
        explanation: "Velocity and Force have both magnitude and direction, making them vector quantities."
      }
    ];

    localStorage.setItem("subjects", JSON.stringify(subjects));
    localStorage.setItem("topics", JSON.stringify(topics));
    localStorage.setItem("subTopics", JSON.stringify(subTopics));
    localStorage.setItem("tests", JSON.stringify(initialTests));
    localStorage.setItem("questions", JSON.stringify(initialQuestions));
    localStorage.setItem("db_initialized", "true");
  }
};

initDb();

// Quick database helpers so we don't have to write JSON.parse all over the place
const db = {
  getSubjects: () => JSON.parse(localStorage.getItem("subjects") || "[]"),
  getTopics: () => JSON.parse(localStorage.getItem("topics") || "[]"),
  getSubTopics: () => JSON.parse(localStorage.getItem("subTopics") || "[]"),
  getTests: () => JSON.parse(localStorage.getItem("tests") || "[]"),
  getQuestions: () => JSON.parse(localStorage.getItem("questions") || "[]"),

  saveTests: (tests) => localStorage.setItem("tests", JSON.stringify(tests)),
  saveQuestions: (questions) => localStorage.setItem("questions", JSON.stringify(questions)),
};

// Axios configuration - pointing to a dummy base URL since we intercept it anyway
const api = axios.create({
  baseURL: "https://api.apex-test-portal.local/v1",
});

// Intercept outgoing HTTP calls and mock server responses locally
api.defaults.adapter = function (config) {
  return new Promise((resolve, reject) => {
    const method = config.method.toUpperCase();
    const url = config.url.replace(config.baseURL, "").split("?")[0];
    const data = config.data ? JSON.parse(config.data) : null;

    // Add artificial delay (300ms) to simulate server responsiveness and show loaders
    setTimeout(() => {

      // POST /auth/login -> Sign in verification
      if (url === "/auth/login" && method === "POST") {
        const { userId, password } = data || {};

        // Each user gets their own profile — just look them up by userId
        const userProfiles = {
          vaibhav: {
            id: "vaibhav",
            name: "Vaibhav Bhosle",
            email: "vaibhav@apexportal.com",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
          },
          ajinkya: {
            id: "ajinkya",
            name: "Ajinkya",
            email: "ajinkya@apexportal.com",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
          }
        };

        // Both users share the same password for now — check if the userId exists and password matches
        const isValidUser = (userId === "vaibhav" || userId === "ajinkya") && password === "123456789";
        const matchedUser = userProfiles[userId];

        if (isValidUser && matchedUser) {
          resolve({
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            data: {
              data: {
                token: "mock-jwt-auth-token-123456789",
                user: matchedUser
              }
            }
          });
        } else {
          reject({
            response: {
              status: 401,
              data: { message: "Invalid User ID or Password. Please try again." }
            }
          });
        }
        return;
      }

      // GET /subjects -> Fetch all course categories
      if (url === "/subjects" && method === "GET") {
        resolve({
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          data: { data: db.getSubjects() }
        });
        return;
      }

      // GET /topics/subject/:subjectId -> Filter topics by subject
      const topicsMatch = url.match(/^\/topics\/subject\/([^/]+)$/);
      if (topicsMatch && method === "GET") {
        const subjectId = topicsMatch[1];
        const filteredTopics = db.getTopics().filter(t => t.subject_id === subjectId);
        resolve({
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          data: { data: filteredTopics }
        });
        return;
      }

      // POST /sub-topics/multi-topics -> Fetch sub-topics for multiple selected topics
      if (url === "/sub-topics/multi-topics" && method === "POST") {
        const { topicIds } = data || {};
        const filteredSubs = db.getSubTopics().filter(s => topicIds?.includes(s.topic_id));
        resolve({
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          data: { data: filteredSubs }
        });
        return;
      }

      // GET /tests -> Get all test templates
      if (url === "/tests" && method === "GET") {
        const tests = db.getTests().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        resolve({
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          data: { data: tests }
        });
        return;
      }

      // POST /tests -> Create a new test draft
      if (url === "/tests" && method === "POST") {
        const tests = db.getTests();
        const newTest = {
          ...data,
          id: `t-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        tests.push(newTest);
        db.saveTests(tests);
        resolve({
          status: 201,
          statusText: "Created",
          headers: {},
          config,
          data: { data: newTest }
        });
        return;
      }

      // GET, PUT, or DELETE for a specific test ID
      const testMatch = url.match(/^\/tests\/([^/]+)$/);
      if (testMatch) {
        const testId = testMatch[1];
        const tests = db.getTests();
        const testIndex = tests.findIndex(t => t.id === testId);

        if (testIndex === -1) {
          reject({
            response: {
              status: 404,
              data: { message: "Test not found." }
            }
          });
          return;
        }

        // Get single test detail and embed its questions
        if (method === "GET") {
          const test = tests[testIndex];
          const questions = db.getQuestions().filter(q => q.test_id === testId);
          resolve({
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            data: {
              data: {
                ...test,
                questions
              }
            }
          });
        }
        // Update test parameters
        else if (method === "PUT") {
          const updatedTest = {
            ...tests[testIndex],
            ...data
          };
          tests[testIndex] = updatedTest;
          db.saveTests(tests);
          resolve({
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            data: { data: updatedTest }
          });
        }
        // Delete test and clean up its questions too
        else if (method === "DELETE") {
          const updatedTests = tests.filter(t => t.id !== testId);
          db.saveTests(updatedTests);

          const remainingQuestions = db.getQuestions().filter(q => q.test_id !== testId);
          db.saveQuestions(remainingQuestions);

          resolve({
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            data: { success: true }
          });
        }
        return;
      }

      // POST /questions/bulk -> Save bulk question records
      if (url === "/questions/bulk" && method === "POST") {
        const { questions } = data || {};
        const savedQuestions = db.getQuestions();

        // Generate unique IDs for incoming questions
        const formattedQuestions = questions.map((q, idx) => ({
          ...q,
          id: `q-${Date.now()}-${idx}`
        }));

        savedQuestions.push(...formattedQuestions);
        db.saveQuestions(savedQuestions);

        resolve({
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          data: {
            success: true,
            data: formattedQuestions
          }
        });
        return;
      }

      // 404 handler for unmatched paths
      reject({
        response: {
          status: 404,
          data: { message: `Simulated path ${url} (${method}) not found.` }
        }
      });
    }, 300);
  });
};

// Request interceptor: Inject the Saved Token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor: Kick unauthorized requests back to login screen
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");

      // Only trigger reload if the user isn't already on the login page
      if (!window.location.pathname.endsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
