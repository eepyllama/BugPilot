/**
 * Example bugs for the "Try an Example" section.
 * Each example populates the input form so recruiters and visitors
 * can immediately understand BugPilot without inventing their own errors.
 */

export const EXAMPLE_BUGS = [
  {
    id: 'python-indexerror',
    title: 'Python IndexError',
    language: 'Python',
    icon: '🐍',
    error: `Traceback (most recent call last):
  File "app/data_processor.py", line 47, in process_batch
    result = items[batch_size]
IndexError: list index out of range`,
    code: `def process_batch(items, batch_size=10):
    """Process items in batches."""
    results = []
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        # Process each item in the batch
        for j in range(batch_size):
            result = items[batch_size]  # Line 47
            results.append(transform(result))
    return results

def transform(item):
    return {"id": item["id"], "value": item["value"] * 2}`,
    logs: `[2024-03-15 14:23:01] INFO: Starting batch processing
[2024-03-15 14:23:01] INFO: Total items: 23
[2024-03-15 14:23:01] INFO: Batch size: 10
[2024-03-15 14:23:01] ERROR: process_batch failed
[2024-03-15 14:23:01] ERROR: IndexError: list index out of range`,
    context: 'Processing a dataset of 23 user records in batches of 10. Crashes on the first batch.',
  },
  {
    id: 'java-npe',
    title: 'Java NullPointerException',
    language: 'Java',
    icon: '☕',
    error: `java.lang.NullPointerException: Cannot invoke "com.app.model.User.getName()" because "user" is null
	at com.app.service.UserService.getProfile(UserService.java:42)
	at com.app.controller.UserController.profile(UserController.java:28)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:897)`,
    code: `package com.app.service;

import com.app.model.User;
import com.app.repository.UserRepository;

public class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public UserProfile getProfile(Long userId) {
        User user = repository.findById(userId);  // Line 42: can return null
        return new UserProfile(
            user.getName(),     // NPE here if user is null
            user.getEmail(),
            user.getRole()
        );
    }
}`,
    logs: `2024-03-15 10:15:22 [http-nio-8080-exec-3] ERROR - Unhandled exception in request GET /api/users/999/profile
2024-03-15 10:15:22 [http-nio-8080-exec-3] DEBUG - UserRepository.findById(999) returned null
2024-03-15 10:15:22 [http-nio-8080-exec-3] ERROR - 500 Internal Server Error`,
    context: 'User profile page crashes when accessing a user ID that does not exist in the database.',
  },
  {
    id: 'js-typeerror',
    title: 'JavaScript TypeError',
    language: 'JavaScript',
    icon: '🟨',
    error: `TypeError: Cannot read properties of undefined (reading 'map')
    at Dashboard.render (Dashboard.jsx:34)
    at finishClassComponent (react-dom.development.js:17485)
    at updateClassComponent (react-dom.development.js:17435)
    at beginWork (react-dom.development.js:19073)`,
    code: `import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="metrics">
        {data.metrics.map(metric => (    // Line 34: data might be null
          <MetricCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;`,
    logs: '',
    context: 'The dashboard component crashes on initial load. It works fine after a page refresh sometimes.',
  },
  {
    id: 'sql-error',
    title: 'SQL / Database Error',
    language: 'Python',
    icon: '🗄️',
    error: `sqlalchemy.exc.IntegrityError: (psycopg2.errors.UniqueViolation) duplicate key value violates unique constraint "users_email_key"
DETAIL: Key (email)=(john@example.com) already exists.
[SQL: INSERT INTO users (name, email, created_at) VALUES (%(name)s, %(email)s, %(created_at)s)]
[parameters: {'name': 'John Doe', 'email': 'john@example.com', 'created_at': datetime.datetime(2024, 3, 15, 14, 30)}]`,
    code: `from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_data: UserCreate) -> User:
        new_user = User(
            name=user_data.name,
            email=user_data.email,
        )
        self.db.add(new_user)
        self.db.commit()      # Crashes here — no duplicate check
        self.db.refresh(new_user)
        return new_user

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()`,
    logs: `[2024-03-15 14:30:00] INFO: POST /api/users - Creating user john@example.com
[2024-03-15 14:30:00] ERROR: IntegrityError - duplicate key value violates unique constraint
[2024-03-15 14:30:00] ERROR: Rolling back transaction`,
    context: 'User registration endpoint fails when a user tries to sign up with an email that already exists. No validation is performed before the insert.',
  },
];

/**
 * Fallback/demo analysis response used when the backend is unavailable.
 * Clearly labeled as a demo.
 */
export const DEMO_ANALYSIS = {
  title: 'Demo Analysis — NullPointerException in UserService',
  severity: 'high',
  error_type: 'NullPointerException',
  root_cause:
    'This is a DEMO response. In production with a configured API key, BugPilot would analyze your specific error using AI. The likely root cause pattern: an unchecked nullable return value is dereferenced without null validation.',
  confidence: 0,
  confidence_reasoning:
    'This is a demo response — confidence is 0 because no actual AI analysis was performed. Configure a GROQ_API_KEY to get real analysis.',
  explanation:
    'This is a demonstration of BugPilot\'s structured debugging output. When a real API key is configured, BugPilot sends your error, code, and logs to an LLM that follows a structured debugging pipeline.',
  error_chain: [
    { step: 'API Request', detail: 'Incoming HTTP request triggers the flow', is_root_cause: false },
    { step: 'Controller', detail: 'Routes request to service layer', is_root_cause: false },
    { step: 'Service Layer', detail: 'Calls repository and accesses return value', is_root_cause: true },
    { step: 'Repository', detail: 'Returns null (entity not found)', is_root_cause: false },
    { step: 'Exception', detail: 'NullPointerException thrown', is_root_cause: false },
  ],
  error_chain_is_inferred: true,
  problematic_code:
    'User user = repository.findById(id);\nreturn user.getName();  // ← potential null dereference',
  problematic_line_explanation:
    'The return value from findById() may be null, but getName() is called without checking.',
  suggested_fix:
    'User user = repository.findById(id);\n\nif (user == null) {\n    throw new UserNotFoundException("User not found: " + id);\n}\n\nreturn user.getName();',
  fix_explanation:
    'Adding a null check before accessing the object prevents the NullPointerException and provides a meaningful error message.',
  alternative_fix:
    'return Optional.ofNullable(repository.findById(id))\n    .map(User::getName)\n    .orElseThrow(() -> new UserNotFoundException("User not found: " + id));',
  alternative_fix_explanation:
    'Using Optional provides a more functional approach that makes the nullable nature explicit.',
  prevention: [
    'Add null validation before accessing objects from database queries.',
    'Use Optional<T> return types for repository methods.',
    'Write unit tests covering the case where the entity is not found.',
    'Add a custom exception for missing entities.',
    'Consider using @NonNull annotations.',
  ],
  additional_checks: [
    'Check if other findById() calls have the same issue.',
    'Verify the database contains the expected records.',
  ],
  is_demo: true,
  insufficient_info: false,
  insufficient_info_details: null,
};
